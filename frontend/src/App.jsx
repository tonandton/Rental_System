import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./components/Main";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  // useEffect(() => {
  //   if (!token) setRole("");
  // }, [token]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <Main />
            </ErrorBoundary>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
