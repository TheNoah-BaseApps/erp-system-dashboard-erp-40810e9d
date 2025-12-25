'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FormInput from '@/components/common/FormInput';
import FormSelect from '@/components/common/FormSelect';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Raw Materials', label: 'Raw Materials' },
  { value: 'Finished Goods', label: 'Finished Goods' },
];

const UNITS = [
  { value: 'PCS', label: 'Pieces (PCS)' },
  { value: 'KG', label: 'Kilograms (KG)' },
  { value: 'LTR', label: 'Liters (LTR)' },
  { value: 'MTR', label: 'Meters (MTR)' },
  { value: 'BOX', label: 'Box' },
];

export default function ProductForm({ initialData, onSuccess }) {
  const [formData, setFormData] = useState({
    product_name: initialData?.product_name || '',
    product_code: initialData?.product_code || '',
    product_category: initialData?.product_category || '',
    unit: initialData?.unit || '',
    critical_stock_level: initialData?.critical_stock_level || '',
    brand: initialData?.brand || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.product_name) newErrors.product_name = 'Product name is required';
    if (!formData.product_code) newErrors.product_code = 'Product code is required';
    if (!formData.product_category) newErrors.product_category = 'Category is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.critical_stock_level || formData.critical_stock_level <= 0) {
      newErrors.critical_stock_level = 'Critical stock level must be positive';
    }
    if (!formData.brand) newErrors.brand = 'Brand is required';
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
      const url = initialData ? `/api/products/${initialData.id}` : '/api/products';
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
        throw new Error(data.error || 'Failed to save product');
      }

      toast.success(initialData ? 'Product updated successfully' : 'Product created successfully');
      onSuccess?.();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Product Name"
        id="product_name"
        value={formData.product_name}
        onChange={(e) => handleChange('product_name', e.target.value)}
        error={errors.product_name}
        required
        disabled={loading}
      />

      <FormInput
        label="Product Code"
        id="product_code"
        value={formData.product_code}
        onChange={(e) => handleChange('product_code', e.target.value)}
        error={errors.product_code}
        required
        disabled={loading}
      />

      <FormSelect
        label="Category"
        id="product_category"
        options={CATEGORIES}
        value={formData.product_category}
        onValueChange={(value) => handleChange('product_category', value)}
        placeholder="Select category"
        error={errors.product_category}
        required
        disabled={loading}
      />

      <FormSelect
        label="Unit"
        id="unit"
        options={UNITS}
        value={formData.unit}
        onValueChange={(value) => handleChange('unit', value)}
        placeholder="Select unit"
        error={errors.unit}
        required
        disabled={loading}
      />

      <FormInput
        label="Critical Stock Level"
        id="critical_stock_level"
        type="number"
        value={formData.critical_stock_level}
        onChange={(e) => handleChange('critical_stock_level', e.target.value)}
        error={errors.critical_stock_level}
        required
        disabled={loading}
        min="0"
        step="0.01"
      />

      <FormInput
        label="Brand"
        id="brand"
        value={formData.brand}
        onChange={(e) => handleChange('brand', e.target.value)}
        error={errors.brand}
        required
        disabled={loading}
      />

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  );
}