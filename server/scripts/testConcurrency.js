require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const Reservation = require('../models/Reservation');
const { createReservation } = require('../services/reservationService');

const runConcurrencyTest = async () => {
  try {
    console.log('====================================================');
    console.log(' STARTING CONCURRENCY & RACE CONDITION TEST');
    console.log('====================================================');

    await connectDB();

    // 1. Locate or create a test patient
    let patient = await User.findOne({ email: 'patient@medlocate.demo' });
    if (!patient) {
      const passwordHash = await User.hashPassword('password123');
      patient = await User.create({
        name: 'Test Patient',
        email: 'patient@medlocate.demo',
        passwordHash,
        phone: '9999999999',
        role: 'patient'
      });
    }

    // 2. Setup inventory with EXACTLY 1 unit
    let pharmacy = await Pharmacy.findOne();
    if (!pharmacy) {
      pharmacy = await Pharmacy.create({
        ownerId: patient._id,
        name: 'Concurrency Test Pharmacy',
        address: '100 Concurrency Way, Chennai',
        phone: '9840000000',
        location: { type: 'Point', coordinates: [80.23, 13.04] },
        verified: true
      });
    }

    let medicine = await Medicine.findOne();
    if (!medicine) {
      medicine = await Medicine.create({
        name: 'Azithromycin 500mg',
        genericName: 'Azithromycin',
        category: 'Antibiotic',
        manufacturer: 'Test Labs'
      });
    }

    // Create a special test inventory record with quantity: 1
    const testInventory = await Inventory.create({
      pharmacyId: pharmacy._id,
      medicineId: medicine._id,
      quantity: 1, // Only 1 available unit!
      price: 99.00,
      lowStockThreshold: 5
    });

    console.log(`[Setup] Created test inventory for "${medicine.name}" with EXACTLY 1 unit in stock.`);
    console.log(`[Setup] Inventory ID: ${testInventory._id}`);
    console.log(`[Execution] Firing 2 SIMULTANEOUS reservation requests for 1 unit each...`);

    // 3. Fire two simultaneous reservation attempts
    const req1 = createReservation({
      patientId: patient._id,
      inventoryId: testInventory._id,
      quantity: 1
    });

    const req2 = createReservation({
      patientId: patient._id,
      inventoryId: testInventory._id,
      quantity: 1
    });

    const results = await Promise.allSettled([req1, req2]);

    console.log('----------------------------------------------------');
    console.log(' Results from Simultaneous Requests:');

    let successCount = 0;
    let conflictCount = 0;

    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        successCount++;
        console.log(` Request ${index + 1}: SUCCESS -> Reservation Code: ${res.value.pickupCode}`);
      } else {
        conflictCount++;
        console.log(` Request ${index + 1}: BLOCKED -> Reason: "${res.reason.message}" (Status Code: ${res.reason.statusCode || res.reason.code})`);
      }
    });

    // 4. Verify Final Stock Count in Database
    const finalInventory = await Inventory.findById(testInventory._id);
    console.log('----------------------------------------------------');
    console.log(` Verification: Final Stock in MongoDB = ${finalInventory.quantity}`);

    // Cleanup the test inventory
    await Inventory.findByIdAndDelete(testInventory._id);

    if (successCount === 1 && conflictCount === 1 && finalInventory.quantity === 0) {
      console.log('====================================================');
      console.log(' TEST PASSED: Zero Over-Booking! Concurrency protected.');
      console.log(' Exactly 1 request succeeded and exactly 1 request was rejected with 409 Conflict.');
      console.log(' Final stock did NOT become negative.');
      console.log('====================================================');
      process.exit(0);
    } else {
      console.error(' TEST FAILED: Over-booking or invalid stock state detected.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
};

runConcurrencyTest();
