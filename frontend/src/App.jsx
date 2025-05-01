import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./components/Main";
import Login from "./components/Login";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  // Log token and role changes
  useEffect(() => {
    console.log("App.jsx: token:", token, "role:", role);
  }, [token, role]);

  // Update localStorage when token or role changes
  useEffect(() => {
    console.log(
      "App.jsx: Updating localStorage - token:",
      token,
      "role:",
      role
    );
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [token, role]);

  // Update localStorage whenever token or role changes
  useEffect(() => {
    console.log(
      "App.jsx: Updating localStorage - token:",
      token,
      "role:",
      role
    );
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [token, role]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <Main
                token={token}
                role={role}
                setToken={setToken}
                setRole={setRole}
              />
            </ErrorBoundary>
          }
        />
        <Route
          path="/login"
          element={<Login setToken={setToken} setRole={setRole} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
