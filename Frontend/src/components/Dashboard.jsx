import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import './Dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [period, setPeriod] = useState('24h');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const periods = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last Week' },
    { value: '30d', label: 'Last Month' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, trendsRes, interfacesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/summary?period=${period}`),
        fetch(`${API_BASE_URL}/dashboard/trends?period=${period}`),
        fetch(`${API_BASE_URL}/dashboard/interfaces?period=${period}`)
      ]);

      const summaryData = await summaryRes.json();
      const trendsData = await trendsRes.json();
      const interfacesData = await interfacesRes.json();

      setSummary(summaryData);
      setTrends(trendsData.trends);
      setInterfaces(interfacesData.interfaces);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    success: '#10b981',
    failed: '#ef4444',
    warning: '#f59e0b',
    running: '#3b82f6'
  };

  const getStatusColor = (status) => COLORS[status] || '#6b7280';

  const pieData = summary ? summary.summary.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: getStatusColor(item.status)
  })) : [];

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Interface Monitoring Dashboard</h2>
        <div className="period-selector">
          {periods.map(p => (
            <button
              key={p.value}
              className={`period-btn ${period === p.value ? 'active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="metric-content">
            <h3>Success Rate</h3>
            <p className="metric-value">{summary?.successRate || 0}%</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon total">
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Executions</h3>
            <p className="metric-value">{summary?.totalLogs || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon failed">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-content">
            <h3>Failed</h3>
            <p className="metric-value">
              {summary?.summary.find(s => s.status === 'failed')?.count || 0}
            </p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon running">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <h3>Running</h3>
            <p className="metric-value">
              {summary?.summary.find(s => s.status === 'running')?.count || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Execution Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="warning" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="interface-health">
        <h3>Interface Health Overview</h3>
        <div className="interface-grid">
          {interfaces.slice(0, 6).map(iface => (
            <div key={iface.interfaceName} className="interface-card">
              <h4>{iface.interfaceName}</h4>
              <div className="interface-stats">
                <div className="stat">
                  <span className="stat-label">Success Rate</span>
                  <span className={`stat-value ${iface.successRate >= 90 ? 'good' : iface.successRate >= 70 ? 'warning' : 'bad'}`}>
                    {iface.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Runs</span>
                  <span className="stat-value">{iface.totalRuns}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Last Run</span>
                  <span className="stat-value">
                    {format(new Date(iface.lastRun), 'MMM d, HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {summary?.recentFailures?.length > 0 && (
        <div className="recent-failures">
          <h3>Recent Failures</h3>
          <div className="failure-list">
            {summary.recentFailures.map((failure, index) => (
              <div key={index} className="failure-item">
                <div className="failure-header">
                  <span className="failure-name">{failure.interfaceName}</span>
                  <span className="failure-time">
                    {format(new Date(failure.timestamp), 'MMM d, HH:mm')}
                  </span>
                </div>
                <p className="failure-message">{failure.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;