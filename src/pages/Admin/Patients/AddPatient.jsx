import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaPhone, FaFileMedical, FaHospital, FaCamera, FaUpload } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import './Patients.css';

function AddPatient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: '',
    allergies: '',
    currentCondition: '',
    admissionDate: '',
    assignedDoctor: '',
    roomNumber: '',
    insuranceProvider: '',
    insuranceNumber: ''
  });

  useEffect(() => {
    if (isEditMode) {
      const storedPatients = localStorage.getItem('patients');
      if (storedPatients) {
        const patientsList = JSON.parse(storedPatients);
        const p = patientsList.find(item => String(item.id) === String(id));
        if (p) {
          const nameParts = p.name ? p.name.split(' ') : ['', ''];
          setFormData({
            firstName: p.firstName || nameParts[0] || '',
            lastName: p.lastName || nameParts.slice(1).join(' ') || '',
            dateOfBirth: p.dateOfBirth || '',
            gender: p.gender || '',
            bloodType: p.bloodType || '',
            phone: p.phone || '',
            email: p.email || '',
            address: p.address || '',
            emergencyContact: p.emergencyContact || '',
            emergencyPhone: p.emergencyPhone || '',
            medicalHistory: p.medicalHistory || '',
            allergies: p.allergies || '',
            currentCondition: p.currentCondition || p.condition || '',
            admissionDate: p.admissionDate || '',
            assignedDoctor: p.assignedDoctor || '',
            roomNumber: p.roomNumber || '',
            insuranceProvider: p.insuranceProvider || '',
            insuranceNumber: p.insuranceNumber || ''
          });
          if (p.profileImage) {
            setImagePreview(p.profileImage);
          }
        }
      }
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.bloodType) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const calculateAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');

      if (isEditMode) {
        const updatedPatients = existingPatients.map(p => {
          if (String(p.id) === String(id)) {
            return {
              ...p,
              name: `${formData.firstName} ${formData.lastName}`,
              age: formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : p.age,
              bloodType: formData.bloodType,
              condition: formData.currentCondition || 'Stable',
              phone: formData.phone,
              email: formData.email || '',
              admissionDate: formData.admissionDate || p.admissionDate,
              dateOfBirth: formData.dateOfBirth,
              gender: formData.gender,
              address: formData.address,
              emergencyContact: formData.emergencyContact,
              emergencyPhone: p.emergencyPhone,
              medicalHistory: formData.medicalHistory,
              allergies: formData.allergies,
              assignedDoctor: formData.assignedDoctor,
              roomNumber: formData.roomNumber,
              insuranceProvider: formData.insuranceProvider,
              insuranceNumber: formData.insuranceNumber,
              profileImage: profileImage || p.profileImage
            };
          }
          return p;
        });
        localStorage.setItem('patients', JSON.stringify(updatedPatients));
      } else {
        const newPatient = {
          id: Date.now(),
          name: `${formData.firstName} ${formData.lastName}`,
          age: formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 0,
          bloodType: formData.bloodType,
          condition: formData.currentCondition || 'Stable',
          phone: formData.phone,
          email: formData.email || '',
          admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
          status: 'Active',
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          medicalHistory: formData.medicalHistory,
          allergies: formData.allergies,
          assignedDoctor: formData.assignedDoctor,
          roomNumber: formData.roomNumber,
          insuranceProvider: formData.insuranceProvider,
          insuranceNumber: formData.insuranceNumber,
          profileImage: profileImage
        };
        const updatedPatients = [newPatient, ...existingPatients];
        localStorage.setItem('patients', JSON.stringify(updatedPatients));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/patients');
    } catch (err) {
      setError('Failed to save patient. Please try again.');
      setLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];

  return (
    <DashboardLayout title={isEditMode ? "Edit Patient File" : "Patient Admission Intake"} subtitle="Input credential profile details to save" activeTab="/patients">
      <div className="add-patient-page">
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            type="button"
            className="btn-outline"
            onClick={() => navigate('/patients')}
          >
            <FaArrowLeft /> Back to Patients
          </button>
          <h2>{isEditMode ? "Modify Clinical File" : "New Admission Entry"}</h2>
          <div />
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-section">
            <h2><FaCamera /> Profile Photo</h2>
            <div className="profile-image-upload">
              <div className="image-preview-container">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" className="profile-preview" />
                ) : (
                  <div className="placeholder-image">
                    <FaUser />
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="image-upload-controls">
                <label>
                  <FaUpload />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      setImagePreview(null);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #EF4444',
                      borderRadius: '0.5rem',
                      background: 'white',
                      color: '#EF4444',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2><FaUser /> Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  {genders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Blood Type *</label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2><FaPhone /> Emergency Contact</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2><FaFileMedical /> Medical Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Medical History</label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Separate with commas"
                />
              </div>
              <div className="form-group">
                <label>Current Condition</label>
                <input
                  type="text"
                  name="currentCondition"
                  value={formData.currentCondition}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Admission Date *</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2><FaHospital /> Hospital Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Assigned Doctor</label>
                <input
                  type="text"
                  name="assignedDoctor"
                  value={formData.assignedDoctor}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Insurance Provider</label>
                <input
                  type="text"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Insurance Number</label>
                <input
                  type="text"
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="btn-outline"
              onClick={() => navigate('/patients')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (isEditMode ? 'Updating Patient...' : 'Adding Patient...') : (isEditMode ? 'Update Patient' : 'Add Patient')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AddPatient;