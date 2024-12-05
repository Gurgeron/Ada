from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score
import openai
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ClusteringService:
    """Service for clustering feature requests based on their embeddings."""
    
    def __init__(self):
        """Initialize the clustering service."""
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        if not os.getenv('OPENAI_API_KEY'):
            raise ValueError("OpenAI API key not found in environment variables")
    
    def find_optimal_clusters(self, embeddings: List[List[float]], min_clusters: int = 2, max_clusters: int = 10) -> int:
        """Find the optimal number of clusters using silhouette analysis."""
        try:
            # Convert embeddings to numpy array
            X = np.array(embeddings)
            
            best_score = -1
            optimal_n = min_clusters
            
            # Try different numbers of clusters
            for n in range(min_clusters, min(max_clusters + 1, len(embeddings))):
                clustering = AgglomerativeClustering(n_clusters=n)
                cluster_labels = clustering.fit_predict(X)
                
                # Calculate silhouette score
                score = silhouette_score(X, cluster_labels)
                
                if score > best_score:
                    best_score = score
                    optimal_n = n
            
            return optimal_n
            
        except Exception as e:
            print(f"Error finding optimal clusters: {str(e)}")
            raise
    
    def cluster_features(self, embedded_features: List[Dict[str, Any]], n_clusters: int = None) -> Dict[str, Any]:
        """Cluster features based on their embeddings."""
        try:
            # Extract embeddings
            embeddings = [ef['embedding'] for ef in embedded_features]
            
            # Find optimal number of clusters if not specified
            if n_clusters is None:
                n_clusters = self.find_optimal_clusters(embeddings)
            
            # Perform clustering
            clustering = AgglomerativeClustering(n_clusters=n_clusters)
            cluster_labels = clustering.fit_predict(embeddings)
            
            # Group features by cluster
            clusters = {}
            for i, label in enumerate(cluster_labels):
                if label not in clusters:
                    clusters[label] = []
                clusters[label].append(embedded_features[i])
            
            # Analyze each cluster
            analyzed_clusters = []
            for label, features in clusters.items():
                analysis = self._analyze_cluster(features)
                analyzed_clusters.append({
                    'cluster_id': label,
                    'features': features,
                    'size': len(features),
                    'theme': analysis['theme'],
                    'summary': analysis['summary'],
                    'key_terms': analysis['key_terms']
                })
            
            return {
                'clusters': analyzed_clusters,
                'n_clusters': n_clusters,
                'total_features': len(embedded_features)
            }
            
        except Exception as e:
            print(f"Error clustering features: {str(e)}")
            raise
    
    def _analyze_cluster(self, cluster_features: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze a cluster using GPT-4 to identify themes and patterns."""
        try:
            # Prepare cluster data for analysis
            feature_texts = [
                f"Title: {f['feature']['Feature Title']}\nDescription: {f['feature']['Description']}"
                for f in cluster_features[:5]  # Analyze up to 5 features per cluster
            ]
            
            # Create prompt for GPT-4
            prompt = f"""Analyze these related feature requests and identify:
1. The main theme or category
2. A brief summary of what these features have in common
3. Key terms or concepts that appear frequently

Feature Requests:
{'\n\n'.join(feature_texts)}

Provide your analysis in JSON format with these keys: theme, summary, key_terms"""
            
            # Get GPT-4 analysis
            response = self.client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": "You are an expert product analyst. Analyze feature requests and identify patterns and themes."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )
            
            # Parse the response
            analysis = response.choices[0].message.content
            return eval(analysis)  # Convert string to dict
            
        except Exception as e:
            print(f"Error analyzing cluster: {str(e)}")
            # Provide fallback analysis if GPT-4 fails
            return {
                'theme': 'Theme extraction failed',
                'summary': 'Summary generation failed',
                'key_terms': []
            } 