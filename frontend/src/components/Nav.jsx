import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ token, role, setToken, setRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  console.log(
    "Navbar.jsx: token:",
    token,
    "role:",
    role,
    "isLoggedIn:",
    token && token !== ""
  );

  const handleLogout = () => {
    setToken("");
    setRole("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/");
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { label: "หน้าแรก", path: "/", visible: true },
    { label: "รายงานรอบเดือน", path: "/monthly-report", visible: true },
    {
      label: "จัดการผู้ใช้",
      path: "/manage-users",
      visible: token && role === "superuser",
    },
    {
      label: "จัดการโครงการ",
      path: "/edit-projects",
      visible: token && role === "superuser",
    },
  ];

  return (
    <nav className="bg-white  text-black shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-lg sm:text-xl font-bold">Rental System</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex space-x-4 items-center">
            {navItems.map((item) =>
              item.visible ? (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 hover:text-green-500 transition-colors"
                >
                  {item.label}
                </button>
              ) : null
            )}
            {token && token !== "" ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md hover:bg-rose-500"
              >
                ออกจากระบบ
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-2 rounded-md hover:text-green-500"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>

          {/* Hamburger For Smartphone */}
          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Menu Phone */}
      {isOpen && (
        <div className="sm:hidden animate-slide-in">
          <div className="flex flex-col space-y-2 px-2 pt-2 pb-3">
            <button className="px-3 py-2 rounded-md hover:bg-blue-500 hover:text-white text-left font-bold">
              หน้าแรก
            </button>
            <button className="px-3 py-2 rounded-md hover:bg-blue-500 hover:text-white text-left font-bold">
              รายงานรอบเดือน
            </button>
            <>
              <button className="px-3 py-2 rounded-md hover:bg-blue-500 hover:text-white text-left font-bold">
                จัดการผู้ใช้
              </button>
              <button className="px-3 py-2 rounded-md hover:bg-blue-500 hover:text-white text-left font-bold">
                จัดการโครงการ
              </button>
            </>
            <button className="px-3 py-2 rounded-md hover:bg-red-500 hover:text-white text-left font-bold">
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
