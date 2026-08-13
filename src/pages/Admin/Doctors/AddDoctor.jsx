import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUserDoctor, FaPhone, FaFileMedical, FaHospital, FaCamera, FaGraduationCap, FaClock } from 'react-icons/fa6';
import DashboardLayout from '../../../components/DashboardLayout';
import './Doctors.css';

function AddDoctor() {
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
    specialization: '',
    phone: '',
    email: '',
    hospital: '',
    experience: '',
    qualifications: '',
    availability: '',
    consultationFee: '',
    about: '',
    address: '',
    licenseNumber: ''
  });

  useEffect(() => {
    if (isEditMode) {
      const storedDoctors = localStorage.getItem('doctors');
      if (storedDoctors) {
        const doctorsList = JSON.parse(storedDoctors);
        const d = doctorsList.find(item => String(item.id) === String(id));
        if (d) {
          const nameParts = d.name ? d.name.split(' ') : ['', ''];
          setFormData({
            firstName: d.firstName || nameParts[0] || '',
            lastName: d.lastName || nameParts.slice(1).join(' ') || '',
            specialization: d.specialization || '',
            phone: d.phone || '',
            email: d.email || '',
            hospital: d.hospital || '',
            experience: d.experience || '',
            qualifications: d.qualifications || '',
            availability: d.availability || '',
            consultationFee: d.consultationFee || '',
            about: d.about || '',
            address: d.address || '',
            licenseNumber: d.licenseNumber || ''
          });
          if (d.profileImage) {
            setImagePreview(d.profileImage);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(file);
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
      if (!formData.firstName || !formData.lastName || !formData.specialization || !formData.phone) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const existingDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');

      if (isEditMode) {
        const updatedDoctors = existingDoctors.map(d => {
          if (String(d.id) === String(id)) {
            return {
              ...d,
              name: `${formData.firstName} ${formData.lastName}`,
              firstName: formData.firstName,
              lastName: formData.lastName,
              specialization: formData.specialization,
              phone: formData.phone,
              email: formData.email || '',
              hospital: formData.hospital,
              experience: formData.experience,
              qualifications: formData.qualifications,
              availability: formData.availability,
              consultationFee: formData.consultationFee,
              about: formData.about,
              address: formData.address,
              licenseNumber: formData.licenseNumber,
              profileImage: imagePreview || d.profileImage
            };
          }
          return d;
        });
        localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
      } else {
        const newDoctor = {
          id: Date.now(),
          name: `${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          specialization: formData.specialization,
          phone: formData.phone,
          email: formData.email || '',
          hospital: formData.hospital,
          experience: formData.experience,
          qualifications: formData.qualifications,
          availability: formData.availability,
          consultationFee: formData.consultationFee,
          about: formData.about,
          address: formData.address,
          licenseNumber: formData.licenseNumber,
          profileImage: imagePreview,
          status: 'Active',
          rating: 0,
          reviews: 0
        };
        const updatedDoctors = [newDoctor, ...existingDoctors];
        localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/doctors');
    } catch (err) {
      setError('Failed to save doctor. Please try again.');
      setLoading(false);
    }
  };

  const specializations = [
    'Cardiologist',
    'Neurologist',
    'Orthopedic Surgeon',
    'Pediatrician',
    'Dermatologist',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'General Physician',
    'Surgeon',
    'Psychiatrist',
    'Radiologist',
    'Anesthesiologist',
    'Pathologist',
    'Oncologist'
  ];

  const availabilityOptions = [
    'Monday - Friday',
    'Monday - Saturday',
    'All Days',
    'Weekends Only',
    'On Call'
  ];

  return (
    <DashboardLayout title={isEditMode ? "Edit Doctor Profile" : "Add New Doctor"} subtitle="Register medical professional credentials" activeTab="doctors">
      <div className="add-doctor-page">
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            type="button"
            className="btn-outline"
            onClick={() => navigate('/doctors')}
          >
            <FaArrowLeft /> Back to Doctors
          </button>
          <h2>{isEditMode ? "Modify Doctor Profile" : "New Doctor Registration"}</h2>
          <div />
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="doctor-form">
          {/* Profile Image Upload */}
          <div className="form-section">
            <h2><FaUserDoctor /> Profile Photo</h2>
            <div className="profile-image-upload">
              <div className="image-preview-container">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" className="profile-preview" />
                ) : (
                  <div className="placeholder-image">
                    <FaUserDoctor />
                    <span>No Profile Photo</span>
                  </div>
                )}
              </div>
              <div className="image-upload-controls">
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="profileImage" className="btn-outline">
                  <FaCamera /> {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                {imagePreview && (
                  <button 
                    type="button" 
                    className="btn-outline"
                    onClick={() => {
                      setProfileImage(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2><FaUserDoctor /> Personal Information</h2>
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
                <label>Specialization *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
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
                <label>License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2><FaHospital /> Hospital & Practice</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Hospital/Clinic Name</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Experience (Years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Consultation Fee (₹)</label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                >
                  <option value="">Select Availability</option>
                  {availabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full-width">
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
            <h2><FaGraduationCap /> Qualifications & Expertise</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Qualifications</label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows="3"
                  placeholder="MBBS, MD, DM, etc."
                />
              </div>
              <div className="form-group full-width">
                <label>About / Bio</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Brief description about the doctor's expertise and approach"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="btn-outline"
              onClick={() => navigate('/doctors')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (isEditMode ? 'Updating Doctor...' : 'Adding Doctor...') : (isEditMode ? 'Update Doctor' : 'Add Doctor')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AddDoctor;
