import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, ChevronLeft, Trash2, Edit3, X } from 'lucide-react';
import { colors, glassCard, glassCardLight, glassCardInput, label, value } from '../theme/theme';

interface PatientRow {
  id: number;
  healthcare_id: string;
  date_of_birth: string | null;
  gender: string;
  blood_group: string;
  emergency_contact: string;
  address: string;
  height: string;
  weight: string;
  major_allergies: string;
  active_prescription: string;
  current_medication: string;
  recent_pain: string;
  user: { first_name: string; last_name: string; email: string; username: string; contact_number?: string };
}

const emptyForm: Omit<PatientRow, 'id' | 'healthcare_id'> = {
  user: { first_name: '', last_name: '', email: '', username: '', contact_number: '' },
  date_of_birth: '',
  gender: '',
  blood_group: '',
  emergency_contact: '',
  address: '',
  height: '',
  weight: '',
  major_allergies: '',
  active_prescription: '',
  current_medication: '',
  recent_pain: '',
};

export const AdminPatientManagement: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/patients/');
      if (res.ok) setPatients(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [apiFetch]);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const fullName = `${p.user.first_name} ${p.user.last_name}`.toLowerCase();
    return (
      fullName.includes(q) ||
      p.healthcare_id.toLowerCase().includes(q) ||
      p.user.email.toLowerCase().includes(q) ||
      p.user.username.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const startEdit = (p: PatientRow) => {
    setEditingId(p.id);
    setShowForm(true);
    setForm({
      user: {
        first_name: p.user.first_name,
        last_name: p.user.last_name,
        email: p.user.email,
        username: p.user.username,
        contact_number: p.user.contact_number || '',
      },
      date_of_birth: p.date_of_birth || '',
      gender: p.gender,
      blood_group: p.blood_group,
      emergency_contact: p.emergency_contact,
      address: p.address,
      height: p.height,
      weight: p.weight,
      major_allergies: p.major_allergies,
      active_prescription: p.active_prescription,
      current_medication: p.current_medication,
      recent_pain: p.recent_pain,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        first_name: form.user.first_name,
        last_name: form.user.last_name,
        email: form.user.email,
        username: form.user.username,
        contact: form.user.contact_number || '',
        date_of_birth: form.date_of_birth || null,
        gender: form.gender,
        blood_group: form.blood_group,
        emergency_contact: form.emergency_contact,
        address: form.address,
        height: form.height,
        weight: form.weight,
        allergies: form.major_allergies,
        prescription: form.active_prescription,
        medication: form.current_medication,
        pain_log: form.recent_pain,
      };
      if (editingId) {
        const res = await apiFetch(`/patients/${editingId}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Update failed');
      } else {
        const res = await apiFetch('/patients/', {
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
    if (!window.confirm('Delete this patient record?')) return;
    try {
      const res = await apiFetch(`/patients/${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const updateField = (path: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev };
      if (path.startsWith('user.')) {
        const key = path.replace('user.', '') as keyof typeof next.user;
        next.user = { ...next.user, [key]: value };
      } else {
        (next as any)[path] = value;
      }
      return next;
    });
  };

  return (
    <div style={{ background: colors.bgPageGradient, minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: colors.textPrimary, marginBottom: '0.2rem' }}>Patient Management</h1>
            <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Search, create, update, and remove patient records.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: colors.primary, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              <UserPlus size={15} /> {showForm && !editingId ? 'Cancel' : editingId ? 'Cancel Edit' : 'Add Patient'}
            </button>
            <button onClick={() => navigate('/admin/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: colors.bgGlassLight, border: `1px solid ${colors.borderPrimary}`, borderRadius: colors.radiusLg, color: colors.darkGreen, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}><ChevronLeft size={15} /> Back</button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: colors.textPrimary, margin: 0 }}>{editingId ? 'Edit Patient' : 'New Patient'}</h3>
              <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div><label style={label}>First Name</label><input style={glassCardInput} value={form.user.first_name} onChange={(e) => updateField('user.first_name', e.target.value)} required /></div>
              <div><label style={label}>Last Name</label><input style={glassCardInput} value={form.user.last_name} onChange={(e) => updateField('user.last_name', e.target.value)} required /></div>
              <div><label style={label}>Email</label><input type="email" style={glassCardInput} value={form.user.email} onChange={(e) => updateField('user.email', e.target.value)} required /></div>
              <div><label style={label}>Username</label><input style={glassCardInput} value={form.user.username} onChange={(e) => updateField('user.username', e.target.value)} required /></div>
              <div><label style={label}>Contact</label><input style={glassCardInput} value={form.user.contact_number} onChange={(e) => updateField('user.contact_number', e.target.value)} /></div>
              <div><label style={label}>Date of Birth</label><input type="date" style={glassCardInput} value={form.date_of_birth || ''} onChange={(e) => updateField('date_of_birth', e.target.value)} /></div>
              <div><label style={label}>Gender</label><input style={glassCardInput} value={form.gender} onChange={(e) => updateField('gender', e.target.value)} /></div>
              <div><label style={label}>Blood Group</label><input style={glassCardInput} value={form.blood_group} onChange={(e) => updateField('blood_group', e.target.value)} /></div>
              <div><label style={label}>Emergency Contact</label><input style={glassCardInput} value={form.emergency_contact} onChange={(e) => updateField('emergency_contact', e.target.value)} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={label}>Address</label><input style={glassCardInput} value={form.address} onChange={(e) => updateField('address', e.target.value)} /></div>
              <div><label style={label}>Height</label><input style={glassCardInput} value={form.height} onChange={(e) => updateField('height', e.target.value)} /></div>
              <div><label style={label}>Weight</label><input style={glassCardInput} value={form.weight} onChange={(e) => updateField('weight', e.target.value)} /></div>
              <div><label style={label}>Allergies</label><input style={glassCardInput} value={form.major_allergies} onChange={(e) => updateField('major_allergies', e.target.value)} /></div>
              <div><label style={label}>Prescription</label><input style={glassCardInput} value={form.active_prescription} onChange={(e) => updateField('active_prescription', e.target.value)} /></div>
              <div><label style={label}>Medication</label><input style={glassCardInput} value={form.current_medication} onChange={(e) => updateField('current_medication', e.target.value)} /></div>
              <div><label style={label}>Pain Log</label><input style={glassCardInput} value={form.recent_pain} onChange={(e) => updateField('recent_pain', e.target.value)} /></div>
            </div>
            {error && <p style={{ color: colors.errorMain, fontSize: '0.85rem' }}>{error}</p>}
            <button type="submit" disabled={saving} style={{ padding: '0.75rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>
              {saving ? 'Saving...' : editingId ? 'Update Patient' : 'Create Patient'}
            </button>
          </form>
        )}

        <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
            <input type="text" placeholder="Search by name, Healthcare ID, email, or username…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...glassCardInput, paddingLeft: '2.8rem' }} />
          </div>
          {loading ? (
            <p style={{ color: colors.textSecondary }}>Loading patients…</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: colors.bgGlassInput, border: `1px solid ${colors.borderGlass}`, borderRadius: colors.radiusLg, flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: colors.textPrimary }}>{p.user.first_name} {p.user.last_name}</p>
                    <p style={{ fontSize: '0.8rem', color: colors.textSecondary }}>{p.healthcare_id} &bull; {p.user.email} &bull; {p.user.username}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEdit(p)} style={{ padding: '0.4rem 0.8rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusMd, color: colors.onPrimary, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Edit3 size={14} /> Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: '0.4rem 0.8rem', background: colors.errorBg, border: `1px solid ${colors.errorBorder}`, borderRadius: colors.radiusMd, color: colors.errorMain, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ color: colors.textMuted, textAlign: 'center' }}>No patients found.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
