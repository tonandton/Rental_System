import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AddProject from "./AddProject";

function Projects({ token }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editProject, setEditProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Projects:", response.data);
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.error || "ไม่สามารถโหลดข้อมูลโครงการ");
      toast.error("โหลดข้อมูลโครงการล้มเหลว", { autoClose: 3000 });
      setLoading(false);
    }
  };

  const openEditModal = (project) => {
    setEditProject({
      id: project.id,
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      water_unit_rate: project.water_unit_rate,
      electricity_unit_rate: project.electricity_unit_rate,
      owner_id: project.owner_id || project.user_id,
      image_path: project.image_path,
      address: project.address || "",
      is_active: project.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProject(null);
    fetchProjects(); // รีเฟรชข้อมูลหลังแก้ไข
  };

  const deleteProject = async (id) => {
    if (confirm("ต้องการลบโครงการนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("ลบโครงการสำเร็จ");
        fetchProjects();
      } catch {
        toast.error("ลบโครงการล้มเหลว");
      }
    }
  };

  const toggleActiveStatus = async (id, currentStatus) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/projects/${id}/status`,
        {
          is_active: !currentStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchProjects();
      toast.success("เปลี่ยนสถานะโครงการแล้ว");
    } catch {
      toast.error("เปลี่ยนสถานะล้มเหลว");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg-px-8 py-8">
      <div className="bg-white shadow-lg rounded-xl p-6 border border-green100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🏠 จัดการโครงการ
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mb-4"
        >
          ➕ เพิ่มโครงการใหม่
        </button>
        <div className="overflow-x-auto ">
          <table className="min-w-[640px] w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-green-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  ชื่อโครงการ
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  เจ้าของ
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  คำอธิบาย
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  ค่าน้ำ/หน่วย
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  ค่าไฟ/หน่วย
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-3 text-center text-sm text-gray-500"
                  >
                    กำลังโหลด...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-3 text-center text-sm text-gray-500"
                  >
                    ไม่พบโครงการ
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-4 py-3 text-sm">{project.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {project.owner_first_name || "-"}{" "}
                      {project.owner_last_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {project.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {project.water_unit_rate || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {project.electricity_unit_rate || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => openEditModal(project)}
                        className="text-blue-600 hover:underline"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="text-red-600 hover:underline ml-2"
                      >
                        🗑️ ลบ
                      </button>
                      <button
                        onClick={() =>
                          toggleActiveStatus(project.id, project.is_active)
                        }
                        className={`ml-2 ${
                          project.is_active
                            ? "text-yellow-600"
                            : "text-green-600"
                        } hover:underline`}
                      >
                        {project.is_active ? "⛔ ปิดใช้งาน" : "✅ เปิดใช้งาน"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 px-4 overflow-y-auto">
            <div
              className="bg-white rounded-lg p-6 w-full max-w-2xl relative"
              ref={modalRef}
            >
              <AddProject
                token={token}
                API_BASE_URL={API_BASE_URL}
                project={editProject}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
