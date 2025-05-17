const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

const router = express.Router();

module.exports = (authenticateToken, restrictTo, pool) => {
  // ตั้งค่า multer สำหรับอัปโหลดไฟล์
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(
        __dirname,
        "../",
        process.env.UPLOAD_DIR || "uploads"
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  //   console.log(storage);

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

  // History - ประวัติการบันทึก
  router.get("/history", authenticateToken, async (req, res) => {
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
        createdStartDate,
        createdEndDate,
        limit,
      } = req.query;

      let query = `
     SELECT rh.id, rh.rental_date, rh.amount, rh.created_at, rh.updated_at, rh.previous_water_meter, rh.current_water_meter, rh.water_units, rh.water_bill, 
             rh.previous_electricity_meter, rh.current_electricity_meter, rh.electricity_units, rh.electricity_bill, 
             rh.water_image_path, rh.electricity_image_path, rh.status, p.name AS project_name, u.username, 
             ru.username AS recorder_username, ou.first_name AS owner_first_name, ou.last_name AS owner_last_name, po.user_id AS owner_id
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
          `EXISTS (
          SELECT 1 FROM project_owners po2
          WHERE po2.project_id = rh.project_id AND po2.user_id = $${
            params.length + 1
          }
        )`
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
        // ตรวจสอบว่า ownerId มีอยู่ใน project_owners
        const ownerCheck = await pool.query(
          "SELECT 1 FROM project_owners WHERE user_id = $1 LIMIT 1",
          [ownerId]
        );
        if (ownerCheck.rows.length === 0) {
          return res.json([]); // คืน array ว่างถ้า ownerId ไม่มี
        }
        conditions.push(`po.user_id = $${params.length + 1}`);
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
      if (createdStartDate) {
        conditions.push(`rh.created_at >= $${params.length + 1}`);
        params.push(createdStartDate);
      }
      if (createdEndDate) {
        conditions.push(`rh.created_at <= $${params.length + 1}`);
        params.push(createdEndDate);
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

  router.post(
    "/history",
    authenticateToken,
    restrictTo("superadmin", "admin", "user", "employee"),
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
        if (!project)
          return res.status(404).json({ error: "Project not found" });

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

        const toNullableNumber = (value) => {
          return value === "" || value === undefined ? null : Number(value);
        };
        const now = new Date();

        const result = await pool.query(
          "INSERT INTO rental_history (user_id, recorder_id, project_id, rental_date, amount, previous_water_meter, current_water_meter, water_units, water_bill, previous_electricity_meter, current_electricity_meter, electricity_units, electricity_bill, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id",
          [
            req.user.id,
            req.user.id,
            project_id,
            rental_date,
            toNullableNumber(amount),
            toNullableNumber(previous_water_meter),
            toNullableNumber(current_water_meter),
            water_units,
            water_bill,
            toNullableNumber(previous_electricity_meter),
            toNullableNumber(current_electricity_meter),
            electricity_units,
            electricity_bill,
            status,
            now,
            now,
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
        res.status(500).json({ error: "เกิดข้อมูลพลาดในกการบันทึก" });
      }
    }
  );

  // อัปโหลดรูปภาพสำหรับค่าน้ำ/ค่าไฟ
  router.post(
    "/history/:id/upload",
    authenticateToken,
    restrictTo("superadmin", "admin", "user", "employee"),
    (req, res, next) => {
      upload.fields([
        { name: "water_image", maxCount: 1 },
        { name: "electricity_image", maxCount: 1 },
      ])(req, res, (err) => {
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({ error: err.meesage });
        }
      }),
        console.log("Files received:", req.files); // Debug
      next();
    },
    async (req, res) => {
      const historyId = req.params.id;
      try {
        console.log("Files received:", req.files); // Debug
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
        } else if (
          req.user.role === "admin" &&
          history.user_id !== req.user.id
        ) {
          return res.status(403).json({ error: "Unauthorized" });
        }

        const updates = {};
        if (req.files.water_image) {
          const waterImagePath = `/${process.env.UPLOAD_DIR || "uploads"}/${
            req.files.water_image[0].filename
          }`;
          updates.water_image_path = waterImagePath;
          console.log("Water image saved:", waterImagePath); // Debug
        }
        if (req.files.electricity_image) {
          const electricityImagePath = `/${
            process.env.UPLOAD_DIR || "uploads"
          }/${req.files.electricity_image[0].filename}`;
          updates.electricity_image_path = electricityImagePath;
          console.log("Electricity image saved:", electricityImagePath); // Debug
        }

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

  // Export history to Excel
  router.get("/history/export", authenticateToken, async (req, res) => {
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
        createdStartDate,
        createdEndDate,
      } = req.query;

      let query = `
          SELECT rh.id, rh.rental_date, rh.amount, rh.created_at, rh.updated_at, rh.previous_water_meter, rh.water_units, rh.water_bill, rh.previous_electricity_meter, rh.current_electricity_meter, rh.electricity_units, rh.electricity_bill, rh.water_image_path, rh.electricity_image_path, rh.water_description, rh.electricity_description, rh.status, p.name AS project_name, u.username, ru.username AS recorder_username, ou.first_name AS owner_first_name, ou.last_name AS owner_last_name
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
          `EXISTS (
          SELECT 1 FROM project_owners po2
          WHERE po2.project_id = rh.project_id AND po2.user_id = $${
            params.length + 1
          }
        )`
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
        // ตรวจสอบว่า ownerId มีอยู่ใน project_owners
        const ownerCheck = await pool.query(
          "SELECT 1 FROM project_owners WHERE user_id = $1 LIMIT 1",
          [ownerId]
        );
        if (ownerCheck.rows.length === 0) {
          return res.json([]); // คืน array ว่างถ้า ownerId ไม่มี
        }
        conditions.push(`po.user_id = $${params.length + 1}`);
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
      if (createdStartDate) {
        conditions.push(`rh.created_at >= $${params.length + 1}`);
        params.push(createdStartDate);
      }
      if (createdEndDate) {
        conditions.push(`rh.created_at <= $${params.length + 1}`);
        params.push(createdEndDate);
      }

      if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
      query += " ORDER BY rh.rental_date DESC";

      const result = await pool.query(query, params);
      const data = result.rows.map((row) => ({
        ID: row.id,
        รอบวันที่: new Date(row.rental_date).toLocaleDateString("th-TH"),
        จำนวนเงิน: row.amount,
        วันที่สร้าง: new Date(row.created_at).toLocaleString("th-TH"),
        วันที่อัปเดต: new Date(row.updated_at).toLocaleString("th-TH"),
        มิเตอร์น้ำก่อนหน้า: row.previous_water_meter,
        มิเตอร์น้ำปัจจุบัน: row.current_water_meter,
        หน่วยน้ำ: row.water_units,
        ค่าน้ำ: row.water_bill,
        หมายเหตุค่าน้ำ: row.water_description || "-",
        มิเตอร์ไฟก่อนหน้า: row.previous_electricity_meter,
        มิเตอร์ไฟปัจจุบัน: row.current_electricity_meter,
        หน่วยไฟ: row.electricity_units,
        ค่าไฟ: row.electricity_bill,
        หมายเหตุค่าไฟ: row.electricity_description || "-",
        สถานะ: row.status,
        โครงการ: row.project_name,
        ผู้ใช้: row.username,
        ผู้บันทึก: row.recorder_username,
        เจ้าของ:
          `${row.owner_first_name || ""} ${row.owner_last_name || ""}`.trim() ||
          "-",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rental History");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=rental_history.xlsx"
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.send(buf);
    } catch (err) {
      console.error("Export history error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  return router;
};
