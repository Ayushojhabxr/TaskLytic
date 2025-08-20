import React, { useState, useEffect } from 'react';
import {
  Table, Input, Button, Select, Tag, DatePicker, Card, Row, Col,
  Typography, Spin, Space, Popconfirm, Modal, Form, message, Collapse, Rate, 
  Divider, Descriptions , 
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import {
  SearchOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, CalendarOutlined, UserOutlined, 
  SyncOutlined, ArrowLeftOutlined, InfoCircleOutlined, MessageOutlined , DisconnectOutlined ,CloseOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Panel } = Collapse;

const MentorTaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interns, setInterns] = useState([]);
  const [mentorId, setMentorId] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [feedbackForm] = Form.useForm();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    searchText: '',
    status: 'all',
    feedbackStatus: 'all',
    dateRange: null,
    intern: 'all'
  });

  // Fetch mentor profile using cookies
  const fetchMentorProfile = React.useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/myprofile', {
        withCredentials: true
      });
      setMentorId(res.data.user._id);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  }, [navigate]);

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

  const fetchTasks = React.useCallback(async () => {
    if (!mentorId || interns.length === 0) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/mentor/${mentorId}`, {
        withCredentials: true
      });

      const enrichedTasks = res.data.map(task => ({
        ...task,
        assignedTo: task.assignedTo.map(assignment => {
          const intern = interns.find(i =>
            i._id === (assignment.internId._id || assignment.internId)
          );
          return {
            ...assignment,
            internId: intern || assignment.internId
          };
        })
      }));

      const sortedTasks = enrichedTasks.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTasks(sortedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
    setLoading(false);
  }, [mentorId, interns]);

  useEffect(() => {
    fetchMentorProfile();
    fetchInterns();
  }, [fetchMentorProfile]);

  useEffect(() => {
    if (mentorId && interns.length > 0) {
      fetchTasks();
    }
  }, [mentorId, interns, fetchTasks]);

  // Flatten tasks into individual assignments
  const assignments = React.useMemo(() => {
    return tasks.flatMap(task => 
      task.assignedTo.map(assignment => ({
        ...assignment,
        taskId: task._id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskDeadline: task.deadline,
        taskCreatedAt: task.createdAt,
        key: `${task._id}_${assignment.internId._id}`
      }))
    );
  }, [tasks]);

  useEffect(() => {
    let result = [...assignments];

    if (filters.searchText) {
      const s = filters.searchText.toLowerCase();
      result = result.filter(a => 
        a.taskTitle.toLowerCase().includes(s) || 
        a.taskDescription.toLowerCase().includes(s)
      );
    }

    if (filters.status !== 'all') {
      result = result.filter(a => a.status === filters.status);
    }

    if (filters.feedbackStatus !== 'all') {
      result = result.filter(a => a.feedbackStatus === filters.feedbackStatus);
    }

    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const start = filters.dateRange[0].startOf('day');
      const end = filters.dateRange[1].endOf('day');
      result = result.filter(a => {
        const deadline = moment(a.taskDeadline);
        return deadline.isBetween(start, end, null, '[]');
      });
    }

    if (filters.intern !== 'all') {
      result = result.filter(a => a.internId._id === filters.intern);
    }

    setFilteredAssignments(result);
  }, [filters, assignments]);

  const renderStatusTag = (status) => {
    let color = {
      "Assigned": "blue",
      "In Progress": "orange",
      "completed": "green",
      "Overdue": "red",
      "Submitted": "purple"
    }[status] || "default";
    return <Tag color={color} className="m-1">{status}</Tag>;
  };

  const renderFeedbackTag = (status) => {
    let color = {
      "Pending": "blue",
      "Submitted": "purple",
      "Reviewed": "green",
      "Rework": "red",
      "completed": "green"
    }[status] || "default";
    return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;

  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      deadline: moment(task.deadline),
      assignedInterns: task.assignedTo.map(a => a.internId._id)
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      const updatedTask = {
        ...currentTask,
        title: values.title,
        description: values.description,
        deadline: values.deadline.toISOString(),
        assignedTo: values.assignedInterns.map(internId => {
          const existing = currentTask.assignedTo.find(a => a.internId._id === internId);
          return existing || {
            internId: interns.find(i => i._id === internId),
            startDate: new Date().toISOString(),
            status: 'Assigned',
            feedbackStatus: 'Pending',
            comment: '',
            attachments: []
          };
        })
      };
      
      await axios.put(
        `http://localhost:5000/api/tasks/${currentTask._id}`,
        updatedTask,
        { withCredentials: true }
      );
      
      setTasks(prev => prev.map(t => t._id === currentTask._id ? updatedTask : t));
      setEditModalVisible(false);
      message.success('Task updated successfully!');
    } catch (err) {
      console.error("Validation failed:", err);
      message.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/tasks/${taskId}`,
        { withCredentials: true }
      );
      setTasks(prev => prev.filter(t => t._id !== taskId));
      message.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      message.error('Failed to delete task');
    }
  };

  const handleCreateTask = () => {
    setShowCreateForm(true);
    createForm.resetFields();
  };

  const handleSaveCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const taskData = {
        title: values.title,
        description: values.description,
        deadline: values.deadline.toISOString(),
        createdBy: mentorId,
        internIds: values.assignedInterns.map(internId => ({
          internId,
          startDate: values.startDate.toISOString()
        }))
      };
 await axios.post(
        'http://localhost:5000/api/tasks/create', 
        taskData,
        { withCredentials: true }
      );

      message.success('Task created successfully!', 3);
      setShowCreateForm(false);
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
      message.error('Failed to create task');
    }
  };

  const handleOpenFeedback = (assignment) => {
    setCurrentAssignment(assignment);
    feedbackForm.setFieldsValue({
      rating: assignment.rating || 0,
      comment: assignment.comment || '',
      feedbackStatus: assignment.feedbackStatus || 'completed'
    });
    setFeedbackModalVisible(true);
  };

const handleSaveFeedback = async () => {
  try {
    const values = await feedbackForm.validateFields();
    const { rating, comment, feedbackStatus } = values;

    const taskIndex = tasks.findIndex(t => t._id === currentAssignment.taskId);
    if (taskIndex === -1) return;

    const updatedTask = { ...tasks[taskIndex] };
    const assignmentIndex = updatedTask.assignedTo.findIndex(
      a => a.internId._id === currentAssignment.internId._id
    );
    if (assignmentIndex === -1) return;

    // 🔍 Check if feedback already exists for this task + intern
    let existing = null;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/feedback/intern/${currentAssignment.internId._id}/task/${currentAssignment.taskId}`,
        { withCredentials: true }
      );
      existing = response.data;
    } catch (error) {
      if (error.response?.status !== 404) throw error;
    }

    if (existing) {
      // 🟡 PATCH update feedback
      await axios.patch(
        `http://localhost:5000/api/feedback/${existing._id}`,
        { rating, comment, feedbackStatus },
        { withCredentials: true }
      );
    } else {
      // 🟢 POST create feedback
      await axios.post(
        `http://localhost:5000/api/feedback/submit`,
        {
          internId: currentAssignment.internId._id,
          taskId: currentAssignment.taskId,
          mentorId,
          rating,
          comment,
          feedbackStatus
        },
        { withCredentials: true }
      );
    }

    // ✅ Update local state only (not backend)
    updatedTask.assignedTo[assignmentIndex] = {
      ...updatedTask.assignedTo[assignmentIndex],
      rating,
      comment,
      feedbackStatus,
      feedbackDate: new Date().toISOString(),
      status: feedbackStatus === 'Rework' ? 'Assigned' : 'completed'
    };

    setTasks(prev => {
      const newTasks = [...prev];
      newTasks[taskIndex] = updatedTask;
      return newTasks;
    });

    message.success('Feedback saved successfully!');
    setFeedbackModalVisible(false);
    fetchTasks(); // optional refresh
  } catch (error) {
    console.error("Error saving feedback:", error);
    message.error('Failed to save feedback');
  }
};

const isDeadlinePassed = (deadline) => {
  return moment().isAfter(moment(deadline), "day");
};


  const columns = [
    {
      title: "Task",
      dataIndex: "taskTitle",
      key: "title",
      width: 200,
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
         
        </div>
      )
    },
    {
      title: "Assigned To",
      key: "intern",
      render: (_, record) => (
        <Tag icon={<UserOutlined />} className="m-1">
          {record.internId?.firstName} {record.internId?.lastName}
        </Tag>
      )
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (date) =>(  
        <div>

      <CalendarOutlined className="mr-1" />
      {moment(date).format("MMM DD, YYYY")}
      
      </div>) 
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => renderStatusTag(status)
    },
    {
      title: "Feedback",
      dataIndex: "feedbackStatus",
      key: "feedbackStatus",
      render: (status) => renderFeedbackTag(status)
    },
    {
      title: "Deadline",
      dataIndex: "taskDeadline",
      render: (d) => (
        <div>
          <CalendarOutlined className="mr-1" />
          {moment(d).format("MMM DD, YYYY")}
        </div>
      ) 
    },
{
  title: "Actions",
  key: "actions",
  render: (_, record) => {
    const deadlinePassed = isDeadlinePassed(record.deadline);

    return (
      <Space size="small" wrap>
        {deadlinePassed ? (
          <Button type="default" icon={<CloseOutlined />} danger disabled>
            Deadline Passed
          </Button>
        ) : record.status === 'Submitted' && record.feedbackStatus !== 'completed' ? (
          <Button 
            type="primary" 
            icon={<MessageOutlined />}
            onClick={() => handleOpenFeedback(record)}
          >
            {record.feedbackStatus === 'Rework' ? 'Re-Feedback' : 'Give Feedback'}
          </Button>
        ) : record.feedbackStatus === 'completed' ? (
          <Button type="default" icon={<MessageOutlined />} disabled>
            Feedback Given
          </Button>
        ) : record.status === 'Assigned' ? (
          <Button 
            type="default" 
            icon={<DisconnectOutlined />} 
            disabled
          >
            Not Submitted
          </Button>
        ) : null}
      </Space>
    );
  }
}


  ];

  const expandableRow = {
    expandedRowRender: (record) => (
      <Collapse accordion>
        <Panel className='border-2 border-red-500'
          header={
            <span className="font-semibold">
              <InfoCircleOutlined className="mr-2" />
              Task Details
            </span>
          } 
          key="details"
        >
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <Title level={5} className="mb-2">Description</Title>
            <Text className="block">{record.taskDescription}</Text>
          </div>
          
          <Title level={5} className="mb-3 ml-4">Assignment Details</Title>
          <Card className="mb-3">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Status: </Text>
                {renderStatusTag(record.status)}
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Feedback: </Text>
                {renderFeedbackTag(record.feedbackStatus)}
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Start Date: </Text>
                <Text>{moment(record.startDate).format("MMM DD, YYYY")}</Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Deadline: </Text>
                <Text>{moment(record.taskDeadline).format("MMM DD, YYYY")}</Text>
              </Col>
            </Row>

        
          </Card>
             
             {/* ✅ Conditionally Render Submission Details */}
        {(record.comment || (Array.isArray(record.attachments) && record.attachments.length > 0)) && (
          <>
            <Title level={5} className="mb-3 mt-2 ml-4">Submission Details :</Title>
            <Card className="mb-3">
              <Row className="mt-3" gutter={[16, 16]}>
                {record.comment && (
                  <Col span={24}>
                    <Text strong>Comments: </Text>
                    <Text>{record.comment}</Text>
                  </Col>
                )}

                {Array.isArray(record.attachments) && record.attachments.length > 0 && (
                  <Col span={24}>
                    <Text strong>Attachments: </Text>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {record.attachments.map((url, index) => (
                        <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                          <Tag color="blue">Attachment {index + 1}</Tag>
                        </a>
                      ))}
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          </>
        )}
        </Panel>
      </Collapse>
    )
  };

  if (showCreateForm) {
    return (
      <div className="p-4">
        <PageHeader
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
                <Input 
                  placeholder="Enter task title" 
                  size="large" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="deadline" 
                label="Deadline" 
                rules={[{ required: true, message: 'Please select deadline' }]}
              >
                <DatePicker 
                
                
                  className="w-full" 
                  size="large" 
                />
              </Form.Item>
            </Col>
          </Row>
          
       
          
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
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {interns.map(i => (
                    <Option key={i._id} value={i._id}>
                      {i.firstName} {i.lastName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

             <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Enter detailed task description" 
            />
          </Form.Item>
        </Form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={2} className="text-gray-800">Mentor Task Dashboard</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreateTask}
          size="large"
          className="shadow-md"
        >
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col md={6}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search tasks..."
              value={filters.searchText}
              onChange={e => setFilters({ ...filters, searchText: e.target.value })}
              size="large"
              allowClear
            />
          </Col>
          <Col md={18}>
            <Space wrap>
              <Select 
                value={filters.status} 
                onChange={v => setFilters({ ...filters, status: v })}
                placeholder="Status"
                size="large"
                className="min-w-40"
              >
                <Option value="all">All Status</Option>
                <Option value="Assigned">Assigned</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Submitted">Submitted</Option>
                <Option value="completed">Completed</Option>
                <Option value="Overdue">Overdue</Option>
              </Select>
              
              <Select 
                value={filters.feedbackStatus} 
                onChange={v => setFilters({ ...filters, feedbackStatus: v })}
                placeholder="Feedback"
                size="large"
                className="min-w-40"
              >
                <Option value="all">All Feedback</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Submitted">Submitted</Option>
                <Option value="Reviewed">Reviewed</Option>
                <Option value="Rework">Rework</Option>
                <Option value="completed">Completed</Option>
              </Select>
              
              <RangePicker 
                onChange={dates => setFilters({ ...filters, dateRange: dates })} 
                placeholder={['Start Date', 'End Date']}
                size="large"
              />
              
              <Select 
                value={filters.intern} 
                onChange={v => setFilters({ ...filters, intern: v })}
                placeholder="Filter by Intern"
                size="large"
                className="min-w-48"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="all">All Interns</Option>
                {interns.map(i => (
                  <Option key={i._id} value={i._id}>
                    {i.firstName} {i.lastName}
                  </Option>
                ))}
              </Select>
              
              <Button 
                icon={<SyncOutlined />} 
                onClick={() => setFilters({
                  searchText: '', 
                  status: 'all', 
                  feedbackStatus: 'all', 
                  dateRange: null, 
                  intern: 'all'
                })}
                size="large"
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredAssignments}
          rowKey="key"
          pagination={{ pageSize: 5, showSizeChanger: true }}
          expandable={expandableRow}
          className="shadow"
        />
      </Spin>

      {/* Edit Task Modal */}
      <Modal
        title="Edit Task"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
        okText="Save Changes"
        cancelText="Cancel"
        width={700}
      >
        <Form form={form} layout="vertical" className="pt-4">
          <Form.Item 
            name="title" 
            label="Title" 
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input size="large" />
          </Form.Item>
          
          <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          
          <Form.Item 
            name="deadline" 
            label="Deadline" 
            rules={[{ required: true, message: 'Please select deadline' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm" 
              className="w-full" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item 
            name="assignedInterns" 
            label="Assign Interns" 
            rules={[{ required: true, message: 'Please select at least one intern' }]}
          >
            <Select mode="multiple" size="large">
              {interns.map(i => (
                <Option key={i._id} value={i._id}>
                  {i.firstName} {i.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        title={`Feedback for ${currentAssignment?.internId?.firstName || 'Intern'}`}
        open={feedbackModalVisible}
        onOk={handleSaveFeedback}
        onCancel={() => setFeedbackModalVisible(false)}
        okText="Submit Feedback"
        cancelText="Cancel"
        width={600}
      >
        <Form form={feedbackForm} layout="vertical" className="pt-4">
          <Form.Item 
            name="rating" 
            label="Rating"
          >
            <Rate />
          </Form.Item>
          
          <Form.Item 
            name="feedbackStatus" 
            label="Feedback Status" 
            rules={[{ required: true, message: 'Please select feedback status' }]}
          >
            <Select size="large">
              <Option value="completed">Completed</Option>
              <Option value="Rework">Rework</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="comment" 
            label="Comments" 
            rules={[{ required: true, message: 'Please enter your comments' }]}
          >
            <TextArea rows={4} placeholder="Provide detailed feedback" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MentorTaskDashboard;