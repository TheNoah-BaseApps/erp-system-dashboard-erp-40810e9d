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
    product_id: '',
    effective_date: '',
    cost_amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errors, setErrors] = useState({});
  const isEdit = !!initialData;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        product_id: initialData.product_id?.toString() || '',
        effective_date: initialData.effective_date || '',
        cost_amount: initialData.cost_amount?.toString() || '',
      });
    }
  }, [initialData]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch products:', errorData);
        throw new Error(errorData.error || 'Failed to fetch products');
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error(err.message || 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    } else if (!isValidUUID(formData.product_id)) {
      newErrors.product_id = 'Invalid product selection';
    }
    
    if (!formData.effective_date) {
      newErrors.effective_date = 'Effective date is required';
    } else if (!isValidDate(formData.effective_date)) {
      newErrors.effective_date = 'Invalid date format';
    }
    
    if (!formData.cost_amount) {
      newErrors.cost_amount = 'Cost amount is required';
    } else {
      const costNum = parseFloat(formData.cost_amount);
      if (isNaN(costNum)) {
        newErrors.cost_amount = 'Cost amount must be a valid number';
      } else if (costNum <= 0) {
        newErrors.cost_amount = 'Cost amount must be positive';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach(error => {
        toast.error(error);
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const url = isEdit ? `/api/product-costs/${initialData.id}` : '/api/product-costs';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        product_id: formData.product_id,
        effective_date: formData.effective_date,
        cost_amount: parseFloat(formData.cost_amount),
      };

      console.log('Submitting product cost data:', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(data.error || data.message || 'Failed to save cost entry');
      }

      console.log('Product cost saved successfully:', data);
      toast.success(isEdit ? 'Cost entry updated successfully' : 'Cost entry created successfully');
      onSuccess?.();
    } catch (err) {
      console.error('Error saving cost entry:', err);
      toast.error(err.message || 'An error occurred while saving the cost entry');
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
        disabled={loading || loadingProducts || isEdit}
      />

      <FormInput
        label="Effective Date"
        id="effective_date"
        type="date"
        value={formData.effective_date}
        onChange={(e) => handleChange('effective_date', e.target.value)}
        error={errors.effective_date}
        required
        disabled={loading}
      />

      <FormInput
        label="Cost Amount"
        id="cost_amount"
        type="number"
        value={formData.cost_amount}
        onChange={(e) => handleChange('cost_amount', e.target.value)}
        error={errors.cost_amount}
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
            isEdit ? 'Update Cost Entry' : 'Create Cost Entry'
          )}
        </Button>
      </div>
    </form>
  );
}