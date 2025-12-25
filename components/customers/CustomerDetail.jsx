'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerDetail({ customer }) {
  if (!customer) return null;

  const details = [
    { label: 'Customer Code', value: customer.customer_code },
    { label: 'Customer Name', value: customer.customer_name },
    { label: 'Email', value: customer.email },
    { label: 'Contact Person', value: customer.contact_person },
    { label: 'Telephone', value: customer.telephone_number },
    { label: 'Sales Representative', value: customer.sales_rep },
    { label: 'Address', value: customer.address },
    { label: 'City/District', value: customer.city_or_district },
    { label: 'Region/State', value: customer.region_or_state },
    { label: 'Country', value: customer.country },
    { label: 'Payment Terms Limit', value: `${customer.payment_terms_limit} days` },
    { label: 'Balance Risk Limit', value: `$${parseFloat(customer.balance_risk_limit).toLocaleString()}` },
    { label: 'Created At', value: new Date(customer.created_at).toLocaleString() },
    { label: 'Updated At', value: new Date(customer.updated_at).toLocaleString() },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.map((detail) => (
            <div key={detail.label} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{detail.label}</p>
              <p className="text-base">{detail.value || 'N/A'}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}