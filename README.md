# 🗂️ Task Manager

> A full-stack task management application built to learn and demonstrate **Next.js 16 App Router**, **Auth.js v5**, **Google OAuth**, **JWT sessions**, **MongoDB**, **role-based authorization**, **session invalidation**, password recovery, and an **Admin Panel**.

---

## 📌 Project Overview

I built this project as a hands-on learning project while learning authentication and full-stack development with Next.js.

Instead of building only small authentication examples, I wanted to understand how the different pieces work together inside a real application.

The project includes:

- Email/password authentication with **bcrypt**
- **Google OAuth** using Auth.js
- **JWT-based sessions**
- Custom user roles with **USER** and **ADMIN**
- Server-side route protection
- Role-based authorization
- **Session invalidation after password reset**
- Secure forgot-password and reset-password flow
- Cryptographically secure password reset tokens
- Email delivery using **Nodemailer + Gmail SMTP**
- User-owned task management
- Full Admin Panel for platform-wide management
- Zod validation for API input
- MongoDB with Mongoose

The project was built with a focus on understanding **why** each security and architectural decision is made, not simply copying authentication code.

---

## ✨ Features

### 🔐 Authentication

- Email/password registration
- Password hashing with bcrypt
- Credentials login with Auth.js
- Google OAuth login
- JWT-based sessions
- Secure logout
- Protected server-side pages
- Protected API routes
- Custom user roles
- Session versioning
- Session invalidation after password reset

### 🔑 Authorization

- `USER` and `ADMIN` roles
- Server-side role verification
- `requireUser()` authentication helper
- `requireAdmin()` authorization helper
- `401 Unauthorized` for unauthenticated requests
- `403 Forbidden` for authenticated users without sufficient permissions
- User task ownership enforced by the server

### 🔄 Password Recovery

- Forgot-password form
- Time-limited password reset links
- Cryptographically random reset tokens
- SHA-256 token hashing before database storage
- 15-minute token expiration
- MongoDB TTL index for automatic cleanup
- Single-use reset tokens
- Session invalidation after password reset
- Email delivery through Nodemailer and Gmail App Password

### ✅ User Task Management

- Create tasks
- Edit tasks
- Delete tasks
- Update task status
- Update task priority
- Search tasks
- Filter tasks by status
- Toggle completed/incomplete state
- Personal task statistics
- Users can only access their own tasks

### 🛡️ Admin Panel

Admins have access to platform-wide management features:

- Dashboard overview
- Total users and task statistics
- Task completion metrics
- User search
- User role management
- User deletion
- Cascading task deletion when a user is deleted
- View tasks from all users
- Search and filter platform-wide tasks
- Update any task
- Delete any task

---

# 🛠️ Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Framework        | Next.js 16              |
| Language         | TypeScript              |
| Routing          | Next.js App Router      |
| Styling          | Tailwind CSS v4         |
| Authentication   | Auth.js v5              |
| OAuth            | Google OAuth            |
| Database         | MongoDB                 |
| ODM              | Mongoose                |
| Auth Adapter     | `@auth/mongodb-adapter` |
| Validation       | Zod                     |
| Password Hashing | bcrypt                  |
| Email            | Nodemailer + Gmail SMTP |
| Cryptography     | Node.js `crypto`        |
| Session          | JWT                     |

---

# 🏗️ Architecture

The application follows a simple server-first architecture:

```text
Browser
   │
   ▼
Next.js App Router
   │
   ├── Server Components
   │      │
   │      └── auth() → authentication check
   │
   └── Route Handlers
          │
          ├── Auth.js
          │     └── Credentials / Google OAuth
          │
          ├── requireUser()
          │     └── Authentication
          │
          ├── requireAdmin()
          │     └── Role authorization
          │
          ├── Zod
          │     └── Input validation
          │
          └── Mongoose
                │
                ▼
             MongoDB
```

The browser is never trusted with ownership or authorization decisions.

For example, when creating a task, the server gets the authenticated user from the session:

```ts
const user = await requireUser();

await Task.create({
  ...data,
  userId: user._id,
});
```

The client does not decide which user owns the task.

---

# 🔐 Authentication Flow

The project supports both credentials authentication and Google OAuth.

```text
                    ┌───────────────────┐
                    │      Login        │
                    └─────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
        Email / Password              Google OAuth
                 │                         │
                 ▼                         ▼
          Auth.js Credentials       Google Provider
                 │                         │
                 ▼                         │
          bcrypt.compare()                │
                 │                         │
                 └────────────┬────────────┘
                              ▼
                         Auth.js JWT
                              │
                              ▼
                ┌─────────────────────────┐
                │ id                      │
                │ role                    │
                │ sessionVersion          │
                └────────────┬────────────┘
                             │
                             ▼
                    Authenticated Session
```

The session can then be accessed securely on the server using:

```ts
const session = await auth();
```

---

# 🔒 Session Invalidation

JWT sessions are normally self-contained. Once issued, a token can remain valid until it expires unless an additional revocation mechanism is implemented.

This project uses a **session versioning pattern**.

## How it works

The `User` model contains:

```ts
sessionVersion: number;
```

New users start with:

```text
sessionVersion = 0
```

The value is also stored in the JWT.

```text
Database User
sessionVersion = 0

        +

JWT
sessionVersion = 0

        ↓

Versions match
        ↓

Session remains valid
```

When the user resets their password:

```ts
user.password = hashedPassword;
user.sessionVersion = (user.sessionVersion ?? 0) + 1;

await user.save();
```

The database now contains:

```text
sessionVersion = 1
```

while previously issued JWTs still contain:

```text
sessionVersion = 0
```

During subsequent JWT/session processing, the application compares the two values.

```text
JWT version:      0
Database version: 1

        ↓

Mismatch
        ↓

Existing session rejected
        ↓

User must log in again
```

This invalidates existing sessions across browsers and devices when the password is reset.

---

# 🔑 Role-Based Authorization

The application has two roles:

```text
USER
ADMIN
```

Authentication and authorization are handled separately.

### Authentication

```ts
const user = await requireUser();
```

If no valid session exists:

```text
401 Unauthorized
```

### Authorization

```ts
const user = await requireAdmin();
```

If the user is authenticated but is not an administrator:

```text
403 Forbidden
```

This distinction is important:

```text
No valid session
      ↓
401 Unauthorized


Valid session
      ↓
Insufficient permissions
      ↓
403 Forbidden
```

Authorization is enforced on the server, not just by hiding buttons in the UI.

---

# 🛡️ Task Ownership

One of the main security concepts demonstrated by this project is **server-side ownership enforcement**.

An insecure API might trust this:

```json
{
  "userId": "another-user-id",
  "title": "My Task"
}
```

That would allow a malicious client to attempt to create or manipulate data belonging to another user.

Instead, this application gets the authenticated user from the server-side session:

```ts
const user = await requireUser();

await Task.create({
  title,
  description,
  userId: user._id,
});
```

For updates and deletes, the user ID is also included in the database query:

```ts
await Task.findOneAndDelete({
  _id: taskId,
  userId: user._id,
});
```

Therefore, knowing another user's task ID is not enough to access their task.

---

# 🔄 Password Reset Flow

The password recovery system follows this process:

```text
User enters email
        │
        ▼
Forgot-password API
        │
        ▼
Generate cryptographically secure token
        │
        ▼
Hash token with SHA-256
        │
        ▼
Store hash in MongoDB
        │
        ├── 15-minute expiration
        └── TTL index
        │
        ▼
Send raw token through email
        │
        ▼
User opens reset link
        │
        ▼
Reset-password API
        │
        ▼
Hash received token
        │
        ▼
Compare with database
        │
        ▼
Validate expiration
        │
        ▼
Hash new password with bcrypt
        │
        ▼
Increment sessionVersion
        │
        ▼
Delete reset token
```

The raw reset token is never stored in MongoDB.

Only its SHA-256 hash is stored.

---

# 🔐 Password Security

Passwords are never stored as plain text.

During registration:

```ts
const hashedPassword = await bcrypt.hash(password, 12);
```

The database stores the resulting bcrypt hash.

During login:

```ts
const passwordMatches = await bcrypt.compare(password, user.password);
```

This means the original password does not need to be stored in the database.

---

# 📧 Email Delivery

Password reset emails are sent using:

```text
Nodemailer
     │
     ▼
Gmail SMTP
     │
     ▼
Gmail App Password
```

The real Gmail password is never used by the application.

Environment variables are used for the credentials:

```env
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

---

# 🧠 Account Enumeration Prevention

The forgot-password endpoint returns the same generic response whether or not the email exists.

For example:

```text
If an account exists for this email,
a password reset link has been sent.
```

This prevents attackers from easily using the endpoint to discover which email addresses have registered accounts.

---

# 📁 Project Structure

```text
src/
│
├── app/
│   ├── admin/
│   │   └── page.tsx
│   │
│   ├── api/
│   │   ├── admin/
│   │   │   ├── stats/
│   │   │   │   └── route.ts
│   │   │   ├── users/
│   │   │   │   └── route.ts
│   │   │   └── tasks/
│   │   │       └── route.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts
│   │   │   ├── forgot-password/
│   │   │   │   └── route.ts
│   │   │   └── reset-password/
│   │   │       └── route.ts
│   │   │
│   │   ├── me/
│   │   │   └── route.ts
│   │   │
│   │   ├── register/
│   │   │   └── route.ts
│   │   │
│   │   └── tasks/
│   │       └── route.ts
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── forgot-password/
│   │   └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── register/
│   │   └── page.tsx
│   │
│   ├── reset-password/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── AdminPanel.tsx
│   ├── TaskManager.tsx
│   ├── AuthCard.tsx
│   └── LogoutButton.tsx
│
├── lib/
│   ├── auth-helpers.ts
│   ├── mailer.ts
│   ├── mongodb-client.ts
│   ├── mongodb.ts
│   └── password-reset.ts
│
├── models/
│   ├── User.ts
│   ├── Task.ts
│   └── PasswordResetToken.ts
│
├── types/
│   └── next-auth.d.ts
│
└── auth.ts
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd task-manager
```

## 2. Install dependencies

```bash
npm install
```

## 3. Set up MongoDB

Create a MongoDB database using MongoDB Atlas or a local MongoDB instance.

Your connection string will look similar to:

```text
mongodb+srv://username:password@cluster.mongodb.net/task-manager
```

## 4. Configure Google OAuth

Create an OAuth 2.0 Client ID in Google Cloud Console.

Add this authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

You will need:

```text
Google Client ID
Google Client Secret
```

## 5. Configure Gmail

For password reset emails:

1. Enable 2-Step Verification on your Google account.
2. Create a Google App Password.
3. Use the generated App Password in the application.
4. Do not use your normal Gmail password.

## 6. Create `.env.local`

Create a file named:

```text
.env.local
```

in the project root.

```env
MONGODB_URI=your_mongodb_connection_string

AUTH_SECRET=your_random_secret

AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate an Auth.js secret with:

```bash
openssl rand -base64 32
```

Never commit `.env.local` to Git.

---

## 7. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 👤 Creating an Admin User

New users are created with:

```text
role = USER
```

To create an administrator for development:

1. Register normally.
2. Open MongoDB Atlas or MongoDB Compass.
3. Find the user document.
4. Change:

```json
{
  "role": "USER"
}
```

to:

```json
{
  "role": "ADMIN"
}
```

5. Log in again.

The application will recognize the user's `ADMIN` role and route the user to the Admin Panel.

---

# 📡 API Reference

## Public Endpoints

| Method | Endpoint                    | Description                                     |
| ------ | --------------------------- | ----------------------------------------------- |
| `POST` | `/api/register`             | Register a new user                             |
| `POST` | `/api/auth/forgot-password` | Request password reset                          |
| `POST` | `/api/auth/reset-password`  | Reset password and invalidate existing sessions |

## Authenticated Endpoints

| Method   | Endpoint         | Description              |
| -------- | ---------------- | ------------------------ |
| `GET`    | `/api/me`        | Get current user         |
| `GET`    | `/api/tasks`     | Get current user's tasks |
| `POST`   | `/api/tasks`     | Create a task            |
| `PATCH`  | `/api/tasks?id=` | Update an owned task     |
| `DELETE` | `/api/tasks?id=` | Delete an owned task     |

## Admin Endpoints

| Method   | Endpoint               | Description             |
| -------- | ---------------------- | ----------------------- |
| `GET`    | `/api/admin/stats`     | Get platform statistics |
| `GET`    | `/api/admin/users`     | Get all users           |
| `PATCH`  | `/api/admin/users?id=` | Change user role        |
| `DELETE` | `/api/admin/users?id=` | Delete a user           |
| `GET`    | `/api/admin/tasks`     | Get all platform tasks  |
| `PATCH`  | `/api/admin/tasks?id=` | Update any task         |
| `DELETE` | `/api/admin/tasks?id=` | Delete any task         |

---

# 📊 HTTP Status Codes

The API uses standard HTTP status codes.

| Status | Meaning                              |
| ------ | ------------------------------------ |
| `200`  | Request successful                   |
| `201`  | Resource created                     |
| `400`  | Invalid request / validation failure |
| `401`  | No valid authentication              |
| `403`  | Authenticated but not authorized     |
| `404`  | Resource not found                   |
| `409`  | Resource conflict                    |
| `500`  | Server error                         |

---

# 🧠 Step-by-Step Learning Path

The project was intentionally developed in stages.

| Step | Concept                          | Main Files                      |
| ---- | -------------------------------- | ------------------------------- |
| 1    | Next.js App Router setup         | `src/app/`                      |
| 2    | MongoDB connection with Mongoose | `src/lib/mongodb.ts`            |
| 3    | User model                       | `src/models/User.ts`            |
| 4    | Registration API                 | `src/app/api/register/route.ts` |
| 5    | Zod validation                   | Registration and task APIs      |
| 6    | Auth.js Credentials Provider     | `src/auth.ts`                   |
| 7    | JWT sessions                     | `src/auth.ts`                   |
| 8    | Custom JWT/session types         | `src/types/next-auth.d.ts`      |
| 9    | Google OAuth                     | `src/auth.ts`                   |
| 10   | MongoDB Adapter                  | `src/lib/mongodb-client.ts`     |
| 11   | Protected server pages           | `auth()`                        |
| 12   | Authentication helpers           | `src/lib/auth-helpers.ts`       |
| 13   | Role-based authorization         | `requireAdmin()`                |
| 14   | `401` vs `403` handling          | Protected API routes            |
| 15   | Password reset tokens            | `src/lib/password-reset.ts`     |
| 16   | Password reset email delivery    | `src/lib/mailer.ts`             |
| 17   | Password reset API               | `reset-password/route.ts`       |
| 18   | Session invalidation             | `sessionVersion`                |
| 19   | Task model                       | `src/models/Task.ts`            |
| 20   | Task CRUD API                    | `src/app/api/tasks/route.ts`    |
| 21   | Server-side task ownership       | `userId` from session           |
| 22   | User task dashboard              | `TaskManager.tsx`               |
| 23   | Admin APIs                       | `src/app/api/admin/`            |
| 24   | Admin Panel                      | `AdminPanel.tsx`                |
| 25   | Role-based routing               | `/admin` and `/dashboard`       |

---

# 💡 Important Concepts Learned

## 1. Authentication vs Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> What is this user allowed to do?

The project implements both separately.

---

## 2. UI Protection Is Not Enough

Hiding an admin button does not provide security.

A malicious user can still manually call an API.

Therefore, authorization is checked inside the server-side API:

```ts
const user = await requireAdmin();
```

---

## 3. Never Trust Client Ownership Data

The client should not be able to decide:

```text
"This task belongs to user X."
```

Instead:

```text
Verified session
      ↓
Current user
      ↓
Database query
      ↓
Owned resource
```

---

## 4. JWT Session Versioning

JWTs are useful because they can contain user information without storing the complete session state in the database.

However, sensitive events such as password resets may require existing sessions to be revoked.

The `sessionVersion` pattern provides a simple server-controlled revocation mechanism.

---

## 5. Password Reset Tokens Should Not Be Stored Plainly

The email contains the raw reset token.

MongoDB stores only:

```text
SHA-256(rawToken)
```

If the database is exposed, the attacker does not directly receive valid reset URLs from the token collection.

---

## 6. Generic Forgot-Password Responses

The API does not reveal whether an email exists.

Instead of:

```text
Email does not exist
```

or:

```text
Reset email sent
```

the endpoint always returns a generic response.

This reduces account enumeration risk.

---

# 🔐 Security Practices Demonstrated

- bcrypt password hashing
- Passwords never stored as plain text
- Cryptographically random password reset tokens
- SHA-256 token hashing
- Time-limited password reset tokens
- MongoDB TTL index
- Single-use reset tokens
- Session invalidation using `sessionVersion`
- Server-side authentication checks
- Server-side role authorization
- Server-side task ownership enforcement
- Generic forgot-password responses
- Zod input validation
- Environment variables for secrets
- HTTP status code separation between authentication and authorization

---

# 🚧 Potential Improvements

The project is intentionally focused on learning the core concepts. Possible future improvements include:

- [ ] Rate limiting for authentication endpoints
- [ ] Email verification during registration
- [ ] Account linking management
- [ ] Task due dates
- [ ] Task reminders
- [ ] Task categories and labels
- [ ] Pagination for large admin tables
- [ ] More advanced session management
- [ ] Production deployment
- [ ] Automated testing
- [ ] CI/CD pipeline
- [ ] Redis-based rate limiting

---

# 🎯 Learning Outcome

This project helped me move beyond basic authentication tutorials and understand how authentication works as part of a complete full-stack application.

Key areas practiced:

- Next.js App Router
- Server Components
- Route Handlers
- Auth.js
- Credentials authentication
- Google OAuth
- JWT sessions
- Session invalidation
- Role-based authorization
- MongoDB and Mongoose
- Password hashing
- Password recovery
- Secure token handling
- API security
- Server-side ownership
- Zod validation
- Full-stack CRUD
- Admin functionality

The project is also structured as a learning reference, with the README explaining the main concepts, architecture, security patterns, API endpoints, and setup process.

---

# 👤 Author

**Hasaranga Samarakoon**

Built as a hands-on learning project while studying **Next.js, Auth.js, Google OAuth, JWT authentication, and full-stack application security**.

The goal was to turn what I learned from documentation and practice into a complete working application.

---
