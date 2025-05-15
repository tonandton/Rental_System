import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Calendar, Droplet, Warehouse, Zap } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddRentalHistory({ token, role, user }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [popupImage, setPopupImage] = useState(null);
  const [activeTab, setActiveTab] = useState("water");
  const tableRef = useRef(null);

  // Filter state
  const [filter, setFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
    projectId: "",
    ownerId: "",
  });

  const [tempFilter, setTempFilter] = useState({ ...filter });

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

  // File image
  const [files, setFiles] = useState({
    water_image: null,
    electricity_image: null,
  });

  // Previews file image
  const [previews, setPreviews] = useState({
    water_image: null,
    electricity_image: null,
  });

  //   Dropdown option
  const months = [
    { value: "", label: "ทั้งหมด" },
    { value: "1", label: "มกราคม" },
    { value: "2", label: "กุมภาพันธ์" },
    { value: "3", label: "มีนาคม" },
    { value: "4", label: "เมษายน" },
    { value: "5", label: "พฤษภาคม" },
    { value: "6", label: "มิถุนายน" },
    { value: "7", label: "กรกฎาคม" },
    { value: "8", label: "สิงหาคม" },
    { value: "9", label: "กันยายน" },
    { value: "10", label: "ตุลาคม" },
    { value: "11", label: "พฤศจิกายน" },
    { value: "12", label: "ธันวาคม" },
  ];

  const currentYear = new Date().getFullYear();
  const years = [
    { value: "", label: "ทั้งหมด" },
    ...Array.from({ length: 4 }, (_, i) => ({
      value: String(currentYear - 1 + i),
      label: String(currentYear - 1 + i),
    })),
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseParams = role === "user" ? { ownerId: user.id } : {};
        const params = { ...baseParams, ...filter };
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
  }, [token, role, user, filter]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [name]: url }));
      setFiles((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleRemoveFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: null }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleTempFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const resetFilter = () => {
    setFilters({
      startDate: "",
      endDate: "",
      month: "",
      year: "",
      projectId: "",
      ownerId: "",
    });
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const safeNumber = (val) => {
      return val === "" ? null : Number(val);
    };

    const sanitizedFormData = {
      ...formData,
      amount: safeNumber(formData.amount),
      previous_water_meter: safeNumber(formData.previous_water_meter),
      current_water_meter: safeNumber(formData.current_water_meter),
      previous_electricity_meter: safeNumber(
        formData.previous_electricity_meter
      ),
      current_electricity_meter: safeNumber(formData.current_electricity_meter),
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/history`,
        sanitizedFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const historyId = response.data.id;

      if (files.water_image || files.electricity_image) {
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

      setFiles({ water_image: null, electricity_image: null });
      setPreviews({ water_image: null, electricity_image: null });
      // setSuccess("✅ บันทึกสำเร็จแล้ว!");
      toast.success("บันทึกสำเร็จแล้ว!", { autoClose: 3000 });
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: "smooth" }, 500);
      });
      setFormData({
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

      setFiles({ water_image: null, electricity_image: null });

      const baseParams = role === "user" ? { ownerId: user.id } : {};
      const historyRes = await axios.get(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...baseParams, ...filter },
      });
      // console.log("Updated history:", historyRes.data); // Debug
      setHistory(historyRes.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Submit error:", error);
      setError(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึก");
      toast.error("บันทึกไม่สำเร็จ", { autoClose: 3000 });
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
      setError(error.response?.data?.error || "เกิดข้อพลาดในการดึงข้อมูล");
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg-px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">บันทึกรายการ</h1>

      {/* ฟอร์มกรอง */}
      <div className="bg-white shadow-xl rounded-xl p-6 mb-8 border border-green-100">
        <div
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
            🔍 ค้นหารายการ
          </h2>
          {isFilterOpen ? (
            <ChevronUpIcon className="h-6 w-6 text-green-600" />
          ) : (
            <ChevronDownIcon className="h-6 w-6 text-green-600" />
          )}
        </div>
        {isFilterOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-slide-in">
            <div>
              <label htmlFor="startDate">วันที่เริ่ม</label>

              <input
                type="date"
                name="startDate"
                value={tempFilter.startDate}
                onChange={handleTempFilterChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>

            <div>
              <label htmlFor="endDate">วันที่สิ้นสุด</label>

              <input
                type="date"
                name="endDate"
                value={tempFilter.endDate}
                onChange={handleTempFilterChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>

            <div className="relative mt-1">
              <label htmlFor="month">เดือน</label>
              <div className="relative">
                <select
                  name="month"
                  value={tempFilter.month}
                  onChange={handleTempFilterChange}
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 12a1 1 0 01-.7-.3l-4-4a1 1 0 011.4-1.4L10 9.58l3.3-3.3a1 1 0 011.4 1.42l-4 4a1 1 0 01-.7.3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative mt-1">
              <label htmlFor="year">ปี</label>
              <div className="relative">
                <select
                  name="year"
                  value={tempFilter.year}
                  onChange={handleTempFilterChange}
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
                >
                  {years.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 12a1 1 0 01-.7-.3l-4-4a1 1 0 011.4-1.4L10 9.58l3.3-3.3a1 1 0 011.4 1.42l-4 4a1 1 0 01-.7.3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative mt-1">
              <label htmlFor="projectId">โครงการ</label>
              <div className="relative">
                <select
                  name="projectId"
                  value={tempFilter.projectId}
                  onChange={handleTempFilterChange}
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
                >
                  <option value="">ทุกโครงการ</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 12a1 1 0 01-.7-.3l-4-4a1 1 0 011.4-1.4L10 9.58l3.3-3.3a1 1 0 011.4 1.42l-4 4a1 1 0 01-.7.3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative mt-1">
              <label>เจ้าของโครงการ</label>
              <div className="relative">
                <select
                  name="ownerId"
                  value={tempFilter.ownerId}
                  onChange={handleTempFilterChange}
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
                >
                  <option value="">ทั้งหมด</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.first_name} {owner.last_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 12a1 1 0 01-.7-.3l-4-4a1 1 0 011.4-1.4L10 9.58l3.3-3.3a1 1 0 011.4 1.42l-4 4a1 1 0 01-.7.3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2 md:col-span-3 flex flex-wrap gap-4 mt-2">
              <button
                onClick={() => {
                  handleApplyFilter();
                  setFilters(tempFilter);
                  setCurrentPage(1);
                  toast.success("ค้นหาข้อมูลเรียบร้อยแล้ว", {
                    autoClose: 2000,
                  });
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                🔍 ค้นหา
              </button>
              <button
                onClick={resetFilter}
                className="bg-yellow-300 text-gray-700 px-6 py-2 rounded-md hover:bg-yellow-400 transition"
              >
                🧹 รีเซ็ต
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ฟอร์มบันทึก */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-green-100">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            ➕ เพิ่มรายการ
          </h2>
          {/* {isFormOpen ? (
            <ChevronUpIcon className="h-6 w-6 text-green-600" />
          ) : (
            <ChevronDownIcon className="h-6 w-6 text-green-600" />
          )} */}
        </div>

        <div className="mt-4 animate-slide-in">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("water")}
              className={`px-5 py-2 rounded-md font-medium ${
                activeTab === "water"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-100"
              }`}
            >
              <Droplet size={16} /> ค่าน้ำ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("electricity")}
              className={`px-5 py-2 rounded-md font-medium ${
                activeTab === "electricity"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-amber-100"
              }`}
            >
              <Zap size={16} /> ค่าไฟ
            </button>
          </div>

          {error && <p className="text-red-600 mb-4"></p>}
          {success && <p className="text-green-600 mb-4">{success}</p>}
          <div>
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-xl shadow-md space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative mt-1">
                  <label>
                    <Warehouse size={16} />
                    โครงการ
                  </label>
                  <div className="relative">
                    <select
                      name="project_id"
                      value={formData.project_id}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">เลือกโครงการ</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 12a1 1 0 01-.7-.3l-4-4a1 1 0 011.4-1.4L10 9.58l3.3-3.3a1 1 0 011.4 1.42l-4 4a1 1 0 01-.7.3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label>
                    <Calendar size={16} /> วันที่ลงวันที่ลง
                  </label>
                  <input
                    type="date"
                    name="rental_date"
                    value={formData.rental_date}
                    onChange={handleFormChange}
                    required
                    className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
                  />
                  {/* <div>
                    <label >
                      จำนวนเงิน (บาท)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
                    />
                  </div> */}
                </div>
              </div>

              {/* ค่าน้ำ */}
              {activeTab === "water" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-in">
                  <div>
                    <label>
                      <Droplet size={16} /> มิเตอร์น้ำรอบที่ผ่านมา
                    </label>
                    <input
                      type="number"
                      name="previous_water_meter"
                      value={formData.previous_water_meter}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className="border-blue-500 focus:border-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label>
                      <Droplet size={16} /> มิเตอร์น้ำปัจจุบัน
                    </label>
                    <input
                      type="number"
                      name="current_water_meter"
                      value={formData.current_water_meter}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className="border-blue-500 focus:border-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-4">
                      <Droplet size={16} className="inline-block mr-1" />
                      รูปมิเตอร์น้ำ
                    </label>

                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="water_image"
                        className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
                      >
                        📷 เลือกรูปภาพ
                      </label>

                      <span className="text-sm text-gray-600 truncate w-40">
                        {files.water_image?.name || "ยังไม่ได้เลือกรูป"}
                      </span>
                    </div>

                    <input
                      id="water_image"
                      type="file"
                      name="water_image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    {previews.water_image && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={previews.water_image}
                          alt="พรีวิวมิเตอร์น้ำ"
                          className="w-32 h-auto rounded-md shadow"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("water_image")}
                          className="text-sm text-red-600 hover:underline"
                        >
                          ลบ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ค่าไฟ */}
              {activeTab === "electricity" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-in">
                  <div>
                    <label>
                      <Zap size={16} /> มิเตอร์ไฟรอบที่ผ่านมา
                    </label>
                    <input
                      type="number"
                      name="previous_electricity_meter"
                      value={formData.previous_electricity_meter}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className="border-amber-500 focus:border-amber-600 focus:ring-amber-600"
                    />
                  </div>
                  <div>
                    <label>
                      <Zap size={16} /> มิเตอร์ไฟปัจจุบัน
                    </label>
                    <input
                      type="number"
                      name="current_electricity_meter"
                      value={formData.current_electricity_meter}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className="border-amber-500 focus:border-amber-600 focus:ring-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-4">
                      <Zap size={16} className="inline-block mr-1" />
                      รูปมิเตอร์ไฟ
                    </label>

                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="electricity_image"
                        className="cursor-pointer px-4 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition"
                      >
                        📷 เลือกรูปภาพ
                      </label>

                      <span className="text-sm text-gray-600 truncate w-40">
                        {files.electricity_image?.name || "ยังไม่ได้เลือกรูป"}
                      </span>
                    </div>

                    <input
                      id="electricity_image"
                      type="file"
                      value={formData.electricity_image_path}
                      name="electricity_image"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    {previews.electricity_image && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={previews.electricity_image}
                          alt="พรีวิวมิเตอร์ไฟ"
                          className="mt-2 w-52 h-auto rounded-lg shadow border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("electricity_image")}
                          className="text-sm text-red-600 hover:underline"
                        >
                          ลบ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  📝 บันทึก
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      project_id: "",
                      rental_date: "",
                      amount: "",
                      previous_water_meter: "",
                      current_water_meter: "",
                      previous_electricity_meter: "",
                      current_electricity_meter: "",
                      status: "pending",
                    })
                  }
                  className="bg-yellow-300 text-gray-700 px-6 py-2 rounded-md hover:bg-yellow-400 transition"
                >
                  🧹 รีเซ็ต
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ตาราง */}
      <div className="bg-white shadow-lg rounded-xl p-6 border" ref={tableRef}>
        <div
        // className="flex justify-between items-center cursor-pointer"
        // onClick={() => setIsTableOpen(!isTableOpen)}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            🧾 ข้อมูลรายการ
          </h2>
          {/* {isTableOpen ? (
            <ChevronUpIcon className="h-6 w-6 text-green-600" />
          ) : (
            <ChevronDownIcon className="w-6 text-green-600" />
          )} */}
        </div>
        {/* {isTableOpen && ( */}
        <div className="mt-4 animate-slide-in">
          {loading ? (
            <p className="text-gray-600">กำลังโหลด...</p>
          ) : error ? (
            <div className="text-red-600">
              <p>{error}</p>
              <button onClick={retryFetch} className="">
                ลองใหม่
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="">
                  <thead className="bg-green 50">
                    <tr>
                      <th>รอบวันที่</th>
                      <th>โครงการ</th>
                      <th>เจ้าของโครงการ</th>
                      <th>มิเตอร์รอบที่ผ่านมา</th>
                      <th>มิเตอร์รอบปัจจุบัน</th>
                      <th>รูปมิเตอร์รอบปัจจุบัน</th>
                      <th>หน่วย</th>
                      <th>รวมค่าน้ำ</th>
                      <th>มิเตอร์ไฟรอบที่ผ่านมา</th>
                      <th>มิเตอร์ไฟรอบปัจจุบัน</th>
                      <th>รูปมิเตอร์ไฟรอบปัจจุบัน</th>
                      <th>หน่วย</th>
                      <th>รวมค่าไฟ</th>
                      <th>ผู้บันทึก</th>
                      <th>วันที่ลงข้อมูล</th>
                      <th>วันที่อัพเดทข้อมูล</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.length === 0 ? (
                      <tr>
                        <td>ไม่พบรายการ</td>
                      </tr>
                    ) : (
                      paginatedHistory.map((item, index) => (
                        <tr key={`${item.is}-${index}`}>
                          <td>
                            {new Date(item.rental_date).toLocaleString(
                              "th-TH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td>{item.project_name}</td>
                          <td>{item.owner_first_name}</td>
                          <td>{Math.floor(item.previous_water_meter)}</td>
                          <td>{Math.floor(item.current_water_meter)}</td>
                          <td>
                            {item.water_image_path && (
                              <img
                                src={`${API_BASE_URL}${item.water_image_path}`}
                                alt="รูปค่าน้ำ"
                                style={{
                                  width: "60px",
                                  height: "auto",
                                  borderRadius: "6px",
                                  cursor: "Pointer",
                                }}
                                onClick={() =>
                                  setPopupImage(
                                    `${API_BASE_URL}${item.water_image_path}`
                                  )
                                }
                              />
                            )}
                            {popupImage && (
                              <div
                                className="fixed inset-0 flex items-center justify-center z-50"
                                onClick={() => setPopupImage(null)}
                              >
                                <img
                                  src={popupImage}
                                  alt="ภาพใหญ่"
                                  className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                                />
                              </div>
                            )}
                          </td>
                          <td>{Math.floor(item.water_units)}</td>
                          <td>{item.water_bill}</td>
                          <td>{Math.floor(item.previous_electricity_meter)}</td>
                          <td>{Math.floor(item.current_electricity_meter)}</td>
                          <td>
                            {item.electricity_image_path && (
                              <img
                                src={`${API_BASE_URL}${item.electricity_image_path}`}
                                alt="รูปค่าไฟ"
                                style={{
                                  width: "60px",
                                  height: "auto",
                                  borderRadius: "6px",
                                  cursor: "Pointer",
                                }}
                                onClick={() =>
                                  setPopupImage(
                                    `${API_BASE_URL}${item.electricity_image_path}`
                                  )
                                }
                              />
                            )}
                            {popupImage && (
                              <div
                                className="fixed inset-0 flex items-center justify-center z-50"
                                onClick={() => setPopupImage(null)}
                              >
                                <img
                                  src={popupImage}
                                  alt="ภาพใหญ่"
                                  className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                                />
                              </div>
                            )}
                          </td>
                          <td>{Math.floor(item.electricity_units)}</td>
                          <td>{item.electricity_bill}</td>
                          <td>{item.username}</td>
                          <td>
                            {" "}
                            {new Date(item.created_at).toLocaleString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>
                            {new Date(item.updated_at).toLocaleString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-6 py-2 rounded-full text-white transition ${
                      currentPage === 1
                        ? "bg-gray-300"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    ก่อนหน้า
                  </button>
                  <span className="text-sm text-gray-600">
                    หน้า {currentPage} จาก {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-6 py-2 rounded-full text-white transition ${
                      currentPage === totalPages
                        ? "bg-gray-300"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    ถัดไป
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {/* )} */}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default AddRentalHistory;
