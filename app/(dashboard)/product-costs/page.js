'use client';

import { useState } from 'react';
import ProductCostTable from '@/components/product-costs/ProductCostTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductCostsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Costs</h1>
          <p className="text-muted-foreground mt-1">Track historical product costs by month</p>
        </div>
        <Button onClick={() => router.push('/product-costs/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Cost Entry
        </Button>
      </div>

      <ProductCostTable />
    </div>
  );
}