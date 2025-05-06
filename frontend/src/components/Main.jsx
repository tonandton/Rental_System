import { useState, useEffect } from "react";
import axios from "axios";

function Main({ token, role, setToken, setRole }) {
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, historyRes, billsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/history`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 5 },
          }),
          role === "superadmin"
            ? axios.get(`${API_BASE_URL}/api/bills`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: "pending" },
              })
            : Promise.resolve({ data: [] }),
        ]);
        setProjects(projectsRes.data);
        setHistory(historyRes.data);
        setBills(billsRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
        setLoading(false);
      }
    };
    fetchData();
  }, [token, role]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">ภาพรวมระบบเช่า</h1>
      {loading ? (
        <p className="text-gray-600">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* การ์ดโครงการ */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              โครงการทั้งหมด
            </h2>
            <p className="text-3xl font-bold text-indigo-600">
              {projects.length}
            </p>
            <p className="text-gray-600 mt-2">โครงการที่จัดการในระบบ</p>
          </div>
          {/* การ์ดประวัติการเช่า */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ประวัติการเช่าล่าสุด
            </h2>
            {history.length === 0 ? (
              <p className="text-gray-600">ไม่มีประวัติ</p>
            ) : (
              <ul className="space-y-2">
                {history.map((item) => (
                  <li key={item.id} className="text-sm text-gray-700">
                    <span className="font-medium">{item.project_name}</span> -{" "}
                    {new Date(item.rental_date).toLocaleDateString("th-TH")} -{" "}
                    {item.amount.toLocaleString("th-TH")} บาท
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* การ์ดใบแจ้งหนี้ */}
          {role === "superadmin" && (
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ใบแจ้งหนี้ค้างชำระ
              </h2>
              <p className="text-3xl font-bold text-indigo-600">
                {bills.length}
              </p>
              <p className="text-gray-600 mt-2">ใบแจ้งหนี้ที่รอการชำระ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Main;
