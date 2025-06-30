// ฟังก์ชัน generate PDF ที่ดูดี + สบายตา + Layout เป็นระบบมืออาชีพ
const path = require("path");
const moment = require("moment");
moment.locale("th");

function generateInvoiceLayout(doc, data, historyId) {
  const formatDate = (date) =>
    moment(date).add(543, "year").format("D MMMM YYYY");

  const total =
    Number(data.water_bill || 0) + Number(data.electricity_bill || 0);
  const ownerName = `${data.owner_first_name || "-"} ${
    data.owner_last_name || ""
  }`;
  const fullName = `${data.first_name} ${data.last_name}`;

  // ฟอนต์
  doc.registerFont(
    "THSarabun",
    path.join(__dirname, "../../fonts/Sarabun-Regular.ttf")
  );
  doc.font("THSarabun");

  // Header พร้อมโลโก้
  doc.image(path.join(__dirname, "../../assets/logo.png"), 50, 40, {
    width: 50,
  });

  doc
    .fontSize(20)
    .fillColor("#2e7d32")
    // .text("MESUK SOCIETY", 110, 45)
    .fontSize(14)
    .fillColor("#000")
    .text("ใบแจ้งหนี้ค่าน้ำ/ไฟ", 230, 68);

  doc
    .fontSize(10)
    .fillColor("#444")
    .text(`เลขที่ใบแจ้งหนี้: ${historyId}`, 400, 50)
    .text(`วันที่ออก: ${formatDate(new Date())}`, 400, 65)
    .moveDown(3);

  // ข้อมูลผู้เช่าและโครงการ
  doc
    .fontSize(12)
    .fillColor("#000")
    // .text(`ชื่อผู้เช่า: ${fullName}`, 50)
    .text(`เจ้าของโครงการ: ${ownerName}`, 50)
    .text(`โครงการ: ${data.project_name}`, 50)
    .text(`รอบวันที่: ${formatDate(data.rental_date)}`, 50)
    .moveDown(2);

  // หัวตาราง
  const tableTop = doc.y;
  const colX = [50, 150, 230, 310, 410];
  const colWidths = [100, 80, 80, 100];

  const headers = [
    "รายการ",
    "มิเตอร์ก่อน",
    "มิเตอร์หลัง",
    "หน่วยที่ใช้",
    "จำนวนเงิน (บาท)",
  ];
  headers.forEach((h, i) => {
    doc
      .fillColor("white")
      .rect(colX[i], tableTop, colWidths[i] || 100, 24)
      .fill("#2e7d32")
      .fillColor("white")
      .fontSize(11)
      .text(h, colX[i] + 5, tableTop + 6);
  });

  doc.moveDown();
  let y = tableTop + 26;
  const rows = [
    [
      "ค่าน้ำ",
      data.previous_water_meter,
      data.current_water_meter,
      data.water_units,
      Number(data.water_bill).toFixed(2),
    ],
    [
      "ค่าไฟ",
      data.previous_electricity_meter,
      data.current_electricity_meter,
      data.electricity_units,
      Number(data.electricity_bill).toFixed(2),
    ],
  ];

  rows.forEach((row) => {
    row.forEach((cell, i) => {
      doc
        .fillColor("#000")
        .fontSize(11)
        .rect(colX[i], y, colWidths[i] || 100, 22)
        .stroke("#ccc")
        .text(String(cell), colX[i] + 5, y + 6);
    });
    y += 24;
  });

  doc.moveDown(2);

  // รวมทั้งหมด
  doc
    .fontSize(14)
    .fillColor("#2e7d32")
    .text(`รวมทั้งหมด: ${total.toFixed(2)} บาท`, 360, y + 10, {
      underline: true,
    });

  const supportedExtensions = [".jpg", ".jpeg", ".png"];
  const extwater = path.extname(data.water_image_path || "").toLowerCase();
  const extelectric = path
    .extname(data.electricity_image_path || "")
    .toLowerCase();

  if (supportedExtensions.includes(extwater)) {
    doc.image(path.join(__dirname, "../../" + data.water_image_path), 50, y, {
      fit: [100, 100],
    });
  } else {
    console.warn("⚠️ รูปค่าน้ำไม่รองรับ:", extwater);
  }

  if (supportedExtensions.includes(extelectric)) {
    doc.image(
      path.join(__dirname, "../../" + data.electricity_image_path),
      50,
      y,
      {
        fit: [120, 120],
      }
    );
  } else {
    console.warn("⚠️ รูปค่าไฟไม่รองรับ:", extelectric);
  }

  // หมายเหตุ
  if (data.water_description || data.electricity_description) {
    doc
      .moveDown(5)
      .fontSize(12)
      .fillColor("#555")
      .text(
        `หมายเหตุ: ${data.water_description || ""} ${
          data.electricity_description || ""
        }`,
        50
      );
  }

  // ลายเซ็น
  doc.moveDown(20).fillColor("fff");
  doc.text("................................................", 350);
  doc.text("ลายเซ็นเจ้าหน้าที่", 390);

  // Footer
  doc.moveDown(4);
  doc
    .fontSize(10)
    .fillColor("#999")
    .text("ขอบคุณที่ใช้บริการ MESUK SOCIETY", 210);
}

module.exports = generateInvoiceLayout;
