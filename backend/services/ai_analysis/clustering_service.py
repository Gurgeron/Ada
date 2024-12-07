from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import openai
from openai import OpenAI
import os
from dotenv import load_dotenv
import re
import traceback
import umap

# Load environment variables
load_dotenv()

class ClusteringService:
    """Service for clustering feature requests based on their embeddings."""
    
    def __init__(self):
        """Initialize the clustering service."""
        self.min_k = 2
        self.max_k = 15
        # Initialize UMAP for dimensionality reduction
        self.reducer = umap.UMAP(
            n_components=2,
            random_state=42,
            min_dist=0.1,
            n_neighbors=15
        )
        try:
            self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            if not os.getenv('OPENAI_API_KEY'):
                print("⚠️ Warning: OpenAI API key not found in environment variables")
                self.client = None
        except Exception as e:
            print(f"⚠️ Warning: Could not initialize OpenAI client: {str(e)}")
            self.client = None
    
    def clean_text(self, text: str) -> str:
        """Clean text by lowercasing and removing punctuation"""
        text = re.sub(r'[^\w\s]', '', text)
        return text.lower().strip()
    
    def find_optimal_k(self, vectors: List[List[float]]) -> int:
        """Find optimal number of clusters using silhouette score"""
        print("\nFinding optimal k...")
        vectors_array = np.array(vectors)
        
        min_k = min(self.min_k, len(vectors) - 1)
        max_k = min(self.max_k, len(vectors) - 1)
        
        if min_k >= max_k:
            print(f"Not enough data points for meaningful clustering. Using k={min_k}")
            return min_k
            
        k_values = range(min_k, max_k + 1)
        best_score = -1
        best_k = min_k
        
        scores = []
        for k in k_values:
            try:
                kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
                cluster_labels = kmeans.fit_predict(vectors_array)
                score = silhouette_score(vectors_array, cluster_labels)
                scores.append(score)
                print(f"k={k}, silhouette score={score:.3f}")
                
                if score > best_score * 1.05:  # 5% improvement threshold
                    best_score = score
                    best_k = k
            except Exception as e:
                print(f"Error evaluating k={k}: {str(e)}")
                continue
        
        if len(scores) > 2:
            score_diffs = np.diff(scores)
            if any(diff < 0.05 for diff in score_diffs):
                best_k = min(best_k, k_values[next(i for i, diff in enumerate(score_diffs) if diff < 0.05) + 1])
        
        print(f"Selected optimal k={best_k} with score={best_score:.3f}")
        return best_k
    
    def cluster_features(self, embedded_features: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Cluster feature requests based on embeddings"""
        try:
            print("\n=== Starting Clustering Process ===")
            
            if not embedded_features:
                print("No features to cluster")
                return {'clusters': []}

            # Extract embeddings and prepare data
            embeddings = []
            features = []
            for feature in embedded_features:
                if 'embedding' in feature:
                    embeddings.append(feature['embedding'])
                    features.append(feature['feature'])

            if not embeddings:
                print("No valid embeddings found")
                return {'clusters': []}

            embeddings_array = np.array(embeddings)
            print(f"Processing {len(embeddings)} feature requests")

            # Reduce dimensionality for visualization
            print("Reducing dimensionality with UMAP...")
            coordinates_2d = self.reducer.fit_transform(embeddings_array)

            # Find optimal number of clusters
            optimal_k = self.find_optimal_k(embeddings)

            # Perform final clustering
            print(f"\nPerforming final clustering with k={optimal_k}")
            kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(embeddings_array)

            # Organize features into clusters
            clusters = []
            for i in range(optimal_k):
                cluster_indices = np.where(cluster_labels == i)[0]
                
                if len(cluster_indices) == 0:
                    continue
                
                # Get features and coordinates for this cluster
                cluster_features = []
                for idx in cluster_indices:
                    cluster_features.append({
                        'feature': features[idx],
                        'coordinates': coordinates_2d[idx].tolist()
                    })

                # Find central feature
                center_idx = self._find_cluster_center(
                    vectors=[embeddings[j] for j in cluster_indices],
                    cluster_center=kmeans.cluster_centers_[i]
                )
                
                # Calculate theme from central feature
                central_idx = cluster_indices[center_idx]
                theme = self._extract_theme(features[central_idx])
                
                # Calculate high priority percentage
                high_priority_count = sum(1 for f in cluster_features 
                                     if f['feature'].get('Priority', '').lower() in ['high', 'critical'])
                
                clusters.append({
                    'id': i,
                    'size': len(cluster_features),
                    'theme': theme,
                    'features': cluster_features,
                    'centroid': kmeans.cluster_centers_[i].tolist(),
                    'coordinates_2d': coordinates_2d[cluster_indices].tolist(),
                    'metadata': {
                        'high_priority_percentage': (high_priority_count / len(cluster_features)) * 100
                    }
                })

            print(f"Created {len(clusters)} clusters")
            for cluster in clusters:
                print(f"Cluster {cluster['id']}: {cluster['theme']} ({cluster['size']} features)")
            print("=== Clustering Complete ===\n")

            return {
                'clusters': sorted(clusters, key=lambda x: x['size'], reverse=True),
                'total_features': len(embeddings)
            }

        except Exception as e:
            print(f"Error in clustering: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return {'clusters': [], 'total_features': 0}

    def _find_cluster_center(self, vectors: List[List[float]], cluster_center: List[float]) -> int:
        """Find the index of the feature closest to cluster center."""
        distances = [np.linalg.norm(np.array(v) - cluster_center) for v in vectors]
        return int(np.argmin(distances))

    def _extract_theme(self, feature: Dict[str, Any]) -> str:
        """Extract a theme from the central feature."""
        try:
            if not self.client:
                return feature.get('Feature Title', 'Unknown Theme')

            # Combine title and description for theme extraction
            text = f"{feature.get('Feature Title', '')} - {feature.get('Description', '')}"
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "system",
                    "content": "You are a feature request analyst. Extract a concise theme (3-5 words) that captures the essence of this feature request."
                }, {
                    "role": "user",
                    "content": text
                }],
                max_tokens=20,
                temperature=0.3
            )
            
            theme = response.choices[0].message.content.strip()
            return theme if theme else feature.get('Feature Title', 'Unknown Theme')

        except Exception as e:
            print(f"Error extracting theme: {str(e)}")
            return feature.get('Feature Title', 'Unknown Theme')