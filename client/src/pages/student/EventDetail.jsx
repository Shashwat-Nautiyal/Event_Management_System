import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, registrationService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock,
  HiOutlineUsers, HiOutlineTag, HiOutlineArrowLeft
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventService.getEvent(id);
        setEvent(data.data.event);

        // Check if user is registered
        if (isAuthenticated) {
          try {
            const { data: tickets } = await registrationService.getMyTickets();
            const registered = tickets.data.registrations.find(
              (r) => r.event?._id === id && r.status === 'confirmed'
            );
            setIsRegistered(!!registered);
          } catch {}
        }
      } catch (error) {
        toast.error('Event not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isAuthenticated]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    setRegistering(true);
    try {
      await registrationService.register(id);
      setIsRegistered(true);
      setEvent((prev) => ({ ...prev, registeredCount: prev.registeredCount + 1 }));
      toast.success('Registered successfully! Check your tickets. 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    setRegistering(true);
    try {
      await registrationService.cancel(id);
      setIsRegistered(false);
      setEvent((prev) => ({ ...prev, registeredCount: prev.registeredCount - 1 }));
      toast.success('Registration cancelled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader size="lg" text="Loading event..." />
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const isFull = event.registeredCount >= event.maxParticipants;
  const spotsLeft = event.maxParticipants - event.registeredCount;
  const capacityPercent = Math.min((event.registeredCount / event.maxParticipants) * 100, 100);

  return (
    <div className="page">
      <div className="container">
        <button className="event-detail-back" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft size={20} /> Back
        </button>

        <div className="event-detail animate-fade-in-up">
          {/* Banner */}
          <div className="event-detail-banner">
            {event.bannerImage ? (
              <img src={`http://localhost:5000${event.bannerImage}`} alt={event.title} />
            ) : (
              <div className="event-detail-banner-placeholder">
                <span>{event.category?.icon || '🎪'}</span>
              </div>
            )}
            <div className="event-detail-banner-overlay" />
          </div>

          <div className="event-detail-body">
            {/* Main Content */}
            <div className="event-detail-main">
              <div className="event-detail-badges">
                {event.category && (
                  <span
                    className="badge"
                    style={{ backgroundColor: event.category.color + '22', color: event.category.color }}
                  >
                    {event.category.icon} {event.category.name}
                  </span>
                )}
                {event.isFeatured && <span className="badge badge-primary">⭐ Featured</span>}
                {isPast && <span className="badge badge-error">Event Ended</span>}
              </div>

              <h1 className="event-detail-title">{event.title}</h1>

              <div className="event-detail-organizer">
                <div className="event-detail-organizer-avatar">
                  {event.organizer?.name?.charAt(0)}
                </div>
                <div>
                  <p className="event-detail-organizer-name">{event.organizer?.name}</p>
                  <p className="event-detail-organizer-label">Organizer</p>
                </div>
              </div>

              <div className="event-detail-section">
                <h3>About this event</h3>
                <p className="event-detail-description">{event.description}</p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="event-detail-tags">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="event-detail-tag">
                      <HiOutlineTag size={14} /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="event-detail-sidebar">
              <div className="event-detail-info-card glass-card">
                <div className="event-detail-info-item">
                  <HiOutlineCalendar size={20} />
                  <div>
                    <strong>{eventDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                  </div>
                </div>
                <div className="event-detail-info-item">
                  <HiOutlineClock size={20} />
                  <div><strong>{event.startTime} — {event.endTime}</strong></div>
                </div>
                <div className="event-detail-info-item">
                  <HiOutlineLocationMarker size={20} />
                  <div><strong>{event.venue}</strong></div>
                </div>
                <div className="event-detail-info-item">
                  <HiOutlineUsers size={20} />
                  <div>
                    <strong>{event.registeredCount} / {event.maxParticipants}</strong>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}> registered</span>
                  </div>
                </div>

                <div className="event-detail-capacity">
                  <div className="event-detail-capacity-bar">
                    <div className="event-detail-capacity-fill" style={{ width: `${capacityPercent}%` }} />
                  </div>
                  <span className={`event-detail-spots ${isFull ? 'spots-full' : spotsLeft <= 10 ? 'spots-low' : ''}`}>
                    {isFull ? 'No spots left' : `${spotsLeft} spots remaining`}
                  </span>
                </div>

                {!isPast && (
                  <div className="event-detail-actions">
                    {isRegistered ? (
                      <>
                        <Button variant="success" size="lg" fullWidth disabled>
                          ✓ Registered
                        </Button>
                        <Button variant="ghost" size="sm" fullWidth onClick={handleCancel} loading={registering}>
                          Cancel Registration
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleRegister}
                        loading={registering}
                        disabled={isFull}
                        id="register-event-btn"
                      >
                        {isFull ? 'Event Full' : isAuthenticated ? 'Register Now' : 'Login to Register'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
