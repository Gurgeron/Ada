# Improving Feature Request Clustering Quality for Ada

## The Core Problem
Our feature request clustering system isn't effectively grouping similar features together. Product managers are finding that feature requests that should logically be grouped together are being split across different clusters. This makes it harder to:
1. Identify true feature demand (similar requests are counted separately)
2. Understand feature impact (related requests have split priority scores)
3. Make informed product decisions (can't see the full picture)

## Real Examples from Our Data

### Example 1: Authentication Features Split
Currently in separate clusters:
```
Cluster A:
- "Add SSO support for enterprise customers"
- "Implement SAML authentication"

Cluster B:
- "Single sign-on integration needed"
- "Enterprise authentication system"

Cluster C:
- "Support for Okta login"
- "Azure AD integration for login"
```
These should all be in one "Enterprise Authentication" cluster.

### Example 2: Export Functionality Scattered
Currently split:
```
Cluster A:
- "Export data to Excel format"
- "Spreadsheet export option"

Cluster B:
- "Add CSV download feature"
- "Data export functionality"

Cluster C:
- "Bulk data export tool"
- "Download all data in spreadsheet"
```
These should be grouped as "Data Export Features".

## Current Implementation Details

### Embedding Generation
```python
def embed_features(self, features):
    combined_text = []
    for feature in features:
        text = f"{feature['Feature Title']} {feature['Description']}"
        combined_text.append(text)
    
    embeddings = self.openai.embeddings.create(
        model="text-embedding-ada-002",
        input=combined_text
    )
    return embeddings
```

### Clustering Logic
```python
def cluster_features(self, embeddings):
    # Using scikit-learn's KMeans
    clusterer = KMeans(n_clusters=self._calculate_optimal_clusters(len(embeddings)))
    cluster_labels = clusterer.fit_predict(embeddings)
    
    # Group features by cluster
    clusters = self._group_by_cluster(features, cluster_labels)
    return clusters
```

## Key Issues to Solve

1. Semantic Understanding:
   - "SSO", "Single sign-on", and "SAML authentication" aren't recognized as related
   - "Export", "Download", and "Extract" aren't connected
   - Technical terms and their business equivalents aren't matched

2. Context Consideration:
   - Feature titles and descriptions are treated equally
   - Customer type and priority aren't factored into clustering
   - Business value and impact aren't influencing grouping

3. Granularity Problems:
   - Sometimes clusters are too broad (mixing unrelated features)
   - Sometimes too granular (splitting obviously related features)
   - No clear hierarchy of feature relationships

## Real Dataset Context
From our AdaBigCSV.csv:
- 500+ feature requests
- 20+ distinct feature categories
- Mix of technical and non-technical language
- Varying levels of description detail
- Multiple customer segments (Enterprise, SMB, Individual)

## Technical Constraints
1. Using OpenAI's text-embedding-ada-002 model
2. Need to process 500+ features in under 5 seconds
3. Must work with existing Flask/React stack
4. Should integrate with current caching system
5. Must handle incremental updates efficiently

## Success Metrics
1. 95% accuracy in grouping obviously related features
2. No splitting of clearly similar features across clusters
3. Cluster themes that match human intuition
4. Processing time under 5 seconds for 500 features
5. Consistent results across multiple runs 