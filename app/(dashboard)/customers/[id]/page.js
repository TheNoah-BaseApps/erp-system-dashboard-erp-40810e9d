'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CustomerDetail from '@/components/customers/CustomerDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
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
import { toast } from 'sonner';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await fetch(`/api/customers/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Customer not found');
          }
          throw new Error('Failed to fetch customer');
        }

        const data = await response.json();
        if (data.success) {
          setCustomer(data.data);
        } else {
          throw new Error(data.error || 'Invalid response');
        }
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete customer');
      }

      toast.success('Customer deleted successfully');
      router.push('/customers');
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Customer Not Found</h1>
        </div>
        <Alert>
          <AlertDescription>The requested customer could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{customer?.customer_name}</h1>
            <p className="text-muted-foreground mt-1">Customer Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/customers/${params.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <CustomerDetail customer={customer} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}