import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaDownload } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import './Reports.css';

function PatientReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Patient Auditing Dossier" subtitle={`Viewing stats report sequence ID #${id}`} activeTab="/reports">
      <div className="patient-report-page">
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/reports')}>
            <FaArrowLeft /> Back to Reports
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaDownload /> Download PDF
          </button>
        </div>

        <div className="report-content">
          <div className="report-section" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-h)', fontSize: '1.25rem', marginBottom: '16px' }}><FaUsers /> Patient Overview</h2>
            <div className="stock-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="summary-card" style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.05)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Total Patients</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-h)', margin: '8px 0 0' }}>1,456</p>
              </div>
              <div className="summary-card" style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '0.75rem', background: 'rgba(59, 130, 246, 0.05)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Active Cases</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3B82F6', margin: '8px 0 0' }}>892</p>
              </div>
              <div className="summary-card" style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '0.75rem', background: 'rgba(16, 185, 129, 0.05)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>This Month</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981', margin: '8px 0 0' }}>+127</p>
              </div>
            </div>
          </div>

          <div className="report-section" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '24px' }}>
            <h2 style={{ color: 'var(--text-h)', fontSize: '1.25rem', marginBottom: '16px' }}>Patient Demographics</h2>
            <div className="chart-placeholder" style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--card-border)', borderRadius: '0.75rem', color: 'var(--text-muted)' }}>
              <p>Demographics, age distribution, and gender split visual analytics will load here dynamically.</p>
            </div>
          </div>

          <div className="report-section" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '1.5rem', borderRadius: '1rem' }}>
            <h2 style={{ color: 'var(--text-h)', fontSize: '1.25rem', marginBottom: '16px' }}>Recent Admissions Audit</h2>
            <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="activity-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--main-bg)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                <span className="activity-type" style={{ fontWeight: 'bold', color: '#3B82F6' }}>Admitted</span>
                <span style={{ color: 'var(--text-b)' }}>John Smith - Cardiology on Jan 20</span>
              </div>
              <div className="activity-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--main-bg)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                <span className="activity-type" style={{ fontWeight: 'bold', color: '#3B82F6' }}>Admitted</span>
                <span style={{ color: 'var(--text-b)' }}>Mary Johnson - Pediatrics on Jan 19</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PatientReport;