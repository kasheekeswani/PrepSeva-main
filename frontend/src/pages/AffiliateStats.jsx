import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, MousePointer, ShoppingCart, DollarSign, Target, Download
} from 'lucide-react';

const AffiliateStats = () => {
  const [stats, setStats] = useState({ overview: {}, clicksData: [], revenueData: [], timeData: [], deviceData: [], topLinks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  const dateRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/affiliate-links/analytics?period=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return '$' + (amount || 0).toFixed(2);
  };

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Clicks', stats.overview.totalClicks || 0],
      ['Total Conversions', stats.overview.totalConversions || 0],
      ['Total Revenue', stats.overview.totalRevenue || 0],
      ['Conversion Rate', `${stats.overview.conversionRate || 0}%`]
    ];
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affiliate-stats-${dateRange}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, change, Icon, color }) => (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: '1', minWidth: '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#555' }}>{title}</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>{value}</div>
          {change !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px', color: change >= 0 ? 'green' : 'red' }}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span style={{ marginLeft: '4px', fontSize: '12px' }}>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <Icon size={28} color={color} />
      </div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red', padding: '40px' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Affiliate Analytics</h2>
        <div>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ padding: '8px', marginRight: '10px' }}>
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button onClick={exportData} style={{ padding: '8px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
            <Download size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Export
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <StatCard
          title="Total Clicks"
          value={formatNumber(stats.overview.totalClicks || 0)}
          change={getPercentageChange(stats.overview.totalClicks, stats.overview.previousClicks)}
          Icon={MousePointer}
          color="blue"
        />
        <StatCard
          title="Conversions"
          value={formatNumber(stats.overview.totalConversions || 0)}
          change={getPercentageChange(stats.overview.totalConversions, stats.overview.previousConversions)}
          Icon={ShoppingCart}
          color="green"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.overview.totalRevenue || 0)}
          change={getPercentageChange(stats.overview.totalRevenue, stats.overview.previousRevenue)}
          Icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Conversion Rate"
          value={`${(stats.overview.conversionRate || 0).toFixed(2)}%`}
          change={getPercentageChange(stats.overview.conversionRate, stats.overview.previousConversionRate)}
          Icon={Target}
          color="orange"
        />
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3>Click & Conversion Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.clicksData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="clicks" stroke="#007bff" strokeWidth={2} />
            <Line type="monotone" dataKey="conversions" stroke="#28a745" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Revenue Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stats.revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#6f42c1" fill="#6f42c1" fillOpacity={0.4} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AffiliateStats;
