import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdaChat from '../Ada/AdaChat';
import FeatureTable from './FeatureTable';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const Analysis = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contextId = queryParams.get('context_id');
  const [featureData, setFeatureData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/data/data/${contextId}`);
        console.log('Raw API Response:', response.data);
        
        // Extract the data from the response
        let processedData = [];
        if (response.data?.data) {
          processedData = response.data.data;
        } else if (response.data?.processed_data) {
          processedData = response.data.processed_data;
        } else if (Array.isArray(response.data)) {
          processedData = response.data;
        }
        
        console.log('First row raw data:', processedData[0]);
        console.log('Row 15 raw data:', processedData[15]);
        console.log('Row 16 raw data:', processedData[16]);
        
        if (processedData.length > 0) {
          // Define field mappings from API to CSV columns
          const fieldMappings = {
            'Feature Title': 'Feature Title',
            'Description': 'Description',
            'Product': 'Product',
            'Request Channel': 'Request Channel',
            'Customer Type': 'Customer Type',
            'Priority': 'Priority',
            'Status': 'Status',
            'Type': 'Type',
            'Requested By': 'Requested By',
            'Request Date': 'Request Date',
            'Business Value': 'Business Value',
            'Implementation Complexity': 'Implementation Complexity',
            'Customer Impact': 'Customer Impact',
            // Add mappings for differently named fields
            'request_id': 'Request ID',
            'feature_title': 'Feature Title',
            'description': 'Description',
            'product': 'Product',
            'request_channel': 'Request Channel',
            'customer_type': 'Customer Type',
            'priority': 'Priority',
            'status': 'Status',
            'type': 'Type',
            'requested_by': 'Requested By',
            'request_date': 'Request Date',
            'business_value': 'Business Value',
            'implementation_complexity': 'Implementation Complexity',
            'customer_impact': 'Customer Impact'
          };

          // Define the exact column order we want
          const columnOrder = [
            'Request ID',
            'Feature Title',
            'Description',
            'Product',
            'Request Channel',
            'Customer Type',
            'Priority',
            'Status',
            'Type',
            'Requested By',
            'Request Date',
            'Business Value',
            'Implementation Complexity',
            'Customer Impact'
          ];
          
          // Transform the data to match exact CSV structure with validation
          const transformedData = processedData.map((item, index) => {
            // Create a new object with all fields initialized to empty strings
            const row = columnOrder.reduce((acc, header) => {
              acc[header] = '';
              return acc;
            }, {});
            
            // Map fields with validation
            if (typeof item === 'object' && item !== null) {
              Object.entries(item).forEach(([key, value]) => {
                // Try to find the correct column name using our mappings
                const mappedColumn = fieldMappings[key];
                if (mappedColumn) {
                  row[mappedColumn] = value || '';
                } else {
                  // Try case-insensitive matching as fallback
                  const matchingColumn = columnOrder.find(col => 
                    col.toLowerCase() === key.toLowerCase()
                  );
                  if (matchingColumn) {
                    row[matchingColumn] = value || '';
                  } else {
                    console.warn(`Unknown field "${key}" in row ${index}`);
                  }
                }
              });
            }
            
            // Generate Request ID if missing
            if (!row['Request ID']) {
              row['Request ID'] = `FR-${String(index + 1).padStart(3, '0')}`;
            }
            
            // Log problematic rows
            if (index === 15 || index === 16) {
              console.log(`Row ${index} transformation:`, {
                original: item,
                transformed: row,
                keys: Object.keys(item)
              });
            }
            
            return row;
          });
          
          // Create columns configuration
          const tableColumns = columnOrder.map(header => ({
            header,
            accessor: header,
            Cell: ({ value }) => {
              if (!value) return '';
              
              if (header === 'Status') {
                return <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(value)}`}>{value}</span>;
              }
              if (header === 'Priority') {
                return <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(value)}`}>{value}</span>;
              }
              if (header === 'Type') {
                return <span className="px-2 py-1 rounded-full text-sm bg-gray-100">{value}</span>;
              }
              if (header === 'Description') {
                return <div className="max-w-md whitespace-normal">{value}</div>;
              }
              return value;
            }
          }));
          
          setColumns(tableColumns);
          setFeatureData(transformedData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to load feature request data');
        setLoading(false);
      }
    };

    if (contextId) {
      fetchData();
    }
  }, [contextId]);

  // Add helper functions for status and priority colors
  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Planned': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (!contextId) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2B2B2B] mb-4">No Context Found</h2>
          <p className="text-[#B3B3B3]">Please complete the setup process first.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B2B2B]"></div>
          <p className="mt-4 text-[#B3B3B3]">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-[#B3B3B3]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Area with Table */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6">
              Feature Request Analysis
            </h2>
            <FeatureTable data={featureData} columns={columns} />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-1 lg:h-[calc(100vh-8rem)] lg:sticky lg:top-8">
            <AdaChat contextId={contextId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis; 