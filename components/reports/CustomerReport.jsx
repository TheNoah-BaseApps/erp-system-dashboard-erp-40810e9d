'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import ExportButton from '@/components/reports/ExportButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function CustomerReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/reports/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer report');
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
      accessorKey: 'customer_code',
      header: 'Code',
    },
    {
      accessorKey: 'customer_name',
      header: 'Name',
    },
    {
      accessorKey: 'sales_rep',
      header: 'Sales Rep',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.sales_rep || 'N/A'}</Badge>
      ),
    },
    {
      accessorKey: 'city_or_district',
      header: 'City',
    },
    {
      accessorKey: 'country',
      header: 'Country',
    },
    {
      accessorKey: 'payment_terms_limit',
      header: 'Payment Terms',
      cell: ({ row }) => `${row.original.payment_terms_limit} days`,
    },
    {
      accessorKey: 'balance_risk_limit',
      header: 'Risk Limit',
      cell: ({ row }) => `$${parseFloat(row.original.balance_risk_limit).toLocaleString()}`,
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
            <CardTitle>Customer Analysis Report</CardTitle>
            <CardDescription>Complete customer database</CardDescription>
          </div>
          <ExportButton data={data} filename="customer_report" />
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}