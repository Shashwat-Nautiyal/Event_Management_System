import { useState, useEffect } from 'react';
import { adminService } from '../../services';
import Loader from '../../components/common/Loader';
import { HiOutlineArrowLeft, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineUsers, HiOutlineCalendar } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import './Reports.css';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { type: 'all' };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const { data } = await adminService.getReports(params);
      setReport(data.data.report);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDateFilter = () => {
    fetchReport();
  };

  if (loading) {
    return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader size="lg" /></div>;
  }

  const eventStats = report?.eventStats || [];
  const registrationStats = report?.registrationStats || [];
  const topEvents = report?.topEvents || [];
  const attendanceByEvent = report?.attendanceByEvent || [];

  const getStatValue = (stats, id) => {
    const stat = stats.find((s) => s._id === id);
    return stat?.count || 0;
  };

  const totalEvents = eventStats.reduce((acc, s) => acc + s.count, 0);
  const totalRegistrations = registrationStats.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="page">
      <div className="container">
        <Link to="/admin" className="event-detail-back">
          <HiOutlineArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="org-header animate-fade-in-up">
          <div>
            <h1 className="page-title"><HiOutlineChartBar style={{ verticalAlign: 'middle' }} /> Reports</h1>
            <p className="page-subtitle">Event and participation analytics</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="report-date-filter glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="report-date-inputs">
            <div className="input-group">
              <label className="input-label">From</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label className="input-label">To</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input-field"
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleDateFilter} style={{ alignSelf: 'flex-end' }}>
              Apply Filter
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="report-summary animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="report-stat-card glass-card">
            <HiOutlineCalendar size={24} style={{ color: 'var(--color-primary)' }} />
            <div className="report-stat-value">{totalEvents}</div>
            <div className="report-stat-label">Total Events</div>
          </div>
          <div className="report-stat-card glass-card">
            <HiOutlineUsers size={24} style={{ color: 'var(--color-secondary)' }} />
            <div className="report-stat-value">{totalRegistrations}</div>
            <div className="report-stat-label">Total Registrations</div>
          </div>
          <div className="report-stat-card glass-card">
            <HiOutlineTrendingUp size={24} style={{ color: 'var(--color-success)' }} />
            <div className="report-stat-value">{getStatValue(registrationStats, 'attended')}</div>
            <div className="report-stat-label">Total Attended</div>
          </div>
          <div className="report-stat-card glass-card">
            <HiOutlineChartBar size={24} style={{ color: 'var(--color-accent)' }} />
            <div className="report-stat-value">
              {totalRegistrations > 0
                ? Math.round((getStatValue(registrationStats, 'attended') / totalRegistrations) * 100)
                : 0}%
            </div>
            <div className="report-stat-label">Attendance Rate</div>
          </div>
        </div>

        {/* Event Status Breakdown */}
        <div className="report-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="admin-section-title">Event Status Breakdown</h2>
          <div className="report-bars glass-card">
            {eventStats.map((stat) => {
              const percentage = totalEvents > 0 ? (stat.count / totalEvents) * 100 : 0;
              const colorMap = {
                approved: 'var(--color-success)',
                pending: 'var(--color-warning)',
                rejected: 'var(--color-error)',
                cancelled: 'var(--color-error-light)',
                completed: 'var(--color-info)',
                draft: 'var(--text-tertiary)',
              };
              return (
                <div key={stat._id} className="report-bar-item">
                  <div className="report-bar-label">
                    <span className="report-bar-status">{stat._id}</span>
                    <span className="report-bar-count">{stat.count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        background: colorMap[stat._id] || 'var(--color-primary)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registration Status Breakdown */}
        <div className="report-section animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="admin-section-title">Registration Status</h2>
          <div className="report-bars glass-card">
            {registrationStats.map((stat) => {
              const percentage = totalRegistrations > 0 ? (stat.count / totalRegistrations) * 100 : 0;
              const colorMap = {
                confirmed: 'var(--color-info)',
                attended: 'var(--color-success)',
                cancelled: 'var(--color-error)',
              };
              return (
                <div key={stat._id} className="report-bar-item">
                  <div className="report-bar-label">
                    <span className="report-bar-status">{stat._id}</span>
                    <span className="report-bar-count">{stat.count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        background: colorMap[stat._id] || 'var(--color-primary)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Events */}
        {topEvents.length > 0 && (
          <div className="report-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="admin-section-title">Top Events by Registration</h2>
            <div className="report-top-events glass-card">
              {topEvents.map((event, i) => {
                const fillPercent = event.maxParticipants > 0
                  ? (event.registeredCount / event.maxParticipants) * 100
                  : 0;
                return (
                  <div key={event._id} className="report-top-event">
                    <div className="report-top-event-rank">#{i + 1}</div>
                    <div className="report-top-event-info">
                      <strong>{event.title}</strong>
                      <span className="report-top-event-date">
                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="report-top-event-stats">
                      <span>{event.registeredCount}/{event.maxParticipants}</span>
                      <div className="report-bar-track" style={{ width: '80px' }}>
                        <div
                          className="report-bar-fill"
                          style={{
                            width: `${Math.min(fillPercent, 100)}%`,
                            background: fillPercent >= 90 ? 'var(--color-error)' : 'var(--color-primary)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attendance by Event */}
        {attendanceByEvent.length > 0 && (
          <div className="report-section animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <h2 className="admin-section-title">Attendance by Event</h2>
            <div className="report-top-events glass-card">
              {attendanceByEvent.map((item, i) => (
                <div key={i} className="report-top-event">
                  <div className="report-top-event-rank" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                    ✓
                  </div>
                  <div className="report-top-event-info">
                    <strong>{item.eventTitle}</strong>
                    <span className="report-top-event-date">
                      {new Date(item.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="report-top-event-stats">
                    <span>{item.attendedCount}/{item.maxParticipants} attended</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
