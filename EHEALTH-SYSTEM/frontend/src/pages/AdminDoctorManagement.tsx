import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, ChevronLeft, Trash2, Edit3, X, Power } from 'lucide-react';
import { colors, glassCard, glassCardLight, glassCardInput, label, value } from '../theme/theme';

interface DoctorRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialization: string;
  department: string;
  medical_license_number: string;
  phone_number: string;
  status: 'active' | 'inactive';
  username: string;
  experience_years: number;
}

const emptyDoctor = (): Omit<DoctorRow, 'id'> => ({
  first_name: '',
  last_name: '',
  email: '',
  specialization: '',
  department: '',
  medical_license_number: '',
  phone_number: '',
  status: 'active',
  username: '',
  experience_years: 0,
});

export const AdminDoctorManagement: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyDoctor());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/doctors/');
      if (res.ok) setDoctors(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [apiFetch]);

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      (`Dr. ${d.first_name} ${d.last_name}`).toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setForm(emptyDoctor());
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const startEdit = (d: DoctorRow) => {
    setEditingId(d.id);
    setShowForm(true);
    setForm({ ...d });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        specialization: form.specialization,
        department: form.department,
        medical_license_number: form.medical_license_number,
        phone_number: form.phone_number,
        status: form.status,
        username: form.username,
        experience_years: form.experience_years,
      };
      if (editingId) {
        const res = await apiFetch(`/doctors/${editingId}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Update failed');
      } else {
        const res = await apiFetch('/doctors/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Creation failed');
      }
      resetForm();
      load();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this doctor record?')) return;
    try {
      const res = await apiFetch(`/doctors/${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const toggleStatus = async (id: number, current: string) => {
    const next = current === 'active' ? 'inactive' : 'active';
    try {
      const res = await apiFetch(`/doctors/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Status update failed');
      setDoctors((prev) => prev.map((d) => d.id === id ? { ...d, status: next as 'active' | 'inactive' } : d));
    } catch (err: any) {
      setError(err.message || 'Status update failed');
    }
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ background: colors.bgPageGradient, minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: colors.textPrimary, marginBottom: '0.2rem' }}>Doctor Management</h1>
            <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Search, create, update, and manage doctors.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: colors.primary, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              <UserPlus size={15} /> {showForm && !editingId ? 'Cancel' : editingId ? 'Cancel Edit' : 'Add Doctor'}
            </button>
            <button onClick={() => navigate('/admin/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: colors.bgGlassLight, border: `1px solid ${colors.borderPrimary}`, borderRadius: colors.radiusLg, color: colors.darkGreen, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}><ChevronLeft size={15} /> Back</button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: colors.textPrimary, margin: 0 }}>{editingId ? 'Edit Doctor' : 'New Doctor'}</h3>
              <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div><label style={label}>First Name</label><input style={glassCardInput} value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} required /></div>
              <div><label style={label}>Last Name</label><input style={glassCardInput} value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} required /></div>
              <div><label style={label}>Specialization</label><input style={glassCardInput} value={form.specialization} onChange={(e) => updateField('specialization', e.target.value)} required /></div>
              <div><label style={label}>Department</label><input style={glassCardInput} value={form.department} onChange={(e) => updateField('department', e.target.value)} required /></div>
              <div><label style={label}>Medical License Number</label><input style={glassCardInput} value={form.medical_license_number} onChange={(e) => updateField('medical_license_number', e.target.value)} required /></div>
              <div><label style={label}>Phone Number</label><input style={glassCardInput} value={form.phone_number} onChange={(e) => updateField('phone_number', e.target.value)} /></div>
              <div><label style={label}>Email</label><input type="email" style={glassCardInput} value={form.email} onChange={(e) => updateField('email', e.target.value)} required /></div>
              <div><label style={label}>Username</label><input style={glassCardInput} value={form.username} onChange={(e) => updateField('username', e.target.value)} required /></div>
              <div><label style={label}>Experience (years)</label><input type="number" style={glassCardInput} value={form.experience_years} onChange={(e) => updateField('experience_years', parseInt(e.target.value) || 0)} /></div>
              <div><label style={label}>Status</label>
                <select style={glassCardInput} value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            {error && <p style={{ color: colors.errorMain, fontSize: '0.85rem' }}>{error}</p>}
            <button type="submit" disabled={saving} style={{ padding: '0.75rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>
              {saving ? 'Saving...' : editingId ? 'Update Doctor' : 'Create Doctor'}
            </button>
          </form>
        )}

        <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
            <input type="text" placeholder="Search by name, specialization, or email…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...glassCardInput, paddingLeft: '2.8rem' }} />
          </div>
          {loading ? (
            <p style={{ color: colors.textSecondary }}>Loading doctors…</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map((d) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: colors.bgGlassInput, border: `1px solid ${colors.borderGlass}`, borderRadius: colors.radiusLg, flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: colors.textPrimary }}>Dr. {d.first_name} {d.last_name}</p>
                    <p style={{ fontSize: '0.8rem', color: colors.textSecondary }}>{d.specialization} &bull; {d.department} &bull; {d.experience_years} yrs &bull; {d.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => toggleStatus(d.id, d.status)} style={{ padding: '0.4rem 0.8rem', background: d.status === 'active' ? colors.successGhostStrong : colors.errorBg, border: `1px solid ${d.status === 'active' ? colors.successBorder : colors.errorBorder}`, borderRadius: colors.radiusMd, color: d.status === 'active' ? colors.secondary : colors.errorMain, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Power size={14} /> {d.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => startEdit(d)} style={{ padding: '0.4rem 0.8rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusMd, color: colors.onPrimary, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Edit3 size={14} /> Edit</button>
                    <button onClick={() => handleDelete(d.id)} style={{ padding: '0.4rem 0.8rem', background: colors.errorBg, border: `1px solid ${colors.errorBorder}`, borderRadius: colors.radiusMd, color: colors.errorMain, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ color: colors.textMuted, textAlign: 'center' }}>No doctors found.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
