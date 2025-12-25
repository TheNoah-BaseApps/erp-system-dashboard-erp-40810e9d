'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProductDetail({ product }) {
  if (!product) return null;

  const details = [
    { label: 'Product Code', value: product.product_code },
    { label: 'Product Name', value: product.product_name },
    { label: 'Category', value: product.product_category },
    { label: 'Brand', value: product.brand },
    { label: 'Unit', value: product.unit },
    { label: 'Critical Stock Level', value: product.critical_stock_level?.toLocaleString() },
    { label: 'Created At', value: new Date(product.created_at).toLocaleString() },
    { label: 'Updated At', value: new Date(product.updated_at).toLocaleString() },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.map((detail) => (
            <div key={detail.label} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{detail.label}</p>
              <p className="text-base">{detail.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}