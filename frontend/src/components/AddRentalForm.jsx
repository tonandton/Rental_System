import { useState } from "react";
import axios from "axios";
import { Calendar, Droplet, Turtle, Warehouse, Zap } from "lucide-react";
import { toast } from "react-toastify";

function AddRentalForm({
  token,
  role,
  user,
  projects,
  setHistory,
  filters,
  setCurrentPage,
  tableRef,
}) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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

  const [error, setError] = useState("");

  // Open Form
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Water & Electric
  const [activeTab, setActiveTab] = useState("water");

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file && file.type.startsWith("image/")) {
      console.log("Selected file:", name, file.name); // Debug
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [name]: url }));
      console.log("Preview URL:", url); // Debug
      setFiles((prev) => ({ ...prev, [name]: file }));
    } else {
      console.log("No file selected for:", name); // Debug
      setPreviews((prev) => ({ ...prev, [name]: null }));
      setFiles((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRemoveFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    if (formData.previous_water_meter && formData.current_water_meter) {
      if (
        Number(formData.current_water_meter) <
        Number(formData.previous_water_meter)
      ) {
        toast.error("มิเตอร์น้ำปัจจุบันต้องไม่น้อยกว่ามิเตอร์น้ำก่อนหน้า", {
          autoClose: 3000,
        });
        return false;
      }
    }

    if (
      formData.previous_electricity_meter &&
      formData.current_electricity_meter
    ) {
      if (
        Number(formData.current_electricity_meter) <
        Number(formData.previous_electricity_meter)
      ) {
        toast.error("มิเตอร์ไฟปัจจุบันต้องไม่น้อยกว่ามิเตอร์ไฟก่อนหน้า", {
          autoClose: 3000,
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    const safeNumber = (val) => (val === "" ? null : Number(val));

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
      // สร้าง record ใน rental_history
      const response = await axios.post(
        `${API_BASE_URL}/api/history`,
        sanitizedFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const historyId = response.data.id;
      console.log("History created, ID:", historyId); // Debug

      // อัปโหลดรูปภาพ (ถ้ามี)
      if (files.water_image || files.electricity_image) {
        const uploadData = new FormData();
        if (files.water_image) {
          uploadData.append("water_image", files.water_image);
          console.log(
            "Appending water_image:",
            files.water_image?.name || "No name"
          ); // ปลอดภัยต่อ null
        } else {
          console.log("No water_image to append"); // Debug
        }
        if (files.electricity_image) {
          uploadData.append("electricity_image", files.electricity_image);
          console.log(
            "Appending electricity_image:",
            files.electricity_image?.name || "No name"
          ); // ปลอดภัยต่อ null
        } else {
          console.log("No electricity_image to append"); // Debug
        }

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/api/history/${historyId}/upload`,
          uploadData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Upload response:", uploadResponse.data); // Debug
      }

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
      setPreviews({ water_image: null, electricity_image: null });
      toast.success(
        `บันทึก${activeTab === "water" ? "ค่าน้ำ" : "ค่าไฟ"}สำเร็จแล้ว!`,
        { autoClose: 3000 }
      );

      /// อัปเดทประวัติิ
      const baseParams = role === "user" ? { ownerId: user.id } : {};
      const historyRes = await axios.get(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...baseParams, ...filters },
      });
      setHistory(historyRes.data);
      setCurrentPage(1);

      // เลื่อนไปที่ตาราง
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: "smooth" }, 500);
      });
      // console.log("Updated history:", historyRes.data); // Debug
    } catch (error) {
      console.error("Submit error:", error);
      setError(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึก");
      toast.error(
        `บันทึก${activeTab === "water" ? "ค่าน้ำ" : "ค่าไฟ"}ไม่สำเร็จ: ${
          error.response?.data?.error || "ข้อผิดพลาดเซิร์ฟเวอร์"
        }`,
        { autoClose: 3000 }
      );
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-green-100">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsFormOpen(!isFormOpen)}
      >
        <h2 className="text-xl font-semibold text-gray-800">➕ เพิ่มรายการ</h2>
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
                        ❌
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
                        ❌
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
  );
}

export default AddRentalForm;
