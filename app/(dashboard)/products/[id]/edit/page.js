'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductForm from '@/components/products/ProductForm';
import { toast } from 'sonner';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/products/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success('Product updated successfully');
    router.push('/products');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/products')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            Update product information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            initialData={product}
            onSuccess={handleSuccess}
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}