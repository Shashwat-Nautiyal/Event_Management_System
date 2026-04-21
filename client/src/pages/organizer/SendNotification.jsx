import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notificationService, eventService } from '../../services';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { HiOutlineArrowLeft, HiOutlineSpeakerphone } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './SendNotification.css';

const SendNotification = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventService.getEvent(eventId);
        setEvent(data.data.event);
      } catch (error) {
        toast.error('Event not found');
        navigate('/organizer');
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await notificationService.send({
        eventId,
        title: formData.title,
        message: formData.message,
      });
      toast.success(data.message || 'Notification sent! 📢');
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnother = () => {
    setFormData({ title: '', message: '' });
    setSent(false);
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <button className="event-detail-back" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft size={20} /> Back
        </button>

        <div className="send-notif-card glass-card animate-fade-in-up">
          <div className="send-notif-header">
            <h1 className="page-title">
              <HiOutlineSpeakerphone style={{ verticalAlign: 'middle' }} /> Send Notification
            </h1>
            {event && (
              <p className="page-subtitle">
                Notify all registered participants of <strong>{event.title}</strong>
              </p>
            )}
            {event && (
              <div className="send-notif-info">
                <span className="badge badge-info">{event.registeredCount} participants</span>
              </div>
            )}
          </div>

          {sent ? (
            <div className="send-notif-success animate-fade-in-scale">
              <span className="send-notif-success-icon">📢</span>
              <h3>Notification Sent!</h3>
              <p>Your notification has been delivered to all registered participants.</p>
              <div className="send-notif-success-actions">
                <Button variant="primary" onClick={handleSendAnother}>
                  Send Another
                </Button>
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  Go Back
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="send-notif-form">
              <Input
                label="Notification Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Venue Change, Schedule Update"
                error={errors.title}
                required
              />
              <Input
                label="Message"
                type="textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message to participants..."
                error={errors.message}
                required
              />

              <div className="send-notif-templates">
                <p className="send-notif-templates-label">Quick templates:</p>
                <div className="send-notif-templates-grid">
                  <button
                    type="button"
                    className="home-filter-chip"
                    onClick={() => setFormData({
                      title: 'Event Reminder',
                      message: `Reminder: "${event?.title}" is coming up soon! Don't forget to attend.`,
                    })}
                  >
                    ⏰ Reminder
                  </button>
                  <button
                    type="button"
                    className="home-filter-chip"
                    onClick={() => setFormData({
                      title: 'Venue Change',
                      message: `Important: The venue for "${event?.title}" has been changed. Please check the updated details.`,
                    })}
                  >
                    📍 Venue Change
                  </button>
                  <button
                    type="button"
                    className="home-filter-chip"
                    onClick={() => setFormData({
                      title: 'Schedule Update',
                      message: `The schedule for "${event?.title}" has been updated. Please review the new timings.`,
                    })}
                  >
                    🕐 Schedule Update
                  </button>
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} id="send-notification-btn">
                Send to {event?.registeredCount || 0} Participants
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendNotification;
