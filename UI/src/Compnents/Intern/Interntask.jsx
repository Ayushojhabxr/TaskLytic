import React, { useState, useEffect } from 'react';
import {
  Table, Card, Row, Col, Typography, Spin, Button, 
  Tag, Space, Upload, message, Form, Input, Modal, Rate,
  Descriptions
} from 'antd';
import {
  UploadOutlined, CalendarOutlined, CheckOutlined,
  ClockCircleOutlined, CloseOutlined, FileDoneOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'antd/dist/reset.css'; // for Ant Design v5+


const { Title, Text } = Typography;
const { TextArea } = Input;

const InternTaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [submitForm] = Form.useForm();
  const [internId, setInternId] = useState('');
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [users, setUsers] = useState([]);



  

  // Fetch intern profile
  const fetchInternProfile = React.useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/myprofile', {
        withCredentials: true
      });
      setInternId(res.data.user._id);
    } catch (error) {
      console.error('Error fetching intern profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  }, [navigate]);

  // Fetch tasks assigned to this intern
  const fetchTasks = React.useCallback(async () => {
    if (!internId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/intern/${internId}`, {
        withCredentials: true
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
    setLoading(false);
  }, [internId]);

  useEffect(() => {
    fetchInternProfile();
  }, [fetchInternProfile]);

  const [feedbacks, setFeedbacks] = useState([]);
useEffect(() => {
  if (internId) {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/feedback/intern/${internId}`, {
          withCredentials: true,
        });
        setFeedbacks(res.data);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      }
    };

    fetchTasks();     // already declared with useCallback
    fetchFeedbacks(); // now defined inside this useEffect
  }
}, [internId, fetchTasks]); // ✅ add fetchTasks as well since you're calling it


  

  // Get the assignment for this specific intern from each task
  const getInternAssignment = (task) => {
    return task.assignedTo.find(a => a.internId === internId || a.internId._id === internId);
  };

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

    //  Loop through selected files
    const fileList = values.attachments?.fileList || [];
    if (fileList.length > 1) {
      message.error("Only one attachment allowed.");
      return;
    }

    if (fileList.length === 1) {
      formData.append("attachment", fileList[0].originFileObj); // only one file
    }

    formData.append("comment", values.comment || '');

    await axios.patch(
      `http://localhost:5000/api/tasks/${currentTask._id}/submit/${internId}`,
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



const getRatingForTask = (taskId) => {
  const feedback = feedbacks.find(fb => fb.taskId._id === taskId);
  return feedback?.rating;
};
const getfeedbackc = (taskId) => {
  const comments = feedbacks.find(fb => fb.taskId._id === taskId);
  return   comments?.comment
}


  // Check if deadline has passed
const isDeadlinePassed = (deadline) => {
  return moment().isAfter(moment(deadline), "day");
};


  // Determine action button based on task status
  const renderActionButton = (task) => {
    const assignment = getInternAssignment(task);
    const deadlinePassed = isDeadlinePassed(task.deadline);

    if (deadlinePassed) {
      return (
        <Button type="default" danger icon={<CloseOutlined />} disabled>
          Deadline Passed
        </Button>
      );
    }

    if (assignment.status === 'Submitted') {
      if (assignment.feedbackStatus === 'Rework') {
        return (
          <Button 
            type="primary" 
            icon={<FileDoneOutlined />}
            onClick={() => handleSubmitTask(task)}
          >
            Resubmit
          </Button>
        );
      } else if (assignment.feedbackStatus === 'completed') {
        return (
          <Button type="primary" icon={<CheckOutlined />} disabled>
            Approved
          </Button>
        );
      }
      return (
        <Button type="default" icon={<ClockCircleOutlined />} disabled>
          Submitted
        </Button>
      );
    }

    if (assignment.status === 'Assigned') {
      return (
        <Button 
          type="primary" 
          icon={<FileDoneOutlined />}
          onClick={() => handleSubmitTask(task)}
        >
          Submit Task
        </Button>
      );
    }

    return null;
  };


  const fetchAllUsers = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/users/alluser", {
      withCredentials: true
    });
    setUsers(res.data.admins);
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
};

useEffect(() => {
  fetchAllUsers();
}, []);

const getMentorName = (mentorId) => {
  const mentor = users.find((user) => user._id === mentorId);
  console.log(mentor)
  
  return  `${tasks[0]?.createdBy.firstName} ${tasks[0]?.createdBy.lastName}` ;
};



  const columns = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          
        </div>
      )
    },
  {
  title: "Assigned By",
  key: "mentor",
  render: (_, record) => {
    return <span>{getMentorName(record.createdBy)}</span>;
  }
},


    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const assignment = getInternAssignment(record);
        let color = '';
        let icon = null;
        
        switch(assignment.status) {
          case 'Assigned':
            color = 'blue';
            icon = <ClockCircleOutlined />;
            break;
          case 'Submitted':
            color = 'purple';
            icon = <FileDoneOutlined />;
            break;
          default:
            color = 'default';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {assignment.status}
          </Tag>
        );
      }
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      render: (deadline) => (
        <div>
          <CalendarOutlined className="mr-3 gap-1" />
          {moment(deadline).format("MMM DD, YYYY")}
          {/* {isDeadlinePassed(deadline) && (
            <Tag color="red" className="ml-2"> Overdue</Tag>
          )} */}
        </div>
      )
    },

    {
  title: "Feedback",
  key: "feedbackStatus",
  render: (_, record) => {
    const assignment = getInternAssignment(record);
    const status = assignment.feedbackStatus || "Pending";
    let color = "default";

    switch (status) {
      case "Pending":
        color = "blue";
        break;
      case "Reviewed":
      case "completed":
        color = "green";
        break;
      case "Rework":
        color = "red";
        break;
      default:
        color = "default";
    }

    return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;

  }
},
{
  title: "Action",
  key: "action",
  render: (_, record) => {
    const assignment = getInternAssignment(record);
  const deadlinePassed = isDeadlinePassed(record.deadline);


    if (deadlinePassed) {
      return (
        <Button type="default" danger icon={<CloseOutlined />} disabled>
          Deadline Passed
        </Button>
      );
    }

    if (assignment.status === 'Submitted') {
      if (assignment.feedbackStatus === 'Rework') {
        return (
          <Button 
            type="primary" 
            disabled
            icon={<FileDoneOutlined />}
          
          >
            Resubmitted
          </Button>
        );
      }

      if (assignment.feedbackStatus === 'completed') {
        return (
          <Button type="primary" icon={<CheckOutlined />} disabled>
            Approved
          </Button>
        );
      }

      return (
        <Button type="default" icon={<ClockCircleOutlined />} disabled>
          Submitted
        </Button>
      );
    }

    if (assignment.status === 'Assigned') 
      {if (assignment.feedbackStatus === 'Rework') {
        return (
          <Button 
            type="primary" 
            icon={<FileDoneOutlined />}
            onClick={() => handleSubmitTask(record)}
          >
            Resubmit
          </Button>
        );
      }


      return (
        <Button 
          type="primary" 
          icon={<FileDoneOutlined />}
          onClick={() => handleSubmitTask(record)}
        >
          Submit
        </Button>
      );
    }

    return null;
  }
}

 
  ];
  console.log("Sample task:", tasks[0]);
  console.log("record.createdBy", tasks[0]?.createdBy);



  const expandedRowRender = (record) => {
    const assignment = getInternAssignment(record);
    const deadlinePassed = isDeadlinePassed(record.deadline);

    return (
      <Row gutter={16} className="p-4">
        {/* Task Details Card */}
        <Col span={12}>
          <Card title="Task Details" bordered={false}>
            <div className="mb-4">
              <Title level={5}>Description</Title>
              <Text>{record.description}</Text>
            </div>
            
            <Descriptions column={1}>
              <Descriptions.Item label="Start Date">
                {moment(assignment.startDate).format("MMM DD, YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Deadline">
                {moment(record.deadline).format("MMM DD, YYYY")}
                {deadlinePassed && (
                  <Tag color="red" className="ml-2">Passed</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={assignment.status === 'Assigned' ? 'blue' : 'purple'}>
                  {assignment.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Feedback Card */}
        <Col span={12}>
  <Card title="Feedback" bordered={false}>
    {assignment.feedbackStatus === 'completed' ||  assignment.feedbackStatus === 'rework' ?(
      <>
        <Descriptions column={1}>
          <Descriptions.Item label="Feedback Status">
            <Tag color={
              assignment.feedbackStatus === 'Pending' ? 'blue' : 
              assignment.feedbackStatus === 'Rework' ? 'red' : 'green'
            }>
              {assignment.feedbackStatus}
            </Tag>
          </Descriptions.Item>

          {(() => {
            const rating = getRatingForTask(record._id);
            if (typeof rating === 'number') {
              return (
                <Descriptions.Item label="Rating">
                  <Rate disabled defaultValue={rating} />
                </Descriptions.Item>
              );
            }
            return null;
          })()}
{/* 
          {(() => {
            return (
              <Descriptions.Item label="Rating">
                <Rate disabled defaultValue={getfeedbackc(record._id)} />
              </Descriptions.Item>
            );
          })()} */}

          {assignment.comment && (
            <Descriptions.Item label="Comments">
              <Text>{assignment.comment}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        {assignment.attachments?.length > 0 && (
          <div className="mt-4">
            <Text strong>Attachments:</Text>
            <div className="flex flex-wrap gap-2 mt-2">
              {assignment.attachments.map((url, index) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                  <Tag color="blue">Attachment {index + 1}</Tag>
                </a>
              ))}
            </div>
          </div>
        )}
      </>
    ) : (
      <Text type="secondary">No feedback yet</Text>
    )}
  </Card>
</Col>

      </Row>
    );
  };

  return (
    <div className="p-4">
      <Title level={2} className="mb-4">My Tasks</Title>
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="_id"
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 5 }}
        />
      </Spin>

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
            // beforeUpload={() => false}

                         beforeUpload={(file) => {
                       const allowedTypes = [
                       'application/msword', // .doc
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
                          'application/pdf' // .pdf
                              ];

                        if (!allowedTypes.includes(file.type)) {
                           console.error('Only .doc, .docx, or .pdf files are allowed!');
                            message.error(`${file.name} is not a valid file. Only .doc, .docx, or .pdf allowed.`);
                          return Upload.LIST_IGNORE;
                                 }
   
                                     
                           }}

            fileList={fileList}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
>
  <Button icon={<UploadOutlined />}>Select File</Button>
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
    </div>
  );
};

export default InternTaskDashboard;