import { useState, useEffect } from "react";
import axios from "axios";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "react-toastify";

function UserManagement({ token }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "user",
    first_name: "",
    last_name: "",
  });
  const [editUser, setEditUser] = useState(null); // สำหรับแก้ไขผู้ใช้
  const [isModalOpen, setIsModalOpen] = useState(false); // ควบคุม modal
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("Fetched users:", response.data); // ✅ DEBUG
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      // console.error("Error fetching users:", err); // ✅ DEBUG
      setError(err.response?.data?.error || "ไม่สามารถโหลดข้อมูลผู้ใช้");
      setLoading(false);
      toast.error("โหลดข้อมูลผู้ใช้ล้มเหลว", { autoClose: 3000 });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.password || newUser.password.length < 6) {
      toast.error("กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร", { autoClose: 3000 });
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUser({
        username: "",
        password: "",
        email: "",
        role: "user",
        first_name: "",
        last_name: "",
      });
      toast.success("เพิ่มผู้ใช้สำเร็จ", { autoClose: 3000 });
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || "ไม่สามารถเพิ่มผู้ใช้");
      toast.error("เพิ่มผู้ใช้ล้มเหลว", { autoClose: 3000 });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API_BASE_URL}/api/users/${editUser.id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("แก้ไขผู้ใช้สำเร็จ", { autoClose: 3000 });
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || "ไม่สามารถแก้ไขผู้ใช้ได้");
      toast.error("แก้ไขผู้ใช้ล้มเหลว", { autoClose: 3000 });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("ยืนยันการลบผู้ใช้?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("ลบผู้ใช้สำเร็จ", { autoClose: 3000 });
        fetchUsers();
      } catch (error) {
        toast.error("ลบผู้ใช้ล้มเหลว", { autoClose: 3000 });
      }
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/users/${userId}/status`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(
        `เปลี่ยนสถานะเป็น ${currentStatus ? "ไม่ได้ใช้งาน" : "ใช้งาน"} สำเร็จ`,
        {
          autoClose: 3000,
          toastId: `toggle-${userId}`, // ป้องกัน toast ซ้ำ
        }
      );
      fetchUsers();
    } catch (err) {
      toast.error("เปลี่ยนสถานะผู้ใช้ล้มเหลว", { autoClose: 3000 });
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "superadmin":
        return "ผู้ดูแลสูงสุด";
      case "admin":
        return "ผู้ดูแล";
      case "employee":
        return "พนักงาน";
      case "user":
      default:
        return "ผู้ใช้";
    }
  };

  const openEditModal = (user) => {
    setEditUser({
      id: user.id,
      username: user.username || "",
      password: "",
      email: user.email || "",
      role: user.role || "user",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      is_active: user.is_active ?? true,
    });
    setIsModalOpen(true);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg-px-8 py-8">
      <div className="bg-white shadow-lg rounded-xl p-6 border border-green-100 mt-4 animate-slide-in">
        <h2 className="text-xlfont-semibold text-gray-800 mb-4">
          👤 การจัดการผู้ใช้
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleAddUser} className="mb-6 space-y-4">
          <div className="grid gird-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600"
              />
            </div>
            <div className="relative">
              <label className="block font-medium text gray-700">
                รหัสผ่าน
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 pr-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-6 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
            <div>
              <label className="block font-medium text-gray-700">อีเมล</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">
                สิทธิในการใช้งาน
              </label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600"
              >
                <option value="admin">Admin (ผู้ดูแล)</option>
                <option value="user">User (ผู้ใช้, ตัวแทน)</option>
                <option value="employee">Employee (พนักงาน)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700">ชื่อ</label>
              <input
                type="text"
                name="first_name"
                value={newUser.first_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">สกุล</label>
              <input
                type="text"
                name="last_name"
                value={newUser.last_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            ➕ เพิ่มผู้ใช้
          </button>
        </form>
        <div className="mt-6">
          {/* ตารางแบบเดสก์ท็อป */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th>ชื่อผู้ใช้</th>
                  <th>อีเมล</th>
                  <th>สิทธิในการใช้งาน</th>
                  <th>ชือ</th>
                  <th>สกุล</th>
                  <th>สถานะ</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-3 text-center text-sm text-gray-500"
                    >
                      กำลังโหลด
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-3 text-center text-sm text-gray-500"
                    >
                      ไม่พบผู้ใช้
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 text-sm">{user.username}</td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      {/* <td className="px-4 py-3 text-sm">
                    {user.role === "admin" ? "ผู้ดูแล" : "ผู้ใช้"}
                  </td> */}
                      <td className="px-4 py-3 text-sm">
                        {user.role === "superadmin" && "👑👑 "}
                        {user.role === "admin" && "👑 "}
                        {user.role === "employee" && "💼 "}
                        {user.role === "user" && "👤 "}
                        {getRoleLabel(user.role)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.first_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.last_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.is_active ? "Active" : "Nonactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm flex space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:underline"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:underline"
                        >
                          🗑️ ลบ
                        </button>
                        <button
                          onClick={() =>
                            handleToggleActive(user.id, user.is_active)
                          }
                          className={`${
                            user.is_active
                              ? "text-yellow-600"
                              : "text-green-600"
                          } hover:underline`}
                        >
                          {user.is_active ? "⛔ Nonactive" : "✅ Active"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal สำหรับแก้ไขผู้ใช้งาน */}
      {isModalOpen && editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              ✏️ แก้ไขผู้ใช้
            </h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  name="username"
                  value={editUser.username}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blude-600"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={editUser.email}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">
                  สิทธิ์ในการใช้งาน
                </label>
                <select
                  name="role"
                  value={editUser.role}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600"
                >
                  <option value="admin">Admin (ผู้ดูแล)</option>
                  <option value="user">User (ผู้ใช้, ตัวแทน)</option>
                  <option value="employee">Employee (พนักงาน)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700">ชื่อ</label>
                <input
                  type="text"
                  name="first_name"
                  value={editUser.first_name}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">สกุล</label>
                <input
                  type="text"
                  name="last_name"
                  value={editUser.last_name}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600"
                />
              </div>
              <div>
                <label className="inline-flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editUser.is_active}
                    onChange={(e) =>
                      setEditUser((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="form-checkbox h-5 w-5 text-green-600"
                  />
                  <span className="ml-2 text-gray-700">
                    {editUser.is_active
                      ? "เปิดใช้งาน (Active)"
                      : "ปิดใช้งาน (Nonactive)"}
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  💾 บันทึก
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
