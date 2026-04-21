import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registrationService } from '../../services';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineCheckCircle, HiOutlineDownload } from 'react-icons/hi';
import './ParticipantList.css';

const ParticipantList = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  const fetchParticipants = async () => {
    try {
      const { data: res } = await registrationService.getParticipants(eventId);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data?.participants?.filter((p) =>
    p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const exportCSV = () => {
    const header = 'Name,Email,Department,Status,Registered At\n';
    const rows = filtered.map((p) =>
      `${p.user?.name},${p.user?.email},${p.user?.department || 'N/A'},${p.status},${new Date(p.createdAt).toLocaleString()}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${eventId}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader size="lg" /></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <button className="event-detail-back" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft size={20} /> Back
        </button>

        <div className="org-header animate-fade-in-up">
          <div>
            <h1 className="page-title">Participants</h1>
            <p className="page-subtitle">
              {data?.total || 0} registered • {data?.attended || 0} attended
            </p>
          </div>
          <Button variant="secondary" icon={<HiOutlineDownload />} onClick={exportCSV}>
            Export CSV
          </Button>
        </div>

        <div className="home-search-wrapper" style={{ marginBottom: 'var(--space-xl)' }}>
          <HiOutlineSearch size={20} className="home-search-icon" />
          <input
            type="text"
            placeholder="Search participants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="home-search-input"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="home-empty"><span className="home-empty-icon">👥</span><h3>No participants yet</h3></div>
        ) : (
          <div className="participants-table-wrapper glass-card">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p._id}>
                    <td>{i + 1}</td>
                    <td><strong>{p.user?.name}</strong></td>
                    <td>{p.user?.email}</td>
                    <td>{p.user?.department || '—'}</td>
                    <td>
                      <span className={`badge ${p.status === 'attended' ? 'badge-success' : 'badge-info'}`}>
                        {p.status === 'attended' && <HiOutlineCheckCircle size={14} />}
                        {p.status}
                      </span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
