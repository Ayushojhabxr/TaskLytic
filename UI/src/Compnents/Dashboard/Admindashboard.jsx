
import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar,
  FiUser,
  FiBarChart2,
  FiActivity,
  FiTarget,
  FiUserCheck,
  FiUserX,
  FiPlus,
  FiRefreshCw ,
  FiAlertTriangle
} from 'react-icons/fi';

// Custom Chart Components
function PieChart({ data, colors, size = 120 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center w-full h-full text-gray-400">No data</div>;
  
  let cumulative = 0;
  const radius = size / 3;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((slice, i) => {
          const startAngle = (cumulative / total) * 2 * Math.PI;
          cumulative += slice.value;
          const endAngle = (cumulative / total) * 2 * Math.PI;
          const x1 = cx + radius * Math.sin(startAngle);
          const y1 = cy - radius * Math.cos(startAngle);
          const x2 = cx + radius * Math.sin(endAngle);
          const y2 = cy - radius * Math.cos(endAngle);
          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
          
          const pathData = `
            M ${cx} ${cy}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
            Z
          `;
          
          return (
            <path
              key={i}
              d={pathData}
              fill={colors[i % colors.length]}
              stroke="#fff"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-700">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, color = '#3B82F6', height = 100 }) {
  const max = Math.max(...data.map(d => d.value));
  if (max === 0) return <div className="flex items-center justify-center w-full h-full text-gray-400">No data</div>;
  
  return (
    <div className="w-full h-full flex items-end justify-between px-2 pb-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 mx-1">
          <div
            className="w-full rounded-t transition-all duration-300 hover:opacity-80"
            style={{
              height: `${(d.value / max) * (height - 20)}px`,
              backgroundColor: color,
              minHeight: d.value > 0 ? '8px' : '0px'
            }}
          />
          <div className="text-xs text-gray-600 mt-1 text-center">{d.label}</div>
          <div className="text-xs font-semibold text-gray-700">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    users: [],
    tasks: [],
    stats: {
      totalUsers: 0,
      totalInterns: 0,
      totalMentors: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      tasksInProgress: 0
    },
    recentActivities: [],
    taskStatusDistribution: [],
    monthlyTaskData: [],
    userGrowthData: []
  });

  // Fetch all data
  const fetchDashboardData = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setRefreshing(true);
    setLoading(!showRefreshLoader);
    
    try {
      // Fetch users
      const usersResponse = await fetch('http://localhost:5000/api/users/alluser', {
        credentials: 'include'
      });
      const usersData = await usersResponse.json();
      
      // Fetch tasks
      const tasksResponse = await fetch('http://localhost:5000/api/tasks/alltasks', {
        credentials: 'include'
      });
      const tasksData = await tasksResponse.json();

      const users = usersData.admins || [];
      const tasks = tasksData || [];

      // Calculate statistics
      const stats = calculateStats(users, tasks);
      const activities = generateRecentActivities(users, tasks);
      const taskDistribution = calculateTaskStatusDistribution(tasks);
      const monthlyData = calculateMonthlyTaskData(tasks);
      const userGrowth = calculateUserGrowthData(users);

      setData({
        users,
        tasks,
        stats,
        recentActivities: activities,
        taskStatusDistribution: taskDistribution,
        monthlyTaskData: monthlyData,
        userGrowthData: userGrowth
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Show error state or notification
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate comprehensive statistics
const calculateStats = (users, tasks) => {
  const totalUsers = users.length;
  const totalInterns = users.filter(u => u.role === 'intern').length;
  const totalMentors = users.filter(u => u.role === 'mentor').length;
  const totalTasks = tasks.length;

  let completedTasks = 0;
  let pendingTasks = 0;
  let tasksInProgress = 0;
  let overdueTasks = 0;

  const now = new Date();

  tasks.forEach(task => {
    const deadline = new Date(task.deadline);

    task.assignedTo?.forEach(assignment => {
      const status = (assignment.status || "").toLowerCase().trim();

      if (['completed', 'submitted'].includes(status)) {
        // Treat submitted as completed
        completedTasks++;
      } 
      else if (status === 'in progress' || status === 'in_progress') {
        tasksInProgress++;
        if (deadline < now) overdueTasks++;
      } 
      else if (['pending', 'assigned'].includes(status)) {
        pendingTasks++;
        if (deadline < now) overdueTasks++;
      }
      else if (status === 'overdue') {
        overdueTasks++;
      }
    });
  });

  return {
    totalUsers,
    totalInterns,
    totalMentors,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    tasksInProgress
  };
};



  // Generate recent activities
  const generateRecentActivities = (users, tasks) => {
    const activities = [];
    
    // Add task-based activities
    tasks.slice(0, 3).forEach(task => {
      const creator = users.find(u => u._id === task.createdBy);
      if (creator) {
        activities.push({
          user: `${creator.firstName} ${creator.lastName}`,
          action: `created task "${task.title}"`,
          time: formatTimeAgo(task.createdAt),
          type: 'task_created',
          avatar: creator.firstName[0] + creator.lastName[0]
        });
      }

      task.assignedTo?.forEach(assignment => {
        const intern = users.find(u => u._id === assignment.internId?._id);
        if (intern && assignment.status === 'completed') {
          activities.push({
            user: `${intern.firstName} ${intern.lastName}`,
            action: `completed task "${task.title}"`,
            time: formatTimeAgo(assignment.updatedAt || task.createdAt),
            type: 'task_completed',
            avatar: intern.firstName[0] + intern.lastName[0]
          });
        }
      });
    });

    // Add user registration activities
    users.slice(0, 3).forEach(user => {
      if (user.role !== 'admin') {
        activities.push({
          user: `${user.firstName} ${user.lastName}`,
          action: `registered as ${user.role}`,
          time: formatTimeAgo(user.createdAt),
          type: 'user_registered',
          avatar: user.firstName[0] + user.lastName[0]
        });
      }
    });

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
  };

  // Calculate task status distribution
const calculateTaskStatusDistribution = (tasks) => {
  const distribution = {
    completed: 0,
    in_progress: 0,
    pending: 0,
    overdue: 0
  };

  const now = new Date();

  tasks.forEach(task => {
    const deadline = new Date(task.deadline);

    task.assignedTo?.forEach(assignment => {
      const status = (assignment.status || "").toLowerCase().trim();

      if (status === 'completed') {
        distribution.completed++;
      } else if (status === 'in progress' || status === 'in_progress') {
        distribution.in_progress++;
      } else if (status === 'pending' || status === 'assigned') {
        if (deadline < now) {
          distribution.overdue++;
        } else {
          distribution.pending++;
        }
      }
    });
  });

  return [
    { label: 'Completed', value: distribution.completed },
    { label: 'In Progress', value: distribution.in_progress },
    { label: 'Pending', value: distribution.pending },
    { label: 'Overdue', value: distribution.overdue }
  ];
};


  // Calculate monthly task data
  const calculateMonthlyTaskData = (tasks) => {
    const monthCounts = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en', { month: 'short' });
      monthCounts[monthKey] = 0;
    }

    tasks.forEach(task => {
      const taskDate = new Date(task.createdAt);
      const monthKey = taskDate.toLocaleDateString('en', { month: 'short' });
      if (monthCounts.hasOwnProperty(monthKey)) {
        monthCounts[monthKey]++;
      }
    });

    return Object.entries(monthCounts).map(([label, value]) => ({ label, value }));
  };

  // Calculate user growth data
  const calculateUserGrowthData = (users) => {
    const monthCounts = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en', { month: 'short' });
      monthCounts[monthKey] = 0;
    }

    users.forEach(user => {
      if (user.role !== 'admin') {
        const userDate = new Date(user.createdAt);
        const monthKey = userDate.toLocaleDateString('en', { month: 'short' });
        if (monthCounts.hasOwnProperty(monthKey)) {
          monthCounts[monthKey]++;
        }
      }
    });

    return Object.entries(monthCounts).map(([label, value]) => ({ label, value }));
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: data.stats.totalUsers,
      icon: FiUsers,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      change: "+12%",
      changeType: "positive"
    },
    {
      label: "Total Interns",
      value: data.stats.totalInterns,
      icon: FiUser,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      change: "+8%",
      changeType: "positive"
    },
    {
      label: "Total Mentors",
      value: data.stats.totalMentors,
      icon: FiUserCheck,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      change: "+3%",
      changeType: "positive"
    },
    {
      label: "Completed Tasks",
      value: data.stats.completedTasks,
      icon: FiCheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      change: "+15%",
      changeType: "positive"
    },
    {
      label: "Overdue Tasks",
      value: data.stats.overdueTasks,
      icon: FiAlertTriangle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      change: "+5%",
      changeType: "negative"
    },
    {
      label: "Pending Tasks",
      value: data.stats.pendingTasks,
      icon: FiTarget,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      change: "+5%",
      changeType: "neutral"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Intern Task Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchDashboardData(true)}
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
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {/* Task Status Distribution */}
       

          {/* Monthly Tasks */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiTrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Tasks Created</h2>
            </div>
            <div className="h-40">
              <BarChart 
                data={data.monthlyTaskData} 
                color="#8b5cf6" 
                height={140}
              />
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FiUsers className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">User Growth</h2>
            </div>
            <div className="h-40">
              <BarChart 
                data={data.userGrowthData} 
                color="#10b981" 
                height={140}
              />
            </div>
          </div>


 {/* Quick Navigation Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiTarget className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* View Users Button */}
            <button
              onClick={() => window.location.href = "/users"}
              className="group flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
                <FiUsers className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-semibold block">Users</span>
                <span className="text-sm opacity-75">Manage users</span>
              </div>
            </button>

            {/* View Insights Button */}
            <button
              onClick={() => window.location.href = "/insights"}
              className="group flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="p-2 bg-green-200 rounded-lg group-hover:bg-green-300 transition-colors">
                <FiBarChart2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-semibold block">Insights</span>
                <span className="text-sm opacity-75">View analytics</span>
              </div>
            </button>

         

            
          </div>
        </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiActivity className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
          </div>
          
          <div className="space-y-4">
            {data.recentActivities.length > 0 ? (
              data.recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {activity.avatar}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.type === 'task_completed' ? 'bg-green-100 text-green-700' :
                    activity.type === 'task_created' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {activity.type.replace('_', ' ')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiActivity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activities found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}