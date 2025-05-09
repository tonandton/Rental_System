import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Nav";
import Main from "./components/Main";
import Login from "./components/Login";
import ErrorBoundary from "./components/ErrorBoundary";
import AddProject from "./components/AddProject";
import Projects from "./components/Projects";
import ProtectedRoute from "./components/ProtectedRoute";
import AddRentalHistory from "./components/AddRentalHistory";
import "./index.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  return (
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
            path="/projects"
            element={<Projects token={token} role={role} user={user} />}
          />
          <Route
            path="/add-rental-history"
            element={<AddRentalHistory token={token} role={role} user={user} />}
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
