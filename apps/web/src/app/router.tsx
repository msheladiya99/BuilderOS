import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./components/auth/LoginPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ProjectsModule } from "./components/projects/ProjectsModule";
import { UnitsModule } from "./components/units/UnitsModule";
import { CustomersModule } from "./components/customers/CustomersModule";
import { OwnerKycModule } from "./components/owners/OwnerKycModule";
import { AccountingModule } from "./components/accounting/AccountingModule";
import { PaymentsModule } from "./components/payments/PaymentsModule";
import { CRMModule } from "./components/crm/CRMModule";
import { InventoryModule } from "./components/inventory/InventoryModule";
import { LabourModule } from "./components/labour/LabourModule";
import { DocumentsModule } from "./components/documents/DocumentsModule";
import { ConstructionModule } from "./components/construction/ConstructionModule";
import { MaintenanceModule } from "./components/maintenance/MaintenanceModule";
import { UsersModule } from "./components/users/UsersModule";
import { OwnerPortal } from "./components/owner/OwnerPortal";
import { VendorPortal } from "./components/vendor/VendorPortal";
import { SettingsPage } from "./components/settings/SettingsPage";
import { SuperAdminPanel } from "./components/superadmin/SuperAdminPanel";
import { ProtectedRoute } from "./ProtectedRoute";
import { useTheme } from "../context/ThemeContext";

function Themed({ children }: { children: (isDark: boolean) => ReactNode }) {
  const { isDark } = useTheme();
  return <>{children(isDark)}</>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "superadmin",
        element: (
          <Themed>{(isDark) => <SuperAdminPanel isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Themed>{(isDark) => <Dashboard isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "projects",
        element: (
          <Themed>{(isDark) => <ProjectsModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "units",
        element: (
          <Themed>{(isDark) => <UnitsModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "units-floorplan",
        element: (
          <Themed>{(isDark) => <UnitsModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "customers",
        element: (
          <Themed>{(isDark) => <CustomersModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "owner-kyc",
        element: (
          <Themed>{(isDark) => <OwnerKycModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "accounting",
        element: (
          <Themed>{(isDark) => <AccountingModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "accounting-pl",
        element: (
          <Themed>{(isDark) => <AccountingModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "accounting-balance",
        element: (
          <Themed>{(isDark) => <AccountingModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "accounting-gst",
        element: (
          <Themed>{(isDark) => <AccountingModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "payments",
        element: (
          <Themed>{(isDark) => <PaymentsModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "crm",
        element: (
          <Themed>{(isDark) => <CRMModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "inventory",
        element: (
          <Themed>{(isDark) => <InventoryModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "labour",
        element: (
          <Themed>{(isDark) => <LabourModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "construction",
        element: (
          <Themed>{(isDark) => <ConstructionModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "documents",
        element: (
          <Themed>{(isDark) => <DocumentsModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "maintenance",
        element: (
          <Themed>{(isDark) => <MaintenanceModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "users",
        element: (
          <Themed>{(isDark) => <UsersModule isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "owner",
        element: (
          <Themed>{(isDark) => <OwnerPortal isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "vendor",
        element: (
          <Themed>{(isDark) => <VendorPortal isDark={isDark} />}</Themed>
        ),
      },
      {
        path: "settings",
        element: (
          <Themed>{(isDark) => <SettingsPage isDark={isDark} />}</Themed>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
