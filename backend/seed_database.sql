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
    owner_name VARCHAR(100) NOT NULL,
    contact_info VARCHAR(255)
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

-- ล้างข้อมูลเก่าเพื่อเริ่มต้นใหม่
DELETE FROM bills;
DELETE FROM rental_history;
DELETE FROM projects;
DELETE FROM addresses;
DELETE FROM users;

-- เพิ่มผู้ใช้
INSERT INTO users (username, password, role, email, first_name, last_name) VALUES
    ('superadmin', '$2b$10$TyuCzUgHgQgC5mQVSAO.JO.ZIWYom.DfezdDc1vfjukkD8mF48vs.', 'superadmin', 'superadmin@example.com', 'ซูเปอร์', 'แอดมิน'),
    ('admin', '$2b$10$TyuCzUgHgQgC5mQVSAO.JO.ZIWYom.DfezdDc1vfjukkD8mF48vs.', 'admin', 'admin@example.com', 'แอดมิน', 'ทั่วไป'),
    ('user1', '$2b$10$W0P/dkr/P0JuzIO4l3ta9.PXJ5FVTKkfJdwmLeubW15GkTeMdMDeO', 'user', 'user1@example.com', 'ผู้ใช้', 'หนึ่ง'),
    ('user2', '$2b$10$W0P/dkr/P0JuzIO4l3ta9.PXJ5FVTKkfJdwmLeubW15GkTeMdMDeO', 'user', 'user2@example.com', 'ผู้ใช้', 'สอง');

-- เพิ่มที่อยู่
INSERT INTO addresses (user_id, address_line1, city, postal_code, country) VALUES
    (1, '123 ถนนตัวอย่าง', 'กรุงเทพ', '10100', 'ประเทศไทย'),
    (2, '456 ถนนทดสอบ', 'เชียงใหม่', '50200', 'ประเทศไทย'),
    (3, '789 ถนนพัฒนา', 'ภูเก็ต', '83000', 'ประเทศไทย'),
    (4, '101 ถนนสุขสวัสดิ์', 'พัทยา', '20150', 'ประเทศไทย');

-- เพิ่มโครงการ
INSERT INTO projects (user_id, name, description, start_date, water_unit_rate, electricity_unit_rate) VALUES
    (2, 'โครงการเช่าบ้าน', 'บ้านเดี่ยวให้เช่าในกรุงเทพ', '2025-01-01', 20.00, 5.00),
    (2, 'โครงการเช่าคอนโด', 'คอนโดใจกลางเมืองเชียงใหม่', '2025-02-01', 25.00, 6.00);

-- เพิ่มเจ้าของโครงการ
INSERT INTO project_owners (project_id, owner_name, contact_info) VALUES
    (1, 'นายสมชาย ใจดี', 'somchai@example.com'),
    (2, 'นางสาวสมหญิง สวยงาม', 'somying@example.com');

-- เพิ่มประวัติการเช่า
INSERT INTO rental_history (user_id, recorder_id, project_id, rental_date, amount, previous_water_meter, current_water_meter, water_units, water_bill, previous_electricity_meter, current_electricity_meter, electricity_units, electricity_bill, water_image_path, electricity_image_path, status) VALUES
    (3, 1, 1, '2025-05-01', 15000.00, 1000.00, 1025.00, 25.00, 500.00, 5000.00, 5200.00, 200.00, 1000.00, '/uploads/water_may_2025_user1.jpg', '/uploads/electricity_may_2025_user1.jpg', 'completed'),
    (3, 2, 2, '2025-05-02', 20000.00, 2000.00, 2020.00, 20.00, 500.00, 3000.00, 3150.00, 150.00, 900.00, '/uploads/water_may_2025_user1_condo.jpg', '/uploads/electricity_may_2025_user1_condo.jpg', 'pending'),
    (4, 1, 1, '2025-06-01', 15000.00, 1025.00, 1055.00, 30.00, 600.00, 5200.00, 5420.00, 220.00, 1100.00, '/uploads/water_june_2025_user2.jpg', '/uploads/electricity_june_2025_user2.jpg', 'completed'),
    (4, 4, 2, '2025-06-02', 20000.00, 2020.00, 2042.00, 22.00, 550.00, 3150.00, 3310.00, 160.00, 960.00, '/uploads/water_june_2025_user2_condo.jpg', '/uploads/electricity_june_2025_user2_condo.jpg', 'pending'),
    (3, 3, 1, '2025-07-01', 15000.00, 1055.00, 1083.00, 28.00, 560.00, 5420.00, 5630.00, 210.00, 1050.00, '/uploads/water_july_2025_user1.jpg', '/uploads/electricity_july_2025_user1.jpg', 'pending');

-- เพิ่มใบแจ้งหนี้
INSERT INTO bills (rental_history_id, bill_number, issue_date, amount, status) VALUES
    (1, 'BILL-2025-001', '2025-05-01', 16500.00, 'paid'),
    (2, 'BILL-2025-002', '2025-05-02', 21400.00, 'pending'),
    (3, 'BILL-2025-003', '2025-06-01', 16700.00, 'paid'),
    (4, 'BILL-2025-004', '2025-06-02', 21510.00, 'pending'),
    (5, 'BILL-2025-005', '2025-07-01', 16610.00, 'pending');