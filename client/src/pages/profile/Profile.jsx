import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineAcademicCap } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.updateProfile(formData);
      updateUser(data.data.user);
      toast.success('Profile updated! ✨');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      department: user?.department || '',
    });
    setEditing(false);
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin': return { label: 'Administrator', icon: '👑', badge: 'badge-primary' };
      case 'organizer': return { label: 'Event Organizer', icon: '📋', badge: 'badge-info' };
      default: return { label: 'Student', icon: '🎓', badge: 'badge-success' };
    }
  };

  const roleInfo = getRoleDisplay(user?.role);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="profile-card glass-card animate-fade-in-up">
          {/* Avatar Section */}
          <div className="profile-hero">
            <div className="profile-avatar-large">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <span className={`badge ${roleInfo.badge}`}>
              {roleInfo.icon} {roleInfo.label}
            </span>
          </div>

          <div className="profile-divider" />

          {/* Info / Edit Form */}
          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                icon={<HiOutlineUser />}
                required
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                icon={<HiOutlinePhone />}
              />
              <Input
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                icon={<HiOutlineAcademicCap />}
              />

              <div className="profile-form-actions">
                <Button type="submit" variant="primary" loading={loading}>
                  Save Changes
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="profile-info-row">
                <HiOutlineUser size={18} />
                <div>
                  <span className="profile-info-label">Full Name</span>
                  <span className="profile-info-value">{user?.name}</span>
                </div>
              </div>
              <div className="profile-info-row">
                <HiOutlineMail size={18} />
                <div>
                  <span className="profile-info-label">Email</span>
                  <span className="profile-info-value">{user?.email}</span>
                </div>
              </div>
              <div className="profile-info-row">
                <HiOutlinePhone size={18} />
                <div>
                  <span className="profile-info-label">Phone</span>
                  <span className="profile-info-value">{user?.phone || '—'}</span>
                </div>
              </div>
              <div className="profile-info-row">
                <HiOutlineAcademicCap size={18} />
                <div>
                  <span className="profile-info-label">Department</span>
                  <span className="profile-info-value">{user?.department || '—'}</span>
                </div>
              </div>

              <Button variant="primary" onClick={() => setEditing(true)} fullWidth style={{ marginTop: 'var(--space-lg)' }}>
                Edit Profile
              </Button>
            </div>
          )}

          <div className="profile-meta">
            <p>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
