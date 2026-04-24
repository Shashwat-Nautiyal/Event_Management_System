# 🎪 CampusEvents — Campus Event Management & Ticketing System

A centralized platform for campus event management where students can discover events, register, and obtain digital tickets with QR codes. Organizers can create events, manage participants, and scan QR codes for check-in. Admins can approve events, manage users, and view analytics. 

## ✨ Features

### 👨‍🎓 Student Features
- Browse upcoming campus events with search & category filters
- View detailed event information (venue, timing, capacity)
- Register for events with one click
- Digital tickets with QR codes
- View past and upcoming registrations
- Receive event notifications

### 📋 Organizer Features
- Create and publish events with banner images
- Set participant limits and event details
- View participant lists with CSV export
- QR code scanner for event check-in
- Send notifications to registered participants

### 👑 Admin Features
- Approve or reject event submissions
- Monitor system stats (users, events, registrations)
- Manage event categories (CRUD with icons & colors)
- Manage users and change roles
- View reports and analytics

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router v7 |
| **Styling** | Vanilla CSS with CSS Variables, Glassmorphism design |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Auth** | JWT (Access + Refresh tokens), bcryptjs |
| **QR Codes** | qrcode (server), qrcode.react (client), html5-qrcode (scanner) |
| **File Upload** | Multer |
| **Notifications** | In-app notification system |

## 📁 Project Structure

```
Event_Management_System/
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── common/        # Button, Input, Loader, Modal, ProtectedRoute
│   │   │   ├── events/        # EventCard
│   │   │   └── layout/        # Navbar
│   │   ├── context/           # AuthContext (React Context + useReducer)
│   │   ├── pages/
│   │   │   ├── admin/         # AdminDashboard, CategoryManagement, UserManagement, Reports
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── notifications/ # Notifications
│   │   │   ├── organizer/     # Dashboard, CreateEvent, ParticipantList, QRScanner, SendNotification
│   │   │   ├── profile/       # Profile
│   │   │   └── student/       # Home, EventDetail, MyTickets
│   │   ├── services/          # API service layer (axios)
│   │   └── styles/            # Design system (variables, globals, animations)
│   └── index.html
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/            # Database, environment, Firebase config
│   │   ├── controllers/       # Auth, Events, Registrations, Admin, Categories, Notifications
│   │   ├── middleware/        # Auth, Role, Error handling, Validation
│   │   ├── models/            # User, Event, Registration, Category, Notification
│   │   ├── routes/            # All API routes
│   │   ├── services/          # QR code generation, Notification service
│   │   └── utils/             # API Response helper, Token generation
│   ├── seed.js                # Database seeder with demo data
│   └── server.js              # Server entry point
│
└── package.json               # Root package.json (concurrent run scripts)
```

## 🚀 Local Setup

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (running locally or MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/Shashwat-Nautiyal/Event_Management_System.git
cd Event_Management_System
```

### 2. Install dependencies
```bash
# Install all dependencies (root, server, client)
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Configure environment
Create a `.env` file inside the `server/` directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/campus_events
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Seed the database
```bash
cd server && node seed.js
```

This creates demo users, categories, and sample events:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campus.edu | admin123 |
| Organizer | organizer@campus.edu | organizer123 |
| Student | student@campus.edu | student123 |

### 5. Start the application
```bash
# From root directory — starts both server and client
npm run dev
```
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (with filters) |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create event (organizer) |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| GET | `/api/events/my-events` | Get organizer's events |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/registrations/:eventId` | Register for event |
| DELETE | `/api/registrations/:eventId` | Cancel registration |
| GET | `/api/registrations/my-tickets` | Get user's tickets |
| GET | `/api/registrations/event/:eventId` | Get event participants |
| POST | `/api/registrations/verify-qr` | Verify QR code (check-in) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | System statistics |
| GET | `/api/admin/events/pending` | Pending events |
| PUT | `/api/admin/events/:id/approve` | Approve event |
| PUT | `/api/admin/events/:id/reject` | Reject event |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id/role` | Change user role |
| GET | `/api/admin/reports` | Analytics reports |

### Categories & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications/send` | Send notification |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |

## 🎨 Design System

- **Dark theme** by default with light theme support
- **Glassmorphism** cards with backdrop blur
- **Gradient accents** using indigo → violet → pink palette
- **Micro-animations** with staggered fade-ins
- **Responsive** design for all screen sizes
- **CSS Custom Properties** for consistent theming

## 📄 License

MIT
