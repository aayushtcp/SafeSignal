import { Navigate, Outlet } from "react-router-dom";
import isRefreshTokenValid from "../interceptor/auth";

const ProtectedRoute = () => {
  // console.log(isRefreshTokenValid);
  if (!isRefreshTokenValid()) {
    // Redirect to login if the refresh token is invalid or expired
    return <Navigate to="/login" />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
