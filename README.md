
# Saviya Learn - Backend API

> **Peer-to-Peer Education Platform** - An open-source learning management system designed for community-driven education, disaster relief, and collaborative learning.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication-endpoints)
  - [User Management](#user-management-endpoints)
  - [Learning Groups](#learning-groups-endpoints)
  - [Resources](#resources-endpoints)
  - [Sessions](#sessions-endpoints)
  - [Chat & Messaging](#chat-messaging-endpoints)
  - [Community Help](#community-help-endpoints)
  - [Reports](#reports-endpoints)
  - [Notifications](#notifications-endpoints)
  - [Analytics](#analytics-endpoints)
- [Data Models](#data-models)
- [Email System](#email-system)
- [Real-time Features](#real-time-features)
- [Security](#security)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Code Style Guide](#code-style-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🌟 Overview

**Saviya Learn Backend** is a robust, scalable REST API built with Node.js and Express.js, designed to power peer-to-peer educational platforms. It provides comprehensive features for user management, learning groups, resource sharing, live sessions, real-time chat, and community-driven learning.

The platform is specifically designed for:
- **Disaster Relief Education**: Rapid deployment for emergency learning scenarios
- **Community Learning**: Peer-to-peer knowledge sharing and collaboration
- **Remote Education**: Virtual classrooms with live session support
- **Resource Management**: Centralized educational resource repository

---

## ✨ Key Features

### 👥 User Management
- User registration with email verification
- JWT-based authentication (access & refresh tokens)
- Role-based access control (User, Admin, Superadmin)
- User profile management with skills and preferences
- Password reset via email
- User status management (Active, Banned, Suspended)
- Professional email templates (Welcome, Verification, Password Reset)

### 📚 Learning Groups
- Create and join subject-specific learning groups
- Unique group identification (Grade + Subject + Topic)
- Group member management with roles
- Search and discovery with pagination
- Admin moderation tools
- WhatsApp integration for external communication

### 📖 Resource Management
- Upload and share educational resources (Google Drive, external links)
- Resource categorization and tagging
- View tracking and analytics
- Search and filter capabilities
- Admin content moderation
- Email notifications for new resources

### 🎓 Live Sessions
- Schedule and manage live learning sessions
- Virtual classroom integration (meeting links)
- Attendance tracking with timestamps
- Session state management (Scheduled, Ongoing, Completed, Cancelled)
- Email notifications (Session scheduled, Session started)
- Duration tracking and analytics

### 💬 Real-time Chat
- Group-based messaging using Socket.io
- Message history and persistence
- Typing indicators
- Resource sharing in chat
- Reply functionality
- Real-time message delivery

### 🤝 Community Help
- Resource request system
- Peer-to-peer assistance
- Request status tracking (Open, Fulfilled, Closed)
- Response management
- Subject and topic categorization

### 📊 Analytics & Reporting
- User activity tracking
- Resource analytics (views, shares)
- Session attendance reports
- Group engagement metrics
- Admin dashboard statistics
- Audit logging for compliance

### 🔔 Notification System
- In-app notifications
- Email notifications
- Real-time notification delivery via Socket.io
- Notification preferences
- Mark as read/unread functionality

### 🛡️ Security Features
- CORS configuration with domain whitelisting
- JWT token rotation
- Password hashing with bcrypt
- Rate limiting (planned)
- Input validation and sanitization
- Activity audit logging

---

## 🛠 Technology Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js (v14+) |
| **Framework** | Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT) |
| **Email** | Nodemailer with Gmail SMTP |
| **Real-time** | Socket.io |
| **Security** | bcryptjs, CORS, helmet |
| **Logging** | Morgan |
| **Environment** | dotenv |

---

## 🏗 Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────┐
│         Client Applications                  │
│  (Web App, Mobile App, Admin Dashboard)     │
└─────────────────┬───────────────────────────┘
                  │ HTTPS/WSS
                  ▼
┌─────────────────────────────────────────────┐
│           Express.js Server                  │
│  ┌─────────────────────────────────────┐   │
│  │         API Routes                   │   │
│  ├─────────────────────────────────────┤   │
│  │      Middleware Layer                │   │
│  │  • Authentication (JWT)              │   │
│  │  • Authorization (RBAC)              │   │
│  │  • Input Validation                  │   │
│  │  • Error Handling                    │   │
│  ├─────────────────────────────────────┤   │
│  │      Controllers                     │   │
│  │  • Business Logic                    │   │
│  │  • Request Processing                │   │
│  ├─────────────────────────────────────┤   │
│  │         Services                     │   │
│  │  • Email Service                     │   │
│  │  • Socket Service                    │   │
│  │  • Notification Service              │   │
│  └─────────────────────────────────────┘   │
└──────────────┬──────────────┬───────────────┘
               │              │
               ▼              ▼
    ┌──────────────┐  ┌──────────────┐
    │   MongoDB    │  │  Socket.io   │
    │   Database   │  │  WebSocket   │
    └──────────────┘  └──────────────┘
               │              │
               ▼              ▼
    ┌──────────────┐  ┌──────────────┐
    │  Nodemailer  │  │   Real-time  │
    │     SMTP     │  │   Clients    │
    └──────────────┘  └──────────────┘
```

### MVC Architecture Pattern

```
Models (Data Layer)
    ↓
Controllers (Business Logic)
    ↓
Routes (API Endpoints)
    ↓
Middleware (Auth, Validation)
    ↓
Services (External Integrations)
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v6.0.0 or higher) - Comes with Node.js
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dinethjanitha/saviyalearning-backend.git
   cd saviyalearning-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration (see [Environment Configuration](#environment-configuration))

4. **Verify installation:**
   ```bash
   npm test
   ```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/saviya_learn
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saviya_learn

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_too
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
MAIL_FROM=Saviya Learn <noreply@saviyalearn.com>

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:3000
# For production:
# FRONTEND_URL=https://saviyalearn.com

# Socket.io Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000

# File Upload (Future)
# MAX_FILE_SIZE=10485760  # 10MB in bytes
```

**Important Notes:**
- For Gmail SMTP, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong, unique values in production
- Keep your `.env` file secure and never commit it to version control

### Running the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**With PM2 (Recommended for production):**
```bash
npm install -g pm2
pm2 start server.js --name saviya-backend
pm2 save
pm2 startup
```

The server will start on `http://localhost:5000` (or your configured PORT).

**Health Check:**
```bash
curl http://localhost:5000/
```

Expected response:
```json
{
  "message": "Peer-to-peer education system backend is running."
}
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication

All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| POST | `/auth/signup` | Register new user | No | `{ email, password, profile: { name, country, region } }` |
| POST | `/auth/login` | User login | No | `{ email, password }` |
| POST | `/auth/refresh-token` | Refresh access token | No | `{ refreshToken }` |
| POST | `/auth/request-password-reset` | Request password reset | No | `{ email }` |
| POST | `/auth/reset-password` | Reset password | No | `{ token, newPassword }` |
| GET | `/auth/verify-email?token=xxx` | Verify email address | No | Query: `token` |

**Example: User Registration**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123!",
    "profile": {
      "name": "John Doe",
      "country": "Sri Lanka",
      "region": "Western"
    }
  }'
```

**Response:**
```json
{
  "message": "User registered. Verification email sent."
}
```

### User Management Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/users/me` | Get current user profile | Yes | No |
| PUT | `/users/me` | Update current user profile | Yes | No |
| GET | `/users` | List all users (with pagination) | Yes | Yes |
| GET | `/users/:id` | Get user by ID | Yes | Yes |
| PUT | `/users/:id` | Update user by ID | Yes | Yes |
| DELETE | `/users/:id` | Delete user | Yes | Yes |
| PATCH | `/users/:id/ban` | Ban user | Yes | Yes |
| PATCH | `/users/:id/suspend` | Suspend user | Yes | Yes |
| PATCH | `/users/:id/reactivate` | Reactivate user | Yes | Yes |
| PATCH | `/users/:id/reset-password` | Admin password reset | Yes | Yes |

**Example: Update Profile**
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "bio": "Passionate about mathematics",
      "avatar": "https://example.com/avatar.jpg"
    },
    "skills": ["Mathematics", "Physics", "Teaching"]
  }'
```

### Learning Groups Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| POST | `/groups` | Create new group | - |
| GET | `/groups/search` | Search groups | `q`, `grade`, `subject`, `page`, `limit` |
| GET | `/groups/my` | Get my groups | `page`, `limit` |
| GET | `/groups/:id` | Get group details | - |
| PUT | `/groups/:id` | Update group | - |
| DELETE | `/groups/:id` | Delete group | - |
| POST | `/groups/:id/join` | Join group | - |
| POST | `/groups/:id/leave` | Leave group | - |
| DELETE | `/groups/:id/members/:userId` | Remove member (admin) | - |

**Example: Create Group**
```bash
curl -X POST http://localhost:5000/api/groups \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 10,
    "subject": "Mathematics",
    "topic": "Algebra",
    "description": "Advanced algebra study group"
  }'
```

### Resources Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| POST | `/resources` | Add resource | - |
| GET | `/resources/group/:groupId` | List group resources | `page`, `limit`, `q` |
| GET | `/resources/:id` | View resource (increments count) | - |
| PUT | `/resources/:id` | Update resource | - |
| DELETE | `/resources/:id` | Delete resource | - |

**Example: Add Resource**
```bash
curl -X POST http://localhost:5000/api/resources \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Algebra Textbook",
    "description": "Complete algebra reference",
    "link": "https://drive.google.com/file/xxx",
    "groupId": "60d5ec49f1b2c72b8c8e4a1b"
  }'
```

### Sessions Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sessions` | Create session |
| GET | `/sessions/group/:groupId` | List group sessions |
| POST | `/sessions/:id/start` | Start session |
| POST | `/sessions/:id/end` | End session |
| POST | `/sessions/:id/join` | Join session |
| POST | `/sessions/:id/leave` | Leave session |

**Example: Schedule Session**
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Algebra Basics",
    "groupId": "60d5ec49f1b2c72b8c8e4a1b",
    "scheduledAt": "2025-12-10T15:00:00Z",
    "duration": 60,
    "meetingLink": "https://meet.google.com/xxx-yyyy-zzz"
  }'
```

### Chat & Messaging Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/messages/:groupId` | Get chat messages |
| POST | `/chat/messages` | Send message |
| DELETE | `/chat/messages/:id` | Delete message |

**Socket.io Events:**
- `join_group`: Join group chat room
- `leave_group`: Leave group chat room
- `send_message`: Send real-time message
- `typing`: Broadcast typing indicator
- `stop_typing`: Stop typing indicator

### Community Help Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resource-requests` | Create request |
| GET | `/resource-requests` | List all requests |
| GET | `/resource-requests/my` | My requests |
| GET | `/resource-requests/:id` | Get request details |
| POST | `/resource-requests/:id/respond` | Respond to request |
| PATCH | `/resource-requests/:id/fulfill` | Mark as fulfilled |
| PATCH | `/resource-requests/:id/close` | Close request |

### Reports Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reports` | Submit report |
| GET | `/reports` | List reports (admin) |
| PATCH | `/reports/:id/resolve` | Resolve report (admin) |

### Notifications Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get notifications |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/mark-all-read` | Mark all as read |

### Analytics Endpoints

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/analytics` | Get dashboard stats | Yes |
| GET | `/resource-analytics` | Resource analytics | Yes |
| GET | `/activity-logs` | Activity logs | Yes |

---

## 💾 Data Models

### User Model
```javascript
{
  email: String (unique, required),
  passwordHash: String (required),
  role: String (enum: ['user', 'admin', 'superadmin']),
  status: String (enum: ['active', 'banned', 'suspended']),
  profile: {
    name: String,
    bio: String,
    avatar: String,
    country: String,
    region: String
  },
  skills: [String],
  preferences: {
    language: String,
    notifications: Boolean,
    emailNotifications: Boolean
  },
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### LearningGroup Model
```javascript
{
  grade: Number (required),
  subject: String (required),
  topic: String (required),
  description: String,
  createdBy: ObjectId (ref: 'User'),
  members: [{
    userId: ObjectId (ref: 'User'),
    role: String (enum: ['member', 'admin']),
    joinedAt: Date
  }],
  maxMembers: Number (default: 50),
  whatsappLink: String,
  status: String (enum: ['active', 'archived']),
  createdAt: Date,
  updatedAt: Date
}
```

### Resource Model
```javascript
{
  title: String (required),
  description: String,
  link: String (required),
  groupId: ObjectId (ref: 'LearningGroup'),
  uploadedBy: ObjectId (ref: 'User'),
  viewCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Session Model
```javascript
{
  title: String (required),
  groupId: ObjectId (ref: 'LearningGroup'),
  teacherId: ObjectId (ref: 'User'),
  scheduledAt: Date,
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  meetingLink: String,
  status: String (enum: ['scheduled', 'ongoing', 'completed', 'cancelled']),
  attendees: [{
    userId: ObjectId (ref: 'User'),
    joinedAt: Date,
    leftAt: Date
  }],
  createdAt: Date
}
```

### ChatMessage Model
```javascript
{
  groupId: ObjectId (ref: 'LearningGroup'),
  senderId: ObjectId (ref: 'User'),
  message: String (required),
  resourceId: ObjectId (ref: 'Resource'),
  replyTo: ObjectId (ref: 'ChatMessage'),
  timestamp: Date
}
```

### ResourceRequest Model
```javascript
{
  requesterId: ObjectId (ref: 'User'),
  title: String (required),
  description: String (required),
  subject: String (required),
  topic: String (required),
  type: String,
  groupId: ObjectId (ref: 'LearningGroup'),
  status: String (enum: ['open', 'fulfilled', 'closed']),
  responses: [{
    userId: ObjectId (ref: 'User'),
    message: String,
    resourceId: ObjectId (ref: 'Resource'),
    createdAt: Date
  }],
  createdAt: Date
}
```

### ActivityLog Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  actionType: String (required),
  details: Object,
  timestamp: Date
}
```

---

## 📧 Email System

The backend uses **Nodemailer** with professional HTML email templates for all user communications.

### Email Templates

All templates are located in `/services/emailTemplates.js` and feature:
- Responsive HTML design
- Gradient branding (blue to indigo)
- Professional typography
- No emojis (professional appearance)
- Consistent footer with copyright

**Available Templates:**
1. **Welcome Email** - Sent after successful registration
2. **Email Verification** - Email verification with clickable button
3. **Password Reset** - Secure password reset with expiration notice
4. **Session Scheduled** - Notification when session is scheduled
5. **Session Started** - Urgent notification when session begins
6. **Resource Shared** - Notification for new group resources

### Email Configuration

Configure SMTP settings in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=Saviya Learn <noreply@saviyalearn.com>
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate [App Password](https://support.google.com/accounts/answer/185833)
3. Use app password in `SMTP_PASS`

---

## ⚡ Real-time Features

The backend uses **Socket.io** for real-time bidirectional communication.

### Socket Events

**Client → Server:**
```javascript
// Join group chat
socket.emit('join_group', { groupId: 'xxx', userId: 'yyy' });

// Send message
socket.emit('send_message', {
  groupId: 'xxx',
  senderId: 'yyy',
  message: 'Hello!',
  resourceId: 'zzz' // optional
});

// Typing indicator
socket.emit('typing', { groupId: 'xxx', userId: 'yyy' });
socket.emit('stop_typing', { groupId: 'xxx', userId: 'yyy' });
```

**Server → Client:**
```javascript
// New message
socket.on('new_message', (data) => {
  // Handle new message
});

// User typing
socket.on('user_typing', (data) => {
  // Show typing indicator
});

// Notification
socket.on('notification', (data) => {
  // Handle notification
});
```

### Implementation Example

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'jwt_token_here' }
});

socket.emit('join_group', { groupId: '123', userId: '456' });

socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

---

## 🔒 Security

### Implemented Security Measures

1. **Authentication & Authorization:**
   - JWT-based authentication
   - Access token (15 minutes) + Refresh token (7 days)
   - Role-based access control (RBAC)

2. **Password Security:**
   - bcrypt hashing with salt rounds
   - Minimum password requirements (enforced on frontend)
   - Secure password reset flow

3. **CORS Configuration:**
   - Domain whitelisting
   - Credentials support
   - Configurable allowed origins

4. **Input Validation:**
   - Mongoose schema validation
   - Required field enforcement
   - Type checking

5. **Activity Logging:**
   - All admin actions logged
   - User activity tracking
   - Audit trail for compliance

### Security Best Practices

- Never commit `.env` file
- Use strong JWT secrets (minimum 32 characters)
- Rotate JWT secrets regularly in production
- Enable HTTPS in production
- Use environment-specific configurations
- Implement rate limiting (recommended)
- Regular dependency updates
- Monitor for security vulnerabilities

---

## 📁 Project Structure

```
backend/
├── server.js                      # Application entry point
├── app.js                         # Express app configuration
├── package.json                   # Dependencies and scripts
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── README.md                      # This file
│
├── controllers/                   # Request handlers (business logic)
│   ├── activityLogController.js   # Activity log operations
│   ├── analyticsController.js     # Analytics and reports
│   ├── authController.js          # Authentication logic
│   ├── chatController.js          # Chat operations
│   ├── learningGroupController.js # Group management
│   ├── notificationController.js  # Notifications
│   ├── reportController.js        # User/content reports
│   ├── resourceAnalyticsController.js # Resource analytics
│   ├── resourceController.js      # Resource management
│   ├── resourceGroupController.js # Resource grouping
│   ├── resourceRequestController.js # Community help
│   ├── sessionController.js       # Session management
│   └── userController.js          # User operations
│
├── middleware/                    # Express middleware
│   └── auth.js                    # JWT authentication middleware
│
├── models/                        # Mongoose schemas
│   ├── ActivityLog.js             # Activity logging
│   ├── ChatMessage.js             # Chat messages
│   ├── EmailVerificationToken.js  # Email verification
│   ├── LearningGroup.js           # Learning groups
│   ├── Notification.js            # Notifications
│   ├── Report.js                  # Reports
│   ├── Resource.js                # Resources
│   ├── ResourceGroup.js           # Resource grouping
│   ├── ResourceRequest.js         # Community requests
│   ├── Session.js                 # Live sessions
│   ├── User.js                    # Users
│   └── UserPreferences.js         # User preferences
│
├── routes/                        # API route definitions
│   ├── activityLogRoutes.js       # Activity log endpoints
│   ├── analyticsRoutes.js         # Analytics endpoints
│   ├── authRoutes.js              # Auth endpoints
│   ├── chatRoutes.js              # Chat endpoints
│   ├── learningGroupRoutes.js     # Group endpoints
│   ├── notificationRoutes.js      # Notification endpoints
│   ├── reportRoutes.js            # Report endpoints
│   ├── resourceAnalyticsRoutes.js # Resource analytics endpoints
│   ├── resourceGroupRoutes.js     # Resource group endpoints
│   ├── resourceRequestRoutes.js   # Community help endpoints
│   ├── resourceRoutes.js          # Resource endpoints
│   ├── sessionRoutes.js           # Session endpoints
│   └── userRoutes.js              # User endpoints
│
└── services/                      # Business logic services
    ├── emailTemplates.js          # Professional email templates
    ├── mailService.js             # Email sending service
    └── socketService.js           # Socket.io configuration
```

---

## 🚢 Deployment

### Deploying to Azure

1. **Create Azure Web App:**
   ```bash
   az webapp create --name saviya-backend --resource-group myResourceGroup --plan myAppServicePlan --runtime "NODE|14-lts"
   ```

2. **Configure environment variables:**
   ```bash
   az webapp config appsettings set --name saviya-backend --resource-group myResourceGroup --settings MONGODB_URI="xxx" JWT_SECRET="xxx"
   ```

3. **Deploy code:**
   ```bash
   az webapp deployment source config-zip --name saviya-backend --resource-group myResourceGroup --src backend.zip
   ```

### Deploying with PM2

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Start application:**
   ```bash
   pm2 start server.js --name saviya-backend
   pm2 save
   pm2 startup
   ```

3. **Monitor application:**
   ```bash
   pm2 status
   pm2 logs saviya-backend
   pm2 monit
   ```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t saviya-backend .
docker run -p 5000:5000 --env-file .env saviya-backend
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/saviyalearning-backend.git
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**
5. **Commit your changes:**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

#### Before Contributing

- Check existing issues and PRs to avoid duplicates
- For major changes, open an issue first to discuss
- Ensure your code follows our [Code Style Guide](#code-style-guide)
- Write meaningful commit messages
- Update documentation if needed

#### Types of Contributions

We welcome:
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- ♻️ Code refactoring
- 🎨 UI/UX improvements
- 🧪 Test coverage
- 🌐 Translations
- 🔒 Security enhancements

#### Pull Request Process

1. **Update documentation** - Add/update relevant docs
2. **Test your changes** - Ensure all tests pass
3. **Follow code style** - Use consistent formatting
4. **Write clear descriptions** - Explain what and why
5. **Request review** - Tag relevant maintainers
6. **Address feedback** - Respond to review comments

#### Reporting Bugs

When reporting bugs, please include:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)
- Error messages and logs
- Screenshots if applicable

**Bug Report Template:**
```markdown
**Describe the bug:**
A clear description of the bug

**To Reproduce:**
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior:**
What you expected to happen

**Environment:**
- Node version: 14.17.0
- MongoDB version: 4.4
- OS: Ubuntu 20.04
```

#### Feature Requests

For feature requests, describe:
- The problem it solves
- Proposed solution
- Alternative solutions considered
- Impact on existing features

---

## 📘 Code Style Guide

### JavaScript Standards

- Use **ES6+ syntax**
- Follow **async/await** pattern (avoid callbacks)
- Use **descriptive variable names**
- Add **JSDoc comments** for functions
- Keep functions **small and focused**

### File Organization

```javascript
// 1. Imports (external then internal)
import express from 'express';
import User from '../models/User.js';

// 2. Constants
const ITEMS_PER_PAGE = 20;

// 3. Helper functions
const formatDate = (date) => {
  // Implementation
};

// 4. Main exports
export const getUsers = async (req, res) => {
  // Implementation
};
```

### Naming Conventions

```javascript
// Variables and functions: camelCase
const userCount = 10;
const getUserById = () => {};

// Classes and Models: PascalCase
class UserService {}
const User = mongoose.model('User');

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;

// Private functions: _camelCase
const _validateInput = () => {};
```

### Error Handling

```javascript
// Good: Specific error handling
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
```

### API Response Format

```javascript
// Success responses
res.status(200).json({
  success: true,
  data: result,
  message: 'Operation successful'
});

// Error responses
res.status(400).json({
  success: false,
  message: 'Validation failed',
  errors: validationErrors
});

// Paginated responses
res.status(200).json({
  success: true,
  data: items,
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    pages: 5
  }
});
```

### Database Queries

```javascript
// Good: Use lean() for read-only operations
const users = await User.find({ status: 'active' })
  .lean()
  .select('name email')
  .limit(20);

// Good: Use proper indexes
const group = await LearningGroup.findOne({
  grade: 10,
  subject: 'Math',
  topic: 'Algebra'
}).lean();

// Good: Populate only needed fields
const resource = await Resource.findById(id)
  .populate('uploadedBy', 'name email')
  .populate('groupId', 'grade subject topic');
```

### Logging Standards

```javascript
// Use consistent log prefixes
console.log('[SUCCESS] Email sent to', email);
console.error('[ERROR] Database connection failed:', error);
console.warn('[WARNING] Rate limit approaching');
console.info('[INFO] Server started on port', PORT);
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Writing Tests

Create test files in `/tests` directory:

```javascript
// tests/auth.test.js
import request from 'supertest';
import app from '../app.js';

describe('Authentication', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          profile: { name: 'Test User' }
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should reject duplicate email', async () => {
      // Test implementation
    });
  });
});
```

---

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
Error: MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running:
```bash
# macOS/Linux
sudo systemctl start mongod

# Windows
net start MongoDB

# Or use MongoDB Atlas connection string
```

**JWT Authentication Error:**
```bash
Error: JsonWebTokenError: invalid signature
```
**Solution:** Check that `JWT_SECRET` matches in `.env` and hasn't changed mid-session.

**Email Sending Failed:**
```bash
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution:** 
1. Enable 2FA on Gmail
2. Generate App Password
3. Use app password in `SMTP_PASS`

**Port Already in Use:**
```bash
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**CORS Error:**
```bash
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Add frontend URL to `CORS` configuration in `app.js` and set `FRONTEND_URL` in `.env`.

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

### Getting Help

- 📖 Check documentation first
- 🐛 Search existing [GitHub Issues](https://github.com/dinethjanitha/saviyalearning-backend/issues)
- 💬 Ask in [Discussions](https://github.com/dinethjanitha/saviyalearning-backend/discussions)
- 📧 Email: support@saviyalearn.com

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Saviya Learn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Acknowledgments

- Built with ❤️ for education and disaster relief
- Inspired by peer-to-peer learning principles
- Thanks to all [contributors](https://github.com/dinethjanitha/saviyalearning-backend/graphs/contributors)

---

## 📞 Contact & Support

- **Website:** https://saviyalearn.com
- **GitHub:** https://github.com/dinethjanitha/saviyalearning-backend
- **Issues:** https://github.com/dinethjanitha/saviyalearning-backend/issues
- **Email:** support@saviyalearn.com

---

**⭐ Star this repository if you find it helpful!**

**Built for disaster relief, education, and community empowerment.**


2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up your `.env` file:** (see below)
4. **Start the server:**
   ```sh
   npm start
   # or
   node server.js
   ```


## Environment Variables

Create a `.env` file in the backend root with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SMTP_USER=your_email_address
SMTP_PASS=your_email_password
EMAIL_FROM=your_email_from_name
CLIENT_URL=your_frontend_url
```

---

## API Endpoints

All endpoints require JWT authentication unless otherwise noted. Admin endpoints require admin role.

### Authentication
| Endpoint | Method | Request Body | Notes |
|---|---|---|---|
| `/api/auth/signup` | POST | `{ "email", "password", "name", "country", "region" }` | Register user |
| `/api/auth/login` | POST | `{ "email", "password" }` | Login |
| `/api/auth/refresh-token` | POST | `{ "refreshToken" }` | Refresh JWT |
| `/api/auth/request-password-reset` | POST | `{ "email" }` | Request password reset |
| `/api/auth/reset-password` | POST | `{ "email", "token", "newPassword" }` | Reset password |
| `/api/auth/verify-email?token=...` | GET | _None_ | Verify email |

### User Profile & Management
| Endpoint | Method | Request Body | Notes |
|---|---|---|---|
| `/api/users/me` | GET | _None_ | Get current user profile |
| `/api/users/me` | PUT | `{ "profile": { ... }, "skills": [ ... ] }` | Update profile |
| `/api/users` | GET | _None_ | List/search users (admin) |
| `/api/users/:id` | GET | _None_ | Get user by ID (admin) |
| `/api/users/:id` | PUT | `{ "profile": { ... }, "role", "status" }` | Update user by ID (admin) |
| `/api/users/:id/ban` | PATCH | _None_ | Ban user (admin) |
| `/api/users/:id/suspend` | PATCH | _None_ | Suspend user (admin) |
| `/api/users/:id/reactivate` | PATCH | _None_ | Reactivate user (admin) |
| `/api/users/:id/reset-password` | PATCH | `{ "newPassword" }` | Admin reset user password |

### Learning Groups
| Endpoint | Method | Request Body | Notes |
|---|---|---|---|
| `/api/groups` | POST | `{ "name", "description", "grade", "subject", "topic" }` | Create group |
| `/api/groups/search` | GET | _None_ | Search groups |
| `/api/groups/my` | GET | _None_ | List my groups |
| `/api/groups/:id` | GET | _None_ | Get group details |
| `/api/groups/:id/join` | POST | _None_ | Join group |
| `/api/groups/:id/leave` | POST | _None_ | Leave group |

### Learning Groups (Admin)
| Endpoint | Method | Request Body | Notes |
|---|---|---|---|
| `/api/groups` | GET | _None_ | List/search all groups (admin) |
| `/api/groups/:id` | PUT | `{ "name", "description", ... }` | Update group (admin) |
| `/api/groups/:id` | DELETE | _None_ | Delete/archive group (admin, use `?archive=true`) |
| `/api/groups/:id/members/:userId` | DELETE | _None_ | Remove/ban user from group (admin) |
| `/api/groups/:id/members/:userId/role` | PATCH | `{ "role" }` | Change member role (admin) |

### Resource Management
| Endpoint | Method | Request Body | Notes |
|---|---|---|---|
| `/api/resources` | POST | `{ "title", "description", "link", "groupId" }` | Add resource |
| `/api/resources/group/:groupId` | GET | _None_ | List resources (supports `?page=1&limit=20&q=search`) |
| `/api/resources/:id` | GET | _None_ | View resource (increments view count) |
| `/api/resources/:id` | PUT | `{ "title", "description", "link" }` | Update resource |
| `/api/resources/:id` | DELETE | _None_ | Delete resource |
| `/api/resources/:id/admin` | DELETE | _None_ | Admin delete resource |

### Session Management
| Endpoint | Method | Request Body | Notes |
|---|---|---|---|
| `/api/sessions/create` | POST | `{ "userId", "userAgent", "ip", "meetingLink" }` | Create session |
| `/api/sessions/join` | POST | `{ "sessionId" }` | Join session (tracks attendance) |
| `/api/sessions/leave` | POST | `{ "sessionId" }` | Leave session (tracks attendance) |
| `/api/sessions/end` | POST | `{ "sessionId" }` | End session |
| `/api/sessions/validate` | POST | `{ "sessionId" }` | Validate session |
| `/api/sessions/update-meeting-link` | POST | `{ "sessionId", "meetingLink" }` | Update meeting link |
| `/api/sessions/list` | GET | _None_ | List sessions (supports `?userId=...`) |

### Activity Log & Analytics (Admin)
| Endpoint | Method | Request Body | Notes |
|---|---|---|---|
| `/api/activity-logs` | GET | _None_ | Get activity logs (supports `?page=1&limit=30&userId=...&actionType=...`) |
| `/api/resource-analytics` | GET | _None_ | Get resource analytics |
| `/api/analytics` | GET | _None_ | Get general analytics |

### Planned Features
- `/api/chat` — Group chat, messaging
- `/api/reports` — User/content reporting

---

## Group Creation Policy

To avoid duplicate groups, each group is uniquely identified by the combination of **Grade + Subject + Topic**. Attempting to create a group with the same combination will result in an error. This ensures clarity and prevents fragmentation.

**Example:**
- Grade: 10
- Subject: Mathematics
- Topic: Algebra

Only one group can exist for this combination.

---



## Data Models

- **User**: name, email, passwordHash, role, status, skills, reputation, profile (bio, avatar, country, region)
- **LearningGroup**: grade, subject, topic, description, createdBy, members, maxMembers, groupType, status, whatsappLink
- **Resource**: title, description, link, groupId, uploadedBy, viewCount, createdAt
- **Session**: userId, status, attendees, meetingLink, startTime, endTime
- **ActivityLog**: user, action, details, timestamp
- **ChatMessage** (planned): group, sender, message, timestamp
- **Report** (planned): reporter, reportedUser, reason, status

---


## Activity Logging

All sensitive/admin actions are logged in `ActivityLog` for auditability:
- User profile updates
- Role/status changes
- Password resets (admin)
- Group admin actions (update, delete, member removal)
- Resource creation, updates, and deletions
- Session lifecycle events (create, join, leave, end)

---

## Analytics

Admin endpoint `/api/analytics` provides:
- User stats (total, active, banned, suspended, by role)
- Recent activity logs
- Resource analytics (views, uploads)

---

## Project Structure

```
backend/
├── app.js                 # Express app configuration
├── server.js              # Server entry point
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── userController.js
│   ├── learningGroupController.js
│   ├── resourceController.js
│   ├── sessionController.js
│   ├── activityLogController.js
│   └── analyticsController.js
├── middleware/            # Auth, validation, etc.
│   └── auth.js
├── models/                # Mongoose schemas
│   ├── User.js
│   ├── LearningGroup.js
│   ├── Resource.js
│   ├── Session.js
│   └── ActivityLog.js
├── routes/                # API route definitions
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── learningGroupRoutes.js
│   ├── resourceRoutes.js
│   ├── sessionRoutes.js
│   ├── activityLogRoutes.js
│   └── analyticsRoutes.js
├── services/              # Business logic, external services
│   └── mailService.js
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

---

## Contributing

We welcome contributions from everyone! To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and submit a pull request
5. For major changes, please open an issue first to discuss what you would like to change

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md) and ensure your code is well-documented and tested.

## License

This project is licensed under the [MIT License](LICENSE).

---
**Open Source. Built for disaster relief, education, and community.**
