import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "react-toastify";

function Login({ setToken, setRole, setUser }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    const rememberedPassword = localStorage.getItem("rememberedPassword");

    if (rememberedUsername && rememberedPassword) {
      setUsername(rememberedUsername);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username,
        password,
      });
      // console.log("Login.jsx: response:", response.data);
      const { token, role, id, first_name, last_name } = response.data;
      // console.log(
      //   "Login.jsx: Setting token:",
      //   token,
      //   "role:",
      //   role,
      //   "userId:",
      //   id,
      //   "user:",
      //   first_name
      // );
      setToken(token);
      setRole(role);
      setUser({ first_name, last_name });
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", id);
      localStorage.setItem("user", JSON.stringify({ first_name, last_name }));

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberedPassword");
      }

      navigate("/add-rental-history");
      toast.success("เข้าสู่ระบบสำเร็จ", { autoClose: 3000 });
    } catch (err) {
      // setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", { autoClose: 3000 });
      // console.error("Login.jsx: Error during login:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center">
          {/* <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg> */}
        </div>
        <h2 className="text-3xl font-extrabold text-center text-green-800 mb-6">
          ระบบจัดการค่าน้ำ ค่าไฟ
        </h2>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-5">
            <label>ชื่อผู้ใช้</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-5 relative">
            <label>รหัสผ่าน</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 pr-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-7 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          {/* Remember Me */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-sm text-gray-600">จำรหัสผ่าน</label>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg text-base font-semibold transition duration-200"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        {/* คำอธิบายบัญชีทดสอบ */}
        <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 shadow-sm">
          <h3 className="font-semibold text-green-700 mb-2">
            🔐 บัญชีสำหรับทดสอบระบบ
          </h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>superadmin</strong> / <code>adminpass</code> —
              สิทธิ์สูงสุด
            </li>
            <li>
              <strong>admin</strong> / <code>adminpass</code> —
              จัดการข้อมูลโครงการ
            </li>
            <li>
              <strong>user1</strong> / <code>userpass</code> — ผู้เช่า
              (โครงการของตน)
            </li>
            <li>
              <strong>user2</strong> / <code>userpass</code> — ผู้เช่า
              (โครงการของตน)
            </li>
            <li>
              <strong>employee1</strong> / <code>userpass</code> — พนักงาน
              (บันทึกข้อมูล)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
