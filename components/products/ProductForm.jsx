'use client';

import { useState, useEffect } from 'react';
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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function ProductForm({ initialData, isEdit, onSuccess }) {
  const [formData, setFormData] = useState({
    product_name: '',
    product_code: '',
    description: '',
    product_category: '',
    quantity: '',
    critical_stock_level: '',
    unit_price: '',
    unit: '',
    brand: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        product_name: initialData.product_name || initialData.name || '',
        product_code: initialData.product_code || initialData.sku || '',
        description: initialData.description || '',
        product_category: initialData.product_category || initialData.category || '',
        quantity: initialData.quantity || initialData.stock_quantity || '',
        critical_stock_level: initialData.critical_stock_level || initialData.min_stock_level || initialData.reorder_level || '',
        unit_price: initialData.unit_price || '',
        unit: initialData.unit || '',
        brand: initialData.brand || initialData.supplier_name || '',
        status: initialData.status || 'active',
      });
    }
  }, [initialData, isEdit]);

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
    if (formData.unit_price && formData.unit_price < 0) {
      newErrors.unit_price = 'Unit price must be positive';
    }
    if (formData.quantity && formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be positive';
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
      const productId = initialData?.product_id || initialData?.id;
      const url = isEdit && productId ? `/api/products/${productId}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

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

      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
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
        label="Product Code / SKU"
        id="product_code"
        value={formData.product_code}
        onChange={(e) => handleChange('product_code', e.target.value)}
        error={errors.product_code}
        required
        disabled={loading}
      />

      <FormInput
        label="Description"
        id="description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        error={errors.description}
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

      <FormInput
        label="Quantity"
        id="quantity"
        type="number"
        value={formData.quantity}
        onChange={(e) => handleChange('quantity', e.target.value)}
        error={errors.quantity}
        disabled={loading}
        min="0"
        step="0.01"
      />

      <FormInput
        label="Critical Stock Level / Min Stock Level"
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
        label="Unit Price"
        id="unit_price"
        type="number"
        value={formData.unit_price}
        onChange={(e) => handleChange('unit_price', e.target.value)}
        error={errors.unit_price}
        disabled={loading}
        min="0"
        step="0.01"
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
        label="Brand"
        id="brand"
        value={formData.brand}
        onChange={(e) => handleChange('brand', e.target.value)}
        error={errors.brand}
        required
        disabled={loading}
      />

      <FormSelect
        label="Status"
        id="status"
        options={STATUS_OPTIONS}
        value={formData.status}
        onValueChange={(value) => handleChange('status', value)}
        placeholder="Select status"
        error={errors.status}
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
            isEdit ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  );
}