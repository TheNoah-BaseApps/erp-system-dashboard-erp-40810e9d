'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerForm from '@/components/customers/CustomerForm';
import { toast } from 'sonner';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/customers/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }

      const data = await response.json();
      if (data.success) {
        setCustomer(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch customer');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to load customer');
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success('Customer updated successfully');
    router.push('/customers');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/customers')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Customer</h1>
          <p className="text-sm text-muted-foreground">
            Update customer information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
            initialData={customer}
            onSuccess={handleSuccess}
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}