# Changelog

## [1.0.0] - 2024-01-10

### Modified
- Updated `AdaSample - sample_feature_requests copy.csv` with the following changes:
  - Changed Request Channel format:
    - Removed "Customer" prefix from "Customer Interview" -> "Interview"
    - Removed "Internal" prefix from "Internal Team" -> "Team"
  - Modified Customer Type values to be more specific:
    - Changed "All" to either "Enterprise", "Small buisiness", or "Private"
  - Updated Priority format:
    - Standardized to "High", "Med", "Low", "Critical"
  - Changed Status values:
    - Updated "Planned" to either "Open", "In Progress", or "Done"
  - Modified Requested By field:
    - Changed from generic roles to specific company/person names
  - Updated Customer Impact:
    - Changed from text values to numeric scale (1-9)
    - 1-3: Low impact
    - 4-6: Medium impact
    - 7-9: High impact

### Maintained
- Preserved all other fields including:
  - Request ID format
  - Feature Title
  - Description
  - Product
  - Type
  - Request Date
  - Business Value
  - Implementation Complexity