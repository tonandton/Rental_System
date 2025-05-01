import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ token, role, setToken, setRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    setRole("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white  text-black shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-lg sm:text-xl font-bold">Rental System</span>
          </div>

          {/* LinkForDesktop */}
          <div className="hidden sm:flex space-x-4">
            <button className="px-3 py-2 rounded-md  hover:text-green-500">
              หน้าแรก
            </button>
            <button className="px-3 py-2 rounded-md hover:text-green-500">
              รายงานรอบเดือน
            </button>
            <>
              <button className="px-3 py-2 rounded-md hover:text-green-500">
                จัดการผู้ใช้
              </button>
              <button className="px-3 py-2 rounded-md hover:text-green-500">
                จัดการโครงการ
              </button>
            </>
            <button className="px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-bold">
              ออกจากระบบ
            </button>
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
