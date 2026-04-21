import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  HiOutlinePlus, HiOutlineEye, HiOutlinePencil, HiOutlineTrash,
  HiOutlineUsers, HiOutlineCalendar, HiOutlineQrcode, HiOutlineSpeakerphone
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './OrganizerDashboard.css';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await eventService.getMyEvents(params);
      setEvents(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter((e) => e._id !== id));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: 'badge-secondary',
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-error',
      cancelled: 'badge-error',
      completed: 'badge-info',
    };
    return map[status] || 'badge-primary';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="org-header animate-fade-in-up">
          <div>
            <h1 className="page-title">Organizer Dashboard</h1>
            <p className="page-subtitle">Manage your events and track registrations</p>
          </div>
          <Link to="/organizer/create-event">
            <Button variant="primary" icon={<HiOutlinePlus />} id="create-event-btn">
              Create Event
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="tickets-filters animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {['', 'pending', 'approved', 'rejected', 'completed'].map((f) => (
            <button
              key={f}
              className={`home-filter-chip ${filter === f ? 'home-filter-chip-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader size="lg" text="Loading events..." />
        ) : events.length === 0 ? (
          <div className="home-empty animate-fade-in">
            <span className="home-empty-icon">📋</span>
            <h3>No events yet</h3>
            <p>Create your first event to get started!</p>
          </div>
        ) : (
          <div className="org-events-list">
            {events.map((event, i) => (
              <div key={event._id} className={`org-event-row glass-card animate-fade-in-up stagger-${(i % 8) + 1}`}>
                <div className="org-event-info">
                  <div className="org-event-icon">{event.category?.icon || '🎪'}</div>
                  <div>
                    <h3 className="org-event-title">{event.title}</h3>
                    <div className="org-event-meta">
                      <span><HiOutlineCalendar size={14} /> {formatDate(event.date)}</span>
                      <span><HiOutlineUsers size={14} /> {event.registeredCount}/{event.maxParticipants}</span>
                    </div>
                  </div>
                </div>
                <div className="org-event-actions">
                  <span className={`badge ${getStatusBadge(event.status)}`}>{event.status}</span>
                  <Link to={`/events/${event._id}`}>
                    <Button variant="ghost" size="sm" icon={<HiOutlineEye />}>View</Button>
                  </Link>
                  <Link to={`/organizer/edit-event/${event._id}`}>
                    <Button variant="ghost" size="sm" icon={<HiOutlinePencil />}>Edit</Button>
                  </Link>
                  <Link to={`/organizer/participants/${event._id}`}>
                    <Button variant="ghost" size="sm" icon={<HiOutlineUsers />}>Attendees</Button>
                  </Link>
                  <Link to={`/organizer/scan/${event._id}`}>
                    <Button variant="ghost" size="sm" icon={<HiOutlineQrcode />}>Scan QR</Button>
                  </Link>
                  <Link to={`/organizer/send-notification/${event._id}`}>
                    <Button variant="ghost" size="sm" icon={<HiOutlineSpeakerphone />}>Notify</Button>
                  </Link>
                  <Button variant="ghost" size="sm" icon={<HiOutlineTrash />} onClick={() => handleDelete(event._id)} className="text-error">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
