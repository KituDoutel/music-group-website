import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  RevenueChart, 
  PayoutsTable,
  TimeRangeSelector 
} from '../../components/admin/Finance';

const FinancePage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [timeRange, setTimeRange] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueRes, payoutsRes] = await Promise.all([
          axios.get('/api/admin/finance/revenue', { params: { period: timeRange } }),
          axios.get('/api/admin/finance/payouts')
        ]);
        setRevenueData(revenueRes.data);
        setPayouts(payoutsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const processPayout = async (payoutId) => {
    try {
      await axios.post(`/api/admin/finance/payouts/${payoutId}/process`, {
        adminId: 1 // Replace with actual admin ID
      });
      // Refresh data
      const res = await axios.get('/api/admin/finance/payouts');
      setPayouts(res.data);
    } catch (err) {
      console.error('Failed to process payout:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <TimeRangeSelector 
          value={timeRange}
          onChange={setTimeRange}
        />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <RevenueChart 
          data={revenueData} 
          period={timeRange}
          loading={loading}
        />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-4">Pending Payouts</h3>
        <PayoutsTable 
          data={payouts.filter(p => p.status === 'pending')} 
          onProcess={processPayout}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default FinancePage;