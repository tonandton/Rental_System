import { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import { RefreshCw, Search } from "lucide-react";

function FilterForm({
  user,
  role,
  projects,
  owners,
  filters,
  setFilters,
  setCurrentPage,
  tableRef,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState({
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
    month: filters.month || "",
    year: filters.year || "",
    projectId: filters.projectId || "",
    ownerId: filters.ownerId || "",
  });

  useEffect(() => {
    setTempFilter({
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
      month: filters.month || "",
      year: filters.year || "",
      projectId: filters.projectId || "",
      ownerId: filters.ownerId || "",
    });
  }, [filters]);

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
    ...Array.from({ length: 5 }, (_, i) => ({
      value: String(currentYear - 1 + i),
      label: String(currentYear - 1 + i),
    })),
  ];

  const handleTempFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilter((prev) => ({ ...prev, [name]: value }));
  };

  const vaildateFilers = () => {
    if (tempFilter.startDate && tempFilter.endDate) {
      const start = new Date(tempFilter.startDate);
      const end = new Date(tempFilter.endDate);

      if (start > end) {
        toast.error("วันที่เริ่มต้องไม่มากกว่าวันที่สิ้นสุด", {
          autoClose: 3000,
        });
        return false;
      }
    }
    return true;
  };

  // Filter RealTime
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const resetFilter = () => {
    const resetState = {
      startDate: "",
      endDate: "",
      month: "",
      year: "",
      projectId: "",
      ownerId: "",
    };
    setFilters(resetState);
    setTempFilter(resetState);
    setCurrentPage(1);
    tableRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleApplyFilter = () => {
    if (!vaildateFilers()) return;
    setFilters(tempFilter);
    setCurrentPage(1);
    toast.success("ค้นหาข้อมูลเรียบร้อยแล้ว", { autoClose: 3000 });
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 mb-8 border border-green-100">
      <div
        className="flex justify-between items-center cursor-pointer mb-2"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Search size={20} className="text-green-600" /> ค้นหารายการ
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
          {role === "user" ? (
            <div className="mt-1">
              <label>เจ้าของโครงการ</label>
              <input
                type="text"
                value={`${user.first_name} ${user.last_name}`}
                disabled
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>
          ) : (
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
          )}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 flex flex-wrap gap-4 mt-2">
            <button
              onClick={handleApplyFilter}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              <Search size={16} className="inline-block mr-1" /> ค้นหา
            </button>
            <button
              onClick={resetFilter}
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

export default FilterForm;
