import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(formData);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue to CampusEvents</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@campus.edu"
              icon={<HiOutlineMail />}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={<HiOutlineLockClosed />}
              error={errors.password}
              required
            />

            {errors.general && (
              <div className="auth-error">{errors.general}</div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              id="login-submit-btn"
            >
              Sign In
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="auth-link">Create one</Link>
            </p>
          </div>

          <div className="auth-demo-credentials">
            <p className="auth-demo-title">Demo Credentials</p>
            <div className="auth-demo-grid">
              <button className="auth-demo-btn" onClick={() => setFormData({ email: 'admin@campus.edu', password: 'admin123' })}>
                👑 Admin
              </button>
              <button className="auth-demo-btn" onClick={() => setFormData({ email: 'organizer@campus.edu', password: 'organizer123' })}>
                📋 Organizer
              </button>
              <button className="auth-demo-btn" onClick={() => setFormData({ email: 'student@campus.edu', password: 'student123' })}>
                🎓 Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
