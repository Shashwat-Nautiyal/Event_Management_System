import { useState, useEffect } from 'react';
import { adminService } from '../../services';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { HiOutlineSearch, HiOutlineArrowLeft, HiOutlineUsers } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const { data } = await adminService.getUsers(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated ✅');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      admin: 'badge-primary',
      organizer: 'badge-info',
      student: 'badge-success',
    };
    return map[role] || 'badge-primary';
  };

  const getRoleIcon = (role) => {
    const map = { admin: '👑', organizer: '📋', student: '🎓' };
    return map[role] || '👤';
  };

  return (
    <div className="page">
      <div className="container">
        <Link to="/admin" className="event-detail-back">
          <HiOutlineArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="org-header animate-fade-in-up">
          <div>
            <h1 className="page-title"><HiOutlineUsers style={{ verticalAlign: 'middle' }} /> User Management</h1>
            <p className="page-subtitle">{pagination.total} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="home-filters animate-fade-in-up" style={{ animationDelay: '0.1s', marginBottom: 'var(--space-xl)' }}>
          <div className="home-search-wrapper">
            <HiOutlineSearch size={20} className="home-search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="home-search-input"
              id="user-search"
            />
          </div>
          <div className="tickets-filters">
            {['', 'student', 'organizer', 'admin'].map((r) => (
              <button
                key={r}
                className={`home-filter-chip ${roleFilter === r ? 'home-filter-chip-active' : ''}`}
                onClick={() => setRoleFilter(r)}
              >
                {r ? `${getRoleIcon(r)} ${r.charAt(0).toUpperCase() + r.slice(1)}` : 'All Roles'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-3xl) 0', display: 'flex', justifyContent: 'center' }}>
            <Loader size="lg" text="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="home-empty animate-fade-in">
            <span className="home-empty-icon">👥</span>
            <h3>No users found</h3>
          </div>
        ) : (
          <>
            <div className="users-table-wrapper glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Change Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={user._id}>
                      <td>{(pagination.page - 1) * 20 + i + 1}</td>
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar" style={{
                            background: `linear-gradient(135deg, ${user.role === 'admin' ? '#6366f1' : user.role === 'organizer' ? '#3b82f6' : '#10b981'}, var(--color-secondary))`
                          }}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <strong>{user.name}</strong>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.department || '—'}</td>
                      <td>
                        <span className={`badge ${getRoleBadge(user.role)}`}>
                          {getRoleIcon(user.role)} {user.role}
                        </span>
                      </td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="user-role-select"
                        >
                          <option value="student">🎓 Student</option>
                          <option value="organizer">📋 Organizer</option>
                          <option value="admin">👑 Admin</option>
                        </select>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="home-pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                >
                  ← Previous
                </button>
                <span className="home-pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
