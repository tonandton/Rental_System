import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Layout/Nav";
import Main from "./components/Layout/Main";
import MainHistory from "./components/Layout/MainHistory";
import Login from "./components/Auth/Login";
import ErrorBoundary from "./components/Layout/ErrorBoundary";
import AddProject from "./components/Projects/AddProject";
import Projects from "./components/Projects/Projects";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AddRentalHistory from "./components/History/AddRentalHistory";
import UserMangement from "./components/User/UserManagement";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

function AppContent({ token, role, user, setToken, setRole, setUser }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && (
        <Navbar
          token={token}
          role={role}
          user={user}
          setToken={setToken}
          setRole={setRole}
          setUser={setUser}
        />
      )}
      <Routes>
        <Route
          path="/login"
          element={
            <Login setToken={setToken} setRole={setRole} setUser={setUser} />
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute token={token}>
              <Main
                token={token}
                role={role}
                setToken={setToken}
                setRole={setRole}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/main-history"
          element={
            <ProtectedRoute token={token}>
              <MainHistory
                token={token}
                role={role}
                setToken={setToken}
                setRole={setRole}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute token={token}>
              {["superadmin", "admin"].includes(role) ? (
                <Projects token={token} role={role} />
              ) : (
                <div className="p-8 text-red-600 font-semibold text-center">
                  คุณไม่มีสิทธิ์เข้าถึงหน้านี้
                </div>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-project"
          element={
            <ProtectedRoute token={token}>
              {["superadmin", "admin"].includes(role) ? (
                <AddProject token={token} role={role} />
              ) : (
                <div className="p-8 text-red-600 font-semibold text-center">
                  คุณไม่มีสิทธิ์เข้าถึงหน้านี้
                </div>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute token={token}>
              {["superadmin", "admin"].includes(role) ? (
                <UserMangement token={token} role={role} />
              ) : (
                <div className="p-8 text-red-600 font-semibold text-center">
                  คุณไม่มีสิทธิ์เข้าถึงหน้านี้
                </div>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-rental-history"
          element={
            <ProtectedRoute token={token}>
              <AddRentalHistory token={token} role={role} user={user} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [token, role, user]);

  return (
    <div>
      <ErrorBoundary>
        <Router>
          <AppContent
            token={token}
            role={role}
            user={user}
            setToken={setToken}
            setRole={setRole}
            setUser={setUser}
          />
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </ErrorBoundary>
    </div>
  );
}

export default App;
