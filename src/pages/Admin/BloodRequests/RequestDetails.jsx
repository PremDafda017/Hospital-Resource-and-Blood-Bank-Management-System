import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeartPulse, FaUser, FaCalendar, FaClock, FaCheck, FaXmark, FaHospital, FaLocationDot } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout.jsx';
import { bloodBankDatabase } from '../../../data/hospitalData.js';
import './BloodRequests.css';

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestDetails = () => {
      try {
        const storedRequests = localStorage.getItem('bloodRequests');
        let foundRequest = null;
        if (storedRequests) {
          const list = JSON.parse(storedRequests);
          foundRequest = list.find(r => String(r.id) === String(id));
        }

        setTimeout(() => {
          if (foundRequest) {
            setRequest(foundRequest);
          } else {
            // Mock fallback
            setRequest({
              id: id,
              bloodType: 'O+',
              units: 2,
              patient: 'Prem Dafda',
              urgency: 'Critical',
              date: '2024-01-20',
              status: 'Pending',
              hospital: 'Safdarjung Hospital',
              hospitalId: 6,
              state: 'Delhi',
              city: 'New Delhi'
            });
          }
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setLoading(false);
      }
    };
    fetchRequestDetails();
  }, [id]);

  const handleUpdateStatus = (newStatus) => {
    if (!request) return;
    const storedRequests = localStorage.getItem('bloodRequests');
    if (storedRequests) {
      const list = JSON.parse(storedRequests);
      const updated = list.map(r => {
        if (String(r.id) === String(id)) {
          return { ...r, status: newStatus };
        }
        return r;
      });
      localStorage.setItem('bloodRequests', JSON.stringify(updated));
    }
    setRequest(prev => ({ ...prev, status: newStatus }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Request Dossier" subtitle="Accessing clinical ledger..." activeTab="/blood-requests">
        <div className="page-loading" style={{ minHeight: '300px' }}>
          <span className="btn-spinner" />
          <p>Loading request details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout title="Request Dossier" subtitle="Dossier status" activeTab="/blood-requests">
        <div className="empty-state">
          <h3>Request not found</h3>
          <button className="btn-primary" onClick={() => navigate('/blood-requests')}>
            Back to Requests
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const getUrgencyClass = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return 'urgency-critical';
      case 'high': return 'urgency-high';
      default: return 'urgency-normal';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <DashboardLayout title="Request Ledger Dossier" subtitle={`Viewing record for allocation ID #${request.id}`} activeTab="/blood-requests">
      <div className="request-details-page">
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/blood-requests')}>
            <FaArrowLeft /> Back to Requests
          </button>
          <h2>Request Ledger</h2>
          <div />
        </div>

        <div className="request-details-container">
          <div className="detail-card request-header-card" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
            <div className="blood-type-badge-large" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 'bold' }}>
              {request.bloodType}
            </div>
            <div className="request-header-info">
              <h2>{request.units} Units Required</h2>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span className={`badge ${getUrgencyClass(request.urgency)}`}>{request.urgency} Urgency</span>
                <span className={`badge ${getStatusClass(request.status)}`}>{request.status}</span>
              </div>
            </div>
          </div>

          <div className="detail-card" style={{ marginBottom: '24px' }}>
            <h3><FaHeartPulse /> Allocation Details</h3>
            <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div className="detail-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Patient Name</label>
                <span style={{ fontSize: '1rem', color: 'var(--text-h)', fontWeight: 'bold' }}><FaUser /> {request.patient}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Requesting Facility</label>
                <span style={{ fontSize: '1rem', color: 'var(--text-h)' }}><FaHospital /> {request.hospital || 'General Hospital'}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Location</label>
                <span style={{ fontSize: '1rem', color: 'var(--text-h)' }}><FaLocationDot /> {request.city || ''}, {request.state || ''}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Date Lodged</label>
                <span style={{ fontSize: '1rem', color: 'var(--text-h)' }}><FaCalendar /> {request.date}</span>
              </div>
              <div className="detail-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Status State</label>
                <span style={{ fontSize: '1rem', color: 'var(--text-h)' }}><FaClock /> {request.status}</span>
              </div>
            </div>
          </div>

          {request.status?.toLowerCase() === 'pending' && (
            <div className="detail-card actions-card" style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" style={{ background: '#10B981', borderColor: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleUpdateStatus('Approved')}>
                <FaCheck /> Approve Request
              </button>
              <button className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleUpdateStatus('Rejected')}>
                <FaXmark /> Reject Request
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RequestDetails;
