// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend, AreaChart, Area
// } from 'recharts';
// import axios from 'axios';
// import moment from 'moment';
// import { useNavigate } from 'react-router-dom';

// const DynamicMentorDashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [mentorId, setMentorId] = useState('');
//   const [mentorProfile, setMentorProfile] = useState(null);
//   const [tasks, setTasks] = useState([]);
//   const [interns, setInterns] = useState([]);
//   const [reports, setReports] = useState([]);
//   const [showAllTasks, setShowAllTasks] = useState(false);
//   const [showAllMentees, setShowAllMentees] = useState(false);
//   const [selectedView, setSelectedView] = useState('dashboard');
//   const navigate = useNavigate();

//   // Fetch mentor profile using cookies
//   const fetchMentorProfile = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/api/users/myprofile', {
//         withCredentials: true
//       });
//       setMentorProfile(res.data.user);
//       setMentorId(res.data.user._id);
//     } catch (error) {
//       console.error('Error fetching mentor profile:', error);
//       if (error.response?.status === 401) {
//         navigate('/login');
//       }
//     }
//   };

//   // Fetch all interns
//   const fetchInterns = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/api/users/alluser', {
//         withCredentials: true
//       });
//       const allUsers = res.data.admins;
//       const internUsers = allUsers.filter(user => user.role === 'intern');
//       setInterns(internUsers);
//     } catch (err) {
//       console.error("Error fetching interns:", err);
//     }
//   };

//   // Fetch tasks for mentor
//   const fetchTasks = async () => {
//     if (!mentorId) return;
//     try {
//       const res = await axios.get(`http://localhost:5000/api/tasks/mentor/${mentorId}`, {
//         withCredentials: true
//       });
      
//       // Enrich tasks with intern data
//       const enrichedTasks = res.data.map(task => ({
//         ...task,
//         assignedTo: task.assignedTo?.map(assignment => {
//           const intern = interns.find(i => 
//             i._id === (assignment.internId._id || assignment.internId)
//           );
//           return {
//             ...assignment,
//             internId: intern || assignment.internId
//           };
//         }) || []
//       }));
      
//       setTasks(enrichedTasks);
//     } catch (err) {
//       console.error("Error fetching tasks:", err);
//     }
//   };

//   // Fetch reports
//   const fetchReports = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/posts/get', {
//         withCredentials: true
//       });
//       setReports(response.data);
//     } catch (error) {
//       console.error('Error fetching reports:', error);
//     }
//   };

//   useEffect(() => {
//     const initializeData = async () => {
//       setLoading(true);
//       await fetchMentorProfile();
//       await fetchInterns();
//       setLoading(false);
//     };
//     initializeData();
//   }, []);

//   useEffect(() => {
//     if (mentorId && interns.length > 0) {
//       fetchTasks();
//       fetchReports();
//     }
//   }, [mentorId, interns]);

//   // Calculate dynamic stats from real data
//   const statsData = useMemo(() => {
//     if (!tasks.length) return [];

//     const allAssignments = tasks.flatMap(task => 
//       task.assignedTo?.map(assignment => ({
//         ...assignment,
//         taskId: task._id,
//         taskTitle: task.title,
//         taskDeadline: task.deadline
//       })) || []
//     );

//     const uniqueMentees = new Set(allAssignments.map(a => a.internId?._id || a.internId)).size;
//     const completedTasks = allAssignments.filter(a => 
//       a.status === 'completed' || a.feedbackStatus === 'completed'
//     ).length;
//     const pendingReviews = allAssignments.filter(a => 
//       a.status === 'Submitted' && a.feedbackStatus !== 'completed'
//     ).length;
    
//     // Calculate average rating from actual feedback
//     const ratingsWithValues = allAssignments.filter(a => a.rating && a.rating > 0);
//     const avgRating = ratingsWithValues.length > 0 
//       ? (ratingsWithValues.reduce((sum, a) => sum + a.rating, 0) / ratingsWithValues.length).toFixed(1)
//       : '0.0';

//     return [
//       { 
//         title: 'Active Mentees', 
//         value: uniqueMentees, 
//         change: uniqueMentees > 0 ? `+${uniqueMentees}` : '0', 
//         color: 'bg-gradient-to-r from-blue-500 to-blue-600',
//         icon: '👥'
//       },
//       { 
//         title: 'Tasks Reviewed', 
//         value: completedTasks, 
//         change: completedTasks > 0 ? `+${completedTasks}` : '0', 
//         color: 'bg-gradient-to-r from-green-500 to-green-600',
//         icon: '✅'
//       },
//       { 
//         title: 'Pending Reviews', 
//         value: pendingReviews, 
//         change: pendingReviews > 0 ? `${pendingReviews}` : '0', 
//         color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
//         icon: '⏳'
//       },
//       { 
//         title: 'Avg. Rating', 
//         value: avgRating > 0 ? `${avgRating}/5` : 'N/A', 
//         change: avgRating > 0 ? `${avgRating}★` : 'No ratings', 
//         color: 'bg-gradient-to-r from-purple-500 to-purple-600',
//         icon: '⭐'
//       },
//     ];
//   }, [tasks]);

//   // Calculate mentee progress data from real assignments
//   const menteeProgressData = useMemo(() => {
//     if (!tasks.length || !interns.length) return [];

//     const menteeStats = {};
    
//     tasks.forEach(task => {
//       task.assignedTo?.forEach(assignment => {
//         const internId = assignment.internId?._id || assignment.internId;
//         const intern = interns.find(i => i._id === internId);
        
//         if (intern && !menteeStats[internId]) {
//           menteeStats[internId] = {
//             name: `${intern.firstName} ${intern.lastName}`,
//             email: intern.email,
//             tasks: 0,
//             completed: 0,
//             progress: 0,
//             lastActivity: null
//           };
//         }
        
//         if (menteeStats[internId]) {
//           menteeStats[internId].tasks++;
//           if (assignment.status === 'completed' || assignment.feedbackStatus === 'completed') {
//             menteeStats[internId].completed++;
//           }
//           // Track last activity
//           if (assignment.submissionDate) {
//             const activityDate = new Date(assignment.submissionDate);
//             if (!menteeStats[internId].lastActivity || activityDate > menteeStats[internId].lastActivity) {
//               menteeStats[internId].lastActivity = activityDate;
//             }
//           }
//         }
//       });
//     });

//     return Object.values(menteeStats)
//       .map(mentee => ({
//         ...mentee,
//         progress: mentee.tasks > 0 ? Math.round((mentee.completed / mentee.tasks) * 100) : 0
//       }))
//       .sort((a, b) => b.progress - a.progress);
//   }, [tasks, interns]);

//   // Calculate task distribution from real data
//   const taskDistributionData = useMemo(() => {
//     if (!tasks.length) return [];

//     const allAssignments = tasks.flatMap(task => task.assignedTo || []);
//     const statusCounts = {
//       'Completed': allAssignments.filter(a => 
//         a.status === 'completed' || a.feedbackStatus === 'completed'
//       ).length,
//       'Pending Review': allAssignments.filter(a => 
//         a.status === 'Submitted' && a.feedbackStatus !== 'completed'
//       ).length,
//       'In Progress': allAssignments.filter(a => 
//         a.status === 'In Progress' || a.status === 'Assigned'
//       ).length,
//       'Needs Revision': allAssignments.filter(a => 
//         a.feedbackStatus === 'Rework'
//       ).length,
//     };

//     return Object.entries(statusCounts)
//       .filter(([name, value]) => value > 0)
//       .map(([name, value]) => ({ name, value }));
//   }, [tasks]);

//   // Get tasks that need review (real data only)
//   const reviewTasks = useMemo(() => {
//     const pendingTasks = tasks.flatMap(task => 
//       task.assignedTo?.filter(assignment => 
//         assignment.status === 'Submitted' && assignment.feedbackStatus !== 'completed'
//       ).map(assignment => {
//         const intern = interns.find(i => i._id === (assignment.internId?._id || assignment.internId));
//         return {
//           id: `${task._id}_${assignment.internId?._id || assignment.internId}`,
//           taskId: task._id,
//           mentee: intern ? `${intern.firstName} ${intern.lastName}` : 'Unknown',
//           menteeEmail: intern?.email || '',
//           task: task.title,
//           description: task.description,
//           submitted: assignment.submissionDate ? 
//             moment(assignment.submissionDate).fromNow() : 
//             moment(task.createdAt).fromNow(),
//           deadline: task.deadline,
//           priority: moment().isAfter(moment(task.deadline)) ? 'high' : 'medium',
//           attachments: assignment.attachments || [],
//           comment: assignment.comment || ''
//         };
//       }) || []
//     );
//     return pendingTasks.sort((a, b) => new Date(b.submitted) - new Date(a.submitted));
//   }, [tasks, interns]);

//   // Get recent feedback (real data only)
//   const recentFeedback = useMemo(() => {
//     const feedbackData = [];
    
//     tasks.forEach(task => {
//       task.assignedTo?.forEach(assignment => {
//         if (assignment.rating && assignment.comment && assignment.feedbackDate) {
//           const intern = interns.find(i => i._id === (assignment.internId?._id || assignment.internId));
//           feedbackData.push({
//             id: `${task._id}_${assignment.internId?._id || assignment.internId}`,
//             mentee: intern ? `${intern.firstName} ${intern.lastName}` : 'Unknown',
//             task: task.title,
//             rating: assignment.rating,
//             comment: assignment.comment,
//             date: assignment.feedbackDate
//           });
//         }
//       });
//     });

//     return feedbackData
//       .sort((a, b) => new Date(b.date) - new Date(a.date))
//       .slice(0, 5);
//   }, [tasks, interns]);

//   // Get reports related to this mentor
//   const mentorReports = useMemo(() => {
//     return {
//       received: reports.filter(r => r.user?._id === mentorId),
//       submitted: reports.filter(r => r.reportedBy?._id === mentorId)
//     };
//   }, [reports, mentorId]);

//   const COLORS = ['#10B981', '#FBBF24', '#EF4444', '#8B5CF6', '#06B6D4'];

//   // Click handlers
//   const handleViewAllTasks = () => {
//     setSelectedView('tasks');
//     setShowAllTasks(true);
//   };

//   const handleViewAllMentees = () => {
//     setSelectedView('mentees');
//     setShowAllMentees(true);
//   };

//   const handleViewReports = () => {
//     setSelectedView('reports');
//   };

//   const handleViewTaskDetails = (taskId) => {
//     // Navigate to task details or open modal
//     console.log('View task details:', taskId);
//   };

//   const handleScheduleMeeting = () => {
//     // Navigate to calendar or open scheduling modal
//     console.log('Schedule meeting');
//   };

//   // Priority badge component
//   const PriorityBadge = ({ priority }) => {
//     const priorityStyles = {
//       high: 'bg-red-100 text-red-800 border-red-200',
//       medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       low: 'bg-green-100 text-green-800 border-green-200'
//     };
    
//     return (
//       <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityStyles[priority]}`}>
//         {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="relative">
//             <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
//             </div>
//           </div>
//           <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
//           <p className="text-sm text-gray-500">Fetching latest data</p>
//         </div>
//       </div>
//     );
//   }

//   if (selectedView === 'tasks') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//          <h1 className="text-2xl font-bold text-center text-gray-800">All Tasks</h1>
//         <div className=" mx-auto">
//           <div className="flex items-center mb-6">
//             <button 
//               onClick={() => setSelectedView('dashboard')}
//               className="mr-4 p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
//               </svg>
//             </button>
           
//           </div>
          
//           <div className="grid gap-4">
//             {reviewTasks.map(task => ( 
//               <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800">{task.task}</h3>
//                     <p className="text-gray-600 mt-1">{task.description}</p>
//                     <p className="text-sm text-gray-500 mt-2">Submitted by {task.mentee} • {task.submitted}</p>
//                   </div>
//                   <PriorityBadge priority={task.priority} />
//                 </div>
                
//                 {task.comment && (
//                   <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                     <p className="text-sm text-gray-700">{task.comment}</p>
//                   </div>
//                 )}
                
//                 {task.attachments.length > 0 && (
//                   <div className="mb-4">
//                     <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
//                     <div className="flex flex-wrap gap-2">
//                       {task.attachments.map((url, index) => (
//                         <a 
//                           key={index} 
//                           href={url} 
//                           target="_blank" 
//                           rel="noopener noreferrer"
//                           className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors"
//                         >
//                           Attachment {index + 1}
//                         </a>
//                       ))}
//                     </div>
//                   </div>
//                 )}
                
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-500">
//                     Deadline: {moment(task.deadline).format('MMM DD, YYYY')}
//                   </span>
//                   <button 
//                     onClick={() => handleViewTaskDetails(task.taskId)}
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//                   >
//                     Review Task
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (selectedView === 'mentees') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//         <h1 className="text-2xl font-bold text-center text-gray-800">All Mentees</h1>
//         <div className=" mx-auto">
//           <div className="flex items-center  gap-3 mb-6">
//             <button 
//               onClick={() => setSelectedView('dashboard')}
//               className="mr-4 p-2  rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
//               </svg>
//             </button>
            
//           </div>
          
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {menteeProgressData.map((mentee, index) => (
//               <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
//                 <div className="flex items-center mb-4">
//                   <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
//                     {mentee.name.split(' ').map(n => n[0]).join('')}
//                   </div>
//                   <div className="ml-4">
//                     <h3 className="font-semibold text-gray-800">{mentee.name}</h3>
//                     <p className="text-sm text-gray-600">{mentee.email}</p>
//                   </div>
//                 </div>
                
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Tasks Assigned</span>
//                     <span className="font-medium">{mentee.tasks}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Completed</span>
//                     <span className="font-medium">{mentee.completed}</span>
//                   </div>
//                   <div>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-gray-600">Progress</span>
//                       <span className="font-medium">{mentee.progress}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
//                         style={{ width: `${mentee.progress}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                   {mentee.lastActivity && (
//                     <p className="text-xs text-gray-500">
//                       Last activity: {moment(mentee.lastActivity).fromNow()}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (selectedView === 'reports') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//         <h1 className="text-2xl font-bold text-center text-gray-800">Reports</h1>
//         <div className=" mx-auto gap-3">
//           <div className="flex items-center justify-between mb-6">
//             <button 
//               onClick={() => setSelectedView('dashboard')}
//               className="mr-4 p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
//               </svg>
//             </button>

//             <button onClick={() => navigate('/intern-forum')}  className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
//               Create New Report
//             </button>
            
//           </div>
          
//           <div className="grid lg:grid-cols-2 gap-6">
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">Reports Received ({mentorReports.received.length})</h2>
//               <div className="space-y-4">
//                 {mentorReports.received.length > 0 ? mentorReports.received.map(report => (
//                   <div key={report._id} className="border border-gray-200 rounded-lg p-4">
//                     <h3 className="font-medium text-gray-800">{report.title}</h3>
//                     <p className="text-sm text-gray-600 mt-1">{report.description}</p>
//                     <p className="text-xs text-gray-500 mt-2">
//                       From: {report.reportedBy?.firstName} {report.reportedBy?.lastName} • 
//                       {moment(report.createdAt).format('MMM DD, YYYY')}
//                     </p>
//                   </div>
//                 )) : (
//                   <p className="text-gray-500 text-center py-8">No reports received</p>
//                 )}
//               </div>
//             </div>
            
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">Reports Submitted ({mentorReports.submitted.length})</h2>
//               <div className="space-y-4">
//                 {mentorReports.submitted.length > 0 ? mentorReports.submitted.map(report => (
//                   <div key={report._id} className="border border-gray-200 rounded-lg p-4">
//                     <h3 className="font-medium text-gray-800">{report.title}</h3>
//                     <p className="text-sm text-gray-600 mt-1">{report.description}</p>
//                     <p className="text-xs text-gray-500 mt-2">
//                       To: {report.user?.firstName} {report.user?.lastName} • 
//                       {moment(report.createdAt).format('MMM DD, YYYY')}
//                     </p>
//                   </div>
//                 )) : (
//                   <p className="text-gray-500 text-center py-8">No reports submitted</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//       <div className=" mx-auto">
//         {/* Dashboard Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
//               Welcome back, {mentorProfile?.firstName}! 👋
//             </h1>
//             <p className="text-gray-600 text-lg">Here's your mentoring overview for today</p>
//           </div>
//           <div className="mt-4 md:mt-0 flex items-center space-x-4">
//             <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
//               <span className="text-gray-600 text-sm">Today: </span>
//               <span className="font-semibold text-gray-800">{moment().format('MMMM DD, YYYY')}</span>
//             </div>
//             <button 
//               onClick={handleScheduleMeeting}
//               className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
//             >
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//               Schedule Meeting
//             </button>
//           </div>
//         </div>
        
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {statsData.map((stat, index) => (
//             <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">{stat.title}</p>
//                   <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
//                 </div>
//                 <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
//                   <span className="text-2xl">{stat.icon}</span>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <span className="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded-lg">
//                   {stat.change}
//                 </span>
//                 <span className="text-gray-500 text-sm ml-2">this period</span>
//               </div>
//             </div>
//           ))}
//         </div>
        
//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Mentee Progress Chart */}
//           <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-xl font-bold text-gray-800">Mentee Progress</h3>
//               <button 
//                 onClick={handleViewAllMentees}
//                 className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
//               >
//                 View All →
//               </button>
//             </div>
//             <div className="h-80">
//               {menteeProgressData.length > 0 ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={menteeProgressData.slice(0, 5)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
//                     <XAxis dataKey="name" tick={{ fontSize: 12 }} />
//                     <YAxis tick={{ fontSize: 12 }} />
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: 'white',
//                         borderRadius: '12px',
//                         border: '1px solid #e5e7eb',
//                         boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
//                       }}
//                     />
//                     <Bar dataKey="progress" name="Progress %" fill="url(#progressGradient)" radius={[6, 6, 0, 0]} />
//                     <defs>
//                       <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="0%" stopColor="#6366F1" />
//                         <stop offset="100%" stopColor="#8B5CF6" />
//                       </linearGradient>
//                     </defs>
//                   </BarChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex items-center justify-center h-full text-gray-500">
//                   <div className="text-center">
//                     <div className="text-6xl mb-4">📊</div>
//                     <p className="text-lg font-medium">No mentee data available</p>
//                     <p className="text-sm">Start assigning tasks to see progress</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {/* Task Distribution Chart */}
//           <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-xl font-bold text-gray-800">Task Distribution</h3>
             
//             </div>
//             <div className="h-80">
//               {taskDistributionData.length > 0 ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={taskDistributionData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={100}
//                       paddingAngle={5}
//                       dataKey="value"
//                     >
//                       {taskDistributionData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: 'white',
//                         borderRadius: '12px',
//                         border: '1px solid #e5e7eb',
//                         boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
//                       }}
//                     />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex items-center justify-center h-full text-gray-500">
//                   <div className="text-center">
//                     <div className="text-6xl mb-4">📋</div>
//                     <p className="text-lg font-medium">No task data available</p>
//                     <p className="text-sm">Create tasks to see distribution</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
        
//         {/* Main Content Area */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Tasks and Performance */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Tasks to Review */}
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-xl font-bold text-gray-800">Tasks Pending Review</h3>
             
//               </div>
              
//               <div className="space-y-4">
//                 {reviewTasks.length > 0 ? reviewTasks.slice(0, 3).map(task => (
//                   <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
//                     <div className="flex items-center">
//                       <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl mr-4">
//                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                       </div>
//                       <div>
//                         <h4 className="font-semibold text-gray-800">{task.task}</h4>
//                         <p className="text-sm text-gray-600">Submitted by {task.mentee}</p>
//                         <p className="text-xs text-gray-500">{task.submitted}</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <PriorityBadge priority={task.priority} />
//                       <button 
//                         onClick={() => handleViewTaskDetails(task.taskId)}
//                         className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
//                       >
//                         Review
//                       </button>
//                     </div>
//                   </div>
//                 )) : (
//                   <div className="text-center py-12 text-gray-500">
//                     <div className="text-6xl mb-4">✅</div>
//                     <p className="text-lg font-medium">All caught up!</p>
//                     <p className="text-sm">No tasks pending for review</p>
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             {/* Recent Feedback */}
//             {recentFeedback.length > 0 && (
//               <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Feedback Given</h3>
                
//                 <div className="space-y-4">
//                   {recentFeedback.map(item => (
//                     <div key={item.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
//                       <div className="flex justify-between items-start mb-3">
//                         <div>
//                           <h4 className="font-semibold text-gray-800">{item.task}</h4>
//                           <p className="text-sm text-gray-600">To {item.mentee}</p>
//                         </div>
//                         <div className="flex items-center">
//                           {[...Array(5)].map((_, i) => (
//                             <svg
//                               key={i}
//                               className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
//                               fill="currentColor"
//                               viewBox="0 0 20 20"
//                             >
//                               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                             </svg>
//                           ))}
//                         </div>
//                       </div>
//                       <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3">
//                         "{item.comment}"
//                       </p>
//                       <div className="flex justify-between items-center">
//                         <span className="text-xs text-gray-500">{moment(item.date).format('MMM DD, YYYY')}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* Right Column - Reports and Quick Actions */}
//           <div className="space-y-8">
//             {/* Reports Summary */}
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-xl font-bold text-gray-800">Reports</h3>
//                 <button 
//                   onClick={handleViewReports}
//                   className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
//                 >
//                   View All →
//                 </button>
//               </div>
              
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
//                   <div className="flex items-center">
//                     <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
//                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0L9 7v4" />
//                       </svg>
//                     </div>
//                     <span className="font-medium text-blue-800">Reports Received</span>
//                   </div>
//                   <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
//                     {mentorReports.received.length}
//                   </span>
//                 </div>
                
//                 <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
//                   <div className="flex items-center">
//                     <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
//                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                       </svg>
//                     </div>
//                     <span className="font-medium text-green-800">Reports Submitted</span>
//                   </div>
//                   <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
//                     {mentorReports.submitted.length}
//                   </span>
//                 </div>
//               </div>
//             </div>
            
     
//           </div>
//         </div>
//       </div>
//              {/* Quick Actions */}
//             <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//               <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
              
//               <div className="space-y-3">
//                 <button 
//                   onClick={() => navigate('/mentor-tasks')}
//                   className="w-full p-4 text-left bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 transition-colors"
//                 >
//                   <div className="flex items-center">
//                     <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
//                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                       </svg>
//                     </div>
//                     <div>
//                       <p className="font-medium text-indigo-800">Review Tasks</p>
//                       <p className="text-sm text-indigo-600">{reviewTasks.length} pending</p>
//                     </div>
//                   </div>
//                 </button>
                
//                 <button 
//                   onClick={() => navigate('/mentor-tasks')}
//                   className="w-full p-4 text-left bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-colors"
//                 >
//                   <div className="flex items-center">
//                     <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
//                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                       </svg>
//                     </div>
//                     <div>
//                       <p className="font-medium text-green-800">View Mentees</p>
//                       <p className="text-sm text-green-600">{menteeProgressData.length} active</p>
//                     </div>
//                   </div>
//                 </button>
                
              
//               </div>
//             </div>
//     </div>
//   );
// };

// export default DynamicMentorDashboard;


import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  FiUsers, FiCheckCircle, FiClock, FiStar, FiArrowLeft, 
  FiCalendar, FiFileText, FiTrendingUp, FiMail, FiSend,
  FiBarChart, FiPieChart, FiActivity, FiUser , FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const DynamicMentorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [mentorId, setMentorId] = useState('');
  const [mentorProfile, setMentorProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedView, setSelectedView] = useState('dashboard');
  const navigate = useNavigate();
  const  t = localStorage.getItem("token");
    console.log("Token from localStorage: ", t);
    if(!t){
    navigate('/'); // Redirect to login if token is not present

    }
  // Fetch mentor profile using cookies
  const fetchMentorProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/myprofile', {
        withCredentials: true
      });
      setMentorProfile(res.data.user);
      setMentorId(res.data.user._id);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  // Fetch all interns
  const fetchInterns = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/alluser', {
        withCredentials: true
      });
      const allUsers = res.data.admins;
      const internUsers = allUsers.filter(user => user.role === 'intern');
      setInterns(internUsers);
    } catch (err) {
      console.error("Error fetching interns:", err);
    }
  };

  // Fetch tasks for mentor
  const fetchTasks = async () => {
    if (!mentorId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/mentor/${mentorId}`, {
        withCredentials: true
      });
      
      // Enrich tasks with intern data
      const enrichedTasks = res.data.map(task => ({
        ...task,
        assignedTo: task.assignedTo?.map(assignment => {
          const intern = interns.find(i => 
            i._id === (assignment.internId._id || assignment.internId)
          );
          return {
            ...assignment,
            internId: intern || assignment.internId
          };
        }) || []
      }));
      
      setTasks(enrichedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts/get', {
        withCredentials: true
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchMentorProfile();
      await fetchInterns();
      setLoading(false);
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (mentorId && interns.length > 0) {
      fetchTasks();
      fetchReports();
    }
  }, [mentorId, interns]);

  // Calculate dynamic stats from real data
  const statsData = useMemo(() => {
    if (!tasks.length) return [];

    const allAssignments = tasks.flatMap(task => 
      task.assignedTo?.map(assignment => ({
        ...assignment,
        taskId: task._id,
        taskTitle: task.title,
        taskDeadline: task.deadline
      })) || []
    );

    const uniqueMentees = new Set(allAssignments.map(a => a.internId?._id || a.internId)).size;
    const completedTasks = allAssignments.filter(a => 
      a.status === 'completed' || a.feedbackStatus === 'completed'
    ).length;
    const pendingReviews = allAssignments.filter(a => 
      a.status === 'Submitted' && a.feedbackStatus !== 'completed'
    ).length;
    
    // Calculate average rating from actual feedback
    const ratingsWithValues = allAssignments.filter(a => a.rating && a.rating > 0);
    const avgRating = ratingsWithValues.length > 0 
      ? (ratingsWithValues.reduce((sum, a) => sum + a.rating, 0) / ratingsWithValues.length).toFixed(1)
      : '0.0';

    return [
      { 
        title: 'Active Mentees', 
        value: uniqueMentees, 
        change: uniqueMentees > 0 ? `+${uniqueMentees}` : '0', 
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        icon: FiUsers
      },
      { 
        title: 'Tasks Reviewed', 
        value: completedTasks, 
        change: completedTasks > 0 ? `+${completedTasks}` : '0', 
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        icon: FiCheckCircle
      },
      { 
        title: 'Pending Reviews', 
        value: pendingReviews, 
        change: pendingReviews > 0 ? `${pendingReviews}` : '0', 
        color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        icon: FiClock
      },
      { 
        title: 'Avg. Rating', 
        value: avgRating > 0 ? `${avgRating}/5` : 'N/A', 
        change: avgRating > 0 ? `${avgRating}★` : 'No ratings', 
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        icon: FiStar
      },
    ];
  }, [tasks]);

  // Calculate mentee progress data from real assignments
  const menteeProgressData = useMemo(() => {
    if (!tasks.length || !interns.length) return [];

    const menteeStats = {};
    
    tasks.forEach(task => {
      task.assignedTo?.forEach(assignment => {
        const internId = assignment.internId?._id || assignment.internId;
        const intern = interns.find(i => i._id === internId);
        
        if (intern && !menteeStats[internId]) {
          menteeStats[internId] = {
            name: `${intern.firstName} ${intern.lastName}`,
            email: intern.email,
            tasks: 0,
            completed: 0,
            progress: 0,
            lastActivity: null
          };
        }
        
        if (menteeStats[internId]) {
          menteeStats[internId].tasks++;
          if (assignment.status === 'completed' || assignment.feedbackStatus === 'completed') {
            menteeStats[internId].completed++;
          }
          // Track last activity
          if (assignment.submissionDate) {
            const activityDate = new Date(assignment.submissionDate);
            if (!menteeStats[internId].lastActivity || activityDate > menteeStats[internId].lastActivity) {
              menteeStats[internId].lastActivity = activityDate;
            }
          }
        }
      });
    });

    return Object.values(menteeStats)
      .map(mentee => ({
        ...mentee,
        progress: mentee.tasks > 0 ? Math.round((mentee.completed / mentee.tasks) * 100) : 0
      }))
      .sort((a, b) => b.progress - a.progress);
  }, [tasks, interns]);

  // Calculate task distribution from real data
  const taskDistributionData = useMemo(() => {
    if (!tasks.length) return [];

    const allAssignments = tasks.flatMap(task => task.assignedTo || []);
    const statusCounts = {
      'Completed': allAssignments.filter(a => 
        a.status === 'completed' || a.feedbackStatus === 'completed'
      ).length,
      'Pending Review': allAssignments.filter(a => 
        a.status === 'Submitted' && a.feedbackStatus !== 'completed'
      ).length,
      'In Progress': allAssignments.filter(a => 
        a.status === 'In Progress' || a.status === 'Assigned'
      ).length,
      'Needs Revision': allAssignments.filter(a => 
        a.feedbackStatus === 'Rework'
      ).length,
    };

    return Object.entries(statusCounts)
      .filter(([name, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // Get tasks that need review (real data only)
  const reviewTasks = useMemo(() => {
    const pendingTasks = tasks.flatMap(task => 
      task.assignedTo?.filter(assignment => 
        assignment.status === 'Submitted' && assignment.feedbackStatus !== 'completed'
      ).map(assignment => {
        const intern = interns.find(i => i._id === (assignment.internId?._id || assignment.internId));
        return {
          id: `${task._id}_${assignment.internId?._id || assignment.internId}`,
          taskId: task._id,
          mentee: intern ? `${intern.firstName} ${intern.lastName}` : 'Unknown',
          menteeEmail: intern?.email || '',
          task: task.title,
          description: task.description,
          submitted: assignment.submissionDate ? 
            moment(assignment.submissionDate).fromNow() : 
            moment(task.createdAt).fromNow(),
          deadline: task.deadline,
          priority: moment().isAfter(moment(task.deadline)) ? 'high' : 'medium',
          attachments: assignment.attachments || [],
          comment: assignment.comment || ''
        };
      }) || []
    );
    return pendingTasks.sort((a, b) => new Date(b.submitted) - new Date(a.submitted));
  }, [tasks, interns]);

  // Get recent feedback (real data only)
  const recentFeedback = useMemo(() => {
    const feedbackData = [];
    
    tasks.forEach(task => {
      task.assignedTo?.forEach(assignment => {
        if (assignment.rating && assignment.comment && assignment.feedbackDate) {
          const intern = interns.find(i => i._id === (assignment.internId?._id || assignment.internId));
          feedbackData.push({
            id: `${task._id}_${assignment.internId?._id || assignment.internId}`,
            mentee: intern ? `${intern.firstName} ${intern.lastName}` : 'Unknown',
            task: task.title,
            rating: assignment.rating,
            comment: assignment.comment,
            date: assignment.feedbackDate
          });
        }
      });
    });

    return feedbackData
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [tasks, interns]);

  // Get reports related to this mentor
  const mentorReports = useMemo(() => {
    return {
      received: reports.filter(r => r.user?._id === mentorId),
      submitted: reports.filter(r => r.reportedBy?._id === mentorId)
    };
  }, [reports, mentorId]);

  const COLORS = ['#10B981', '#FBBF24', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Click handlers
  const handleViewAllTasks = () => {
    setSelectedView('tasks');
  };

  const handleViewAllMentees = () => {
    setSelectedView('mentees');
  };

  const handleViewReports = () => {
    setSelectedView('reports');
  };

  const handleViewTaskDetails = (taskId) => {
    console.log('View task details:', taskId);
  };

  const handleScheduleMeeting = () => {
    console.log('Schedule meeting');
  };

  const [refreshing, setRefreshing] = useState(false);
  function refresh() {
    setRefreshing(true);
       fetchTasks(),
        fetchMentorProfile(),
        fetchReports(),
        fetchInterns()
    setRefreshing(false);


  }


  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityStyles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityStyles[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="text-sm text-gray-500">Fetching latest data</p>
        </div>
      </div>
    );
  }

  if (selectedView === 'tasks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedView('dashboard')}
              className="mr-4 p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">All Tasks</h1>
          </div>
          
          <div className="grid gap-4">
            {reviewTasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{task.task}</h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Submitted by {task.mentee} • {task.submitted}</p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
                
                {task.comment && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">{task.comment}</p>
                  </div>
                )}
                
                {task.attachments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {task.attachments.map((url, index) => (
                        <a 
                          key={index} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                        >
                          Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Deadline: {moment(task.deadline).format('MMM DD, YYYY')}
                  </span>
                  <button 
                    onClick={() => handleViewTaskDetails(task.taskId)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Review Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

    if (selectedView === 'mentees') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">All Mentees</h1>
        <div className=" mx-auto">
          <div className="flex items-center  gap-3 mb-6">
            <button 
              onClick={() => setSelectedView('dashboard')}
              className="mr-4 p-2  rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menteeProgressData.map((mentee, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {mentee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800">{mentee.name}</h3>
                    <p className="text-sm text-gray-600">{mentee.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasks Assigned</span>
                    <span className="font-medium">{mentee.tasks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium">{mentee.completed}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{mentee.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${mentee.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  {mentee.lastActivity && (
                    <p className="text-xs text-gray-500">
                      Last activity: {moment(mentee.lastActivity).fromNow()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }


    if (selectedView === 'reports') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">Reports</h1>
        <div className=" mx-auto gap-3">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setSelectedView('dashboard')}
              className="mr-4 p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button onClick={() => navigate('/intern-forum')}  className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              Create New Report
            </button>
            
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Reports Received ({mentorReports.received.length})</h2>
              <div className="space-y-4">
                {mentorReports.received.length > 0 ? mentorReports.received.map(report => (
                  <div key={report._id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      From: {report.reportedBy?.firstName} {report.reportedBy?.lastName} • 
                      {moment(report.createdAt).format('MMM DD, YYYY')}
                    </p>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8">No reports received</p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Reports Submitted ({mentorReports.submitted.length})</h2>
              <div className="space-y-4">
                {mentorReports.submitted.length > 0 ? mentorReports.submitted.map(report => (
                  <div key={report._id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      To: {report.user?.firstName} {report.user?.lastName} • 
                      {moment(report.createdAt).format('MMM DD, YYYY')}
                    </p>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8">No reports submitted</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className=" mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center">
              Welcome back, {mentorProfile?.firstName}! 
              <span className="ml-2 text-yellow-500">👋</span>
            </h1>
            <p className="text-gray-600 text-lg">Here's your mentoring overview for today</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <span className="text-gray-600 text-sm">Today: </span>
              <span className="font-semibold text-gray-800">{moment().format('MMMM DD, YYYY')}</span>
            </div>

               <div className="flex items-center gap-4">
                                      <button
                                        onClick={() => refresh()}
                                        disabled={refreshing}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                                      >
                                        <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                      </button>
                                      <div className="text-sm text-gray-500">
                                        Last updated: {new Date().toLocaleTimeString()}
                                      </div>
                                    </div>
            
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded-lg">
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">this period</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Mentee Progress Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FiBarChart className="w-6 h-6 mr-2 text-indigo-600" />
                Mentee Progress
              </h3>
              <button 
                onClick={handleViewAllMentees}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="h-80">
              {menteeProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={menteeProgressData.slice(0, 5)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="progress" name="Progress %" fill="url(#progressGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FiBarChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No mentee data available</p>
                    <p className="text-sm">Start assigning tasks to see progress</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Task Distribution Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FiPieChart className="w-6 h-6 mr-2 text-indigo-600" />
                Task Distribution
              </h3>
              
            </div>
            <div className="h-80">
              {taskDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FiPieChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No task data available</p>
                    <p className="text-sm">Create tasks to see distribution</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tasks and Performance */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tasks to Review */}
            <div className="bg-white rounded-2xl h-full shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiFileText className="w-6 h-6 mr-2 text-indigo-600" />
                  Tasks Pending for Review
                </h3>
                
              </div>
              
              <div className="space-y-4">
                {reviewTasks.length > 0 ? reviewTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl mr-4">
                        <FiFileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{task.task}</h4>
                        <p className="text-sm text-gray-600">Submitted by {task.mentee}</p>
                        <p className="text-xs text-gray-500">{task.submitted}</p>
                      </div>
                    </div>
                    <div className="text-right">
                     
                      <button 
                        onClick={() => navigate(`/mentor-tasks`)}
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-500">
                    <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-sm">No tasks pending for review</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Feedback */}
            {recentFeedback.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <FiStar className="w-6 h-6 mr-2 text-indigo-600" />
                  Recent Feedback Given
                </h3>
                
                <div className="space-y-4">
                  {recentFeedback.map(item => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{item.task}</h4>
                          <p className="text-sm text-gray-600">To {item.mentee}</p>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3">
                        "{item.comment}"
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{moment(item.date).format('MMM DD, YYYY')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Reports and Quick Actions */}
          <div className="space-y-8">
            {/* Reports Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiActivity className="w-6 h-6 mr-2 text-indigo-600" />
                  Reports
                </h3>
                <button 
                  onClick={handleViewReports}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  View All →
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <FiMail className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-blue-800">Reports Received</span>
                  </div>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {mentorReports.received.length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <FiSend className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-green-800">Reports Submitted</span>
                  </div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {mentorReports.submitted.length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiTrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/mentor-tasks')}
                  className="w-full p-4 text-left bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                      <FiFileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-indigo-800">Review Tasks</p>
                      <p className="text-sm text-indigo-600">{reviewTasks.length} pending</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => navigate('/mentor-tasks')}
                  className="w-full p-4 text-left bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">View Mentees</p>
                      <p className="text-sm text-green-600">{menteeProgressData.length} active</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicMentorDashboard;



