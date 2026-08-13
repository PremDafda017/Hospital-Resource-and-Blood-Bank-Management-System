import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserDoctor, FaStethoscope, FaEnvelope, FaPhone, FaGraduationCap, FaPencil, FaStar, FaClock } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import './Doctors.css';

function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const storedDoctors = localStorage.getItem('doctors');
        let foundDoctor = null;
        if (storedDoctors) {
          const doctorsList = JSON.parse(storedDoctors);
          foundDoctor = doctorsList.find(d => String(d.id) === String(id));
        }

        setTimeout(() => {
          if (foundDoctor) {
            const nameParts = foundDoctor.name ? foundDoctor.name.split(' ') : ['Doctor', ''];
            setDoctor({
              ...foundDoctor,
              firstName: foundDoctor.firstName || nameParts[0],
              lastName: foundDoctor.lastName || nameParts.slice(1).join(' '),
            });
          } else {
            // Mock fallback
            const mockDoctor = {
              id: id,
              firstName: 'Sarah',
              lastName: 'Johnson',
              dateOfBirth: '1980-03-20',
              gender: 'Female',
              specialty: 'Cardiology',
              qualification: 'MD, FACC',
              experience: 15,
              email: 'sarah.johnson@hospital.com',
              phone: '555-0201',
              address: '456 Medical Center Dr, City, State 12345',
              department: 'Cardiology',
              licenseNumber: 'MD123456',
              availability: 'Available',
              consultationFee: 150,
              rating: 4.8,
              biography: 'Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in treating various heart conditions. She specializes in interventional cardiology and has published numerous research papers.',
              status: 'Active'
            };
            setDoctor(mockDoctor);
          }
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        setLoading(false);
      }
    };
    fetchDoctorDetails();
  }, [id]);

  const getRatingStars = (rating) => {
    const stars = [];
    const val = rating || 5.0;
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(val)) {
        stars.push(<FaStar key={i} className="star-filled" style={{ color: '#FBBF24', marginRight: '2px' }} />);
      } else {
        stars.push(<FaStar key={i} className="star-empty" style={{ color: '#CBD5E1', marginRight: '2px' }} />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <DashboardLayout title="Doctor Profile" subtitle="Accessing practitioner database..." activeTab="/doctors">
        <div className="page-loading" style={{ minHeight: '300px' }}>
          <span className="btn-spinner" />
          <p>Loading profile records…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!doctor) {
    return (
      <DashboardLayout title="Doctor Profile" subtitle="Access dossier" activeTab="/doctors">
        <div className="empty-state">
          <h3>Doctor details not found</h3>
          <button className="btn-primary" onClick={() => navigate('/doctors')}>
            Back to Doctors
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Practitioner Dossier Profile" subtitle={`Viewing details for Dr. ${doctor.firstName} ${doctor.lastName}`} activeTab="/doctors">
      <div className="doctor-details-page">
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <button className="btn-outline" onClick={() => navigate('/doctors')}>
            <FaArrowLeft /> Back to Doctors
          </button>
        </div>

        <div className="doctor-details-container">
          <div className="detail-card doctor-header-card">
            <div className="doctor-avatar-large">
              {doctor.firstName[0] || 'D'}{doctor.lastName[0] || ''}
            </div>
            <div className="doctor-header-info">
              <h2>Dr. {doctor.firstName} {doctor.lastName}</h2>
              <div className="doctor-specialty">{doctor.specialty}</div>
              <div className="doctor-rating">
                {getRatingStars(doctor.rating)}
                <span>({doctor.rating || '5.0'} rating)</span>
              </div>
              <div className="doctor-basic-info">
                <span><FaClock /> {doctor.experience} years experience</span>
                <span className="badge badge-success">{doctor.availability}</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3><FaUserDoctor /> Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-row"><label>Full Name</label><span>Dr. {doctor.firstName} {doctor.lastName}</span></div>
              <div className="detail-row"><label>Date of Birth</label><span>{doctor.dateOfBirth || 'N/A'}</span></div>
              <div className="detail-row"><label>Gender</label><span>{doctor.gender || 'N/A'}</span></div>
              <div className="detail-row"><label>Email</label><span><FaEnvelope /> {doctor.email}</span></div>
              <div className="detail-row"><label>Phone</label><span><FaPhone /> {doctor.phone}</span></div>
              <div className="detail-row"><label>Address</label><span>{doctor.address || 'N/A'}</span></div>
            </div>
          </div>

          <div className="detail-card">
            <h3><FaStethoscope /> Professional Information</h3>
            <div className="detail-grid">
              <div className="detail-row"><label>Specialty</label><span>{doctor.specialty}</span></div>
              <div className="detail-row"><label>Qualification</label><span>{doctor.qualification}</span></div>
              <div className="detail-row"><label>Department</label><span>{doctor.department || doctor.specialty}</span></div>
              <div className="detail-row"><label>Experience</label><span>{doctor.experience} years</span></div>
              <div className="detail-row"><label>License Number</label><span>{doctor.licenseNumber || 'N/A'}</span></div>
              <div className="detail-row"><label>Consultation Fee</label><span>${doctor.consultationFee || 'N/A'}</span></div>
            </div>
          </div>

          <div className="detail-card">
            <h3><FaGraduationCap /> Biography</h3>
            <p className="biography-text">{doctor.biography || 'No biography recorded.'}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DoctorDetails;