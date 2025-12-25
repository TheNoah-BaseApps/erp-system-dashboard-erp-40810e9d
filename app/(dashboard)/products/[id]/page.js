'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';
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

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/products/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch product');
        }

        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
          setError(null);
        } else {
          throw new Error(data.error || 'Invalid response');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
        toast.error(`Failed to load product: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      toast.success('Product deleted successfully');
      router.push('/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(`Failed to delete product: ${err.message}`);
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
          <h1 className="text-3xl font-bold">Product Details</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Product Details</h1>
        </div>
        <Alert>
          <AlertDescription>Product not found</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/products')}>
          Back to Products
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
            <h1 className="text-3xl font-bold">{product?.product_name}</h1>
            <p className="text-muted-foreground mt-1">Product Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/products/${params.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <ProductDetail product={product} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product &quot;{product?.product_name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}