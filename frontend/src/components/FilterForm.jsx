import { useState, useEffect } from "react";
import axios from "axios";

function FilterForm({ projects, onFilterChange, role, token }) {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [recorderUsername, setRecorderUsername] = useState("");
  const [username, setUsername] = useState("");
  const [owners, setOwners] = useState([]);
  const [users, setUsers] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ดึงข้อมูลเจ้าของโครงการและผู้ใช้
  useEffect(() => {
    const fetchOwners = async () => {
      if (!token) {
        console.warn("Token is missing. Skipping fetchOwners.");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/project-owners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOwners(response.data);
      } catch (err) {
        console.error("Fetch owners error:", err);
      }
    };

    const fetchUsers = async () => {
      if (role === "superadmin" || role === "admin") {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(response.data);
        } catch (err) {
          console.error("Fetch users error:", err);
        }
      }
    };

    fetchOwners();
    fetchUsers();
  }, [token, role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      month,
      year,
      projectId,
      status,
      ownerName,
      recorderUsername,
      username,
    });
  };

  const handleReset = () => {
    setMonth("");
    setYear("");
    setProjectId("");
    setStatus("");
    setOwnerName("");
    setRecorderUsername("");
    setUsername("");
    onFilterChange({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-md"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">เดือน</label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mt-1 p-2 border rounded-lg w-full"
        >
          <option value="">ทุกเดือน</option>
          {[...Array(12).keys()].map((m) => (
            <option key={m + 1} value={m + 1}>
              {new Date(0, m).toLocaleString("th-TH", { month: "long" })}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          ปี (พ.ศ.)
        </label>
        <input
          type="number"
          placeholder="เช่น 2568"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="mt-1 p-2 border rounded-lg w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          โครงการ
        </label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="mt-1 p-2 border rounded-lg w-full"
        >
          <option value="">ทุกโครงการ</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">สถานะ</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 p-2 border rounded-lg w-full"
        >
          <option value="">ทุกสถานะ</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="completed">สำเร็จ</option>
          <option value="cancelled">ยกเลิก</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          เจ้าของโครงการ
        </label>
        <select
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className="mt-1 p-2 border rounded-lg w-full"
        >
          <option value="">ทุกเจ้าของ</option>
          {Array.isArray(owners) &&
            owners.map((owner) => (
              <option key={owner.owner_name} value={owner.owner_name}>
                {owner.owner_name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          ผู้บันทึก
        </label>
        <select
          value={recorderUsername}
          onChange={(e) => setRecorderUsername(e.target.value)}
          className="mt-1 p-2 border rounded-lg w-full"
        >
          <option value="">ทุกผู้บันทึก</option>
          {users.map((user) => (
            <option key={user.username} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>
      </div>
      {(role === "superadmin" || role === "admin") && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            ผู้ใช้
          </label>
          <select
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 p-2 border rounded-lg w-full"
          >
            <option value="">ทุกผู้ใช้</option>
            {users.map((user) => (
              <option key={user.username} value={user.username}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex space-x-2 items-end">
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 w-full"
        >
          กรอง
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="bg-yellow-300 text-gray-700 p-2 rounded-lg hover:bg-yellow-400 w-full"
        >
          ล้าง
        </button>
      </div>
    </form>
  );
}

export default FilterForm;
