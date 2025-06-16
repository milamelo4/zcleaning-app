CREATE TABLE IF NOT EXISTS zcleaning.employee (
  employee_id SERIAL PRIMARY KEY,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  phone_number VARCHAR(15) NOT NULL CHECK (phone_number ~ '^[0-9]{10}$'),
  hire_date DATE,
  hourly_pay_rate NUMERIC(10,2) NOT NULL,
  employment_status VARCHAR(10) NOT NULL CHECK (employment_status IN ('full_time', 'part_time')),
  is_active BOOLEAN DEFAULT true,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
