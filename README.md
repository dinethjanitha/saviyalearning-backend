
# Peer-to-Peer Education System Backend

> This project is **open source** and welcomes contributions! See [License](#license) and [Contribution Guidelines](#contributing).

## Overview

This backend powers a peer-to-peer education platform for disaster relief and community learning. It is designed for rapid deployment, scalability, and extensibility, using only open-source technologies.


## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Activity Logging](#activity-logging)
- [Analytics](#analytics)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Key Features

- **User Management:**
  - User registration, login, JWT authentication (access/refresh tokens)
  - Email verification, welcome email, password reset (Nodemailer)
  - User profile management (view/update)
  - Admin User Management System (UMS):
    - List/search users
    - Get/update/delete user
    - Change user role (user/admin/superadmin)
    - Ban/suspend/reactivate user
    - Admin password reset for users

- **Learning Groups:**
  - Create, join, leave, search groups (unique by Grade + Subject + Topic)
  - Group membership management
  - Group creation policy to avoid duplicates
  - Admin group management (update, delete, archive, remove members)

- **Resource Management:**
  - Add Google Drive/shared links as group resources
  - List resources for a group with pagination and search/filtering
  - View resource (increments view count)
  - Update/delete resource (by uploader or admin)
  - Admin-only delete endpoint

- **Session Management:**
  - Create, join, leave, and end sessions
  - Track attendance with timestamps
  - Update meeting links dynamically
  - Session validation

- **Activity Logging & Analytics:**
  - Auditable actions (resource and group actions)
  - Analytics endpoint for admin dashboard
  - Activity Log API for admin/audit UI (pagination, filtering)

- **Infrastructure:**
  - Modular structure for future features (chat, reporting)
  - Environment config via `.env`
  - **Open source**: MIT License, contributions welcome


## Architecture

- **Node.js + Express.js**: REST API backend
- **MongoDB (Mongoose ODM)**: Database
- **JWT**: Authentication (access/refresh tokens)
- **Nodemailer**: Email notifications
- **MVC structure**: Modular, extensible codebase
- **ActivityLog**: Auditable user/admin actions
- **Analytics**: Admin dashboard stats

### High-Level Diagram

```
Client (Next.js, Web, Mobile)
   |
   |  REST API (HTTPS)
   v
Express.js (Node.js)
   |
   |-- Controllers (auth, user, admin, analytics, ...)
   |-- Middleware (auth, admin, logging)
   |-- Models (User, Group, Resource, Session, ...)
   |-- Services (mail, ...)
   v
MongoDB (Mongoose)
```


## Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/dinethjanitha/saviyalearning-backend


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
