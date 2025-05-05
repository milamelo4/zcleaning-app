CREATE TABLE IF NOT EXISTS public.clients (
  client_id SERIAL PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  hired_date DATE,
  service_hours NUMERIC(5,2),
  preferred_day VARCHAR(6) NOT NULL CHECK (
    preferred_day IN ('M', 'TUE', 'W', 'TH', 'F', 'NOTSET')
  ),
  service_type_id INTEGER,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active VARCHAR(8) DEFAULT 'active' CHECK (
    is_active IN ('active', 'inactive')
  )
);

-- Create Service Types
CREATE TABLE IF NOT EXISTS public.service_type (
  service_id SERIAL PRIMARY KEY,
  service_frequency VARCHAR(50)
);

INSERT INTO service_type (service_frequency)
VALUES 
  ('once_a_week'),
  ('every_other_week'),
  ('once_a_month'),
  ('upon_request');
