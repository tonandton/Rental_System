const express = require("express");
const multer = require("multer");
const router = express.Router();

module.exports = (authenticateToken, restrictTo, pool) => {
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

  // Attach upload middleware to req for routes
  router.use((req, res, next) => {
    req.upload = upload;
    next();
  });

  // จัดการโครงการ (superadmin, admin, user)
  router.get("/projects", authenticateToken, async (req, res) => {
    try {
      const { name, address, status, ownerId } = req.query;

      let query = `
      SELECT DISTINCT ON (p.id) p.*, u.first_name AS owner_first_name, u.last_name AS owner_last_name
      FROM projects p
      LEFT JOIN project_owners po ON p.id = po.project_id
      LEFT JOIN users u ON po.user_id = u.id
      WHERE 1=1
    `;

      const params = [];
      let paramIndex = 1;

      // เงื่อนไขสิทธิ์สำหรับ user (เห็นเฉพาะโครงการของตัวเอง)
      if (req.user.role === "user") {
        query += ` AND po.user_id = $${paramIndex}`;
        params.push(req.user.id);
        paramIndex++;
      }

      // กรองชื่อโครงการ
      if (name) {
        query += ` AND LOWER(p.name) ILIKE $${paramIndex}`;
        params.push(`%${name.toLowerCase()}%`);
        paramIndex++;
      }

      // กรองที่อยู่
      if (address) {
        query += ` AND LOWER(p.address) ILIKE $${paramIndex}`;
        params.push(`%${address.toLowerCase()}%`);
        paramIndex++;
      }

      // กรองสถานะ
      if (status === "true" || status === "false") {
        query += ` AND p.is_active = $${paramIndex}`;
        params.push(status === "true");
        paramIndex++;
      }

      // กรองเจ้าของโครงการ
      if (ownerId) {
        query += ` AND po.user_id = $${paramIndex}`;
        params.push(ownerId);
        paramIndex++;
      }

      query += ` ORDER BY p.id`;

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error("Get projects error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // AddProject - เพิ่มโครงการใหม่
  router.post(
    "/projects",
    authenticateToken,
    restrictTo("superadmin", "admin"),
    async (req, res) => {
      const {
        name,
        description,
        water_unit_rate,
        electricity_unit_rate,
        owner_id,
        address, // ✅ เพิ่ม
        is_active,
      } = req.body;

      try {
        const projectResult = await pool.query(
          `INSERT INTO projects 
          (user_id, name, description, water_unit_rate, electricity_unit_rate, address, is_active) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [
            req.user.id,
            name,
            description,
            water_unit_rate,
            electricity_unit_rate,
            address,
            is_active,
          ]
        );
        const projectId = projectResult.rows[0].id;

        await pool.query(
          "INSERT INTO project_owners (project_id, user_id) VALUES ($1, $2)",
          [projectId, owner_id || req.user.id]
        );

        res.status(201).json({ id: projectId, message: "Project created" });
      } catch (err) {
        console.error("Create project error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // upload project image - อัปโหลดภาพโครงการ
  router.post(
    "/projects/:id/upload",
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
        if (!project)
          return res.status(404).json({ error: "Project not found" });
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

  // edit project - แก้ไขโครงการ
  router.put(
    "/projects/:id",
    authenticateToken,
    restrictTo("superadmin", "admin"),
    async (req, res) => {
      const projectId = req.params.id;
      const {
        name,
        description,
        water_unit_rate,
        electricity_unit_rate,
        address,
        is_active,
        owner_id,
      } = req.body;

      try {
        await pool.query(
          `UPDATE projects 
         SET name = $1, description = $2, water_unit_rate = $3, electricity_unit_rate = $4, address = $5, is_active = $6
         WHERE id = $7`,
          [
            name,
            description,
            water_unit_rate,
            electricity_unit_rate,
            address,
            is_active,
            projectId,
          ]
        );

        await pool.query("DELETE FROM project_owners WHERE project_id = $1", [
          projectId,
        ]);

        await pool.query(
          "INSERT INTO project_owners (project_id, user_id) VALUES ($1, $2)",
          [projectId, owner_id]
        );

        res.json({ message: "Project updated" });
      } catch (err) {
        console.error("Update project error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // Get project owner - แสดงโครงการของตัวแทน
  router.get("/project-owners", authenticateToken, async (req, res) => {
    // try {
    //   const result = await pool.query(
    //     `SELECT DISTINCT u.id, u.first_name, u.last_name FROM users u JOIN project_owners po ON u.id = po.user_id ORDER BY u.first_name`
    //   );
    //   res.json(result.rows);

    try {
      // ให้เฉพาะ superadmin หรือ admin เข้าถึง
      if (!["superadmin", "admin"].includes(req.user.role)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const result = await pool.query(
        `SELECT id, first_name, last_name FROM users ORDER BY first_name`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Get project owners error:", err);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
  });

  //เปลี่ยนสถานะ active / non-active:
  router.patch(
    "/projects/:id/status",
    authenticateToken,
    restrictTo("superadmin", "admin"),
    async (req, res) => {
      const projectId = req.params.id;
      const { is_active } = req.body;

      try {
        await pool.query("UPDATE projects SET is_active = $1 WHERE id = $2", [
          is_active,
          projectId,
        ]);
        res.json({ message: "Project status updated" });
      } catch (err) {
        console.error("Toggle project status error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // Delete Porject
  router.delete(
    "/projects/:id",
    authenticateToken,
    restrictTo("superadmin", "admin"),
    async (req, res) => {
      const projectId = req.params.id;

      try {
        await pool.query("DELETE FROM projects WHERE id = $1", [projectId]);
        res.json({ message: "Project deleted" });
      } catch (err) {
        console.error("Delete project error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  return router;
};
