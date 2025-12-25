'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function RiskAnalysisWidget() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiskAnalysis = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/customers/risk-analysis', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch risk analysis');
        }

        const data = await response.json();
        if (data.success) {
          setCustomers(data.data || []);
        } else {
          throw new Error(data.error || 'Invalid response');
        }
      } catch (err) {
        console.error('Error fetching risk analysis:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskAnalysis();
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
          <TrendingUp className="h-5 w-5 text-yellow-500" />
          Risk Analysis
        </CardTitle>
        <CardDescription>Customers approaching balance risk limit</CardDescription>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No customers at risk</p>
        ) : (
          <div className="space-y-2">
            {customers.slice(0, 5).map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/customers/${customer.id}`)}
              >
                <div>
                  <p className="font-medium">{customer.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{customer.customer_code}</p>
                </div>
                <div className="text-right">
                  <Badge variant="warning">
                    Limit: ${parseFloat(customer.balance_risk_limit).toLocaleString()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}