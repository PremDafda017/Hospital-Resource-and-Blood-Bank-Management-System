import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaDroplet,
  FaCalendar,
  FaHospital,
  FaPencil,
  FaPrint,
  FaFileMedical,
  FaMapLocationDot,
  FaIdCard,
  FaHeartPulse
} from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import './Patients.css';

/* Design Tokens */
const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const RED_DARK = "#8B0000";
const RED_GLOW = "rgba(196,18,48,0.15)";
const SLATE = "#1E293B";
const SLATE_MD = "#334155";
const SLATE_LT = "#64748B";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";
const BORDER = "#E2E8F0";

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const storedPatients = localStorage.getItem('patients');
        let foundPatient = null;
        if (storedPatients) {
          const patientsList = JSON.parse(storedPatients);
          foundPatient = patientsList.find(p => String(p.id) === String(id));
        }

        setTimeout(() => {
          if (foundPatient) {
            // split name into first and last if needed
            const nameParts = foundPatient.name ? foundPatient.name.split(' ') : ['User', ''];
            setPatient({
              ...foundPatient,
              firstName: foundPatient.firstName || nameParts[0],
              lastName: foundPatient.lastName || nameParts.slice(1).join(' '),
            });
          } else {
            // Mock data fallback
            const mockPatient = {
              id: id,
              firstName: 'John',
              lastName: 'Smith',
              dateOfBirth: '1979-05-15',
              gender: 'Male',
              bloodType: 'A+',
              phone: '555-0101',
              email: 'john.smith@email.com',
              address: '123 Main St, City, State 12345',
              emergencyContact: 'Jane Smith',
              emergencyPhone: '555-0102',
              medicalHistory: 'Hypertension, Type 2 Diabetes',
              allergies: 'Penicillin',
              currentCondition: 'Critical',
              admissionDate: '2024-01-15',
              assignedDoctor: 'Dr. Sarah Johnson',
              roomNumber: 'ICU-301',
              insuranceProvider: 'Blue Cross',
              insuranceNumber: 'BC123456789',
              status: 'Active'
            };
            setPatient(mockPatient);
          }
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching patient details:', error);
        setLoading(false);
      }
    };
    fetchPatientDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout title="Patient Files" subtitle="Verifying clinical dossier..." activeTab="/patients">
        <div className="page-loading" style={{ minHeight: '300px' }}>
          <span className="btn-spinner" />
          <p>Loading patient records…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout title="Patient Files" subtitle="Operational Console" activeTab="/patients">
        <div className="empty-state">
          <h3>Patient record not found</h3>
          <button 
            className="btn-primary"
            onClick={() => navigate('/patients')}
          >
            Back to Patients
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Patient Profile Details" subtitle={`Viewing record for ${patient.firstName} ${patient.lastName}`} activeTab="/patients">
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button 
            onClick={() => navigate('/patients')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '12px',
              border: `1px solid ${BORDER}`, background: WHITE,
              color: SLATE, fontFamily: FONT, fontWeight: 600,
              fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = SMOKE; }}
            onMouseLeave={e => { e.currentTarget.style.background = WHITE; }}
          >
            <FaArrowLeft /> Back to Patients
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handlePrint}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', borderRadius: '12px',
                border: `1px solid ${BORDER}`, background: WHITE,
                color: SLATE, fontFamily: FONT, fontWeight: 600,
                fontSize: '0.9rem', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = SMOKE; }}
              onMouseLeave={e => { e.currentTarget.style.background = WHITE; }}
            >
              <FaPrint /> Print
            </button>
            <button 
              onClick={() => navigate(`/patients/${id}/edit`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px',
                border: 'none', background: RED,
                color: WHITE, fontFamily: FONT, fontWeight: 700,
                fontSize: '0.9rem', cursor: 'pointer',
                boxShadow: `0 4px 14px ${RED_GLOW}`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${RED_GLOW}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px ${RED_GLOW}`; }}
            >
              <FaPencil /> Edit Patient
            </button>
          </div>
        </div>

        {/* Patient Header Card */}
        <div style={{
          background: WHITE, borderRadius: '20px',
          border: `1px solid ${BORDER}`, padding: '32px',
          marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Profile Image */}
            {patient.profileImage ? (
              <img 
                src={patient.profileImage} 
                alt={`${patient.firstName} ${patient.lastName}`}
                style={{
                  width: '120px', height: '120px', borderRadius: '20px',
                  objectFit: 'cover', flexShrink: 0,
                  border: `3px solid ${BORDER}`
                }}
              />
            ) : (
              <div style={{
                width: '120px', height: '120px', borderRadius: '20px',
                background: `linear-gradient(135deg,${RED},${RED_DARK})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: WHITE, fontWeight: 800, fontSize: '2.5rem',
                flexShrink: 0
              }}>
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
            )}
            
            {/* Patient Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h1 style={{
                    fontFamily: FONT, fontWeight: 800, fontSize: '1.8rem',
                    color: SLATE, marginBottom: '8px', lineHeight: 1.2
                  }}>
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '6px 14px', borderRadius: '20px',
                      background: 'rgba(196,18,48,0.12)', color: RED,
                      fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      {patient.bloodType}
                    </span>
                    <span style={{
                      padding: '6px 14px', borderRadius: '20px',
                      background: 'rgba(22,163,74,0.12)', color: '#16A34A',
                      fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      {patient.status}
                    </span>
                    <span style={{
                      padding: '6px 14px', borderRadius: '20px',
                      background: 'rgba(245,158,11,0.12)', color: '#F59E0B',
                      fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      {patient.currentCondition || patient.condition}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: SLATE_MD, fontSize: '0.9rem' }}>
                  <FaCalendar style={{ color: SLATE_LT }} />
                  <span>DOB: <strong style={{ color: SLATE }}>{patient.dateOfBirth || 'N/A'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: SLATE_MD, fontSize: '0.9rem' }}>
                  <FaUser style={{ color: SLATE_LT }} />
                  <span>Gender: <strong style={{ color: SLATE }}>{patient.gender || 'N/A'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: SLATE_MD, fontSize: '0.9rem' }}>
                  <FaDroplet style={{ color: SLATE_LT }} />
                  <span>Blood Type: <strong style={{ color: SLATE }}>{patient.bloodType}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: SLATE_MD, fontSize: '0.9rem' }}>
                  <FaPhone style={{ color: SLATE_LT }} />
                  <span>{patient.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* Personal Information */}
          <div style={{
            background: WHITE, borderRadius: '20px',
            border: `1px solid ${BORDER}`, padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              fontFamily: FONT, fontWeight: 700, fontSize: '1.1rem',
              color: SLATE, marginBottom: '20px', display: 'flex',
              alignItems: 'center', gap: '10px'
            }}>
              <FaUser style={{ color: RED }} /> Personal Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Full Name</label>
                <span style={{ color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>{patient.firstName} {patient.lastName}</span>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Date of Birth</label>
                <span style={{ color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>{patient.dateOfBirth || 'N/A'}</span>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Gender</label>
                <span style={{ color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>{patient.gender || 'N/A'}</span>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Email</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>
                  <FaEnvelope style={{ color: SLATE_LT, fontSize: '0.9rem' }} />
                  <span>{patient.email || 'N/A'}</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Address</label>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>
                  <FaMapLocationDot style={{ color: SLATE_LT, fontSize: '0.9rem', marginTop: '2px' }} />
                  <span>{patient.address || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div style={{
            background: WHITE, borderRadius: '20px',
            border: `1px solid ${BORDER}`, padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              fontFamily: FONT, fontWeight: 700, fontSize: '1.1rem',
              color: SLATE, marginBottom: '20px', display: 'flex',
              alignItems: 'center', gap: '10px'
            }}>
              <FaPhone style={{ color: RED }} /> Emergency Contact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Contact Name</label>
                <span style={{ color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>{patient.emergencyContact || 'N/A'}</span>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Contact Phone</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>
                  <FaPhone style={{ color: SLATE_LT, fontSize: '0.9rem' }} />
                  <span>{patient.emergencyPhone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div style={{
            background: WHITE, borderRadius: '20px',
            border: `1px solid ${BORDER}`, padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              fontFamily: FONT, fontWeight: 700, fontSize: '1.1rem',
              color: SLATE, marginBottom: '20px', display: 'flex',
              alignItems: 'center', gap: '10px'
            }}>
              <FaFileMedical style={{ color: RED }} /> Medical Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Medical History</label>
                <span style={{ color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>{patient.medicalHistory || 'None recorded'}</span>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Allergies</label>
                <span style={{ 
                  color: patient.allergies ? '#EF4444' : SLATE, 
                  fontSize: '0.95rem', fontWeight: 500 
                }}>
                  {patient.allergies || 'No known allergies'}
                </span>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Current Condition</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '12px',
                    background: 'rgba(245,158,11,0.12)', color: '#F59E0B',
                    fontWeight: 700, fontSize: '0.85rem'
                  }}>
                    {patient.currentCondition || patient.condition}
                  </span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Admission Date</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>
                  <FaCalendar style={{ color: SLATE_LT, fontSize: '0.9rem' }} />
                  <span>{patient.admissionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Details */}
          <div style={{
            background: WHITE, borderRadius: '20px',
            border: `1px solid ${BORDER}`, padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              fontFamily: FONT, fontWeight: 700, fontSize: '1.1rem',
              color: SLATE, marginBottom: '20px', display: 'flex',
              alignItems: 'center', gap: '10px'
            }}>
              <FaHospital style={{ color: RED }} /> Hospital Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Assigned Doctor</label>
                <span style={{ color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>{patient.assignedDoctor || 'Unassigned'}</span>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Room Number</label>
                <span style={{ color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>{patient.roomNumber || 'Outpatient'}</span>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Insurance Provider</label>
                <span style={{ color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>{patient.insuranceProvider || 'None'}</span>
              </div>
              <div>
                <label style={{ display: 'block', color: SLATE_LT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Insurance Number</label>
                <span style={{ color: SLATE, fontSize: '0.95rem', fontWeight: 500 }}>{patient.insuranceNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PatientDetails;