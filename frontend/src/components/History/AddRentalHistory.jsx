import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Edit, ListChecks } from "lucide-react";

import FilterForm from "./FilterForm";
import AddRentalForm from "./AddRentalForm";
import HistoryTable from "./HistoryTable";

function AddRentalHistory({ token, role, user }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [owners, setOwners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef(null);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: "",
    projectId: "",
    ownerId: "",
  });

  const [editItem, setEditItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Cache-Control": "no-cache",
  };

  useEffect(() => {
    if (!token || !user || !role) {
      toast.error("กรุณาล็อกอินใหม่", { autoClose: 3000 });
      setError("กรุณาล็อกอินใหม่");
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

      const [historyRes, projectsRes, ownersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/history`, { headers, params }),
        axios.get(`${API_BASE_URL}/api/projects`, {
          headers,
          params: { t: Date.now() },
        }),
        role !== "user"
          ? axios.get(`${API_BASE_URL}/api/project-owners`, {
              headers,
              params: { t: Date.now() },
            })
          : Promise.resolve({ data: [user] }),
      ]);

      setHistory(historyRes.data || []);
      setProjects(projectsRes.data || []);
      setOwners(
        role === "user"
          ? [
              {
                id: user.id,
                first_name: user.first_name || "ไม่ระบุ",
                last_name: user.last_name || "",
              },
            ]
          : ownersRes.data || []
      );

      setError("");
    } catch (err) {
      const msg = err?.response?.data?.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล";
      toast.error(msg, { autoClose: 3000 });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryAdd = (item) => {
    setHistory((prev) => [item, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleHistoryUpdate = (item) => {
    setHistory((prev) =>
      prev.map((h) => (h.id === item.id ? { ...h, ...item } : h))
    );
    setEditItem(null);
  };

  return (
    <div className="2xl:max-w-screen-2xl xl:max-w-screen-lg lg:max-w-screen-lg md:max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <ListChecks size={20} className="text-green-600" />
          บันทึกรายการ
        </h1>

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
        retryFetch={fetchData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        tableRef={tableRef}
        API_BASE_URL={API_BASE_URL}
        onEdit={setEditItem}
        token={token} // ส่ง token
        filters={filters} // ส่ง filters
      />

      {/* Add Modal */}
      {isAddModalOpen && (
        <ModalWrapper
          onClose={() => setIsAddModalOpen(false)}
          title="เพิ่มรายการ"
        >
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
            onClose={() => setIsAddModalOpen(false)}
            onHistoryAdd={handleHistoryAdd}
          />
        </ModalWrapper>
      )}

      {/* Edit Modal */}
      {editItem && (
        <ModalWrapper onClose={() => setEditItem(null)} title="แก้ไขรายการ">
          <AddRentalForm
            token={token}
            role={role}
            user={user}
            projects={projects}
            key={editItem?.id}
            initialData={editItem}
            setHistory={setHistory}
            filters={filters}
            setCurrentPage={setCurrentPage}
            tableRef={tableRef}
            isEditMode={true}
            onClose={() => setEditItem(null)}
            onHistoryUpdate={handleHistoryUpdate}
          />
        </ModalWrapper>
      )}
    </div>
  );
}

// Component wrapper for modals
function ModalWrapper({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-4 my-6 max-h-[90vh] overflow-y-auto animate-slide-in">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Edit size={20} className="text-green-600" />
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export default AddRentalHistory;
