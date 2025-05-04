import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Nav";

function Login({ setToken, setRole }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      const { token, role, id } = response.data;
      // console.log(
      //   "Login.jsx: Setting token:",
      //   token,
      //   "role:",
      //   role,
      //   "userId:",
      //   id
      // );
      setToken(token);
      setRole(role);
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", id);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      console.error("Login.jsx: Error during login:", err);
    }
  };

  return (
    <div className="main-h-screen bg-gray-100">
      <Navbar token={null} role={null} setToken={setToken} setRole={setRole} />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-xs sm:max-w-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            เข้าสู่ระบบ
          </h2>
          {error && (
            <p className="text-rose-500 text-xs sm:text-sm mb-4">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 border rounded text-sm sm:text-base"
            />
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border rounded text-sm sm:text-base"
            />
            <button
              type="submit"
              className="bg-green-400 text-white hover:bg-green-500"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
