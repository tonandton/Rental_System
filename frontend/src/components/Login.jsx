import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setToken, setRole, setUser }) {
  const [username, setUsername] = useState(
    localStorage.getItem("rememberedUsername") || ""
  );
  const [password, setPassword] = useState(
    localStorage.getItem("rememberedPassword") || ""
  );
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("rememberedUsername")
  );
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      console.error("Login.jsx: Error during login:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          {/* <svg
            className="w-16 h-16 text-blue-500"
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
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          ระบบจัดการค่าน้ำ ค่าไฟ
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-600">จำรหัสผ่าน</label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            ล็อกอิน
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
