import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHandHoldingMedical, FaDroplet, FaEnvelope, FaPhone, FaCalendar, FaLocationDot, FaPencil } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout.jsx';
import './Donors.css';

function DonorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorDetails = async () => {
      try {
        const storedDonors = localStorage.getItem('donors');
        let foundDonor = null;
        if (storedDonors) {
          const donorsList = JSON.parse(storedDonors);
          foundDonor = donorsList.find(d => String(d.id) === String(id));
        }

        setTimeout(() => {
          if (foundDonor) {
            const nameParts = foundDonor.name ? foundDonor.name.split(' ') : ['Donor', ''];
            setDonor({
              ...foundDonor,
              firstName: foundDonor.firstName || nameParts[0],
              lastName: foundDonor.lastName || nameParts.slice(1).join(' '),
            });
          } else {
            const mockDonor = {
              id: id,
              firstName: 'Robert',
              lastName: 'Davis',
              dateOfBirth: '1985-08-12',
              gender: 'Male',
              bloodType: 'O+',
              email: 'robert.davis@email.com',
              phone: '555-0301',
              address: '789 Donor Lane, City, State 12345',
              emergencyContact: 'Mary Davis',
              emergencyPhone: '555-0304',
              medicalConditions: 'None',
              lastDonation: '2024-01-10',
              totalDonations: 12,
              status: 'Active'
            };
            setDonor(mockDonor);
          }
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching donor details:', error);
        setLoading(false);
      }
    };
    fetchDonorDetails();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Donor Dossier" subtitle="Loading registry record..." activeTab="/donors">
        <div className="page-loading" style={{ minHeight: '300px' }}>
          <span className="btn-spinner" />
          <p>Loading donor details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!donor) {
    return (
      <DashboardLayout title="Donor Dossier" subtitle="Dossier status" activeTab="/donors">
        <div className="empty-state">
          <h3>Donor details not found</h3>
          <button className="btn-primary" onClick={() => navigate('/donors')}>
            Back to Donors
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Donor Dossier Profile" subtitle={`Viewing record for ${donor.firstName} ${donor.lastName}`} activeTab="/donors">
      <div className="donor-details-page">
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/donors')}>
            <FaArrowLeft /> Back to Donors
          </button>
          <button className="btn-secondary" onClick={() => navigate(`/donors/${id}/edit`)}>
            <FaPencil /> Edit
          </button>
        </div>

        <div className="donor-details-container">
          <div className="detail-card donor-header-card">
            <div className="blood-type-badge-large">{donor.bloodType}</div>
            <div className="donor-header-info">
              <h2>{donor.firstName} {donor.lastName}</h2>
              <div className="donor-status-badge badge-success">{donor.status}</div>
              <div className="donor-basic-info">
                <span><FaDroplet /> {donor.totalDonations} donations</span>
                <span><FaCalendar /> Last: {donor.lastDonation}</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3><FaHandHoldingMedical /> Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-row"><label>Full Name</label><span>{donor.firstName} {donor.lastName}</span></div>
              <div className="detail-row"><label>Date of Birth</label><span>{donor.dateOfBirth}</span></div>
              <div className="detail-row"><label>Gender</label><span>{donor.gender}</span></div>
              <div className="detail-row"><label>Blood Type</label><span>{donor.bloodType}</span></div>
              <div className="detail-row"><label>Email</label><span><FaEnvelope /> {donor.email}</span></div>
              <div className="detail-row"><label>Phone</label><span><FaPhone /> {donor.phone}</span></div>
              <div className="detail-row"><label>Address</label><span><FaLocationDot /> {donor.address}</span></div>
            </div>
          </div>

          <div className="detail-card">
            <h3><FaPhone /> Emergency Contact</h3>
            <div className="detail-grid">
              <div className="detail-row"><label>Contact Name</label><span>{donor.emergencyContact}</span></div>
              <div className="detail-row"><label>Contact Phone</label><span><FaPhone /> {donor.emergencyPhone}</span></div>
            </div>
          </div>

          <div className="detail-card">
            <h3><FaDroplet /> Donation Information</h3>
            <div className="detail-grid">
              <div className="detail-row"><label>Total Donations</label><span>{donor.totalDonations}</span></div>
              <div className="detail-row"><label>Last Donation</label><span>{donor.lastDonation}</span></div>
              <div className="detail-row"><label>Medical Conditions</label><span>{donor.medicalConditions}</span></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DonorDetails;
