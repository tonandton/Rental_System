import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Home,
  FilePlus,
  Layers,
  SquareChevronLeft,
  SquareChevronRight,
} from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

function Navbar({ user }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const profileRef = useRef(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const { role, token, setToken, setRole, setUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setToken("");
    setRole("");
    setUser(null);
    localStorage.clear(); // หรือ removeItem ทีละตัว
    navigate("/login");
  };

  const navItems = [
    {
      label: "หน้าแรก",
      icon: <Home size={18} />,
      roles: ["superadmin", "admin", "user", "employee"],
      children: [
        { path: "/", label: "หน้าหลัก" },
        { path: "/main-history", label: "หน้าแรก น้ำ - ไฟ" },
      ],
    },
    {
      label: "จัดการ",
      icon: <Layers size={18} />,
      roles: ["superadmin", "admin"],
      children: [
        { path: "/projects", label: "จัดการโครงการ" },
        { path: "/manage-users", label: "จัดการผู้ใช้งาน" },
      ],
    },
    {
      label: "บันทึกรายการ",
      icon: <FilePlus size={18} />,
      roles: ["superadmin", "admin", "user", "employee"],
      children: [
        { path: "/add-rental-history", label: "บันทึกค่าเช่า/ค่าน้ำไฟ" },
      ],
    },
  ];

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const toggleDropdown = (label) => {
    setDropdownOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      // เฉพาะมือถือเท่านั้น
      if (window.innerWidth >= 768) return;

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        isProfileOpen
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSidebar);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    };
  }, [isSidebarOpen, isProfileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // เรียกตอน mount ด้วย
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex max-h-screen">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed z-40 top-0 left-0 h-full bg-green-700 text-white transition-all duration-300 ease-in-out shadow-xl
    ${isSidebarOpen ? "w-56" : "w-0 md:w-16"}
    overflow-x-hidden`}
      >
        <div className="flex items-center justify-between py-5 px-2 mt-2">
          <span
            className={`font-bold text-xl transition-opacity duration-200 ${
              !isSidebarOpen && "opacity-0 invisible"
            }`}
          >
            {/* WEBILL */}
          </span>
          <button
            // onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white focus:outline-none hover:bg-green-600"
          >
            {isSidebarOpen ? (
              <div className="flex items-center">
                <SquareChevronLeft size={20} />
                <p className="ml-2 mr-32">MSSOCIETY</p>
              </div>
            ) : (
              <SquareChevronRight size={20} />
            )}
          </button>
        </div>
        <nav className="px-2 space-y-5">
          {navItems.map(
            (item) =>
              item.roles.includes(role) && (
                <div key={item.label}>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-green-600 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      {isSidebarOpen && <span>{item.label}</span>}
                    </div>
                    {isSidebarOpen &&
                      (dropdownOpen[item.label] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                  </button>
                  <div
                    className={`ml-6 mt-1 space-y-1 transition-all duration-300 overflow-hidden ${
                      dropdownOpen[item.label] && isSidebarOpen
                        ? "max-h-96"
                        : "max-h-0"
                    }`}
                  >
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `block px-3 py-1 rounded-md text-sm transition ${
                            isActive
                              ? "bg-white text-green-800"
                              : "text-white hover:bg-green-600"
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )
          )}
        </nav>
      </aside>

      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 max-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-56" : "ml-0"
        }`}
      >
        {/* Top Navbar */}
        <nav className="bg-white text-green-800 shadow flex items-center justify-between px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* ปุ่ม Toggle Sidebar (แสดงเฉพาะมือถือ) */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-green-800 focus:outline-none md:hidden"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="text-lg font-bold">MESUK SOCIETY</span>
          </div>
          {token && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-green-600 text-white font-bold ring-2 ring-white hover:scale-105 transition"
              >
                {getInitials(user?.first_name, user?.last_name)}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-xl py-3 z-50 border border-gray-100 animate-fade-in">
                  <div className="px-4 py-2 font-semibold border-b flex items-center gap-2">
                    👤 {user?.first_name} {user?.last_name}
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
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
