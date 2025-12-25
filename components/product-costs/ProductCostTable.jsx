'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductCostTable() {
  const router = useRouter();
  const [costs, setCosts] = useState([]);
  const [filteredCosts, setFilteredCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costToDelete, setCostToDelete] = useState(null);

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

  const handleDelete = async () => {
    if (!costToDelete) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/product-costs/${costToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Cost record deleted');
        fetchCosts();
      } else {
        toast.error('Failed to delete');
      }
    } catch (err) {
      console.error('Error deleting cost:', err);
      toast.error('Failed to delete');
    } finally {
      setDeleteDialogOpen(false);
      setCostToDelete(null);
    }
  };

  const openDeleteDialog = (costId, e) => {
    e.stopPropagation();
    setCostToDelete(costId);
    setDeleteDialogOpen(true);
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
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => openDeleteDialog(row.original.id, e)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
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
        onRowClick={(row) => router.push(`/product-costs/${row.id}/edit`)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cost record?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}