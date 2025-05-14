import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MenuIcon, XIcon } from "lucide-react";

function Navbar({ token, role, user, setToken, setRole, setUser }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
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
      roles: ["superadmin", "admin"],
    },
    {
      path: "/bills",
      label: "ใบแจ้งหนี้",
      roles: ["superadmin", "admin", "user"],
    },
    {
      path: "/add-rental-history",
      label: "บันทึกประวัติ",
      roles: ["superadmin", "admin", "user", "employee"],
    },
  ];

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // สำหรับ Desktop Profile
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }

      // สำหรับ Mobile Dropdown
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-800 text-white shadow-xl backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-extrabold tracking-wide uppercase text-white drop-shadow-lg">
          WEBILL SYSETM
        </div>

        {/* ปุ่มเมนู (Mobile) */}
        <div className="md:hidden relative" ref={mobileMenuRef}>
          {token && (
            <>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-green-700 font-extrabold shadow-md ring-2 ring-white hover:scale-105 transition-transform duration-200"
              >
                <span className="text-base">
                  {getInitials(user?.first_name, user?.last_name)}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl z-50 border border-gray-200 animate-slide-in-down overflow-hidden">
                  {/* ส่วนหัวของโปรไฟล์ */}
                  <div className="px-4 py-3 bg-green-50 border-b border-gray-200 flex items-center gap-2 font-semibold text-green-800">
                    <span className="text-xl">👤</span>
                    {user?.first_name} {user?.last_name}
                  </div>

                  {/* เมนูรายการ */}
                  <div className="px-3 py-2 space-y-1">
                    {navItems
                      .filter((item) => item.roles.includes(role))
                      .map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-sm font-medium transition ${
                              isActive
                                ? "bg-green-100 text-green-800"
                                : "text-gray-700 hover:bg-gray-100"
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
                  </div>

                  {/* ปุ่มออกจากระบบ */}
                  <div className="border-t border-gray-100 mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      🚪 ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4">
          {token && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-green-800 font-bold hover:scale-105 transition ring-2 ring-white"
              >
                {getInitials(user?.first_name, user?.last_name)}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mb-2 w-64 bg-white text-gray-800 rounded-xl shadow-xl py-3 z-50 animate-slide-in-down  border-gray-100">
                  {/* ชื่อผู้ใช้ */}
                  <div className="px-4 py-2 font-semibold border-b flex items-center gap-2">
                    👤 {user?.first_name} {user?.last_name}
                  </div>

                  {/* รายการเมนู */}
                  <div className="py-2 px-2 space-y-1">
                    {navItems
                      .filter((item) => item.roles.includes(role))
                      .map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsProfileOpen(false)}
                          className={({ isActive }) =>
                            `block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition ${
                              isActive
                                ? "bg-green-100 text-green-800"
                                : "hover:bg-gray-100"
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
                  </div>

                  {/* ปุ่มออกจากระบบ */}
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    🚪 ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
