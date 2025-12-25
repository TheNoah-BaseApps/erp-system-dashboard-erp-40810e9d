'use client';

import { useState } from 'react';
import ProductReport from '@/components/reports/ProductReport';
import CostReport from '@/components/reports/CostReport';
import CustomerReport from '@/components/reports/CustomerReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">View and export comprehensive business reports</p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Product Report</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="customers">Customer Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          <ProductReport />
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-4">
          <CostReport />
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <CustomerReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}