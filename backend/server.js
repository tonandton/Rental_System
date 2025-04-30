const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "your_jwt_secret";
const DATA_FILE = "./data.json";
// Data Begin
async function initializeData() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      users: [
        {
          id: 1,
          username: "admin",
          password: await bcrypt.hash("adminpass", 10),
          role: "superuser",
        },
        {
          id: 2,
          username: "user1",
          password: await bcrypt.hash("userpass", 10),
          role: "user",
        },
      ],
      projects: [],
      history: [],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

initializeData();

// Read Data
async function readData() {
  const data = await fs.readFile(DATA_FILE);
  return JSON.parse(data);
}

// Write Data
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Middleware Check JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invaild token" });
    req.user = user;
    next();
  });
};

// Middleware check SuperUser
const requireSuperUser = (req, res, next) => {
  if (!req.user || req.user.role !== "superuser") {
    return res.status(403).json({ error: "SuperUser access required" });
  }
  next();
};

// Middelware check user or superuser
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ error: "Authentication required" });
  }
  next();
};

// API: Login  *** UPDATE ***
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const data = await readData();
    const user = data.users.find((u) => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invaild credentials" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: fetch user data
app.get("/api/users", authenticateToken, requireSuperUser, async (req, res) => {
  try {
    const data = await readData();
    res.json(data.users.map(({ password, ...user }) => user));
    console.log(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Add / Edit
app.post(
  "/api/users",
  authenticateToken,
  requireSuperUser,
  async (req, res) => {
    const { username, password, role, id } = req.body;

    try {
      const data = await readData();
      const hashedPassword = await bcrypt.hash(password, 10);

      if (id) {
        const userIndex = data.users.findIndex((u) => u.id === id);
        if (userIndex === -1)
          return res.status(404).json({ erroor: "User not Found" });
        data.users[userIndex] = {
          id,
          username,
          password: hashedPassword,
          role,
        };
      } else {
        const newId = Math.max(...data.users.map((u) => u.id), 0) + 1;
        data.users.push({
          id: newId,
          username,
          passwoord: hashedPassword,
          role,
        });
      }
      await writeData(data);
      res.json({ id, username, role });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// API: Delete User
app.delete(
  "/api/users/:id",
  authenticateToken,
  requireSuperUser,
  async (req, res) => {
    const { id } = req.params;
    try {
      const data = await readData();
      const userIndex = data.users.findIndex((u) => u.id === parseInt(id));
      if (userIndex === -1)
        return res.status(404).json({ error: "User not found" });
      data.users.splice(userIndex, 1);
      data.history = data.history.filter((h) => h.user_id !== parseInt(id));
      await writeData(data);
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// API: PullProject
app.get("/api/projects", authenticateToken, async (req, res) => {
  try {
    const data = await readData();
    res.json(data.projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: AddProject (SuperUser only)  *** UPDATE ***
app.post(
  "/api/project",
  authenticateToken,
  requireSuperUser,
  async (req, res) => {
    const { name, water_rate, electricity_rate } = req.body;

    try {
      const data = await readData();
      const newId = Math.max(...data.projects.map((p) => p.id), 0) + 1;
      const project = {
        id: newId,
        name,
        water_rate: parseFloat(water_rate),
        electricity_rate: parseFloat(electricity_rate),
      };
      data.projects.push(project);
      await writeData(data);
      res.json({ status: "บันทึกโครงการเรียบร้อย", project });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// API: EditProject
app.put("/api/projects/:id", authenticateToken, async (req, res) => {
  if (!req.user)
    return res.status(403).json({ error: "Authentication required" });
  const { id } = req.params;
  const { name, water_rate, electricity_rate } = req.body;
  try {
    const data = await readData();
    const projectIndex = data.projects.findIndex((p) => p.id === parseInt(id));
    if (projectIndex === -1)
      return res.status(404).json({ error: "Project not found" });
    data.projects[projectIndex] = {
      id: parseInt(id),
      name,
      water_rate: parseFloat(water_rate),
      electricity_rate: parseFloat(electricity_rate),
    };
    await writeData(data);
    res.json(data.projects[projectIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: DeleteProject
app.delete("/api/projects/:id", authenticateToken, async (req, res) => {
  if (!req.user)
    return res.status(403).json({ error: "Authtication required" });
  const { id } = req.params;
  try {
    const data = await readData();
    const projectIndex = data.projects.findIndex((p) => p.id === parseInt(id));
    if (projectIndex === -1)
      return res.status(404).json({ error: "Project not found" });
    data.projects.splice(projectIndex, 1);
    data.history = data.history.filter((h) => h.project_id !== parseFloat(id));
    await writeData(data);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: PullHistory
app.get("/api/history", authenticateToken, async (req, res) => {
  try {
    const data = await readData();
    let history = data.history.map((h) => ({
      ...h,
      project_name: data.projects.find((p) => p.id === h.project_id)?.name,
      water_rate: data.projects.find((p) => p.id === h.project_id)?.water_rate,
      electricity_rate: data.projects.find((p) => p.id === h.project_id)
        ?.electricity_rate,
      username: data.users.find((u) => u.id === h.user_id)?.username,
    }));
    if (req.user && req.user.role === "user") {
      history = history.filter((h) => h.user_id === req.user.id);
    }
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: FilterHistory
app.post("/api/history/filter", authenticateToken, async (req, res) => {
  const {
    project_name,
    water_cost_min,
    water_cost_max,
    electricity_cost_min,
    electricity_cost_max,
    date_start,
    date_end,
    username,
  } = req.body;

  try {
    const data = await readData();
    let history = data.history.map((p) => ({
      ...h,
      project_name: data.projects.find((p) => p.id === h.project_id)?.name,
      water_rate: data.projects.find((p) => p.id === h.project_id)?.water_rate,
      electricity_rate: data.projects.find((p) => p.id === h.project_id)
        ?.electricity_rate,
      username: data.users.find((u) => u.id === h.user_id)?.username,
    }));

    history = history.filter((h) => {
      let pass = true;
      if (project_name && h.project_name !== project_name) pass = false;
      if (water_cost_min && h.water_cost < parseFloat(water_cost_min))
        pass = false;
      if (water_cost_max && h.water_cost < parseFloat(water_cost_max))
        pass = false;
      if (
        electricity_cost_min &&
        h.electricity_cost < parseFloat(electricity_cost_min)
      )
        pass = false;
      if (
        electricity_cost_max &&
        h.electricity_cost < parseFloat(electricity_cost_max)
      )
        pass = false;
      if (date_start && new Date(h.date) < new Date(date_start)) pass = false;
      if (date_end && new Date(h.date) > new Date(date_end)) pass = false;
      if (username && h.username !== username) pass = false;
    });

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: AddHistory (User or Superuser) *** UPDATE ***
app.post("/api/history", authenticateToken, requireAuth, async (req, res) => {
  const { project_id, rent, water_meter, electricity_meter, record_month } =
    req.body;
  try {
    //  Check record month
    if (!record_month || !/^\d{4}-\d{2}$/.test(record_month)) {
      return res.status(400).json({ error: "กรุณาระบุเดือนในรูปแบบ YYYY-MM" });
    }

    const data = await readData();
    const project = data.projects.find((p) => p.id === project_id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // ตรวจสอบว่าไม่มีบันทึกในเดือนและโครงการเเดียวกัน
    const existingEntry = data.history.find(
      (h) => h.project_id === project_id && h.record_month === record_month
    );
    if (existingEntry) {
      return res
        .status(400)
        .json({ error: "มีบันทึกสำหรับเดือนนี้ในโครงการแล้ว" });
    }

    const lastEntry = data.history
      .filter((h) => h.project_id === project_id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const waterMeterValue = parseFloat(water_meter) || 0;
    const electricityMeterValue = parseFloat(electricity_meter) || 0;
    if (lastEntry) {
      if (waterMeterValue < lastEntry.water_meter) {
        return res
          .status(400)
          .json({ error: "เลขมิเตอร์น้ำใหม่ต้องมากกว่าหรือเท่ากับค่าเก่า" });
      }
      if (electricityMeterValue < lastEntry.electricity_meter) {
        return res
          .status(400)
          .json({ error: "เลขมิเตอร์ไฟใหม่ต้องมากกว่าหรือเท่ากับค่าเก่า" });
      }
    }

    const waterUnits = lastEntry ? waterMeterValue - lastEntry.water_meter : 0;
    const electricityUnits = lastEntry
      ? electricityMeterValue - lastEntry.electricity_meter
      : 0;
    const waterCost = waterUnits * project.water_rate;
    const electricityCost = electricityUnits * project.electricity_rate;
    const rentCost = parseFloat(rent) || 0;
    const total = rentCost + waterCost + electricityCost;

    const newId = Math.max(...data.history.map((h) => h.id), 0) + 1;
    const entry = {
      id: newId,
      project_id,
      user_id: req.user.id,
      date: new Date().toISOString(),
      record_month,
      rent: rentCost,
      water_meter: waterMeterValue,
      water_units: waterUnits,
      water_cost: waterCost,
      electricity_meter: electricityMeterValue,
      electricity_units: electricityUnits,
      electricity_cost: electricityCost,
      total,
    };

    data.history.push(entry);
    await writeData(data);
    console.log(entry);
    res.status(200).json({
      ...entry,
      project_name: project.name,
      water_rate: project.water_rate,
      electricity_rate: project.electricity_rate,
      username: req.user.username,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: DeleteHistory
app.delete("/api/history/:id", authenticateToken, async (req, res) => {
  if (!req.user)
    return res.status(403).json({ error: "Authentication required" });
  const { id } = req.params;
  try {
    const data = await readData();
    const historyIndex = data.history.findIndex((h) => h.id === parseInt(id));
    if (historyIndex === -1)
      return res.status(404).json({ error: "History not found" });
    if (
      req.user.role === "user" &&
      data.history[historyIndex].user_id !== req.user.id
    ) {
      return res.status(403).json({ error: "Acess denind" });
    }
    data.history.splice(historyIndex, 1);
    await writeData(data);
    res.json({ message: "History deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("Server running on localhost:3001");
});
