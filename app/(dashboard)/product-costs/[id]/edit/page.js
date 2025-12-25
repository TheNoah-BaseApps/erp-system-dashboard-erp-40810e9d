'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductCostForm from '@/components/product-costs/ProductCostForm';
import { toast } from 'sonner';

export default function EditProductCostPage() {
  const router = useRouter();
  const params = useParams();
  const [productCost, setProductCost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductCost();
  }, [params.id]);

  const fetchProductCost = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/product-costs/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product cost');
      }

      const data = await response.json();
      if (data.success) {
        setProductCost(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch product cost');
      }
    } catch (error) {
      console.error('Error fetching product cost:', error);
      toast.error('Failed to load product cost');
      router.push('/product-costs');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success('Product cost updated successfully');
    router.push('/product-costs');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!productCost) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/product-costs')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Product Cost</h1>
          <p className="text-sm text-muted-foreground">
            Update product cost information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductCostForm
            initialData={productCost}
            onSuccess={handleSuccess}
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}