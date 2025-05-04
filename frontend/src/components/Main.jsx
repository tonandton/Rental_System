import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Nav";
import FilterForm from "./FilterForm";
import History from "./History";

function Main({ token, role, setToken, setRole }) {
  const [histoty, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    projectId: "",
    status: "",
    ownerName: "",
    recorderUsername: "",
    username: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ดึงข้อมูลประวัติการเช่า
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.status) params.status = filters.status;
      if (filters.ownerName) params.ownerName = filters.ownerName;
      if (filters.recorderUsername)
        params.recorderUsername = filters.recorderUsername;
      if (filters.username) params.username = filters.username;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      setHistory(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลโครงการ
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ");
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchHistory();
    }
  }, [token, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar token={token} role={role} setToken={setToken} setRole={setRole} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">แดชบอร์ด</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <FilterForm
          projects={projects}
          onFilterChange={handleFilterChange}
          role={role}
          token={token}
        />
        {loading ? (
          <p className="text-gray-500">กำลังโหลด....</p>
        ) : (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">รายการ</h2>
            <History history={histoty} role={role} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
