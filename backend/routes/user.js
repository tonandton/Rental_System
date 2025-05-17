const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

module.exports = (authenticateToken, restrictTo, pool) => {
  // Login
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      // if (!user || !bcrypt.compareSync(password, user.password)) {
      //   return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
      // }

      if (!user) return res.status(400).json({ error: "ไม่พบผู้ใช้ระบบ" });
      if (!validPassword)
        return res.status(400).json({ error: "รหัสผ่านไม่ถูกต้อง" });

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
      res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // จัดการผู้ใช้ (เฉพาะ superadmin)
  router.get(
    "/users",
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

  // Create user (superadmin only)
  router.post(
    "/users",
    authenticateToken,
    restrictTo("superadmin"),
    async (req, res) => {
      const { username, password, role, email, first_name, last_name } =
        req.body;
      try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await pool.query(
          "INSERT INTO users (username, password, role, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [username, hashedPassword, role, email, first_name, last_name]
        );
        res
          .status(201)
          .json({ id: result.rows[0].id, message: "User created" });
      } catch (err) {
        console.error("Create user error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  return router;
};
