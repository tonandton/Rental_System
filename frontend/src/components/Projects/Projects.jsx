import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AddProject from "./AddProject";
import {
  Edit,
  House,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserPlus,
} from "lucide-react";
import ProjectFilterForm from "./FilterFormProject";

function Projects({ token, role, user }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [projects, setProjects] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editProject, setEditProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    address: "",
    status: "",
    ownerId: "",
  });
  const modalRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(e.target)
      )
        closeModal();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  useEffect(() => {
    fetchProjects();
  }, [token, filters]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [projectRes, ownerRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          params: { ...filters, t: Date.now() },
        }),
        axios.get(`${API_BASE_URL}/api/project-owners`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          params: { t: Date.now() },
        }),
      ]);
      setProjects(projectRes.data);
      setOwners(ownerRes.data);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.error || "ไม่สามารถโหลดข้อมูลโครงการ";
      setError(msg);
      toast.error(msg, { autoClose: 3000 });
      setLoading(false);
    }
  };

  // const fetchProjects = async () => {
  //   setLoading(true);

  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/api/projects`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     console.log("Fetched Projects:", response.data);
  //     setProjects(response.data);
  //     setLoading(false);
  //   } catch (error) {
  //     setError(error.response?.data?.error || "ไม่สามารถโหลดข้อมูลโครงการ");
  //     toast.error("โหลดข้อมูลโครงการล้มเหลว", { autoClose: 3000 });
  //     setLoading(false);
  //   }
  // };

  const openEditModal = (project) => {
    setEditProject({
      id: project.id,
      name: project.name,
      description: project.description,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProjectFilterForm
        projects={projects}
        owners={owners}
        filters={filters}
        setFilters={setFilters}
        setCurrentPage={() => {}}
        tableRef={tableRef}
      />
      <div className="bg-white shadow-lg rounded-xl p-6 border border-green-100 mt-4 animate-slide-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <House size={20} className="text-green-600" /> จัดการโครงการ
        </h2>
        {error && (
          <p className="text-red-600 mb-4 bg-red-100 p-3 rounded-md">{error}</p>
        )}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          <Plus size={16} className="inline-block mr-1" /> เพิ่มโครงการ
        </button>
        <div className="mt-6">
          {/* ตารางแบบเดสก์ท็อป */}
          <div className="hidden sm:block overflow-x-auto">
            <table
              className="min-w-[640px] w-full divide-y divide-gray-200 text-sm"
              ref={tableRef}
            >
              <thead className="bg-green-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    ชื่อโครงการ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    เจ้าของ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    สถานที่
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
                        {project.address || "-"}
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
                      <td className="px-4 py-3 text-sm flex space-x-2">
                        <button
                          onClick={() => openEditModal(project)}
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          aria-label="แก้ไขโครงการ"
                        >
                          <Edit size={16} className="mr-1" /> แก้ไข
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                          aria-label="ลบโครงการ"
                        >
                          <Trash2 size={16} className="mr-1" /> ลบ
                        </button>
                        <button
                          onClick={() =>
                            toggleActiveStatus(project.id, project.is_active)
                          }
                          className={`flex items-center text-sm ${
                            project.is_active
                              ? "text-yellow-600 hover:text-yellow-800"
                              : "text-green-600 hover:text-green-800"
                          }`}
                          aria-label={
                            project.is_active
                              ? "ปิดใช้งานโครงการ"
                              : "เปิดใช้งานโครงการ"
                          }
                        >
                          {project.is_active ? (
                            <>
                              <ToggleLeft size={16} className="mr-1" />{" "}
                              ปิดใช้งาน
                            </>
                          ) : (
                            <>
                              <ToggleRight size={16} className="mr-1" />{" "}
                              เปิดใช้งาน
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sm:hidden space-y-4">
          {loading ? (
            <div className="text-center text-sm text-gray-500">
              กำลังโหลด...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-sm text-gray-500">
              ไม่พบโครงการ
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-white p-4 rounded-lg shadow border border-green-100"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    {project.name}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      project.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {project.is_active ? "ใช้งาน" : "ไม่ได้ใช้งาน"}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  เจ้าของ: {project.owner_first_name || "-"}{" "}
                  {project.owner_last_name || "-"}
                </div>
                <div className="text-sm text-gray-600">
                  สถานที่: {project.address || "-"}
                </div>
                <div className="text-sm text-gray-600">
                  คำอธิบาย: {project.description || "-"}
                </div>
                <div className="text-sm text-gray-600">
                  ค่าน้ำ/หน่วย: {project.water_unit_rate || "-"}
                </div>
                <div className="text-sm text-gray-600">
                  ค่าไฟ/หน่วย: {project.electricity_unit_rate || "-"}
                </div>
                <div className="mt-3 flex space-x-2 flex-wrap gap-2">
                  <button
                    onClick={() => openEditModal(project)}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    aria-label="แก้ไขโครงการ"
                  >
                    <Edit size={16} className="mr-1" /> แก้ไข
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-red-600 hover:text-red-800 flex items-center text-sm"
                    aria-label="ลบโครงการ"
                  >
                    <Trash2 size={16} className="mr-1" /> ลบ
                  </button>
                  <button
                    onClick={() =>
                      toggleActiveStatus(project.id, project.is_active)
                    }
                    className={`flex items-center text-sm ${
                      project.is_active
                        ? "text-yellow-600 hover:text-yellow-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                    aria-label={
                      project.is_active
                        ? "ปิดใช้งานโครงการ"
                        : "เปิดใช้งานโครงการ"
                    }
                  >
                    {project.is_active ? (
                      <>
                        <ToggleLeft size={16} className="mr-1" /> ปิดใช้งาน
                      </>
                    ) : (
                      <>
                        <ToggleRight size={16} className="mr-1" /> เปิดใช้งาน
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
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
