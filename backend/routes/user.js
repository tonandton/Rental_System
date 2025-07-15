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

      if (!user) {
        return res.status(400).json({ error: "ไม่พบผู้ใช้ระบบ" });
      }

      if (!user.is_active) {
        return res.status(403).json({ error: "บัญชีถูกปิดการใช้งาน" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
      }

      // ✅ สร้าง token และตอบกลับ
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

  // จัดการผู้ใช้ (เฉพาะ superadmin, admin)
  router.get(
    "/users",
    authenticateToken,
    restrictTo("superadmin", "admin"),
    async (req, res) => {
      try {
        const result = await pool.query(
          "SELECT id, username, role, email, first_name, last_name, is_active, created_at FROM users ORDER BY created_at DESC"
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
    restrictTo("superadmin", "admin"),
    async (req, res) => {
      const { username, password, role, email, first_name, last_name } =
        req.body;
      try {
        if (!password || password.length < 6) {
          return res
            .status(400)
            .json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await pool.query(
          "INSERT INTO users (username, password, role, email, first_name, last_name, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, role, email, first_name, last_name, is_active",
          [
            username,
            hashedPassword,
            role,
            email,
            first_name,
            last_name || "",
            true,
          ]
        );
        res
          .status(201)
          .json({ id: result.rows[0].id, message: "User created" });
      } catch (err) {
        console.error("Create user error:", err);
        res.status(400).json({
          error:
            err.constraint === "users_username_key"
              ? "ชื่อนี้มีในระบบแล้ว"
              : "ไม่สามารถเพิ่มผู้ใช้",
        });
      }
    }
  );

  // Update User
  router.put(
    "/users/:id",
    authenticateToken,
    restrictTo("superadmin", "admin"),
    async (req, res) => {
      const userId = parseInt(req.params.id);
      const {
        username,
        email,
        role,
        first_name,
        last_name,
        is_active,
        password,
      } = req.body;
      try {
        // ตรวจสอบว่าผู้ใช้มีอยู่
        const userCheck = await pool.query(
          "SELECT id FROM users WHERE id = $1",
          [userId]
        );
        if (userCheck.rows.length === 0) {
          return res.status(404).json({ error: "ไม่พบผู้ใช้" });
        }

        // เตรียม query และ params
        let query =
          "UPDATE users SET username = $1, role = $2, email = $3, first_name = $4, last_name = $5, is_active = $6";
        const params = [
          username,
          role,
          email,
          first_name || "",
          last_name || "",
          is_active,
        ];
        let paramIndex = 7;

        // จัดการรหัสผ่านถ้ามีการส่งมา
        if (password) {
          if (password.length < 6) {
            return res
              .status(400)
              .json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
          }
          const hashedPassword = bcrypt.hashSync(password, 10);
          query += `, password = $${paramIndex}`;
          params.push(hashedPassword);
          paramIndex++;
        }

        query += ` WHERE id = $${paramIndex} RETURNING id, username, email, role, first_name, last_name, is_active`;
        params.push(userId);

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
          return res.status(500).json({ error: "ไม่สามารถอัปเดตผู้ใช้ได้" });
        }

        // คืนข้อมูลผู้ใช้ที่อัปเดต
        res.json({ user: result.rows[0] });
      } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
          error:
            error.constraint === "users_username_key"
              ? "ชื่อนี้มีในระบบแล้ว"
              : "เกิดข้อผิดพลาดในระบบ",
        });
      }
    }
  );

  // Toggle Active / NonActive
  router.patch(
    "/users/:id/status",
    authenticateToken,
    restrictTo("superadmin", "admin"),
    async (req, res) => {
      const userId = req.params.id;
      const { is_active } = req.body;

      try {
        // ตรวจสอบว่า user มีอยู่
        const userCheck = await pool.query(
          "SELECT id FROM users WHERE id = $1",
          [userId]
        );
        if (userCheck.rows.length === 0) {
          return res.status(404).json({ error: "ไม่พบผู้ใช้" });
        }

        // แปลง is_active เป็น boolean
        const isActiveBool = is_active === true;
        await pool.query("UPDATE users SET is_active = $1 WHERE id = $2", [
          isActiveBool,
          userId,
        ]);

        // คืนข้อมูลผู้ใช้ที่อัปเดต
        const updatedUser = await pool.query(
          "SELECT id, username, role, email, first_name, last_name, is_active FROM users WHERE id = $1",
          [userId]
        );

        res.json({
          message: "อัปเดทสถานะผู้ใช้เรียบร้อยแล้ว",
          user: updatedUser.rows[0],
        });
      } catch (error) {
        console.error("Update user status error:", error);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // DELETE USER
  router.delete(
    "/users/:id",
    authenticateToken,
    restrictTo("superadmin"),
    async (req, res) => {
      if (isNaN(userId)) {
        return res.status(400).json({ error: "รหัสผู้ใช้ไม่ถูกต้อง" });
      }
      try {
        // ตรวจสอบว่าผู้ใช้มีอยู่
        const userCheck = await pool.query(
          "SELECT id FROM users WHERE id = $1",
          [userId]
        );
        if (userCheck.rows.length === 0) {
          return res.status(404).json({ error: "ไม่พบผู้ใช้" });
        }

        // ลบผู้ใช้
        await pool.query("DELETE FROM users WHERE id = $1", [userId]);
        res.json({ message: "ลบผู้ใช้สำเร็จ" });
      } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบ" });
      }
    }
  );

  return router;
};
