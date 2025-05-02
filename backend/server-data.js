const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("ใส่ได้เฉพาะไฟล์รูปภาพเท่านั้น"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ตรวจสอบว่าโฟลเดอร์ uploads มีอยู่หรือไม่ ถ้าไม่มีให้สร้าง - Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const dataDir = path.join(__dirname, "dataStorage");
const userFile = path.join(dataDir, "users.json");

// ✅ สร้างโฟลเดอร์ dataStorage หากยังไม่มี
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Load or initialize data
let users = [];
let projects = [];
let history = [];

// try {
//   users = JSON.parse(fs.readFileSync("dataStorage/users.json", "utf8"));
//   projects = JSON.parse(fs.readFileSync("dataStorage/projects.json", "utf8"));
//   history = JSON.parse(fs.readFileSync("dataStorage/history.json", "utf8"));
// } catch (err) {
//   // Initialize empty files if they don't exist
//   fs.writeFileSync("dataStorage/users.json", JSON.stringify([]));
//   fs.writeFileSync("dataStorage/projects.json", JSON.stringify([]));
//   fs.writeFileSync("dataStorage/history.json", JSON.stringify([]));
// }

const loadJsonFile = (filePath, defaultData) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      if (data.trim()) {
        return JSON.parse(data);
      }
    }
    // If file doesn't exist or is empty, initialize with default data
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err.message);
    // Return default data without overwriting if error occurs
    return defaultData;
  }
};

// Load JSON files
users = loadJsonFile("dataStorage/users.json", []);
projects = loadJsonFile("dataStorage/projects.json", []);
history = loadJsonFile("dataStorage/history.json", []);

// Initialize default users only if users.json is empty
if (users.length === 0) {
  const adminPass = bcrypt.hashSync("adminpass", 10);
  const userPass = bcrypt.hashSync("userpass", 10);

  users = [
    {
      id: 1,
      username: "admin",
      password: adminPass,
      role: "superuser",
      name: "รัชต์ภาคย์ หันจางสิทธิ์",
    },
    {
      id: 2,
      username: "user",
      password: userPass,
      role: "user",
      name: "สรศักดิ์ หันจางสิทธิ์",
    },
  ];

  fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
}

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Login  *** UPDATE ***
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invaild credentials" });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    "secret",
    {
      expiresIn: "1h",
    }
  );
  res.status(200).json({ token, role: user.role, id: user.id });
});

// Users
app.get("/api/users", authenticateToken, (req, res) => {
  if (req.user.role !== "superuser") {
    return res.status(403).json({ error: "Access denied" });
  }
  res.status(200).json(users);
});

// API: Add / Edit
app.post("/api/users", authenticateToken, async (req, res) => {
  if (req.user.role !== "superuser")
    return res.status(403).json({ error: "Access denied" });

  const { username, password, name, role, id } = req.body;

  if (id) {
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1)
      return res.status(404).json({ erroor: "User not Found" });
    users[userIndex] = { ...users[userIndex], username, role, name };
    if (password) {
      users[userIndex].password = await bcrypt.hash(password, 10);
    }
  } else {
    const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ id: newId, username, password: hashedPassword, role, name });
  }
  fs.writeFileSync("dataStorage/users.json", JSON.stringify(users, null, 2));
  res.status(200).json({ message: "User saved successfully" });
});

// API: Delete User
app.delete("/api/users/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "superuser")
    return res.status(403).json({ error: "Access denied" });
  const id = parseInt(req.params.id);
  users = users.filter((u) => u.id !== id);
  fs.writeFileSync("dataStorage/users.json", JSON.stringify(users, null, 2));
  res.json({ message: "User deleted successfully" });
});

// Projects
app.get("/api/projects", (req, res) => {
  res.status(200).json(projects);
});

// AddProject
app.post("/api/projects", authenticateToken, async (req, res) => {
  if (req.user.role !== "superuser")
    return res.status(403).json({ error: "Access denied" });
  const { name, water_rate, electricity_rate } = req.body;
  const newId = projects.length
    ? Math.max(...projects.map((p) => p.id)) + 1
    : 1;
  projects.push({
    id: newId,
    name,
    water_rate: parseFloat(water_rate),
    electricity_rate: parseFloat(electricity_rate),
  });
  fs.writeFileSync(
    "dataStorage/projects.json",
    JSON.stringify(projects, null, 2)
  );
  res.status(200).json({ message: "Project saved successfully" });
});

// EditProject
app.put("/api/projects/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "superuser")
    return res.status(403).json({ error: "Access denied" });
  const id = path.parse(req.params.id);
  const projectIndex = projects.findIndex((p) => p.id === id);
  if (projectIndex === -1)
    return res.status(404).json({ error: "Project not found" });
  data.projects[projectIndex] = {
    ...projects[projectIndex],
    ...req.body,
    water_rate: parseFloat(water_rate),
    electricity_rate: parseFloat(electricity_rate),
  };
  fs.writeFileSync(
    "dataStorage/projects.json",
    JSON.stringify(projects, null, 2)
  );
  res.status(200).json({ message: "Project updated successfully" });
});

// DeleteProject
app.delete("/api/projects/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "superuser")
    return res.status(403).json({ error: "Authtication required" });
  const id = parseInt(req.params.id);
  projects = projects.filter((p) => p.id !== id);
  fs.writeFileSync(
    "dataStorage/projects.json",
    JSON.stringify(projects, null, 2)
  );
  res.status(200).json({ message: "Project deleted successfully" });
});

// History
app.get("/api/history", (req, res) => {
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
  res.status(200).json(filteredHistory);
});

app.post(
  "/api/history",
  authenticateToken,
  upload.fields([
    { name: "water_image", maxCount: 1 },
    { name: "electricity_image", maxCount: 1 },
  ]),
  async (req, res) => {
    const { project_id, rent, water_meter, electricity_meter, record_month } =
      req.body;
    const project = projects.find((p) => p.id === parseInt(project_id));
    if (!project) return res.status(404).json({ error: "Project not found" });

    const previousRecord = history
      .filter(
        (h) =>
          h.project_id === parseInt(project_id) && h.record_month < record_month
      )
      .sort((a, b) => new Date(b.record_month) - new Date(a.record_month))[0];

    const water_units = previousRecord
      ? water_meter - previousRecord.water_meter
      : 0;

    const electricity_units = previousRecord
      ? electricity_meter - previousRecord.electricity_meter
      : 0;

    const water_cost = water_units * project.water_rate;
    const electricity_cost = electricity_units * project.electricity_rate;
    const total = parseFloat(rent || 0) + water_cost + electricity_cost;

    const newId = history.length
      ? Math.max(...history.map((h) => h.id)) + 1
      : 1;

    const newRecord = {
      id: newId,
      project_id: parseInt(project_id),
      project_name: project.name,
      user_id: req.user.id,
      username: req.user.username,
      name: users.find((u) => u.id === req.user.id)?.name || req.user.username,
      rent: parseFloat(rent || 0),
      water_meter: parseFloat(water_meter),
      electricity_meter: parseFloat(electricity_meter),
      record_month,
      water_units,
      water_cost,
      electricity_units,
      electricity_cost,
      total,
      water_rate: project.water_rate,
      electricity_rate: project.electricity_rate,
      water_image: req.files["water_image"]
        ? req.files["water_image"][0].filename
        : null,
      electricity_image: req.files["electricity_image"]
        ? req.files["electricity_image"][0].filename
        : null,
    };

    history.push(newRecord);
    fs.writeFileSync(
      "dataStorage/history.json",
      JSON.stringify(history, null, 2)
    );
    res.status(201).json({ message: "History saved successfully" });
  }
);

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

app.listen(3001, () => {
  console.log("Server running on localhost:3001");
});
