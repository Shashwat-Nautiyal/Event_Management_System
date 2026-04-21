import { useState, useEffect } from 'react';
import { eventService, categoryService } from '../../services';
import EventCard from '../../components/events/EventCard';
import Loader from '../../components/common/Loader';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineCalendar } from 'react-icons/hi';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchEvents = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        upcoming: showUpcoming ? 'true' : undefined,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;

      const { data } = await eventService.getEvents(params);
      setEvents(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await categoryService.getCategories();
      setCategories(data.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, showUpcoming]);

  return (
    <div className="page">
      <div className="container">
        {/* Hero Section */}
        <div className="home-hero animate-fade-in-up">
          <div className="home-hero-content">
            <h1 className="home-hero-title">
              Discover Campus
              <span className="gradient-text"> Events</span>
            </h1>
            <p className="home-hero-subtitle">
              Browse, register, and get digital tickets for workshops, hackathons, cultural fests, and more.
            </p>
          </div>
          <div className="home-hero-stats">
            <div className="home-stat glass">
              <span className="home-stat-value">{pagination.total || 0}</span>
              <span className="home-stat-label">Events</span>
            </div>
            <div className="home-stat glass">
              <span className="home-stat-value">{categories.length}</span>
              <span className="home-stat-label">Categories</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="home-filters animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="home-search-wrapper">
            <HiOutlineSearch size={20} className="home-search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="home-search-input"
              id="event-search"
            />
          </div>

          <div className="home-filter-group">
            <div className="home-category-filters">
              <button
                className={`home-filter-chip ${!selectedCategory ? 'home-filter-chip-active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`home-filter-chip ${selectedCategory === cat._id ? 'home-filter-chip-active' : ''}`}
                  onClick={() => setSelectedCategory(cat._id === selectedCategory ? '' : cat._id)}
                  style={selectedCategory === cat._id ? { borderColor: cat.color, color: cat.color } : {}}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            <button
              className={`home-filter-chip ${showUpcoming ? 'home-filter-chip-active' : ''}`}
              onClick={() => setShowUpcoming(!showUpcoming)}
            >
              <HiOutlineCalendar size={16} /> Upcoming Only
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ padding: 'var(--space-3xl) 0', display: 'flex', justifyContent: 'center' }}>
            <Loader size="lg" text="Loading events..." />
          </div>
        ) : events.length === 0 ? (
          <div className="home-empty animate-fade-in">
            <span className="home-empty-icon">🔍</span>
            <h3>No events found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-auto" style={{ marginTop: 'var(--space-xl)' }}>
              {events.map((event, i) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="home-pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchEvents(pagination.page - 1)}
                >
                  ← Previous
                </button>
                <span className="home-pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchEvents(pagination.page + 1)}
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

export default Home;
