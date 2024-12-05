from typing import List, Dict, Any
from datetime import datetime
import pandas as pd
from .embeddings_service import EmbeddingsService
from .clustering_service import ClusteringService
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FeatureAnalyzer:
    """Main service for analyzing feature requests using AI."""
    
    def __init__(self):
        """Initialize the feature analyzer with required services."""
        self.embeddings_service = EmbeddingsService()
        self.clustering_service = ClusteringService()
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    def analyze_features(self, features: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform comprehensive analysis of feature requests."""
        try:
            # Convert to DataFrame for easier manipulation
            df = pd.DataFrame(features)
            
            # Generate embeddings
            embedded_data = self.embeddings_service.embed_features(features)
            
            # Perform clustering
            cluster_results = self.clustering_service.cluster_features(
                embedded_data['embedded_features']
            )
            
            # Analyze trends over time
            temporal_analysis = self._analyze_temporal_patterns(df)
            
            # Identify pain points
            pain_points = self._analyze_pain_points(df, cluster_results['clusters'])
            
            # Get most engaged customers
            customer_engagement = self._analyze_customer_engagement(df)
            
            return {
                'most_common_requests': self._get_common_requests(cluster_results),
                'top_pain_points': pain_points,
                'most_engaged_customers': customer_engagement,
                'requests_by_category': self._get_requests_by_category(df),
                'trends_over_time': temporal_analysis['trends'],
                'requests_by_customer_type': self._get_requests_by_customer_type(df),
                'average_priority_score': self._calculate_priority_score(df),
                'cluster_insights': self._get_cluster_insights(cluster_results)
            }
            
        except Exception as e:
            print(f"Error in feature analysis: {str(e)}")
            raise
    
    def _get_common_requests(self, cluster_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get most common request types based on clusters."""
        try:
            common_requests = []
            for cluster in sorted(cluster_results['clusters'], 
                                key=lambda x: x['size'], 
                                reverse=True)[:3]:
                common_requests.append({
                    'name': cluster['theme'],
                    'count': cluster['size'],
                    'summary': cluster['summary']
                })
            return common_requests
        except Exception as e:
            print(f"Error getting common requests: {str(e)}")
            return []
    
    def _analyze_pain_points(self, df: pd.DataFrame, clusters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify top pain points using clustering and priority analysis."""
        try:
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
                            'theme': cluster['theme'],
                            'impact_score': avg_impact,
                            'count': len(cluster_df),
                            'description': cluster['summary']
                        })
            
            # Sort by impact score
            high_impact_clusters.sort(key=lambda x: x['impact_score'], reverse=True)
            
            # Take top 3 and normalize percentages
            top_clusters = high_impact_clusters[:3]
            if top_clusters:
                total_impact = sum(cluster['impact_score'] for cluster in top_clusters)
                return [
                    {
                        'name': cluster['theme'],
                        'percentage': int((cluster['impact_score'] / total_impact) * 100),
                        'description': cluster['description']
                    }
                    for cluster in top_clusters
                ]
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