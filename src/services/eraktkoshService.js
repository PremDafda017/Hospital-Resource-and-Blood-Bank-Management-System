// eRaktkosh API Service
// India's Centralized Blood Center Management System
// Documentation: https://eraktkosh.mohfw.gov.in/
// This service provides integration with eRaktkosh for real-time blood availability

const ERAKTKOSH_BASE_URL = "https://eraktkosh.mohfw.gov.in";

/**
 * eRaktkosh API Service
 * Provides methods to interact with eRaktkosh blood bank data
 * Note: Actual API integration requires registration with ABDM (Ayushman Bharat Digital Mission)
 * For now, this service uses local data that mirrors eRaktkosh structure
 */

class EraktkoshService {
  /**
   * Search for blood availability across blood banks
   * @param {Object} params - Search parameters
   * @param {string} params.state - State name
   * @param {string} params.district - District name
   * @param {string} params.bloodGroup - Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
   * @param {string} params.component - Blood component (Whole Blood, RBC, Platelets, Plasma, Cryo)
   * @returns {Promise<Array>} - List of available blood banks
   */
  static async searchBloodAvailability(params) {
    // In production, this would call the actual eRaktkosh API
    // For now, return mock data based on local database
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { bloodInventoryData, governmentBloodBanks, privateBloodBanks } = await import('../data/indianBloodBankData');
      
      const allBanks = [...governmentBloodBanks, ...privateBloodBanks];
      
      // Filter by state if provided
      let filteredBanks = params.state 
        ? allBanks.filter(bank => bank.state === params.state)
        : allBanks;
      
      // Filter by blood group availability
      if (params.bloodGroup && bloodInventoryData[params.bloodGroup]) {
        filteredBanks = filteredBanks.filter(bank => {
          const available = bloodInventoryData[params.bloodGroup].total > 0;
          return available;
        });
      }
      
      // Filter by component availability
      if (params.component) {
        filteredBanks = filteredBanks.filter(bank => 
          bank.components && bank.components.includes(params.component)
        );
      }
      
      return filteredBanks.map(bank => ({
        ...bank,
        availableUnits: params.bloodGroup ? bloodInventoryData[params.bloodGroup]?.total || 0 : 0,
        lastUpdated: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Error searching blood availability:', error);
      throw new Error('Failed to search blood availability');
    }
  }

  /**
   * Get blood bank directory
   * @param {Object} params - Filter parameters
   * @param {string} params.state - State name
   * @param {string} params.city - City name
   * @param {string} params.type - Blood bank type (Government/Private)
   * @returns {Promise<Array>} - List of blood banks
   */
  static async getBloodBankDirectory(params = {}) {
    try {
      const { governmentBloodBanks, privateBloodBanks } = await import('../data/indianBloodBankData');
      
      let banks = [...governmentBloodBanks, ...privateBloodBanks];
      
      if (params.state) {
        banks = banks.filter(bank => bank.state === params.state);
      }
      
      if (params.city) {
        banks = banks.filter(bank => bank.city === params.city);
      }
      
      if (params.type) {
        banks = banks.filter(bank => bank.type === params.type);
      }
      
      return banks;
      
    } catch (error) {
      console.error('Error getting blood bank directory:', error);
      throw new Error('Failed to get blood bank directory');
    }
  }

  /**
   * Get blood bank details by ID
   * @param {string} bankId - Blood bank ID
   * @returns {Promise<Object>} - Blood bank details
   */
  static async getBloodBankDetails(bankId) {
    try {
      const { governmentBloodBanks, privateBloodBanks, getBloodBankById } = await import('../data/indianBloodBankData');
      
      const bank = getBloodBankById(bankId);
      
      if (!bank) {
        throw new Error('Blood bank not found');
      }
      
      return bank;
      
    } catch (error) {
      console.error('Error getting blood bank details:', error);
      throw new Error('Failed to get blood bank details');
    }
  }

  /**
   * Get blood donation camps
   * @param {Object} params - Filter parameters
   * @param {string} params.state - State name
   * @param {string} params.city - City name
   * @returns {Promise<Array>} - List of blood donation camps
   */
  static async getBloodDonationCamps(params = {}) {
    // Mock data for blood donation camps
    const camps = [
      {
        id: "CAMP-001",
        name: "Community Blood Donation Drive",
        organizer: "AIIMS Blood Bank",
        state: "Delhi",
        city: "New Delhi",
        address: "Connaught Place",
        date: "2024-01-20",
        time: "9:00 AM - 5:00 PM",
        contact: "+91-11-26588500",
        status: "Upcoming"
      },
      {
        id: "CAMP-002",
        name: "Corporate Blood Donation Camp",
        organizer: "Fortis Hospital",
        state: "Karnataka",
        city: "Bangalore",
        address: "Electronic City",
        date: "2024-01-25",
        time: "10:00 AM - 4:00 PM",
        contact: "+91-80-22221212",
        status: "Upcoming"
      }
    ];
    
    let filteredCamps = camps;
    
    if (params.state) {
      filteredCamps = filteredCamps.filter(camp => camp.state === params.state);
    }
    
    if (params.city) {
      filteredCamps = filteredCamps.filter(camp => camp.city === params.city);
    }
    
    return filteredCamps;
  }

  /**
   * Register for blood donation camp
   * @param {Object} registrationData - Registration details
   * @returns {Promise<Object>} - Registration confirmation
   */
  static async registerForCamp(registrationData) {
    // In production, this would call the actual eRaktkosh API
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: "Registration successful",
        registrationId: `REG-${Date.now()}`,
        campId: registrationData.campId
      };
      
    } catch (error) {
      console.error('Error registering for camp:', error);
      throw new Error('Failed to register for camp');
    }
  }

  /**
   * Get states covered by eRaktkosh
   * @returns {Promise<Array>} - List of states
   */
  static async getStates() {
    try {
      const { indianStates } = await import('../data/indianBloodBankData');
      return indianStates;
    } catch (error) {
      console.error('Error getting states:', error);
      throw new Error('Failed to get states');
    }
  }

  /**
   * Get blood components available
   * @returns {Promise<Array>} - List of blood components
   */
  static async getBloodComponents() {
    return ["Whole Blood", "RBC", "Platelets", "Plasma", "Cryo"];
  }

  /**
   * Get blood groups
   * @returns {Promise<Array>} - List of blood groups
   */
  static async getBloodGroups() {
    return ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  }
}

export default EraktkoshService;
