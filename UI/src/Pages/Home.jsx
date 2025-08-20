import React from 'react';

function Home() {
   
    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex flex-col items-center justify-center  ">
            <div className="w-full  bg-white/90 shadow-2xl  p-10 border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/Logo.png"
                        alt="Logo"
                        className="w-20 h-20 rounded-full shadow-lg mb-4 border-4 border-blue-200"
                    />
                    <h1 className="text-5xl font-extrabold text-blue-700 mb-2 tracking-tight">Tasklytic</h1>
                    <p className="text-lg text-gray-500 text-center max-w-xl mb-2">
                        A professional task management solution built with modern web technologies
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                        Developed by Ayush Ojha | Full Stack Developer
                    </p>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-purple-700 mb-3">About This Project</h2>
                    <p className="text-gray-700 mb-4">
                        As a full stack developer, I've crafted this comprehensive task management platform to demonstrate modern web development practices and deliver a seamless user experience. This project showcases my expertise across the entire development stack.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-tr from-blue-100 via-white to-blue-50 rounded-xl p-6 shadow-md">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Frontend Excellence</h3>
                            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                <li>React.js with modern hooks and state management</li>
                                <li>Responsive design with Tailwind CSS</li>
                                <li>Interactive UI components and animations</li>
                                <li>Cross-browser compatibility</li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-tr from-purple-100 via-white to-purple-50 rounded-xl p-6 shadow-md">
                            <h3 className="text-lg font-semibold text-purple-800 mb-2">Backend Architecture</h3>
                            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                <li>RESTful API design with Node.js & Express</li>
                                <li>Database integration (MongoDB/PostgreSQL)</li>
                                <li>Authentication & authorization systems</li>
                                <li>Role-based access control system</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-purple-700 mb-3">Developer Profile</h2>
                    <div className="flex flex-col md:flex-row items-center bg-gradient-to-tr from-gray-50 via-white to-blue-50 rounded-xl p-6 shadow-md">
                        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                            <img 
                                src="\ayush.jpg" 
                                alt="Ayush Ojha" 
                                className="w-24 h-24 rounded-full border-4 border-blue-300 shadow-lg"
                            />
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            <h3 className="text-2xl font-bold text-blue-800 mb-1">Ayush Ojha</h3>
                            <p className="text-lg text-purple-600 mb-2">Full Stack Software Engineer</p>
                            <p className="text-gray-700 mb-3">
                                Passionate about creating scalable web applications using modern technologies. 
                                Specializing in PERN & MERN stack development with a focus on clean code and optimal performance.
                            </p>
                            <div className="flex justify-center md:justify-start gap-4">
                                <a href="https://linkedin.com/in/ayush-ojha" target="_blank" rel="noopener noreferrer" 
                                   className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.844-1.563 3.042 0 3.604 2.002 3.604 4.604v5.592z"/>
                                    </svg>
                                    LinkedIn
                                </a>
                                <a href="https://github.com/ayushojhabxr" target="_blank" rel="noopener noreferrer" 
                                   className="flex items-center text-gray-700 hover:text-black font-medium">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576 4.765-1.588 8.2-6.084 8.2-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    GitHub
                                </a>
                                <a href="https://www.leetcode.com/ayush__ojha" target="_blank" rel="noopener noreferrer" 
                                   className="flex items-center text-orange-600 hover:text-orange-800 font-medium">
                                    <span className="w-5 h-5 mr-2 text-sm">🧩</span>
                                    LeetCode
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-purple-700 mb-3">Platform Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                            <span className="text-3xl mb-2 block">📋</span>
                            <h3 className="font-semibold text-blue-700 mb-1">Smart Task Management</h3>
                            <p className="text-gray-600 text-sm">Intuitive task creation, assignment, and tracking with priority levels</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                            <span className="text-3xl mb-2 block">🎭</span>
                            <h3 className="font-semibold text-purple-700 mb-1">Role-Based Control</h3>
                            <p className="text-gray-600 text-sm">Advanced permission system with customizable user roles and access levels</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                            <span className="text-3xl mb-2 block">🔐</span>
                            <h3 className="font-semibold text-green-700 mb-1">Secure & Scalable</h3>
                            <p className="text-gray-600 text-sm">Enterprise-grade security with JWT authentication and role-based access</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                            <span className="text-3xl mb-2 block">📊</span>
                            <h3 className="font-semibold text-yellow-700 mb-1">Analytics Dashboard</h3>
                            <p className="text-gray-600 text-sm">Comprehensive insights and progress visualization</p>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-purple-700 mb-3">Technology Stack</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-3 text-center shadow-sm">
                            <div className="text-2xl mb-1">⚛️</div>
                            <div className="text-sm font-medium text-blue-800">React.js</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-lg p-3 text-center shadow-sm">
                            <div className="text-2xl mb-1">📦</div>
                            <div className="text-sm font-medium text-green-800">Node.js</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg p-3 text-center shadow-sm">
                            <div className="text-2xl mb-1">🍃</div>
                            <div className="text-sm font-medium text-purple-800">MongoDB</div>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 rounded-lg p-3 text-center shadow-sm">
                            <div className="text-2xl mb-1">🎨</div>
                            <div className="text-sm font-medium text-indigo-800">Tailwind</div>
                        </div>
                    </div>
                </div>

                <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-purple-700 mb-2">Get In Touch</h2>
                    <p className="text-gray-700 mb-4">
                        Interested in collaborating or learning more about this project? Let's connect!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="mailto:ayushojha.cse@gmail.com"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-blue-700 transition"
                        >
                            📧 ayushojha.cse@gmail.com
                        </a>
                        <a
                            href="https://github.com/ayushojhabxr"
                            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-900 transition"
                        >
                            🚀 View More Projects
                        </a>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        © 2025 Ayush Ojha | Built with ❤️ using React & Tailwind CSS
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;