// เพิ่ม imports ตามเดิม
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import { RefreshCw, Search } from "lucide-react";
import { useEffect } from "react";
import axios from "axios";

function ProjectFilterForm({ filters, setFilters, owners, tableRef, token }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState({ ...filters });
  const [allProjects, setAllProjects] = useState([]);
  const [projects, setProjects] = useState([]); // ใช้แสดงรายการแบบกรองแล้ว

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllProjects(res.data);
        setProjects(res.data);
      } catch (error) {
        console.error("Fetch projects failed:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleTempFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    setFilters(tempFilter);
    toast.success("กรองข้อมูลสำเร็จ", { autoClose: 2000 });
    setTimeout(() => {
      tableRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleReset = () => {
    const reset = {
      name: "",
      name_unit: "",
      name_type: "",
      address: "",
      status: "",
      ownerId: "",
    };
    setTempFilter(reset);
    setFilters(reset);
    toast.success("รีเซ็ตตัวกรองแล้ว", { autoClose: 2000 });
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-green-100">
      <div
        className="flex justify-between items-center cursor-pointer mb-2"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Search size={20} className="text-green-600" /> ค้นหาโครงการ
        </h2>
        {isFilterOpen ? (
          <ChevronUpIcon className="h-6 w-6 text-green-600" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 text-green-600" />
        )}
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 animate-slide-in">
          {/* Search by code project */}
          <div>
            <label htmlFor="name">รหัสโครงการ</label>
            <input
              type="text"
              name="name"
              value={tempFilter.name}
              onChange={handleTempFilterChange}
              placeholder="ค้นหารหัสโครงการ"
              className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
            />
          </div>

          {/* Search by project unit */}
          <div>
            <label htmlFor="name_unit">อาคาร / ห้อง </label>
            <input
              type="text"
              name="name_unit"
              value={tempFilter.name_unit || ""}
              onChange={handleTempFilterChange}
              placeholder="ค้นหาอาคาร/ห้อง"
              className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
            />
          </div>

          {/* Search by project type */}
          <div>
            <label htmlFor="name_type">ประเภทโครงการ</label>
            <select
              type="text"
              name="name_type"
              value={tempFilter.name_type}
              onChange={handleTempFilterChange}
              placeholder="ค้นหาประเภทโครงการ"
              className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
            >
              <option value="">ทั้งหมด</option>
              {[...new Set(allProjects.map((project) => project.name_type))]
                .filter((name) => !!name)
                .map((name_type, index) => (
                  <option key={index} value={name_type}>
                    {name_type}
                  </option>
                ))}
            </select>
          </div>

          {/* Search by address */}
          <div>
            <label htmlFor="address">ที่อยู่</label>
            <input
              type="text"
              name="address"
              value={tempFilter.address}
              onChange={handleTempFilterChange}
              placeholder="ค้นหาที่อยู่"
              className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
            />
          </div>

          {/* Filter by status */}
          <div>
            <label htmlFor="status">สถานะ</label>
            <select
              name="status"
              value={tempFilter.status}
              onChange={handleTempFilterChange}
              className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
            >
              <option value="">ทั้งหมด</option>
              <option value="true">Active</option>
              <option value="false">Non-active</option>
            </select>
          </div>

          {/* Filter by owner */}
          <div>
            <label htmlFor="ownerId">เจ้าของโครงการ</label>
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
          </div>

          {/* Buttons */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 flex flex-wrap gap-4 mt-2">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              <Search size={16} className="inline-block mr-1" /> ค้นหา
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-yellow-300 text-gray-700 px-4 py-2 rounded-md hover:bg-yellow-400 transition"
            >
              <RefreshCw size={16} className="inline-block mr-1" /> รีเซ็ต
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectFilterForm;
