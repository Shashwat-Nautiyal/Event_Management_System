import { Link } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock, HiOutlineUsers } from 'react-icons/hi';
import './EventCard.css';

const EventCard = ({ event, index = 0 }) => {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const spotsLeft = event.maxParticipants - event.registeredCount;
  const isFull = spotsLeft <= 0;

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Link
      to={`/events/${event._id}`}
      className={`event-card glass-card animate-fade-in-up stagger-${(index % 8) + 1}`}
      id={`event-card-${event._id}`}
    >
      <div className="event-card-image">
        {event.bannerImage ? (
          <img
            src={`http://localhost:5000${event.bannerImage}`}
            alt={event.title}
            loading="lazy"
          />
        ) : (
          <div className="event-card-placeholder">
            <span>{event.category?.icon || '🎪'}</span>
          </div>
        )}

        {event.isFeatured && <span className="event-card-badge badge-primary">⭐ Featured</span>}
        {isPast && <span className="event-card-badge badge-error">Past</span>}
        {isFull && !isPast && <span className="event-card-badge badge-warning">Full</span>}

        {event.category && (
          <span
            className="event-card-category"
            style={{ backgroundColor: event.category.color + '22', color: event.category.color }}
          >
            {event.category.icon} {event.category.name}
          </span>
        )}
      </div>

      <div className="event-card-content">
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-description">{event.description?.slice(0, 100)}...</p>

        <div className="event-card-meta">
          <div className="event-card-meta-item">
            <HiOutlineCalendar size={16} />
            <span>{formatDate(eventDate)}</span>
          </div>
          <div className="event-card-meta-item">
            <HiOutlineClock size={16} />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          <div className="event-card-meta-item">
            <HiOutlineLocationMarker size={16} />
            <span>{event.venue}</span>
          </div>
        </div>

        <div className="event-card-footer">
          <div className="event-card-spots">
            <HiOutlineUsers size={16} />
            <span className={isFull ? 'spots-full' : spotsLeft <= 10 ? 'spots-low' : ''}>
              {isFull ? 'No spots left' : `${spotsLeft} spots left`}
            </span>
          </div>
          <div className="event-card-capacity-bar">
            <div
              className="event-card-capacity-fill"
              style={{
                width: `${Math.min((event.registeredCount / event.maxParticipants) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
