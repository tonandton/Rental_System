import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Edit,
  EyeIcon,
  EyeOffIcon,
  Key,
  Mail,
  Shield,
  ToggleLeft,
  ToggleRight,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
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
  const [togglingUserId, setTogglingUserId] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
        setEditUser(null);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("Fetched users:", response.data); // ✅ DEBUG
      // กรองข้อมูลเพื่อป้องการ undefined/null
      const filteredUsers = response.data.filter(
        (user) => user && user.id && user.username
      );
      setUsers(filteredUsers);
      if (filteredUsers.length < response.data.length) {
        console.warn(
          "Some users were filtered out due to missing id or username"
        );
      }
      setLoading(false);
    } catch (err) {
      // console.error("Error fetching users:", err); // ✅ DEBUG
      setError(err.response?.data?.error || "ไม่สามารถโหลดข้อมูลผู้ใช้");
      toast.error("โหลดข้อมูลผู้ใช้ล้มเหลว", { autoClose: 3000 });
      setLoading(false);
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

    if (!newUser.username || !newUser.email) {
      toast.error("กรุณากรอกชื่อผู้ใช้และอีเมล", { autoClose: 3000 });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users`, newUser, {
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
      setUsers((prev) => [response.data, ...prev]);
      toast.success("เพิ่มผู้ใช้สำเร็จ", { autoClose: 3000 });
      // fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || "ไม่สามารถเพิ่มผู้ใช้");
      toast.error("เพิ่มผู้ใช้ล้มเหลว", { autoClose: 3000 });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    // ตรวจสอบข้อมูลก่อนส่ง
    if (!editUser.username || !editUser.email) {
      toast.error("กรุณากรอกชื่อผู้ใช้และอีเมล", { autoClose: 3000 });
      return;
    }
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/users/${editUser.id}`,
        editUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("Edit user response:", response.data); // Debug
      // รองรับทั้ง { id, username, ... } และ { user: { id, username, ... } }
      const updatedUser = response.data.user || response.data;
      if (!updatedUser.id || !updatedUser.username) {
        throw new Error("Invalid user data returned from API");
      }
      setUsers((prev) =>
        prev.map((user) => (user.id === editUser.id ? updatedUser : user))
      );
      toast.success("แก้ไขผู้ใช้สำเร็จ", { autoClose: 3000 });
      setEditUser(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Edit user error:",
        error,
        "Response:",
        error.response?.data
      );
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "ไม่สามารถแก้ไขผู้ใช้ได้";
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("ยืนยันการลบผู้ใช้?")) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/api/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Delete user response:", response.data); // Debug
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        toast.success("ลบผู้ใช้สำเร็จ", { autoClose: 3000 });
      } catch (error) {
        console.error(
          "Delete user error:",
          error,
          "Response:",
          error.response?.data
        );
        const errorMessage = error.response?.data?.error || "ลบผู้ใช้ล้มเหลว";
        toast.error(errorMessage, { autoClose: 3000 });
      }
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    if (togglingUserId) return;
    setTogglingUserId(userId);

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/users/${userId}/status`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = response.data.user;
      if (!updatedUser.id || !updatedUser.username) {
        throw new Error("Invalid user data returned from API");
      }
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );

      toast.success(
        `เปลี่ยนสถานะเป็น ${currentStatus ? "ไม่ได้ใช้งาน" : "ใช้งาน"} สำเร็จ`,
        {
          autoClose: 3000,
          toastId: `toggle-${userId}`, // ป้องกัน toast ซ้ำ
        }
      );
      // await fetchUsers();
    } catch (err) {
      console.error("Toggle active error:", err);
      toast.error("เปลี่ยนสถานะผู้ใช้ล้มเหลว", { autoClose: 3000 });
    } finally {
      setTogglingUserId(null);
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
    if (!user || !user.id || !user.username) {
      toast.error("ข้อมูลผู้ใช้ไม่สมบูรณ์", { autoClose: 3000 });
      return;
    }
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
    <div className="xl:max-w-screen-xl mx-auto px-4 py-8 lg:max-w-screen-lg">
      <div className="bg-white shadow-lg rounded-xl p-6 border border-green-100 mt-4 animate-slide-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-green-600" /> การจัดการผู้ใช้
        </h2>
        {error && (
          <p className="text-red-600 mb-4 bg-red-100 p-3 rounded-md">{error}</p>
        )}
        <form onSubmit={handleAddUser} className="mb-6 space-y-4">
          <div className="grid gird-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <User size={16} className="inline-block mr-1" /> ชื่อผู้ใช้
              </label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>
            <div className="relative">
              <label className="block font-medium text-gray-700 mb-1">
                <Key size={16} className="inline-block mr-1" /> รหัสผ่าน
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-7 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Mail size={16} className="inline-block mr-1" /> อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Shield size={16} className="inline-block mr-1" />{" "}
                สิทธิในการใช้งาน
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition appearance-none pr-10"
                >
                  <option value="superadmin">Superadmin (ผู้ดูแลสูงสุด)</option>
                  <option value="admin">Admin (ผู้ดูแล)</option>
                  <option value="employee">Employee (พนักงาน)</option>
                  <option value="user">User (ผู้ใช้)</option>
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
                <User size={16} className="inline-block mr-1" /> ชื่อ
              </label>
              <input
                type="text"
                name="first_name"
                value={newUser.first_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <User size={16} className="inline-block mr-1" /> สกุล
              </label>
              <input
                type="text"
                name="last_name"
                value={newUser.last_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              <UserPlus size={16} className="inline-block mr-1" /> เพิ่มผู้ใช้
            </button>
            <button
              type="button"
              onClick={() =>
                setNewUser({
                  username: "",
                  password: "",
                  email: "",
                  role: "user",
                  first_name: "",
                  last_name: "",
                })
              }
              className="bg-yellow-300 text-gray-700 px-4 py-2 rounded-md hover:bg-yellow-400 transition"
            >
              🧹 รีเซ็ต
            </button>
          </div>
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
                      colSpan="7"
                      className="px-4 py-3 text-center text-sm text-gray-500"
                    >
                      ไม่พบผู้ใช้
                    </td>
                  </tr>
                ) : (
                  users.map((user) =>
                    user && user.id && user.username ? (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-sm">{user.username}</td>
                        <td className="px-4 py-3 text-sm">
                          {user.email || "-"}
                        </td>
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
                            {user.is_active ? "ใช้งาน" : "ไม่ได้ใช้งาน"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm flex space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            aria-label="แก้ไขผู้ใช้"
                          >
                            <Edit size={16} className="mr-1" /> แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 flex items-center"
                            aria-label="ลบผู้ใช้"
                          >
                            <Trash2 size={16} className="mr-1" /> ลบ
                          </button>
                          <button
                            onClick={() =>
                              handleToggleActive(user.id, user.is_active)
                            }
                            className={`flex items-center ${
                              user.is_active
                                ? "text-yellow-600 hover:text-yellow-800"
                                : "text-green-600 hover:text-green-800"
                            } ${
                              togglingUserId === user.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={togglingUserId === user.id}
                            aria-label={
                              user.is_active
                                ? "ปิดใช้งานผู้ใช้"
                                : "เปิดใช้งานผู้ใช้"
                            }
                          >
                            {togglingUserId === user.id ? (
                              "กำลังอัปเดต..."
                            ) : user.is_active ? (
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
                    ) : null
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Modal สำหรับแก้ไขผู้ใช้งาน */}
          {/* Card View สำหรับ Mobile */}
          <div className="sm:hidden space-y-4">
            {loading ? (
              <div className="text-center text-sm text-gray-500">
                กำลังโหลด....
              </div>
            ) : users.length === 0 ? (
              <div className="text-center text-sm text-gray-500">
                ไม่พบผู้ใช้
              </div>
            ) : (
              users.map((user) =>
                user && user.id && user.username ? (
                  <div
                    key={user.id}
                    className="bg-white p-4 rounded-lg shadow border border-green-100"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {user.username}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.is_active ? "ใช้งาน" : "ไม่ได้ใช้งาน"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      อีเมล: {user.email || "-"}
                    </div>
                    <div className="text-sm text-gray-600">
                      บทบาท: {getRoleLabel(user.role)}
                    </div>
                    <div className="text-sm text-gray-600">
                      ชื่อ: {user.first_name || "-"}
                    </div>
                    <div className="text-sm text-gray-600">
                      สกุล: {user.last_name || "-"}
                    </div>
                    <div className="mt-3 flex space-x-2 flex-wrap gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                        aria-label="แก้ไขผู้ใช้"
                      >
                        <Edit size={16} className="mr-1" /> แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        aria-label="ลบผู้ใช้"
                      >
                        <Trash2 size={16} className="mr-1" /> ลบ
                      </button>
                      <button
                        onClick={() =>
                          handleToggleActive(user.id, user.is_active)
                        }
                        className={`flex items-center text-sm ${
                          user.is_active
                            ? "text-yellow-600 hover:text-yellow-800"
                            : "text-green-600 hover:text-green-800"
                        } ${
                          togglingUserId === user.id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={togglingUserId === user.id}
                        aria-label={
                          user.is_active
                            ? "ปิดใช้งานผู้ใช้"
                            : "เปิดใช้งานผู้ใช้"
                        }
                      >
                        {togglingUserId === user.id ? (
                          "กำลังอัปเดต..."
                        ) : user.is_active ? (
                          <>
                            <ToggleLeft size={16} className="mr-1" /> ปิดใช้งาน
                          </>
                        ) : (
                          <>
                            <ToggleRight size={16} className="mr-1" />{" "}
                            เปิดใช้งาน
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null
              )
            )}
          </div>
        </div>
      </div>

      {isModalOpen && editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-slide-in">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <User size={20} className="text-green-600" /> แก้ไขผู้ใช้
            </h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  <User size={16} className="inline-block mr-1" /> ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  name="username"
                  value={editUser.username}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  <Mail size={16} className="inline-block mr-1" /> อีเมล
                </label>
                <input
                  type="email"
                  name="email"
                  value={editUser.email}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  <Shield size={16} className="inline-block mr-1" />{" "}
                  สิทธิในการใช้งาน
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={editUser.role}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition appearance-none pr-10"
                  >
                    <option value="superadmin">
                      Superadmin (ผู้ดูแลสูงสุด)
                    </option>
                    <option value="admin">Admin (ผู้ดูแล)</option>
                    <option value="employee">Employee (พนักงาน)</option>
                    <option value="user">User (ผู้ใช้)</option>
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
                  <User size={16} className="inline-block mr-1" /> ชื่อ
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={editUser.first_name}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  <User size={16} className="inline-block mr-1" /> สกุล
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={editUser.last_name}
                  onChange={handleEditInputChange}
                  className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-600 focus:ring-green-600 transition"
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
                    className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-600"
                  />
                  <span className="ml-2 text-gray-700">
                    {editUser.is_active ? "ใช้งาน" : "ไม่ได้ใช้งาน"}
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  💾 บันทึก
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
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
