import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Nav";
import Main from "./components/Main";
import Login from "./components/Login";
import ErrorBoundary from "./components/ErrorBoundary";
import AddProject from "./components/AddProject";
import ProtectedRoute from "./components/ProtectedRoute";
import AddRentalHistory from "./components/AddRentalHistory";
import UserMangement from "./components/UserManagement";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import Projects from "./components/Projects";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  return (
    <div>
      <ErrorBoundary>
        <Router>
          <Navbar
            token={token}
            role={role}
            user={user}
            setToken={setToken}
            setRole={setRole}
            setUser={setUser}
          />
          <Routes>
            <Route
              path="/login"
              element={
                <Login
                  setToken={setToken}
                  setRole={setRole}
                  setUser={setUser}
                />
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
                <AddRentalHistory token={token} role={role} user={user} />
              }
            />
          </Routes>
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
