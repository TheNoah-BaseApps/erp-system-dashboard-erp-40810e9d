'use client';

import { useRouter } from 'next/navigation';
import ProductCostForm from '@/components/product-costs/ProductCostForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewProductCostPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/product-costs');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Cost Entry</h1>
          <p className="text-muted-foreground mt-1">Record a new product cost for a specific month</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Information</CardTitle>
          <CardDescription>Enter the product cost details</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductCostForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}