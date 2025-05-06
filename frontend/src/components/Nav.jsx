import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar({ token, role, user, setToken, setRole, setUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setToken(null);
    setRole(null);
    setUser(null);
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "หน้าแรก", roles: ["superadmin", "admin", "user"] },
    {
      path: "/monthly-report",
      label: "รายงานรอบเดือน",
      roles: ["superadmin", "admin", "user"],
    },
    { path: "/manage-users", label: "จัดการผู้ใช้", roles: ["superadmin"] },
    {
      path: "/add-project",
      label: "เพิ่มโครงการ",
      roles: ["superadmin", "admin"],
    },
    {
      path: "/projects",
      label: "จัดการโครงการ",
      roles: ["superadmin", "admin", "user"],
    },
    {
      path: "/bills",
      label: "ใบแจ้งหนี้",
      roles: ["superadmin", "admin", "user"],
    },
    {
      path: "/add-rental-history",
      label: "บันทึกประวัติ",
      roles: ["superadmin", "admin", "user"],
    },
  ];

  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Rental System</div>
          <div className="hidden md:flex space-x-4">
            {navItems
              .filter((item) => item.roles.includes(role))
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? "bg-indigo-700" : "hover:bg-indigo-500"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            {token && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
              >
                ออกจากระบบ
              </button>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-indigo-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16m-7 6h7"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-600">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-slide-in">
            {navItems
              .filter((item) => item.roles.includes(role))
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? "bg-indigo-700" : "hover:bg-indigo-500"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            {token && (
              <button
                onClick={() => {
                  handdleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-meduim hover:bg-indigo-500"
              >
                ออกจากระบบ
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
