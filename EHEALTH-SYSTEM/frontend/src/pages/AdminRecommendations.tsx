import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, AlertTriangle, Stethoscope, Send } from 'lucide-react';
import { colors, glassCard, glassCardLight, glassCardInput, label, value } from '../theme/theme';

interface RecommendationRow {
  id: number;
  doctor: { id: number; first_name: string; last_name: string; specialization: string; hospital: string; experience_years: number };
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface RankedDoctor {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  department: string;
  hospital: string;
  experience_years: number;
  match_score: number;
}

export const AdminRecommendations: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<RecommendationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [symptom, setSymptom] = useState('');
  const [ranked, setRanked] = useState<RankedDoctor[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/doctors/recommendations/');
        if (res.ok) setItems(await res.json());
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [apiFetch]);

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecommendLoading(true);
    setRecommendError(null);
    setRanked([]);
    try {
      const res = await apiFetch('/recommendations/recommend/', {
        method: 'POST',
        body: JSON.stringify({ symptoms: symptom }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Recommendation failed');
      setRanked(data.results || data);
    } catch (err: any) {
      setRecommendError(err.message || 'Recommendation failed');
    } finally {
      setRecommendLoading(false);
    }
  };

  const priorityColor: Record<string, string> = { high: colors.errorMain, medium: '#e65100', low: colors.secondary };

  return (
    <div style={{ background: colors.bgPageGradient, minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: colors.textPrimary, marginBottom: '0.2rem' }}>Doctor Recommendations</h1>
            <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>System-generated doctor recommendations for patients.</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: colors.bgGlassLight, border: `1px solid ${colors.borderPrimary}`, borderRadius: colors.radiusLg, color: colors.darkGreen, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}><ChevronLeft size={15} /> Back to Dashboard</button>
        </div>

        <form onSubmit={handleRecommend} style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: colors.textPrimary, margin: 0, marginBottom: '0.4rem' }}>Symptom-Based Doctor Match</h3>
          <p style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>Enter patient symptoms to get ranked doctor recommendations by specialization and match score.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g. persistent headache with nausea and blurred vision"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              style={{ ...glassCardInput, flex: 1, minWidth: '240px' }}
              required
            />
            <button type="submit" disabled={recommendLoading} style={{ padding: '0.75rem 1.4rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
              <Send size={16} /> {recommendLoading ? 'Searching...' : 'Get Recommendations'}
            </button>
          </div>
          {recommendError && <p style={{ color: colors.errorMain, fontSize: '0.85rem' }}>{recommendError}</p>}
        </form>

        {recommendLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.gradientPrimaryBtn }} />
          </div>
        )}

        {!recommendLoading && ranked.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ color: colors.textPrimary, margin: 0 }}>Top Matches</h3>
            {ranked.map((doc, idx) => (
              <div key={doc.id} style={{ ...glassCard, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 700, color: colors.textPrimary }}>#{idx + 1} Dr. {doc.first_name} {doc.last_name}</p>
                  <p style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{doc.specialization} &bull; {doc.department} &bull; {doc.hospital} &bull; {doc.experience_years} yrs exp.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: colors.radiusSm, fontSize: '0.8rem', fontWeight: 700, background: colors.tealGhostStrong, border: `1px solid ${colors.borderGlass}`, color: colors.primary }}>
                    Match: {Math.round((doc.match_score || 0) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${colors.borderGlass}`, paddingTop: '2rem' }}>
          <h3 style={{ color: colors.textPrimary, marginBottom: '1rem' }}>Previous Recommendations</h3>
          {loading ? (
            <p style={{ color: colors.textSecondary }}>Loading recommendations…</p>
          ) : items.length === 0 ? (
            <div style={{ ...glassCardLight, textAlign: 'center', padding: '3rem', color: colors.textSecondary }}>
              <AlertTriangle size={32} style={{ marginBottom: '1rem', color: colors.primary }} />
              <p>No recommendations available yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <div key={item.id} style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: colors.textPrimary }}>Dr. {item.doctor.first_name} {item.doctor.last_name}</p>
                      <p style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{item.doctor.specialization} &bull; {item.doctor.hospital} &bull; {item.doctor.experience_years} yrs exp.</p>
                    </div>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: colors.radiusSm, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', background: priorityColor[item.priority] + '18', color: priorityColor[item.priority], border: `1px solid ${priorityColor[item.priority]}40` }}>{item.priority} priority</span>
                  </div>
                  <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}><strong>Reason:</strong> {item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
