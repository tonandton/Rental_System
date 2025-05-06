-- สร้าง Database
CREATE DATABASE rental_system;

-- เชื่อมต่อกับ Database
\c rental_system

-- สร้างตาราง users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin', 'user')),
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง addresses
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL
);

-- สร้างตาราง project_owners
CREATE TABLE project_owners (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- สร้างตาราง projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    image_path VARCHAR(255),
    water_unit_rate DECIMAL(10,2) NOT NULL,
    electricity_unit_rate DECIMAL(10,2) NOT NULL
);

-- สร้างตาราง rental_history
CREATE TABLE rental_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recorder_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    rental_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    previous_water_meter DECIMAL(10,2),
    current_water_meter DECIMAL(10,2),
    water_units DECIMAL(10,2),
    water_bill DECIMAL(10,2),
    previous_electricity_meter DECIMAL(10,2),
    current_electricity_meter DECIMAL(10,2),
    electricity_units DECIMAL(10,2),
    electricity_bill DECIMAL(10,2),
    water_image_path VARCHAR(255),
    electricity_image_path VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- สร้างตาราง bills
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    rental_history_id INTEGER NOT NULL REFERENCES rental_history(id) ON DELETE CASCADE,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'overdue'))
);

-- เพิ่ม Index
CREATE INDEX idx_rental_history_rental_date ON rental_history(rental_date);
CREATE INDEX idx_rental_history_project_id ON rental_history(project_id);
CREATE INDEX idx_project_owners_project_id ON project_owners(project_id);
CREATE INDEX idx_project_owners_user_id ON project_owners(user_id);
