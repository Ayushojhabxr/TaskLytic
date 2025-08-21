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
import NotFound from './Compnents/NotFound.jsx';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-1 bg-gray-100 pt-16">
        <Routes>
          {/* Fallback */}
          <Route path='*' element={<NotFound />} />

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />

          {/* Dashboards (no protection) */}
          <Route path="/profile" element={<UserProfileModal />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/intern-dashboard" element={<InternDashboard />} />
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />

          {/* Extra pages */}
          <Route path="/insights" element={<Insights />} />
          <Route path="/intern-tasks" element={<InternTaskDashboard />} />
          <Route path="/intern-forum" element={<CommunityReportForm />} />
          <Route path="/mentor-tasks" element={<MentorTaskDashboard />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
