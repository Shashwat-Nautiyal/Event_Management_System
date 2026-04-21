import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  HiOutlineUsers, HiOutlineCalendar, HiOutlineTicket,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineCollection,
  HiOutlineTag, HiOutlineChartBar
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, eventId: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingEvents(),
      ]);
      setStats(statsRes.data.data);
      setPendingEvents(pendingRes.data.data.events);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveEvent(id);
      setPendingEvents(pendingEvents.filter((e) => e._id !== id));
      toast.success('Event approved! ✅');
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      await adminService.rejectEvent(rejectModal.eventId, rejectReason);
      setPendingEvents(pendingEvents.filter((e) => e._id !== rejectModal.eventId));
      setRejectModal({ open: false, eventId: null });
      setRejectReason('');
      toast.success('Event rejected');
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  if (loading) {
    return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader size="lg" /></div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <HiOutlineUsers size={24} />, color: '#6366f1' },
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: <HiOutlineCalendar size={24} />, color: '#8b5cf6' },
    { label: 'Registrations', value: stats?.totalRegistrations || 0, icon: <HiOutlineTicket size={24} />, color: '#ec4899' },
    { label: 'Pending Approval', value: stats?.pendingEvents || 0, icon: <HiOutlineCollection size={24} />, color: '#f59e0b' },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System overview and event management</p>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {statCards.map((stat, i) => (
            <div key={i} className="admin-stat-card glass-card">
              <div className="admin-stat-icon" style={{ background: stat.color + '22', color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <div className="admin-stat-value">{stat.value}</div>
                <div className="admin-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="admin-quick-links animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <Link to="/admin/categories" className="admin-quick-link glass-card">
            <HiOutlineTag size={24} />
            <span>Manage Categories</span>
          </Link>
          <Link to="/admin/users" className="admin-quick-link glass-card">
            <HiOutlineUsers size={24} />
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/reports" className="admin-quick-link glass-card">
            <HiOutlineChartBar size={24} />
            <span>View Reports</span>
          </Link>
        </div>

        {/* Pending Events */}
        <div className="admin-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="admin-section-title">
            Pending Approvals
            {pendingEvents.length > 0 && (
              <span className="badge badge-warning" style={{ marginLeft: 'var(--space-sm)' }}>
                {pendingEvents.length}
              </span>
            )}
          </h2>

          {pendingEvents.length === 0 ? (
            <div className="admin-empty glass-card">
              <HiOutlineCheckCircle size={40} style={{ color: 'var(--color-success)' }} />
              <p>All caught up! No pending events.</p>
            </div>
          ) : (
            <div className="admin-pending-list">
              {pendingEvents.map((event) => (
                <div key={event._id} className="admin-pending-card glass-card">
                  <div className="admin-pending-info">
                    <h3>{event.title}</h3>
                    <p className="admin-pending-meta">
                      By {event.organizer?.name} • {event.category?.icon} {event.category?.name} •{' '}
                      {new Date(event.date).toLocaleDateString()} • {event.maxParticipants} max
                    </p>
                    <p className="admin-pending-desc">{event.description?.slice(0, 150)}...</p>
                  </div>
                  <div className="admin-pending-actions">
                    <Button variant="success" size="sm" icon={<HiOutlineCheckCircle />} onClick={() => handleApprove(event._id)}>
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<HiOutlineXCircle />}
                      onClick={() => setRejectModal({ open: true, eventId: event._id })}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        {stats?.recentEvents && (
          <div className="admin-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="admin-section-title">Recent Events</h2>
            <div className="admin-recent-list glass-card">
              {stats.recentEvents.map((event) => (
                <div key={event._id} className="admin-recent-item">
                  <div>
                    <strong>{event.title}</strong>
                    <span className="admin-recent-by"> by {event.organizer?.name}</span>
                  </div>
                  <span className={`badge ${event.status === 'approved' ? 'badge-success' : event.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reject Modal */}
        <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, eventId: null })} title="Reject Event" size="sm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Input label="Reason for rejection" type="textarea" name="reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this event is being rejected..." />
            <Button variant="danger" fullWidth onClick={handleReject}>Confirm Rejection</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
