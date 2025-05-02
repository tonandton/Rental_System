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
  const [waterMeter, setWaterMeter] = useState("");
  const [electricityMeter, setElectricityMeter] = useState("");
  const [recordMonth, setRecordMonth] = useState("");
  const [waterImage, setWaterImage] = useState(null);
  const [electricityImage, setElectricityImage] = useState(null);
  const [waterImagePreview, setWaterImagePreview] = useState(null);
  const [electricityImagePreview, setElectricityImagePreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [bill, setBill] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchHistory();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project || !projects.some((p) => p.id === parseInt(project))) {
      alert("กรุณาเลือกโครงการ");
      return;
    }
    if (!recordMonth) {
      alert("กรุณาเลือกเดือนที่บันทึก");
      return;
    }

    const formData = new FormData();
    formData.append("project_id", parseFloat(project));
    formData.append("rent", rent || "0");
    formData.append("water_meter", waterMeter || "0");
    formData.append("electricity_meter", electricityMeter || "0");
    formData.append("record_month", recordMonth);
    if (waterImage) formData.append("water_image", waterImage);
    if (electricityImage)
      formData.append("electricity_image", electricityImage);

    try {
      await axios.post("http://localhost:3001/api/history", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchHistory();
      resetForm();
    } catch (err) {
      alert(
        "ไม่สามารถบันทึกข้อมูลได้: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const resetForm = () => {
    setProject("");
    setProjectWaterRate("");
    setProjectElectricityRate("");
    setRent("");
    setWaterMeter("");
    setElectricityMeter("");
    setRecordMonth("");
    setWaterImage(null);
    setElectricityImage(null);
    setWaterImagePreview(null);
    setElectricityImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar token={token} role={role} setToken={setToken} setRole={setRole} />
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-4 mb-4 sm:mb-6">
          ระบบจัดการค่าใช้จ่ายโครงการ
        </h1>
        {(role === "user" || role === "superuser") && (
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

              <input
                type="month"
                value={recordMonth}
                onChange={(e) => setRecordMonth(e.target.value)}
                placeholder="เดือนที่บันทึก (YYYY-MM)"
                className="p-2 border rounded text-sm sm:text-base"
              />
              {/* <input
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="ค่าเช่าห้อง (บาท)"
              className="p-2 border rounded text-sm sm:text-base"
            /> */}
              <input
                type="number"
                placeholder="เลขมิเตอร์น้ำ"
                value={waterMeter}
                onChange={(e) => setWaterMeter(e.target.value)}
                className="p-2 border rounded text-sm sm:text-base"
              />
              <input
                type="number"
                placeholder="เลขมิเตอร์ไฟ"
                value={electricityMeter}
                onChange={(e) => setElectricityMeter(e.target.value)}
                className="p-2 border rounded text-sm sm:text-base"
              />
              <div>
                <label className="block text-sm sm:text-base mb-1">
                  รูปมิเตอร์น้ำ
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "water")}
                  className="p-2 border rounded text-sm sm:text-base w-full"
                />
                {waterImagePreview && (
                  <img
                    src={waterImagePreview}
                    alt="Water Meter Preview"
                    className="mt-2 max-w-full h-auto max-h-40"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm sm:text-base mb-1">
                  รูปมิเตอร์ไฟ
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "electricity")}
                  className="p-2 border rounded text-sm sm:text-base w-full"
                />
                {electricityImagePreview && (
                  <img
                    src={electricityImagePreview}
                    alt="Electricity Meter Preview"
                    className="mt-2 max-w-full h-auto max-h-40"
                  />
                )}
              </div>
              <button
                type="submit"
                className=" bg-green-500 text-white text-sm sm:text-base p-2 rounded hover:bg-green-600"
              >
                บันทึก
              </button>
              <button
                type="submit"
                className=" bg-rose-400 text-white text-sm sm:text-base p-2 rounded hover:bg-rose-500"
              >
                ล้างข้อมูล
              </button>
            </div>
          </div>
        )}

        <FilterForm
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          projects={projects}
          history={history}
          setHistory={setHistory}
          token={token}
          // role={role}
        />
        <History
          history={history}
          // role={role}
          setBill={setBill}
        />
      </div>
    </div>
  );
}

export default Main;
