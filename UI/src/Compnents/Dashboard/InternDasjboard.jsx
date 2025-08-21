
import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Modal,
  Upload,
  message,
  Select,
  Spin,
} from 'antd';
import {
  UploadOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  FileDoneOutlined,
  UserOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {FiRefreshCw} from 'react-icons/fi';

const { Option } = Select;
const { TextArea } = Input;

// Priority badge component
const PriorityBadge = ({ priority }) => {
  const priorityClasses = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusClasses = {
    assigned: 'bg-blue-100 text-blue-800',
    submitted: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rework: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-800', // For feedback status
  };
  const displayStatus = status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {displayStatus}
    </span>
  );
};

const InternDashboard = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]); // All users for report recipient selection
  const [internId, setInternId] = useState('');
  const [internProfile, setInternProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);


  // Modal states
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Form instances
  const [submitForm] = Form.useForm();
  const [reportForm] = Form.useForm();
  const navigate = useNavigate();

    const  t = localStorage.getItem("token");
    console.log("Token from localStorage: ", t);
    if(!t){
    navigate('/'); // Redirect to login if token is not present

    }

  // Fetch intern profile
  const fetchInternProfile = useCallback(async () => {
    try {
      const res = await axios.get('https://tasklytic-1.onrender.com/api/users/myprofile', {
        withCredentials: true
      });
      console.log("data", res.data);
      setInternProfile(res.data.user);
      setInternId(res.data.user._id);
    } catch (error) {
      console.error('Error fetching intern profile:', error);
      message.error('Failed to fetch profile. Please log in.');
      // navigate('/login'); // If using react-router-dom
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!internId) return;
    try {
      const res = await axios.get(`https://tasklytic-1.onrender.com/api/tasks/intern/${internId}`, {
        withCredentials: true
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      message.error('Failed to fetch tasks');
    }
  }, [internId]);

  // Fetch feedbacks
  const fetchFeedbacks = useCallback(async () => {
    if (!internId) return;
    try {
      const res = await axios.get(`https://tasklytic-1.onrender.com/api/feedback/intern/${internId}`, {
        withCredentials: true,
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  }, [internId]);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      const response = await axios.get('https://tasklytic-1.onrender.com/api/posts/get', {
        withCredentials: true
      });
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  }, []);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("https://tasklytic-1.onrender.com/api/users/alluser", {
        withCredentials: true
      });
      setUsers(res.data.admins); // Assuming 'admins' array contains all user types
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchInternProfile();
      setLoading(false);
    };
    initializeData();
  }, [fetchInternProfile]);

  // Fetch dependent data once internId is available
  useEffect(() => {
    if (internId) {
      Promise.all([
        fetchTasks(),
        fetchFeedbacks(),
        fetchReports(),
        fetchUsers()
      ]);
    }
  }, [internId, fetchTasks, fetchFeedbacks, fetchReports, fetchUsers]);

  // Helper functions
  const getInternAssignment = (task) => {
    return task.assignedTo?.find(a => a.internId === internId || a.internId._id === internId);
  };

  const getRatingForTask = (taskId) => {
    const feedback = feedbacks.find(fb => fb.taskId?._id === taskId);
    return feedback?.rating;
  };

  const getFeedbackComment = (taskId) => {
    const feedback = feedbacks.find(fb => fb.taskId?._id === taskId);
    return feedback?.comment;
  };

  const isDeadlinePassed = (deadline) => {
    return moment().isAfter(moment(deadline));
  };

  // Calculate statistics for cards
  const calculateStatsData = useCallback(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => {
      const assignment = getInternAssignment(task);
      return assignment?.feedbackStatus === 'completed';
    }).length;
    const inProgressTasks = tasks.filter(task => {
      const assignment = getInternAssignment(task);
      return assignment?.status === 'Submitted' && assignment?.feedbackStatus !== 'completed' && assignment?.feedbackStatus !== 'Rework';
    }).length;
    const pendingTasks = tasks.filter(task => {
      const assignment = getInternAssignment(task);
      return assignment?.status === 'Assigned' && !isDeadlinePassed(task.deadline);
    }).length;
    const overdueTasks = tasks.filter(task => {
      const assignment = getInternAssignment(task);
      return assignment?.status === 'Assigned' && isDeadlinePassed(task.deadline);
    }).length;

    return [
      { title: 'Total Tasks', value: totalTasks, color: 'bg-blue-500', icon: <FileDoneOutlined /> },
      { title: 'Completed', value: completedTasks, color: 'bg-green-500', icon: <CheckOutlined /> },
      { title: 'In Progress', value: inProgressTasks, color: 'bg-yellow-500', icon: <ClockCircleOutlined /> },
      { title: 'Overdue', value: overdueTasks, color: 'bg-red-500', icon: <CloseOutlined /> },
    ];
  }, [tasks, getInternAssignment]);

  // Calculate data for productivity chart
  const calculateProductivityData = useCallback(() => {
    const dailyTasks = {};
    tasks.forEach(task => {
      const assignment = getInternAssignment(task);
      if (assignment?.feedbackStatus === 'completed' && assignment?.submissionDate) {
        const day = moment(assignment.submissionDate).format('ddd'); // Mon, Tue, etc.
        dailyTasks[day] = (dailyTasks[day] || 0) + 1;
      }
    });

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return daysOfWeek.map(day => ({
      day,
      tasks: dailyTasks[day] || 0
    }));
  }, [tasks, getInternAssignment]);

  // Calculate data for task distribution chart
  const calculateTaskDistributionData = useCallback(() => {
    const distribution = {
      'Completed': 0,
      'In Progress': 0,
      'Pending': 0,
      'Rework': 0,
    };

    tasks.forEach(task => {
      const assignment = getInternAssignment(task);
      if (assignment) {
        if (assignment.feedbackStatus === 'completed') {
          distribution['Completed']++;
        } else if (assignment.feedbackStatus === 'Rework') {
          distribution['Rework']++;
        } else if (assignment.status === 'Submitted') {
          distribution['In Progress']++;
        } else if (assignment.status === 'Assigned') {
          distribution['Pending']++;
        }
      }
    });

    return [
      { name: 'Completed', value: distribution['Completed'] },
      { name: 'In Progress', value: distribution['In Progress'] },
      { name: 'Pending', value: distribution['Pending'] },
      { name: 'Rework', value: distribution['Rework'] },
    ].filter(item => item.value > 0); // Only show categories with tasks
  }, [tasks, getInternAssignment]);

  // Handle task submission
  const handleSubmitTask = (task) => {
    setCurrentTask(task);
    submitForm.resetFields();
    setSubmitModalVisible(true);
  };

  const handleSubmitConfirm = async () => {
    try {
      const values = await submitForm.validateFields();
      const formData = new FormData();

      const fileList = values.attachments?.fileList || [];
      if (fileList.length > 1) {
        message.error("Only one attachment allowed.");
        return;
      }

      if (fileList.length === 1) {
        formData.append("attachment", fileList[0].originFileObj);
      }

      formData.append("comment", values.comment || '');

      await axios.patch(
        `https://tasklytic-1.onrender.com/api/tasks/${currentTask._id}/submit/${internId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      message.success("Task submitted successfully!");
      setSubmitModalVisible(false);
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error("Error submitting task:", err);
      message.error("Failed to submit task");
    }
  };

  // Handle report submission
  const handleReportSubmit = async (values) => {
    try {
      const reportData = {
        title: values.title,
        description: values.description,
        user: values.recipient,
        reportedBy: internId,
        createdAt: new Date().toISOString()
      };

      await axios.post('https://tasklytic-1.onrender.com/api/posts/create', reportData, {
        withCredentials: true
      });

      message.success('Report submitted successfully!');
      reportForm.resetFields();
      setReportModalVisible(false);
      fetchReports(); // Refresh the reports list
    } catch (error) {
      message.error('Failed to submit report');
    }
  };



  function refresh() {
    setRefreshing(true);
       fetchTasks(),
        fetchFeedbacks(),
        fetchReports(),
        fetchUsers()
    setRefreshing(false);


  }







  // Render action button for tasks
  const renderActionButton = (task) => {
    const assignment = getInternAssignment(task);
    const deadlinePassed = isDeadlinePassed(task.deadline);

    if (!assignment) return null; // No assignment found for this intern

    if (deadlinePassed && assignment.status !== 'Submitted') {
      return (
        <button
          className="px-3 py-1 text-sm font-medium rounded-lg bg-red-500 text-white opacity-70 cursor-not-allowed flex items-center"
          disabled
        >
          <CloseOutlined className="mr-1" /> Deadline Passed
        </button>
      );
    }

    if (assignment.status === 'Submitted') {
      if (assignment.feedbackStatus === 'Rework') {
        return (
          <button
            className="px-3 py-1 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center"
            onClick={() => handleSubmitTask(task)}
          >
            <FileDoneOutlined className="mr-1" /> Resubmit
          </button>
        );
      } else if (assignment.feedbackStatus === 'completed') {
        return (
          <button
            className="px-3 py-1 text-sm font-medium rounded-lg bg-green-500 text-white opacity-70 cursor-not-allowed flex items-center"
            disabled
          >
            <CheckOutlined className="mr-1" /> Approved
          </button>
        );
      }
      return (
        <button
          className="px-3 py-1 text-sm font-medium rounded-lg bg-gray-400 text-white opacity-70 cursor-not-allowed flex items-center"
          disabled
        >
          <ClockCircleOutlined className="mr-1" /> Submitted
        </button>
      );
    }

    if (assignment.status === 'Assigned') {
      return (
        <button
          className="px-3 py-1 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center"
          onClick={() => handleSubmitTask(task)}
        >
          <FileDoneOutlined className="mr-1" /> Submit Task
        </button>
      );
    }

    return null;
  };

  const statsData = calculateStatsData();
  const productivityData = calculateProductivityData();
  const taskDistributionData = calculateTaskDistributionData();
  const PIE_COLORS = ['#10B981', '#3B82F6', '#EF4444', '#FBBF24']; // Green, Blue, Red, Yellow

  const sortedTasks = [...tasks].sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
  const recentTasks = sortedTasks.slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Loading Dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className=" mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Intern Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {internProfile?.firstName || 'Intern'}! Here's your task overview</p>
          </div>
          <div className=" flex gap-2 mt-4 md:mt-0">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-gray-600">Today: </span>
              <span className="font-medium text-gray-800">{moment().format('MMMM DD, YYYY')}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                  <div className="bg-white bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center">
                    {React.cloneElement(stat.icon, { className: `${stat.color.replace('bg-', 'text-')} w-5 h-5` })}
                  </div>
                </div>
              </div>
              {/* Placeholder for change from last week, can be made dynamic if data is available */}
              <p className="text-gray-500 text-sm font-medium mt-3">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  N/A from last week
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Charts and Task List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Productivity Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Productivity (Completed Tasks)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productivityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Distribution Chart */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-0">Recent Tasks</h3>
            <div className="flex space-x-2">
            
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="py-3 px-4 font-medium">Task</th>

                  <th className="py-3 px-4 font-medium">Due Date</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Feedback</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTasks.length > 0 ? (
                  recentTasks.map(task => {
                    const assignment = getInternAssignment(task);
                    const feedbackRating = getRatingForTask(task._id);
                    const feedbackComment = getFeedbackComment(task._id);

                    return (
                      <React.Fragment key={task._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-800">{task.title}</span>
                              {/* Add the "New" tag here */}
                              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">New</span>
                            </div>
                          </td>
                          
                         
                          <td className="py-4 px-4">
                            <span className="text-gray-600">{moment(task.deadline).format('MMM DD, YYYY')}</span>
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={assignment?.status?.toLowerCase() || 'assigned'} />
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={assignment?.feedbackStatus?.toLowerCase() || 'pending'} />
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              {renderActionButton(task)}
                            </div>
                          </td>
                        </tr>
                        {/* Expanded details row (simplified for this example, can be a separate modal or component) */}
                   
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No recent tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination (can be enhanced) */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-gray-600 text-sm">Showing {recentTasks.length} most recent tasks</p>
            {/* <div className="flex space-x-2">
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">
                Previous
              </button>
              <button className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                Next
              </button>
            </div> */}
          </div>
        </div>

        {/* Upcoming Deadlines & Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {tasks.filter(t => {
                const assignment = getInternAssignment(t);
                return assignment?.feedbackStatus !== 'completed' && !isDeadlinePassed(t.deadline);
              }).sort((a, b) => moment(a.deadline).diff(moment(b.deadline)))
                .slice(0, 3).map(task => (
                  <div key={task._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-indigo-50">
                    <div>
                      <h4 className="font-medium text-gray-800">{task.title}</h4>
                      <p className="text-sm text-gray-600">{task.project || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Due: {moment(task.deadline).format('MMM DD, YYYY')}</p>
                      <PriorityBadge priority={task.priority || 'low'} />
                    </div>
                  </div>
                ))}
              {tasks.filter(t => {
                const assignment = getInternAssignment(t);
                return assignment?.feedbackStatus !== 'completed' && !isDeadlinePassed(t.deadline);
              }).length === 0 && (
                  <p className="text-gray-500 text-center">No upcoming deadlines.</p>
                )}
            </div>
            {/* <button className="mt-4 text-indigo-600 hover:text-indigo-800 flex items-center text-sm">
              View all deadlines
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button> */}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity (Reports)</h3>
            <div className="space-y-4">
              {reports.filter(report => report.reportedBy?._id === internId || report.user?._id === internId)
                .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)))
                .slice(0, 3).map(activity => (
                  <div key={activity._id} className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-800">
                        {activity.reportedBy?._id === internId ? 'You submitted' : 'You received'} a report:
                        <span className="font-medium ml-1">{activity.title}</span>
                      </p>
                      <p className="text-gray-500 text-sm">{moment(activity.createdAt).fromNow()}</p>
                    </div>
                  </div>
                ))}
              {reports.filter(report => report.reportedBy?._id === internId || report.user?._id === internId).length === 0 && (
                <p className="text-gray-500 text-center">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Submission Modal */}
      <Modal
        title={`Submit Task: ${currentTask?.title || ''}`}
        open={submitModalVisible}
        onOk={handleSubmitConfirm}
        onCancel={() => setSubmitModalVisible(false)}
        okText="Submit"
        cancelText="Cancel"
        width={600}
      >
        <Form form={submitForm} layout="vertical">
          <Form.Item
            name="attachments"
            label="Attachments"
            rules={[{ required: true, message: 'Please add at least one attachment' }]}
          >
            <Upload
              multiple={false}
              accept='.docx,.doc,.pdf'
              beforeUpload={(file) => {
                const allowedTypes = [
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/pdf'
                ];
                if (!allowedTypes.includes(file.type)) {
                  message.error(`${file.name} is not a valid file. Only .doc, .docx, or .pdf allowed.`);
                  return Upload.LIST_IGNORE;
                }
                return false; // Prevent default upload behavior
              }}
            >
              <button className="ant-btn ant-btn-default flex items-center">
                <UploadOutlined className="mr-2" /> Select File
              </button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="comment"
            label="Comments"
            rules={[{ required: true, message: 'Please enter your comments' }]}
          >
            <TextArea rows={4} placeholder="Describe your submission..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Report Submission Modal */}
      <Modal
        title="Submit Report"
        open={reportModalVisible}
        onOk={() => reportForm.submit()}
        onCancel={() => setReportModalVisible(false)}
        okText="Submit Report"
        cancelText="Cancel"
        width={600}
      >
        <Form form={reportForm} layout="vertical" onFinish={handleReportSubmit}>
          <Form.Item
            label="Report To"
            name="recipientType"
            rules={[{ required: true, message: 'Please select recipient type' }]}
            initialValue="mentor"
          >
            <Select>
              <Option value="mentor">Mentor</Option>
              <Option value="admin">Admin</Option>
              <Option value="intern">Intern</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Select Recipient"
            name="recipient"
            rules={[{ required: true, message: 'Please select a recipient' }]}
          >
            <Select
              showSearch
              placeholder="Select a user"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {users.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.role})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input report title' }]}
          >
            <Input placeholder="Enter report title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input report description' }]}
          >
            <TextArea rows={4} placeholder="Describe your report in detail" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InternDashboard;

