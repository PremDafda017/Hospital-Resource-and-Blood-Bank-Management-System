// Shared hospital and doctor data for all pages
// Indian Government and Private Hospitals

export const hospitalDatabase = [
  // DELHI - Government Hospitals
  { id: 1, name: "AIIMS Hospital", state: "Delhi", city: "New Delhi", address: "AIIMS Campus, Ansari Nagar", phone: "011-26588500", lat: 28.5672, lng: 77.2100, type: "government" },
  { id: 2, name: "Safdarjung Hospital", state: "Delhi", city: "New Delhi", address: "Safdarjung Hospital Campus", phone: "011-26702700", lat: 28.5734, lng: 77.1901, type: "government" },
  { id: 3, name: "Lady Hardinge Medical College Hospital", state: "Delhi", city: "New Delhi", address: "Lady Hardinge Medical College", phone: "011-23364104", lat: 28.6268, lng: 77.2106, type: "government" },
  { id: 4, name: "GTB Hospital", state: "Delhi", city: "Delhi", address: "GTB Hospital, Dilshad Garden", phone: "011-22143111", lat: 28.6789, lng: 77.3178, type: "government" },
  { id: 5, name: "Ram Manohar Lohia Hospital", state: "Delhi", city: "New Delhi", address: "RML Hospital, New Delhi", phone: "011-23363212", lat: 28.6333, lng: 77.2089, type: "government" },
  
  // DELHI - Private Hospitals
  { id: 6, name: "Apollo Hospital", state: "Delhi", city: "New Delhi", address: "Apollo Hospital, Sarita Vihar", phone: "011-26825858", lat: 28.6375, lng: 77.2733, type: "private" },
  { id: 7, name: "Fortis Hospital", state: "Delhi", city: "New Delhi", address: "Fortis Hospital, Shalimar Bagh", phone: "011-47077777", lat: 28.7167, lng: 77.1583, type: "private" },
  { id: 8, name: "Max Healthcare Hospital", state: "Delhi", city: "New Delhi", address: "Max Hospital, Saket", phone: "011-26515650", lat: 28.5319, lng: 77.2189, type: "private" },
  { id: 9, name: "Medanta Hospital", state: "Delhi", city: "Gurgaon", address: "Medanta Hospital, Sector 38", phone: "0124-4141414", lat: 28.4289, lng: 77.0464, type: "private" },
  { id: 10, name: "Sir Ganga Ram Hospital", state: "Delhi", city: "New Delhi", address: "SGRH, Rajinder Nagar", phone: "011-25725424", lat: 28.6503, lng: 77.1867, type: "private" },
  { id: 11, name: "BLK Hospital", state: "Delhi", city: "New Delhi", address: "BLK Hospital, Pusa Road", phone: "011-23663636", lat: 28.6425, lng: 77.1833, type: "private" },
  { id: 12, name: "Indraprastha Apollo Hospital", state: "Delhi", city: "New Delhi", address: "Apollo Hospital, Sarita Vihar", phone: "011-26825858", lat: 28.6375, lng: 77.2733, type: "private" },
  
  // MAHARASHTRA - Government Hospitals
  { id: 13, name: "J.J. Hospital", state: "Maharashtra", city: "Mumbai", address: "J.J. Hospital, Byculla", phone: "022-23735555", lat: 18.9696, lng: 72.8333, type: "government" },
  { id: 14, name: "KEM Hospital", state: "Maharashtra", city: "Mumbai", address: "KEM Hospital, Parel", phone: "022-24138113", lat: 19.0066, lng: 72.8533, type: "government" },
  { id: 15, name: "Nair Hospital", state: "Maharashtra", city: "Mumbai", address: "Nair Hospital, Mumbai Central", phone: "022-23074126", lat: 18.9667, lng: 72.8217, type: "government" },
  { id: 16, name: "Sion Hospital", state: "Maharashtra", city: "Mumbai", address: "Sion Hospital, Sion", phone: "022-24076381", lat: 19.0414, lng: 72.8667, type: "government" },
  { id: 17, name: "Sassoon Hospital", state: "Maharashtra", city: "Pune", address: "Sassoon Hospital, Pune", phone: "020-26058280", lat: 18.5184, lng: 73.8567, type: "government" },
  { id: 18, name: "GMCH Nagpur", state: "Maharashtra", city: "Nagpur", address: "Government Medical College, Nagpur", phone: "0712-2545678", lat: 21.1498, lng: 79.0821, type: "government" },
  
  // MAHARASHTRA - Private Hospitals
  { id: 19, name: "Apollo Hospital", state: "Maharashtra", city: "Mumbai", address: "Apollo Hospital, Mumbai", phone: "022-24223333", lat: 19.0825, lng: 72.8812, type: "private" },
  { id: 20, name: "Fortis Hospital", state: "Maharashtra", city: "Mumbai", address: "Fortis Hospital, Mulund", phone: "022-25335678", lat: 19.1667, lng: 72.9417, type: "private" },
  { id: 21, name: "Kokilaben Hospital", state: "Maharashtra", city: "Mumbai", address: "Kokilaben Hospital, Andheri", phone: "022-26967579", lat: 19.1156, lng: 72.8406, type: "private" },
  { id: 22, name: "Jaslok Hospital", state: "Maharashtra", city: "Mumbai", address: "Jaslok Hospital, Peddar Road", phone: "022-22094444", lat: 18.9642, lng: 72.8167, type: "private" },
  { id: 23, name: "Breach Candy Hospital", state: "Maharashtra", city: "Mumbai", address: "Breach Candy Hospital, Mumbai", phone: "022-23668888", lat: 18.9833, lng: 72.8317, type: "private" },
  { id: 24, name: "Ruby Hall Clinic", state: "Maharashtra", city: "Pune", address: "Ruby Hall Clinic, Pune", phone: "020-26122111", lat: 18.5194, lng: 73.8711, type: "private" },
  { id: 25, name: "Jehangir Hospital", state: "Maharashtra", city: "Pune", address: "Jehangir Hospital, Pune", phone: "020-26156677", lat: 18.5114, lng: 73.8722, type: "private" },
  { id: 26, name: "Wockhardt Hospital", state: "Maharashtra", city: "Nagpur", address: "Wockhardt Hospital, Nagpur", phone: "0712-2545678", lat: 21.1589, lng: 79.0922, type: "private" },
  
  // KARNATAKA - Government Hospitals
  { id: 27, name: "Victoria Hospital", state: "Karnataka", city: "Bangalore", address: "Victoria Hospital, Bangalore", phone: "080-26700880", lat: 12.9716, lng: 77.5946, type: "government" },
  { id: 28, name: "Bowring Hospital", state: "Karnataka", city: "Bangalore", address: "Bowring Hospital, Bangalore", phone: "080-22867069", lat: 12.9914, lng: 77.6041, type: "government" },
  { id: 29, name: "Mysore Medical College Hospital", state: "Karnataka", city: "Mysore", address: "MMC, Mysore", phone: "0821-2548350", lat: 12.3167, lng: 76.6467, type: "government" },
  { id: 30, name: "KMC Manipal Hospital", state: "Karnataka", city: "Manipal", address: "KMC, Manipal", phone: "0820-2571919", lat: 13.3538, lng: 74.7926, type: "government" },
  
  // KARNATAKA - Private Hospitals
  { id: 31, name: "Apollo Hospital", state: "Karnataka", city: "Bangalore", address: "Apollo Hospital, Bangalore", phone: "080-26860555", lat: 12.9356, lng: 77.6061, type: "private" },
  { id: 32, name: "Fortis Hospital", state: "Karnataka", city: "Bangalore", address: "Fortis Hospital, Bannerghatta", phone: "080-22221212", lat: 12.8956, lng: 77.5956, type: "private" },
  { id: 33, name: "Manipal Hospital", state: "Karnataka", city: "Bangalore", address: "Manipal Hospital, Old Airport Road", phone: "080-22220333", lat: 12.9417, lng: 77.6142, type: "private" },
  { id: 34, name: "Narayana Health", state: "Karnataka", city: "Bangalore", address: "Narayana Health, HSR Layout", phone: "080-66224444", lat: 12.9189, lng: 77.6489, type: "private" },
  { id: 35, name: "Columbia Asia Hospital", state: "Karnataka", city: "Bangalore", address: "Columbia Asia, Yelahanka", phone: "080-43443333", lat: 13.1017, lng: 77.5817, type: "private" },
  { id: 36, name: "Aster Hospital", state: "Karnataka", city: "Mysore", address: "Aster Hospital, Mysore", phone: "0821-4255555", lat: 12.3089, lng: 76.6544, type: "private" },
  
  // TAMIL NADU - Government Hospitals
  { id: 37, name: "Rajiv Gandhi Government Hospital", state: "Tamil Nadu", city: "Chennai", address: "RGGGH, Chennai", phone: "044-25305305", lat: 13.0827, lng: 80.2707, type: "government" },
  { id: 38, name: "Government General Hospital", state: "Tamil Nadu", city: "Chennai", address: "GH, Chennai", phone: "044-25303437", lat: 13.0754, lng: 80.2625, type: "government" },
  { id: 39, name: "Madurai Medical College Hospital", state: "Tamil Nadu", city: "Madurai", address: "MMC, Madurai", phone: "0452-2532530", lat: 9.9252, lng: 78.1198, type: "government" },
  { id: 40, name: "CMCH Coimbatore", state: "Tamil Nadu", city: "Coimbatore", address: "CMCH, Coimbatore", phone: "0422-2300200", lat: 10.9817, lng: 76.9656, type: "government" },
  
  // TAMIL NADU - Private Hospitals
  { id: 41, name: "Apollo Hospital", state: "Tamil Nadu", city: "Chennai", address: "Apollo Hospital, Chennai", phone: "044-28297777", lat: 13.0567, lng: 80.2567, type: "private" },
  { id: 42, name: "Fortis Hospital", state: "Tamil Nadu", city: "Chennai", address: "Fortis Malar Hospital, Chennai", phone: "044-42898888", lat: 13.0467, lng: 80.2467, type: "private" },
  { id: 43, name: "MIOT Hospital", state: "Tamil Nadu", city: "Chennai", address: "MIOT Hospital, Chennai", phone: "044-42494567", lat: 13.0667, lng: 80.2367, type: "private" },
  { id: 44, name: "KG Hospital", state: "Tamil Nadu", city: "Coimbatore", address: "KG Hospital, Coimbatore", phone: "0422-2214000", lat: 10.9917, lng: 76.9756, type: "private" },
  { id: 45, name: "Ganga Hospital", state: "Tamil Nadu", city: "Coimbatore", address: "Ganga Hospital, Coimbatore", phone: "0422-2474444", lat: 10.9967, lng: 76.9706, type: "private" },
  { id: 46, name: "Meenakshi Hospital", state: "Tamil Nadu", city: "Madurai", address: "Meenakshi Hospital, Madurai", phone: "0452-2525252", lat: 9.9312, lng: 78.1248, type: "private" },
  
  // WEST BENGAL - Government Hospitals
  { id: 47, name: "IPGMER Hospital", state: "West Bengal", city: "Kolkata", address: "IPGMER, Kolkata", phone: "033-22235313", lat: 22.5587, lng: 88.3955, type: "government" },
  { id: 48, name: "Medical College Hospital", state: "West Bengal", city: "Kolkata", address: "MCH, Kolkata", phone: "033-22415072", lat: 22.5726, lng: 88.3639, type: "government" },
  { id: 49, name: "NRS Medical College Hospital", state: "West Bengal", city: "Kolkata", address: "NRS Medical College, Kolkata", phone: "033-22415072", lat: 22.5726, lng: 88.3639, type: "government" },
  { id: 50, name: "RG Kar Medical College Hospital", state: "West Bengal", city: "Kolkata", address: "RG Kar Medical College, Kolkata", phone: "033-22415072", lat: 22.5726, lng: 88.3639, type: "government" },
  
  // WEST BENGAL - Private Hospitals
  { id: 51, name: "Apollo Hospital", state: "West Bengal", city: "Kolkata", address: "Apollo Hospital, Kolkata", phone: "033-23203030", lat: 22.5726, lng: 88.4039, type: "private" },
  { id: 52, name: "Fortis Hospital", state: "West Bengal", city: "Kolkata", address: "Fortis Hospital, Kolkata", phone: "033-22483030", lat: 22.5626, lng: 88.3939, type: "private" },
  { id: 53, name: "AMRI Hospital", state: "West Bengal", city: "Kolkata", address: "AMRI Hospital, Kolkata", phone: "033-22483030", lat: 22.5626, lng: 88.3939, type: "private" },
  { id: 54, name: "Medica Hospital", state: "West Bengal", city: "Kolkata", address: "Medica Hospital, Kolkata", phone: "033-22483030", lat: 22.5626, lng: 88.3939, type: "private" },

  // ANDHRA PRADESH - Government Hospitals
  { id: 55, name: "Government General Hospital", state: "Andhra Pradesh", city: "Visakhapatnam", address: "GGH, Visakhapatnam", phone: "0891-2545678", lat: 17.6868, lng: 83.2185, type: "government" },
  { id: 56, name: "King George Hospital", state: "Andhra Pradesh", city: "Vijayawada", address: "KGH, Vijayawada", phone: "0866-2570000", lat: 16.5062, lng: 80.6480, type: "government" },
  { id: 57, name: "Sri Venkateswara Institute", state: "Andhra Pradesh", city: "Tirupati", address: "SVIMS, Tirupati", phone: "0877-2277777", lat: 13.6288, lng: 79.4188, type: "government" },

  // ANDHRA PRADESH - Private Hospitals
  { id: 58, name: "Apollo Hospital", state: "Andhra Pradesh", city: "Visakhapatnam", address: "Apollo Hospital, Visakhapatnam", phone: "0891-2780000", lat: 17.7326, lng: 83.3066, type: "private" },
  { id: 59, name: "Care Hospital", state: "Andhra Pradesh", city: "Hyderabad", address: "Care Hospital, Hyderabad", phone: "040-23380000", lat: 17.4375, lng: 78.4482, type: "private" },

  // GUJARAT - Government Hospitals
  { id: 60, name: "Civil Hospital", state: "Gujarat", city: "Ahmedabad", address: "Civil Hospital, Ahmedabad", phone: "079-2260000", lat: 23.0302, lng: 72.5800, type: "government" },
  { id: 61, name: "GMERS Medical College", state: "Gujarat", city: "Vadodara", address: "GMERS, Vadodara", phone: "0265-2780000", lat: 22.3107, lng: 73.1940, type: "government" },
  { id: 62, name: "Sir T Hospital", state: "Gujarat", city: "Bhavnagar", address: "Sir T Hospital, Bhavnagar", phone: "0278-2420000", lat: 21.7645, lng: 72.1517, type: "government" },

  // GUJARAT - Private Hospitals
  { id: 63, name: "Apollo Hospital", state: "Gujarat", city: "Ahmedabad", address: "Apollo Hospital, Ahmedabad", phone: "079-6660000", lat: 23.0320, lng: 72.5640, type: "private" },
  { id: 64, name: "Zydus Hospital", state: "Gujarat", city: "Ahmedabad", address: "Zydus Hospital, Ahmedabad", phone: "079-6630000", lat: 23.0280, lng: 72.5600, type: "private" },

  // RAJASTHAN - Government Hospitals
  { id: 65, name: "SMS Hospital", state: "Rajasthan", city: "Jaipur", address: "SMS Hospital, Jaipur", phone: "0141-2540000", lat: 26.9124, lng: 75.7873, type: "government" },
  { id: 66, name: "RNT Medical College Hospital", state: "Rajasthan", city: "Udaipur", address: "RNT Medical College, Udaipur", phone: "0294-2520000", lat: 24.5780, lng: 73.6860, type: "government" },
  { id: 67, name: "SP Medical College Hospital", state: "Rajasthan", city: "Bikaner", address: "SP Medical College, Bikaner", phone: "0151-2520000", lat: 28.0229, lng: 73.3119, type: "government" },

  // RAJASTHAN - Private Hospitals
  { id: 68, name: "Fortis Hospital", state: "Rajasthan", city: "Jaipur", address: "Fortis Hospital, Jaipur", phone: "0141-4160000", lat: 26.9150, lng: 75.7950, type: "private" },
  { id: 69, name: "MGM Hospital", state: "Rajasthan", city: "Jodhpur", address: "MGM Hospital, Jodhpur", phone: "0291-2540000", lat: 26.2670, lng: 73.0340, type: "private" },

  // KERALA - Government Hospitals
  { id: 70, name: "Medical College Hospital", state: "Kerala", city: "Thiruvananthapuram", address: "MCH, Thiruvananthapuram", phone: "0471-2540000", lat: 8.5241, lng: 76.9366, type: "government" },
  { id: 71, name: "Government Medical College Hospital", state: "Kerala", city: "Kozhikode", address: "GMC, Kozhikode", phone: "0495-2540000", lat: 11.2588, lng: 75.7804, type: "government" },
  { id: 72, name: "Kottayam Medical College Hospital", state: "Kerala", city: "Kottayam", address: "KMC, Kottayam", phone: "0481-2540000", lat: 9.5915, lng: 76.5222, type: "government" },

  // KERALA - Private Hospitals
  { id: 73, name: "Apollo Hospital", state: "Kerala", city: "Kochi", address: "Apollo Hospital, Kochi", phone: "0484-2800000", lat: 9.9674, lng: 76.2450, type: "private" },
  { id: 74, name: "Aster Medicity", state: "Kerala", city: "Kochi", address: "Aster Medicity, Kochi", phone: "0484-2600000", lat: 9.9700, lng: 76.2500, type: "private" },

  // PUNJAB - Government Hospitals
  { id: 75, name: "Government Medical College Hospital", state: "Punjab", city: "Chandigarh", address: "GMC, Chandigarh", phone: "0172-2540000", lat: 30.7333, lng: 76.7794, type: "government" },
  { id: 76, name: "Dayanand Medical College Hospital", state: "Punjab", city: "Ludhiana", address: "DMCH, Ludhiana", phone: "0161-2540000", lat: 30.9000, lng: 75.8573, type: "government" },
  { id: 77, name: "Government Medical College Hospital", state: "Punjab", city: "Amritsar", address: "GMC, Amritsar", phone: "0183-2540000", lat: 31.6340, lng: 74.8723, type: "government" },

  // PUNJAB - Private Hospitals
  { id: 78, name: "Fortis Hospital", state: "Punjab", city: "Mohali", address: "Fortis Hospital, Mohali", phone: "0172-5090000", lat: 30.7040, lng: 76.7170, type: "private" },
  { id: 79, name: "Apollo Hospital", state: "Punjab", city: "Ludhiana", address: "Apollo Hospital, Ludhiana", phone: "0161-2540000", lat: 30.9000, lng: 75.8573, type: "private" },

  // UTTAR PRADESH - Government Hospitals
  { id: 80, name: "King George Medical University Hospital", state: "Uttar Pradesh", city: "Lucknow", address: "KGMU, Lucknow", phone: "0522-2540000", lat: 26.8467, lng: 80.9462, type: "government" },
  { id: 81, name: "GSVM Medical College Hospital", state: "Uttar Pradesh", city: "Kanpur", address: "GSVM, Kanpur", phone: "0512-2540000", lat: 26.4499, lng: 80.3319, type: "government" },
  { id: 82, name: "SN Medical College Hospital", state: "Uttar Pradesh", city: "Agra", address: "SN Medical College, Agra", phone: "0562-2540000", lat: 27.1753, lng: 78.0081, type: "government" },

  // UTTAR PRADESH - Private Hospitals
  { id: 83, name: "Apollo Hospital", state: "Uttar Pradesh", city: "Lucknow", address: "Apollo Hospital, Lucknow", phone: "0522-2600000", lat: 26.8500, lng: 80.9500, type: "private" },
  { id: 84, name: "Fortis Hospital", state: "Uttar Pradesh", city: "Noida", address: "Fortis Hospital, Noida", phone: "0120-4560000", lat: 28.5700, lng: 77.3200, type: "private" },

  // MADHYA PRADESH - Government Hospitals
  { id: 85, name: "Hamidia Hospital", state: "Madhya Pradesh", city: "Bhopal", address: "Hamidia Hospital, Bhopal", phone: "0755-2540000", lat: 23.2599, lng: 77.4126, type: "government" },
  { id: 86, name: "MGMMC Hospital", state: "Madhya Pradesh", city: "Indore", address: "MGMMC, Indore", phone: "0731-2540000", lat: 22.7196, lng: 75.8577, type: "government" },
  { id: 87, name: "GMC Hospital", state: "Madhya Pradesh", city: "Gwalior", address: "GMC, Gwalior", phone: "0751-2540000", lat: 26.2124, lng: 78.1772, type: "government" },

  // MADHYA PRADESH - Private Hospitals
  { id: 88, name: "Apollo Hospital", state: "Madhya Pradesh", city: "Indore", address: "Apollo Hospital, Indore", phone: "0731-2600000", lat: 22.7200, lng: 75.8600, type: "private" },
  { id: 89, name: "Choithram Hospital", state: "Madhya Pradesh", city: "Indore", address: "Choithram Hospital, Indore", phone: "0731-2540000", lat: 22.7180, lng: 75.8550, type: "private" },

  // ODISHA - Government Hospitals
  { id: 90, name: "SCB Medical College Hospital", state: "Odisha", city: "Cuttack", address: "SCB Medical College, Cuttack", phone: "0671-2540000", lat: 20.4625, lng: 85.8830, type: "government" },
  { id: 91, name: "AIIMS Bhubaneswar Hospital", state: "Odisha", city: "Bhubaneswar", address: "AIIMS, Bhubaneswar", phone: "0674-2540000", lat: 20.1967, lng: 85.8196, type: "government" },

  // ODISHA - Private Hospitals
  { id: 92, name: "Apollo Hospital", state: "Odisha", city: "Bhubaneswar", address: "Apollo Hospital, Bhubaneswar", phone: "0674-2600000", lat: 20.2000, lng: 85.8250, type: "private" },
  { id: 93, name: "KIMS Hospital", state: "Odisha", city: "Bhubaneswar", address: "KIMS, Bhubaneswar", phone: "0674-2540000", lat: 20.1950, lng: 85.8150, type: "private" },

  // BIHAR - Government Hospitals
  { id: 94, name: "PMCH Hospital", state: "Bihar", city: "Patna", address: "PMCH, Patna", phone: "0612-2540000", lat: 25.5941, lng: 85.1376, type: "government" },
  { id: 95, name: "IGIMS Hospital", state: "Bihar", city: "Patna", address: "IGIMS, Patna", phone: "0612-2600000", lat: 25.6000, lng: 85.1400, type: "government" },

  // BIHAR - Private Hospitals
  { id: 96, name: "Apollo Hospital", state: "Bihar", city: "Patna", address: "Apollo Hospital, Patna", phone: "0612-2540000", lat: 25.5950, lng: 85.1350, type: "private" },
  { id: 97, name: "Paras Hospital", state: "Bihar", city: "Patna", address: "Paras Hospital, Patna", phone: "0612-2540000", lat: 25.5900, lng: 85.1300, type: "private" },

  // TELANGANA - Government Hospitals
  { id: 98, name: "Gandhi Hospital", state: "Telangana", city: "Hyderabad", address: "Gandhi Hospital, Hyderabad", phone: "040-2540000", lat: 17.4480, lng: 78.3915, type: "government" },
  { id: 99, name: "Osmania Hospital", state: "Telangana", city: "Hyderabad", address: "Osmania Hospital, Hyderabad", phone: "040-2540000", lat: 17.3840, lng: 78.4564, type: "government" },

  // TELANGANA - Private Hospitals
  { id: 100, name: "Apollo Hospital", state: "Telangana", city: "Hyderabad", address: "Apollo Hospital, Hyderabad", phone: "040-2600000", lat: 17.4400, lng: 78.3800, type: "private" },
  { id: 101, name: "Yashoda Hospital", state: "Telangana", city: "Hyderabad", address: "Yashoda Hospital, Hyderabad", phone: "040-2540000", lat: 17.4350, lng: 78.3750, type: "private" },

  // ASSAM - Government Hospitals
  { id: 102, name: "Gauhati Medical College Hospital", state: "Assam", city: "Guwahati", address: "GMC, Guwahati", phone: "0361-2540000", lat: 26.1445, lng: 91.7362, type: "government" },
  { id: 103, name: "Assam Medical College Hospital", state: "Assam", city: "Dibrugarh", address: "AMC, Dibrugarh", phone: "0373-2540000", lat: 27.4728, lng: 94.9120, type: "government" },

  // ASSAM - Private Hospitals
  { id: 104, name: "Apollo Hospital", state: "Assam", city: "Guwahati", address: "Apollo Hospital, Guwahati", phone: "0361-2600000", lat: 26.1500, lng: 91.7400, type: "private" },

  // JHARKHAND - Government Hospitals
  { id: 105, name: "RIMS Hospital", state: "Jharkhand", city: "Ranchi", address: "RIMS, Ranchi", phone: "0651-2540000", lat: 23.3441, lng: 85.3096, type: "government" },
  { id: 106, name: "PGMCH Hospital", state: "Jharkhand", city: "Dhanbad", address: "PGMCH, Dhanbad", phone: "0326-2540000", lat: 23.7957, lng: 86.4304, type: "government" },

  // CHHATTISGARH - Government Hospitals
  { id: 107, name: "AIIMS Raipur Hospital", state: "Chhattisgarh", city: "Raipur", address: "AIIMS, Raipur", phone: "0771-2540000", lat: 21.2514, lng: 81.6296, type: "government" },
  { id: 108, name: "Medical College Hospital", state: "Chhattisgarh", city: "Bilaspur", address: "MCH, Bilaspur", phone: "07752-254000", lat: 22.0800, lng: 82.1500, type: "government" },

  // HIMACHAL PRADESH - Government Hospitals
  { id: 109, name: "IGMC Hospital", state: "Himachal Pradesh", city: "Shimla", address: "IGMC, Shimla", phone: "0177-2540000", lat: 31.1048, lng: 77.1734, type: "government" },

  // UTTARAKHAND - Government Hospitals
  { id: 110, name: "Doon Medical College Hospital", state: "Uttarakhand", city: "Dehradun", address: "DMC, Dehradun", phone: "0135-2540000", lat: 30.3265, lng: 78.0438, type: "government" },

  // HARYANA - Government Hospitals
  { id: 111, name: "PGIMS Rohtak Hospital", state: "Haryana", city: "Rohtak", address: "PGIMS, Rohtak", phone: "01262-254000", lat: 28.8809, lng: 76.5804, type: "government" },

  // GOA - Government Hospitals
  { id: 112, name: "Goa Medical College Hospital", state: "Goa", city: "Panaji", address: "GMC, Panaji", phone: "0832-2540000", lat: 15.4989, lng: 73.8282, type: "government" },

  // HIMACHAL PRADESH - Private Hospitals
  { id: 113, name: "Fortis Hospital", state: "Himachal Pradesh", city: "Mohali", address: "Fortis Hospital, Mohali", phone: "0172-5090000", lat: 30.7040, lng: 76.7170, type: "private" },

  // UTTARAKHAND - Private Hospitals
  { id: 114, name: "Max Hospital", state: "Uttarakhand", city: "Dehradun", address: "Max Hospital, Dehradun", phone: "0135-2540000", lat: 30.3265, lng: 78.0438, type: "private" },

  // HARYANA - Private Hospitals
  { id: 115, name: "Medanta Hospital", state: "Haryana", city: "Gurgaon", address: "Medanta Hospital, Sector 38", phone: "0124-4141414", lat: 28.4289, lng: 77.0464, type: "private" },

  // GOA - Private Hospitals
  { id: 116, name: "Manipal Hospital", state: "Goa", city: "Panaji", address: "Manipal Hospital, Panaji", phone: "0832-2540000", lat: 15.4989, lng: 73.8282, type: "private" },
];

// Keep blood bank data for other pages that might need it
export const bloodBankDatabase = hospitalDatabase.map(hospital => ({
  ...hospital,
  bloodStock: { "A+": 45, "A-": 12, "B+": 38, "B-": 8, "AB+": 22, "AB-": 5, "O+": 67, "O-": 15 },
  licenseNo: `${hospital.state.substring(0,2).toUpperCase()}-BB-${String(hospital.id).padStart(3,'0')}`,
  capacity: 500
}));

// Doctor database linked to hospitals
export const doctorDatabase = [
  // DELHI - Government Hospital Doctors
  { id: 1, name: "Dr. Rajesh Kumar", specialization: "Hematology", hospitalId: 1, experience: 15, phone: "011-26588501", email: "rajesh.kumar@aiims.gov.in", qualification: "MD, DM" },
  { id: 2, name: "Dr. Priya Sharma", specialization: "Pathology", hospitalId: 1, experience: 12, phone: "011-26588502", email: "priya.sharma@aiims.gov.in", qualification: "MD, DNB" },
  { id: 3, name: "Dr. Amit Verma", specialization: "Transfusion Medicine", hospitalId: 2, experience: 18, phone: "011-26702701", email: "amit.verma@safdarjung.gov.in", qualification: "MD, DM" },
  { id: 4, name: "Dr. Sunita Gupta", specialization: "Hematology", hospitalId: 3, experience: 10, phone: "011-23364105", email: "sunita.gupta@lhmc.gov.in", qualification: "MD" },
  { id: 5, name: "Dr. Vijay Singh", specialization: "Pathology", hospitalId: 4, experience: 14, phone: "011-22143112", email: "vijay.singh@gtb.gov.in", qualification: "MD, DNB" },
  
  // DELHI - Private Hospital Doctors
  { id: 6, name: "Dr. Anjali Mehta", specialization: "Hematology", hospitalId: 6, experience: 20, phone: "011-26825859", email: "anjali.mehta@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 7, name: "Dr. Rajiv Malhotra", specialization: "Transfusion Medicine", hospitalId: 6, experience: 16, phone: "011-26825860", email: "rajiv.malhotra@apollo.com", qualification: "MD, DM" },
  { id: 8, name: "Dr. Neha Kapoor", specialization: "Pathology", hospitalId: 7, experience: 12, phone: "011-47077778", email: "neha.kapoor@fortis.com", qualification: "MD, DNB" },
  { id: 9, name: "Dr. Sanjay Arora", specialization: "Hematology", hospitalId: 8, experience: 18, phone: "011-26515651", email: "sanjay.arora@maxhealthcare.com", qualification: "MD, DM" },
  { id: 10, name: "Dr. Preeti Desai", specialization: "Transfusion Medicine", hospitalId: 9, experience: 14, phone: "0124-4141415", email: "preeti.desai@medanta.com", qualification: "MD, DM" },
  { id: 11, name: "Dr. Deepak Chawla", specialization: "Hematology", hospitalId: 10, experience: 22, phone: "011-25725425", email: "deepak.chawla@sgrh.com", qualification: "MD, DM, FRCP" },
  
  // MAHARASHTRA - Government Hospital Doctors
  { id: 12, name: "Dr. Suresh Patil", specialization: "Hematology", hospitalId: 13, experience: 25, phone: "022-23735556", email: "suresh.patil@jjhospital.gov.in", qualification: "MD, DM, FRCP" },
  { id: 13, name: "Dr. Meera Joshi", specialization: "Pathology", hospitalId: 14, experience: 18, phone: "022-24138114", email: "meera.joshi@kem.gov.in", qualification: "MD, DNB" },
  { id: 14, name: "Dr. Rahul Deshmukh", specialization: "Transfusion Medicine", hospitalId: 15, experience: 15, phone: "022-23074127", email: "rahul.deshmukh@nair.gov.in", qualification: "MD, DM" },
  { id: 15, name: "Dr. Kavita Kulkarni", specialization: "Hematology", hospitalId: 16, experience: 12, phone: "022-24076382", email: "kavita.kulkarni@sion.gov.in", qualification: "MD" },
  { id: 16, name: "Dr. Ashok Jadhav", specialization: "Pathology", hospitalId: 17, experience: 20, phone: "020-26058281", email: "ashok.jadhav@sassoon.gov.in", qualification: "MD, DNB" },
  
  // MAHARASHTRA - Private Hospital Doctors
  { id: 17, name: "Dr. Rani Mukherjee", specialization: "Hematology", hospitalId: 19, experience: 22, phone: "022-24223334", email: "rani.mukherjee@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 18, name: "Dr. Vikram Shah", specialization: "Transfusion Medicine", hospitalId: 20, experience: 16, phone: "022-25335679", email: "vikram.shah@fortis.com", qualification: "MD, DM" },
  { id: 19, name: "Dr. Shreya Nair", specialization: "Pathology", hospitalId: 21, experience: 14, phone: "022-26967580", email: "shreya.nair@kokilaben.com", qualification: "MD, DNB" },
  { id: 20, name: "Dr. Madhav Menon", specialization: "Hematology", hospitalId: 22, experience: 28, phone: "022-22094445", email: "madhav.menon@jaslok.com", qualification: "MD, DM, FRCP" },
  { id: 21, name: "Dr. Lata Iyer", specialization: "Transfusion Medicine", hospitalId: 23, experience: 18, phone: "022-23668889", email: "lata.iyer@breachcandy.com", qualification: "MD, DM" },
  
  // KARNATAKA - Government Hospital Doctors
  { id: 22, name: "Dr. Venkatesh Murthy", specialization: "Hematology", hospitalId: 27, experience: 20, phone: "080-26700881", email: "venkatesh.murthy@victoria.gov.in", qualification: "MD, DM" },
  { id: 23, name: "Dr. Lakshmi Devi", specialization: "Pathology", hospitalId: 28, experience: 16, phone: "080-22867070", email: "lakshmi.devi@bowring.gov.in", qualification: "MD, DNB" },
  { id: 24, name: "Dr. Ramesh Rao", specialization: "Transfusion Medicine", hospitalId: 29, experience: 14, phone: "0821-2548351", email: "ramesh.rao@mmc.gov.in", qualification: "MD, DM" },
  { id: 25, name: "Dr. Shashidhar", specialization: "Hematology", hospitalId: 30, experience: 18, phone: "0820-2571920", email: "shashidhar@kmc.gov.in", qualification: "MD, DM" },
  
  // KARNATAKA - Private Hospital Doctors
  { id: 26, name: "Dr. Anitha Reddy", specialization: "Hematology", hospitalId: 31, experience: 24, phone: "080-26860556", email: "anitha.reddy@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 27, name: "Dr. Krishnan Nair", specialization: "Transfusion Medicine", hospitalId: 32, experience: 18, phone: "080-22221213", email: "krishnan.nair@fortis.com", qualification: "MD, DM" },
  { id: 28, name: "Dr. Priyanka S", specialization: "Pathology", hospitalId: 33, experience: 15, phone: "080-22220334", email: "priyanka.s@manipal.com", qualification: "MD, DNB" },
  { id: 29, name: "Dr. Ravi Chandran", specialization: "Hematology", hospitalId: 34, experience: 20, phone: "080-66224445", email: "ravi.chandran@narayana.com", qualification: "MD, DM" },
  { id: 30, name: "Dr. Sowmya K", specialization: "Transfusion Medicine", hospitalId: 35, experience: 12, phone: "080-43443334", email: "sowmya.k@columbiaasia.com", qualification: "MD, DM" },
  
  // TAMIL NADU - Government Hospital Doctors
  { id: 31, name: "Dr. Balakrishnan", specialization: "Hematology", hospitalId: 37, experience: 26, phone: "044-25305306", email: "balakrishnan@rgggh.gov.in", qualification: "MD, DM, FRCP" },
  { id: 32, name: "Dr. Lakshmi Narayanan", specialization: "Pathology", hospitalId: 38, experience: 20, phone: "044-25303438", email: "lakshmi.narayanan@gh.gov.in", qualification: "MD, DNB" },
  { id: 33, name: "Dr. S. Ramesh", specialization: "Transfusion Medicine", hospitalId: 39, experience: 16, phone: "0452-2532531", email: "ramesh.s@mmc.gov.in", qualification: "MD, DM" },
  { id: 34, name: "Dr. K. Saravanan", specialization: "Hematology", hospitalId: 40, experience: 14, phone: "0422-2300201", email: "saravanan.k@cmch.gov.in", qualification: "MD" },
  
  // TAMIL NADU - Private Hospital Doctors
  { id: 35, name: "Dr. Chitra Sundararajan", specialization: "Hematology", hospitalId: 41, experience: 28, phone: "044-28297778", email: "chitra.sundararajan@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 36, name: "Dr. S. Raghavan", specialization: "Transfusion Medicine", hospitalId: 42, experience: 20, phone: "044-42898889", email: "raghavan.s@fortis.com", qualification: "MD, DM" },
  { id: 37, name: "Dr. P. Kalyani", specialization: "Pathology", hospitalId: 43, experience: 16, phone: "044-42494568", email: "kalyani.p@miot.com", qualification: "MD, DNB" },
  { id: 38, name: "Dr. R. Venkatesh", specialization: "Hematology", hospitalId: 44, experience: 22, phone: "0422-2214001", email: "venkatesh.r@kg.com", qualification: "MD, DM" },
  { id: 39, name: "Dr. M. Anand", specialization: "Transfusion Medicine", hospitalId: 45, experience: 18, phone: "0422-2474445", email: "anand.m@ganga.com", qualification: "MD, DM" },
  
  // WEST BENGAL - Government Hospital Doctors
  { id: 40, name: "Dr. Amitava Banerjee", specialization: "Hematology", hospitalId: 47, experience: 30, phone: "033-22235314", email: "amitava.banerjee@ipgmer.gov.in", qualification: "MD, DM, FRCP" },
  { id: 41, name: "Dr. Sharmila Chatterjee", specialization: "Pathology", hospitalId: 48, experience: 22, phone: "033-22415073", email: "sharmila.chatterjee@mch.gov.in", qualification: "MD, DNB" },
  { id: 42, name: "Dr. Subrata Roy", specialization: "Transfusion Medicine", hospitalId: 49, experience: 18, phone: "033-22415074", email: "subrata.roy@nrs.gov.in", qualification: "MD, DM" },
  { id: 43, name: "Dr. Tanima Sengupta", specialization: "Hematology", hospitalId: 50, experience: 16, phone: "033-22415075", email: "tanima.sengupta@rgkar.gov.in", qualification: "MD" },
  
  // WEST BENGAL - Private Hospital Doctors
  { id: 44, name: "Dr. Rajesh Chakraborty", specialization: "Hematology", hospitalId: 51, experience: 26, phone: "033-23203031", email: "rajesh.chakraborty@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 45, name: "Dr. Indrani Dutta", specialization: "Transfusion Medicine", hospitalId: 52, experience: 20, phone: "033-22483031", email: "indrani.dutta@fortis.com", qualification: "MD, DM" },
  { id: 46, name: "Dr. Prasun Ghosh", specialization: "Pathology", hospitalId: 53, experience: 18, phone: "033-22483032", email: "prasun.ghosh@amri.com", qualification: "MD, DNB" },
  { id: 47, name: "Dr. Madhumita Das", specialization: "Hematology", hospitalId: 54, experience: 22, phone: "033-22483033", email: "madhumita.das@medica.com", qualification: "MD, DM" },

  // ANDHRA PRADESH - Government Hospital Doctors
  { id: 48, name: "Dr. Srinivas Rao", specialization: "Hematology", hospitalId: 55, experience: 18, phone: "0891-2545679", email: "srinivas.rao@ggh.gov.in", qualification: "MD, DM" },
  { id: 49, name: "Dr. Lakshmi Devi", specialization: "Pathology", hospitalId: 56, experience: 15, phone: "0866-2570001", email: "lakshmi.devi@kgh.gov.in", qualification: "MD, DNB" },
  { id: 50, name: "Dr. Venkatesh Reddy", specialization: "Transfusion Medicine", hospitalId: 57, experience: 12, phone: "0877-2277778", email: "venkatesh.reddy@svims.gov.in", qualification: "MD, DM" },

  // ANDHRA PRADESH - Private Hospital Doctors
  { id: 51, name: "Dr. Anand Kumar", specialization: "Hematology", hospitalId: 58, experience: 20, phone: "0891-2780001", email: "anand.kumar@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 52, name: "Dr. Priya Nair", specialization: "Transfusion Medicine", hospitalId: 59, experience: 16, phone: "040-23380001", email: "priya.nair@care.com", qualification: "MD, DM" },

  // GUJARAT - Government Hospital Doctors
  { id: 53, name: "Dr. Mukesh Patel", specialization: "Hematology", hospitalId: 60, experience: 22, phone: "079-2260001", email: "mukesh.patel@civil.gov.in", qualification: "MD, DM, FRCP" },
  { id: 54, name: "Dr. Suresh Shah", specialization: "Pathology", hospitalId: 61, experience: 18, phone: "0265-2780001", email: "suresh.shah@gmers.gov.in", qualification: "MD, DNB" },
  { id: 55, name: "Dr. Meena Joshi", specialization: "Transfusion Medicine", hospitalId: 62, experience: 14, phone: "0278-2420001", email: "meena.joshi@sirth.gov.in", qualification: "MD, DM" },

  // GUJARAT - Private Hospital Doctors
  { id: 56, name: "Dr. Rajesh Mehta", specialization: "Hematology", hospitalId: 63, experience: 24, phone: "079-6660001", email: "rajesh.mehta@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 57, name: "Dr. Neha Desai", specialization: "Transfusion Medicine", hospitalId: 64, experience: 18, phone: "079-6630001", email: "neha.desai@zydus.com", qualification: "MD, DM" },

  // RAJASTHAN - Government Hospital Doctors
  { id: 58, name: "Dr. Sunil Sharma", specialization: "Hematology", hospitalId: 65, experience: 20, phone: "0141-2540001", email: "sunil.sharma@sms.gov.in", qualification: "MD, DM" },
  { id: 59, name: "Dr. Anita Singh", specialization: "Pathology", hospitalId: 66, experience: 16, phone: "0294-2520001", email: "anita.singh@rnt.gov.in", qualification: "MD, DNB" },
  { id: 60, name: "Dr. Vijay Kumar", specialization: "Transfusion Medicine", hospitalId: 67, experience: 14, phone: "0151-2520001", email: "vijay.kumar@sp.gov.in", qualification: "MD, DM" },

  // RAJASTHAN - Private Hospital Doctors
  { id: 61, name: "Dr. Arun Verma", specialization: "Hematology", hospitalId: 68, experience: 22, phone: "0141-4160001", email: "arun.verma@fortis.com", qualification: "MD, DM, FRCP" },
  { id: 62, name: "Dr. Suman Gupta", specialization: "Transfusion Medicine", hospitalId: 69, experience: 18, phone: "0291-2540001", email: "suman.gupta@mgm.com", qualification: "MD, DM" },

  // KERALA - Government Hospital Doctors
  { id: 63, name: "Dr. Ramesh Nair", specialization: "Hematology", hospitalId: 70, experience: 18, phone: "0471-2540001", email: "ramesh.nair@mch.gov.in", qualification: "MD, DM" },
  { id: 64, name: "Dr. Lakshmi Menon", specialization: "Pathology", hospitalId: 71, experience: 15, phone: "0495-2540001", email: "lakshmi.menon@gmc.gov.in", qualification: "MD, DNB" },
  { id: 65, name: "Dr. Suresh Kumar", specialization: "Transfusion Medicine", hospitalId: 72, experience: 12, phone: "0481-2540001", email: "suresh.kumar@kmc.gov.in", qualification: "MD, DM" },

  // KERALA - Private Hospital Doctors
  { id: 66, name: "Dr. Thomas Mathew", specialization: "Hematology", hospitalId: 73, experience: 24, phone: "0484-2800001", email: "thomas.mathew@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 67, name: "Dr. Anjali Pillai", specialization: "Transfusion Medicine", hospitalId: 74, experience: 18, phone: "0484-2600001", email: "anjali.pillai@aster.com", qualification: "MD, DM" },

  // PUNJAB - Government Hospital Doctors
  { id: 68, name: "Dr. Gurpreet Singh", specialization: "Hematology", hospitalId: 75, experience: 20, phone: "0172-2540001", email: "gurpreet.singh@gmc.gov.in", qualification: "MD, DM" },
  { id: 69, name: "Dr. Harpreet Kaur", specialization: "Pathology", hospitalId: 76, experience: 16, phone: "0161-2540001", email: "harpreet.kaur@dmch.gov.in", qualification: "MD, DNB" },
  { id: 70, name: "Dr. Jaswant Singh", specialization: "Transfusion Medicine", hospitalId: 77, experience: 14, phone: "0183-2540001", email: "jaswant.singh@gmc.gov.in", qualification: "MD, DM" },

  // PUNJAB - Private Hospital Doctors
  { id: 71, name: "Dr. Rajinder Kaur", specialization: "Hematology", hospitalId: 78, experience: 22, phone: "0172-5090001", email: "rajinder.kaur@fortis.com", qualification: "MD, DM, FRCP" },
  { id: 72, name: "Dr. Manpreet Singh", specialization: "Transfusion Medicine", hospitalId: 79, experience: 18, phone: "0161-2540001", email: "manpreet.singh@apollo.com", qualification: "MD, DM" },

  // UTTAR PRADESH - Government Hospital Doctors
  { id: 73, name: "Dr. Ashok Mishra", specialization: "Hematology", hospitalId: 80, experience: 25, phone: "0522-2540001", email: "ashok.mishra@kgmu.gov.in", qualification: "MD, DM, FRCP" },
  { id: 74, name: "Dr. Sunita Verma", specialization: "Pathology", hospitalId: 81, experience: 20, phone: "0512-2540001", email: "sunita.verma@gsvm.gov.in", qualification: "MD, DNB" },
  { id: 75, name: "Dr. Rajesh Gupta", specialization: "Transfusion Medicine", hospitalId: 82, experience: 16, phone: "0562-2540001", email: "rajesh.gupta@sn.gov.in", qualification: "MD, DM" },

  // UTTAR PRADESH - Private Hospital Doctors
  { id: 76, name: "Dr. Vikram Singh", specialization: "Hematology", hospitalId: 83, experience: 26, phone: "0522-2600001", email: "vikram.singh@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 77, name: "Dr. Priya Sharma", specialization: "Transfusion Medicine", hospitalId: 84, experience: 20, phone: "0120-4560001", email: "priya.sharma@fortis.com", qualification: "MD, DM" },

  // MADHYA PRADESH - Government Hospital Doctors
  { id: 78, name: "Dr. Rakesh Sharma", specialization: "Hematology", hospitalId: 85, experience: 18, phone: "0755-2540001", email: "rakesh.sharma@hamidia.gov.in", qualification: "MD, DM" },
  { id: 79, name: "Dr. Meena Joshi", specialization: "Pathology", hospitalId: 86, experience: 15, phone: "0731-2540001", email: "meena.joshi@mgmmc.gov.in", qualification: "MD, DNB" },
  { id: 80, name: "Dr. Sunil Verma", specialization: "Transfusion Medicine", hospitalId: 87, experience: 12, phone: "0751-2540001", email: "sunil.verma@gmc.gov.in", qualification: "MD, DM" },

  // MADHYA PRADESH - Private Hospital Doctors
  { id: 81, name: "Dr. Amit Patel", specialization: "Hematology", hospitalId: 88, experience: 20, phone: "0731-2600001", email: "amit.patel@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 82, name: "Dr. Suman Gupta", specialization: "Transfusion Medicine", hospitalId: 89, experience: 16, phone: "0731-2540001", email: "suman.gupta@choithram.com", qualification: "MD, DM" },

  // ODISHA - Government Hospital Doctors
  { id: 83, name: "Dr. Prasanta Kumar", specialization: "Hematology", hospitalId: 90, experience: 18, phone: "0671-2540001", email: "prasanta.kumar@scb.gov.in", qualification: "MD, DM" },
  { id: 84, name: "Dr. Laxmi Prasad", specialization: "Pathology", hospitalId: 91, experience: 15, phone: "0674-2540001", email: "laxmi.prasad@aiims.gov.in", qualification: "MD, DNB" },

  // ODISHA - Private Hospital Doctors
  { id: 85, name: "Dr. Rajesh Mohanty", specialization: "Hematology", hospitalId: 92, experience: 20, phone: "0674-2600001", email: "rajesh.mohanty@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 86, name: "Dr. Priya Das", specialization: "Transfusion Medicine", hospitalId: 93, experience: 16, phone: "0674-2540001", email: "priya.das@kims.com", qualification: "MD, DM" },

  // BIHAR - Government Hospital Doctors
  { id: 87, name: "Dr. Anil Kumar", specialization: "Hematology", hospitalId: 94, experience: 18, phone: "0612-2540001", email: "anil.kumar@pmch.gov.in", qualification: "MD, DM" },
  { id: 88, name: "Dr. Sunita Singh", specialization: "Pathology", hospitalId: 95, experience: 15, phone: "0612-2600001", email: "sunita.singh@igims.gov.in", qualification: "MD, DNB" },

  // BIHAR - Private Hospital Doctors
  { id: 89, name: "Dr. Rajesh Verma", specialization: "Hematology", hospitalId: 96, experience: 20, phone: "0612-2540001", email: "rajesh.verma@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 90, name: "Dr. Priya Gupta", specialization: "Transfusion Medicine", hospitalId: 97, experience: 16, phone: "0612-2540001", email: "priya.gupta@paras.com", qualification: "MD, DM" },

  // TELANGANA - Government Hospital Doctors
  { id: 91, name: "Dr. Srinivas Reddy", specialization: "Hematology", hospitalId: 98, experience: 18, phone: "040-2540001", email: "srinivas.reddy@gandhi.gov.in", qualification: "MD, DM" },
  { id: 92, name: "Dr. Lakshmi Devi", specialization: "Pathology", hospitalId: 99, experience: 15, phone: "040-2540001", email: "lakshmi.devi@osmania.gov.in", qualification: "MD, DNB" },

  // TELANGANA - Private Hospital Doctors
  { id: 93, name: "Dr. Anil Kumar", specialization: "Hematology", hospitalId: 100, experience: 20, phone: "040-2600001", email: "anil.kumar@apollo.com", qualification: "MD, DM, FRCP" },
  { id: 94, name: "Dr. Priya Sharma", specialization: "Transfusion Medicine", hospitalId: 101, experience: 16, phone: "040-2540001", email: "priya.sharma@yashoda.com", qualification: "MD, DM" },

  // ASSAM - Government Hospital Doctors
  { id: 95, name: "Dr. Rajesh Bora", specialization: "Hematology", hospitalId: 102, experience: 18, phone: "0361-2540001", email: "rajesh.bora@gmc.gov.in", qualification: "MD, DM" },
  { id: 96, name: "Dr. Sunita Das", specialization: "Pathology", hospitalId: 103, experience: 15, phone: "0373-2540001", email: "sunita.das@amc.gov.in", qualification: "MD, DNB" },

  // ASSAM - Private Hospital Doctors
  { id: 97, name: "Dr. Anil Sharma", specialization: "Hematology", hospitalId: 104, experience: 20, phone: "0361-2600001", email: "anil.sharma@apollo.com", qualification: "MD, DM, FRCP" },

  // JHARKHAND - Government Hospital Doctors
  { id: 98, name: "Dr. Rajesh Kumar", specialization: "Hematology", hospitalId: 105, experience: 18, phone: "0651-2540001", email: "rajesh.kumar@rims.gov.in", qualification: "MD, DM" },
  { id: 99, name: "Dr. Sunita Singh", specialization: "Pathology", hospitalId: 106, experience: 15, phone: "0326-2540001", email: "sunita.singh@pgmch.gov.in", qualification: "MD, DNB" },

  // CHHATTISGARH - Government Hospital Doctors
  { id: 100, name: "Dr. Suresh Verma", specialization: "Hematology", hospitalId: 107, experience: 18, phone: "0771-2540001", email: "suresh.verma@aiims.gov.in", qualification: "MD, DM" },
  { id: 101, name: "Dr. Meena Joshi", specialization: "Pathology", hospitalId: 108, experience: 15, phone: "07752-254001", email: "meena.joshi@mch.gov.in", qualification: "MD, DNB" },

  // HIMACHAL PRADESH - Government Hospital Doctors
  { id: 102, name: "Dr. Rajesh Sharma", specialization: "Hematology", hospitalId: 109, experience: 18, phone: "0177-2540001", email: "rajesh.sharma@igmc.gov.in", qualification: "MD, DM" },

  // UTTARAKHAND - Government Hospital Doctors
  { id: 103, name: "Dr. Sunita Verma", specialization: "Hematology", hospitalId: 110, experience: 18, phone: "0135-2540001", email: "sunita.verma@dmc.gov.in", qualification: "MD, DM" },

  // HARYANA - Government Hospital Doctors
  { id: 104, name: "Dr. Anil Kumar", specialization: "Hematology", hospitalId: 111, experience: 18, phone: "01262-254001", email: "anil.kumar@pgims.gov.in", qualification: "MD, DM" },

  // GOA - Government Hospital Doctors
  { id: 105, name: "Dr. Rajesh Naik", specialization: "Hematology", hospitalId: 112, experience: 18, phone: "0832-2540001", email: "rajesh.naik@gmc.gov.in", qualification: "MD, DM" },

  // HIMACHAL PRADESH - Private Hospital Doctors
  { id: 106, name: "Dr. Anil Sharma", specialization: "Hematology", hospitalId: 113, experience: 20, phone: "0172-5090001", email: "anil.sharma@fortis.com", qualification: "MD, DM, FRCP" },

  // UTTARAKHAND - Private Hospital Doctors
  { id: 107, name: "Dr. Sunita Gupta", specialization: "Hematology", hospitalId: 114, experience: 20, phone: "0135-2540001", email: "sunita.gupta@max.com", qualification: "MD, DM, FRCP" },

  // HARYANA - Private Hospital Doctors
  { id: 108, name: "Dr. Rajesh Verma", specialization: "Hematology", hospitalId: 115, experience: 20, phone: "0124-4141415", email: "rajesh.verma@medanta.com", qualification: "MD, DM, FRCP" },

  // GOA - Private Hospital Doctors
  { id: 109, name: "Dr. Anil Desai", specialization: "Hematology", hospitalId: 116, experience: 20, phone: "0832-2540001", email: "anil.desai@manipal.com", qualification: "MD, DM, FRCP" },
];

// Blood groups for reference
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// States list - All Indian States and Union Territories
export const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Cities by state
export const citiesByState = {
  "Andhra Pradesh": ["Amaravati", "Visakhapatnam", "Vijayawada", "Tirupati", "Guntur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Korba", "Rajnandgaon"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Haryana": ["Chandigarh", "Gurgaon", "Faridabad", "Panipat", "Ambala"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Manali", "Solan", "Mandi"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Cherrapunji", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Pelling", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Mussoorie"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Andaman and Nicobar Islands": ["Port Blair", "Car Nicobar", "Havelock Island", "Neil Island"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "Delhi", "Gurgaon", "Noida", "Faridabad"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Leh"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy", "Andrott"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};

// Helper functions
export const getHospitalById = (id) => hospitalDatabase.find(h => h.id === id);
export const getDoctorsByHospital = (hospitalId) => doctorDatabase.filter(d => d.hospitalId === hospitalId);
export const getHospitalsByState = (state) => hospitalDatabase.filter(h => h.state === state);
export const getHospitalsByCity = (state, city) => hospitalDatabase.filter(h => h.state === state && h.city === city);
export const getHospitalsByType = (type) => hospitalDatabase.filter(h => h.type === type);
