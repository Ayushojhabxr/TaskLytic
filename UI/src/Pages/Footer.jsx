
import React from 'react';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import { MdDashboard, MdPeople, MdSchool, MdAnalytics, MdEmail } from 'react-icons/md';
import { SiReact, SiNodedotjs, SiMongodb, SiTailwindcss } from 'react-icons/si';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-300 via-purple-700 to-indigo-900 text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center ml-2">
              <img
                src="/icon.png"
                alt="Tasklytic Logo"
                className="w-15 h-15 border-2 shadow-2xl border-blue-400 rounded-full mr-2"
              />
              <span className="text-lg font-bold text-white">
                Tasklytic
              </span>
            </div>
            <p className="text-indigo-100 mb-4">
              Professional task management solution with role-based access control for modern teams.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/in/ayush-ojha-977945253/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-200 transition">
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com/ayushojhabxr" target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-200 transition">
                <FaGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-indigo-200 transition">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-indigo-200 transition">
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-indigo-100 hover:text-white transition flex items-center">
                  <span className="mr-2">→</span> Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-indigo-100 hover:text-white transition flex items-center">
                  <span className="mr-2">→</span> Get Started
                </Link>
              </li>
             
            </ul>
          </div>
          
          {/* For Users */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Users</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-indigo-100 flex items-center">
                  <MdDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                </span>
              </li>
              <li>
                <span className="text-indigo-100 flex items-center">
                  <MdSchool className="mr-2 h-4 w-4" /> Intern Portal
                </span>
              </li>
              <li>
                <span className="text-indigo-100 flex items-center">
                  <MdPeople className="mr-2 h-4 w-4" /> Mentor Hub
                </span>
              </li>
              <li>
                <span className="text-indigo-100 flex items-center">
                  <MdAnalytics className="mr-2 h-4 w-4" /> Task Analytics
                </span>
              </li>
            </ul>
          </div>
          
          {/* Developer Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Developer</h3>
            <div className="space-y-3 gap-1">
              <div className="flex items-center">
                <img 
                  src="/ayush.jpg" 
                  alt="Ayush Ojha" 
                  className="w-8 h-8 rounded-full border-2 border-blue-300 mr-3"
                />
                <div>
                  <p className="text-white font-medium">Ayush Ojha</p>
                  <p className="text-indigo-200 text-sm">Full Stack Developer</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <MdEmail className="h-4 w-4 text-indigo-200 mr-3" />
                  <a href="mailto:ayushojha.cse@gmail.com" className="text-indigo-100 hover:text-white text-sm">
                    ayushojha.cse@gmail.com
                  </a>
                </div>
                <div className="flex items-center">
                  <FaGithub className="h-4 w-4 text-indigo-200 mr-3" />
                  <a href="https://github.com/ayushojhabxr" target="_blank" rel="noopener noreferrer" className="text-indigo-100 hover:text-white text-sm">
                    GitHub Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Technology Stack */}
        <div className="mt-8 pt-6 border-t border-indigo-500">
          <div className="text-center mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Built with Modern Technologies</h4>
            <div className="flex justify-center space-x-6 text-xs text-indigo-200">
              <span className="flex items-center">
                <SiReact className="mr-1 h-3 w-3" /> React.js
              </span>
              <span className="flex items-center">
                <SiNodedotjs className="mr-1 h-3 w-3" /> Node.js
              </span>
              <span className="flex items-center">
                <SiMongodb className="mr-1 h-3 w-3" /> MongoDB
              </span>
              <span className="flex items-center">
                <SiTailwindcss className="mr-1 h-3 w-3" /> Tailwind CSS
              </span>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-indigo-500 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-indigo-200 text-sm">
              &copy; {new Date().getFullYear()} Tasklytic by Ayush Ojha. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                onClick={() => alert("Contact admin for privacy policy details")}
                className="text-indigo-200 hover:text-white text-sm cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => alert("Contact admin for terms of service")}
                className="text-indigo-200 hover:text-white text-sm cursor-pointer"
              >
                Terms of Service
              </button>
              <span className="text-indigo-200 text-sm">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
