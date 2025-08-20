
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const loginImg = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&q=80";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data and token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role)
    
     
      localStorage.setItem("name", data.user.firstName);


      // Redirect based on role (would use navigate in actual app)
      switch(data.user.role) {
        case 'admin':
          console.log('Redirecting to admin dashboard');
          navigate('/admin-dashboard');
          break;
        case 'intern':
          console.log('Redirecting to intern dashboard');
          navigate('/intern-dashboard');
          break;
        case 'mentor':
          console.log('Redirecting to mentor dashboard');
          navigate('/mentor-dashboard');
          break;
        default:
          console.log('Redirecting to home');
          navigate('/');
      }

    } catch (err) {
      setError(err.message || 'An error occurred during login');
      setIsLoading(false);
    }
  };
   

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Pane - Image with Enhanced Overlay */}
        <div className="lg:w-3/5 relative hidden lg:block">
          <img 
            src={loginImg} 
            alt="Login Illustration" 
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-purple-900/70"></div>
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }}></div>
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            {/* Top Branding */}
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-md w-14 h-14 rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                <img 
                  src="/icon.png" 
                  alt="Logo" 
                  className="w-20 h-15 rounded-full shadow-lg"
                />
              </div>
              <div className="ml-4">
                <span className="text-2xl font-bold text-white tracking-tight">Tasklytic </span>
                <p className="text-blue-200 text-sm font-medium">by Ayush Ojha</p>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="max-w-lg">
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Welcome Back to Your 
                <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"> Productivity Hub</span>
              </h2>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Access your personalized dashboard, manage tasks efficiently, and collaborate seamlessly with role-based permissions designed for modern teams.
              </p>
              
              {/* Features List */}
              <div className="space-y-3">
                <div className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm">Role-based access control</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span className="text-sm">Advanced task management</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  <span className="text-sm">Secure collaboration platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Enhanced Form */}
        <div className="lg:w-2/5 py-8 lg:py-12 px-6 sm:px-8 lg:px-12 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50/50">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-2">
            <div className=" w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                 <img
                        src="/icon.png"
                        alt="Logo"
                        className="w-15 h-15 border-2 shadow-2xl border-blue-400 rounded-full mr-2"
                    />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Tasklytic</h2>
            <p className="text-sm text-gray-600">by Ayush Ojha</p>
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              Welcome Back
            </h1>
           
          </div>

          {/* Login Form */}
          <div onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-red-600 text-sm text-center p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            {/* Email Field */}
            <div className="relative group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300 shadow-sm"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="relative group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-12 py-3.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white hover:border-gray-300 shadow-sm"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2">
              <div className="flex items-center mb-3 sm:mb-0">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 font-medium">
                  Remember me
                </label>
              </div>
              <a
              onClick={() => toast.info("Contact your admin for this , You don't have direct rights for this .", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              })}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
            >
              Forgot password?
            </a>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 text-sm font-semibold rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing you in...
                </span>
              ) : (
                <span className="flex items-center justify-center text-white">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                 Login to Dashboard
                </span>
              )}
            </button>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              By signing in, you agree to our 
              <a href="#" className="text-blue-600 font-medium hover:text-blue-700 transition-colors"> Privacy Policy </a> 
                 and 
              <a href="#" className="text-blue-600 font-medium hover:text-blue-700 transition-colors"> Terms of Service</a>
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                © 2025 Tasklytic • Developed by Ayush Ojha
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;