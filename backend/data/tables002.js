exports.tablesToCreate = [
    `CREATE TABLE addresses (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        country VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        street VARCHAR(100) NOT NULL,
        building VARCHAR(100),
        floor INTEGER,
        apartment VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`,
  
    `CREATE TABLE users (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        pass VARCHAR(255) NOT NULL,
        name VARCHAR(120),
        role VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        addr_id INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (addr_id) REFERENCES addresses(id)
    );`,
  
    `CREATE TABLE sessions (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`,
  
    `CREATE TABLE providers (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        approved VARCHAR(20) NOT NULL DEFAULT 'pending',
        bio VARCHAR(1000),
        addr_id INTEGER NOT NULL,
        rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
        rating_count INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (addr_id) REFERENCES addresses(id)
    );`,
  
    `CREATE TABLE services (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR(120) NOT NULL
    );`,
  
    `CREATE TABLE offerings (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        provider_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        title VARCHAR(150),
        rate NUMERIC(10,2) NOT NULL,
        curr VARCHAR(3) NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id)
    );`,
  
    `CREATE TABLE carts (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`,
  
    `CREATE TABLE orders (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id INTEGER NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
        total NUMERIC(12,2) NOT NULL DEFAULT 0,
        curr VARCHAR(3) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`,
  
    `CREATE TABLE cart_items (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        cart_id INTEGER NOT NULL,
        offering_id INTEGER NOT NULL,
        start_at TIMESTAMPTZ NOT NULL,
        end_at TIMESTAMPTZ NOT NULL,
        hours NUMERIC(6,2) NOT NULL,
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (offering_id) REFERENCES offerings(id)
    );`,
  
    `CREATE TABLE order_items (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        order_id INTEGER NOT NULL,
        offering_id INTEGER NOT NULL,
        start_at TIMESTAMPTZ NOT NULL,
        end_at TIMESTAMPTZ NOT NULL,
        hours NUMERIC(6,2) NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        total NUMERIC(12,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (offering_id) REFERENCES offerings(id)
    );`,
  
    `CREATE TABLE bookings (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        order_item_id INTEGER UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        addr_id INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'requested',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (addr_id) REFERENCES addresses(id)
    );`,

    `CREATE TABLE time_slots (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        provider_id INTEGER NOT NULL,
        start_at TIMESTAMPTZ NOT NULL,
        end_at TIMESTAMPTZ NOT NULL,
        booking_id INTEGER,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );`,
  
    `CREATE TABLE payments (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        order_id INTEGER NOT NULL,
        method VARCHAR(20) NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        amount NUMERIC(12,2) NOT NULL,
        curr VARCHAR(3) NOT NULL,
        ref VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );`,
  
    `CREATE TABLE reviews (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        booking_id INTEGER UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        note VARCHAR(1000),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`
  ];  
  