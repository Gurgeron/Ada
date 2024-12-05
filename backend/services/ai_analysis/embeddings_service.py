from typing import List, Dict, Any
import numpy as np
from openai import OpenAI
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

class EmbeddingsService:
    """Service for generating and managing embeddings for feature requests."""
    
    def __init__(self):
        """Initialize the embeddings service with OpenAI client."""
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        if not os.getenv('OPENAI_API_KEY'):
            raise ValueError("OpenAI API key not found in environment variables")
    
    def _prepare_text(self, feature: Dict[str, Any]) -> str:
        """Prepare feature text for embedding by combining relevant fields."""
        parts = [
            feature.get('Feature Title', ''),
            feature.get('Description', ''),
            f"Priority: {feature.get('Priority', 'Unknown')}",
            f"Business Value: {feature.get('Business Value', 'Unknown')}",
            f"Customer Impact: {feature.get('Customer Impact', 'Unknown')}"
        ]
        return ' | '.join(filter(None, parts))
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text using OpenAI's API."""
        try:
            response = self.client.embeddings.create(
                model="text-embedding-ada-002",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {str(e)}")
            raise
    
    def embed_features(self, features: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate embeddings for a list of features."""
        try:
            # Prepare texts for embedding
            texts = [self._prepare_text(feature) for feature in features]
            
            # Generate embeddings in batches
            all_embeddings = []
            batch_size = 100  # OpenAI's recommended batch size
            
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                response = self.client.embeddings.create(
                    model="text-embedding-ada-002",
                    input=batch_texts
                )
                batch_embeddings = [data.embedding for data in response.data]
                all_embeddings.extend(batch_embeddings)
            
            # Create a mapping of features to their embeddings
            embedded_features = []
            for feature, embedding in zip(features, all_embeddings):
                embedded_features.append({
                    'feature': feature,
                    'embedding': embedding,
                    'text': texts[features.index(feature)]  # Store processed text for reference
                })
            
            return {
                'embedded_features': embedded_features,
                'dimension': len(all_embeddings[0]) if all_embeddings else 0,
                'count': len(all_embeddings)
            }
            
        except Exception as e:
            print(f"Error in batch embedding: {str(e)}")
            raise
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings."""
        try:
            # Convert to numpy arrays for efficient computation
            a = np.array(embedding1)
            b = np.array(embedding2)
            
            # Calculate cosine similarity
            similarity = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
            
            return float(similarity)
        except Exception as e:
            print(f"Error calculating similarity: {str(e)}")
            raise
    
    def find_similar_features(self, 
                            target_embedding: List[float], 
                            embedded_features: List[Dict[str, Any]], 
                            threshold: float = 0.8,
                            max_results: int = 5) -> List[Dict[str, Any]]:
        """Find similar features based on embedding similarity."""
        try:
            similarities = []
            for ef in embedded_features:
                similarity = self.calculate_similarity(target_embedding, ef['embedding'])
                if similarity >= threshold:
                    similarities.append({
                        'feature': ef['feature'],
                        'similarity': similarity,
                        'text': ef.get('text', '')
                    })
            
            # Sort by similarity score and return top results
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            return similarities[:max_results]
            
        except Exception as e:
            print(f"Error finding similar features: {str(e)}")
            raise 