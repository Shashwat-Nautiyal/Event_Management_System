import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService, categoryService } from '../../services';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './CreateEvent.css';

const CreateEvent = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    date: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    tags: '',
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchEvent();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data } = await categoryService.getCategories();
      setCategories(data.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEvent = async () => {
    try {
      const { data } = await eventService.getEvent(id);
      const event = data.data.event;
      setFormData({
        title: event.title,
        description: event.description,
        category: event.category?._id || '',
        venue: event.venue,
        date: event.date?.split('T')[0] || '',
        startTime: event.startTime,
        endTime: event.endTime,
        maxParticipants: event.maxParticipants,
        tags: event.tags?.join(', ') || '',
      });
      if (event.bannerImage) {
        setBannerPreview(`http://localhost:5000${event.bannerImage}`);
      }
    } catch (error) {
      toast.error('Event not found');
      navigate('/organizer');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title) errs.title = 'Title is required';
    if (!formData.description) errs.description = 'Description is required';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.venue) errs.venue = 'Venue is required';
    if (!formData.date) errs.date = 'Date is required';
    if (!formData.startTime) errs.startTime = 'Start time is required';
    if (!formData.endTime) errs.endTime = 'End time is required';
    if (!formData.maxParticipants || formData.maxParticipants < 1) errs.maxParticipants = 'Must be at least 1';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'tags') {
          const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
          tags.forEach(tag => fd.append('tags', tag));
        } else {
          fd.append(key, formData[key]);
        }
      });
      if (bannerFile) fd.append('bannerImage', bannerFile);

      if (isEdit) {
        await eventService.updateEvent(id, fd);
        toast.success('Event updated!');
      } else {
        await eventService.createEvent(fd);
        toast.success('Event created and submitted for approval! 🎉');
      }
      navigate('/organizer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '720px' }}>
        <button className="event-detail-back" onClick={() => navigate('/organizer')}>
          <HiOutlineArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="create-event-card glass-card animate-fade-in-up">
          <h1 className="page-title" style={{ marginBottom: 'var(--space-xl)' }}>
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h1>

          <form onSubmit={handleSubmit} className="create-event-form" id="create-event-form">
            {/* Banner Upload */}
            <div className="create-event-banner-upload">
              <label className="input-label">Event Banner</label>
              <div
                className="create-event-banner-area"
                onClick={() => document.getElementById('bannerInput').click()}
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner preview" />
                ) : (
                  <div className="create-event-banner-placeholder">
                    <span>📸</span>
                    <p>Click to upload banner image</p>
                  </div>
                )}
              </div>
              <input
                id="bannerInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <Input label="Event Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. CodeStorm 2026 Hackathon" error={errors.title} required />
            <Input label="Description" type="textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Describe your event..." error={errors.description} required />

            <div className="auth-row">
              <div className="input-group">
                <label className="input-label">Category <span className="input-required">*</span></label>
                <select name="category" value={formData.category} onChange={handleChange} className={`input-field ${errors.category ? 'input-error' : ''}`}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                {errors.category && <span className="input-error-text">{errors.category}</span>}
              </div>
              <Input label="Venue" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g. Main Auditorium" error={errors.venue} required />
            </div>

            <div className="auth-row">
              <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} error={errors.date} required />
              <Input label="Max Participants" type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} placeholder="e.g. 100" error={errors.maxParticipants} required min="1" />
            </div>

            <div className="auth-row">
              <Input label="Start Time" type="time" name="startTime" value={formData.startTime} onChange={handleChange} error={errors.startTime} required />
              <Input label="End Time" type="time" name="endTime" value={formData.endTime} onChange={handleChange} error={errors.endTime} required />
            </div>

            <Input label="Tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="Comma-separated, e.g. hackathon, coding, prizes" />

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} id="submit-event-btn">
              {isEdit ? 'Update Event' : 'Submit for Approval'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
