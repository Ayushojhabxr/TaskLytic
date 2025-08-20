import React, { useState, useEffect  , useCallback} from 'react';
 // Import and use in your component
import UserProfileModal from '../Compnents/profilemodal';
import { Link, useNavigate , useLocation } from 'react-router-dom';
import { FiArrowRight } from "react-icons/fi";
import axios from 'axios';
const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin', 'intern', 'mentor'
  const navigate = useNavigate();
  const location = useLocation();


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  // On mount: check login and role
   const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // 'admin', 'intern', 'mentor'
  useEffect(() => {
   
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role.toLowerCase());
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [token , role]);

  const logout = () => {
        localStorage.removeItem("token"); 
      localStorage.removeItem('user');
      localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };

  const handleLogin = (path) => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    navigate(path);
  };

   const handleLogout = async () => {
      try {
        await axios.get("http://localhost:5000/api/users/logout", {
          withCredentials: true,
        });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        navigate("/");
      } catch (err) {
        console.error("Logout failed:", err);
        alert("Logout failed. Try again.");
      }
    };

  const commonNav = [
  
  ];

  const adminNav = [
    { name: 'Dashboard', href: '/admin-dashboard' },
    { name: 'Users', href: '/users' },
    { name: 'Insights', href: '/insights' },
    { name: 'Community Forum', href: '/intern-forum' },
  ];

  const internNav = [
    { name: 'Dashboard', href: '/intern-dashboard' },
    { name: 'Tasks', href: '/intern-tasks' },
    
    { name: 'Community Forum', href: '/intern-forum' },
  ];

  const mentorNav = [
    { name: 'Dashboard', href: '/mentor-dashboard' },
    { name: 'Tasks', href: '/mentor-tasks' },
   
    { name: 'Community Forum', href: '/intern-forum' },
  ];

  const getNavItems = () => {
    if (!isLoggedIn) return commonNav;
    if (userRole === "admin") return adminNav;
    if (userRole === "intern") return internNav;
    if (userRole === "mentor") return mentorNav;
    return [];
  };

  const navItems = getNavItems();


   const name = localStorage.getItem("name");
 const firstLetter = (name?.charAt(0) || 'U').toUpperCase();


// In your component where you fetch the profile

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [internProfile, setInternProfile] = useState(null);

  const fetchInternProfile = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/myprofile', {
        withCredentials: true
      });
      setInternProfile(res.data.user);
    } catch (error) {
      console.error('Error fetching intern profile:', error);
      // Handle error
    }
  }, []);


  return (
    <nav className="bg-gradient-to-r from-blue-300 via-purple-700 to-indigo-900 shadow-md fixed w-full z-10">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left - Logo and Mobile button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center ml-2">
               <img
                        src="/icon.png"
                        alt="Logo"
                        className="w-15 h-15 border-2 shadow-2xl border-blue-400 rounded-full mr-2"
                    />
              <span className="text-lg font-bold text-white">
                Tasklytic
              </span>
            </div>
          </div>

          {/* Center Nav Items - Desktop */}
          <div className="hidden  md:flex space-x-6">
            {navItems.map((item) => (
              // <Link
              //   key={item.name}
              //   to={item.href}
              //   className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              // >
              //   {item.name}
              // </Link>
              <Link
              key={item.name}
              to={item.href}
              className={`text-base font-semibold px-3 py-2 rounded-md ${
                location.pathname === item.href
                  ? 'bg-white/20 focus:outline-none  focus:ring-white  text-white'
                  : 'text-white  '
              }`}
            >
              {item.name}
            </Link>

            ))}
          </div>

          {/* Right - Auth/Login/Profile */}
          <div className="flex items-center">
            {!isLoggedIn ? (
              <div className="hidden md:flex space-x-2">
                <button
                onClick={() => handleLogin("/login")}
                className="button-15 flex items-center gap-2"
              >
                Get Started
                <FiArrowRight size={18} />
              </button>

               
              </div>
            ) : (
              <div className="ml-4 relative user-dropdown ">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex text-sm  rounded-full focus:outline-none "
                >
                  <div className="h-10 w-10 border-white-500 border-1  rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ">
                  {firstLetter}
                  </div>
                </button>
                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <div>
                      <button
                      onClick={async () => {
                        await fetchInternProfile();     // fetch profile first
                        setIsProfileModalOpen(true);    // then open modal
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View Profile
                    </button>

                      
                      <UserProfileModal
                        isOpen={isProfileModalOpen}
                        onClose={() => setIsProfileModalOpen(false)}
                        internProfile={internProfile}
                      />
                    </div>
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-4 py-2 text-base text-gray-600 hover:bg-gray-100"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 pb-3 px-4">
            {!isLoggedIn ? (
              <div className="space-y-1">
                <button
                  onClick={() => handleLogin("/")}
                  className="block text-white  font-bold w-full text-left px-4 py-2 text-base  hover:bg-indigo-100"
                >
                  Home
                </button>
                <button
                  onClick={() => handleLogin("/login")}
                  className="block text-white  font-bold w-full text-left px-4 py-2 text-base  hover:bg-indigo-100"
                >
                  Login
                </button>
                
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3">
                   <div className="h-10 w-10 border-white-500 border-1  rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ">
                  {firstLetter}
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-800">User</p>
                    <p className="text-sm font-medium text-gray-500">user@example.com</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                    <div>
                      <button
                      onClick={async () => {
                        await fetchInternProfile();     // fetch profile first
                        setIsProfileModalOpen(true);    // then open modal
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View Profile
                    </button>

                      
                      <UserProfileModal
                        isOpen={isProfileModalOpen}
                        onClose={() => setIsProfileModalOpen(false)}
                        internProfile={internProfile}
                      />
                    </div>
              
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
