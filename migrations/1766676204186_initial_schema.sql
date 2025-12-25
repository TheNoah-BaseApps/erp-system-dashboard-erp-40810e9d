CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  password text NOT NULL,
  role text DEFAULT 'Viewer' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  product_name text NOT NULL,
  product_code text NOT NULL UNIQUE,
  product_category text,
  unit text,
  critical_stock_level numeric,
  brand text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_code ON products (product_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (product_category);

CREATE TABLE IF NOT EXISTS product_costs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  product_id uuid NOT NULL,
  month date NOT NULL,
  unit_cost numeric NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_product_costs_product_id ON product_costs (product_id);
CREATE INDEX IF NOT EXISTS idx_product_costs_month ON product_costs (month);
CREATE INDEX IF NOT EXISTS idx_product_costs_product_month ON product_costs (product_id, month);

CREATE TABLE IF NOT EXISTS customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  customer_name text NOT NULL,
  customer_code text NOT NULL UNIQUE,
  address text,
  city_or_district text,
  sales_rep text,
  country text,
  region_or_state text,
  telephone_number text,
  email text,
  contact_person text,
  payment_terms_limit integer,
  balance_risk_limit numeric,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers (customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_sales_rep ON customers (sales_rep);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);