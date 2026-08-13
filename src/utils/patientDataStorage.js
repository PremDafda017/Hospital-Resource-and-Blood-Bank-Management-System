/**
 * Patient Data Storage Utility
 * Handles persistent storage of patient data using localStorage
 * All data is tied to user ID to ensure each patient has their own data
 */

const STORAGE_KEYS = {
  BLOOD_REQUESTS: 'patient_blood_requests',
  APPOINTMENTS: 'patient_appointments',
  PROFILE: 'patient_profile',
  NOTIFICATIONS: 'patient_notifications',
  REPORTS: 'patient_reports'
};

/**
 * Get user-specific storage key
 */
const getUserKey = (baseKey, userId) => {
  return `${baseKey}_${userId}`;
};

/**
 * Get data from localStorage for a specific user
 */
export const getPatientData = (key, userId) => {
  if (!userId) return null;
  
  try {
    const userKey = getUserKey(key, userId);
    const data = localStorage.getItem(userKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
};

/**
 * Save data to localStorage for a specific user
 */
export const savePatientData = (key, userId, data) => {
  if (!userId) return false;
  
  try {
    const userKey = getUserKey(key, userId);
    localStorage.setItem(userKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    return false;
  }
};

/**
 * Remove data from localStorage for a specific user
 */
export const removePatientData = (key, userId) => {
  if (!userId) return false;
  
  try {
    const userKey = getUserKey(key, userId);
    localStorage.removeItem(userKey);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
    return false;
  }
};

/**
 * Clear all patient data for a specific user (useful for logout/testing)
 */
export const clearAllPatientData = (userId) => {
  if (!userId) return false;
  
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      const userKey = getUserKey(key, userId);
      localStorage.removeItem(userKey);
    });
    return true;
  } catch (error) {
    console.error('Error clearing patient data:', error);
    return false;
  }
};

// Specific data management functions

/**
 * Blood Requests
 */
export const getBloodRequests = (userId) => {
  return getPatientData(STORAGE_KEYS.BLOOD_REQUESTS, userId) || [];
};

export const saveBloodRequests = (userId, requests) => {
  return savePatientData(STORAGE_KEYS.BLOOD_REQUESTS, userId, requests);
};

export const addBloodRequest = (userId, request) => {
  const requests = getBloodRequests(userId);
  const newRequests = [request, ...requests];
  return saveBloodRequests(userId, newRequests);
};

export const updateBloodRequest = (userId, requestId, updatedRequest) => {
  const requests = getBloodRequests(userId);
  const newRequests = requests.map(req => 
    req.id === requestId ? { ...req, ...updatedRequest } : req
  );
  return saveBloodRequests(userId, newRequests);
};

export const deleteBloodRequest = (userId, requestId) => {
  const requests = getBloodRequests(userId);
  const newRequests = requests.filter(req => req.id !== requestId);
  return saveBloodRequests(userId, newRequests);
};

/**
 * Appointments
 */
export const getAppointments = (userId) => {
  return getPatientData(STORAGE_KEYS.APPOINTMENTS, userId) || [];
};

export const saveAppointments = (userId, appointments) => {
  return savePatientData(STORAGE_KEYS.APPOINTMENTS, userId, appointments);
};

export const addAppointment = (userId, appointment) => {
  const appointments = getAppointments(userId);
  const newAppointments = [appointment, ...appointments];
  return saveAppointments(userId, newAppointments);
};

export const updateAppointment = (userId, appointmentId, updatedAppointment) => {
  const appointments = getAppointments(userId);
  const newAppointments = appointments.map(apt => 
    apt.id === appointmentId ? { ...apt, ...updatedAppointment } : apt
  );
  return saveAppointments(userId, newAppointments);
};

export const deleteAppointment = (userId, appointmentId) => {
  const appointments = getAppointments(userId);
  const newAppointments = appointments.filter(apt => apt.id !== appointmentId);
  return saveAppointments(userId, newAppointments);
};

/**
 * Profile
 */
export const getPatientProfile = (userId) => {
  return getPatientData(STORAGE_KEYS.PROFILE, userId);
};

export const savePatientProfile = (userId, profile) => {
  return savePatientData(STORAGE_KEYS.PROFILE, userId, profile);
};

/**
 * Notifications
 */
export const getNotifications = (userId) => {
  return getPatientData(STORAGE_KEYS.NOTIFICATIONS, userId) || [];
};

export const saveNotifications = (userId, notifications) => {
  return savePatientData(STORAGE_KEYS.NOTIFICATIONS, userId, notifications);
};

export const addNotification = (userId, notification) => {
  const notifications = getNotifications(userId);
  const newNotifications = [notification, ...notifications];
  return saveNotifications(userId, newNotifications);
};

export const markNotificationAsRead = (userId, notificationId) => {
  const notifications = getNotifications(userId);
  const newNotifications = notifications.map(notif => 
    notif.id === notificationId ? { ...notif, read: true } : notif
  );
  return saveNotifications(userId, newNotifications);
};

/**
 * Reports
 */
export const getReports = (userId) => {
  return getPatientData(STORAGE_KEYS.REPORTS, userId) || [];
};

export const saveReports = (userId, reports) => {
  return savePatientData(STORAGE_KEYS.REPORTS, userId, reports);
};

export const addReport = (userId, report) => {
  const reports = getReports(userId);
  const newReports = [report, ...reports];
  return saveReports(userId, newReports);
};

/**
 * Initialize default data for new users
 */
export const initializePatientData = (userId, userProfile = {}) => {
  // Initialize default profile if not exists
  if (!getPatientProfile(userId)) {
    const defaultProfile = {
      fullName: userProfile.fullName || '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: userProfile.bloodGroup || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      emergencyContact: '',
      emergencyPhone: '',
    };
    savePatientProfile(userId, defaultProfile);
  }

  // Initialize empty arrays if not exist
  if (!getBloodRequests(userId)) {
    saveBloodRequests(userId, []);
  }

  if (!getAppointments(userId)) {
    saveAppointments(userId, []);
  }

  if (!getNotifications(userId)) {
    saveNotifications(userId, []);
  }

  if (!getReports(userId)) {
    saveReports(userId, []);
  }
};