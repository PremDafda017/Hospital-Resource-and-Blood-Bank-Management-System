// Indian Blood Bank Data - Government and Private Blood Banks
// Based on eRaktkosh (India's Centralized Blood Center Management System)
// eRaktkosh covers 4000+ blood banks across India with real-time blood availability
// Data source: https://eraktkosh.mohfw.gov.in/

export const governmentBloodBanks = [
  {
    id: "GOV-001",
    name: "AIIMS Blood Bank",
    type: "Government",
    state: "Delhi",
    city: "New Delhi",
    address: "Ansari Nagar, AIIMS Campus",
    license: "BB-DL-001",
    phone: "+91-11-26588500",
    email: "bloodbank@aiims.edu",
    operatingHours: "24/7",
    capacity: 5000,
    established: "1956",
    eraktkoshId: "BB-DEL-AIIMS-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"],
    accreditation: "NABH",
    emergencyContact: "+91-11-26588501"
  },
  {
    id: "GOV-002",
    name: "Safdarjung Hospital Blood Bank",
    type: "Government",
    state: "Delhi",
    city: "New Delhi",
    address: "Safdarjung Hospital Campus",
    license: "BB-DL-002",
    phone: "+91-11-26701000",
    email: "bloodbank@sjh.gov.in",
    operatingHours: "8:00 AM - 8:00 PM",
    capacity: 3000,
    established: "1942",
    eraktkoshId: "BB-DEL-SJH-002",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-11-26701001"
  },
  {
    id: "GOV-003",
    name: "Lok Nayak Hospital Blood Bank",
    type: "Government",
    state: "Delhi",
    city: "New Delhi",
    address: "LNJP Hospital, Delhi Gate",
    license: "BB-DL-003",
    phone: "+91-11-23235142",
    email: "bloodbank@lnjp.gov.in",
    operatingHours: "24/7",
    capacity: 2500,
    established: "1932",
    eraktkoshId: "BB-DEL-LNJP-003",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "State",
    emergencyContact: "+91-11-23235143"
  },
  {
    id: "GOV-004",
    name: "KEM Hospital Blood Bank",
    type: "Government",
    state: "Maharashtra",
    city: "Mumbai",
    address: "Parel, Mumbai",
    license: "BB-MH-001",
    phone: "+91-22-24137600",
    email: "bloodbank@kem.edu",
    operatingHours: "24/7",
    capacity: 4000,
    established: "1926",
    eraktkoshId: "BB-MH-KEM-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"],
    accreditation: "NABH",
    emergencyContact: "+91-22-24137601"
  },
  {
    id: "GOV-005",
    name: "JJ Hospital Blood Bank",
    type: "Government",
    state: "Maharashtra",
    city: "Mumbai",
    address: "Byculla, Mumbai",
    license: "BB-MH-002",
    phone: "+91-22-23735555",
    email: "bloodbank@jjh.gov.in",
    operatingHours: "8:00 AM - 8:00 PM",
    capacity: 3500,
    established: "1845",
    eraktkoshId: "BB-MH-JJH-002",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-22-23735556"
  },
  {
    id: "GOV-006",
    name: "Christian Medical College Blood Bank",
    type: "Government",
    state: "Tamil Nadu",
    city: "Vellore",
    address: "CMC Campus, Vellore",
    license: "BB-TN-001",
    phone: "+91-416-2284261",
    email: "bloodbank@cmcvellore.ac.in",
    operatingHours: "24/7",
    capacity: 4500,
    established: "1900",
    eraktkoshId: "BB-TN-CMC-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"],
    accreditation: "NABH",
    emergencyContact: "+91-416-2284262"
  },
  {
    id: "GOV-007",
    name: "Apollo Hospitals Blood Bank",
    type: "Government",
    state: "Tamil Nadu",
    city: "Chennai",
    address: "Apollo Hospitals, Greams Road",
    license: "BB-TN-002",
    phone: "+91-44-28290000",
    email: "bloodbank@apollohospitals.com",
    operatingHours: "24/7",
    capacity: 3000,
    established: "1983",
    eraktkoshId: "BB-TN-APOLLO-002",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"],
    accreditation: "NABH",
    emergencyContact: "+91-44-28290001"
  },
  {
    id: "GOV-008",
    name: "NIMS Blood Bank",
    type: "Government",
    state: "Telangana",
    city: "Hyderabad",
    address: "Punjagutta, Hyderabad",
    license: "BB-TS-001",
    phone: "+91-40-23488888",
    email: "bloodbank@nims.edu",
    operatingHours: "24/7",
    capacity: 3500,
    established: "1992",
    eraktkoshId: "BB-TS-NIMS-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-40-23488889"
  },
  {
    id: "GOV-009",
    name: "SGPGI Blood Bank",
    type: "Government",
    state: "Uttar Pradesh",
    city: "Lucknow",
    address: "Raebareli Road, Lucknow",
    license: "BB-UP-001",
    phone: "+91-522-2496800",
    email: "bloodbank@sgpgi.ac.in",
    operatingHours: "24/7",
    capacity: 2800,
    established: "1985",
    eraktkoshId: "BB-UP-SGPGI-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-522-2496801"
  },
  {
    id: "GOV-010",
    name: "PGIMER Blood Bank",
    type: "Government",
    state: "Punjab",
    city: "Chandigarh",
    address: "Sector 12, Chandigarh",
    license: "BB-PB-001",
    phone: "+91-172-2747585",
    email: "bloodbank@pgimer.edu.in",
    operatingHours: "24/7",
    capacity: 4000,
    established: "1962",
    eraktkoshId: "BB-PB-PGIMER-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"],
    accreditation: "NABH",
    emergencyContact: "+91-172-2747586"
  }
];

export const privateBloodBanks = [
  {
    id: "PVT-001",
    name: "Lilavati Hospital Blood Bank",
    type: "Private",
    state: "Maharashtra",
    city: "Mumbai",
    address: "Bandra West, Mumbai",
    license: "BB-MH-PVT-001",
    phone: "+91-22-26456789",
    email: "bloodbank@lilavati.com",
    operatingHours: "8:00 AM - 10:00 PM",
    capacity: 2000,
    established: "1978",
    eraktkoshId: "BB-MH-PVT-LILAVATI-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-22-26456790"
  },
  {
    id: "PVT-002",
    name: "Fortis Hospital Blood Bank",
    type: "Private",
    state: "Karnataka",
    city: "Bangalore",
    address: "Cunningham Road, Bangalore",
    license: "BB-KA-PVT-001",
    phone: "+91-80-22221212",
    email: "bloodbank@fortis.com",
    operatingHours: "24/7",
    capacity: 2500,
    established: "2001",
    eraktkoshId: "BB-KA-PVT-FORTIS-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"],
    accreditation: "NABH",
    emergencyContact: "+91-80-22221213"
  },
  {
    id: "PVT-003",
    name: "Manipal Hospital Blood Bank",
    type: "Private",
    state: "Karnataka",
    city: "Bangalore",
    address: "Old Airport Road, Bangalore",
    license: "BB-KA-PVT-002",
    phone: "+91-80-25000000",
    email: "bloodbank@manipal.com",
    operatingHours: "8:00 AM - 8:00 PM",
    capacity: 1800,
    established: "1991",
    eraktkoshId: "BB-KA-PVT-MANIPAL-002",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-80-25000001"
  },
  {
    id: "PVT-004",
    name: "Medanta Medicity Blood Bank",
    type: "Private",
    state: "Haryana",
    city: "Gurgaon",
    address: "Sector 38, Gurgaon",
    license: "BB-HR-PVT-001",
    phone: "+91-124-4141414",
    email: "bloodbank@medanta.org",
    operatingHours: "24/7",
    capacity: 3000,
    established: "2009",
    eraktkoshId: "BB-HR-PVT-MEDANTA-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"],
    accreditation: "NABH",
    emergencyContact: "+91-124-4141415"
  },
  {
    id: "PVT-005",
    name: "Apollo Hospital Blood Bank - Delhi",
    type: "Private",
    state: "Delhi",
    city: "New Delhi",
    address: "Sarita Vihar, New Delhi",
    license: "BB-DL-PVT-001",
    phone: "+91-11-26826000",
    email: "bloodbank@apollodelhi.com",
    operatingHours: "24/7",
    capacity: 2200,
    established: "1995",
    eraktkoshId: "BB-DL-PVT-APOLLO-001",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"],
    accreditation: "NABH",
    emergencyContact: "+91-11-26826001"
  },
  {
    id: "PVT-006",
    name: "Breach Candy Hospital Blood Bank",
    type: "Private",
    state: "Maharashtra",
    city: "Mumbai",
    address: "Breach Candy, Mumbai",
    license: "BB-MH-PVT-002",
    phone: "+91-22-23633999",
    email: "bloodbank@breachcandy.com",
    operatingHours: "8:00 AM - 8:00 PM",
    capacity: 1500,
    established: "1950",
    eraktkoshId: "BB-MH-PVT-BREACH-002",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-22-23634000"
  },
  {
    id: "PVT-007",
    name: "Max Healthcare Blood Bank",
    type: "Private",
    state: "Delhi",
    city: "New Delhi",
    address: "Saket, New Delhi",
    license: "BB-DL-PVT-002",
    phone: "+91-11-26521000",
    email: "bloodbank@maxhealthcare.com",
    operatingHours: "24/7",
    capacity: 2000,
    established: "2000",
    eraktkoshId: "BB-DL-PVT-MAX-002",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-11-26521001"
  },
  {
    id: "PVT-008",
    name: "Columbia Asia Hospital Blood Bank",
    type: "Private",
    state: "Karnataka",
    city: "Bangalore",
    address: "Yelahanka, Bangalore",
    license: "BB-KA-PVT-003",
    phone: "+91-80-66780000",
    email: "bloodbank@columbiaasia.com",
    operatingHours: "8:00 AM - 8:00 PM",
    capacity: 1200,
    established: "2005",
    eraktkoshId: "BB-KA-PVT-COLUMBIA-003",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-80-66780001"
  },
  {
    id: "PVT-009",
    name: "Wockhardt Hospital Blood Bank",
    type: "Private",
    state: "Maharashtra",
    city: "Mumbai",
    address: "Mumbai Central, Mumbai",
    license: "BB-MH-PVT-003",
    phone: "+91-22-23880888",
    email: "bloodbank@wockhardt.com",
    operatingHours: "8:00 AM - 10:00 PM",
    capacity: 1800,
    established: "1989",
    eraktkoshId: "BB-MH-PVT-WOCKHARDT-003",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma"],
    accreditation: "NABH",
    emergencyContact: "+91-22-23880889"
  },
  {
    id: "PVT-010",
    name: "Narayana Health Blood Bank",
    type: "Private",
    state: "Karnataka",
    city: "Bangalore",
    address: "Hosur Road, Bangalore",
    license: "BB-KA-PVT-004",
    phone: "+91-80-66121900",
    email: "bloodbank@narayanahealth.com",
    operatingHours: "24/7",
    capacity: 2500,
    established: "2000",
    eraktkoshId: "BB-KA-PVT-NARAYANA-004",
    components: ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"],
    accreditation: "NABH",
    emergencyContact: "+91-80-66121901"
  }
];

export const bloodInventoryData = {
  "A+": { total: 2450, government: 1500, private: 950, critical: false, minStock: 200 },
  "A-": { total: 1680, government: 980, private: 700, critical: false, minStock: 150 },
  "B+": { total: 2890, government: 1750, private: 1140, critical: false, minStock: 250 },
  "B-": { total: 1250, government: 720, private: 530, critical: true, minStock: 120 },
  "AB+": { total: 1890, government: 1150, private: 740, critical: false, minStock: 180 },
  "AB-": { total: 890, government: 520, private: 370, critical: true, minStock: 100 },
  "O+": { total: 3890, government: 2350, private: 1540, critical: false, minStock: 300 },
  "O-": { total: 1420, government: 880, private: 540, critical: false, minStock: 150 }
};

export const indianDonors = [
  { id: 1, name: "Rajesh Kumar", bloodGroup: "A+", contact: "+91-9876543210", donations: 12, lastDonation: "2024-01-10", city: "Delhi", state: "Delhi" },
  { id: 2, name: "Priya Sharma", bloodGroup: "B+", contact: "+91-9876543211", donations: 8, lastDonation: "2024-01-05", city: "Mumbai", state: "Maharashtra" },
  { id: 3, name: "Amit Patel", bloodGroup: "O+", contact: "+91-9876543212", donations: 15, lastDonation: "2024-01-12", city: "Ahmedabad", state: "Gujarat" },
  { id: 4, name: "Sneha Reddy", bloodGroup: "AB+", contact: "+91-9876543213", donations: 5, lastDonation: "2023-12-28", city: "Hyderabad", state: "Telangana" },
  { id: 5, name: "Vikram Singh", bloodGroup: "A-", contact: "+91-9876543214", donations: 10, lastDonation: "2024-01-08", city: "Bangalore", state: "Karnataka" },
  { id: 6, name: "Anjali Gupta", bloodGroup: "B-", contact: "+91-9876543215", donations: 7, lastDonation: "2024-01-02", city: "Chennai", state: "Tamil Nadu" },
  { id: 7, name: "Rahul Verma", bloodGroup: "O-", contact: "+91-9876543216", donations: 20, lastDonation: "2024-01-14", city: "Lucknow", state: "Uttar Pradesh" },
  { id: 8, name: "Kavita Nair", bloodGroup: "AB-", contact: "+91-9876543217", donations: 4, lastDonation: "2023-12-20", city: "Kochi", state: "Kerala" },
  { id: 9, name: "Suresh Iyer", bloodGroup: "A+", contact: "+91-9876543218", donations: 9, lastDonation: "2024-01-06", city: "Pune", state: "Maharashtra" },
  { id: 10, name: "Meena Devi", bloodGroup: "B+", contact: "+91-9876543219", donations: 6, lastDonation: "2024-01-11", city: "Jaipur", state: "Rajasthan" },
  { id: 11, name: "Arjun Rao", bloodGroup: "O+", contact: "+91-9876543220", donations: 11, lastDonation: "2024-01-09", city: "Chandigarh", state: "Punjab" },
  { id: 12, name: "Lakshmi Krishnan", bloodGroup: "A-", contact: "+91-9876543221", donations: 8, lastDonation: "2024-01-03", city: "Madurai", state: "Tamil Nadu" },
  { id: 13, name: "Deepak Kumar", bloodGroup: "AB+", contact: "+91-9876543222", donations: 5, lastDonation: "2023-12-25", city: "Bhopal", state: "Madhya Pradesh" },
  { id: 14, name: "Pooja Das", bloodGroup: "B-", contact: "+91-9876543223", donations: 7, lastDonation: "2024-01-07", city: "Kolkata", state: "West Bengal" },
  { id: 15, name: "Mohan Yadav", bloodGroup: "O-", contact: "+91-9876543224", donations: 18, lastDonation: "2024-01-13", city: "Ranchi", state: "Jharkhand" }
];

export const indianHospitalRequests = [
  { id: 1, patient: "Sanjay Kumar", bloodGroup: "A+", units: 2, hospital: "AIIMS New Delhi", status: "Pending", date: "2024-01-15", urgency: "Critical", state: "Delhi" },
  { id: 2, patient: "Rehana Begum", bloodGroup: "B+", units: 1, hospital: "Lilavati Hospital Mumbai", status: "Approved", date: "2024-01-14", urgency: "Moderate", state: "Maharashtra" },
  { id: 3, patient: "Mohan Singh", bloodGroup: "O+", units: 3, hospital: "Apollo Hospital Chennai", status: "Completed", date: "2024-01-13", urgency: "Critical", state: "Tamil Nadu" },
  { id: 4, patient: "Anita Devi", bloodGroup: "AB+", units: 2, hospital: "Max Healthcare Delhi", status: "Pending", date: "2024-01-15", urgency: "Moderate", state: "Delhi" },
  { id: 5, patient: "Ramesh Gupta", bloodGroup: "A-", units: 1, hospital: "KEM Hospital Mumbai", status: "Approved", date: "2024-01-14", urgency: "Normal", state: "Maharashtra" },
  { id: 6, patient: "Kavita Sharma", bloodGroup: "B-", units: 2, hospital: "Fortis Hospital Bangalore", status: "Pending", date: "2024-01-15", urgency: "Critical", state: "Karnataka" },
  { id: 7, patient: "Vikram Reddy", bloodGroup: "O-", units: 1, hospital: "NIMS Hyderabad", status: "Completed", date: "2024-01-12", urgency: "Critical", state: "Telangana" },
  { id: 8, patient: "Sunita Verma", bloodGroup: "A+", units: 2, hospital: "PGIMER Chandigarh", status: "Approved", date: "2024-01-14", urgency: "Moderate", state: "Punjab" },
  { id: 9, patient: "Rajesh Kumar", bloodGroup: "AB-", units: 1, hospital: "Medanta Gurgaon", status: "Pending", date: "2024-01-15", urgency: "Normal", state: "Haryana" },
  { id: 10, patient: "Meena Kumari", bloodGroup: "B+", units: 3, hospital: "SGPGI Lucknow", status: "Completed", date: "2024-01-11", urgency: "Critical", state: "Uttar Pradesh" }
];

export const stockHistoryData = [
  { id: 1, bloodGroup: "A+", units: 5, donor: "Rajesh Kumar", type: "Added", date: "2024-01-15", bloodBank: "AIIMS New Delhi" },
  { id: 2, bloodGroup: "B+", units: 3, donor: "Priya Sharma", type: "Added", date: "2024-01-14", bloodBank: "Lilavati Hospital Mumbai" },
  { id: 3, bloodGroup: "O+", units: 2, donor: "AIIMS New Delhi", type: "Issued", date: "2024-01-14", bloodBank: "AIIMS New Delhi" },
  { id: 4, bloodGroup: "AB+", units: 4, donor: "Amit Patel", type: "Added", date: "2024-01-13", bloodBank: "Apollo Hospital Chennai" },
  { id: 5, bloodGroup: "A-", units: 1, donor: "KEM Hospital Mumbai", type: "Issued", date: "2024-01-13", bloodBank: "KEM Hospital Mumbai" },
  { id: 6, bloodGroup: "O-", units: 2, donor: "Rahul Verma", type: "Added", date: "2024-01-12", bloodBank: "NIMS Hyderabad" },
  { id: 7, bloodGroup: "B-", units: 3, donor: "Anjali Gupta", type: "Added", date: "2024-01-11", bloodBank: "Fortis Hospital Bangalore" },
  { id: 8, bloodGroup: "A+", units: 2, donor: "Apollo Hospital Chennai", type: "Issued", date: "2024-01-11", bloodBank: "Apollo Hospital Chennai" },
  { id: 9, bloodGroup: "AB-", units: 1, donor: "Vikram Singh", type: "Added", date: "2024-01-10", bloodBank: "Max Healthcare Delhi" },
  { id: 10, bloodGroup: "B+", units: 4, donor: "SGPGI Lucknow", type: "Issued", date: "2024-01-10", bloodBank: "SGPGI Lucknow" }
];

export const bloodBankNotifications = [
  { id: 1, title: "New Blood Request", message: "AIIMS New Delhi requested 2 units of A+ blood - Critical Priority", date: "2024-01-15", read: false, type: "warning" },
  { id: 2, title: "Stock Low Warning", message: "B- blood stock is below minimum level in Karnataka region", date: "2024-01-14", read: false, type: "danger" },
  { id: 3, title: "Donor Registration", message: "New donor Rajesh Kumar registered at AIIMS New Delhi", date: "2024-01-13", read: true, type: "success" },
  { id: 4, title: "Report Generated", message: "Monthly collection report for Maharashtra region is ready", date: "2024-01-12", read: true, type: "info" },
  { id: 5, title: "Blood Camp", message: "Upcoming blood donation camp at Apollo Hospital Chennai on Jan 20", date: "2024-01-11", read: true, type: "info" },
  { id: 6, title: "System Update", message: "eRaktkosh integration updated successfully", date: "2024-01-10", read: true, type: "success" },
  { id: 7, title: "Emergency Alert", message: "Critical blood shortage in O- group at NIMS Hyderabad", date: "2024-01-09", read: false, type: "danger" },
  { id: 8, title: "New License", message: "Blood bank license renewed for Fortis Hospital Bangalore", date: "2024-01-08", read: true, type: "success" }
];

export const bloodBankReports = [
  { id: 1, name: "Monthly Blood Collection Report - Delhi", type: "Collection", date: "2024-01-15", status: "Ready", format: "PDF" },
  { id: 2, name: "Blood Issuance Report - Maharashtra", type: "Issuance", date: "2024-01-14", status: "Ready", format: "Excel" },
  { id: 3, name: "Donor Statistics Report - All India", type: "Statistics", date: "2024-01-13", status: "Ready", format: "PDF" },
  { id: 4, name: "Inventory Status Report - South Zone", type: "Inventory", date: "2024-01-12", status: "Processing", format: "PDF" },
  { id: 5, name: "Annual Blood Bank Performance Report", type: "Performance", date: "2024-01-11", status: "Ready", format: "PDF" },
  { id: 6, name: "Blood Camp Summary Report - Q4 2023", type: "Camp", date: "2024-01-10", status: "Ready", format: "Excel" },
  { id: 7, name: "License Compliance Report - All Banks", type: "Compliance", date: "2024-01-09", status: "Ready", format: "PDF" },
  { id: 8, name: "Regional Blood Distribution Report", type: "Distribution", date: "2024-01-08", status: "Processing", format: "Excel" }
];

export const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const urgencyLevels = ["Critical", "Moderate", "Normal"];

export const requestStatuses = ["Pending", "Under Verification", "Forwarded", "Blood Ready", "Completed", "Rejected"];

export const getBloodBankById = (id) => {
  return [...governmentBloodBanks, ...privateBloodBanks].find(bank => bank.id === id);
};

export const getBloodBanksByState = (state) => {
  return [...governmentBloodBanks, ...privateBloodBanks].filter(bank => bank.state === state);
};

export const getBloodBanksByType = (type) => {
  if (type === "Government") return governmentBloodBanks;
  if (type === "Private") return privateBloodBanks;
  return [...governmentBloodBanks, ...privateBloodBanks];
};

export const getBloodBankStats = () => {
  const totalBanks = governmentBloodBanks.length + privateBloodBanks.length;
  const totalCapacity = [...governmentBloodBanks, ...privateBloodBanks].reduce((sum, bank) => sum + bank.capacity, 0);
  const totalInventory = Object.values(bloodInventoryData).reduce((sum, group) => sum + group.total, 0);
  
  return {
    totalBanks,
    governmentBanks: governmentBloodBanks.length,
    privateBanks: privateBloodBanks.length,
    totalCapacity,
    totalInventory,
    averageCapacity: Math.round(totalCapacity / totalBanks)
  };
};
