CREATE TABLE IF NOT EXISTS public.appointments (
  appointment_id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  appointment_date DATE NOT NULL,
  service_type_id INTEGER NOT NULL,
  duration_hours NUMERIC(4,2),
  price NUMERIC(7,2),
  notes TEXT,
  CONSTRAINT fk_client
    FOREIGN KEY (client_id) REFERENCES public.clients(client_id) ON DELETE CASCADE,
  CONSTRAINT fk_service_type
    FOREIGN KEY (service_type_id) REFERENCES public.service_type(service_id) ON DELETE RESTRICT
);
