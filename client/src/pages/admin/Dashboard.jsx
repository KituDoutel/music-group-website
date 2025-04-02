import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  StatCard, 
  LineChart, 
  RecentActivity 
} from '../../components/admin';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          axios.get('/api/admin/dashboard/stats'),
          axios.get('/api/admin/dashboard/chart-data')
        ]);
        
        setStats(statsRes.data);
        setChartData(chartRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={stats.total_users} 
          icon="👥" 
          trend="up"
        />
        <StatCard 
          title="Artists" 
          value={stats.total_artists} 
          icon="🎤" 
          trend="up"
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${(stats.total_revenue || 0).toLocaleString()}`} 
          icon="💰" 
          trend="neutral"
        />
        <StatCard 
          title="Active Subs" 
          value={stats.active_subscriptions} 
          icon="🔄" 
          trend="down"
        />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-4">Platform Growth (30 Days)</h3>
        <div className="h-80">
          <LineChart data={chartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentActivity />
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-blue-100 text-blue-800 p-3 rounded hover:bg-blue-200">
              Add New Track
            </button>
            <button className="w-full bg-green-100 text-green-800 p-3 rounded hover:bg-green-200">
              Create Promotion
            </button>
            <button className="w-full bg-purple-100 text-purple-800 p-3 rounded hover:bg-purple-200">
              Send Announcement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;