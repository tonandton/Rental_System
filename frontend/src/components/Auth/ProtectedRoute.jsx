import { Navigate } from "react-router-dom";
import { logout, isTokenExpired } from "../../../../backend/utils/auth";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
