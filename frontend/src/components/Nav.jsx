import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ token, role, user, setToken, setRole, setUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  // console.log(user);

  // Handle click outside  to clase dropdrown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    navigate("/login");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
  };

  const navItems = [
    { label: "หน้าแรก", path: "/", visible: true },
    { label: "รายงานรอบเดือน", path: "/monthly-report", visible: true },
    {
      label: "จัดการผู้ใช้",
      path: "/manage-users",
      visible: role === "superadmin",
    },
    {
      label: "เพิ่มโครงการ",
      path: "/add-project",
      visible: role === "superadmin" || role === "admin",
    },
    {
      label: "จัดการโครงการ",
      path: "/edit-projects",
      visible: role === "superadmin",
    },
    {
      label: "ใบแจ้งหนี้",
      path: "/bills",
      visible: role === "superadmin" || role === "admin" || role === "user",
    },
    {
      label: "บันทึกประวัติ",
      path: "/add-rental-history",
      visible: role === "superadmin" || role === "admin" || role === "user",
    },
  ];

  return (
    <nav className="bg-white  text-black shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-lg sm:text-xl font-bold">WEBR System</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex space-x-4 items-center">
            {token ? (
              <>
                {navItems
                  .filter((item) => item.visible)
                  .map((item) => (
                    <button
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      className="px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 hover:text-green-500 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 hover:text-green-500 transition-colors focus:outline-none"
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>{user ? `${user.first_name}` : "ผู้ใช้"}</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 animate-fade-in">
                      <div className="px-4 py-2 text-sm text-gray-700">
                        {user
                          ? `${user.first_name} ${user.last_name}`
                          : "ผู้ใช้"}
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-rose-500 hover:text-white"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 hover:text-green-500 transition-colors"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>

          {/* Hamburger for Smartphone */}
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden animate-slide-in">
          <div className="flex flex-col space-y-2 px-2 pt-2 pb-3">
            {token ? (
              <>
                {navItems
                  .filter((item) => item.visible)
                  .map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                        setIsDropdownOpen(false);
                      }}
                      className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-500 hover:text-white text-left"
                    >
                      {item.label}
                    </button>
                  ))}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-500 hover:text-white w-full text-left"
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>
                      {user ? `${user.first_name} ${user.last_name}` : "ผู้ใช้"}
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div className="mt-2 w-full bg-white rounded-md shadow-lg py-1 animate-fade-in">
                      <div className="px-4 py-2 text-sm text-gray-700">
                        {user
                          ? `${user.first_name} ${user.last_name}`
                          : "ผู้ใช้"}
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-rose-500 hover:text-white"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setIsOpen(false);
                }}
                className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-500 hover:text-white text-left"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
