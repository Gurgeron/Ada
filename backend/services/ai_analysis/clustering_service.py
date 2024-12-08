from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score
from scipy.cluster.hierarchy import linkage, fcluster
import openai
from openai import OpenAI
import os
from dotenv import load_dotenv
import re
import traceback
import umap
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class ClusteringService:
    """Service for clustering feature requests based on their embeddings using hierarchical clustering."""
    
    def __init__(self):
        """Initialize the clustering service."""
        # Initialize UMAP for dimensionality reduction
        self.reducer = umap.UMAP(
            n_components=2,
            random_state=42,
            min_dist=0.3,
            n_neighbors=30,
            metric='cosine'
        )
        try:
            self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            if not os.getenv('OPENAI_API_KEY'):
                logger.warning("OpenAI API key not found in environment variables")
                self.client = None
        except Exception as e:
            logger.warning(f"Could not initialize OpenAI client: {str(e)}")
            self.client = None

    def _find_optimal_distance_threshold(self, Z: np.ndarray, min_clusters: int = 3, max_clusters: int = 7) -> float:
        """Find optimal distance threshold using elbow method on the dendrogram."""
        try:
            last_merge_distances = Z[:, 2]
            acceleration = np.diff(np.diff(last_merge_distances))
            elbow_idx = np.argmax(acceleration) + 2
            
            # Make the threshold even more lenient for broader clusters
            threshold = Z[-(elbow_idx), 2] * 2.5  # Increased multiplier from 2.0 to 2.5
            
            # Use an even higher percentile for minimum threshold
            min_threshold = np.percentile(Z[:, 2], 85)  # Increased from 75th to 85th percentile
            
            # Add a maximum number of clusters constraint
            n_points = len(Z) + 1
            max_clusters_threshold = None
            
            # Ensure we don't exceed max_clusters
            for i in range(len(Z)):
                n_clusters = len(np.unique(fcluster(Z, Z[i, 2], criterion='distance')))
                if n_clusters <= max_clusters:
                    max_clusters_threshold = Z[i, 2]
                    break
            
            if max_clusters_threshold is not None:
                threshold = max(threshold, max_clusters_threshold)
            
            # Add a minimum cluster size constraint (at least 10% of total points)
            min_size_threshold = None
            min_cluster_size = max(3, n_points // 10)  # At least 10% of points per cluster
            
            for i in range(len(Z)):
                clusters = fcluster(Z, Z[i, 2], criterion='distance')
                sizes = np.bincount(clusters)
                if np.all(sizes >= min_cluster_size):
                    min_size_threshold = Z[i, 2]
                    break
            
            if min_size_threshold is not None:
                threshold = max(threshold, min_size_threshold)
            
            return max(threshold, min_threshold)
        except Exception as e:
            logger.error(f"Error finding optimal threshold: {str(e)}")
            # Use an even higher percentile for the fallback
            return np.percentile(Z[:, 2], 90)  # Increased from 80th to 90th percentile

    def _extract_cluster_theme(self, features: List[Dict[str, Any]], embeddings: List[List[float]]) -> str:
        """Extract a theme that represents all features in the cluster."""
        try:
            if not self.client or not features:
                return features[0].get('Feature Title', 'Unknown Theme')

            # Prepare a summary of all features in the cluster
            feature_summaries = []
            for feature in features[:5]:  # Use top 5 features to avoid token limits
                title = feature.get('Feature Title', '')
                desc = feature.get('Description', '')
                if title and desc:
                    feature_summaries.append(f"Feature: {title}\nDescription: {desc}")

            cluster_summary = "\n\n".join(feature_summaries)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "system",
                    "content": """You are a feature request analyst. Analyze multiple related feature requests 
                    and extract a concise theme (3-5 words) that accurately represents their common purpose or functionality. 
                    Focus on the core capability or improvement being requested across all features. 
                    The theme should be specific enough to be meaningful but general enough to encompass all related features."""
                }, {
                    "role": "user",
                    "content": f"Extract a theme that represents these related feature requests:\n\n{cluster_summary}"
                }],
                max_tokens=20,
                temperature=0.2  # Lower temperature for more consistent output
            )
            
            theme = response.choices[0].message.content.strip()
            return theme if theme else features[0].get('Feature Title', 'Unknown Theme')

        except Exception as e:
            logger.error(f"Error extracting cluster theme: {str(e)}")
            return features[0].get('Feature Title', 'Unknown Theme')

    def _ensure_list(self, arr) -> List[float]:
        """Convert numpy array to list and ensure all values are finite."""
        if isinstance(arr, np.ndarray):
            arr = arr.tolist()
        return [float(x) if not np.isnan(x) else 0.0 for x in arr]

    def _validate_coordinates(self, coords) -> bool:
        """Validate that coordinates are valid numbers."""
        try:
            return (len(coords) == 2 and 
                   all(isinstance(x, (int, float)) for x in coords) and 
                   all(not np.isnan(x) and not np.isinf(x) for x in coords))
        except:
            return False

    def cluster_features(self, embedded_features: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Cluster feature requests using hierarchical clustering."""
        try:
            logger.info("=== Starting Hierarchical Clustering Process ===")
            
            if not embedded_features:
                logger.warning("No features to cluster")
                return {'clusters': [], 'total_features': 0}

            # Extract embeddings and prepare data
            embeddings = []
            features = []
            for feature in embedded_features:
                if 'embedding' in feature and isinstance(feature['embedding'], (list, np.ndarray)):
                    embeddings.append(feature['embedding'])
                    features.append(feature['feature'])

            if not embeddings:
                logger.warning("No valid embeddings found")
                return {'clusters': [], 'total_features': 0}

            embeddings_array = np.array(embeddings)
            logger.info(f"Processing {len(embeddings)} feature requests")

            # Normalize embeddings
            norms = np.linalg.norm(embeddings_array, axis=1)
            norms[norms == 0] = 1  # Avoid division by zero
            embeddings_array = embeddings_array / norms[:, np.newaxis]

            # Generate linkage matrix for hierarchical clustering
            Z = linkage(embeddings_array, method='average', metric='cosine')
            
            # Find optimal distance threshold
            distance_threshold = self._find_optimal_distance_threshold(Z)
            logger.info(f"Optimal distance threshold: {distance_threshold}")

            # Perform hierarchical clustering
            clustering = AgglomerativeClustering(
                n_clusters=None,
                distance_threshold=distance_threshold,
                linkage='average',
                metric='cosine'
            )
            
            try:
                cluster_labels = clustering.fit_predict(embeddings_array)
            except Exception as e:
                logger.error(f"Error in clustering: {str(e)}")
                # Fallback to a fixed number of clusters
                clustering = AgglomerativeClustering(n_clusters=5, linkage='ward')
                cluster_labels = clustering.fit_predict(embeddings_array)

            # Reduce dimensionality for visualization
            logger.info("Reducing dimensionality with UMAP...")
            try:
                coordinates_2d = self.reducer.fit_transform(embeddings_array)
            except Exception as e:
                logger.error(f"Error in UMAP reduction: {str(e)}")
                # Fallback to PCA if UMAP fails
                from sklearn.decomposition import PCA
                pca = PCA(n_components=2)
                coordinates_2d = pca.fit_transform(embeddings_array)

            # Organize features into clusters
            clusters = []
            unique_labels = set(cluster_labels)
            
            for cluster_id in unique_labels:
                try:
                    cluster_indices = np.where(cluster_labels == cluster_id)[0]
                    
                    if len(cluster_indices) == 0:
                        continue
                    
                    # Get features and coordinates for this cluster
                    cluster_features = []
                    valid_coordinates = []
                    cluster_embeddings = []
                    
                    for idx in cluster_indices:
                        coords = self._ensure_list(coordinates_2d[idx])
                        if self._validate_coordinates(coords):
                            cluster_features.append({
                                'feature': features[idx],
                                'coordinates': coords
                            })
                            valid_coordinates.append(coords)
                            cluster_embeddings.append(embeddings[idx])

                    if not cluster_features:
                        continue

                    # Calculate cluster centroid in 2D space
                    centroid_2d = np.mean(valid_coordinates, axis=0)
                    
                    # Extract theme using all features in the cluster
                    theme = self._extract_cluster_theme(
                        [f['feature'] for f in cluster_features],
                        cluster_embeddings
                    )
                    
                    # Calculate cluster coherence
                    cluster_embeddings_array = np.array(cluster_embeddings)
                    centroid = np.mean(cluster_embeddings_array, axis=0)
                    distances = np.linalg.norm(cluster_embeddings_array - centroid, axis=1)
                    coherence = 1 / (1 + np.mean(distances))

                    # Calculate high priority percentage
                    high_priority_count = sum(1 for f in cluster_features 
                                         if f['feature'].get('Priority', '').lower() in ['high', 'critical'])
                    
                    clusters.append({
                        'id': int(cluster_id),
                        'size': len(cluster_features),
                        'theme': theme,
                        'features': cluster_features,
                        'centroid': self._ensure_list(centroid_2d),
                        'metadata': {
                            'high_priority_percentage': (high_priority_count / len(cluster_features)) * 100,
                            'coherence_score': float(coherence),
                            'avg_distance': float(np.mean(distances))
                        }
                    })
                except Exception as e:
                    logger.error(f"Error processing cluster {cluster_id}: {str(e)}")
                    continue

            # Sort clusters by size and coherence
            clusters.sort(key=lambda x: (x['size'], x['metadata']['coherence_score']), reverse=True)

            logger.info(f"Created {len(clusters)} clusters")
            for cluster in clusters:
                logger.info(f"Cluster {cluster['id']}: {cluster['theme']} ({cluster['size']} features, coherence: {cluster['metadata']['coherence_score']:.3f})")
            logger.info("=== Clustering Complete ===")

            return {
                'clusters': clusters,
                'total_features': len(embeddings)
            }

        except Exception as e:
            logger.error(f"Error in clustering process: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {'clusters': [], 'total_features': 0}