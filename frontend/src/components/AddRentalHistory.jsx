import { useState, useEffect } from "react";
import axios from "axios";

function AddRentalHistory({ token, role, user }) {
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const itemsPerPage = 10;

  // Filter state
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    status: "",
    project: "",
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
    status: "pending",
  });

  const [files, setFiles] = useState({
    water_image: null,
    electricity_image: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseParams = role === "user" ? { ownerId: user.id } : {};
        const params = { ...baseParams, ...filter };
        const [historyRes, projectsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/history`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }),
          axios.get(`${API_BASE_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log("History response:", historyRes.data); // Debug
        setHistory(historyRes.data);
        setProjects(projectsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Fetch data error:", error);
        setError(error.response?.data.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
        setLoading(false);
      }
    };
    fetchData();
  }, [token, role, user, filter]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleFilterChange = (e) => {
    const { name, files } = e.target;
    setFiles((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const resetFilter = () => {
    setFilter({
      startDate: "",
      endDate: "",
      status: "",
      projectId: "",
    });
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/history`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const historyId = response.data.id;

      if (files.water_image_image || files.electricity_image) {
        const uploadData = new FormData();
        if (files.water_image)
          uploadData.append("water_image", files.water_image);
        if (files.electricity_image)
          uploadData.append("electricity_image", files.electricity_image);

        await axios.post(
          `${API_BASE_URL}/api/history/${historyId}/upload`,
          uploadData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setSuccess("บันทึกข้อมูลสำเร็จ");
      setFormData({
        project_id: "",
        rental_date: "",
        amount: "",
        previous_water_meter: "",
        current_water_meter: "",
        previous_electricity_meter: "",
        current_electricity_meter: "",
        status: "pending",
      });

      setFiles({ water_image: null, electricity_image: null });

      const baseParams = role === "user" ? { ownerId: user.id } : {};
      const historyRes = await axios.get(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...baseParams, ...filter },
      });
      console.log("Updated history:", historyRes.data); // Debug
      setHistory(historyRes.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Submit error:", error);
      setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึก");
    }
  };

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
      setError(err.response?.data?.error || "เกิดข้อพลาดในการดึงข้อมูล");
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 mt-1 text-gray-800">
        บันทึกรายการ
      </h1>

      {/* ฟอร์มกรอง */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          กรองประวัติ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              วันที่เริ่ม
            </label>
            <input
              type="date"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              สถาน
            </label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring--indigo-600"
            >
              <option value="">ทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              โครงการ
            </label>
            <select></select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRentalHistory;
