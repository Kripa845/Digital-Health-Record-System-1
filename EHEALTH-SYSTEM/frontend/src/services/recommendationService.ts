import { buildUrl } from '../config/api';

export interface Recommendation {
  id: number;
  doctor: {
    id: number;
    first_name: string;
    last_name: string;
    specialization: string;
    hospital: string;
    experience_years: number;
  };
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export const getRecommendations = async (): Promise<Recommendation[]> => {
  const res = await fetch(buildUrl('doctors/recommendations/'));
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
};
