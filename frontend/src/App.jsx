import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Nav";
import Main from "./components/Main";
import Login from "./components/Login";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-100">
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
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
