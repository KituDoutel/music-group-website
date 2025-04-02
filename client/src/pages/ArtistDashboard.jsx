import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ArtistDashboard = () => {
  const [stats, setStats] = useState(null);
  const [streamData, setStreamData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, streamsRes] = await Promise.all([
          axios.get('/api/artist/stats'),
          axios.get('/api/artist/streams-by-day')
        ]);
        
        setStats(statsRes.data);
        setStreamData(streamsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Tracks" 
          value={stats.total_tracks} 
          icon="🎵" 
        />
        <StatCard 
          title="Total Streams" 
          value={stats.total_streams} 
          icon="▶️" 
        />
        <StatCard 
          title="Unique Listeners" 
          value={stats.unique_listeners} 
          icon="👥" 
        />
        <StatCard 
          title="Total Earnings" 
          value={`$${stats.total_earnings?.toFixed(2) || '0.00'}`} 
          icon="💰" 
        />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-4">Streams Last 30 Days</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={streamData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="streams" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TrackTable artistId={user.id} />
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded shadow flex items-center space-x-4">
    <span className="text-2xl">{icon}</span>
    <div>
      <h4 className="text-gray-500">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);