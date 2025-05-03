import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./components/Main";
import Login from "./components/Login";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Main
                token={token}
                role={role}
                setToken={setToken}
                setRole={setRole}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Login
                setToken={setToken}
                setRole={setRole}
                token={token}
                role={role}
              />
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
