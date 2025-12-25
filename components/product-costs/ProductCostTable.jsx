'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductCostTable() {
  const router = useRouter();
  const [costs, setCosts] = useState([]);
  const [filteredCosts, setFilteredCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCosts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = costs.filter(cost =>
        cost.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cost.product_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCosts(filtered);
    } else {
      setFilteredCosts(costs);
    }
  }, [searchQuery, costs]);

  const fetchCosts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/product-costs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product costs');
      }

      const data = await response.json();
      if (data.success) {
        setCosts(data.data || []);
        setFilteredCosts(data.data || []);
      } else {
        throw new Error(data.error || 'Invalid response');
      }
    } catch (err) {
      console.error('Error fetching costs:', err);
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by product name or code..."
      />
      <DataTable
        columns={columns}
        data={filteredCosts}
        onRowClick={(row) => router.push(`/product-costs/${row.id}`)}
      />
    </div>
  );
}