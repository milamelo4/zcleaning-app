CREATE TABLE IF NOT EXISTS public.clients (
    client_id integer NOT NULL DEFAULT nextval('clients_client_id_seq'::regclass),
    first_name character varying(30) NOT NULL,
    last_name character varying(30) NOT NULL,
    phone_number character varying(15) NOT NULL,
    hired_date date,
    service_hours numeric(5,2),
    preferred_day character varying(6) NOT NULL,
    service_type_id integer,
    last_update timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    is_active_new boolean DEFAULT true,
    price numeric(7,2),
    full_house boolean,
    CONSTRAINT clients_pkey PRIMARY KEY (client_id),
    CONSTRAINT clients_preferred_day_check CHECK (
        preferred_day IN ('M', 'TUE', 'W', 'TH', 'F', 'NOTSET')
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
