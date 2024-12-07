from typing import List, Dict, Any
from datetime import datetime
import pandas as pd
from .embeddings_service import EmbeddingsService
from .clustering_service import ClusteringService
import numpy as np
import traceback

class FeatureAnalyzer:
    """Main service for analyzing feature requests using AI."""
    
    def __init__(self):
        """Initialize the feature analyzer with required services."""
        self.embeddings_service = EmbeddingsService()
        self.clustering_service = ClusteringService()

    def analyze_features(self, features: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform comprehensive analysis of feature requests."""
        try:
            print("\n=== Starting Feature Analysis ===")
            
            if not features:
                print("No features provided")
                return self._empty_result()
            
            # Convert to DataFrame for easier manipulation
            df = pd.DataFrame(features)
            print(f"Processing {len(features)} features")
            
            # Generate embeddings
            print("Generating embeddings...")
            embedded_data = self.embeddings_service.embed_features(features)
            if not embedded_data['embedded_features']:
                print("No embeddings generated")
                return self._empty_result()
            
            print(f"Generated {len(embedded_data['embedded_features'])} embeddings")
            
            # Perform clustering
            print("Performing clustering...")
            cluster_results = self.clustering_service.cluster_features(
                embedded_data['embedded_features']
            )
            
            if not cluster_results['clusters']:
                print("No clusters generated")
                return self._empty_result()
            
            print(f"Created {len(cluster_results['clusters'])} clusters")
            
            # Process clusters
            clusters = []
            for cluster in cluster_results['clusters']:
                cluster_features = cluster['features']
                if not cluster_features:
                    continue
                    
                # Calculate cluster metadata
                metadata = self._calculate_cluster_metadata(cluster_features)
                
                clusters.append({
                    'id': cluster['id'],
                    'theme': cluster['theme'],
                    'size': len(cluster_features),
                    'features': cluster_features,
                    'metadata': metadata
                })
            
            result = {
                'clusters': clusters,
                'most_common_requests': self._get_common_requests(cluster_results),
                'top_pain_points': self._analyze_pain_points(df, clusters),
                'most_engaged_customers': self._analyze_customer_engagement(df),
                'requests_by_category': self._get_requests_by_category(df),
                'trends_over_time': self._analyze_temporal_patterns(df)['trends'],
                'requests_by_customer_type': self._get_requests_by_customer_type(df),
                'average_priority_score': self._calculate_priority_score(df)
            }
            
            print("\n=== Analysis Results ===")
            print(f"Number of clusters: {len(result['clusters'])}")
            print(f"Sample cluster theme: {result['clusters'][0]['theme'] if result['clusters'] else 'None'}")
            print("=== Feature Analysis Complete ===\n")
            
            return result
            
        except Exception as e:
            print(f"Error in feature analysis: {str(e)}")
            print(traceback.format_exc())
            return self._empty_result()

    def _calculate_cluster_metadata(self, features: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate metadata for a cluster."""
        try:
            total = len(features)
            if total == 0:
                return self._empty_metadata()
                
            priorities = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
            customer_types = {}
            
            for feature in features:
                # Count priorities
                priority = feature['feature'].get('Priority', 'Low')
                priorities[priority] = priorities.get(priority, 0) + 1
                
                # Count customer types
                cust_type = feature['feature'].get('Customer Type', 'Unknown')
                customer_types[cust_type] = customer_types.get(cust_type, 0) + 1
            
            # Calculate percentages
            high_priority = (priorities['High'] + priorities['Critical'])
            high_priority_percentage = (high_priority / total) * 100 if total > 0 else 0
            
            return {
                'priorities': priorities,
                'customer_types': customer_types,
                'high_priority_percentage': high_priority_percentage
            }
            
        except Exception as e:
            print(f"Error calculating cluster metadata: {str(e)}")
            return self._empty_metadata()

    def _empty_metadata(self) -> Dict[str, Any]:
        """Return empty metadata structure."""
        return {
            'priorities': {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0},
            'customer_types': {},
            'high_priority_percentage': 0
        }

    def _empty_result(self) -> Dict[str, Any]:
        """Return empty result structure."""
        return {
            'clusters': [],
            'most_common_requests': [],
            'top_pain_points': [],
            'most_engaged_customers': [],
            'requests_by_category': [],
            'trends_over_time': [],
            'requests_by_customer_type': [],
            'average_priority_score': {'score': 0, 'description': 'No data available'}
        }

    def _get_common_requests(self, cluster_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get most common request types based on clusters."""
        try:
            if not cluster_results or 'clusters' not in cluster_results:
                print("No clusters found in results")
                return []

            common_requests = []
            for cluster in sorted(cluster_results['clusters'], 
                                key=lambda x: x['size'], 
                                reverse=True)[:3]:
                common_requests.append({
                    'name': cluster['theme'],
                    'count': cluster['size']
                })
            return common_requests
        except Exception as e:
            print(f"Error getting common requests: {str(e)}")
            return []
    
    def _analyze_pain_points(self, df: pd.DataFrame, clusters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify top pain points using clustering and priority analysis."""
        try:
            if df.empty or not clusters:
                print("No data available for pain points analysis")
                return []

            # Combine priority and impact information
            df['impact_score'] = df.apply(
                lambda row: self._calculate_impact_score(
                    row.get('Priority', 'Low'),
                    row.get('Customer Impact', 'Low'),
                    row.get('Business Value', 'Low')
                ),
                axis=1
            )
            
            # Group high-impact issues by cluster
            high_impact_clusters = []
            for cluster in clusters:
                cluster_features = [f['feature'] for f in cluster['features']]
                cluster_df = df[df['Feature Title'].isin([f['Feature Title'] for f in cluster_features])]
                
                if len(cluster_df) > 0:
                    avg_impact = cluster_df['impact_score'].mean()
                    if avg_impact >= 0.7:  # High impact threshold
                        high_impact_clusters.append({
                            'name': cluster['theme'],
                            'impact_score': avg_impact,
                            'count': len(cluster_df)
                        })
            
            # Sort by impact score
            high_impact_clusters.sort(key=lambda x: x['impact_score'], reverse=True)
            
            # Take top 3 and normalize percentages
            top_clusters = high_impact_clusters[:3]
            if top_clusters:
                total_impact = sum(cluster['impact_score'] for cluster in top_clusters)
                return [
                    {
                        'name': cluster['name'],
                        'percentage': int((cluster['impact_score'] / total_impact) * 100)
                    }
                    for cluster in top_clusters
                ]
            
            print("No high-impact clusters found")
            return []
            
        except Exception as e:
            print(f"Error analyzing pain points: {str(e)}")
            return []
    
    def _calculate_impact_score(self, priority: str, impact: str, value: str) -> float:
        """Calculate normalized impact score from priority, impact, and business value."""
        try:
            # Convert string values to numeric scores
            priority_map = {'Low': 0.2, 'Medium': 0.5, 'High': 0.8, 'Critical': 1.0}
            impact_map = {'Low': 0.2, 'Medium': 0.5, 'High': 0.8}
            value_map = {'Low': 0.2, 'Medium': 0.5, 'High': 0.8}
            
            # Get numeric scores with fallback to lowest value
            priority_score = priority_map.get(priority, 0.2)
            impact_score = impact_map.get(impact, 0.2)
            value_score = value_map.get(value, 0.2)
            
            # Calculate weighted average (prioritizing customer impact)
            return (priority_score * 0.3 + impact_score * 0.4 + value_score * 0.3)
            
        except Exception as e:
            print(f"Error calculating impact score: {str(e)}")
            return 0.0
    
    def _analyze_temporal_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze trends over time in feature requests."""
        try:
            # Convert request dates to datetime
            df['Request Date'] = pd.to_datetime(df['Request Date'])
            
            # Group by month and count requests
            monthly_counts = df.groupby(df['Request Date'].dt.strftime('%b'))['Feature Title'].count()
            
            # Convert to list of dictionaries
            trends = [
                {'month': month, 'requests': int(count)}
                for month, count in monthly_counts.items()
            ]
            
            return {
                'trends': sorted(trends, key=lambda x: datetime.strptime(x['month'], '%b'))
            }
            
        except Exception as e:
            print(f"Error analyzing temporal patterns: {str(e)}")
            return {'trends': []}
    
    def _analyze_customer_engagement(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze customer engagement based on request patterns."""
        try:
            # Count requests by requester
            requester_counts = df['Requested By'].value_counts()
            
            # Convert to list of dictionaries
            return [
                {'customer': requester, 'requests': int(count)}
                for requester, count in requester_counts.head(3).items()
            ]
            
        except Exception as e:
            print(f"Error analyzing customer engagement: {str(e)}")
            return []
    
    def _get_requests_by_category(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get distribution of requests by category/type."""
        try:
            # Count requests by type
            type_counts = df['Type'].value_counts()
            total_requests = len(df)
            
            # Convert to list of dictionaries with percentages
            return [
                {
                    'category': category,
                    'percentage': int((count / total_requests) * 100)
                }
                for category, count in type_counts.items()
            ]
            
        except Exception as e:
            print(f"Error getting requests by category: {str(e)}")
            return []
    
    def _get_requests_by_customer_type(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get distribution of requests by customer type."""
        try:
            # Count requests by customer type
            customer_type_counts = df['Customer Type'].value_counts()
            total_requests = len(df)
            
            # Convert to list of dictionaries with counts and percentages
            return [
                {
                    'type': ctype,
                    'count': int(count),
                    'percentage': int((count / total_requests) * 100)
                }
                for ctype, count in customer_type_counts.items()
            ]
            
        except Exception as e:
            print(f"Error getting requests by customer type: {str(e)}")
            return []
    
    def _calculate_priority_score(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate overall priority score based on multiple factors."""
        try:
            # Convert priority levels to numeric scores
            priority_map = {'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4}
            df['priority_score'] = df['Priority'].map(priority_map)
            
            # Calculate weighted average considering impact and value
            impact_map = {'Low': 1, 'Medium': 2, 'High': 3}
            df['impact_score'] = df['Customer Impact'].map(impact_map)
            df['value_score'] = df['Business Value'].map(impact_map)
            
            # Combine scores with weights
            weighted_score = (
                df['priority_score'] * 0.4 +
                df['impact_score'] * 0.3 +
                df['value_score'] * 0.3
            ).mean()
            
            # Normalize to 0-10 scale
            normalized_score = (weighted_score / 4) * 10
            
            return {
                'score': f"{normalized_score:.1f}",
                'description': 'Based on priority, customer impact, and business value'
            }
            
        except Exception as e:
            print(f"Error calculating priority score: {str(e)}")
            return {'score': '0.0', 'description': 'Error calculating score'}
    
    def _get_cluster_insights(self, cluster_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get detailed insights from clustering analysis."""
        try:
            return [
                {
                    'theme': cluster['theme'],
                    'size': cluster['size'],
                    'summary': cluster['summary'],
                    'key_terms': cluster['key_terms']
                }
                for cluster in cluster_results['clusters']
            ]
        except Exception as e:
            print(f"Error getting cluster insights: {str(e)}")
            return [] 