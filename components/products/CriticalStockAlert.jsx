'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CriticalStockAlert() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCriticalStock = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/products/critical-stock', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch critical stock products');
        }

        const data = await response.json();
        if (data.success) {
          setProducts(data.data || []);
        } else {
          throw new Error(data.error || 'Invalid response');
        }
      } catch (err) {
        console.error('Error fetching critical stock:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCriticalStock();
  }, []);

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
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Critical Stock Alert
        </CardTitle>
        <CardDescription>Products at or below critical stock level</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products at critical stock level</p>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div>
                  <p className="font-medium">{product.product_name}</p>
                  <p className="text-sm text-muted-foreground">{product.product_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
                    Critical: {product.critical_stock_level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}