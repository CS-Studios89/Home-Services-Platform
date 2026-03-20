exports.dataToInsert = [
	// ---- ROLES ----
	`INSERT INTO roles (title) VALUES ('client');`,
	`INSERT INTO roles (title) VALUES ('worker');`,

	// ---- JOBS ----

	//Jobs are dynamically inserted on signup
	//Jobs are dynamically inserted on signup
	//Jobs are dynamically inserted on signup
	//Jobs are dynamically inserted on signup
	//Jobs are dynamically inserted on signup

	
	// `INSERT INTO jobs (title) VALUES ('Baby Sitter');`,
	// `INSERT INTO jobs (title) VALUES ('Cleaner');`,
	// `INSERT INTO jobs (title) VALUES ('Cook');`,
	// `INSERT INTO jobs (title) VALUES ('Electrician');`,

	// ---- ADDRESSES ----
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses

	// `INSERT INTO addresses (country, city, street, building, floor, apartment)
	//  VALUES ('Lebanon', 'Beirut', 'Hamra St', 'Building A', 3, '3B');`,

	// `INSERT INTO addresses (country, city, street, building, floor, apartment)
	//  VALUES ('Lebanon', 'Tripoli', 'Mina Rd', 'Building C', 1, '1A');`,

	// `INSERT INTO addresses (country, city, street, building, floor, apartment)
	//  VALUES ('Lebanon', 'Byblos', 'Old Souk', 'Building F', 2, '2C');`,

	// ---- USERS ----

	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses


	// role_id: 1=client, 2=worker | job_id only for workers

	// `INSERT INTO users (first_name, last_name, username, role_id, job_id, address_id, hourly_rate)
	//  VALUES ('Ali', 'Hassan', 'alih', 1, NULL, 1, NULL);`,

	// `INSERT INTO users (first_name, last_name, username, role_id, job_id, address_id, hourly_rate)
	//  VALUES ('Sara', 'Khalil', 'sarak', 1, NULL, 2, NULL);`,

	// `INSERT INTO users (first_name, last_name, username, role_id, job_id, address_id, hourly_rate)
	//  VALUES ('Omar', 'Nasser', 'omarn', 2, 1, 1, 8.50);`,   //-- Baby Sitter

	// `INSERT INTO users (first_name, last_name, username, role_id, job_id, address_id, hourly_rate)
	//  VALUES ('Lina', 'Saleh', 'linas', 2, 2, 3, 6.00);`,   //-- Cleaner

	// ---- CREDENTIALS ----

	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses
	//User are inserted in batch with POSTMAN along with their credntials and addresses

	// `INSERT INTO credentials (user_id, email, password)
	//  VALUES (1, 'ali@test.com', 'pass123');`,

	// `INSERT INTO credentials (user_id, email, password)
	//  VALUES (2, 'sara@test.com', 'pass123');`,

	// `INSERT INTO credentials (user_id, email, password)
	//  VALUES (3, 'omar@test.com', 'pass123');`,

	// `INSERT INTO credentials (user_id, email, password)
	//  VALUES (4, 'lina@test.com', 'pass123');`,

	// ---- BOOKINGS ----
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (7, 1, NULL, '2026-02-01 09:00:00', '2026-02-01 11:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (7, 2, NULL, '2026-02-03 14:00:00', '2026-02-03 16:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (7, 3, NULL, '2026-02-07 10:00:00', '2026-02-07 13:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (8, 1, NULL, '2026-02-02 08:30:00', '2026-02-02 10:30:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (8, 4, NULL, '2026-02-05 15:00:00', '2026-02-05 18:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (8, 5, NULL, '2026-02-09 09:00:00', '2026-02-09 12:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (9, 2, NULL, '2026-02-01 13:00:00', '2026-02-01 15:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (9, 3, NULL, '2026-02-04 09:00:00', '2026-02-04 11:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (9, 6, NULL, '2026-02-06 16:00:00', '2026-02-06 19:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (9, 1, NULL, '2026-02-10 08:00:00', '2026-02-10 10:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (10, 4, NULL, '2026-02-02 11:00:00', '2026-02-02 14:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (10, 5, NULL, '2026-02-06 09:30:00', '2026-02-06 11:30:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (10, 6, NULL, '2026-02-08 17:00:00', '2026-02-08 20:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (7, 1, NULL, '2026-02-12 09:00:00', '2026-02-12 17:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (8, 3, NULL, '2026-02-15 10:00:00', '2026-02-15 15:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (9, 2, NULL, '2026-02-18 08:00:00', '2026-02-18 12:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (10, 6, NULL, '2026-02-21 14:00:00', '2026-02-21 19:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (7, 1, NULL, '2026-02-25 08:00:00', '2026-02-25 10:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (8, 1, NULL, '2026-02-25 09:30:00', '2026-02-25 11:30:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (9, 1, NULL, '2026-02-25 12:00:00', '2026-02-25 14:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (10, 1, NULL, '2026-02-25 15:00:00', '2026-02-25 17:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (7, 5, NULL, '2026-03-01 09:00:00', '2026-03-01 10:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (8, 4, NULL, '2026-03-02 13:00:00', '2026-03-02 14:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (9, 6, NULL, '2026-03-03 16:00:00', '2026-03-03 17:00:00');`,
	
	`INSERT INTO bookings (client_id, worker_id, address_id, start_date, end_date)
		VALUES (10, 2, NULL, '2026-03-04 10:00:00', '2026-03-04 11:00:00');`

	  

	// ---- TOKENS ----

	//Tokens are created on login and signup
	//Tokens are created on login and signup
	//Tokens are created on login and signup
	//Tokens are created on login and signup

	// `INSERT INTO tokens (user_id, expiry_date)
	//  VALUES (1, '2026-02-01');`,

	// `INSERT INTO tokens (user_id, expiry_date)
	//  VALUES (3, '2026-02-05');`
];