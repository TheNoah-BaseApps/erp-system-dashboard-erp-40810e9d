export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone) {
  // Basic validation - can be customized based on requirements
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 7;
}

export function validatePositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

export function validateRequiredFields(data, fields) {
  const errors = {};
  
  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

export function validateProductData(data) {
  const errors = {};

  if (!data.product_name?.trim()) {
    errors.product_name = 'Product name is required';
  }

  if (!data.product_code?.trim()) {
    errors.product_code = 'Product code is required';
  }

  if (!data.product_category?.trim()) {
    errors.product_category = 'Product category is required';
  }

  if (!data.unit?.trim()) {
    errors.unit = 'Unit is required';
  }

  if (!validatePositiveNumber(data.critical_stock_level)) {
    errors.critical_stock_level = 'Critical stock level must be a positive number';
  }

  if (!data.brand?.trim()) {
    errors.brand = 'Brand is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCustomerData(data) {
  const errors = {};

  if (!data.customer_name?.trim()) {
    errors.customer_name = 'Customer name is required';
  }

  if (!data.customer_code?.trim()) {
    errors.customer_code = 'Customer code is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.telephone_number && !validatePhoneNumber(data.telephone_number)) {
    errors.telephone_number = 'Invalid phone number format';
  }

  if (!validatePositiveNumber(data.payment_terms_limit)) {
    errors.payment_terms_limit = 'Payment terms limit must be a positive number';
  }

  if (!validatePositiveNumber(data.balance_risk_limit)) {
    errors.balance_risk_limit = 'Balance risk limit must be a positive number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}