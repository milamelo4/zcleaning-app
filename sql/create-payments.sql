CREATE TABLE IF NOT EXISTS public.client_payment (
  payment_id SERIAL PRIMARY KEY,
  client_id integer NOT NULL,
  payment_type text COLLATE pg_catalog."default",
  payment_schedule text COLLATE pg_catalog."default",
  due_date date NOT NULL,
  received_date date,
  expected_received_date date,
  CONSTRAINT client_payment_client_id_fkey FOREIGN KEY (client_id)
      REFERENCES public.clients (client_id) ON DELETE CASCADE,
  CONSTRAINT client_payment_payment_schedule_check CHECK (
      payment_schedule = ANY (ARRAY['per_service'::text, 'monthly'::text])
  ),
  CONSTRAINT client_payment_payment_type_check CHECK (
      payment_type = ANY (ARRAY['cash'::text, 'check'::text, 'venmo'::text])
  )
);
