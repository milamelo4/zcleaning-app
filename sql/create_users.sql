-- Create users table for ZCleaning App

CREATE TABLE users (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50) NOT NULL,
  account_lastname VARCHAR(50) NOT NULL,
  account_email VARCHAR(100) UNIQUE NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (
    account_type IN ('admin', 'client', 'employee', 'supervisor', 'unauthorized')
  )
);

