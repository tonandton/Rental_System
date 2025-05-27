import { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Camera,
  ChevronDownIcon,
  ChevronUpIcon,
  Droplet,
  Info,
  Plus,
  RefreshCw,
  Save,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
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
  initialData,
  isEditMode = false,
  onClose,
}) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [formData, setFormData] = useState(
    initialData || {
      project_id: "",
      rental_date: "",
      amount: "",
      previous_water_meter: "",
      current_water_meter: "",
      previous_electricity_meter: "",
      current_electricity_meter: "",
      electricity_image_path: "",
      water_image_path: "",
      water_description: "",
      electricity_description: "",
      status: "pending",
    }
  );

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

  useEffect(() => {
    if (initialData && isEditMode) {
      setFormData({
        project_id: initialData.project_id || "",
        rental_date: initialData.rental_date
          ? new Date(initialData.rental_date).toISOString().split("T")[0]
          : "",
        amount: initialData.amount || "",
        previous_water_meter: initialData.previous_water || "",
        current_water_meter: initialData.current_water || "",
        previous_electricity_meter: initialData.previous_electricity || "",
        current_electricity_meter: initialData.current_electricity || "",
        water_description: initialData.water_description || "",
        electricity_description: initialData.electricity || "",
        status: initialData.status || "pending",
      });
      // โหลด preview รูปภาพถ้ามี
      if (initialData.water_image_path) {
        setPreviews((prev) => ({
          ...prev,
          water_image: `${API_BASE_URL}${initialData.water_image_path}`,
        }));
      }
      if (initialData.electricity_image_path) {
        setPreviews((prev) => ({
          ...prev,
          electricity_image: `${API_BASE_URL}${initialData.electricity_image_path}`,
        }));
      }
    }
  }, [initialData, isEditMode, API_BASE_URL]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file && file.type.startsWith("image/")) {
      // console.log("Selected file:", name, file.name); // Debug
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [name]: url }));
      // console.log("Preview URL:", url); // Debug
      setFiles((prev) => ({ ...prev, [name]: file }));
    } else {
      // console.log("No file selected for:", name); // Debug
      setPreviews((prev) => ({ ...prev, [name]: null }));
      setFiles((prev) => ({ ...prev, [name]: null }));
      toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น", {
        autoClose: 3000,
      });
    }
  };

  const handleRemoveFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    if (formData.previous_water && formData.current_water) {
      if (Number(formData.current_water) < Number(formData.previous_water)) {
        toast.error("มิเตอร์น้ำปัจจุบันต้องไม่น้อยกว่ามิเตอร์น้ำก่อนหน้า", {
          autoClose: 3000,
        });
        return false;
      }
    }
    if (formData.previous_electricity && formData.current_electricity) {
      if (
        Number(formData.current_electricity) <
        Number(formData.previous_electricity)
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
      previous_water: safeNumber(formData.previous_water),
      current_water: safeNumber(formData.current_water),
      previous_electricity: safeNumber(formData.previous_electricity),
      current_electricity: safeNumber(formData.current_electricity),
      water_description: formData.water_description || null,
      electricity_description: formData.electricity_description || null,
    };

    try {
      const url = isEditMode
        ? `${API_BASE_URL}/api/history/${initialData.id}`
        : `${API_BASE_URL}/api/history`;
      const method = isEditMode ? "PUT" : "POST";

      // สร้าง record ใน rental_history
      const response = await axios[method](url, sanitizedFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const historyId = response.data.id || initialData.id;
      // console.log("History created, ID:", historyId); // Debug

      // อัปโหลดรูปภาพ (ถ้ามี)
      if (files.water_image || files.electricity_image) {
        const uploadData = new FormData();
        if (files.water_image)
          uploadData.append("water_image", files.water_image);
        if (files.electricity_image)
          uploadData.append("electricity_image", files.electricity_image);
        uploadData.append(
          "water_description",
          formData.water_description || ""
        );
        uploadData.append(
          "electricity_description",
          formData.electricity_description || ""
        );

        await axios.post(
          `${API_BASE_URL}/api/history/${historyId}/upload`,
          uploadData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
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
        water_description: "",
        electricity_description: "",
        status: "pending",
      });

      setFiles({ water_image: null, electricity_image: null });
      setPreviews({ water_image: null, electricity_image: null });
      toast.success(
        `${isEditMode ? "แก้ไข" : "บันทึก"}${
          activeTab === "water" ? "ค่าน้ำ" : "ค่าไฟ"
        }สำเร็จแล้ว!`,
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

      if (isEditMode && onClose) {
        onClose(); // ปิดฟอร์มถ้าอยู่ในโหมดแก้ไข
      }

      // เลื่อนไปที่ตาราง
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: "smooth" }, 500);
      });
      // console.log("Updated history:", historyRes.data); // Debug
    } catch (error) {
      console.error("Submit error:", error);
      setError(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึก");
      toast.error(
        `${isEditMode ? "แก้ไข" : "บันทึก"}${
          activeTab === "water" ? "ค่าน้ำ" : "ค่าไฟ"
        }ไม่สำเร็จ: ${error.response?.data?.error || "ข้อผิดพลาดเซิร์ฟเวอร์"}`,
        { autoClose: 3000 }
      );
    }
  };

  // ฟังก์ชันแปลงวันที่เป็น พ.ศ.
  const formatDateBE = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("th-TH", { month: "short" });
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  // Component สำหรับแสดงข้อมูลเก่า
  const PreviousData = () => {
    if (!isEditMode || !initialData) return null;

    const project = projects.find((p) => p.id === initialData.project_id);
    return (
      <div className="mt-4 p-3 bg-gray-100 rounded-md shadow-sm border border-gray-200 text-sm">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-2">
          <Info size={14} className="text-green-600" /> ข้อมูลเดิม
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <span className="font-medium">โครงการ: </span>{" "}
            {project?.name || "ไม่ระบุ"}
          </div>
          <div>
            <span className="font-medium">วันที่ลง:</span>{" "}
            {formatDateBE(initialData.rental_date)}
          </div>
          {activeTab === "water" && (
            <>
              <div>
                <span className="font-medium">มิเตอร์น้ำก่อนหน้า:</span>{" "}
                {initialData.previous_water_meter || "-"}
              </div>
              <div>
                <span className="font-medium">มิเตอร์น้ำปัจจุบัน:</span>{" "}
                {initialData.current_water_meter || "-"}
              </div>
              <div className="col-span-2">
                <span className="font-medium">คำอธิบายค่าน้ำ:</span>{" "}
                {initialData.water_description || "-"}
              </div>
              <div>
                <div className="font-medium">รูปมิเตอร์น้ำ:</div>{" "}
                {initialData.water_image_path ? (
                  <img
                    src={`${API_BASE_URL}${initialData.water_image_path}`}
                    alt="มิเตอร์น้ำเดิม"
                    className="w-16 h-auto rounded-md mt-1"
                  />
                ) : (
                  "-"
                )}
              </div>
            </>
          )}
          {activeTab === "electricity" && (
            <>
              <div>
                <span className="font-medium">มิเตอร์ไฟก่อนหน้า:</span>{" "}
                {initialData.previous_electricity_meter || "-"}
              </div>
              <div>
                <span className="font-medium">มิเตอร์ไฟปัจจุบัน:</span>{" "}
                {initialData.current_electricity_meter || "-"}
              </div>
              <div className="col-span-2">
                <span className="font-medium">คำอธิบายค่าไฟ:</span>{" "}
                {initialData.electricity_description || "-"}
              </div>
              <div>
                <div className="font-medium">รูปมิเตอร์ไฟ:</div>{" "}
                {initialData.electricity_image_path ? (
                  <img
                    src={`${API_BASE_URL}${initialData.electricity_image_path}`}
                    alt="มิเตอร์ไฟเดิม"
                    className="w-16 h-auto rounded-md mt-1"
                  />
                ) : (
                  "-"
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={
        isEditMode
          ? "space-y-3"
          : "bg-white shadow-lg rounded-xl p-4 sm:p-6 mb-8 border border-green-100 animate-slide-in"
      }
    >
      {!isEditMode && (
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Plus size={18} className="text-green-600" /> เพิ่มรายการ
          </h2>
          {isFormOpen ? (
            <ChevronUpIcon className="h-6 w-6 text-green-600" />
          ) : (
            <ChevronDownIcon className="h-6 w-6 text-green-600" />
          )}
        </div>
      )}

      {(isFormOpen || isEditMode) && (
        <div className={isEditMode ? "" : "mt-4 animate-slide-in"}>
          {error && (
            <p className="text-red-600 mb-3 bg-red-100 p-2 rounded-md text-sm">
              {error}
            </p>
          )}
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={() => setActiveTab("water")}
              className={`px-3 py-1.5 rounded-md font-medium text-sm sm:text-base ${
                activeTab === "water"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              } transition`}
            >
              <Droplet size={16} className="inline-block mr-1" /> ค่าน้ำ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("electricity")}
              className={`px-3 py-1.5 rounded-md font-medium text-sm sm:text-base ${
                activeTab === "electricity"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              } transition`}
            >
              <Zap size={16} className="inline-block mr-1" /> ค่าไฟ
            </button>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
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
                    <Calendar size={16} /> รอบวันที่
                  </label>
                  <input
                    type="date"
                    name="rental_date"
                    value={formData.rental_date}
                    onChange={handleFormChange}
                    required
                    className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition text-sm sm:text-base"
                    aria-label="รอบวันที่"
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
                      className="mt-1 block w-full rounded-md border-indigo-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 transition text-sm sm:text-base"
                      aria-label="มิเตอร์น้ำรอบที่ผ่านมา"
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
                      className="mt-1 block w-full rounded-md border-indigo-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 transition text-sm sm:text-base"
                      aria-label="มิเตอร์น้ำปัจจุบัน"
                    />
                  </div>
                  <div className="smLcol-span-2">
                    <label className="block font-medium text-gray-700 mb-1">
                      <Droplet size={16} className="inline-block mr-1" />{" "}
                      หมายเหตุเพิ่มเติมสำหรับมิเตอร์น้ำ
                    </label>
                    <textarea
                      name="water_description"
                      value={formData.water_description}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md border-indigo-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 transition text-sm sm:text-base"
                      rows="3"
                      aria-label="คำอธิบายค่าน้ำ"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-4">
                      <Droplet size={16} className="inline-block mr-1" />
                      รูปมิเตอร์น้ำ
                    </label>

                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="water_image"
                        className="cursor-pointer px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition text-sm"
                      >
                        <Camera size={16} className="inline-block mr-1" />{" "}
                        เลือกรูปภาพ
                      </label>
                      <span className="text-sm text-gray-600 truncate w-40">
                        {files.water_image?.name || "ยังไม่ได้เลือกรูป"}
                      </span>
                      <input
                        id="water_image"
                        type="file"
                        name="water_image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-label="อัปโหลดรูปมิเตอร์น้ำ"
                      />
                    </div>
                    {previews.water_image && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={previews.water_image}
                          alt="พรีวิวมิเตอร์น้ำ"
                          className="w-20 h-auto rounded-md shadow border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("water_image")}
                          className="text-xs text-red-600 hover:underline"
                          aria-label="ลบรูปมิเตอร์น้ำ"
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
                      className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-600 focus:ring-amber-600 transition text-sm sm:text-base"
                      aria-label="มิเตอร์ไฟรอบที่ผ่านมา"
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
                      className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-600 focus:ring-amber-600 transition text-sm sm:text-base"
                      aria-label="มิเตอร์ไฟปัจจุบัน"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      <Zap size={16} className="inline-block mr-1" />{" "}
                      หมายเหตุเพิ่มเติมสำหรับมิเตอร์ไฟ
                    </label>
                    <textarea
                      name="electricity_description"
                      value={formData.electricity_description}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md border-amber-300 shadow-sm focus:border-amber-600 focus:ring-amber-600 transition text-sm sm:text-base"
                      rows="3"
                      aria-label="คำอธิบายค่าไฟ"
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
                        <Camera size={16} className="inline-block mr-1" />{" "}
                        เลือกรูปภาพ
                      </label>

                      <span className="text-sm text-gray-600 truncate w-40">
                        {files.electricity_image?.name || "ยังไม่ได้เลือกรูป"}
                      </span>

                      <input
                        id="electricity_image"
                        type="file"
                        name="electricity_image"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-label="อัปโหลดรูปมิเตอร์ไฟ"
                      />
                    </div>
                    {previews.electricity_image && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={previews.electricity_image}
                          alt="พรีวิวมิเตอร์ไฟ"
                          className="w-20 h-auto rounded-md shadow border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile("electricity_image")}
                          className="text-xs text-red-600 hover:underline"
                          aria-label="ลบรูปมิเตอร์ไฟ"
                        >
                          ❌
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <PreviousData />

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition text-sm sm:text-base"
                  aria-label={
                    isEditMode ? "บันทึกกรายการแก้ไข" : "บันทึกรายการ"
                  }
                >
                  <Save size={16} className="inline-block mr-1" />{" "}
                  {isEditMode ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
                </button>
                {isEditMode && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-400 transition text-sm sm:text-base"
                    aria-label="ยกเลิกการแก้ไข"
                  >
                    <X size={16} className="inline-block mr-1" /> ยกเลิก
                  </button>
                )}
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
                      water_description: "",
                      electricity_description: "",
                      status: "pending",
                    })
                  }
                  className="bg-yellow-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-yellow-400 transition text-sm sm:text-base"
                  aria-label="รีเซ็ตฟอร์ม"
                >
                  <RefreshCw size={16} className="inline-block mr-1" /> รีเซ็ต
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddRentalForm;
