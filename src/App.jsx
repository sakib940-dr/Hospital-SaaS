import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireHospitalAdmin, RequireSuperAdmin } from "./components/RouteGuards.jsx";
import { ToastProvider } from "./components/ui/index.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { HospitalProvider } from "./context/HospitalContext.jsx";
import { resolveTenant } from "./lib/resolveTenant.js";

const MarketingHome = lazy(() => import("./pages/marketing/MarketingHome.jsx"));
const VisitorSite = lazy(() => import("./pages/visitor/VisitorSite.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.jsx"));
const OnboardingWizard = lazy(() => import("./pages/onboarding/OnboardingWizard.jsx"));
const HospitalAdminShell = lazy(() => import("./pages/hospital-admin/HospitalAdminShell.jsx"));
const DashboardOverview = lazy(() => import("./pages/hospital-admin/DashboardOverview.jsx"));
const HospitalInfoPanel = lazy(() => import("./pages/hospital-admin/HospitalInfoPanel.jsx"));
const DoctorsPanel = lazy(() => import("./pages/hospital-admin/DoctorsPanel.jsx"));
const ServicesPanel = lazy(() => import("./pages/hospital-admin/ServicesPanel.jsx"));
const CostsPanel = lazy(() => import("./pages/hospital-admin/CostsPanel.jsx"));
const GalleryPanel = lazy(() => import("./pages/hospital-admin/GalleryPanel.jsx"));
const ReviewsPanel = lazy(() => import("./pages/hospital-admin/ReviewsPanel.jsx"));
const AppointmentsPanel = lazy(() => import("./pages/hospital-admin/AppointmentsPanel.jsx"));
const HospitalAnalyticsPage = lazy(() => import("./pages/hospital-admin/HospitalAnalyticsPage.jsx"));
const SettingsPanel = lazy(() => import("./pages/hospital-admin/SettingsPanel.jsx"));
const SuperAdminShell = lazy(() => import("./pages/super-admin/SuperAdminShell.jsx"));
const SuperOverviewPage = lazy(() => import("./pages/super-admin/OverviewPage.jsx"));
const HospitalsPage = lazy(() => import("./pages/super-admin/HospitalsPage.jsx"));
const PlatformAnalyticsPage = lazy(() => import("./pages/super-admin/PlatformAnalyticsPage.jsx"));
const PlaceholderPage = lazy(() => import("./pages/super-admin/PlaceholderPage.jsx"));

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-surface-subtle"><div className="text-center"><img src="/favicon.svg" alt="" className="mx-auto size-12 animate-pulse" /><p className="mt-3 text-primary-500">লোড হচ্ছে…</p></div></div>;
}

function TenantEntry() {
  const tenant = resolveTenant();
  if (tenant.mode === "super-admin") return <Navigate to="/super-admin" replace />;
  if (tenant.mode === "marketing") return <MarketingHome />;
  return <HospitalProvider><VisitorSite /></HospitalProvider>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/onboarding" element={<OnboardingWizard />} />
              <Route path="/admin" element={<RequireHospitalAdmin><HospitalAdminShell /></RequireHospitalAdmin>}>
                <Route index element={<DashboardOverview />} />
                <Route path="hospital-info" element={<HospitalInfoPanel />} />
                <Route path="doctors" element={<DoctorsPanel />} />
                <Route path="services" element={<ServicesPanel />} />
                <Route path="costs" element={<CostsPanel />} />
                <Route path="gallery" element={<GalleryPanel />} />
                <Route path="reviews" element={<ReviewsPanel />} />
                <Route path="appointments" element={<AppointmentsPanel />} />
                <Route path="analytics" element={<HospitalAnalyticsPage />} />
                <Route path="settings" element={<SettingsPanel />} />
              </Route>
              <Route path="/super-admin" element={<RequireSuperAdmin><SuperAdminShell /></RequireSuperAdmin>}>
                <Route index element={<SuperOverviewPage />} />
                <Route path="hospitals" element={<HospitalsPage />} />
                <Route path="analytics" element={<PlatformAnalyticsPage />} />
                <Route path="billing" element={<PlaceholderPage title="Billing" />} />
                <Route path="settings" element={<PlaceholderPage title="Platform Settings" />} />
              </Route>
              <Route path="/*" element={<TenantEntry />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
