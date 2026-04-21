import { useState, useEffect } from 'react';
import { notificationService } from '../../services';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { HiOutlineBell, HiOutlineCheckCircle } from 'react-icons/hi';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationService.getNotifications();
      setNotifications(data.data.notifications);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'registration': return '🎫';
      case 'approval': return '✅';
      case 'reminder': return '⏰';
      case 'update': return '📢';
      default: return '🔔';
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader size="lg" /></div>;

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '720px' }}>
        <div className="org-header animate-fade-in-up">
          <div>
            <h1 className="page-title"><HiOutlineBell /> Notifications</h1>
            <p className="page-subtitle">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" icon={<HiOutlineCheckCircle />} onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="home-empty animate-fade-in">
            <span className="home-empty-icon">🔔</span>
            <h3>No notifications</h3>
            <p>You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n, i) => (
              <div
                key={n._id}
                className={`notif-item glass-card animate-fade-in-up stagger-${(i % 8) + 1} ${!n.isRead ? 'notif-unread' : ''}`}
                onClick={() => !n.isRead && markRead(n._id)}
              >
                <span className="notif-type-icon">{getTypeIcon(n.type)}</span>
                <div className="notif-content">
                  <strong className="notif-title">{n.title}</strong>
                  <p className="notif-message">{n.message}</p>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </div>
                {!n.isRead && <div className="notif-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
