import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/student/Home';
import EventDetail from './pages/student/EventDetail';
import MyTickets from './pages/student/MyTickets';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/profile/Profile';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import ParticipantList from './pages/organizer/ParticipantList';
import QRScanner from './pages/organizer/QRScanner';
import SendNotification from './pages/organizer/SendNotification';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoryManagement from './pages/admin/CategoryManagement';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import Notifications from './pages/notifications/Notifications';

// Styles
import './styles/variables.css';
import './styles/globals.css';
import './styles/animations.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Organizer Routes */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute roles={['organizer', 'admin']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/create-event"
              element={
                <ProtectedRoute roles={['organizer', 'admin']}>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/edit-event/:id"
              element={
                <ProtectedRoute roles={['organizer', 'admin']}>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/participants/:eventId"
              element={
                <ProtectedRoute roles={['organizer', 'admin']}>
                  <ParticipantList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/scan/:eventId"
              element={
                <ProtectedRoute roles={['organizer', 'admin']}>
                  <QRScanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/send-notification/:eventId"
              element={
                <ProtectedRoute roles={['organizer', 'admin']}>
                  <SendNotification />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute roles={['admin']}>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                  <span style={{ fontSize: '4rem' }}>🔍</span>
                  <h1>Page Not Found</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
                </div>
              }
            />
          </Routes>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.875rem',
              boxShadow: 'var(--shadow-lg)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'white' },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
