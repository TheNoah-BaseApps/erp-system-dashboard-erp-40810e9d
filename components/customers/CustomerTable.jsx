'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import { Badge } from '@/components/ui/badge';
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

export default function CustomerTable({ onCustomersChange }) {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(customer =>
        customer.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.customer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.sales_rep?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      if (data.success) {
        setCustomers(data.data || []);
        setFilteredCustomers(data.data || []);
      } else {
        throw new Error(data.error || 'Invalid response');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (customer, e) => {
    e.stopPropagation();
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Customer deleted successfully');
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
        if (onCustomersChange) {
          onCustomersChange();
        } else {
          fetchCustomers();
        }
      } else {
        throw new Error(data.error || 'Failed to delete customer');
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error(err.message || 'Failed to delete customer');
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
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleDeleteClick(row.original, e)}
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
        placeholder="Search customers by name, code, or sales rep..."
      />
      <DataTable
        columns={columns}
        data={filteredCustomers}
        onRowClick={(row) => router.push(`/customers/${row.id}/edit`)}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer &quot;{customerToDelete?.customer_name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCustomerToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}