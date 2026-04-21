import { useState, useEffect } from 'react';
import { registrationService } from '../../services';
import { QRCodeSVG } from 'qrcode.react';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock, HiOutlineTicket } from 'react-icons/hi';
import './MyTickets.css';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await registrationService.getMyTickets();
      setTickets(data.data.registrations);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'upcoming') return t.event && new Date(t.event.date) >= new Date() && t.status === 'confirmed';
    if (filter === 'past') return t.event && new Date(t.event.date) < new Date();
    if (filter === 'attended') return t.status === 'attended';
    if (filter === 'cancelled') return t.status === 'cancelled';
    return true;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader size="lg" text="Loading tickets..." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title">
            <HiOutlineTicket style={{ verticalAlign: 'middle' }} /> My Tickets
          </h1>
          <p className="page-subtitle">Your event registrations and digital tickets</p>
        </div>

        {/* Filters */}
        <div className="tickets-filters animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {['all', 'upcoming', 'past', 'attended', 'cancelled'].map((f) => (
            <button
              key={f}
              className={`home-filter-chip ${filter === f ? 'home-filter-chip-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredTickets.length === 0 ? (
          <div className="home-empty animate-fade-in">
            <span className="home-empty-icon">🎫</span>
            <h3>No tickets found</h3>
            <p>Register for events to see your tickets here.</p>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map((ticket, i) => (
              <div
                key={ticket._id}
                className={`ticket-card glass-card animate-fade-in-up stagger-${(i % 8) + 1}`}
                onClick={() => setSelectedTicket(ticket)}
                id={`ticket-${ticket._id}`}
              >
                <div className="ticket-card-left">
                  <div className="ticket-card-event-icon">
                    {ticket.event?.category?.icon || '🎪'}
                  </div>
                  <div className="ticket-card-info">
                    <h3 className="ticket-card-title">{ticket.event?.title || 'Event'}</h3>
                    <div className="ticket-card-meta">
                      <span><HiOutlineCalendar size={14} /> {ticket.event?.date ? formatDate(ticket.event.date) : 'N/A'}</span>
                      <span><HiOutlineClock size={14} /> {ticket.event?.startTime} - {ticket.event?.endTime}</span>
                      <span><HiOutlineLocationMarker size={14} /> {ticket.event?.venue}</span>
                    </div>
                  </div>
                </div>
                <div className="ticket-card-right">
                  <span className={`badge ${
                    ticket.status === 'confirmed' ? 'badge-success' :
                    ticket.status === 'attended' ? 'badge-info' :
                    ticket.status === 'cancelled' ? 'badge-error' : 'badge-primary'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="ticket-card-id">{ticket.ticketId}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ticket Detail Modal */}
        <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Digital Ticket" size="sm">
          {selectedTicket && (
            <div className="ticket-modal">
              <div className="ticket-modal-event">
                <h3>{selectedTicket.event?.title}</h3>
                <p>
                  {selectedTicket.event?.date && formatDate(selectedTicket.event.date)} • {selectedTicket.event?.startTime} - {selectedTicket.event?.endTime}
                </p>
                <p>{selectedTicket.event?.venue}</p>
              </div>

              <div className="ticket-modal-qr">
                {selectedTicket.qrCodeData ? (
                  <img src={selectedTicket.qrCodeData} alt="QR Code" className="ticket-qr-image" />
                ) : (
                  <QRCodeSVG
                    value={JSON.stringify({
                      ticketId: selectedTicket.ticketId,
                      eventId: selectedTicket.event?._id,
                    })}
                    size={220}
                    bgColor="transparent"
                    fgColor="var(--text-primary)"
                    level="H"
                  />
                )}
              </div>

              <div className="ticket-modal-id">
                <span className="ticket-modal-id-label">Ticket ID</span>
                <span className="ticket-modal-id-value">{selectedTicket.ticketId}</span>
              </div>

              <span className={`badge ${
                selectedTicket.status === 'confirmed' ? 'badge-success' :
                selectedTicket.status === 'attended' ? 'badge-info' : 'badge-error'
              }`} style={{ alignSelf: 'center' }}>
                {selectedTicket.status === 'confirmed' ? '✓ Confirmed' :
                 selectedTicket.status === 'attended' ? '✓ Attended' : '✕ Cancelled'}
              </span>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MyTickets;
