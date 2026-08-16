import { BarChart3, Building2, CreditCard, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarLayout, SidebarNavItem } from "../../components/ui/index.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function SuperAdminShell() {
  const navigate = useNavigate(); const location = useLocation(); const { signOut } = useAuth();
  const items = [["/super-admin","Dashboard",LayoutDashboard],["/super-admin/hospitals","Hospitals",Building2],["/super-admin/billing","Billing",CreditCard],["/super-admin/analytics","Platform Analytics",BarChart3],["/super-admin/settings","Settings",Settings]];
  const active = (path) => path === "/super-admin" ? location.pathname === path : location.pathname.startsWith(path);
  return <SidebarLayout brand="Platform Admin" sidebar={<>{items.map(([path,label,icon]) => <SidebarNavItem key={path} label={label} icon={icon} active={active(path)} onClick={() => navigate(path)} />)}<div className="my-3 border-t border-white/10" /><SidebarNavItem label="লগআউট" icon={LogOut} onClick={async () => { await signOut(); navigate("/login"); }} /></>}><Outlet /></SidebarLayout>;
}
