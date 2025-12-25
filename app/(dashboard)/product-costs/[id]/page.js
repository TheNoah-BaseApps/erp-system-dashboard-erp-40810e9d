'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductCostForm from '@/components/product-costs/ProductCostForm';
import CostHistoryChart from '@/components/product-costs/CostHistoryChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';
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

export default function ProductCostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [cost, setCost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCost = async () => {
      if (!params.id) {
        setError('Cost ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await fetch(`/api/product-costs/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setCost(data.data);
        } else {
          throw new Error(data.error || 'Failed to load cost entry');
        }
      } catch (err) {
        console.error('Error fetching cost:', err);
        setError(err.message || 'Failed to load cost entry');
        toast.error(err.message || 'Failed to load cost entry');
      } finally {
        setLoading(false);
      }
    };

    fetchCost();
  }, [params.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/product-costs/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete cost entry');
      }

      toast.success('Cost entry deleted successfully');
      router.push('/product-costs');
    } catch (err) {
      console.error('Error deleting cost:', err);
      toast.error(err.message || 'Failed to delete cost entry');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSuccess = () => {
    toast.success('Cost entry updated successfully');
    router.push('/product-costs');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
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
          <div>
            <h1 className="text-3xl font-bold">Edit Cost Entry</h1>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!cost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Cost Entry</h1>
          </div>
        </div>
        <Alert>
          <AlertDescription>Cost entry not found</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
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
            <h1 className="text-3xl font-bold">Edit Cost Entry</h1>
            <p className="text-muted-foreground mt-1">Update product cost information</p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Information</CardTitle>
          <CardDescription>Update the cost entry details</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductCostForm initialData={cost} isEdit={true} onSuccess={handleSuccess} />
        </CardContent>
      </Card>

      {cost?.product_id && <CostHistoryChart productId={cost.product_id} />}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the cost entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}