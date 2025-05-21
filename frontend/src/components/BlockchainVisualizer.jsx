import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const BlockchainVisualizer = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    username: '',
    event_type: ''
  });
  
  // Event type options (will be populated from the API)
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    fetchBlockchainData();
  }, [page, filters]);

  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page,
        items_per_page: 5,
        ...(filters.username && { username: filters.username }),
        ...(filters.event_type && { event_type: filters.event_type })
      });
      
      const response = await axios.get(`http://127.0.0.1:5000/blockchain?${queryParams}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.status === 'success') {
        setBlockchainData(response.data);
        
        // Extract event types if available
        const events = response.data.events || [];
        const eventTypesList = events
          .filter(key => key.toUpperCase() === key && key !== '__MODULE__' && key !== 'create_event')
          .map(key => ({ value: key, label: key.replace('_', ' ') }));
        
        setEventTypes(eventTypesList);
      } else {
        setError('Failed to fetch blockchain data');
      }
    } catch (err) {
      setError(`Error fetching blockchain data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      username: '',
      event_type: ''
    });
    setPage(1);
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Determine appropriate color for event type
  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'REGISTRATION':
        return 'bg-blue-100 text-blue-800';
      case 'LOGIN_SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'LOGIN_FAILURE':
        return 'bg-red-100 text-red-800';
      case 'ZKP_VERIFICATION':
        return 'bg-purple-100 text-purple-800';
      case 'ROLE_CHANGE':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-md p-4 mb-4">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 my-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Blockchain Authentication Ledger</h2>
        <p className="text-gray-600">Immutable record of all authentication events</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Filter Records</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Filter by username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              name="event_type"
              value={filters.event_type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Events</option>
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleClearFilters}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Blockchain Status */}
      {blockchainData && (
        <div className={`mb-4 p-3 rounded-md ${blockchainData.blockchain_valid ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
          <div className="flex items-center">
            <span className={`h-2 w-2 rounded-full mr-2 ${blockchainData.blockchain_valid ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={`text-sm font-medium ${blockchainData.blockchain_valid ? 'text-green-800' : 'text-red-800'}`}>
              {blockchainData.blockchain_valid ? 'Blockchain Integrity: Valid' : 'Blockchain Integrity: Invalid'}
            </span>
          </div>
        </div>
      )}

      {/* Blockchain Visualization */}
      {loading ? (
        <div className="flex justify-center my-8">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : blockchainData?.blocks?.length > 0 ? (
        <>
          <div className="blocks-visualizer mb-6">
            {blockchainData.blocks.map((block, index) => (
              <div key={block.hash} className="mb-6 block-container">
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  {/* Block Header */}
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-600 mr-2">Block #{block.index}</span>
                      {block.data.type && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getEventColor(block.data.type)}`}>
                          {block.data.type}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(block.timestamp)}
                    </span>
                  </div>
                  
                  {/* Block Content */}
                  <div className="p-4">
                    {block.data.username && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-600">User:</span>
                        <span className="ml-2 text-sm text-gray-800">{block.data.username}</span>
                      </div>
                    )}
                    
                    {/* Show details if available */}
                    {block.data.details && Object.keys(block.data.details).length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Details:</h4>
                        <div className="bg-white p-2 rounded border border-gray-200">
                          {Object.entries(block.data.details).map(([key, value]) => (
                            <div key={key} className="text-xs mb-1">
                              <span className="font-medium text-gray-700">{key.replace(/_/g, ' ')}:</span>
                              <span className="ml-1 text-gray-600">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Block Cryptographic Details */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <details className="text-xs">
                        <summary className="text-indigo-600 cursor-pointer">View Cryptographic Details</summary>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                          <div className="bg-gray-50 p-2 rounded border border-gray-200">
                            <span className="font-medium">Previous Hash:</span>
                            <span className="ml-1 font-mono break-all text-gray-600">{block.previous_hash}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded border border-gray-200">
                            <span className="font-medium">Hash:</span>
                            <span className="ml-1 font-mono break-all text-gray-600">{block.hash}</span>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
                
                {/* Connect blocks with arrow except for the last one */}
                {index < blockchainData.blocks.length - 1 && (
                  <div className="flex justify-center my-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {blockchainData.total_pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {page} of {blockchainData.total_pages}
              </span>
              
              <button
                onClick={() => setPage(Math.min(blockchainData.total_pages, page + 1))}
                disabled={page === blockchainData.total_pages}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No blockchain records found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

BlockchainVisualizer.propTypes = {
  token: PropTypes.string
};

export default BlockchainVisualizer; 