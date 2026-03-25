import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardHome from "./pages/DashboardHome";
import DashboardNew from "./pages/DashboardNew";
import ResumeDatabase from "./pages/ResumeDatabase";
import UsersRoles from "./pages/UsersRoles";
import PendingUsers from "./pages/PendingUsers";
import DataConnectors from "./pages/DataConnectors";
import { AuthProvider, useAuth } from "./utils/AuthContext";
import "./styles/App.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-matcher"
              element={
                <ProtectedRoute>
                  <DashboardNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-database"
              element={
                <ProtectedRoute>
                  <ResumeDatabase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <UsersRoles />
                </AdminRoute>
              }
            />
            <Route
              path="/pending-users"
              element={
                <AdminRoute>
                  <PendingUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/data-connectors"
              element={
                <AdminRoute>
                  <DataConnectors />
                </AdminRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
