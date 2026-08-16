import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Skeleton } from "./ui/index.js";

function Guard({ role, children }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading) return <div className="mx-auto max-w-4xl space-y-3 p-8"><Skeleton className="h-10 w-48" /><Skeleton className="h-52" /></div>;
  if (!auth.user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (auth.role !== role) return <Navigate to={auth.role === "super-admin" ? "/super-admin" : auth.role === "hospital-admin" ? "/admin" : "/login"} replace />;
  return children;
}

export const RequireHospitalAdmin = ({ children }) => <Guard role="hospital-admin">{children}</Guard>;
export const RequireSuperAdmin = ({ children }) => <Guard role="super-admin">{children}</Guard>;
