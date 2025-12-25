'use client';

import { useRouter } from 'next/navigation';
import CustomerForm from '@/components/customers/CustomerForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewCustomerPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/customers');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Customer</h1>
          <p className="text-muted-foreground mt-1">Create a new customer record</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Enter the details for the new customer</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}