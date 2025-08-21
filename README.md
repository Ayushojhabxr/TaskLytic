# 🚀 TaskLytic – Internship & Training Management Platform  

**TaskLytic** is a complete **internship and trainee management system** built with the **MERN stack**.  
It allows organizations to efficiently manage their interns, mentors, and administrators with a streamlined workflow for **tasks, feedback, performance tracking, and communication**.  

⚠️ **Note:** This project is for demonstration purposes. **Login credentials are provided by the organization/admin only**.  
👉 You will **not be able to log in without valid credentials**.  

---

## ✨ Features  

### 👑 **Admin Dashboard**  
- Create and manage users (Admins, Mentors, Interns).  
- Assign tasks to interns and designate mentors.  
- Monitor all activities with insights and analytics.  
- View task statuses, feedback history, and intern performance.  
- Manage the **community forum** (issues reported within the organization).  

### 🧑‍🏫 **Mentor Dashboard**  
- Assign tasks directly to interns.  
- Review submitted tasks and give feedback:  
  - ✅ **Complete** – Task successfully completed.  
  - 🔄 **Rework** – Intern must resubmit with corrections.  
- Provide **ratings, comments, and performance feedback**.  
- Track intern progress through analytics.  
- Participate in the **community forum**.  

### 👨‍💻 **Intern Dashboard**  
- View all assigned tasks with **start date, deadline, and details**.  
- Submit completed tasks (with attachments).  
- Access mentor feedback and **resubmit if rework is required**.  
- Track personal performance and task history.  
- Report issues in the **community forum**.  

### 🌐 **Community Forum (All Roles)**  
- A shared space where **admins, mentors, and interns** can report or discuss issues.  
- Helps maintain transparency within the organization.  

---

## 🛠️ Tech Stack  

- **Frontend:** React.js, Ant Design, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication & Security:** JWT, bcrypt, role-based access control  
- **Deployment:** Vercel (Frontend), Render/Heroku (Backend)  

---

## 📊 Analytics & Insights  

- Task progress tracking (Pending, Rework, Completed).  
- Intern performance evaluation via feedback, ratings, and task completion history.  
- Admin-wide overview of **who assigned what task, to whom, and current status**.  
- Mentor dashboards with insights into their interns.  

---

## 🚦 Workflow  

1. **Admin** creates users → assigns mentor(s) → assigns tasks.  
2. **Mentor** reviews submissions → provides feedback → marks as **Completed** or requests **Rework**.  
3. **Intern** resubmits until task is marked **Completed**.  
4. All roles can raise concerns via the **community forum**.  

---

## 📸 Screenshots (Optional)  
_Add screenshots of dashboards here for better presentation._  

---

## ⚠️ Important Note  

🔒 **Access Restricted** – This is an organization-owned application.  
- Credentials are created and provided **only by the Admin/Organization**.  
- You will **not be able to sign up or log in** without authorized credentials.  

---

## 🚀 Getting Started (For Developers)  

### Clone the Repository  
```bash
git clone https://github.com/yourusername/tasklytic.git
cd tasklytic
Install Dependencies
Frontend


cd client
npm install
Backend



cd server
npm install



Setup Environment Variables
Create a .env file in the backend with the following:

MONGO_URI=your_mongo_db_uri
JWT_SECRET=your_secret_key
PORT=5001


Run the App
Backend

cd server
npm start

Frontend
cd client
npm run dev

🤝 Contributing
Contributions are welcome!
If you’d like to add new features, fix bugs, or improve documentation, feel free to open a pull request.
