import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterForm from "./FilterForm";
import AddRentalForm from "./AddRentalForm";
import HistoryTable from "./HistoryTable";

function AddRentalHistory({ token, role, user }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef(null);

  // Filter state
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
    projectId: "",
    ownerId: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    project_id: "",
    rental_date: "",
    amount: "",
    previous_water_meter: "",
    current_water_meter: "",
    previous_electricity_meter: "",
    current_electricity_meter: "",
    electricity_image_path: "",
    water_image_path: "",
    status: "pending",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseParams = role === "user" ? { ownerId: user.id } : {};
        const params = { ...baseParams, ...filters };
        const [historyRes, projectsRes, ownersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/history`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }),
          axios.get(`${API_BASE_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/project-owners`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        // console.log("History response:", historyRes.data); // Debug
        setHistory(historyRes.data);
        setProjects(projectsRes.data);
        setOwners(ownersRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Fetch data error:", error);
        setError(error.response?.data.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
        setLoading(false);
      }
    };
    fetchData();
  }, [token, role, user, filters]);

  const retryFetch = async () => {
    setError("");
    setLoading(true);

    try {
      const baseParams = role === "user" ? { ownerId: user.id } : {};
      const params = { ...baseParams, ...filter };
      const historyRes = await axios.get(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      console.log("Retry history:", historyRes.data); // Debug
      setHistory(historyRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Retry error:", error);
      setError(error.response?.data?.error || "เกิดข้อพลาดในการดึงข้อมูล");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg-px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">บันทึกรายการ</h1>

      <FilterForm
        projects={projects}
        owners={owners}
        filters={filters}
        setFilters={setFilters}
        setCurrentPage={setCurrentPage}
        tableRef={tableRef}
      />

      <AddRentalForm
        token={token}
        role={role}
        user={user}
        projects={projects}
        setHistory={setHistory}
        filters={filters}
        setCurrentPage={setCurrentPage}
        tableRef={tableRef}
      />

      <HistoryTable
        history={history}
        loading={loading}
        error={error}
        retryFetch={retryFetch}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        tableRef={tableRef}
        API_BASE_URL={API_BASE_URL}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default AddRentalHistory;
