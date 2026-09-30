require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');

const seedData = async (options = { clearExisting: true }) => {
  try {
    if (options.clearExisting) {
      await Promise.all([
        User.deleteMany({}),
        Pharmacy.deleteMany({}),
        Medicine.deleteMany({}),
        Inventory.deleteMany({}),
        Reservation.deleteMany({}),
        Notification.deleteMany({})
      ]);
    }

    const defaultPassword = 'password123';
    const passwordHash = await User.hashPassword(defaultPassword);

    // 1. Admin User
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@medlocate.demo',
      passwordHash,
      phone: '+91 98400 11223',
      role: 'admin'
    });

    // 2. Patient Users
    const patient1 = await User.create({
      name: 'Rahul Sharma',
      email: 'patient@medlocate.demo',
      passwordHash,
      phone: '+91 98765 43210',
      role: 'patient'
    });

    const patient2 = await User.create({
      name: 'Ananya Raman',
      email: 'ananya@medlocate.demo',
      passwordHash,
      phone: '+91 94440 55667',
      role: 'patient'
    });

    // 3. Pharmacy Owners
    const apolloOwner = await User.create({
      name: 'Dr. Suresh Kumar (Apollo)',
      email: 'pharmacy@medlocate.demo',
      passwordHash,
      phone: '+91 98410 77889',
      role: 'pharmacy'
    });

    const medplusOwner = await User.create({
      name: 'Kavitha Nathan (MedPlus)',
      email: 'medplus@medlocate.demo',
      passwordHash,
      phone: '+91 97900 88990',
      role: 'pharmacy'
    });

    const wellnessOwner = await User.create({
      name: 'Vijay Anand (Wellness)',
      email: 'wellness@medlocate.demo',
      passwordHash,
      phone: '+91 96000 33445',
      role: 'pharmacy'
    });

    const suburbanOwner = await User.create({
      name: 'Manoj Pillai (Suburban Meds)',
      email: 'suburban@medlocate.demo',
      passwordHash,
      phone: '+91 95550 11224',
      role: 'pharmacy'
    });

    // Coordinates: [longitude, latitude] GeoJSON
    const apollo = await Pharmacy.create({
      ownerId: apolloOwner._id,
      name: 'Apollo Pharmacy - T. Nagar',
      address: 'No. 42 Pondy Bazaar, T. Nagar, Chennai, Tamil Nadu 600017',
      phone: '+91 44 2815 1234',
      location: {
        type: 'Point',
        coordinates: [80.2337, 13.0418]
      },
      verified: true
    });
    apolloOwner.pharmacyId = apollo._id;
    await apolloOwner.save();

    const medplus = await Pharmacy.create({
      ownerId: medplusOwner._id,
      name: 'MedPlus Pharmacy - Anna Nagar',
      address: '2nd Avenue, Block AB, Anna Nagar, Chennai, Tamil Nadu 600040',
      phone: '+91 44 2621 5678',
      location: {
        type: 'Point',
        coordinates: [80.2184, 13.0850]
      },
      verified: true
    });
    medplusOwner.pharmacyId = medplus._id;
    await medplusOwner.save();

    const wellness = await Pharmacy.create({
      ownerId: wellnessOwner._id,
      name: 'Wellness Forever - Adyar',
      address: '15 Sardar Patel Road, Adyar, Chennai, Tamil Nadu 600020',
      phone: '+91 44 2441 9900',
      location: {
        type: 'Point',
        coordinates: [80.2565, 13.0012]
      },
      verified: true
    });
    wellnessOwner.pharmacyId = wellness._id;
    await wellnessOwner.save();

    const suburban = await Pharmacy.create({
      ownerId: suburbanOwner._id,
      name: 'Suburban Community Pharmacy - Velachery',
      address: '77 Velachery Main Road, Chennai, Tamil Nadu 600042',
      phone: '+91 44 2244 8811',
      location: {
        type: 'Point',
        coordinates: [80.2167, 12.9815]
      },
      verified: false // PENDING ADMIN APPROVAL
    });
    suburbanOwner.pharmacyId = suburban._id;
    await suburbanOwner.save();

    const medicines = await Medicine.insertMany([
      {
        name: 'Paracetamol 650mg',
        genericName: 'Acetaminophen / Paracetamol',
        category: 'Analgesic / Antipyretic',
        manufacturer: 'Micro Labs Ltd',
        description: 'For relief of mild to moderate pain and reducing fever.'
      },
      {
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Trihydrate',
        category: 'Antibiotic',
        manufacturer: 'Cipla Ltd',
        description: 'Broad-spectrum penicillin antibiotic for bacterial infections.'
      },
      {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine Hydrochloride',
        category: 'Antihistamine',
        manufacturer: 'Dr. Reddy’s Labs',
        description: 'Relief of allergy symptoms, watery eyes, runny nose, itching.'
      },
      {
        name: 'Metformin 500mg',
        genericName: 'Metformin Hydrochloride',
        category: 'Antidiabetic',
        manufacturer: 'Sun Pharma',
        description: 'First-line medication for the treatment of type 2 diabetes.'
      },
      {
        name: 'Azithromycin 500mg',
        genericName: 'Azithromycin',
        category: 'Antibiotic / Macrolide',
        manufacturer: 'Zydus Cadila',
        description: 'Treats respiratory infections, skin infections, ear infections.'
      },
      {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        category: 'NSAID / Anti-inflammatory',
        manufacturer: 'Abbott Healthcare',
        description: 'Nonsteroidal anti-inflammatory drug used for treating pain and fever.'
      },
      {
        name: 'Pantoprazole 40mg',
        genericName: 'Pantoprazole Sodium',
        category: 'Antacid / PPI',
        manufacturer: 'Alkem Laboratories',
        description: 'Proton-pump inhibitor for acid reflux, heartburn and GERD.'
      }
    ]);

    const [paracetamol, amoxicillin, cetirizine, metformin, azithromycin, ibuprofen, pantoprazole] = medicines;

    // Inventory
    await Inventory.create({
      pharmacyId: apollo._id,
      medicineId: paracetamol._id,
      quantity: 45,
      price: 32.50,
      lowStockThreshold: 10
    });

    await Inventory.create({
      pharmacyId: apollo._id,
      medicineId: amoxicillin._id,
      quantity: 18,
      price: 95.00,
      lowStockThreshold: 10
    });

    await Inventory.create({
      pharmacyId: apollo._id,
      medicineId: cetirizine._id,
      quantity: 8, // Low stock trigger
      price: 24.00,
      lowStockThreshold: 10
    });

    await Inventory.create({
      pharmacyId: apollo._id,
      medicineId: azithromycin._id,
      quantity: 1, // Concurrency test
      price: 120.00,
      lowStockThreshold: 5
    });

    await Inventory.create({
      pharmacyId: medplus._id,
      medicineId: paracetamol._id,
      quantity: 60,
      price: 30.00,
      lowStockThreshold: 10
    });

    await Inventory.create({
      pharmacyId: medplus._id,
      medicineId: metformin._id,
      quantity: 35,
      price: 48.00,
      lowStockThreshold: 10
    });

    await Inventory.create({
      pharmacyId: medplus._id,
      medicineId: ibuprofen._id,
      quantity: 25,
      price: 35.00,
      lowStockThreshold: 10
    });

    await Inventory.create({
      pharmacyId: wellness._id,
      medicineId: paracetamol._id,
      quantity: 20,
      price: 34.00,
      lowStockThreshold: 10
    });

    await Inventory.create({
      pharmacyId: wellness._id,
      medicineId: pantoprazole._id,
      quantity: 50,
      price: 75.00,
      lowStockThreshold: 15
    });

    await Inventory.create({
      pharmacyId: suburban._id,
      medicineId: amoxicillin._id,
      quantity: 30,
      price: 90.00,
      lowStockThreshold: 10
    });

    // Sample Reservations
    const expiresAt = new Date(Date.now() + 25 * 60 * 1000);
    await Reservation.create({
      patientId: patient1._id,
      pharmacyId: apollo._id,
      items: [
        {
          medicineId: paracetamol._id,
          medicineName: paracetamol.name,
          quantity: 2,
          price: 32.50
        }
      ],
      totalAmount: 65.00,
      pickupCode: 'MED-7821A',
      status: 'PENDING',
      expiresAt
    });

    await Reservation.create({
      patientId: patient2._id,
      pharmacyId: medplus._id,
      items: [
        {
          medicineId: metformin._id,
          medicineName: metformin.name,
          quantity: 1,
          price: 48.00
        }
      ],
      totalAmount: 48.00,
      pickupCode: 'MED-9942B',
      status: 'CONFIRMED',
      expiresAt: new Date(Date.now() + 45 * 60 * 1000)
    });

    await Reservation.create({
      patientId: patient1._id,
      pharmacyId: wellness._id,
      items: [
        {
          medicineId: pantoprazole._id,
          medicineName: pantoprazole.name,
          quantity: 1,
          price: 75.00
        }
      ],
      totalAmount: 75.00,
      pickupCode: 'MED-1104C',
      status: 'PICKED_UP',
      expiresAt: new Date(Date.now() - 3600 * 1000)
    });

    // Sample Notifications
    await Notification.create({
      userId: apolloOwner._id,
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: 'Cetirizine 10mg has dropped to 8 units in your inventory.',
      metadata: {}
    });

    await Notification.create({
      userId: patient1._id,
      type: 'RESERVATION_CREATED',
      title: 'Reservation Held',
      message: 'Your reservation MED-7821A at Apollo Pharmacy is held for 30 minutes.',
      metadata: {}
    });

    console.log('[Seed] Data seeded successfully.');
  } catch (error) {
    console.error('[Seed Error] Seeding failed:', error);
    throw error;
  }
};

// If run directly from CLI
if (require.main === module) {
  const { connectDB } = require('../config/db');
  connectDB().then(async () => {
    await seedData();
    console.log('Seed completed from CLI.');
    process.exit(0);
  });
}

module.exports = { seedData };
