const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

// Route import
const userRoutes = require("./routes/user");
const projectRoutes = require("./routes/projects");
const historyRoutes = require("./routes/history");
const billRoutes = require("./routes/bills");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ค้นหาไฟล์ Static จากโฟลเดอร์ updloads
app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads"))
);

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Middleware ตรวจสอบ Token(JWT)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  // New
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
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

// Routes
app.use("/api", userRoutes(authenticateToken, restrictTo, pool));
app.use("/api", projectRoutes(authenticateToken, restrictTo, pool));
app.use("/api", historyRoutes(authenticateToken, restrictTo, pool));
app.use("/api", billRoutes(authenticateToken, restrictTo, pool));

// Start Server
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
