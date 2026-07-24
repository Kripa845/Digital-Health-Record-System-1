import { buildUrl, ENDPOINTS } from '../config/api';

export interface Doctor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  specialization: string;
  license_number: string;
  hospital: string;
  experience_years: number;
  bio: string;
  phone: string;
}

export const getDoctors = async (): Promise<Doctor[]> => {
  const res = await fetch(buildUrl(ENDPOINTS.DOCTORS_LIST));
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
};
