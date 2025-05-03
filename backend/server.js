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
    cb(null, uniqueSuffix + path.extname(file, originalname));
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
  if (!token) return res.sendStatus(401).json({ error: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// Middleware ตรวจสอบ SuperUser
const isSuperUser = (req, res, next) => {
  if (req.user.role !== "superuser") {
    return res.status(403).json({ error: "Superuser access required" });
  }
  next();
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
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.name, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role, id: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// จัดการข้อมูลผู้ใช้ (Superuser เท่านั้น)
app.get("/api/users", authenticateToken, isSuperUser, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, role, email, first_name, last_name, created_at FROM users"
    );
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add / Edit
app.post("/api/users", authenticateToken, isSuperUser, async (req, res) => {
  const { username, password, role, email, first_name, last_name } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await pool.query(
      "INSERT INTO users(username, password, role, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [username, hashedPassword, role, email, first_name, last_name]
    );

    res
      .status(201)
      .json({ id: result.rows[0].id, message: "User Created successfully" });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete User
// app.delete("/api/users/:id", authenticateToken, (req, res) => {
//   if (req.user.role !== "superuser")
//     return res.status(403).json({ error: "Access denied" });
//   const id = parseInt(req.params.id);
//   users = users.filter((u) => u.id !== id);
//   fs.writeFileSync("dataStorage/users.json", JSON.stringify(users, null, 2));
//   res.json({ message: "User deleted successfully" });
// });

// Projects
app.get("/api/projects", (req, res) => {
  res.status(200).json(projects);
});

// จัดการโครงการ (Superuser เท่านั้น)
// app.get("/api/projects", authenticateToken, async(req,res) => {
//   try {
//     const query = req.user.role === "superuser" ? "SELECT * FROM projects" :"SELECT * FROM projects WHERE user_id = $1";
//     const result = await pool.query(query, req.user.role === "superuser" ? []: [req.user.id])
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Get projects error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// })

// AddProject - เพิ่มโครงการใหม่
app.post("/api/projects", authenticateToken, async (req, res) => {
  const {
    name,
    description,
    start_date,
    end_date,
    water_unit_rate,
    electricity_unit_rate,
  } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO projects (name, description, start_date, end_date, water_unit_rate, electricity_unit_rate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
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
    res
      .status(201)
      .json({ id: result.rows[0].id, message: "Project created successfully" });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DeleteProject
// app.delete("/api/projects/:id", authenticateToken, (req, res) => {
//   if (req.user.role !== "superuser")
//     return res.status(403).json({ error: "Authtication required" });
//   const id = parseInt(req.params.id);
//   projects = projects.filter((p) => p.id !== id);
//   fs.writeFileSync(
//     "dataStorage/projects.json",
//     JSON.stringify(projects, null, 2)
//   );
//   res.status(200).json({ message: "Project deleted successfully" });
// });

// upload project image - อัปโหลดภาพโครงการ
app.post(
  "/api/projects/:id/upload",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    const projectId = req.params.id;
    try {
      const projectResult = await pool.query(
        "SELECT * user_id FROM projects WHERE id = $1",
        [projectId]
      );
      const project = projectResult.rows[0];
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (req.user.role !== "superuser" && req.user.id !== project.user_id) {
        return res.status(403).json({ error: "Unauthorized access" });
      }
      const imagePath = `/uploads/${req.file.filename}`;
      await pool.query("UPDATE projects SET image_path = $1 WHERE id = $2", [
        imagePath,
        projectId,
      ]);
      res.json({ message: "Image uploaded successfully", imagePath });
    } catch (err) {
      console.error("Upload project image error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// History - ประวัติการบันทึก
app.get("/api/history", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, status, month, year, projectId } = req.query;

    let query = `SELECT rh.id, rh.rental_date, rh.amount,rh.previous_water_meter, rh.current_water_meter, rh.water_units, rh.water_bill,rh.previous_electricity_meter, rh.current_electricity_meter, rh.electricity_units,  rh.electricity_bill, rh.water_image_path, rh.electricity_image_path, rh.status, p.name AS project_name, u.username FROM rental_history rh JOIN projects p ON rh.project_id = p.id JOIN users u ON rh.user_id = u.id`;
    const params = [];
    let conditions = [];

    if (req.user.role !== "superuser") {
      conditions.push(`rh.user_id = $${params.length + 1}`);
      params.push(req.user.id);
    }
    if (startDate) {
      conditions.push(`rh.rental_date >= $${params.length + 1}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push.apply(`rh.renta_date <= $${params.length + 1}`);
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
    if (yeat) {
      conditions.push(
        `EXTRACT(YEAR FROM rh.rental_date) = $${params.length + 1}`
      );
      params.push(year);
    }
    if (projectId) {
      conditions.push(`rh.project_id = $${params.length + 1}`);
      params.push(projectId);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY rh.rental_date DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/history", authenticateToken, async (req, res) => {
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
    // ดึงอัตราค่าน้ำ/ค่าไฟจาก projects
    const projectResult = await pool.query(
      "SELECT water_unit_rate, electricity_unit_rate FROM projects WHERE id = $1",
      [project_id]
    );
    const project = projectResult.rows[0];
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // คำนวณหน่วยที่ใช้
    const water_units =
      current_water_meter && previous_water_meter
        ? current_water_meter - previous_water_meter
        : 0;
    const electricity_units =
      current_electricity_meter && previous_electricity_meter
        ? current_electricity_meter - previous_electricity_meter
        : 0;

    // คำนวณค่าน้ำและค่าไฟ
    const water_bill = water_units * project.water_unit_rate;
    const electricity_bill = electricity_units * project.electricity_unit_rate;

    const result = await pool.query(
      "INSERT INTO rental_history (user_id, project_id, rental_date, amount, previous_water_meter, current_water_meter, water_units, water_bill, previous_electricity_meter, current_electricity_meter, electricity_units, electricity_bill, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id",
      [
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
});

// FilterHistory
app.post("/api/history/filter", authenticateToken, async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  let filteredHistory = history.map((h) => ({
    ...h,
    name: users.find((u) => u.id === h.user_id)?.name || h.username,
  }));

  if (token) {
    try {
      const decoded = jwt.verify(token, "secret");
      if (decoded.role === "user") {
        filteredHistory = filteredHistory.filter(
          (h) => h.user_id === decoded.id
        );
      }
    } catch (err) {
      // Continue as guest if token is invalid
    }
  }

  const {
    project_name,
    water_cost_min,
    water_cost_max,
    electricity_cost_min,
    electricity_cost_max,
    username,
  } = req.body;

  filteredHistory = filteredHistory.filter((h) => {
    return (
      (!project_name || h.project_name === project_name) &&
      (water_cost_min === null || h.water_cost >= water_cost_min) &&
      (water_cost_max === null || h.water_cost <= water_cost_max) &&
      (electricity_cost_min === null ||
        h.electricity_cost >= electricity_cost_min) &&
      (electricity_cost_max === null ||
        h.electricity_cost <= electricity_cost_max) &&
      (!record_month || h.record_month === record_month) &&
      (!username || h.username === username)
    );
  });

  res.status(200).json(filteredHistory);
});

// Monthly Report
app.get("/api/month-report", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  let filteredHistory = history;

  if (token) {
    try {
      const decoded = jwt.verify(token, "secret");
      if (decoded.role === "user") {
        filteredHistory = filteredHistory.filter(
          (h) => h.user_id === decoded.id
        );
      }
    } catch (err) {
      // Continue as guest if token is invalid
    }
  }

  const report = filteredHistory.reduce((acc, h) => {
    const month = record.record_month;
    const project = record.project_name;
    const username = record.username;
    const name = users.find((u) => u.id === record.user_id)?.name || username;
    if (!acc[month]) acc[month] = {};
    if (!acc[month][project]) acc[month][project] = {};
    if (!acc[month][project][username])
      acc[month][project][username] = { name, entries: [] };
    acc[month][project][username].entries.push(record);
    return acc;
  }, {});

  res.status(200).json(report);
});

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
