import React, { useState, useEffect } from 'react';
import { 
  Table, Input, Button, Form, Select, 
  Tag, notification, Card, Row, Col, Typography, Spin , Space
} from 'antd';
import { 
  DownloadOutlined, PlusOutlined, SearchOutlined, 
  EditOutlined, DeleteOutlined, UserOutlined, ArrowLeftOutlined 
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

// Validation patterns
const patterns = {
  name: /^[a-zA-Z\s.'-]+$/, // Allows letters, spaces, apostrophes, hyphens, and dots
  username: /^[a-zA-Z0-9_]+$/, // Alphanumeric and underscores only
  email: /^\S+@\S+\.\S+$/, // Basic email validation
  phone: /^(\+?91)?\d{10}$/, // 10 digits with optional +91 prefix
  noEmoji: /^[^\p{Emoji}]*$/u // Prevents emojis
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/users/alluser', {
        withCredentials: true,
        Accept: "*/*",
      });
      
           // Filter out 'admin' users and sort only mentor and intern
const filtered = response.data.admins.filter(user => user.role !== 'admin');
const sortedUsers = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      notification.error({
        message: 'Failed to load users',
        description: error.response?.data?.message || 'An error occurred while fetching users'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters whenever search text or role filter changes
  useEffect(() => {
    let result = users;
    
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(user => 
        user.firstName?.toLowerCase().includes(lowerSearch) ||
        user.lastName?.toLowerCase().includes(lowerSearch) ||
        user.userName?.toLowerCase().includes(lowerSearch) ||
        user.email?.toLowerCase().includes(lowerSearch) ||
        user.phone?.includes(lowerSearch) ||
        user.role?.toLowerCase().includes(lowerSearch)
      );
    }
    
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }
    
    setFilteredUsers(result);
  }, [searchText, filterRole, users]);

  // Handle create user form submission
  const handleCreateUser = async (values) => {
    try {
      await axios.post('http://localhost:5000/api/users/register', values, {
        withCredentials: true
      });
      
      // Show success notification
      notification.success({
        message: 'User Created Successfully',
        description: `${values.firstName} ${values.lastName} has been added to the system.`,
        placement: 'topRight'
      });
      
      // Refresh user list and return to table view
      fetchUsers();
      form.resetFields();
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating user:', error);
      notification.error({
        message: 'Failed to create user',
        description: error.response?.data?.message || 'An error occurred while creating user',
        placement: 'topRight'
      });
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
      "First Name": user.firstName,
      "Last Name": user.lastName,
      "Username": user.userName,
      "Email": user.email,
      "Phone": user.phone,
      "Address": user.address,
      "Role": user.role,
      "Created At": new Date(user.createdAt).toLocaleString()
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "Users_Export.xlsx");
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
            <UserOutlined className="text-indigo-600" />
          </div>
          <div>
            <div className="font-medium text-gray-800">{record.firstName} {record.lastName}</div>
            <div className="text-gray-500 text-xs">{record.email}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Username',
      dataIndex: 'userName',
      key: 'userName',
      render: (username) => <span className="font-medium text-gray-700">{username}</span>
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => <span className="text-gray-600">{phone}</span>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: role => (
        <Tag 
          color={
            role === 'admin' ? 'purple' : 
            role === 'mentor' ? 'blue' : 'green'
          }
          className="rounded-full px-3 py-1 font-medium"
        >
          {role.toUpperCase()}
        </Tag>
      ),
      filters: [
      
        { text: 'Mentor', value: 'mentor' },
        { text: 'Intern', value: 'intern' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => (
        <div className="text-gray-500">
          {new Date(date).toLocaleDateString()}
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
   
  ];

  // Main table view
  const tableView = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <Title level={2} className="m-0 text-gray-800">User Management</Title>
            <Text type="secondary" className="text-gray-600">
              Manage mentors, interns, and administrators
            </Text>
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size="large"
            className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 border-0 shadow-md"
            onClick={() => setIsCreating(true)}
          >
            Create User
          </Button>
        </div>
        
        {/* Filters Card */}
        <Card 
          className="rounded-xl shadow-sm mb-6 border border-gray-100"
          bodyStyle={{ padding: '16px' }}
        >
          <div className="flex flex-row gap-4 items-center">
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-full md:w-64 rounded-lg"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
            
            <div className="flex gap-3">
              <Select 
                value={filterRole}
                className="w-40"
                onChange={value => setFilterRole(value)}
                size="large"
              >
                <Option value="all">All Roles</Option>
                
                <Option value="mentor">Mentor</Option>
                <Option value="intern">Intern</Option>
              </Select>
              
              <Button 
                type="default" 
                icon={<DownloadOutlined />} 
                onClick={exportToExcel}
                className="flex items-center border-gray-300 hover:border-indigo-500"
                size="large"
              >
                Export Excel
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Users Table Card */}
        <Card 
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <Spin spinning={loading}>
            <Table 
              columns={columns} 
              dataSource={filteredUsers} 
              rowKey="_id"
              pagination={{ 
                pageSize: 5,
                showSizeChanger: false,
                hideOnSinglePage: true,
                className: 'px-4 py-3'
              }}
              scroll={{ x: 'max-content' }}
              className="rounded-lg"
            />
          </Spin>
        </Card>
      </div>
    </div>
  );

  // Create user form view
  const createFormView = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-indigo-50">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined className="text-indigo-600" />} 
            className="mb-4 text-indigo-600 hover:bg-indigo-100"
            onClick={() => {
              setIsCreating(false);
              form.resetFields();
            }}
          >
            Back to User List
          </Button>
          
          <Title level={2} className="mt-2 text-gray-800">Create New User</Title>
          <Text type="secondary" className="text-gray-600">
            Fill in the details below to create a new user account
          </Text>
        </div>
        
        <div className="p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateUser}
            initialValues={{ role: 'intern' }}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    { required: true, message: 'First name is required' },
                    { min: 2, message: 'First name must be at least 2 characters' },
                    { max: 50, message: 'First name must be 50 characters or less' },
                    { 
                      pattern: patterns.name, 
                      message: 'Only letters, spaces, hyphens, and apostrophes allowed'
                    },
                    { 
                      pattern: patterns.noEmoji, 
                      message: 'Emojis are not allowed in names' 
                    }
                  ]}
                  validateFirst
                >
                  <Input 
                    placeholder="First Name" 
                    size="large" 
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    { required: true, message: 'Last name is required' },
                    { min: 2, message: 'Last name must be at least 2 characters' },
                    { max: 50, message: 'Last name must be 50 characters or less' },
                    { 
                      pattern: patterns.name, 
                      message: 'Only letters, spaces, hyphens, and apostrophes allowed'
                    },
                    { 
                      pattern: patterns.noEmoji, 
                      message: 'Emojis are not allowed in names' 
                    }
                  ]}
                  validateFirst
                >
                  <Input 
                    placeholder="Last Name" 
                    size="large" 
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Username"
                  name="userName"
                  rules={[
                    { required: true, message: 'Username is required' },
                    { min: 3, message: 'Username must be at least 3 characters' },
                    { max: 30, message: 'Username must be 30 characters or less' },
                    { 
                      pattern: patterns.username, 
                      message: 'Only letters, numbers, and underscores allowed'
                    },
                    { 
                      pattern: patterns.noEmoji, 
                      message: 'Emojis are not allowed' 
                    }
                  ]}
                  validateFirst
                >
                  <Input 
                    placeholder="Username" 
                    size="large" 
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { 
                      pattern: patterns.email, 
                      message: 'Please enter a valid email address' 
                    }
                  ]}
                >
                  <Input 
                    placeholder="Email" 
                    size="large" 
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>
          
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Phone"
                  name="phone"
                  rules={[
                    { required: true, message: 'Phone number is required' },
                    { 
                      pattern: patterns.phone, 
                      message: 'Must be 10 digits (optionally prefixed with +91)' 
                    }
                  ]}
                >
                  <Input 
                    placeholder="Phone" 
                    size="large" 
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Role"
                  name="role"
                  rules={[
                    { required: true, message: 'Role is required' }
                  ]}
                >
                  <Select size="large" className="rounded-lg">
                    <Option value="admin">Admin</Option>
                    <Option value="mentor">Mentor</Option>
                    <Option value="intern">Intern</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              label="Address"
              name="address"
              rules={[
                { required: true, message: 'Address is required' },
                { min: 5, message: 'Address must be at least 5 characters' },
                { max: 255, message: 'Address must be 255 characters or less' },
                { 
                  pattern: patterns.noEmoji, 
                  message: 'Emojis are not allowed' 
                }
              ]}
              validateFirst
            >
              <Input.TextArea 
                placeholder="Address" 
                rows={3} 
                size="large" 
                className="rounded-lg"
                showCount
                maxLength={255}
              />
            </Form.Item>
            
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
              validateFirst
            >
              <Input.Password 
                placeholder="Password" 
                size="large" 
                className="rounded-lg"
              />
            </Form.Item>
            
            <div className="flex justify-end gap-3 mt-8">
              <Button 
                size="large"
                onClick={() => {
                  setIsCreating(false);
                  form.resetFields();
                }}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                className="bg-indigo-600 hover:bg-indigo-700 border-0 rounded-lg shadow-md"
              >
                Create User
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );

  return isCreating ? createFormView() : tableView();
};

export default Users;