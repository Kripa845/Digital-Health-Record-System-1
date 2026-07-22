export interface PatientProfileData {
  id: number;
  healthcare_id: string;
  date_of_birth: string | null;
  gender: string;
  blood_type: string;
  contact_number: string;
  address: string;
  age: number | null;
  blood_group: string;
  emergency_contact: string;
  major_allergies: string;
  height: string;
  weight: string;
  active_prescription: string;
  current_medication: string;
  recent_pain: string;
  is_profile_setup: boolean;
  qr_token: string;
  scan_count?: number;
  last_scanned_at?: string | null;
}

export interface FamilyMemberData {
  id: number;
  first_name: string;
  last_name: string;
  relationship: string;
  age: number | null;
  gender: string;
  blood_group: string;
  emergency_contact: string;
  major_allergies: string;
  height: string;
  weight: string;
  active_prescription: string;
  current_medication: string;
  recent_pain: string;
  qr_token: string;
  scan_count?: number;
  last_scanned_at?: string | null;
}

export interface DocumentData {
  id: number;
  title: string;
  file_url: string;
  file_size: string;
  file_type: string;
  uploaded_at: string;
}