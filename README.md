# MERN Task Manager Backend

Backend API for the MERN Task Management Application built with Node.js, Express, MongoDB Atlas, and JWT Authentication.

## Features

* User Registration
* User Login
* JWT Authentication
* Create Tasks
* Update Tasks
* Delete Tasks
* MongoDB Atlas Integration
* RESTful API

## Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT (JSON Web Token)
* bcryptjs

## Project Structure

```text
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── server.js
├── package.json
└── .env
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/taskmanager-backend.git
cd taskmanager-backend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173
```

### Run Development Server

```bash
npm run dev
```

### Run Production Server

```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register User |
| POST   | /api/auth/login    | Login User    |

### Tasks

| Method | Endpoint       | Description   |
| ------ | -------------- | ------------- |
| GET    | /api/tasks     | Get All Tasks |
| POST   | /api/tasks     | Create Task   |
| PUT    | /api/tasks/:id | Update Task   |
| DELETE | /api/tasks/:id | Delete Task   |

## Deployment

### Backend

* Render

### Database

* MongoDB Atlas

## Author

**Akhila Malekar**

B.Tech CSE Student
G Pulla Reddy Engineering College, Kurnool
