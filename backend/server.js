const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ค้นหาไฟล์ Static จากโฟลเดอร์ updloads
app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOAD_DIR))
);

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// ตั้งค่า multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  // ขนาดไฟล์สูงสุด 5MB - Max file size 5MB
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("เฉพาะไฟล์ JPEG, JPG และ PNG เท่านั้น"));
  },
});

// Middleware ตรวจสอบ Token(JWT)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Middleware ตรวจสอบบทบาท
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    next();
  };
};

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({
      token,
      role: user.role,
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// จัดการผู้ใช้ (เฉพาะ superadmin)
app.get(
  "/api/users",
  authenticateToken,
  restrictTo("superadmin", "admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, username, role, email, first_name, last_name, created_at FROM users"
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Get users error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Add / Edit
app.post(
  "/api/users",
  authenticateToken,
  restrictTo("superadmin"),
  async (req, res) => {
    const { username, password, role, email, first_name, last_name } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = await pool.query(
        "INSERT INTO users (username, password, role, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [username, hashedPassword, role, email, first_name, last_name]
      );
      res.status(201).json({ id: result.rows[0].id, message: "User created" });
    } catch (err) {
      console.error("Create user error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// จัดการโครงการ (superadmin, admin, user)
app.get("/api/projects", authenticateToken, async (req, res) => {
  try {
    let query =
      "SELECT p.*, u.first_name AS owner_first_name, u.last_name AS owner_last_name " +
      "FROM projects p " +
      "LEFT JOIN project_owners po ON p.id = po.project_id " +
      "LEFT JOIN users u ON po.user_id = u.id";
    const params = [];
    if (req.user.role === "user") {
      query += " WHERE po.user_id = $1";
      params.push(req.user.id);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Get projects error:", err);
    // res.status(500).json({ error: "Server error" });
    res.status(500).json({ error: err });
  }
});

// AddProject - เพิ่มโครงการใหม่
app.post(
  "/api/projects",
  authenticateToken,
  restrictTo("superadmin", "admin"),
  async (req, res) => {
    const {
      name,
      description,
      start_date,
      end_date,
      water_unit_rate,
      electricity_unit_rate,
      owner_name,
    } = req.body;

    try {
      const projectResult = await pool.query(
        "INSERT INTO projects (user_id, name, description, start_date, end_date, water_unit_rate, electricity_unit_rate) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
        [
          req.user.id,
          name,
          description,
          start_date,
          end_date,
          water_unit_rate,
          electricity_unit_rate,
        ]
      );
      const projectId = projectResult.rows[0].id;

      await pool.query(
        "INSERT INTO project_owners (project_id, user_id) VALUES ($1, $2)",
        [projectId, owner_name || req.user.id]
      );

      res.status(201).json({ id: projectId, message: "Project created" });
    } catch (err) {
      console.error("Create project error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get project owner - แสดงโครงการของตัวแทน
app.get("/api/project-owners", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT u.id, u.first_name, u.last_name FROM users u JOIN project_owners po ON u.id = po.user_id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get project owners error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// upload project image - อัปโหลดภาพโครงการ
app.post(
  "/api/projects/:id/upload",
  authenticateToken,
  restrictTo("superadmin", "admin"),
  upload.single("image"),
  async (req, res) => {
    const projectId = req.params.id;
    try {
      const projectResult = await pool.query(
        "SELECT user_id FROM projects WHERE id = $1",
        [projectId]
      );
      const project = projectResult.rows[0];
      if (!project) return res.status(404).json({ error: "Project not found" });
      if (req.user.role !== "superadmin" && req.user.id !== project.user_id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const imagePath = `/uploads/${req.file.filename}`;
      await pool.query("UPDATE projects SET image_path = $1 WHERE id = $2", [
        imagePath,
        projectId,
      ]);
      res.json({ message: "Image uploaded", image_path: imagePath });
    } catch (err) {
      console.error("Upload image error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// อัปโหลดรูปภาพสำหรับค่าน้ำ/ค่าไฟ
app.post(
  "/api/history/:id/upload",
  authenticateToken,
  restrictTo("superadmin", "admin", "user"),
  upload.fields([
    { name: "water_image", maxCount: 1 },
    { name: "electricity_image", maxCount: 1 },
  ]),
  async (req, res) => {
    const historyId = req.params.id;
    try {
      const historyResult = await pool.query(
        "SELECT user_id, project_id FROM rental_history WHERE id = $1",
        [historyId]
      );
      const history = historyResult.rows[0];
      if (!history)
        return res.status(404).json({ error: "Rental history not found" });

      if (req.user.role === "user") {
        const ownerResult = await pool.query(
          "SELECT 1 FROM project_owners WHERE project_id = $1 AND user_id = $2",
          [history.project_id, req.user.id]
        );
        if (!ownerResult.rows.length && history.user_id !== req.user.id) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      } else if (req.user.role === "admin" && history.user_id !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updates = {};
      if (req.files.water_image)
        updates.water_image_path = `/uploads/${req.files.water_image[0].filename}`;
      if (req.files.electricity_image)
        updates.electricity_image_path = `/uploads/${req.files.electricity_image[0].filename}`;

      if (Object.keys(updates).length > 0) {
        const fields = Object.keys(updates)
          .map((key, index) => `${key} = $${index + 1}`)
          .join(", ");
        const values = Object.values(updates);
        await pool.query(
          `UPDATE rental_history SET ${fields} WHERE id = $${
            values.length + 1
          }`,
          [...values, historyId]
        );
      }

      res.json({ message: "Images uploaded", ...updates });
    } catch (err) {
      console.error("Upload history images error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// History - ประวัติการบันทึก
app.get("/api/history", authenticateToken, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      month,
      year,
      projectId,
      ownerId,
      recorderUsername,
      username,
      limit,
    } = req.query;

    let query = `
     SELECT rh.id, rh.rental_date, rh.amount, rh.previous_water_meter, rh.current_water_meter, rh.water_units, rh.water_bill, 
             rh.previous_electricity_meter, rh.current_electricity_meter, rh.electricity_units, rh.electricity_bill, 
             rh.water_image_path, rh.electricity_image_path, rh.status, p.name AS project_name, u.username, 
             ru.username AS recorder_username, ou.first_name AS owner_first_name, ou.last_name AS owner_last_name
      FROM rental_history rh
      JOIN projects p ON rh.project_id = p.id
      JOIN users u ON rh.user_id = u.id
      JOIN users ru ON rh.recorder_id = ru.id
      LEFT JOIN project_owners po ON p.id = po.project_id
      LEFT JOIN users ou ON po.user_id = ou.id
    `;

    const params = [];
    let conditions = [];

    if (req.user.role === "user") {
      conditions.push(
        `(rh.user_id = $${params.length + 1} OR po.user_id = $${
          params.length + 1
        })`
      );
      params.push(req.user.id);
    }
    if (startDate) {
      conditions.push(`rh.rental_date >= $${params.length + 1}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`rh.rental_date <= $${params.length + 1}`);
      params.push(endDate);
    }
    if (status) {
      conditions.push(`rh.status = $${params.length + 1}`);
      params.push(status);
    }
    if (month) {
      conditions.push(
        `EXTRACT(MONTH FROM rh.rental_date) = $${params.length + 1}`
      );
      params.push(month);
    }
    if (year) {
      conditions.push(
        `EXTRACT(YEAR FROM rh.rental_date) = $${params.length + 1}`
      );
      params.push(year);
    }
    if (projectId) {
      conditions.push(`rh.project_id = $${params.length + 1}`);
      params.push(projectId);
    }
    if (ownerId) {
      conditions.push(`po.user_name = $${params.length + 1}`);
      params.push(ownerId);
    }
    if (recorderUsername) {
      conditions.push(`ru.username = $${params.length + 1}`);
      params.push(recorderUsername);
    }
    if (username) {
      conditions.push(`u.username = $${params.length + 1}`);
      params.push(username);
    }

    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY rh.rental_date DESC";
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post(
  "/api/history",
  authenticateToken,
  restrictTo("superadmin", "admin", "user"),
  async (req, res) => {
    const {
      project_id,
      rental_date,
      amount,
      previous_water_meter,
      current_water_meter,
      previous_electricity_meter,
      current_electricity_meter,
      status,
    } = req.body;
    try {
      const projectResult = await pool.query(
        "SELECT water_unit_rate, electricity_unit_rate FROM projects WHERE id = $1",
        [project_id]
      );
      const project = projectResult.rows[0];
      if (!project) return res.status(404).json({ error: "Project not found" });

      if (req.user.role === "user") {
        const ownerResult = await pool.query(
          "SELECT 1 FROM project_owners WHERE project_id = $1 AND user_id = $2",
          [project_id, req.user.id]
        );
        if (!ownerResult.rows.length) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      const water_units =
        current_water_meter && previous_water_meter
          ? current_water_meter - previous_water_meter
          : 0;
      const electricity_units =
        current_electricity_meter && previous_electricity_meter
          ? current_electricity_meter - previous_electricity_meter
          : 0;
      const water_bill = water_units * project.water_unit_rate;
      const electricity_bill =
        electricity_units * project.electricity_unit_rate;

      const result = await pool.query(
        "INSERT INTO rental_history (user_id, recorder_id, project_id, rental_date, amount, previous_water_meter, current_water_meter, water_units, water_bill, previous_electricity_meter, current_electricity_meter, electricity_units, electricity_bill, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id",
        [
          req.user.id,
          req.user.id,
          project_id,
          rental_date,
          amount,
          previous_water_meter,
          current_water_meter,
          water_units,
          water_bill,
          previous_electricity_meter,
          current_electricity_meter,
          electricity_units,
          electricity_bill,
          status,
        ]
      );
      res.status(201).json({
        id: result.rows[0].id,
        message: "Rental history created",
        water_bill,
        electricity_bill,
      });
    } catch (err) {
      console.error("Create history error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// จัดการใบแจ้งหนี้ (superadmin เท่านั้น)
app.get(
  "/api/bills",
  authenticateToken,
  restrictTo("superadmin"),
  async (req, res) => {
    try {
      const query = `
      SELECT b.id, b.bill_number, b.issue_date, b.amount, b.status, rh.rental_date, rh.previous_water_meter, rh.current_water_meter, rh.water_units, rh.water_bill, 
             rh.previous_electricity_meter, rh.current_electricity_meter, rh.electricity_units, rh.electricity_bill, rh.water_image_path, rh.electricity_image_path, 
             u.username, p.name AS project_name, ou.first_name AS owner_first_name, ou.last_name AS owner_last_name, ru.username AS recorder_username
      FROM bills b
      JOIN rental_history rh ON b.rental_history_id = rh.id
      JOIN users u ON rh.user_id = u.id
      JOIN users ru ON rh.recorder_id = ru.id
      JOIN projects p ON rh.project_id = p.id
      LEFT JOIN project_owners po ON p.id = po.project_id
      LEFT JOIN users ou ON po.user_id = ou.id
    `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error("Get bills error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// All Bill - เพิ่มบิล
app.post(
  "/api/bills",
  authenticateToken,
  restrictTo("superadmin"),
  async (req, res) => {
    const { rental_history_id, bill_number, issue_date, status } = req.body;
    try {
      const rhResult = await pool.query(
        "SELECT amount, water_bill, electricity_bill FROM rental_history WHERE id = $1",
        [rental_history_id]
      );
      const rh = rhResult.rows[0];
      if (!rh)
        return res.status(404).json({ error: "Rental history not found" });
      const totalAmount =
        rh.amount + (rh.water_bill || 0) + (rh.electricity_bill || 0);

      const result = await pool.query(
        "INSERT INTO bills (rental_history_id, bill_number, issue_date, amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [rental_history_id, bill_number, issue_date, totalAmount, status]
      );
      res.status(201).json({
        id: result.rows[0].id,
        message: "Bill created",
        amount: totalAmount,
      });
    } catch (err) {
      console.error("Create bill error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// รันเซิร์ฟเวอร์
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database connected: ${process.env.DB_NAME}`);
  console.log(`Database Port: ${process.env.DB_PORT}`);
  pool
    .connect()
    .then(() => {
      console.log("✅ Connected to PostgreSQL!");
    })
    .catch((err) => {
      console.error("❌ Connection error:", err);
    });
});
