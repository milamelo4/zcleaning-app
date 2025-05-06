CREATE TABLE IF NOT EXISTS address (
    address_id SERIAL PRIMARY KEY,
    street VARCHAR(120),
    city VARCHAR(45),
    zip VARCHAR(10),
    garage_code VARCHAR(20),
    client_id INTEGER REFERENCES clients(client_id) ON UPDATE CASCADE ON DELETE RESTRICT
);
