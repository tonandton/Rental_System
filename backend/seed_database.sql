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
    (2, 'โครงการเช่าคอนโด', 'คอนโดใจกลางเมืองเชียงใหม่', '2025-02-01', 25.00, 6.00),
    (2, 'โครงการเช่าอพาร์ตเมนต์', 'อพาร์ตเมนต์ในภูเก็ต', '2025-03-01', 22.00, 5.50);

-- เพิ่มเจ้าของโครงการ
INSERT INTO project_owners (project_id, user_id) VALUES
    (1, 3), -- user1 เป็นเจ้าของโครงการเช่าบ้าน
    (2, 3), -- user1 เป็นเจ้าของโครงการเช่าคอนโด
    (2, 4), -- user2 เป็นเจ้าของโครงการเช่าคอนโด
    (3, 4); -- user2 เป็นเจ้าของโครงการเช่าอพาร์ตเมนต์

-- เพิ่มประวัติการเช่า
INSERT INTO rental_history (user_id, recorder_id, project_id, rental_date, amount, previous_water_meter, current_water_meter, water_units, water_bill, previous_electricity_meter, current_electricity_meter, electricity_units, electricity_bill, water_image_path, electricity_image_path, status) VALUES
    (3, 1, 1, '2025-05-01', 15000.00, 1000.00, 1025.00, 25.00, 500.00, 5000.00, 5200.00, 200.00, 1000.00, '/uploads/water_may_2025_user1.jpg', '/uploads/electricity_may_2025_user1.jpg', 'completed'),
    (3, 2, 2, '2025-05-02', 20000.00, 2000.00, 2020.00, 20.00, 500.00, 3000.00, 3150.00, 150.00, 900.00, '/uploads/water_may_2025_user1_condo.jpg', '/uploads/electricity_may_2025_user1_condo.jpg', 'pending'),
    (4, 1, 1, '2025-06-01', 15000.00, 1025.00, 1055.00, 30.00, 600.00, 5200.00, 5420.00, 220.00, 1100.00, '/uploads/water_june_2025_user2.jpg', '/uploads/electricity_june_2025_user2.jpg', 'completed'),
    (4, 4, 2, '2025-06-02', 20000.00, 2020.00, 2042.00, 22.00, 550.00, 3150.00, 3310.00, 160.00, 960.00, '/uploads/water_june_2025_user2_condo.jpg', '/uploads/electricity_june_2025_user2_condo.jpg', 'pending'),
    (3, 3, 3, '2025-07-01', 18000.00, 1055.00, 1083.00, 28.00, 616.00, 5420.00, 5630.00, 210.00, 1155.00, '/uploads/water_july_2025_user1_apartment.jpg', '/uploads/electricity_july_2025_user1_apartment.jpg', 'pending');

-- เพิ่มใบแจ้งหนี้
INSERT INTO bills (rental_history_id, bill_number, issue_date, amount, status) VALUES
    (1, 'BILL-2025-001', '2025-05-01', 16500.00, 'paid'),
    (2, 'BILL-2025-002', '2025-05-02', 21400.00, 'pending'),
    (3, 'BILL-2025-003', '2025-06-01', 16700.00, 'paid'),
    (4, 'BILL-2025-004', '2025-06-02', 21510.00, 'pending'),
    (5, 'BILL-2025-005', '2025-07-01', 19771.00, 'pending');