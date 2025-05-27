import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Building,
  Calendar,
  Droplet,
  Zap,
  User,
  Image,
  MapPinHouse,
  Building2,
  Save,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

function AddProject({ token, project = null, onClose }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const isEditMode = !!project;
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    water_unit_rate: project?.water_unit_rate || "",
    electricity_unit_rate: project?.electricity_unit_rate || "",
    owner_name: project?.owner_id || "",
    address: project?.address || "", // ✅
    is_active: project?.is_active ?? true, // ✅
  });

  const [owners, setOwners] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isEditMode &&
        onClose &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        onClose(); // ปิด modal หากคลิกข้างนอก
      }
    };

    if (isEditMode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (isEditMode) {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [isEditMode, onClose]);

  useEffect(() => {
    fetchProjectOwners();

    try {
      toast.info(isEditMode ? "โหลดหน้าแก้ไขโครงการ" : "โหลดหน้าเพิ่มโครงการ", {
        autoClose: 3000,
        toastId: "load-project-page",
      });
    } catch (error) {
      console.log("Toast initialization error:", error);
    }
  }, [isEditMode]);

  const fetchProjectOwners = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/project-owners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("Fetched project owners: ", response.data);
      setOwners(response.data);
      // ตั้งค่า owner_name ถ้าเป็นโหมดแก้ไขและยังไม่มี
      if (isEditMode && !formData.owner_name && response.data.length > 0) {
        const owner = response.data.find((o) => o.id === project.owner_id);
        if (owner) {
          setFormData((prev) => ({ ...prev, owner_name: owner.id }));
        }
      }
    } catch (error) {
      console.error("Fetch project owners error:", error);
      setError("ไม่สามารถโหลดข้อมูลเจ้าของโครงการ");
      toast.error("โหลดข้อมูลเจ้าของโครงการล้มเหลว", { autoClose: 3000 });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์ภาพใหญ่เกิน 5MB", { autoClose: 3000 });
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let projectId = project?.id;
      if (isEditMode) {
        // แก้ไขโครงการ
        await axios.put(`${API_BASE_URL}/api/projects/${projectId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("แก้ไขโครงการสำเร็จ", { autoClose: 3000 });
      } else {
        // เพิ่มโครงการใหม่
        const response = await axios.post(
          `${API_BASE_URL}/api/projects`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        projectId = response.data.id;
        toast.success("เพิ่มโครงการสำเร็จ", { autoClose: 3000 });
      }

      // อัปโหลดภาพถ้ามี
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("image", image);
        try {
          await axios.post(
            `${API_BASE_URL}/api/project/${projectId}/upload`,
            imageFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          toast.success("อัปโหลดภาสำเร็จ", { autoClose: 3000 });
        } catch (error) {
          console.error("Upload image error:", error);
          toast.error("อัปโหลดภาพล้มเหลว", { autoClose: 3000 });
        }
      }

      // รีเช็ตฟอร์มหรือปิด modal
      if (isEditMode && onClose) {
        onClose();
      } else {
        setFormData({
          name: "",
          description: "",
          water_unit_rate: "",
          electricity_unit_rate: "",
          owiner_name: "",
          image_path: "",
          address: "",
          is_active: true,
        });
        setImage(null);
      }
    } catch (error) {
      console.error("Project error:", error);
      setError(
        error.response?.data?.error ||
          `ไม่สามารถ ${isEditMode ? "แก้ไข" : "เพิ่ม"} โครงการ`
      );
      toast.error(`${isEditMode ? "แก้ไข" : "เพิ่ม"} โครงการล้มเหลว`, {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="bg-white shadow-lg rounded-xl p-4 sm:p-6 mb-8 border border-green-100 animate-slide-in max-w-5xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {isEditMode ? (
          <>
            <Building2 size={20} className="text-green-600" /> แก้ไขโครงการ
          </>
        ) : (
          <>
            <Building2 size={20} className="text-green-600" /> เพิ่มโครงการใหม่
          </>
        )}
      </h2>
      {error && (
        <p className="text-red-600 mb-4 bg-red-100 p-3 rounded-md">{error}</p>
      )}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 ">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Building size={16} className="inline-block mr-1" /> ชื่อโครงการ
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <User size={16} className="inline-block mr-1" /> เจ้าของโครงการ
              </label>
              <div className="relative">
                <select
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition appearance-none pr-10"
                >
                  <option value="">เลือกเจ้าของโครงการ</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.first_name} {owner.last_name}
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
              <label className="block font-medium text-gray-700 mb-1">
                <Droplet size={16} className="inline-block mr-1" /> อัตราค่าน้ำ
                (บาท/หน่วย)
              </label>
              <input
                type="number"
                name="water_unit_rate"
                value={formData.water_unit_rate}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Zap size={16} className="inline-block mr-1" /> อัตราค่าไฟ
                (บาท/หน่วย)
              </label>
              <input
                type="number"
                name="electricity_unit_rate"
                value={formData.electricity_unit_rate}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <MapPinHouse size={16} className="inline-block mr-1" />
                ที่อยู่โครงการ
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition border"
                // placeholder="กรอกที่อยู่ของโครงการ"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Building size={16} className="inline-block mr-1" />{" "}
                หมายเหตุเพิ่มเติมสำหรับโครงการ
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>

            {/* <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline-block mr-1" /> วันที่เริ่ม
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline-block mr-1" />{" "}
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div> */}

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Image size={16} className="inline-block mr-1" /> ภาพโครงการ
                (JPEG, JPG, PNG)
              </label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="project_image"
                  className="cursor-pointer px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
                >
                  📷 เลือกรูปภาพ
                </label>
                <span className="text-sm text-gray-600 truncate w-40">
                  {image?.name || project?.image_path || "ยังไม่ได้เลือกรูป"}
                </span>
                <input
                  id="project_image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {imagePreview && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="พรีวิวภาพโครงการ"
                    className="w-32 h-auto rounded-md shadow border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-sm text-red-600 hover:underline"
                  >
                    ❌
                  </button>
                </div>
              )}
              <p className="text-xs text gray-500 mt-1">ขนาดไฟล์สูงสุด 5MB</p>
              {project?.image_path && !image && (
                <p className="text-sm text-gray-600 mt-1">
                  ภาพปัจจุบัน: {project.image_path}
                </p>
              )}
            </div>

            <div>
              <label className="inline-flex items-center mt-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="form-checkbox h-5 w-5 text-green-600"
                />
                <span className="ml-2 text-gray-700">
                  {formData.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                "กำลังบันทึก..."
              ) : isEditMode ? (
                <>
                  <Save size={16} className="inline-block mr-1" />{" "}
                  บันทึกการแก้ไข
                </>
              ) : (
                <>
                  <Plus size={16} className="inline-block mr-1" /> เพิ่มโครงการ
                </>
              )}
            </button>
            {isEditMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                <X size={16} className="inline-block mr-1" /> ยกเลิก
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  name: "",
                  description: "",
                  water_unit_rate: "",
                  electricity_unit_rate: "",
                  owner_name: "",
                  address: "",
                  is_active: true,
                })
              }
              className="bg-yellow-300 text-gray-700 px-4 py-2 rounded-md hover:bg-yellow-400 transition"
            >
              <RefreshCw size={16} className="inline-block mr-1" /> รีเซ็ต
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProject;
