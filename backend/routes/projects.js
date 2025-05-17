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
      let query = `
      SELECT DISTINCT ON (p.id) p.*, u.first_name AS owner_first_name, u.last_name AS owner_last_name
      FROM projects p
      LEFT JOIN project_owners po ON p.id = po.project_id
      LEFT JOIN users u ON po.user_id = u.id
    `;
      const params = [];
      if (req.user.role === "user") {
        query += " WHERE po.user_id = $1";
        params.push(req.user.id);
      }

      query += " ORDER BY p.id";

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error("Get projects error:", err);
      // res.status(500).json({ error: "Server error" });
      res.status(500).json({ error: err });
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
  router.get("/project-owners", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT DISTINCT u.id, u.first_name, u.last_name FROM users u JOIN project_owners po ON u.id = po.user_id ORDER BY u.first_name`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Get project owners error:", err);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
  });

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

  return router;
};
