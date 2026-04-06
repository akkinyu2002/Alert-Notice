
# Alert-Notice

A comprehensive emergency and blood request alert system built with modern web technologies. This full-stack application enables emergency services and hospitals to broadcast critical alerts and blood donation requests to users.

## Features

- 🚨 **Emergency Alert System** - Send and manage critical emergency alerts
- 🩸 **Blood Request Management** - Post and track blood donation requests
- 🗺️ **Location-Based Services** - Powered by Leaflet maps for geographic alerts
- 👥 **Role-Based Access Control** - Different user roles (Admin, Hospital, User)
- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- ⚡ **Rate Limiting** - API protection with configurable rate limiting
- 📱 **Responsive UI** - Modern React-based frontend with Tailwind CSS
- 🔒 **Security First** - Helmet.js for HTTP security headers

## Tech Stack

### Frontend
- **React** (19.2.4) - UI library
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** (7.13.2) - Client-side routing
- **Leaflet** (1.9.4) - Interactive maps
- **React-Leaflet** (5.0.0) - React wrapper for Leaflet
- **Axios** (1.14.0) - HTTP client
- **Iconify** - SVG icon library

### Backend
- **Express.js** (4.21.2) - Web framework
- **Node.js** - Runtime environment
- **SQLite** (better-sqlite3) - Lightweight database
- **JWT** - JSON Web Tokens for authentication
- **Bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting middleware
- **Dotenv** - Environment variable management

## Project Structure
Alert-Notice/ 
├── client/ # React frontend application │ 
├── src/ # Source files │ 
├── public/ # Static assets │ 
├── package.json # Client dependencies │ 
├── vite.config.js # Vite configuration │ 
├── tailwind.config.js # Tailwind CSS configuration │ 
└── index.html # HTML entry point │ 
├── server/ # Express backend application │ 
├── src/ # Source files (routes, controllers, middleware) │ 
├── db/ # Database initialization and schema │ 
├── package.json # Server dependencies │ 
├── server.js # Entry point │ 
└── db/init.js # Database initialization script │ 
├── .env.example # Environment variables template 
└── .gitignore 
# Git ignore rules
