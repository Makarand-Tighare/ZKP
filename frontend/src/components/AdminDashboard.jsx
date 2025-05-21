import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import BlockchainVisualizer from './BlockchainVisualizer';

const AdminDashboard = ({ username, token }) => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [tab, setTab] = useState('users');
  const [filterUsername, setFilterUsername] = useState('');

  // Fetch users and logs when component mounts
  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchLogs();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://127.0.0.1:5000/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.status === 'success') {
        setUsers(response.data.users || {});
      } else {
        setError('Failed to fetch users: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error fetching users: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:5000/logs', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          username: filterUsername || undefined
        }
      });
      
      if (response.data.status === 'success') {
        setLogs(response.data.logs);
      } else {
        setError('Failed to fetch logs');
      }
    } catch (err) {
      setError('Error fetching logs: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) {
      setError('Please select a user and a role');
      return;
    }

    // Validate the selected role is valid
    const validRoles = ['admin', 'staff', 'user'];
    if (!validRoles.includes(newRole)) {
      setError('Invalid role selected. Please choose a valid role.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://127.0.0.1:5000/update_role', {
        admin_username: username,
        target_username: selectedUser,
        new_role: newRole
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.status === 'success') {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'bg-green-50 border border-green-200 rounded-md p-3 mb-4';
        successMessage.innerHTML = `<p class="text-sm text-green-800">Role successfully updated for ${selectedUser}</p>`;
        
        // Insert before the first child of the content area
        const contentArea = document.querySelector('#admin-dashboard-content');
        if (contentArea) {
          contentArea.insertBefore(successMessage, contentArea.firstChild);
          
          // Remove after 3 seconds
          setTimeout(() => {
            if (contentArea.contains(successMessage)) {
              contentArea.removeChild(successMessage);
            }
          }, 3000);
        }
        
        // Refresh the users list
        fetchUsers();
        setSelectedUser(null);
        setNewRole('');
      } else {
        setError(response.data.message || 'Failed to update role');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Error updating role: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterLogs = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-sm text-gray-600">Manage users and view system logs</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`px-6 py-3 font-medium text-sm ${tab === 'users' 
              ? 'border-b-2 border-indigo-500 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setTab('users')}
          >
            Users
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${tab === 'logs' 
              ? 'border-b-2 border-indigo-500 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setTab('logs')}
          >
            Activity Logs
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${tab === 'blockchain' 
              ? 'border-b-2 border-indigo-500 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setTab('blockchain')}
          >
            Blockchain
          </button>
        </nav>
      </div>

      {/* Content */}
      <div id="admin-dashboard-content" className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading && tab !== 'blockchain' && (
          <div className="flex justify-center my-4">
            <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {/* Users Tab */}
        {tab === 'users' && !loading && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Face ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(users).length > 0 ? (
                    Object.entries(users).map(([username, data]) => (
                      <tr key={username}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {data.has_face_id ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Not Set
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => setSelectedUser(username)}
                          >
                            Change Role
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedUser && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Change Role for {selectedUser}</h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                  </select>
                  <button
                    onClick={handleUpdateRole}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setNewRole('');
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Logs Tab */}
        {tab === 'logs' && !loading && (
          <div>
            <form onSubmit={handleFilterLogs} className="mb-4 flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={filterUsername}
                  onChange={(e) => setFilterUsername(e.target.value)}
                  placeholder="Filter by username (leave empty for all logs)"
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Filter
              </button>
            </form>
            
            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto border border-gray-200">
              {logs.length > 0 ? (
                <ul className="space-y-2">
                  {logs.map((log, index) => (
                    <li key={index} className="text-sm text-gray-700 border-b border-gray-100 pb-2">{log}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">No logs found</p>
              )}
            </div>
          </div>
        )}
        
        {/* Blockchain Tab */}
        {tab === 'blockchain' && (
          <BlockchainVisualizer token={token} />
        )}
      </div>
    </div>
  );
};

AdminDashboard.propTypes = {
  username: PropTypes.string.isRequired,
  token: PropTypes.string
};

export default AdminDashboard; 