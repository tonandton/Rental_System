import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MenuIcon, XIcon } from "lucide-react";

function Navbar({ token, role, user, setToken, setRole, setUser }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profileRef = useRef(null);
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
      roles: ["superadmin", "admin", "user", "employee"],
    },
  ];

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition duration-300 ${
                    isActive
                      ? "bg-white text-green-800 shadow-md"
                      : "hover:bg-green-500 hover:shadow-lg"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          {token && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-green-800 font-bold hover:scale-105 transition duration-300 shadow ring-2 ring-white"
              >
                <span className="text-sm font-medium">
                  {getInitials(user?.first_name, user?.last_name)}
                </span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-xl py-2 z-50 animate-fade-in border border-gray-100">
                  <div className="px-4 py-2 border-b font-semibold flex items-center gap-2">
                    <span className="text-green-500">👤</span>
                    {user?.first_name} {user?.last_name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-red-600 transition flex items-center gap-2"
                  >
                    🚪 ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 rounded-full hover:bg-green-700 transition"
          >
            {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-700 px-4 pb-4 rounded-b-lg animate-slide-in-down">
          <div className="pt-2 space-y-1">
            {navItems
              .filter((item) => item.roles.includes(role))
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-base font-medium transition duration-300 ${
                      isActive ? "bg-green-900" : "hover:bg-green-600"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            {token && (
              <div className="mt-3 pt-3 border-t border-green-600">
                <div className="text-sm text-white mb-2">
                  👤 {user?.first_name} {user?.last_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition"
                >
                  🚪 ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
