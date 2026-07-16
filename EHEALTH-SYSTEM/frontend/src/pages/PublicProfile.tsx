import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

interface EmergencyContact {
  id: number;
  name: string;
  relationship: string;
  phone: string;
}

interface MedicalDocument {
  id: number;
  title: string;
  file: string;
}

interface PatientProfile {
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  allergies: string;
  medical_conditions: string;
  emergency_contacts: EmergencyContact[];
  documents: MedicalDocument[];
}

export default function PublicProfile() {
  const { token } = useParams<{ token: string }>();

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/public-profile/${token}/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Patient not found");
        }
        return res.json();
      })
      .then((data) => {
        setPatient(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Patient not found.");
        setLoading(false);
      });
  }, [token]);

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  if (!patient) return null;

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1>Mero Care Card</h1>
      <h2>Patient Information</h2>

      <p><strong>Name:</strong> {patient.full_name}</p>
      <p><strong>Age:</strong> {patient.age}</p>
      <p><strong>Gender:</strong> {patient.gender}</p>
      <p><strong>Blood Group:</strong> {patient.blood_group}</p>
      <p><strong>Allergies:</strong> {patient.allergies}</p>
      <p><strong>Medical Conditions:</strong> {patient.medical_conditions}</p>

      <hr />

      <h3>Emergency Contacts</h3>

      {patient.emergency_contacts.length === 0 ? (
        <p>No emergency contacts.</p>
      ) : (
        <ul>
          {patient.emergency_contacts.map((contact) => (
            <li key={contact.id}>
              <strong>{contact.name}</strong>
              <br />
              {contact.relationship}
              <br />
              {contact.phone}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Medical Documents</h3>

      {patient.documents.length === 0 ? (
        <p>No documents uploaded.</p>
      ) : (
        <ul>
          {patient.documents.map((doc) => (
            <li key={doc.id}>
              <a
                href={doc.file}
                target="_blank"
                rel="noopener noreferrer"
              >
                {doc.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}