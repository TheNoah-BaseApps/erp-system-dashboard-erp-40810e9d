'use client';

import { useEffect, useState } from 'react';
import ChartWidget from '@/components/common/ChartWidget';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CostHistoryChart({ productId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/product-costs/by-product/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cost history');
        }

        const result = await response.json();
        if (result.success) {
          const chartData = (result.data || []).map(item => ({
            month: new Date(item.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            cost: parseFloat(item.unit_cost),
          }));
          setData(chartData);
        } else {
          throw new Error(result.error || 'Invalid response');
        }
      } catch (err) {
        console.error('Error fetching cost history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchHistory();
    }
  }, [productId]);

  if (loading) {
    return <Skeleton className="h-[400px]" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ChartWidget
      title="Cost History"
      description="Historical unit cost by month"
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No cost history available
        </div>
      )}
    </ChartWidget>
  );
}