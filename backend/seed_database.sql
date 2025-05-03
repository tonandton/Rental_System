-- เชื่อมต่อกับ Database
\c rental_system

-- ล้างข้อมูลเก่า
DELETE FROM bills;
DELETE FROM rental_history;
DELETE FROM projects;
DELETE FROM addresses;
DELETE FROM users;

-- เพิ่มผู้ใช้
INSERT INTO users (username, password, role, email, first_name, last_name)
VALUES 
  ('admin', '$2b$10$DiYplCgshVCcGVptzN./jePzkl/5Mca3v6CmCUzPvoS18.hi7TXQq', 'superuser', 'admin@example.com', 'แอดมิน', 'ตัวอย่าง'),
  ('user1', '$2b$10$d/PdH5Cw9gON.ziPgt8QMOq7a9K6JMZWAXFrE5nzudvxVGG.XZjw6', 'user', 'user1@example.com', 'ผู้ใช้', 'หนึ่ง');

-- เพิ่มที่อยู่
INSERT INTO addresses (user_id, address_line1, city, country)
VALUES 
  (1, '123 ถนนตัวอย่าง', 'กรุงเทพ', 'ประเทศไทย'),
  (2, '456 ถนนทดสอบ', 'เชียงใหม่', 'ประเทศไทย');

-- เพิ่มโครงการ
INSERT INTO projects (user_id, name, description, start_date)
VALUES 
  (1, 'โครงการเช่าบ้าน', 'บ้านเดี่ยวให้เช่า', '2025-01-01'),
  (2, 'โครงการเช่าคอนโด', 'คอนโดใจกลางเมือง', '2025-02-01');

-- เพิ่มประวัติการเช่า
INSERT INTO rental_history (user_id, project_id, rental_date, amount, status)
VALUES 
  (2, 1, '2025-05-01', 15000.00, 'completed'),
  (2, 2, '2025-05-02', 20000.00, 'pending');

-- เพิ่มใบแจ้งหนี้
INSERT INTO bills (rental_history_id, bill_number, issue_date, amount, status)
VALUES 
  (1, 'BILL-2025-001', '2025-05-01', 15000.00, 'paid'),
  (2, 'BILL-2025-002', '2025-05-02', 20000.00, 'pending');

-- สร้าง Database
CREATE DATABASE rental_system;

-- เชื่อมต่อกับ Database
\c rental_system

-- สร้างตาราง users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'superuser')),
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

-- สร้างตาราง projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    image_path VARCHAR(255),
    water_unit_rate DECIMAL(10,2) NOT NULL, -- อัตราค่าน้ำต่อหน่วย
    electricity_unit_rate DECIMAL(10,2) NOT NULL -- อัตราค่าไฟต่อหน่วย
);

-- สร้างตาราง rental_history
CREATE TABLE rental_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    rental_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL, -- ค่าเช่า
    water_units DECIMAL(10,2), -- หน่วยน้ำที่ใช้
    electricity_units DECIMAL(10,2), -- หน่วยไฟที่ใช้
    water_bill DECIMAL(10,2), -- ค่าน้ำหลังคำนวณ
    electricity_bill DECIMAL(10,2), -- ค่าไฟหลังคำนวณ
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- สร้างตาราง bills
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    rental_history_id INTEGER NOT NULL REFERENCES rental_history(id) ON DELETE CASCADE,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL, -- รวมค่าเช่า + ค่าน้ำ + ค่าไฟ
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'overdue'))
);

-- เพิ่ม Index เพื่อประสิทธิภาพ
CREATE INDEX idx_rental_history_rental_date ON rental_history(rental_date);
CREATE INDEX idx_rental_history_project_id ON rental_history(project_id);