'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FormInput from '@/components/common/FormInput';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerForm({ initialData, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_name: initialData?.customer_name || '',
    customer_code: initialData?.customer_code || '',
    address: initialData?.address || '',
    city_or_district: initialData?.city_or_district || '',
    sales_rep: initialData?.sales_rep || '',
    country: initialData?.country || '',
    region_or_state: initialData?.region_or_state || '',
    telephone_number: initialData?.telephone_number || '',
    email: initialData?.email || '',
    contact_person: initialData?.contact_person || '',
    payment_terms_limit: initialData?.payment_terms_limit || '',
    balance_risk_limit: initialData?.balance_risk_limit || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customer_name) newErrors.customer_name = 'Customer name is required';
    if (!formData.customer_code) newErrors.customer_code = 'Customer code is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.payment_terms_limit || formData.payment_terms_limit <= 0) {
      newErrors.payment_terms_limit = 'Payment terms limit must be positive';
    }
    if (!formData.balance_risk_limit || formData.balance_risk_limit <= 0) {
      newErrors.balance_risk_limit = 'Balance risk limit must be positive';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const url = initialData ? `/api/customers/${initialData.id}` : '/api/customers';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save customer');
      }

      toast.success(initialData ? 'Customer updated successfully' : 'Customer created successfully');
      onSuccess?.();
    } catch (err) {
      console.error('Error saving customer:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Customer Name"
          id="customer_name"
          value={formData.customer_name}
          onChange={(e) => handleChange('customer_name', e.target.value)}
          error={errors.customer_name}
          required
          disabled={loading}
        />

        <FormInput
          label="Customer Code"
          id="customer_code"
          value={formData.customer_code}
          onChange={(e) => handleChange('customer_code', e.target.value)}
          error={errors.customer_code}
          required
          disabled={loading}
        />

        <FormInput
          label="Email"
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
          disabled={loading}
        />

        <FormInput
          label="Contact Person"
          id="contact_person"
          value={formData.contact_person}
          onChange={(e) => handleChange('contact_person', e.target.value)}
          error={errors.contact_person}
          disabled={loading}
        />

        <FormInput
          label="Telephone Number"
          id="telephone_number"
          value={formData.telephone_number}
          onChange={(e) => handleChange('telephone_number', e.target.value)}
          error={errors.telephone_number}
          disabled={loading}
        />

        <FormInput
          label="Sales Representative"
          id="sales_rep"
          value={formData.sales_rep}
          onChange={(e) => handleChange('sales_rep', e.target.value)}
          error={errors.sales_rep}
          disabled={loading}
        />

        <FormInput
          label="Address"
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          error={errors.address}
          disabled={loading}
        />

        <FormInput
          label="City/District"
          id="city_or_district"
          value={formData.city_or_district}
          onChange={(e) => handleChange('city_or_district', e.target.value)}
          error={errors.city_or_district}
          disabled={loading}
        />

        <FormInput
          label="Region/State"
          id="region_or_state"
          value={formData.region_or_state}
          onChange={(e) => handleChange('region_or_state', e.target.value)}
          error={errors.region_or_state}
          disabled={loading}
        />

        <FormInput
          label="Country"
          id="country"
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          error={errors.country}
          disabled={loading}
        />

        <FormInput
          label="Payment Terms Limit (days)"
          id="payment_terms_limit"
          type="number"
          value={formData.payment_terms_limit}
          onChange={(e) => handleChange('payment_terms_limit', e.target.value)}
          error={errors.payment_terms_limit}
          required
          disabled={loading}
          min="0"
        />

        <FormInput
          label="Balance Risk Limit"
          id="balance_risk_limit"
          type="number"
          value={formData.balance_risk_limit}
          onChange={(e) => handleChange('balance_risk_limit', e.target.value)}
          error={errors.balance_risk_limit}
          required
          disabled={loading}
          min="0"
          step="0.01"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Customer' : 'Create Customer'
          )}
        </Button>
      </div>
    </form>
  );
}