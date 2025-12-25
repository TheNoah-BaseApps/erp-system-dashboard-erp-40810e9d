'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import FormInput from '@/components/common/FormInput';
import FormSelect from '@/components/common/FormSelect';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductCostForm({ initialData, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: initialData?.product_id || '',
    month: initialData?.month || '',
    unit_cost: initialData?.unit_cost || '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.product_id) newErrors.product_id = 'Product is required';
    if (!formData.month) newErrors.month = 'Month is required';
    if (!formData.unit_cost || formData.unit_cost <= 0) {
      newErrors.unit_cost = 'Unit cost must be positive';
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
      const url = initialData ? `/api/product-costs/${initialData.id}` : '/api/product-costs';
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
        throw new Error(data.error || 'Failed to save cost entry');
      }

      toast.success(initialData ? 'Cost entry updated successfully' : 'Cost entry created successfully');
      onSuccess?.();
    } catch (err) {
      console.error('Error saving cost entry:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.product_code} - ${p.product_name}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSelect
        label="Product"
        id="product_id"
        options={productOptions}
        value={formData.product_id}
        onValueChange={(value) => handleChange('product_id', value)}
        placeholder="Select product"
        error={errors.product_id}
        required
        disabled={loading || loadingProducts || initialData}
      />

      <FormInput
        label="Month"
        id="month"
        type="month"
        value={formData.month}
        onChange={(e) => handleChange('month', e.target.value)}
        error={errors.month}
        required
        disabled={loading}
      />

      <FormInput
        label="Unit Cost"
        id="unit_cost"
        type="number"
        value={formData.unit_cost}
        onChange={(e) => handleChange('unit_cost', e.target.value)}
        error={errors.unit_cost}
        required
        disabled={loading}
        min="0"
        step="0.01"
      />

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading || loadingProducts} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Cost Entry' : 'Create Cost Entry'
          )}
        </Button>
      </div>
    </form>
  );
}