'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import ExportButton from '@/components/reports/ExportButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function CostReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/reports/costs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cost report');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data || []);
      } else {
        throw new Error(result.error || 'Invalid response');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'product_code',
      header: 'Product Code',
    },
    {
      accessorKey: 'product_name',
      header: 'Product Name',
    },
    {
      accessorKey: 'month',
      header: 'Month',
      cell: ({ row }) => new Date(row.original.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    },
    {
      accessorKey: 'unit_cost',
      header: 'Unit Cost',
      cell: ({ row }) => `$${parseFloat(row.original.unit_cost).toFixed(2)}`,
    },
  ];

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cost Analysis Report</CardTitle>
            <CardDescription>Historical product cost data</CardDescription>
          </div>
          <ExportButton data={data} filename="cost_analysis_report" />
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}