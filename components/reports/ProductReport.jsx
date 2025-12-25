'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import ExportButton from '@/components/reports/ExportButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ProductReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/reports/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product report');
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
      header: 'Code',
    },
    {
      accessorKey: 'product_name',
      header: 'Name',
    },
    {
      accessorKey: 'product_category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.product_category}</Badge>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
    },
    {
      accessorKey: 'critical_stock_level',
      header: 'Critical Stock',
      cell: ({ row }) => row.original.critical_stock_level?.toLocaleString(),
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
            <CardTitle>Product Catalog Report</CardTitle>
            <CardDescription>Complete list of all products</CardDescription>
          </div>
          <ExportButton data={data} filename="product_report" />
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}