const express = require("express");

const router = express.Router();

module.exports = (authenticateToken, restrictTo, pool) => {
  // จัดการใบแจ้งหนี้ (superadmin เท่านั้น)
  router.get(
    "/bills",
    authenticateToken,
    restrictTo("superadmin"),
    async (req, res) => {
      try {
        const query = `
      SELECT b.id, b.bill_number, b.issue_date, b.amount, b.status, rh.rental_date, rh.previous_water_meter, rh.current_water_meter, rh.water_units, rh.water_bill, 
             rh.previous_electricity_meter, rh.current_electricity_meter, rh.electricity_units, rh.electricity_bill, rh.water_image_path, rh.electricity_image_path, 
             u.username, p.name AS project_name, ou.first_name AS owner_first_name, ou.last_name AS owner_last_name, ru.username AS recorder_username
      FROM bills b
      JOIN rental_history rh ON b.rental_history_id = rh.id
      JOIN users u ON rh.user_id = u.id
      JOIN users ru ON rh.recorder_id = ru.id
      JOIN projects p ON rh.project_id = p.id
      LEFT JOIN project_owners po ON p.id = po.project_id
      LEFT JOIN users ou ON po.user_id = ou.id
    `;
        const result = await pool.query(query);
        res.json(result.rows);
      } catch (err) {
        console.error("Get bills error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // All Bill - เพิ่มบิล
  router.post(
    "/bills",
    authenticateToken,
    restrictTo("superadmin"),
    async (req, res) => {
      const { rental_history_id, bill_number, issue_date, status } = req.body;
      try {
        const rhResult = await pool.query(
          "SELECT amount, water_bill, electricity_bill FROM rental_history WHERE id = $1",
          [rental_history_id]
        );
        const rh = rhResult.rows[0];
        if (!rh)
          return res.status(404).json({ error: "Rental history not found" });
        const totalAmount =
          rh.amount + (rh.water_bill || 0) + (rh.electricity_bill || 0);

        const result = await pool.query(
          "INSERT INTO bills (rental_history_id, bill_number, issue_date, amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [rental_history_id, bill_number, issue_date, totalAmount, status]
        );
        res.status(201).json({
          id: result.rows[0].id,
          message: "Bill created",
          amount: totalAmount,
        });
      } catch (err) {
        console.error("Create bill error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  return router;
};
