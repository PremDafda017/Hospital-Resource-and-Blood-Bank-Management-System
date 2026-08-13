import React, { useState, useEffect, useRef } from "react";
import {
  FaUsers, FaUserDoctor, FaDroplet, FaHeartPulse, FaBell,
  FaClipboardList, FaRightFromBracket, FaChartLine,
  FaGear, FaCalendarDays, FaHandHoldingMedical,
  FaSun, FaMoon, FaHospital,
  FaArrowTrendUp, FaArrowTrendDown, FaMagnifyingGlass, FaBars,
  FaLocationDot, FaCircleCheck,
  FaCircleInfo, FaListCheck, FaLocationCrosshairs, FaChevronDown,
} from "react-icons/fa6";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────── */
const FONT    = "'Inter','Segoe UI',system-ui,sans-serif";
const RED     = "#C41230";
const RED_DK  = "#8B0000";
const RED_GL  = "rgba(196,18,48,0.12)";
const NAVY    = "#0F172A";
const NAVY2   = "#1E293B";
const SLATE   = "#334155";
const SLATE_L = "#64748B";
const BORDER  = "#E2E8F0";
const SMOKE   = "#F8FAFC";
const WHITE   = "#FFFFFF";

const SIDEBAR_W   = 260;
const SIDEBAR_COL = NAVY;

const BG_COLOR = {
  "A+":"#16A34A","A-":"#15803D","B+":"#2563EB","B-":"#1D4ED8",
  "AB+":"#7C3AED","AB-":"#6D28D9","O+":RED,"O-":RED_DK
};

// Blood bank database (same as HomePage)
const bloodBankDatabase = [
  // DELHI - Government Hospitals
  { id: 1, name: "AIIMS Blood Bank", state: "Delhi", city: "New Delhi", address: "AIIMS Campus, Ansari Nagar", phone: "011-26588500", lat: 28.5672, lng: 77.2100, bloodStock: { "A+": 45, "A-": 12, "B+": 38, "B-": 8, "AB+": 22, "AB-": 5, "O+": 67, "O-": 15 } },
  { id: 2, name: "Safdarjung Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "Safdarjung Hospital Campus", phone: "011-26702700", lat: 28.5734, lng: 77.1901, bloodStock: { "A+": 32, "A-": 8, "B+": 28, "B-": 6, "AB+": 18, "AB-": 4, "O+": 52, "O-": 12 } },
  { id: 3, name: "LHMC Blood Bank", state: "Delhi", city: "New Delhi", address: "Lady Hardinge Medical College", phone: "011-23364104", lat: 28.6268, lng: 77.2106, bloodStock: { "A+": 28, "A-": 10, "B+": 25, "B-": 7, "AB+": 15, "AB-": 3, "O+": 48, "O-": 11 } },
  { id: 4, name: "GTB Hospital Blood Bank", state: "Delhi", city: "Delhi", address: "GTB Hospital, Dilshad Garden", phone: "011-22143111", lat: 28.6789, lng: 77.3178, bloodStock: { "A+": 35, "A-": 9, "B+": 31, "B-": 5, "AB+": 20, "AB-": 6, "O+": 55, "O-": 13 } },
  { id: 5, name: "Ram Manohar Lohia Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "RML Hospital, New Delhi", phone: "011-23363212", lat: 28.6333, lng: 77.2089, bloodStock: { "A+": 30, "A-": 9, "B+": 27, "B-": 6, "AB+": 17, "AB-": 4, "O+": 50, "O-": 12 } },
  // DELHI - Private Hospitals
  { id: 6, name: "Apollo Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "Apollo Hospital, Sarita Vihar", phone: "011-26825858", lat: 28.6375, lng: 77.2733, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
  { id: 7, name: "Fortis Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "Fortis Hospital, Shalimar Bagh", phone: "011-47077777", lat: 28.7167, lng: 77.1583, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 19 } },
  { id: 8, name: "Max Healthcare Blood Bank", state: "Delhi", city: "New Delhi", address: "Max Hospital, Saket", phone: "011-26515650", lat: 28.5319, lng: 77.2189, bloodStock: { "A+": 52, "A-": 16, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 20 } },
  { id: 9, name: "Medanta Hospital Blood Bank", state: "Delhi", city: "Gurgaon", address: "Medanta Hospital, Sector 38", phone: "0124-4141414", lat: 28.4289, lng: 77.0464, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 35, "AB-": 11, "O+": 90, "O-": 24 } },
  { id: 10, name: "Sir Ganga Ram Hospital Blood Bank", state: "Delhi", city: "New Delhi", address: "SGRH, Rajinder Nagar", phone: "011-25725424", lat: 28.6503, lng: 77.1867, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
  // MAHARASHTRA - Government Hospitals
  { id: 13, name: "J.J. Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "J.J. Hospital, Byculla", phone: "022-23735555", lat: 18.9696, lng: 72.8333, bloodStock: { "A+": 52, "A-": 15, "B+": 45, "B-": 12, "AB+": 28, "AB-": 8, "O+": 78, "O-": 18 } },
  { id: 14, name: "KEM Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "KEM Hospital, Parel", phone: "022-24138113", lat: 19.0066, lng: 72.8533, bloodStock: { "A+": 48, "A-": 14, "B+": 42, "B-": 11, "AB+": 25, "AB-": 7, "O+": 72, "O-": 16 } },
  { id: 15, name: "Nair Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Nair Hospital, Mumbai Central", phone: "022-23074126", lat: 18.9667, lng: 72.8217, bloodStock: { "A+": 38, "A-": 11, "B+": 34, "B-": 9, "AB+": 21, "AB-": 6, "O+": 62, "O-": 14 } },
  { id: 16, name: "Sion Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Sion Hospital, Sion", phone: "022-24076381", lat: 19.0414, lng: 72.8667, bloodStock: { "A+": 41, "A-": 13, "B+": 37, "B-": 10, "AB+": 23, "AB-": 7, "O+": 68, "O-": 15 } },
  { id: 17, name: "Sassoon Hospital Blood Bank", state: "Maharashtra", city: "Pune", address: "Sassoon Hospital, Pune", phone: "020-26058280", lat: 18.5184, lng: 73.8567, bloodStock: { "A+": 35, "A-": 12, "B+": 32, "B-": 8, "AB+": 19, "AB-": 5, "O+": 58, "O-": 13 } },
  // MAHARASHTRA - Private Hospitals
  { id: 19, name: "Apollo Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Apollo Hospital, Mumbai", phone: "022-24223333", lat: 19.0825, lng: 72.8812, bloodStock: { "A+": 65, "A-": 22, "B+": 58, "B-": 18, "AB+": 38, "AB-": 12, "O+": 95, "O-": 28 } },
  { id: 20, name: "Fortis Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Fortis Hospital, Mulund", phone: "022-25335678", lat: 19.1667, lng: 72.9417, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
  { id: 21, name: "Kokilaben Hospital Blood Bank", state: "Maharashtra", city: "Mumbai", address: "Kokilaben Hospital, Andheri", phone: "022-26967579", lat: 19.1156, lng: 72.8406, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 34, "AB-": 11, "O+": 88, "O-": 24 } },
  { id: 24, name: "Ruby Hall Clinic Blood Bank", state: "Maharashtra", city: "Pune", address: "Ruby Hall Clinic, Pune", phone: "020-26122111", lat: 18.5194, lng: 73.8711, bloodStock: { "A+": 42, "A-": 13, "B+": 37, "B-": 10, "AB+": 24, "AB-": 7, "O+": 68, "O-": 17 } },
  // KARNATAKA - Government Hospitals
  { id: 27, name: "Victoria Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Victoria Hospital, Bangalore", phone: "080-26700880", lat: 12.9716, lng: 77.5946, bloodStock: { "A+": 44, "A-": 14, "B+": 39, "B-": 11, "AB+": 24, "AB-": 7, "O+": 71, "O-": 17 } },
  { id: 28, name: "Bowring Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Bowring Hospital, Bangalore", phone: "080-22867069", lat: 12.9914, lng: 77.6041, bloodStock: { "A+": 36, "A-": 10, "B+": 33, "B-": 9, "AB+": 20, "AB-": 6, "O+": 63, "O-": 14 } },
  // KARNATAKA - Private Hospitals
  { id: 31, name: "Apollo Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Apollo Hospital, Bangalore", phone: "080-26860555", lat: 12.9356, lng: 77.6061, bloodStock: { "A+": 60, "A-": 20, "B+": 52, "B-": 16, "AB+": 35, "AB-": 11, "O+": 92, "O-": 25 } },
  { id: 32, name: "Fortis Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Fortis Hospital, Bannerghatta", phone: "080-22221212", lat: 12.8956, lng: 77.5956, bloodStock: { "A+": 52, "A-": 17, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 21 } },
  { id: 33, name: "Manipal Hospital Blood Bank", state: "Karnataka", city: "Bangalore", address: "Manipal Hospital, Old Airport Road", phone: "080-22220333", lat: 12.9417, lng: 77.6142, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 19 } },
  // TAMIL NADU - Government Hospitals
  { id: 37, name: "Rajiv Gandhi Government Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "RGGGH, Chennai", phone: "044-25305305", lat: 13.0827, lng: 80.2707, bloodStock: { "A+": 55, "A-": 16, "B+": 48, "B-": 13, "AB+": 30, "AB-": 9, "O+": 82, "O-": 19 } },
  { id: 38, name: "Government General Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "GH, Chennai", phone: "044-25303437", lat: 13.0754, lng: 80.2625, bloodStock: { "A+": 47, "A-": 13, "B+": 41, "B-": 11, "AB+": 26, "AB-": 8, "O+": 75, "O-": 17 } },
  // TAMIL NADU - Private Hospitals
  { id: 41, name: "Apollo Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "Apollo Hospital, Chennai", phone: "044-28297777", lat: 13.0567, lng: 80.2567, bloodStock: { "A+": 70, "A-": 24, "B+": 62, "B-": 20, "AB+": 42, "AB-": 14, "O+": 105, "O-": 32 } },
  { id: 42, name: "Fortis Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "Fortis Malar Hospital, Chennai", phone: "044-42898888", lat: 13.0467, lng: 80.2467, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 35, "AB-": 11, "O+": 88, "O-": 24 } },
  { id: 43, name: "MIOT Hospital Blood Bank", state: "Tamil Nadu", city: "Chennai", address: "MIOT Hospital, Chennai", phone: "044-42494567", lat: 13.0667, lng: 80.2367, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 33, "AB-": 10, "O+": 85, "O-": 23 } },
  // WEST BENGAL - Government Hospitals
  { id: 47, name: "IPGMER Blood Bank", state: "West Bengal", city: "Kolkata", address: "IPGMER, Kolkata", phone: "033-22235313", lat: 22.5587, lng: 88.3955, bloodStock: { "A+": 51, "A-": 15, "B+": 46, "B-": 12, "AB+": 27, "AB-": 8, "O+": 76, "O-": 18 } },
  { id: 48, name: "Medical College Hospital Blood Bank", state: "West Bengal", city: "Kolkata", address: "MCH, Kolkata", phone: "033-22415072", lat: 22.5726, lng: 88.3639, bloodStock: { "A+": 43, "A-": 12, "B+": 38, "B-": 10, "AB+": 23, "AB-": 7, "O+": 68, "O-": 15 } },
  // WEST BENGAL - Private Hospitals
  { id: 50, name: "Apollo Hospital Blood Bank", state: "West Bengal", city: "Kolkata", address: "Apollo Hospital, Kolkata", phone: "033-24336363", lat: 22.5456, lng: 88.3856, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 34, "AB-": 11, "O+": 88, "O-": 24 } },
  { id: 51, name: "Fortis Hospital Blood Bank", state: "West Bengal", city: "Kolkata", address: "Fortis Hospital, Kolkata", phone: "033-22875555", lat: 22.5556, lng: 88.3756, bloodStock: { "A+": 52, "A-": 17, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 82, "O-": 22 } },
  // GUJARAT - Government Hospitals
  { id: 54, name: "Civil Hospital Blood Bank", state: "Gujarat", city: "Ahmedabad", address: "Civil Hospital, Ahmedabad", phone: "079-22603456", lat: 23.0302, lng: 72.5801, bloodStock: { "A+": 39, "A-": 11, "B+": 35, "B-": 9, "AB+": 22, "AB-": 6, "O+": 64, "O-": 14 } },
  { id: 55, name: "V.S. Hospital Blood Bank", state: "Gujarat", city: "Ahmedabad", address: "V.S. Hospital, Ahmedabad", phone: "079-26560480", lat: 23.0225, lng: 72.5714, bloodStock: { "A+": 34, "A-": 10, "B+": 31, "B-": 8, "AB+": 19, "AB-": 5, "O+": 59, "O-": 13 } },
  // GUJARAT - Private Hospitals
  { id: 57, name: "Apollo Hospital Blood Bank", state: "Gujarat", city: "Ahmedabad", address: "Apollo Hospital, Ahmedabad", phone: "079-26869898", lat: 23.0356, lng: 72.5901, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
  { id: 58, name: "Zydus Hospital Blood Bank", state: "Gujarat", city: "Ahmedabad", address: "Zydus Hospital, Ahmedabad", phone: "079-66443333", lat: 23.0406, lng: 72.6001, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 19 } },
  // RAJASTHAN - Government Hospitals
  { id: 61, name: "SMS Hospital Blood Bank", state: "Rajasthan", city: "Jaipur", address: "SMS Hospital, Jaipur", phone: "0141-2545678", lat: 26.9124, lng: 75.7873, bloodStock: { "A+": 37, "A-": 11, "B+": 33, "B-": 9, "AB+": 21, "AB-": 6, "O+": 61, "O-": 14 } },
  // RAJASTHAN - Private Hospitals
  { id: 64, name: "Fortis Hospital Blood Bank", state: "Rajasthan", city: "Jaipur", address: "Fortis Hospital, Jaipur", phone: "0141-4155777", lat: 26.9256, lng: 75.8056, bloodStock: { "A+": 52, "A-": 16, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 21 } },
  // UTTAR PRADESH - Government Hospitals
  { id: 67, name: "KGMC Blood Bank", state: "Uttar Pradesh", city: "Lucknow", address: "KGMC, Lucknow", phone: "0522-2258530", lat: 26.8467, lng: 80.9462, bloodStock: { "A+": 42, "A-": 12, "B+": 38, "B-": 10, "AB+": 24, "AB-": 7, "O+": 69, "O-": 16 } },
  { id: 68, name: "SGPGIMS Blood Bank", state: "Uttar Pradesh", city: "Lucknow", address: "SGPGIMS, Lucknow", phone: "0522-2494188", lat: 26.8368, lng: 80.9312, bloodStock: { "A+": 46, "A-": 13, "B+": 41, "B-": 11, "AB+": 26, "AB-": 8, "O+": 73, "O-": 17 } },
  // UTTAR PRADESH - Private Hospitals
  { id: 71, name: "Apollo Hospital Blood Bank", state: "Uttar Pradesh", city: "Lucknow", address: "Apollo Hospital, Lucknow", phone: "0522-2612444", lat: 26.8567, lng: 80.9562, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 34, "AB-": 11, "O+": 88, "O-": 24 } },
  { id: 72, name: "Medanta Hospital Blood Bank", state: "Uttar Pradesh", city: "Lucknow", address: "Medanta Hospital, Lucknow", phone: "0522-6621444", lat: 26.8467, lng: 80.9362, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 23 } },
  // TELANGANA - Government Hospitals
  { id: 75, name: "Gandhi Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Gandhi Hospital, Hyderabad", phone: "040-24612543", lat: 17.4375, lng: 78.4936, bloodStock: { "A+": 40, "A-": 11, "B+": 36, "B-": 9, "AB+": 22, "AB-": 6, "O+": 66, "O-": 15 } },
  { id: 76, name: "Osmania Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Osmania Hospital, Hyderabad", phone: "040-24654321", lat: 17.3850, lng: 78.4867, bloodStock: { "A+": 44, "A-": 12, "B+": 39, "B-": 10, "AB+": 24, "AB-": 7, "O+": 70, "O-": 16 } },
  // TELANGANA - Private Hospitals
  { id: 78, name: "Apollo Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Apollo Hospital, Hyderabad", phone: "040-23339292", lat: 17.4250, lng: 78.3867, bloodStock: { "A+": 65, "A-": 22, "B+": 58, "B-": 18, "AB+": 40, "AB-": 13, "O+": 98, "O-": 28 } },
  { id: 79, name: "Yashoda Hospital Blood Bank", state: "Telangana", city: "Hyderabad", address: "Yashoda Hospital, Hyderabad", phone: "040-45678901", lat: 17.4350, lng: 78.3967, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 23 } },
  // KERALA - Government Hospitals
  { id: 82, name: "Medical College Hospital Blood Bank", state: "Kerala", city: "Thiruvananthapuram", address: "MCH, Thiruvananthapuram", phone: "0471-2545430", lat: 8.5061, lng: 76.9648, bloodStock: { "A+": 33, "A-": 9, "B+": 30, "B-": 8, "AB+": 19, "AB-": 5, "O+": 57, "O-": 13 } },
  // KERALA - Private Hospitals
  { id: 85, name: "Aster Hospital Blood Bank", state: "Kerala", city: "Kochi", address: "Aster Hospital, Kochi", phone: "0484-2655555", lat: 9.9412, lng: 76.2773, bloodStock: { "A+": 52, "A-": 16, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 21 } },
  // PUNJAB - Government Hospitals
  { id: 89, name: "Government Medical College Blood Bank", state: "Punjab", city: "Chandigarh", address: "GMC, Chandigarh", phone: "0172-2745678", lat: 30.7333, lng: 76.7794, bloodStock: { "A+": 38, "A-": 10, "B+": 34, "B-": 9, "AB+": 21, "AB-": 6, "O+": 63, "O-": 14 } },
  { id: 90, name: "PGIMER Blood Bank", state: "Punjab", city: "Chandigarh", address: "PGIMER, Chandigarh", phone: "0172-2747585", lat: 30.7673, lng: 76.7802, bloodStock: { "A+": 52, "A-": 14, "B+": 47, "B-": 12, "AB+": 29, "AB-": 8, "O+": 79, "O-": 18 } },
  // PUNJAB - Private Hospitals
  { id: 92, name: "Fortis Hospital Blood Bank", state: "Punjab", city: "Mohali", address: "Fortis Hospital, Mohali", phone: "0172-5088888", lat: 30.7056, lng: 76.7000, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
  // HARYANA - Private Hospitals
  { id: 97, name: "Medanta Hospital Blood Bank", state: "Haryana", city: "Gurgaon", address: "Medanta Hospital, Gurgaon", phone: "0124-4141414", lat: 28.4289, lng: 77.0464, bloodStock: { "A+": 58, "A-": 19, "B+": 51, "B-": 15, "AB+": 35, "AB-": 11, "O+": 90, "O-": 24 } },
  { id: 98, name: "Artemis Hospital Blood Bank", state: "Haryana", city: "Gurgaon", address: "Artemis Hospital, Gurgaon", phone: "0124-4555000", lat: 28.4389, lng: 77.0564, bloodStock: { "A+": 52, "A-": 17, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 82, "O-": 22 } },
  // ANDHRA PRADESH - Government Hospitals
  { id: 100, name: "Government General Hospital Blood Bank", state: "Andhra Pradesh", city: "Visakhapatnam", address: "GH, Visakhapatnam", phone: "0891-2545678", lat: 17.7231, lng: 83.2856, bloodStock: { "A+": 36, "A-": 10, "B+": 33, "B-": 9, "AB+": 21, "AB-": 6, "O+": 62, "O-": 14 } },
  // ANDHRA PRADESH - Private Hospitals
  { id: 103, name: "Apollo Hospital Blood Bank", state: "Andhra Pradesh", city: "Hyderabad", address: "Apollo Hospital, Hyderabad", phone: "040-23339292", lat: 17.4250, lng: 78.3867, bloodStock: { "A+": 65, "A-": 22, "B+": 58, "B-": 18, "AB+": 40, "AB-": 13, "O+": 98, "O-": 28 } },
  { id: 104, name: "Manipal Hospital Blood Bank", state: "Andhra Pradesh", city: "Visakhapatnam", address: "Manipal Hospital, Vizag", phone: "0891-2893456", lat: 17.7331, lng: 83.2956, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
  // MADHYA PRADESH - Government Hospitals
  { id: 106, name: "Hamidia Hospital Blood Bank", state: "Madhya Pradesh", city: "Bhopal", address: "Hamidia Hospital, Bhopal", phone: "0755-2545678", lat: 23.2599, lng: 77.4126, bloodStock: { "A+": 34, "A-": 9, "B+": 31, "B-": 8, "AB+": 19, "AB-": 5, "O+": 58, "O-": 13 } },
  // MADHYA PRADESH - Private Hospitals
  { id: 109, name: "Apollo Hospital Blood Bank", state: "Madhya Pradesh", city: "Indore", address: "Apollo Hospital, Indore", phone: "0731-2545678", lat: 22.7296, lng: 75.8677, bloodStock: { "A+": 55, "A-": 18, "B+": 48, "B-": 14, "AB+": 32, "AB-": 10, "O+": 85, "O-": 22 } },
  // BIHAR - Government Hospitals
  { id: 112, name: "PMCH Blood Bank", state: "Bihar", city: "Patna", address: "PMCH, Patna", phone: "0612-2545678", lat: 25.6127, lng: 85.1444, bloodStock: { "A+": 32, "A-": 9, "B+": 29, "B-": 8, "AB+": 18, "AB-": 5, "O+": 55, "O-": 12 } },
  // BIHAR - Private Hospitals
  { id: 115, name: "Paras Hospital Blood Bank", state: "Bihar", city: "Patna", address: "Paras Hospital, Patna", phone: "0612-2545679", lat: 25.6227, lng: 85.1544, bloodStock: { "A+": 48, "A-": 15, "B+": 42, "B-": 12, "AB+": 28, "AB-": 8, "O+": 75, "O-": 20 } },
  // ODISHA - Private Hospitals
  { id: 120, name: "Apollo Hospital Blood Bank", state: "Odisha", city: "Bhubaneswar", address: "Apollo Hospital, Bhubaneswar", phone: "0674-2545678", lat: 20.2961, lng: 85.8245, bloodStock: { "A+": 52, "A-": 16, "B+": 45, "B-": 13, "AB+": 30, "AB-": 9, "O+": 80, "O-": 21 } },
];

const states = [...new Set(bloodBankDatabase.map(bank => bank.state))].sort();
const citiesByState = {};
bloodBankDatabase.forEach(bank => {
  if (!citiesByState[bank.state]) {
    citiesByState[bank.state] = [];
  }
  if (!citiesByState[bank.state].includes(bank.city)) {
    citiesByState[bank.state].push(bank.city);
  }
});

/* ─────────────────────────────────────────────────
   TINY HELPERS
───────────────────────────────────────────────── */
function BloodBadge({ group, size = "sm" }) {
  const pad = size === "lg" ? "6px 14px" : "3px 9px";
  const fs  = size === "lg" ? "0.85rem" : "0.72rem";
  return (
    <span style={{ background:BG_COLOR[group]||RED, color:WHITE, fontWeight:800, fontSize:fs, padding:pad, borderRadius:20, whiteSpace:"nowrap" }}>
      {group}
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    "Available"   : ["#16A34A","#DCFCE7"],
    "Low Stock"   : ["#D97706","#FEF3C7"],
    "Critical"    : [RED,"#FEE2E2"],
    "Pending"     : ["#D97706","#FEF3C7"],
    "Approved"    : ["#16A34A","#DCFCE7"],
    "Dispatched"  : ["#2563EB","#DBEAFE"],
    "Completed"   : ["#64748B","#F1F5F9"],
  };
  const [fg, bg] = map[status] || ["#64748B","#F1F5F9"];
  return (
    <span style={{ color:fg, background:bg, fontWeight:700, fontSize:"0.74rem", padding:"4px 10px", borderRadius:20, whiteSpace:"nowrap" }}>
      {status}
    </span>
  );
}

function AnimatedCounter({ target }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let n = 0;
        const step = Math.max(1, Math.ceil(target / 50));
        const t = setInterval(() => { n += step; if (n >= target) { setVal(target); clearInterval(t); } else setVal(n); }, 25);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

/* ─────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────── */
function Sidebar({ active, navigate, onLogout, collapsed }) {
  const nav = [
    { key:"dashboard",       icon:<FaChartLine/>,        label:"Dashboard"       },
    { key:"patients",        icon:<FaUsers/>,            label:"Patients"        },
    { key:"doctors",         icon:<FaUserDoctor/>,       label:"Doctors"         },
    { key:"donors",          icon:<FaHandHoldingMedical/>,label:"Donors"         },
    { key:"blood-inventory", icon:<FaDroplet/>,          label:"Blood Inventory" },
    { key:"blood-banks",     icon:<FaHospital/>,         label:"Blood Banks"     },
    { key:"appointments",    icon:<FaCalendarDays/>,     label:"Appointments"    },
    { key:"settings",        icon:<FaGear/>,             label:"Settings"        },
  ];

  const w = collapsed ? 68 : SIDEBAR_W;

  return (
    <aside style={{
      width:w, minHeight:"100vh", background:SIDEBAR_COL,
      position:"fixed", top:0, left:0, zIndex:200,
      display:"flex", flexDirection:"column",
      transition:"width 0.3s cubic-bezier(.4,0,.2,1)",
      overflow:"hidden", boxShadow:"4px 0 30px rgba(0,0,0,0.2)"
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "24px 0" : "24px 20px", display:"flex", alignItems:"center", gap:10, height:72, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${RED},${RED_DK})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0, margin: collapsed ? "0 auto" : 0 }}>🩸</div>
        {!collapsed && <span style={{ fontWeight:900, color:WHITE, fontSize:"1.15rem", whiteSpace:"nowrap" }}>Hemo<span style={{ color:RED }}>Care</span></span>}
      </div>

      {/* Section label */}
      {!collapsed && <div style={{ padding:"20px 20px 8px", color:"rgba(255,255,255,0.3)", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em" }}>NAVIGATION</div>}

      {/* Nav items */}
      <nav style={{ flex:1, padding: collapsed ? "8px 6px" : "8px 12px", overflowY:"auto" }}>
        {nav.map(({ key, icon, label }) => {
          const isActive = active === key;
          return (
            <div key={key} onClick={() => navigate(`/${key}`)}
              title={collapsed ? label : ""}
              style={{
                display:"flex", alignItems:"center", gap:12, padding: collapsed ? "12px 0" : "11px 14px",
                borderRadius:10, margin:"2px 0", cursor:"pointer",
                background: isActive ? `linear-gradient(135deg,${RED}CC,${RED_DK})` : "transparent",
                color: isActive ? WHITE : "rgba(255,255,255,0.55)",
                fontWeight: isActive ? 700 : 500, fontSize:"0.88rem",
                transition:"all 0.2s", justifyContent: collapsed ? "center" : "flex-start",
                boxShadow: isActive ? `0 4px 16px ${RED}40` : "none"
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = WHITE; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isActive ? WHITE : "rgba(255,255,255,0.55)"; }}
            >
              <span style={{ fontSize:"1rem", flexShrink:0 }}>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: collapsed ? "16px 6px" : "16px 12px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div onClick={onLogout}
          style={{ display:"flex", alignItems:"center", gap:12, padding: collapsed ? "12px 0" : "11px 14px", borderRadius:10, cursor:"pointer", color:"rgba(255,100,100,0.7)", fontWeight:600, fontSize:"0.88rem", transition:"all 0.2s", justifyContent: collapsed ? "center" : "flex-start" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#FCA5A5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,100,100,0.7)"; }}
        >
          <FaRightFromBracket style={{ flexShrink:0 }}/>{!collapsed && <span>Sign Out</span>}
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────
   TOPBAR
───────────────────────────────────────────────── */
function Topbar({ displayName, displayRole, user, profile, theme, toggleTheme, sidebarCollapsed, toggleSidebar }) {
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.firstName ? `${user.firstName[0]}${user.lastName?.[0]||""}` : "U";

  const notifications = [
    { icon:"🚨", text:"Emergency O- request — 2 units needed", time:"2m ago", urgent:true },
    { icon:"✅", text:"Donor intake completed — A+ blood processed", time:"15m ago", urgent:false },
    { icon:"⚠️", text:"B- stock below threshold (12 units)", time:"1h ago", urgent:false },
    { icon:"📅", text:"3 appointments scheduled for tomorrow", time:"2h ago", urgent:false },
  ];

  return (
    <header style={{
      position:"fixed", top:0, left: sidebarCollapsed ? 68 : SIDEBAR_W, right:0, height:72, zIndex:100,
      background:WHITE, borderBottom:`1px solid ${BORDER}`,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 28px", boxShadow:"0 1px 20px rgba(0,0,0,0.05)",
      transition:"left 0.3s cubic-bezier(.4,0,.2,1)"
    }}>
      {/* Left */}
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <button onClick={toggleSidebar} style={{ width:36, height:36, border:`1px solid ${BORDER}`, borderRadius:8, background:SMOKE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L }}>
          <FaBars/>
        </button>
        <div>
          <h1 style={{ fontFamily:FONT, fontWeight:800, fontSize:"1.35rem", color:NAVY2, letterSpacing:"-0.01em", lineHeight:1 }}>Operations Console</h1>
          <p style={{ color:SLATE_L, fontSize:"0.8rem", marginTop:2 }}>
            Welcome back, <strong style={{ color:NAVY2 }}>{displayName}</strong>
            <span style={{ background:RED_GL, color:RED, fontWeight:700, fontSize:"0.72rem", padding:"2px 8px", borderRadius:12, marginLeft:8, textTransform:"capitalize" }}>{displayRole.replace("_"," ")}</span>
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {/* Search */}
        <div style={{ display:"flex", alignItems:"center", gap:8, background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"8px 14px" }}>
          <FaMagnifyingGlass style={{ color:SLATE_L, fontSize:"0.85rem" }}/>
          <input placeholder="Search…" style={{ border:"none", background:"transparent", fontFamily:FONT, fontSize:"0.85rem", color:SLATE, outline:"none", width:160 }}/>
        </div>

        {/* Theme */}
        <button onClick={toggleTheme} style={{ width:38, height:38, borderRadius:10, border:`1px solid ${BORDER}`, background:SMOKE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L, transition:"all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = SLATE_L; }}
        >
          {theme === "dark" ? <FaSun/> : <FaMoon/>}
        </button>

        {/* Notifications */}
        <div style={{ position:"relative" }}>
          <button onClick={() => { setNotifOpen(o => !o); setDropdown(false); }}
            style={{ width:38, height:38, borderRadius:10, border:`1px solid ${BORDER}`, background:SMOKE, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:SLATE_L, position:"relative" }}
          >
            <FaBell/>
            <span style={{ position:"absolute", top:6, right:6, width:8, height:8, borderRadius:"50%", background:RED, border:`2px solid ${WHITE}` }}/>
          </button>
          {notifOpen && (
            <div style={{ position:"absolute", right:0, top:48, width:340, background:WHITE, border:`1px solid ${BORDER}`, borderRadius:16, boxShadow:"0 16px 48px rgba(0,0,0,0.12)", zIndex:300, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:800, color:NAVY2 }}>Notifications</span>
                <span style={{ background:RED, color:WHITE, fontSize:"0.7rem", fontWeight:800, padding:"2px 7px", borderRadius:12 }}>4</span>
              </div>
              {notifications.map((n,i) => (
                <div key={i} style={{ padding:"12px 20px", borderBottom:`1px solid ${BORDER}`, display:"flex", gap:12, cursor:"pointer", background:n.urgent?"#FFF5F5":WHITE,
                  transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                  onMouseLeave={e => e.currentTarget.style.background = n.urgent?"#FFF5F5":WHITE}
                >
                  <span style={{ fontSize:"1.2rem", flexShrink:0 }}>{n.icon}</span>
                  <div>
                    <p style={{ fontSize:"0.83rem", color:NAVY2, fontWeight:n.urgent?700:500, lineHeight:1.5 }}>{n.text}</p>
                    <span style={{ fontSize:"0.75rem", color:SLATE_L }}>{n.time}</span>
                  </div>
                </div>
              ))}
              <div style={{ padding:"12px 20px", textAlign:"center" }}>
                <button style={{ color:RED, fontWeight:700, fontSize:"0.83rem", textDecoration:"none", background:"none", border:"none", cursor:"pointer" }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ position:"relative" }}>
          <button onClick={() => { setDropdown(o => !o); setNotifOpen(false); }}
            style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg,${RED},${RED_DK})`, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, fontWeight:800, fontSize:"0.88rem" }}
          >
            {initials}
          </button>
          {dropdown && (
            <div style={{ position:"absolute", right:0, top:48, width:280, background:WHITE, border:`1px solid ${BORDER}`, borderRadius:16, boxShadow:"0 16px 48px rgba(0,0,0,0.12)", zIndex:300, overflow:"hidden" }}>
              <div style={{ padding:"18px 20px", borderBottom:`1px solid ${BORDER}`, background:SMOKE }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${RED},${RED_DK})`, display:"flex", alignItems:"center", justifyContent:"center", color:WHITE, fontWeight:800, fontSize:"1.1rem" }}>
                    {initials}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:800, color:NAVY2, fontSize:"0.95rem", lineHeight:1.2 }}>{displayName}</p>
                    <span style={{ background:RED_GL, color:RED, fontWeight:700, fontSize:"0.7rem", padding:"3px 10px", borderRadius:12, marginTop:4, display:"inline-block", textTransform:"capitalize" }}>{displayRole.replace("_"," ")}</span>
                  </div>
                </div>
                <p style={{ color:SLATE_L, fontSize:"0.8rem", marginTop:8, wordBreak:"break-all" }}>{profile?.email || user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              
              <div style={{ padding:"8px 0" }}>
                <div onClick={() => navigate("/reports")} style={{ padding:"14px 20px", cursor:"pointer", color:RED, fontSize:"0.88rem", fontWeight:600, display:"flex", alignItems:"center", gap:10, transition:"background 0.15s", background:RED_GL, margin:"8px 12px", borderRadius:10 }}
                  onMouseEnter={e => e.currentTarget.style.background = RED}
                  onMouseLeave={e => e.currentTarget.style.background = RED_GL}
                >
                  <span>📊</span>
                  <span>My Reports</span>
                </div>
                
                {[["👤 My Profile","/profile"],["⚙️ Settings","/settings"]].map(([l,h]) => (
                  <div key={l} onClick={() => navigate(h)} style={{ padding:"14px 20px", cursor:"pointer", color:NAVY2, fontSize:"0.88rem", fontWeight:500, display:"flex", alignItems:"center", gap:10, transition:"background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                    onMouseLeave={e => e.currentTarget.style.background = WHITE}
                  >{l}</div>
                ))}
              </div>
              
              <div style={{ borderTop:`1px solid ${BORDER}`, padding:"12px 20px" }}>
                <div onClick={() => { window.location.href = "/"; }} style={{ color:RED, fontWeight:700, fontSize:"0.88rem", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>🏠 Back to Home</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────── */
function StatCard({ icon, value, label, trend, trendVal, color = RED, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const up = trend === "up";
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background:WHITE, borderRadius:18, border:`1px solid ${BORDER}`, padding:"24px 22px",
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.1)" : "0 2px 12px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition:"all 0.3s cubic-bezier(.4,0,.2,1)",
        animationDelay:`${delay}ms`, animation:"fadeUp 0.6s ease both"
      }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:`${color}14`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", color }}>
          {icon}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, color: up ? "#16A34A" : RED, fontWeight:700, fontSize:"0.78rem", background: up ? "#DCFCE7" : "#FEE2E2", padding:"3px 8px", borderRadius:20 }}>
          {up ? <FaArrowTrendUp/> : <FaArrowTrendDown/>} {trendVal}
        </div>
      </div>
      <div style={{ fontFamily:FONT, fontWeight:900, fontSize:"2rem", color:NAVY2, lineHeight:1, marginBottom:4 }}>
        <AnimatedCounter target={value}/>
      </div>
      <div style={{ color:SLATE_L, fontSize:"0.82rem", fontWeight:500 }}>{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   CARD WRAPPER
───────────────────────────────────────────────── */
function Card({ children, style = {}, title, action }) {
  return (
    <div style={{ background:WHITE, borderRadius:18, border:`1px solid ${BORDER}`, boxShadow:"0 2px 12px rgba(0,0,0,0.04)", overflow:"hidden", ...style }}>
      {title && (
        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontFamily:FONT, fontWeight:800, fontSize:"0.97rem", color:NAVY2 }}>{title}</h3>
          {action && <span style={{ color:RED, fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>{action}</span>}
        </div>
      )}
      <div style={{ padding:"18px 22px" }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MINI CHART (pure CSS bars)
───────────────────────────────────────────────── */
function MiniBarChart({ data, color = RED }) {
  const max = Math.max(...data.map(d => d.val));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:64 }}>
      {data.map(({ label, val }, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ width:"100%", background:`${color}18`, borderRadius:"4px 4px 0 0", height:52, display:"flex", alignItems:"flex-end" }}>
            <div style={{ width:"100%", background:color, borderRadius:"4px 4px 0 0", height:`${(val/max)*100}%`, transition:"height 1s ease", minHeight:4 }}/>
          </div>
          <span style={{ fontSize:"0.65rem", color:SLATE_L, fontWeight:600 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   DONUT CHART (SVG)
───────────────────────────────────────────────── */
function DonutChart({ segments }) {
  const total = segments.reduce((s, d) => s + d.val, 0);
  let cumulative = 0;
  const R = 60, cx = 70, cy = 70, r = R - 14;
  const paths = segments.map(({ val, color }) => {
    const startAngle = (cumulative / total) * 360 - 90;
    cumulative += val;
    const endAngle = (cumulative / total) * 360 - 90;
    const start = { x: cx + R * Math.cos(Math.PI * startAngle / 180), y: cy + R * Math.sin(Math.PI * startAngle / 180) };
    const end   = { x: cx + R * Math.cos(Math.PI * endAngle / 180),   y: cy + R * Math.sin(Math.PI * endAngle / 180) };
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return { d:`M ${cx} ${cy} L ${start.x} ${start.y} A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y} Z`, color, pct:Math.round(val/total*100) };
  });
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} opacity={0.85}/>)}
      <circle cx={cx} cy={cy} r={r} fill={WHITE}/>
      <text x={cx} y={cy-6} textAnchor="middle" style={{ fontFamily:FONT, fontWeight:900, fontSize:18, fill:NAVY2 }}>{total}</text>
      <text x={cx} y={cy+12} textAnchor="middle" style={{ fontFamily:FONT, fontWeight:500, fontSize:9, fill:SLATE_L }}>Total Units</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────── */
function Dashboard() {
  const { isLoaded: userLoaded, user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("dashboard-theme") || "light");
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [nearbyBloodBanks, setNearbyBloodBanks] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  
  // Analytics data
  const [adminStats, setAdminStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const toggleTheme  = () => { const t = theme==="light"?"dark":"light"; setTheme(t); localStorage.setItem("dashboard-theme",t); };
  const toggleSidebar = () => setCollapsed(c => !c);

  // Get user's current location
  const getUserLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsGettingLocation(false);
          findNearbyBloodBanks(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
        }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find nearby blood banks based on user location
  const findNearbyBloodBanks = (userLat, userLng) => {
    const banksWithDistance = bloodBankDatabase.map(bank => ({
      ...bank,
      distance: calculateDistance(userLat, userLng, bank.lat, bank.lng)
    })).sort((a, b) => a.distance - b.distance);
    
    setNearbyBloodBanks(banksWithDistance.slice(0, 5));
  };

  // Filter blood banks by selected location
  const filteredBloodBanks = selectedState 
    ? bloodBankDatabase.filter(bank => 
        bank.state === selectedState && (!selectedCity || bank.city === selectedCity)
      )
    : nearbyBloodBanks.length > 0 
      ? nearbyBloodBanks 
      : bloodBankDatabase.slice(0, 5);

  // Calculate aggregated blood stock for selected location
  const aggregatedStock = filteredBloodBanks.reduce((acc, bank) => {
    Object.keys(bank.bloodStock).forEach(group => {
      acc[group] = (acc[group] || 0) + bank.bloodStock[group];
    });
    return acc;
  }, {});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userLoaded || !user) return;
      try {
        const r = await fetch(`http://127.0.0.1:5000/api/users/profile/${user.id}`);
        if (r.ok) {
          const data = await r.json();
          console.log("Profile data from API:", data);
          setProfile(data);
          // Update localStorage with API data
          localStorage.setItem("userFullName", data.fullName || "");
          localStorage.setItem("userEmail", data.email || "");
          localStorage.setItem("userRole", data.role || "donor");
        } else {
          console.error("Profile fetch failed:", r.status);
          // Fallback to localStorage
          const storedName = localStorage.getItem("userFullName");
          const storedEmail = localStorage.getItem("userEmail");
          const storedRole = localStorage.getItem("userRole");
          if (storedName || storedEmail || storedRole) {
            console.log("Using localStorage fallback:", { storedName, storedEmail, storedRole });
            setProfile({
              fullName: storedName || user?.fullName || "",
              email: storedEmail || user?.primaryEmailAddress?.emailAddress || "",
              role: storedRole || "donor"
            });
          } else {
            // Final fallback to Clerk user data
            console.log("Using Clerk user data as final fallback");
            const clerkName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
            setProfile({
              fullName: clerkName,
              email: user?.primaryEmailAddress?.emailAddress || "",
              role: "donor"
            });
            localStorage.setItem("userFullName", clerkName);
            localStorage.setItem("userEmail", user?.primaryEmailAddress?.emailAddress || "");
            localStorage.setItem("userRole", "donor");
          }
        }
      } catch (e) { 
        console.error("Profile fetch error:", e);
        // Fallback to localStorage if API fails
        const storedName = localStorage.getItem("userFullName");
        const storedEmail = localStorage.getItem("userEmail");
        const storedRole = localStorage.getItem("userRole");
        if (storedName || storedEmail || storedRole) {
          console.log("Using localStorage fallback (catch):", { storedName, storedEmail, storedRole });
          setProfile({
            fullName: storedName || user?.fullName || "",
            email: storedEmail || user?.primaryEmailAddress?.emailAddress || "",
            role: storedRole || "donor"
          });
        } else {
          // Final fallback to Clerk user data
          console.log("Using Clerk user data as final fallback (catch)");
          const clerkName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
          setProfile({
            fullName: clerkName,
            email: user?.primaryEmailAddress?.emailAddress || "",
            role: "donor"
          });
          localStorage.setItem("userFullName", clerkName);
          localStorage.setItem("userEmail", user?.primaryEmailAddress?.emailAddress || "");
          localStorage.setItem("userRole", "donor");
        }
      }
    };
    fetchProfile();
  }, [user, userLoaded]);

  // Fetch admin analytics data
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const statsResponse = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/admin/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setAdminStats(statsData);
        }

        const recentResponse = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/admin/recent-requests?limit=5');
        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          setRecentRequests(recentData);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchAdminStats();
  }, []);

  const handleNavigate = (path) => { setActiveNav(path.replace("/","")); navigate(path); };

  if (!userLoaded) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:FONT, gap:12, background:SMOKE }}>
      <div style={{ width:48, height:48, borderRadius:"50%", border:`3px solid ${BORDER}`, borderTopColor:RED, animation:"spin 0.9s linear infinite" }}/>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <p style={{ color:SLATE_L, fontWeight:600 }}>Loading operations console…</p>
    </div>
  );

  const displayName = profile?.fullName || user?.fullName || "User";
  const displayRole = profile?.role || "donor";

  const sidebarW = collapsed ? 68 : SIDEBAR_W;

  /* mock data - location-based blood inventory */
  const bloodInventory = Object.keys(aggregatedStock).length > 0 
    ? Object.keys(aggregatedStock).map(group => {
        const units = aggregatedStock[group];
        const maxUnits = Math.max(...Object.values(aggregatedStock));
        const pct = Math.round((units / maxUnits) * 100);
        let status = "Available";
        if (units <= 10) status = "Critical";
        else if (units <= 25) status = "Low Stock";
        return { group, units, status, pct };
      }).sort((a, b) => b.units - a.units)
    : [
    { group:"O+",  units:124, status:"Available", pct:88 },
    { group:"A+",  units:89,  status:"Available", pct:75 },
    { group:"B+",  units:42,  status:"Low Stock",  pct:38 },
    { group:"AB+", units:67,  status:"Available", pct:58 },
    { group:"A-",  units:31,  status:"Low Stock",  pct:26 },
    { group:"O-",  units:5,   status:"Critical",  pct:8  },
    { group:"B-",  units:15,  status:"Low Stock",  pct:13 },
    { group:"AB-", units:8,   status:"Critical",  pct:7  },
  ];

  const emergencyRequests = recentRequests.length > 0 
    ? recentRequests.slice(0, 4).map(req => ({
        patient: req.patientName,
        group: req.bloodGroup,
        units: req.units,
        hospital: req.hospitalName,
        status: req.status,
        time: new Date(req.createdAt).toLocaleString()
      }))
    : [
        { patient:"Rahul Patel",   group:"O-",  units:2, hospital:"Apollo",   status:"Pending",    time:"2m ago" },
        { patient:"Priya Sharma",  group:"B+",  units:1, hospital:"Fortis",   status:"Approved",   time:"18m ago" },
        { patient:"Amit Shah",     group:"A+",  units:3, hospital:"AIIMS",    status:"Dispatched", time:"45m ago" },
        { patient:"Sunita Kumari", group:"AB-", units:1, hospital:"Narayana", status:"Completed",  time:"2h ago" },
      ];

  const activities = recentRequests.length > 0
    ? recentRequests.slice(0, 6).map(req => ({
        dot: req.status === "Pending" ? RED : req.status === "Completed" ? "#16A34A" : "#2563EB",
        text: `Blood request ${req.status.toLowerCase()}`,
        sub: `${req.patientName} · ${req.bloodGroup} · ${req.units} units`,
        time: new Date(req.createdAt).toLocaleString()
      }))
    : [
        { dot:RED,      text:"Emergency O- request submitted",   sub:"Rahul Patel · Apollo Mumbai",    time:"2m ago"  },
        { dot:"#2563EB",text:"New donor registered",             sub:"Kavita Desai · A+ · Pune",       time:"18m ago" },
        { dot:"#16A34A",text:"Donor intake completed",           sub:"Vikram Singh · B+ · 450ml",      time:"45m ago" },
        { dot:"#7C3AED",text:"Appointment scheduled",           sub:"Dr. Mehta · July 18, 10:00 AM",  time:"1h ago"  },
        { dot:"#D97706",text:"Inventory threshold alert",       sub:"O- below 10 units",               time:"2h ago"  },
        { dot:"#64748B",text:"Monthly report generated",        sub:"June 2026 — 1,240 donations",    time:"3h ago"  },
      ];

  const weeklyData = [
    { label:"Mon", val:28 }, { label:"Tue", val:42 }, { label:"Wed", val:35 },
    { label:"Thu", val:58 }, { label:"Fri", val:49 }, { label:"Sat", val:67 }, { label:"Sun", val:31 },
  ];

  const donutSegs = adminStats?.bloodInventorySummary 
    ? Object.entries(adminStats.bloodInventorySummary).map(([group, units]) => ({
        val: units,
        color: BG_COLOR[group] || RED
      }))
    : [
        { val:124, color:"#C41230" }, { val:89, color:"#16A34A" }, { val:67, color:"#7C3AED" },
        { val:42, color:"#2563EB" }, { val:31, color:"#D97706" }, { val:28, color:"#0891B2" },
      ];

  return (
    <div style={{ fontFamily:FONT, background:SMOKE, minHeight:"100vh" }}>
      {/* Global keyframes */}
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *,:before,:after{box-sizing:border-box;}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-track{background:${SMOKE};}
        ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:${SLATE_L};}
        .dash-main-grid{display:grid;grid-template-columns:2fr 1fr;gap:20px;}
        .dash-inv-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        @media(max-width:1100px){.dash-main-grid{grid-template-columns:1fr!important;}}
        @media(max-width:640px){.dash-inv-grid{grid-template-columns:1fr!important;}}
      `}</style>

      {/* Sidebar */}
      <Sidebar active={activeNav} navigate={handleNavigate} onLogout={() => {}} collapsed={collapsed}/>

      {/* Topbar */}
      <Topbar
        displayName={displayName} displayRole={displayRole} user={user} profile={profile}
        theme={theme} toggleTheme={toggleTheme}
        sidebarCollapsed={collapsed} toggleSidebar={toggleSidebar}
      />

      {/* Main scroll area */}
      <main style={{ marginLeft:sidebarW, marginTop:72, padding:"28px 28px 48px", transition:"margin-left 0.3s cubic-bezier(.4,0,.2,1)" }}>

        {/* ── LOCATION SELECTOR ── */}
        <div style={{ background:WHITE, borderRadius:14, border:`1px solid ${BORDER}`, padding:"18px 22px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${RED}14`, display:"flex", alignItems:"center", justifyContent:"center", color:RED, fontSize:"1.1rem" }}>
              <FaLocationDot/>
            </div>
            <div>
              <div style={{ fontWeight:800, color:NAVY2, fontSize:"1rem", marginBottom:2 }}>Blood Stock by Location</div>
              <div style={{ color:SLATE_L, fontSize:"0.78rem" }}>
                {selectedState ? `${selectedState}${selectedCity ? `, ${selectedCity}` : ""}` : userLocation ? "Near your location" : "Select a location to view blood stock"}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button 
              onClick={getUserLocation}
              disabled={isGettingLocation}
              style={{ 
                display:"flex", alignItems:"center", gap:8, 
                background:isGettingLocation ? `${SMOKE}` : `linear-gradient(135deg,${RED},${RED_DK})`, 
                border:`1px solid ${BORDER}`, borderRadius:10, padding:"10px 18px", 
                color:isGettingLocation ? SLATE_L : WHITE, fontWeight:700, fontSize:"0.85rem", 
                cursor:isGettingLocation ? "not-allowed" : "pointer", 
                transition:"all 0.2s" 
              }}
              onMouseEnter={e => !isGettingLocation && (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => !isGettingLocation && (e.currentTarget.style.transform = "translateY(0)")}
            >
              <FaLocationCrosshairs/> {isGettingLocation ? "Locating..." : "Use My Location"}
            </button>
            <div style={{ position:"relative" }}>
              <button 
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                style={{ 
                  display:"flex", alignItems:"center", gap:8, 
                  background:SMOKE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"10px 16px", 
                  color:NAVY2, fontWeight:600, fontSize:"0.85rem", cursor:"pointer", 
                  transition:"all 0.2s" 
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = RED}
                onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
              >
                <FaChevronDown/> Change Location
              </button>
              {locationDropdownOpen && (
                <div style={{ 
                  position:"absolute", right:0, top:52, width:320, background:WHITE, 
                  border:`1px solid ${BORDER}`, borderRadius:12, boxShadow:"0 16px 48px rgba(0,0,0,0.12)", 
                  zIndex:300, padding:"16px" 
                }}>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ display:"block", fontWeight:700, color:NAVY2, fontSize:"0.82rem", marginBottom:6 }}>State</label>
                    <select 
                      value={selectedState}
                      onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(""); }}
                      style={{ 
                        width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${BORDER}`, 
                        fontFamily:FONT, fontSize:"0.85rem", color:NAVY2, outline:"none", background:SMOKE 
                      }}
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  {selectedState && (
                    <div style={{ marginBottom:12 }}>
                      <label style={{ display:"block", fontWeight:700, color:NAVY2, fontSize:"0.82rem", marginBottom:6 }}>City</label>
                      <select 
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        style={{ 
                          width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${BORDER}`, 
                          fontFamily:FONT, fontSize:"0.85rem", color:NAVY2, outline:"none", background:SMOKE 
                        }}
                      >
                        <option value="">All Cities</option>
                        {citiesByState[selectedState]?.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button 
                    onClick={() => setLocationDropdownOpen(false)}
                    style={{ 
                      width:"100%", background:`linear-gradient(135deg,${RED},${RED_DK})`, 
                      border:"none", borderRadius:8, padding:"10px", color:WHITE, fontWeight:700, 
                      fontSize:"0.85rem", cursor:"pointer" 
                    }}
                  >
                    Apply Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── URGENT BANNER ── */}
        <div style={{ background:`linear-gradient(135deg,${RED_DK},${RED})`, borderRadius:14, padding:"14px 22px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:`0 8px 24px ${RED}30` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:"1.2rem" }}>🚨</span>
            <span style={{ color:WHITE, fontWeight:700, fontSize:"0.9rem" }}>2 critical emergency requests require immediate attention</span>
          </div>
          <button style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, padding:"7px 16px", color:WHITE, fontWeight:700, fontSize:"0.83rem", cursor:"pointer", backdropFilter:"blur(4px)" }}>View Requests →</button>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:24 }}
          className="stats-row"
        >
          <style>{`@media(max-width:900px){.stats-row{grid-template-columns:1fr 1fr!important;}}@media(max-width:480px){.stats-row{grid-template-columns:1fr!important;}}`}</style>
          <StatCard icon={<FaUsers/>}            value={adminStats?.patients || 0} label="Total Patients"        trend="up"   trendVal="+12%" color="#2563EB" delay={0}  />
          <StatCard icon={<FaUserDoctor/>}       value={adminStats?.hospitalStaff || 0} label="Hospital Staff"        trend="up"   trendVal="+8%"  color="#7C3AED" delay={80} />
          <StatCard icon={<FaHeartPulse/>}        value={adminStats?.bloodRequests || 0} label="Blood Requests"       trend="up"   trendVal="+15%" color={RED}     delay={160}/>
          <StatCard icon={<FaDroplet/>}           value={adminStats?.bloodInventory || 0} label="Blood Inventory Items" trend="up"   trendVal="+5%"  color="#16A34A" delay={240}/>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="dash-main-grid" style={{ marginBottom:20 }}>

          {/* Blood Inventory */}
          <Card title="Blood Inventory" action="Manage Stock →">
            <div className="dash-inv-grid">
              {bloodInventory.map(({ group, units, status, pct }) => {
                const sc = status==="Critical"?RED:status==="Low Stock"?"#D97706":"#16A34A";
                return (
                  <div key={group} style={{ background:SMOKE, borderRadius:12, padding:"14px 14px", border:`1px solid ${BORDER}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <BloodBadge group={group}/>
                      <StatusPill status={status}/>
                    </div>
                    <div style={{ fontWeight:900, fontSize:"1.5rem", color:NAVY2, lineHeight:1, marginBottom:6 }}>{units}</div>
                    <div style={{ height:5, background:BORDER, borderRadius:3 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:sc, borderRadius:3, transition:"width 1.5s ease" }}/>
                    </div>
                    <div style={{ color:SLATE_L, fontSize:"0.72rem", marginTop:4 }}>units available</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Charts column */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Weekly donations */}
            <Card title="Weekly Donations">
              <MiniBarChart data={weeklyData} color={RED}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                <span style={{ color:SLATE_L, fontSize:"0.78rem" }}>This Week</span>
                <span style={{ fontWeight:700, color:NAVY2, fontSize:"0.85rem" }}>310 donations</span>
              </div>
            </Card>

            {/* Inventory donut */}
            <Card title="Inventory Distribution">
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <DonutChart segments={donutSegs}/>
                <div style={{ flex:1 }}>
                  {bloodInventory.slice(0,6).map(({ group, units }) => (
                    <div key={group} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:BG_COLOR[group]||RED }}/>
                        <span style={{ fontSize:"0.78rem", color:SLATE_L, fontWeight:600 }}>{group}</span>
                      </div>
                      <span style={{ fontSize:"0.78rem", fontWeight:700, color:NAVY2 }}>{units}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── DEMAND MODEL ── */}
        <Card title="AI Blood Demand Forecast" action="Full Report →" style={{ marginBottom:20 }}>
          <p style={{ color:SLATE_L, fontSize:"0.83rem", marginBottom:16 }}>Predicted shortfalls for next 7 days based on historical patterns and scheduled surgeries.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}
            className="demand-grid">
            <style>{`@media(max-width:640px){.demand-grid{grid-template-columns:1fr 1fr!important;}}`}</style>
            {[["O+",90,"#C41230","500 units"],["A+",65,"#16A34A","320 units"],["B+",50,"#2563EB","250 units"],["AB+",25,"#7C3AED","100 units"]].map(([g,pct,c,req]) => (
              <div key={g} style={{ background:SMOKE, borderRadius:12, padding:"16px 14px", border:`1px solid ${BORDER}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <BloodBadge group={g}/>
                  <span style={{ fontWeight:800, fontSize:"1.1rem", color:NAVY2 }}>{pct}%</span>
                </div>
                <div style={{ height:6, background:BORDER, borderRadius:3, marginBottom:8 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:c, borderRadius:3, transition:"width 1.5s" }}/>
                </div>
                <span style={{ color:SLATE_L, fontSize:"0.75rem" }}>{req} needed</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── EMERGENCY TABLE & QUICK ACTIONS ── */}
        <div className="dash-main-grid" style={{ marginBottom:20 }}>

          <Card title="Live Emergency Requests" action="View All →">
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${BORDER}` }}>
                    {["Patient","Blood","Units","Hospital","Status","Time"].map(h => (
                      <th key={h} style={{ padding:"8px 10px", textAlign:"left", color:SLATE_L, fontWeight:700, fontSize:"0.75rem", letterSpacing:"0.04em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emergencyRequests.map(({ patient, group, units, hospital, status, time }, i) => (
                    <tr key={i} style={{ borderBottom:`1px solid ${BORDER}` }}
                      onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                      onMouseLeave={e => e.currentTarget.style.background = WHITE}
                    >
                      <td style={{ padding:"12px 10px", fontWeight:700, color:NAVY2 }}>{patient}</td>
                      <td style={{ padding:"12px 10px" }}><BloodBadge group={group}/></td>
                      <td style={{ padding:"12px 10px", color:SLATE, fontWeight:600 }}>{units}u</td>
                      <td style={{ padding:"12px 10px", color:SLATE_L }}>{hospital}</td>
                      <td style={{ padding:"12px 10px" }}><StatusPill status={status}/></td>
                      <td style={{ padding:"12px 10px", color:SLATE_L, fontSize:"0.78rem" }}>{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── ACTIVITY FEED ── */}
        <Card title="Recent System Activity" action="View All →">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }} className="activity-grid">
            <style>{`@media(max-width:640px){.activity-grid{grid-template-columns:1fr!important;}}`}</style>
            {activities.map(({ dot, text, sub, time }, i) => (
              <div key={i} style={{ display:"flex", gap:14, padding:"14px 16px", borderBottom: i<activities.length-2?`1px solid ${BORDER}`:"none", cursor:"pointer", transition:"background 0.15s", borderRadius:10 }}
                onMouseEnter={e => e.currentTarget.style.background = SMOKE}
                onMouseLeave={e => e.currentTarget.style.background = WHITE}
              >
                <div style={{ width:10, height:10, borderRadius:"50%", background:dot, flexShrink:0, marginTop:5, boxShadow:`0 0 0 3px ${dot}25` }}/>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700, color:NAVY2, fontSize:"0.85rem", lineHeight:1.4 }}>{text}</p>
                  <p style={{ color:SLATE_L, fontSize:"0.78rem", marginTop:2 }}>{sub}</p>
                </div>
                <span style={{ color:SLATE_L, fontSize:"0.75rem", whiteSpace:"nowrap", flexShrink:0 }}>{time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── DONATION TYPE INFORMATION ── */}
        <div className="dash-main-grid" style={{ marginBottom:20 }}>
          <Card title="Waiting Periods by Donation Type" action={<span style={{ display:"flex", alignItems:"center", gap:6 }}><FaCircleInfo/> Learn More</span>}>
            <p style={{ color:SLATE_L, fontSize:"0.83rem", marginBottom:16 }}>If you want to donate more frequently than every few months, you can opt for component donations (where a machine extracts only specific parts of your blood and returns the rest to you).</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { type:"Whole Blood", wait:"56-90 days", freq:"4-6 times/year", desc:"Most Common", color:RED },
                { type:"Platelets", wait:"7 days", freq:"24 times/year", desc:"Frequent Option", color:"#16A34A" },
                { type:"Plasma", wait:"28 days", freq:"13 times/year", desc:"Standard Banks", color:"#2563EB" },
                { type:"Double Red Cells", wait:"112 days", freq:"3 times/year", desc:"Large Volume", color:"#7C3AED" },
              ].map(({ type, wait, freq, desc, color }) => (
                <div key={type} style={{ background:SMOKE, borderRadius:12, padding:"16px", border:`1px solid ${BORDER}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color }}/>
                    <span style={{ fontWeight:800, color:NAVY2, fontSize:"0.88rem" }}>{type}</span>
                  </div>
                  <div style={{ color:SLATE_L, fontSize:"0.75rem", marginBottom:4 }}>
                    <span style={{ fontWeight:600, color:NAVY2 }}>Wait:</span> {wait}
                  </div>
                  <div style={{ color:SLATE_L, fontSize:"0.75rem", marginBottom:4 }}>
                    <span style={{ fontWeight:600, color:NAVY2 }}>Frequency:</span> {freq}
                  </div>
                  <div style={{ color:color, fontSize:"0.72rem", fontWeight:700, marginTop:6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Eligibility Checklist */}
          <Card title="Basic Eligibility Checklist" action={<span style={{ display:"flex", alignItems:"center", gap:6 }}><FaListCheck/> Full Details</span>}>
            <p style={{ color:SLATE_L, fontSize:"0.83rem", marginBottom:16 }}>Before visiting a blood bank or drive, ensure you meet these standard foundational rules.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { req:"Age", val:"17-65 years (16 with consent)", icon:"🎂" },
                { req:"Weight", val:"Minimum 50 kg (110 lbs)", icon:"⚖️" },
                { req:"Hemoglobin", val:"Minimum 12.5 g/dL", icon:"🩸" },
                { req:"Health", val:"Well, no infections/flu", icon:"✅" },
              ].map(({ req, val, icon }) => (
                <div key={req} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:SMOKE, borderRadius:10, border:`1px solid ${BORDER}` }}>
                  <span style={{ fontSize:"1.2rem" }}>{icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:NAVY2, fontSize:"0.85rem" }}>{req}</div>
                    <div style={{ color:SLATE_L, fontSize:"0.78rem" }}>{val}</div>
                  </div>
                  <FaCircleCheck style={{ color:"#16A34A", fontSize:"1.1rem" }}/>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, padding:"12px", background:`${RED}14`, borderRadius:8, border:`1px solid ${RED}30` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:"1rem" }}>⚠️</span>
                <span style={{ fontWeight:700, color:RED, fontSize:"0.82rem" }}>Important Note</span>
              </div>
              <p style={{ color:SLATE_L, fontSize:"0.76rem", lineHeight:1.5 }}>
                Additional eligibility criteria may apply based on recent medications, travel history, or medical conditions. Consult with blood bank staff for complete assessment.
              </p>
            </div>
          </Card>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;