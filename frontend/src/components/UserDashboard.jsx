import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const UserDashboard = ({ username, role, token }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username && token) {
      fetchUserLogs();
    }
  }, [username, token]);

  const fetchUserLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:5000/logs', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          username: username
        }
      });
      
      if (response.data.status === 'success') {
        setLogs(response.data.logs);
      } else {
        setError('Failed to fetch activity logs');
      }
    } catch (err) {
      setError('Error fetching logs: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">User Dashboard</h2>
        <p className="text-sm text-gray-600">Welcome, {username} ({role})</p>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Your Profile</h3>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="mt-1 text-sm text-gray-900">{username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="mt-1 text-sm text-gray-900">{role}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Your Activity Logs</h3>
            <button
              onClick={fetchUserLogs}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center my-4">
              <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-md p-4 max-h-60 overflow-y-auto border border-gray-200">
              {logs.length > 0 ? (
                <ul className="space-y-2">
                  {logs.map((log, index) => (
                    <li key={index} className="text-sm text-gray-700 border-b border-gray-100 pb-2">{log}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">No activity logs found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

UserDashboard.propTypes = {
  username: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  token: PropTypes.string
};

export default UserDashboard; 