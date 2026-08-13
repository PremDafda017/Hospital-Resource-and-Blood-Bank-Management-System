import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDroplet, FaChartBar, FaDownload } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import './Reports.css';

function BloodReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Blood Stock Audit Ledger" subtitle={`Viewing report sequence ID #${id}`} activeTab="/reports">
      <div className="blood-report-page">
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
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-h)', fontSize: '1.25rem', marginBottom: '16px' }}><FaDroplet /> Blood Stock Overview</h2>
            <div className="stock-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="summary-card" style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '0.75rem', background: 'rgba(239, 68, 68, 0.05)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Total Stock</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-h)', margin: '8px 0 0' }}>1,234 units</p>
              </div>
              <div className="summary-card" style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '0.75rem', background: 'rgba(239, 68, 68, 0.05)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Critical Types</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#EF4444', margin: '8px 0 0' }}>O- (12 units)</p>
              </div>
              <div className="summary-card" style={{ padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '0.75rem', background: 'rgba(16, 185, 129, 0.05)' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>This Week</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981', margin: '8px 0 0' }}>+45 units</p>
              </div>
            </div>
          </div>

          <div className="report-section" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-h)', fontSize: '1.25rem', marginBottom: '16px' }}><FaChartBar /> Blood Type Distribution</h2>
            <div className="chart-placeholder" style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--card-border)', borderRadius: '0.75rem', color: 'var(--text-muted)' }}>
              <p>Type distribution bar charts and donor records dashboard visualization will load here dynamically.</p>
            </div>
          </div>

          <div className="report-section" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '1.5rem', borderRadius: '1rem' }}>
            <h2 style={{ color: 'var(--text-h)', fontSize: '1.25rem', marginBottom: '16px' }}>Recent Activity Audit</h2>
            <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="activity-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--main-bg)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                <span className="activity-type" style={{ fontWeight: 'bold', color: '#10B981' }}>Added</span>
                <span style={{ color: 'var(--text-b)' }}>5 units of O+ on Jan 20</span>
              </div>
              <div className="activity-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--main-bg)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                <span className="activity-type" style={{ fontWeight: 'bold', color: '#EF4444' }}>Used</span>
                <span style={{ color: 'var(--text-b)' }}>2 units of A- on Jan 19</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default BloodReport;