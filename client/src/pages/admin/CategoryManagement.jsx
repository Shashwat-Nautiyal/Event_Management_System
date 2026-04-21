import { useState, useEffect } from 'react';
import { categoryService } from '../../services';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './CategoryManagement.css';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#06b6d4', '#84cc16', '#a855f7',
];

const PRESET_ICONS = ['💻', '🔧', '🎭', '⚽', '🎤', '📖', '🤝', '💼', '🎨', '🎵', '🧪', '📋'];

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: '📋',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await categoryService.getCategories();
      setCategories(data.data.categories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', color: '#6366f1', icon: '📋' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      color: cat.color || '#6366f1',
      icon: cat.icon || '📋',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { data } = await categoryService.updateCategory(editingId, formData);
        setCategories(categories.map((c) => c._id === editingId ? data.data.category : c));
        toast.success('Category updated! ✏️');
      } else {
        const { data } = await categoryService.createCategory(formData);
        setCategories([...categories, data.data.category]);
        toast.success('Category created! ✨');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('This will deactivate the category. Continue?')) return;
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
      toast.success('Category deactivated');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader size="lg" /></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <Link to="/admin" className="event-detail-back">
          <HiOutlineArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="org-header animate-fade-in-up">
          <div>
            <h1 className="page-title">Event Categories</h1>
            <p className="page-subtitle">Manage categories for campus events</p>
          </div>
          <Button variant="primary" icon={<HiOutlinePlus />} onClick={openCreate}>
            Add Category
          </Button>
        </div>

        <div className="cat-grid animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {categories.map((cat, i) => (
            <div key={cat._id} className={`cat-card glass-card animate-fade-in-up stagger-${(i % 8) + 1}`}>
              <div className="cat-card-header">
                <div className="cat-card-icon" style={{ background: cat.color + '22', color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="cat-card-color-dot" style={{ background: cat.color }} />
              </div>
              <h3 className="cat-card-name">{cat.name}</h3>
              <p className="cat-card-desc">{cat.description || 'No description'}</p>
              <div className="cat-card-actions">
                <Button variant="ghost" size="sm" icon={<HiOutlinePencil />} onClick={() => openEdit(cat)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" icon={<HiOutlineTrash />} onClick={() => handleDelete(cat._id)} className="text-error">
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Category' : 'New Category'} size="sm">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Technical"
              required
            />
            <Input
              label="Description"
              type="textarea"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
            />

            <div>
              <label className="input-label">Icon</label>
              <div className="cat-picker-grid">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`cat-picker-item ${formData.icon === icon ? 'cat-picker-active' : ''}`}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Color</label>
              <div className="cat-picker-grid">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`cat-color-item ${formData.color === color ? 'cat-color-active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={saving}>
              {editingId ? 'Update Category' : 'Create Category'}
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default CategoryManagement;
