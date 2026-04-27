exports.tablesToCreate = [
	`CREATE TABLE roles (
        role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title VARCHAR(32) NOT NULL
    );`,

	`CREATE TABLE jobs (
        job_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title VARCHAR(128) NOT NULL
    );`,

	`CREATE TABLE addresses (
        address_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        country VARCHAR(64),
        city VARCHAR(64),
        street VARCHAR(64),
        building VARCHAR(64),
        floor INTEGER,
        apartment VARCHAR(64)
    );`,

	`CREATE TABLE users (
        user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        first_name VARCHAR(32),
        last_name VARCHAR(32),
        username VARCHAR(128) UNIQUE NOT NULL,
        role_id INTEGER,
        job_id INTEGER,
        address_id INTEGER,
        hourly_rate NUMERIC(10,2),
        FOREIGN KEY (role_id) REFERENCES roles(role_id),
        FOREIGN KEY (job_id) REFERENCES jobs(job_id),
        FOREIGN KEY (address_id) REFERENCES addresses(address_id)
    );`,

	`CREATE TABLE credentials (
        credentials_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INTEGER NOT NULL,
        email VARCHAR(128) UNIQUE NOT NULL,
        password VARCHAR(64) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );`,

	`CREATE TABLE bookings (
        booking_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        client_id INTEGER NOT NULL,
        worker_id INTEGER NOT NULL,
        address_id INTEGER,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (worker_id) REFERENCES users(user_id) ON DELETE CASCADE
    );`,

	`CREATE TABLE tokens (
        token_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expiry_date DATE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );`
];