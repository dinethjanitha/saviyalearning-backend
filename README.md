
# Peer-to-Peer Education System Backend

> This project is **open source** and welcomes contributions! See [License](#license) and [Contribution Guidelines](#contributing).

## Overview

This backend powers a peer-to-peer education platform for disaster relief and community learning. It is designed for rapid deployment, scalability, and extensibility, using only open-source technologies.


## Key Features

- User registration, login, JWT authentication (access/refresh tokens)
- Email verification, welcome email, password reset (Nodemailer)
- User profile management (view/update)
- **Learning Groups:**
   - Create, join, leave, search groups (unique by Grade + Subject + Topic)
   - Group membership management
   - Group creation policy to avoid duplicates
- **Resource Management:**
   - Add Google Drive/shared links as group resources
   - List resources for a group with pagination and search/filtering
   - View resource (increments view count)
   - Update/delete resource (by uploader or admin)
   - Admin-only delete endpoint
- **Admin User Management System (UMS):**
   - List/search users
   - Get/update/delete user
   - Change user role (user/admin/superadmin)
   - Ban/suspend/reactivate user
   - Admin password reset for users
- **Activity logging** (auditable actions, resource and group actions)
- **Analytics endpoint** for admin dashboard
- **Activity Log API** for admin/audit UI (pagination, filtering)
- Modular structure for future features (sessions, chat, reporting)
- Environment config via `.env`
- **Open source**: MIT License, contributions welcome

## API Overview

All endpoints require JWT authentication unless otherwise noted. Admin endpoints require admin role.

### Resource Management
- `POST   /api/resources` — Add a resource (Google Drive/shared link) to a group
- `GET    /api/resources/group/:groupId?page=1&limit=20&q=search` — List resources for a group (pagination, search)
- `GET    /api/resources/:id` — View a resource (increments views count)
- `PUT    /api/resources/:id` — Update a resource (uploader or admin)
- `DELETE /api/resources/:id` — Delete a resource (uploader or admin)
- `DELETE /api/resources/:id/admin` — Admin-only delete

### Session Management
Session management tracks online class/meeting sessions, attendance, and meeting links.

- `POST   /api/sessions/create` — Create a session
   - Body: `{ userId, userAgent?, ip?, meetingLink? }`
- `POST   /api/sessions/join` — Join a session (attendance)
   - Body: `{ sessionId }`
- `POST   /api/sessions/leave` — Leave a session (attendance)
   - Body: `{ sessionId }`
- `POST   /api/sessions/end` — End a session (logout/complete)
   - Body: `{ sessionId }`
- `POST   /api/sessions/update-meeting-link` — Update the meeting link for a session
   - Body: `{ sessionId, meetingLink }`
- `POST   /api/sessions/validate` — Validate if a session is active
   - Body: `{ sessionId }`
- `GET    /api/sessions/list?userId=...` — List sessions for a user (admin or self)

**Attendance:**
   - Join/leave endpoints update the `attendees` array with `joinedAt`/`leftAt` timestamps.
   - All session actions are logged in `ActivityLog` for auditing.

### Activity Log
- `GET /api/activity-logs?page=1&limit=30&userId=...&actionType=...&q=resourceId` — List activity logs (admin only, pagination, filtering)

### User Management
- `POST   /api/auth/signup` — Register
- `POST   /api/auth/login` — Login
- `POST   /api/auth/refresh` — Refresh token
- `POST   /api/auth/logout` — Logout
- `POST   /api/auth/forgot-password` — Request password reset
- `POST   /api/auth/reset-password` — Reset password
- `POST   /api/auth/verify-email` — Verify email
- `GET    /api/users/me` — Get my profile
- `PUT    /api/users/me` — Update my profile

### Admin UMS (requires admin/superadmin)
- `GET    /api/users` — List/search users
- `GET    /api/users/:id` — Get user by ID
- `PUT    /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user
- `PATCH  /api/users/:id/role` — Change user role
- `PATCH  /api/users/:id/status` — Ban/suspend/reactivate user
- `POST   /api/users/:id/reset-password` — Admin reset user password

### Learning Groups
- `POST   /api/groups` — Create group (auth required, unique by Grade+Subject+Topic)
- `POST   /api/groups/:id/join` — Join group (auth required)
- `POST   /api/groups/:id/leave` — Leave group (auth required)
- `GET    /api/groups/search` — Search groups (by grade, subject, topic, or query)
- `GET    /api/groups/:id` — Get group details
- `GET    /api/groups/my` — List my groups (auth required)

### Learning Group Admin (admin only)
- `GET    /api/groups` — List/search all groups (filters, pagination)
- `PUT    /api/groups/:id` — Update group info (grade, subject, topic, description, status, etc.)
- `DELETE /api/groups/:id` — Delete or archive group (`?archive=true` to archive)
- `DELETE /api/groups/:id/members/:userId` — Remove/ban user from group
- `PATCH  /api/groups/:id/members/:userId/role` — Change member role in group

### Analytics (admin)
- `GET /api/analytics` — User stats, recent activities

### (Planned) Future Endpoints
- `/api/resources` — Resource catalog, requests
- `/api/sessions` — Peer-to-peer sessions (Google Meet, WhatsApp integration)
- `/api/chat` — Group chat, messaging
- `/api/reports` — User/content reporting


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

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SMTP_USER=your_email_address
SMTP_PASS=your_email_password
EMAIL_FROM=your_email_from_name
CLIENT_URL=your_frontend_url
```




# API Endpoints

All endpoints require JWT authentication unless otherwise noted. Admin endpoints require admin role.

## Auth & User
- `POST   /api/auth/signup` — Register a new user
- `POST   /api/auth/login` — Login and receive JWT tokens
- `POST   /api/auth/refresh` — Refresh access token
- `POST   /api/auth/logout` — Logout
- `POST   /api/auth/forgot-password` — Request password reset email
- `POST   /api/auth/reset-password` — Reset password
- `POST   /api/auth/verify-email` — Verify email address
- `GET    /api/users/me` — Get current user's profile
- `PUT    /api/users/me` — Update current user's profile

## Admin User Management (UMS)
- `GET    /api/users` — List/search users
- `GET    /api/users/:id` — Get user by ID
- `PUT    /api/users/:id` — Update user by ID
- `DELETE /api/users/:id` — Delete user by ID
- `PATCH  /api/users/:id/role` — Change user role
- `PATCH  /api/users/:id/status` — Ban/suspend/reactivate user
- `POST   /api/users/:id/reset-password` — Admin reset user password

## Learning Groups
- `POST   /api/groups` — Create group (unique by Grade+Subject+Topic)
- `POST   /api/groups/:id/join` — Join group
- `POST   /api/groups/:id/leave` — Leave group
- `GET    /api/groups/search` — Search groups (by grade, subject, topic, or query)
- `GET    /api/groups/:id` — Get group details
- `GET    /api/groups/my` — List my groups

## Learning Group Admin (admin only)
- `GET    /api/groups` — List/search all groups (filters, pagination)
- `PUT    /api/groups/:id` — Update group info
- `DELETE /api/groups/:id` — Delete or archive group (`?archive=true`)
- `DELETE /api/groups/:id/members/:userId` — Remove/ban user from group
- `PATCH  /api/groups/:id/members/:userId/role` — Change member role in group

## Resource Management
- `POST   /api/resources` — Add a resource (Google Drive/shared link) to a group
- `GET    /api/resources/group/:groupId?page=1&limit=20&q=search` — List resources for a group (pagination, search)
- `GET    /api/resources/:id` — View a resource (increments views count)
- `PUT    /api/resources/:id` — Update a resource (uploader or admin)
- `DELETE /api/resources/:id` — Delete a resource (uploader or admin)
- `DELETE /api/resources/:id/admin` — Admin-only delete

## Session Management
Session management tracks online class/meeting sessions, attendance, and meeting links.

- `POST   /api/sessions/create` — Create a session
   - Body: `{ userId, userAgent?, ip?, meetingLink? }`
- `POST   /api/sessions/join` — Join a session (attendance)
   - Body: `{ sessionId }`
- `POST   /api/sessions/leave` — Leave a session (attendance)
   - Body: `{ sessionId }`
- `POST   /api/sessions/end` — End a session (logout/complete)
   - Body: `{ sessionId }`
- `POST   /api/sessions/update-meeting-link` — Update the meeting link for a session
   - Body: `{ sessionId, meetingLink }`
- `POST   /api/sessions/validate` — Validate if a session is active
   - Body: `{ sessionId }`
- `GET    /api/sessions/list?userId=...` — List sessions for a user (admin or self)

**Attendance:**
   - Join/leave endpoints update the `attendees` array with `joinedAt`/`leftAt` timestamps.
   - All session actions are logged in `ActivityLog` for auditing.

## Activity Log
- `GET /api/activity-logs?page=1&limit=30&userId=...&actionType=...&q=resourceId` — List activity logs (admin only, pagination, filtering)

## Analytics (admin)
- `GET /api/analytics` — User stats, recent activities

## (Planned) Future Endpoints
- `/api/resources` — Resource catalog, requests
- `/api/sessions` — Peer-to-peer sessions (Google Meet, WhatsApp integration)
- `/api/chat` — Group chat, messaging
- `/api/reports` — User/content reporting

## Group Creation Policy

To avoid duplicate groups, each group is uniquely identified by the combination of **Grade + Subject + Topic**. Attempting to create a group with the same combination will result in an error. This ensures clarity and prevents fragmentation.

**Example:**
- Grade: 10
- Subject: Mathematics
- Topic: Algebra

Only one group can exist for this combination.



## Data Models

- **User**: name, email, passwordHash, role, status, skills, reputation, etc.
- **LearningGroup**: grade, subject, topic, description, createdBy, createdAt, members, maxMembers, groupType, status, whatsappLink, resourceGroups, resources, sessions, chatMessages
- **ResourceGroup**: subject, resources, etc.
- **Resource**: title, type, link, etc.
- **Session**: group, participants, schedule, etc.
- **ResourceRequest**: user, resource, status, etc.
- **ChatMessage**: group, sender, message, timestamp
- **Report**: reporter, reportedUser, reason, status
- **ActivityLog**: user, action, details, timestamp


## Activity Logging

All sensitive/admin actions (profile update, role/status change, password reset, group admin actions, etc.) are logged in `ActivityLog` for auditability.

## Analytics

Admin endpoint `/api/analytics` provides:
- User stats (total, active, banned, suspended, by role)
- Recent activity logs

## Project Structure

```
backend/
   src/
      app.js
      server.js
      controllers/
      middleware/
      models/
      routes/
      services/
   .env.example
   README.md
```

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
