import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import './Logs.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    interfaceName: '',
    integrationKey: '',
    status: '',
    severity: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    interfaceNames: [],
    integrationKeys: [],
    statuses: [],
    severities: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalPages: 1,
    totalCount: 0
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const statusColors = {
    success: '#10b981',
    failed: '#ef4444',
    warning: '#f59e0b',
    running: '#3b82f6'
  };

  const severityColors = {
    low: '#6b7280',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444'
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logs/filters/values`);
      const data = await response.json();
      setFilterOptions(data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const response = await fetch(`${API_BASE_URL}/logs?${params}`);
      const data = await response.json();

      setLogs(data.logs);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages,
        totalCount: data.totalCount
      }));
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      interfaceName: '',
      integrationKey: '',
      status: '',
      severity: '',
      search: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status) => (
    <span 
      className={`status-badge status-${status}`}
      style={{ backgroundColor: `${statusColors[status]}20`, color: statusColors[status] }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const getSeverityBadge = (severity) => (
    <span 
      className={`severity-badge severity-${severity}`}
      style={{ backgroundColor: `${severityColors[severity]}20`, color: severityColors[severity] }}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );

  return (
    <div className="logs-page">
      <div className="logs-header">
        <h2>Interface Logs</h2>
        <button className="refresh-btn" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      <div className="filters-section">
        <div className="basic-filters">
          <div className="filter-group">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search logs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
          </div>

          <select
            value={filters.interfaceName}
            onChange={(e) => handleFilterChange('interfaceName', e.target.value)}
            className="filter-select"
          >
            <option value="">All Interfaces</option>
            {filterOptions.interfaceNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {filterOptions.statuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>

          <button
            className={`advanced-filter-btn ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter size={16} />
            Advanced Filters
          </button>

          <button className="reset-btn" onClick={resetFilters}>
            Reset
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="filter-row">
              <select
                value={filters.integrationKey}
                onChange={(e) => handleFilterChange('integrationKey', e.target.value)}
                className="filter-select"
              >
                <option value="">All Integration Keys</option>
                {filterOptions.integrationKeys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>

              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="filter-select"
              >
                <option value="">All Severities</option>
                {filterOptions.severities.map(severity => (
                  <option key={severity} value={severity}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</option>
                ))}
              </select>

              <div className="date-filters">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="filter-input"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="filter-input"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pagination-info">
        <p>
          Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} logs
        </p>
      </div>

      <div className="logs-table-container">
        {loading ? (
          <div className="loading">Loading logs...</div>
        ) : (
          <>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Interface Name</th>
                  <th>Integration Key</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Records</th>
                  <th>Duration</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td className="interface-name">{log.interfaceName}</td>
                    <td className="integration-key">{log.integrationKey}</td>
                    <td>{getStatusBadge(log.status)}</td>
                    <td>{getSeverityBadge(log.severity)}</td>
                    <td className="message">{log.message}</td>
                    <td className="records">{log.recordsProcessed}</td>
                    <td className="duration">{log.formattedDuration || `${log.duration}ms`}</td>
                    <td className="timestamp">
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="pagination-btn"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;