const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI;

// Blood Inventory Schema
const bloodInventorySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, required: true, default: 0 },
    hospital: { type: String, required: true },
    expiryDate: { type: String, default: "" },
    lastUpdated: { type: String, default: new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

// Use Blood_Bank collection in Hospital_Management database
const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema, 'Blood_Bank');

// Inventory data to seed
const inventoryData = [
  {
    _id: "bi001",
    bloodGroup: "A+",
    units: 100,
    hospital: "City General Hospital",
    expiryDate: "2024-12-31",
    lastUpdated: "2024-01-01"
  },
  {
    _id: "bi002",
    bloodGroup: "A-",
    units: 100,
    hospital: "City General Hospital",
    expiryDate: "2024-12-31",
    lastUpdated: "2024-01-01"
  },
  {
    _id: "bi003",
    bloodGroup: "B+",
    units: 100,
    hospital: "City General Hospital",
    expiryDate: "2024-12-31",
    lastUpdated: "2024-01-01"
  },
  {
    _id: "bi004",
    bloodGroup: "B-",
    units: 100,
    hospital: "City General Hospital",
    expiryDate: "2024-12-31",
    lastUpdated: "2024-01-01"
  },
  {
    _id: "bi005",
    bloodGroup: "AB+",
    units: 100,
    hospital: "City General Hospital",
    expiryDate: "2024-12-31",
    lastUpdated: "2024-01-01"
  },
  {
    _id: "bi006",
    bloodGroup: "AB-",
    units: 100,
    hospital: "City General Hospital",
    expiryDate: "2024-12-31",
    lastUpdated: "2024-01-01"
  },
  {
    _id: "bi007",
    bloodGroup: "O+",
    units: 100,
    hospital: "City General Hospital",
    expiryDate: "2024-12-31",
    lastUpdated: "2024-01-01"
  },
  {
    _id: "bi008",
    bloodGroup: "O-",
    units: 100,
    hospital: "City General Hospital",
    expiryDate: "2024-12-31",
    lastUpdated: "2024-01-01"
  }
];

async function seedInventory() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // Clear existing inventory
    console.log('Clearing existing inventory...');
    await BloodInventory.deleteMany({});
    console.log('Existing inventory cleared');

    // Insert new inventory data
    console.log('Seeding inventory data...');
    await BloodInventory.insertMany(inventoryData);
    console.log('Inventory data seeded successfully');

    // Verify the data
    const count = await BloodInventory.countDocuments();
    console.log(`Total inventory records: ${count}`);

    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Error seeding inventory:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedInventory();
