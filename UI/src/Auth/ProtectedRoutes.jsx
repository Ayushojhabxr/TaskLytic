// src/Auth/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { verifyToken } from "./authservice.js";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await verifyToken(); // user object or null
      if (!user) {
        setIsAuthorized(false);
      } else {
        // Role-based check directly from backend response
        if (allowedRoles && allowedRoles.length > 0) {
          setIsAuthorized(allowedRoles.includes(user.role));
        } else {
          setIsAuthorized(true);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Checking permissions...
      </div>
    );
  }

  if (!isAuthorized) {
    toast.error(
      "Please log in first and if you don't have credentials contact admin",
      {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
