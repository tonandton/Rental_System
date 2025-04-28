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

// API: Login
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
        expireshIn: "1h",
      }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: fetch user data
app.get("/api/users", authenticateToken, requireSuperUser, async (req, res) => {
  app.post(
    "/api/users",
    authenticateToken,
    requireSuperUser,
    async (req, res) => {
      try {
        const data = await readData();
        res.json(data.users.map(({ password, ...user }) => user));
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  );
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
