import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Tag, Input, DatePicker, Select, Modal, Form,
  Card, Row, Col, Typography, Spin, message, Divider,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, FilterOutlined, SyncOutlined,
  UserOutlined, CalendarOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@ant-design/pro-layout';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const Insights = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm] = Form.useForm();
  const navigate = useNavigate();

  // Filters state
  const [filters, setFilters] = useState({
    searchText: '',
    status: 'all',
    feedbackStatus: 'all',
    assignedTo: 'all',
    createdBy: 'all',
    dateRange: null
  });

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/alluser', {
        withCredentials: true
      });
      const allUsers = response.data.admins;
      setUsers(allUsers);
      
      // Filter mentors and interns
      const mentorUsers = allUsers.filter(user => user.role === 'mentor');
      const internUsers = allUsers.filter(user => user.role === 'intern');
      
      setMentors(mentorUsers);
      setInterns(internUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  // Fetch all tasks
  const fetchAllTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks/alltasks', {
        withCredentials: true
      });
      
      // Sort by latest created first
      const sortedTasks = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setTasks(sortedTasks);
      setFilteredTasks(sortedTasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllTasks();
  }, []);

  // Apply filters whenever filters state or tasks change
  useEffect(() => {
    let result = [...tasks];
    
    // Search filter
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search)
      );
    }
    
    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(task => 
        task.assignedTo.some(assignment => assignment.status === filters.status)
      );
    }
    
    // Feedback status filter
    if (filters.feedbackStatus !== 'all') {
      result = result.filter(task => 
        task.assignedTo.some(assignment => assignment.feedbackStatus === filters.feedbackStatus)
      );
    }
    
    // Assigned to filter
    if (filters.assignedTo !== 'all') {
      result = result.filter(task => 
        task.assignedTo.some(assignment => assignment.internId._id === filters.assignedTo)
      );
    }
    
    // Created by filter
    if (filters.createdBy !== 'all') {
      result = result.filter(task => task.createdBy === filters.createdBy);
    }
    
    // Date range filter
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      result = result.filter(task => 
        moment(task.createdAt).isBetween(start, end, null, '[]')
      );
    }
    
    setFilteredTasks(result);
  }, [filters, tasks]);

  // Status tag rendering
  const renderStatusTag = (status) => {
    let color = '';
    switch (status) {
      case 'Pending': color = 'orange'; break;
      case 'In Progress': color = 'blue'; break;
      case 'Submitted': color = 'purple'; break;
      case 'completed': color = 'green'; break;
      case 'Overdue': color = 'red'; break;
      default: color = 'gray';
    }
    return <Tag color={color}>{status}</Tag>;
  };

  // Feedback tag rendering
  const renderFeedbackTag = (feedback) => {
    let color = '';
    switch (feedback) {
      case 'pending': color = 'orange'; break;
      case 'in-review': color = 'blue'; break;
      case 'completed': color = 'green'; break;
      case 'rejected': color = 'red'; break;
      default: color = 'gray';
    }
    return <Tag color={color}>{feedback}</Tag>;
  };

  // Handle create task
  const handleCreateTask = () => {
    setShowCreateForm(true);
    createForm.resetFields();
  };

  // Handle save new task
  const handleSaveCreate = async () => {
  try {
    const values = await createForm.validateFields();
    
    const taskData = {
      title: values.title,
      description: values.description,
     
     deadline: values.deadline.toISOString(),
      createdBy: values.createdBy,
      internIds: values.assignedInterns.map(internId => ({
        internId,
       startDate: values.startDate.toISOString() 
       
       
      }))
    };
    console.log("Task Data" , taskData)
    
    await axios.post(
      'http://localhost:5000/api/tasks/create',
      taskData,
      { withCredentials: true }
    );
    
    message.success('Task created successfully!');
    setShowCreateForm(false);
    fetchAllTasks();
  } catch (error) {
    console.error('Error creating task:', error);
    message.error('Failed to create task');
  }
};
  // Table columns
  const columns = [
    {
      title: 'Task Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assignedTo) => (
        <div>
          {assignedTo.map((assignment, index) => {
            const intern = users.find(u => u._id === assignment.internId._id);
            return (
              <Tag key={index} icon={<UserOutlined />}>
                {intern ? `${intern.firstName} ${intern.lastName}` : 'Unknown'}
              </Tag>
            );
          })}
        </div>
      )
    },
    {
  title: 'Status',
  dataIndex: 'assignedTo',
  key: 'status',
  render: (assignedTo) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {assignedTo.map((assignment, index) => (
        <div key={index}>{renderStatusTag(assignment.status)}</div>
      ))}
    </div>
  )
},

    {
      title: 'Feedback Status',
      dataIndex: 'assignedTo',
      key: 'feedbackStatus',
      render: (assignedTo) => (
        <div>
          {assignedTo.map((assignment, index) => (
            <div key={index}>{renderFeedbackTag(assignment.feedbackStatus)}</div>
          ))}
        </div>
      )
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => (
        <div>
          <CalendarOutlined className="mr-1" />
          {moment(date).format('DD MMM YYYY')}
        </div>
      ),
      sorter: (a, b) => new Date(a.deadline) - new Date(b.deadline)
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdById) => {
        const creator = users.find(u => u._id === createdById);
        return creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown';
      }
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD MMM YYYY HH:mm'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend'
    },
   
  ];

  // Create Task Form
 // In your Insights component's create task form section
if (showCreateForm) {
  return (
    <div className="p-4">
      <PageHeader
        className="site-page-header"
        title="Create New Task"
        onBack={() => setShowCreateForm(false)}
        extra={[
          <Button key="cancel" onClick={() => setShowCreateForm(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => createForm.submit()}
          >
            Create Task
          </Button>
        ]}
      />
      
      <Divider />
      
      <Form
        form={createForm}
        layout="vertical"
        onFinish={handleSaveCreate}
        className="p-4"
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item 
              name="title" 
              label="Task Title" 
              rules={[{ required: true, message: 'Please enter task title' }]}
            >
              <Input placeholder="Enter task title" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="createdBy" 
              label="Created By (Mentor)" 
              rules={[{ required: true, message: 'Please select a mentor' }]}
            >
              <Select 
                size="large"
                placeholder="Select mentor"
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {mentors.map(mentor => (
                  <Option key={mentor._id} value={mentor._id}>
                    {mentor.firstName} {mentor.lastName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* NEW: Start Date and Deadline Fields */}
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item 
              name="startDate" 
              label="Start Date" 
              rules={[{ required: true, message: 'Please select start date' }]}
            >
              <DatePicker 
                className="w-full" 
                size="large"
                
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="deadline" 
              label="Deadline" 
              rules={[{ 
                required: true, 
                message: 'Please select deadline',
                validator: (_, value) => {
                  const startDate = createForm.getFieldValue('startDate');
                  if (startDate && value && value.isBefore(startDate)) {
                    return Promise.reject('Deadline must be after start date');
                  }
                  return Promise.resolve();
                }
              }]}
            >
              <DatePicker 
                className="w-full" 
                size="large"
                
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          name="assignedInterns" 
          label="Assign To Interns" 
          rules={[{ required: true, message: 'Please select at least one intern' }]}
        >
          <Select 
            mode="multiple" 
            size="large" 
            placeholder="Select interns"
            optionFilterProp="children"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {interns.map(intern => (
              <Option key={intern._id} value={intern._id}>
                {intern.firstName} {intern.lastName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          name="description" 
          label="Description" 
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={6} placeholder="Enter detailed task description" />
        </Form.Item>
      </Form>
    </div>
  );
}

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={2} className="text-gray-800">Admin Insights Dashboard</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreateTask}
          size="large"
        >
          Create Task
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search tasks..."
              value={filters.searchText}
              onChange={e => setFilters({ ...filters, searchText: e.target.value })}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} md={16}>
            <Space wrap>
              <Select 
                value={filters.status} 
                onChange={v => setFilters({ ...filters, status: v })}
                placeholder="Status"
                size="large"
                style={{ width: 150 }}
              >
                <Option value="all">All Status</Option>
                <Option value="Assigned">Assigned</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Submitted">Submitted</Option>
                <Option value="completed">Completed</Option>
              </Select>
              
              <Select 
                value={filters.feedbackStatus} 
                onChange={v => setFilters({ ...filters, feedbackStatus: v })}
                placeholder="Feedback"
                size="large"
                style={{ width: 150 }}
              >
                <Option value="all">All Feedback</Option>
                <Option value="pending">Pending</Option>
                <Option value="in-review">In Review</Option>
                <Option value="completed">Completed</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
              
              <Select 
                value={filters.assignedTo} 
                onChange={v => setFilters({ ...filters, assignedTo: v })}
                placeholder="Assigned To"
                size="large"
                style={{ width: 180 }}
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">All Interns</Option>
                {interns.map(intern => (
                  <Option key={intern._id} value={intern._id}>
                    {intern.firstName} {intern.lastName}
                  </Option>
                ))}
              </Select>
              
              <Select 
                value={filters.createdBy} 
                onChange={v => setFilters({ ...filters, createdBy: v })}
                placeholder="Created By"
                size="large"
                style={{ width: 180 }}
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">All Mentors</Option>
                {mentors.map(mentor => (
                  <Option key={mentor._id} value={mentor._id}>
                    {mentor.firstName} {mentor.lastName}
                  </Option>
                ))}
              </Select>
              
              <RangePicker 
                onChange={dates => setFilters({ ...filters, dateRange: dates })} 
                placeholder={['Start Date', 'End Date']}
                size="large"
              />
              
              <Button 
                icon={<SyncOutlined />} 
                onClick={() => setFilters({
                  searchText: '',
                  status: 'all',
                  feedbackStatus: 'all',
                  assignedTo: 'all',
                  createdBy: 'all',
                  dateRange: null
                })}
                size="large"
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tasks Table */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="_id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1500 }}
        />
      </Spin>
    </div>
  );
};

export default Insights;