import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Nav";
import FilterForm from "./FilterForm";
import History from "./History";

function Main({ token, role, setToken, setRole }) {
  const [project, setProject] = useState("");
  const [projectWaterRate, setProjectWaterRate] = useState("");
  const [projectElectricityRate, setProjectElectricityRate] = useState("");
  const [projects, setProjects] = useState([]);
  const [rent, setRent] = useState("");
  const [waterMeter, setWtaterMeter] = useState("");
  const [electricityMeter, setElectricityMeter] = useState("");
  const [recordMonth, setRecordMonth] = useState("");
  const [history, setHistory] = useState([]);
  const [bill, setBill] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchHistory();
  });

  const fetchProjects = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get("http://localhost:3001/api/projects", {
        headers,
      });
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get("http://localhost:3001/api/history", {
        headers,
      });
      setHistory(response.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-4 mb-4 sm:mb-6">
          ระบบจัดการค่าเช่าห้อง
        </h1>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            บันทึกค่าใช้จ่าย
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="p-2 border rounded text-sm sm:text-base"
            >
              <option value="">เลือกโครงการ</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>

            <input type="month" placeholder="เดือนที่บันทึก (YYYY-MM)" />
            <input type="number" placeholder="ค่าเช่าห้อง (บาท)" />
            <input type="number" placeholder="เลขมิเตอร์น้ำ" />
            <input type="number" placeholder="เลขมิเตอร์ไฟ" />
            <div></div>
            <input
              value="บันทึก"
              type="submit"
              className="min-w-[100px] bg-green-500 text-white text-sm sm:text-base p-2 rounded hover:bg-green-600  cursor-pointer"
            />
            <input
              value="ล้างข้อมูล"
              type="submit"
              className="min-w-[100px] border-red-500 text-sm sm:text-base p-2 rounded hover:border-red-600 hover:text-red-500  cursor-pointer"
            />
          </div>
        </div>
        <FilterForm
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          projects={projects}
          history={history}
          setHistory={setHistory}
          token={token}
          role={role}
        />
        <History history={history} role={role} setBill={setBill} />
      </div>
    </div>
  );
}

export default Main;
