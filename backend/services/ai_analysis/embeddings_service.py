import openai
from openai import OpenAI
import os
from typing import List, Dict, Any
from dotenv import load_dotenv
import traceback

class EmbeddingsService:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OpenAI API key not found in environment variables")
        self.client = OpenAI(api_key=api_key)

    def embed_features(self, features: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate embeddings for feature request descriptions."""
        try:
            print("\n=== Generating Embeddings ===")
            embedded_features = []
            
            for feature in features:
                # Extract description
                description = feature.get('Description', '').strip()
                if not description:
                    print(f"Warning: Empty description for feature {feature.get('Feature Title', 'Unknown')}")
                    continue

                # Get embedding for description
                try:
                    print(f"Generating embedding for: {feature.get('Feature Title', 'Unknown')}")
                    response = self.client.embeddings.create(
                        model="text-embedding-ada-002",
                        input=description
                    )
                    embedding = response.data[0].embedding
                    
                    embedded_features.append({
                        'feature': feature,
                        'description': description,
                        'embedding': embedding
                    })
                    print(f"Successfully generated embedding for: {feature.get('Feature Title', 'Unknown')}")
                except Exception as e:
                    print(f"Error generating embedding: {str(e)}")
                    continue

            print(f"Generated {len(embedded_features)} embeddings")
            print("=== Embedding Generation Complete ===\n")
            
            return {
                'embedded_features': embedded_features,
                'total_features': len(embedded_features)
            }

        except Exception as e:
            print(f"Error in embed_features: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return {
                'embedded_features': [],
                'total_features': 0
            } 