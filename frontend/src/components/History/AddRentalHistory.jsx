import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import FilterForm from "./FilterForm";
import AddRentalForm from "./AddRentalForm";
import HistoryTable from "./HistoryTable";
import { Edit, ListChecks } from "lucide-react";
import { toast } from "react-toastify";

function AddRentalHistory({ token, role, user }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef(null);
  const [editItem, setEditItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
    projectId: "",
    ownerId: "",
  });

  useEffect(() => {
    if (!token || !user || !role) {
      setError("กรุณาล็อกอินใหม่");
      toast.error("กรุณาล็อกอินใหม่", { autoClose: 3000 });
      setLoading(false);
      return;
    }
    fetchData();
  }, [token, role, user, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseParams = role === "user" ? { ownerId: user.id } : {};
      const params = { ...baseParams, ...filters, t: Date.now() };

      const requests = [
        axios.get(`${API_BASE_URL}/api/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          params,
        }),
        axios.get(`${API_BASE_URL}/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          params: { t: Date.now() },
        }),
      ];

      if (role !== "user") {
        requests.push(
          axios.get(`${API_BASE_URL}/api/project-owners`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
            params: { t: Date.now() },
          })
        );
      }

      const responses = await Promise.all(
        requests.map((req) => req.catch((err) => ({ error: err })))
      );
      const [historyRes, projectsRes, ownersRes] = responses;

      // Check for errors first
      if (historyRes.error || !historyRes.data) {
        // console.error("History fetch error:", historyRes.error || "No data");
        throw new Error("ไม่สามารถดึงข้อมูลประวัติได้");
      }
      if (projectsRes.error || !projectsRes.data) {
        // console.error("Projects fetch error:", projectsRes.error || "No data");
        throw new Error("ไม่สามารถดึงข้อมูลโครงการได้");
      }

      setHistory(historyRes.data || []);
      setProjects(projectsRes.data || []);

      // Handle owners
      if (role === "employee" || role === "admin") {
        if (ownersRes && !ownersRes.error && ownersRes.data) {
          setOwners(ownersRes.data || []);
          // console.log("Set owners:", ownersRes.data);
        } else {
          console.error("Owners fetch error:", ownersRes?.error || "No data");
          toast.warn("ไม่สามารถดึงข้อมูลเจ้าของโครงการได้", {
            autoClose: 3000,
          });
          setOwners([]);
        }
      } else if (role === "user" && user) {
        const userOwner = {
          id: user.id || "unknown",
          first_name: user.first_name || "ไม่ระบุ",
          last_name: user.last_name || "",
        };
        setOwners([userOwner]);
        // console.log("Set employee owner:", employeeOwner);
      } else {
        // console.warn("No valid user for employee role");
        setOwners([]);
        toast.warn("ไม่มีข้อมูลเจ้าของโครงการสำหรับพนักงาน", {
          autoClose: 3000,
        });
      }

      setLoading(false);
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? "คุณไม่มีสิทธิ์เข้าถึงข้อมูลบางส่วน"
          : err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล";
      console.error("Fetch error:", err);
      setError(msg);
      toast.error(msg, { autoClose: 3000 });
      setLoading(false);
    }
  };

  const retryFetch = async () => {
    setError("");
    setLoading(true);
    try {
      const baseParams = role === "user" ? { ownerId: user.id } : {};
      const params = { ...baseParams, ...filters, t: Date.now() };
      const { data } = await axios.get(`${API_BASE_URL}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        params,
      });
      setHistory(data || []);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.error || "เกิดข้อผิดพลาดในการดึงข้อมูล";
      console.error("Retry fetch error:", err);
      setError(msg);
      toast.error(msg, { autoClose: 3000 });
      setLoading(false);
    }
  };

  const handleHistoryAdd = (newItem) => {
    setHistory((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleHistoryUpdate = (updatedItem) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      )
    );
    setEditItem(null);
  };

  const handleCloseEditModal = () => setEditItem(null);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg-px-8 py-8">
      <h1 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <ListChecks size={20} className="text-green-600" /> บันทึกรายการ
      </h1>

      <div className="mb-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + เพิ่มรายการ
        </button>
      </div>

      <FilterForm
        user={user}
        role={role}
        projects={projects}
        owners={owners}
        filters={filters}
        setFilters={setFilters}
        setCurrentPage={setCurrentPage}
        tableRef={tableRef}
      />

      <HistoryTable
        history={history}
        loading={loading}
        error={error}
        retryFetch={retryFetch}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        tableRef={tableRef}
        API_BASE_URL={API_BASE_URL}
        onEdit={setEditItem}
        // onEdit={handleEdit}
      />

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-slide-in overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-4 my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Edit size={20} className="text-green-600" /> เพิ่มรายการ
            </h2>
            <AddRentalForm
              token={token}
              role={role}
              user={user}
              projects={projects}
              setHistory={setHistory}
              filters={filters}
              setCurrentPage={setCurrentPage}
              tableRef={tableRef}
              isEditMode={false}
              onClose={handleCloseAddModal}
              onHistoryAdd={handleHistoryAdd}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-slide-in overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-4 my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Edit size={20} className="text-green-600" /> แก้ไขรายการ
            </h2>
            <AddRentalForm
              token={token}
              role={role}
              user={user}
              projects={projects}
              key={editItem?.id || "new"}
              setHistory={setHistory}
              filters={filters}
              setCurrentPage={setCurrentPage}
              tableRef={tableRef}
              initialData={editItem}
              isEditMode={true}
              onClose={handleCloseEditModal}
              onHistoryUpdate={handleHistoryUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AddRentalHistory;
