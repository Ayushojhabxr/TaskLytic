import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Select, 
  Input, 
  Button, 
  message, 
  Card, 
  Divider,
  Spin,
  Table,
  Tag,
  Tabs,
  Typography,
  Space
} from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const CommunityReport = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [interns, setInterns] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('mentor');
  const [mentorId, setMentorId] = useState('');
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('submit');

  useEffect(() => {
    fetchUsers();
    fetchMentorProfile();
    fetchReports();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users/alluser');
      const allUsers = response.data.admins;
      
      setUsers(allUsers);
      setMentors(allUsers.filter(user => user.role === 'mentor'));
      setAdmins(allUsers.filter(user => user.role === 'admin'));
      setInterns(allUsers.filter(user => user.role === 'intern'));
      
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/posts/get');
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch reports');
      setLoading(false);
    }
  };

  const fetchMentorProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/myprofile', {
        withCredentials: true
      });
      setMentorId(res.data.user._id);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
    }
  };

  const handleUserTypeChange = (value) => {
    setSelectedUserType(value);
    form.setFieldsValue({ recipient: undefined });
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      const reportData = {
        title: values.title,
        description: values.description,
        user: values.recipient,
        reportedBy: mentorId,
        createdAt: new Date().toISOString()
      };

      await axios.post('http://localhost:5000/api/posts/create', reportData);
      
      message.success('Report submitted successfully!');
      form.resetFields();
      fetchReports();
      setActiveTab('view');
      setLoading(false);
    } catch (error) {
      message.error('Failed to submit report');
      setLoading(false);
    }
  };

  const renderRecipientOptions = () => {
    switch (selectedUserType) {
      case 'mentor':
        return mentors.map(user => (
          <Option key={user._id} value={user._id}>
            {user.firstName} {user.lastName} ({user.userName})
          </Option>
        ));
      case 'admin':
        return admins.map(user => (
          <Option key={user._id} value={user._id}>
            {user.firstName} {user.lastName} ({user.userName})
          </Option>
        ));
      case 'intern':
        return interns.map(user => (
          <Option key={user._id} value={user._id}>
            {user.firstName} {user.lastName} ({user.userName})
          </Option>
        ));
      default:
        return null;
    }
  };

  const reportsColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong style={{color: '#1890ff'}}>{text}</Text>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text style={{color: '#666'}}>{text}</Text>
    },
    {
      title: 'Reported By',
      dataIndex: 'reportedBy',
      key: 'reportedBy',
      render: (reportedBy) => (
        <Tag color="#108ee9" style={{padding: '4px 12px', borderRadius: '16px'}}>
          {reportedBy.firstName} {reportedBy.lastName} ({reportedBy.role})
        </Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Text style={{color: '#8c8c8c', fontSize: '0.9em'}}>
          {moment(date).format('DD MMM YYYY HH:mm')}
        </Text>
      )
    }
  ];

  return (
    <Card 
      title={<Title level={3} style={{margin: 0, color: '#1890ff'}}>Community Reports</Title>}
      bordered={false}
      style={{ 
        width: '100%', 
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderRadius: '8px'
      }}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        style={{marginTop: '16px'}}
      >
        <TabPane tab="Submit Report" key="submit">
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              style={{maxWidth: '800px', margin: '0 auto', padding: '24px'}}
            >
              <Divider orientation="left" style={{color: '#1890ff', fontWeight: 'bold'}}>
                Recipient Information
              </Divider>
              
              <Form.Item
                label="Report To"
                name="recipientType"
                rules={[{ required: true, message: 'Please select recipient type' }]}
                initialValue="mentor"
              >
                <Select onChange={handleUserTypeChange} size="large">
                  <Option value="mentor">Mentor</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="intern">Intern</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={`Select ${selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)}`}
                name="recipient"
                rules={[{ required: true, message: `Please select a ${selectedUserType}` }]}
              >
                <Select
                  showSearch
                  size="large"
                  placeholder={`Select a ${selectedUserType}`}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {renderRecipientOptions()}
                </Select>
              </Form.Item>

              <Divider orientation="left" style={{color: '#1890ff', fontWeight: 'bold'}}>
                Report Details
              </Divider>
              
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Please input report title' }]}
              >
                <Input size="large" placeholder="Enter report title" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please input report description' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Describe your report in detail"
                  style={{fontSize: '14px'}}
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                  style={{
                    width: '200px',
                    height: '40px',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  Submit Report
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </TabPane>

        <TabPane tab="View Reports" key="view">
          <Spin spinning={loading}>
            <Title level={4} style={{marginBottom: 24, color: '#1890ff'}}>Reports Received</Title>
            <Table
              columns={reportsColumns}
              dataSource={reports.filter(report => report.user._id === mentorId)}
              rowKey="_id"
              pagination={{ 
                pageSize: 5,
                style: {marginTop: '24px'}
              }}
              bordered
              style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            />

            <Title level={4} style={{margin: '32px 0 24px', color: '#1890ff'}}>Reports Submitted</Title>
            <Table
              columns={reportsColumns}
              dataSource={reports.filter(report => report.reportedBy._id === mentorId)}
              rowKey="_id"
              pagination={{ 
                pageSize: 5,
                style: {marginTop: '24px'}
              }}
              bordered
              style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            />
          </Spin>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default CommunityReport;
