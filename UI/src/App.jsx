import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Pages/Navbar';
import Footer from './Pages/Footer';
import Home from './Pages/Home';
import Login from './Compnents/Auth/Login';
import Contact from './Pages/Contact';
import AdminDashboard from './Compnents/Dashboard/Admindashboard';
import Users from './Compnents/Admin/users';
import InternDashboard from './Compnents/Dashboard/InternDasjboard';
import MentorDashboard from './Compnents/Dashboard/Mentordashboard';
import MentorTaskDashboard from './Compnents/Mentor/Mentortasks';
import InternTaskDashboard from './Compnents/Intern/Interntask';
import CommunityReportForm from './Compnents/Intern/Internforum';
import Insights from './Compnents/Admin/Insights';
import UserProfileModal from './Compnents/profilemodal';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./Auth/ProtectedRoutes.jsx";
import NotFound from './Compnents/NotFound.jsx';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-1 bg-gray-100 pt-16">
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "intern", "mentor"]}>
                <UserProfileModal />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Insights />
              </ProtectedRoute>
            }
          />

          {/* Intern */}
          <Route
            path="/intern-dashboard"
            element={
              <ProtectedRoute allowedRoles={["intern"]}>
                <InternDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intern-tasks"
            element={
              <ProtectedRoute allowedRoles={["intern"]}>
                <InternTaskDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intern-forum"
            element={
              <ProtectedRoute allowedRoles={["admin", "intern", "mentor"]}>
                <CommunityReportForm />
              </ProtectedRoute>
            }
          />

          {/* Mentor */}
          <Route
            path="/mentor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor-tasks"
            element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorTaskDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
