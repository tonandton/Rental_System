import { useState, useEffect } from "react";
import axios from "axios";

function FilterForm({
  showFilter,
  setShowFilter,
  projects,
  history,
  setHistoty,
  token,
  role,
}) {
  const [filterProject, setFilterProject] = useState("");
  const [filterWaterMin, setFilterWaterMin] = useState("");
  const [filterWaterMax, setFilterWaterMax] = useState("");
  const [filterElectricityMax, setFilterElectricityMax] = useState("");
  const [filterElectricityMin, setFilterElectricityMin] = useState("");
  const [filterRecordMonth, setFilterRecordMonth] = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [usernames, setUsernames] = useState([]);

  useEffect(() => {
    if (Array.isArray(history)) {
      const uniqueUsernames = [
        ...new Set(history.map((h) => h.username).filter(Boolean)),
      ];
      setUsernames(uniqueUsernames);
    } else {
      console.warn("⚠️ history is not an array:", history);
    }
  }, [history]);

  const handleFilter = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        "http://localhost:3001/api/history/filter",
        {
          project_name: filterProject,
          water_cost_min: filterWaterMin ? parseFloat(filterWaterMin) : null,
          water_const_man: filterWaterMax ? parseFloat(filterWaterMax) : null,
          electricity_cost_min: filterElectricityMin
            ? parseFloat(filterElectricityMin)
            : null,
          electricity_cost_max: filterElectricityMax
            ? parseFloat(filterElectricityMax)
            : null,
          record_month: filterRecordMonth || null,
          username: filterUsername || null,
        },
        { headers }
      );
      setHistoty(response.data);
    } catch (err) {
      console.error("Error filtering history:", err);
    }
  };

  const handleResetFilter = () => {
    setFilterProject("");
    setFilterWaterMin("");
    setFilterWaterMax("");
    setFilterElectricityMax("");
    setFilterElectricityMin("");
    setFilterRecordMonth("");
    setFilterUsername("");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios
      .get("http://localhost:3001/api/history", { headers })
      .then((response) => {
        setHistoty(response.data);
      })
      .catch((error) => {
        console.error("Error fetching history:", error);
      });
  };

  if (!showFilter) {
    return (
      <div className="p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between item-center mb-4 gap-2">
          <span></span>
          <button
            onClick={() => setShowFilter(true)}
            className="bg-blue-500 text-white hover:bg-blue-600 w-full sm:w-auto animate-fade-in"
          >
            แสดงตัวกรอง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">กรองข้อมูล</h2>
        <button
          onClick={() => setShowFilter(false)}
          className="bg-yellow-400 text-white hover:bg-yellow-500 font-bold"
        >
          ซ่อนตัวกรอง
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm-gap-4">
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">ทุกโครงการ</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.name}>
              {proj.name}
            </option>
          ))}
        </select>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            placeholder="ค่าน้ำขั้นต่ำ (บาท)"
            value={filterWaterMin}
            onChange={(e) => setFilterWaterMin(e.target.value)}
            className="flex-1"
          />
          <input
            type="number"
            placeholder="ค่าน้ำสูงสุด (บาท)"
            value={filterWaterMax}
            onChange={(e) => setFilterWaterMax(e.target.value)}
            className="flex-1"
          />
          <input
            type="number"
            placeholder="ค่าไฟขั้นต่ำ (บาท)"
            value={filterElectricityMin}
            onChange={(e) => setFilterElectricityMin(e.target.value)}
            className="flex-1"
          />
          <input
            type="number"
            placeholder="ค่าไฟสูงสุด (บาท)"
            value={filterElectricityMax}
            onChange={(e) => setFilterElectricityMax(e.target.value)}
            className="flex-1"
          />
        </div>
        <input
          type="month"
          placeholder="เดือนที่บันทึก"
          value={filterRecordMonth}
          onChange={(e) => setFilterRecordMonth(e.target.value)}
        />
        <select
          value={filterUsername}
          onChange={(e) => setFilterUsername(e.target.value)}
        >
          <option value="">ชื่อผู้บันทึก</option>
          {usernames.map((username) => (
            <option key={username} value={username}>
              {username}
            </option>
          ))}
        </select>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleFilter}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            กรอง
          </button>
          <button
            onClick={handleResetFilter}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            ล้างข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterForm;
