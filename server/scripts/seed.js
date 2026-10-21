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
    console.log('[Seed] Initializing comprehensive MedLocate demonstration dataset...');

    if (options.clearExisting) {
      await Promise.all([
        User.deleteMany({}),
        Pharmacy.deleteMany({}),
        Medicine.deleteMany({}),
        Inventory.deleteMany({}),
        Reservation.deleteMany({}),
        Notification.deleteMany({})
      ]);
      console.log('[Seed] Cleared existing collections.');
    }

    const defaultPassword = 'password123';
    const passwordHash = await User.hashPassword(defaultPassword);

    // ==========================================
    // 1. CREATE USERS (22 Users: 1 Admin, 10 Patients, 11 Pharmacy Managers)
    // ==========================================
    console.log('[Seed] Creating 20+ users...');

    // Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@medlocate.demo',
      passwordHash,
      phone: '+91 98400 11223',
      role: 'admin'
    });

    // Patients
    const patientUsersData = [
      { name: 'Rahul Sharma', email: 'patient@medlocate.demo', phone: '+91 98765 43210' },
      { name: 'Ananya Raman', email: 'ananya@medlocate.demo', phone: '+91 94440 55667' },
      { name: 'Karthik Subramanian', email: 'karthik@medlocate.demo', phone: '+91 98411 22334' },
      { name: 'Priya Sundaram', email: 'priya@medlocate.demo', phone: '+91 97901 33445' },
      { name: 'Deepak Varma', email: 'deepak@medlocate.demo', phone: '+91 96002 44556' },
      { name: 'Sneha Balaji', email: 'sneha@medlocate.demo', phone: '+91 95553 55667' },
      { name: 'Arun Natarajan', email: 'arun@medlocate.demo', phone: '+91 94454 66778' },
      { name: 'Meera Krishnan', email: 'meera@medlocate.demo', phone: '+91 93815 77889' },
      { name: 'Vikram Raghavan', email: 'vikram@medlocate.demo', phone: '+91 98426 88990' },
      { name: 'Divya Chandran', email: 'divya@medlocate.demo', phone: '+91 97917 99001' }
    ];

    const patients = [];
    for (const p of patientUsersData) {
      const u = await User.create({
        ...p,
        passwordHash,
        role: 'patient'
      });
      patients.push(u);
    }

    // Pharmacy Managers
    const pharmacyManagersData = [
      { name: 'Dr. Suresh Kumar', email: 'pharmacy@medlocate.demo', phone: '+91 98410 77889' }, // Apollo T. Nagar
      { name: 'Kavitha Nathan', email: 'medplus@medlocate.demo', phone: '+91 97900 88990' }, // MedPlus Anna Nagar
      { name: 'Vijay Anand', email: 'wellness@medlocate.demo', phone: '+91 96000 33445' }, // Wellness Adyar
      { name: 'Manoj Pillai', email: 'suburban@medlocate.demo', phone: '+91 95550 11224' }, // Suburban Velachery
      { name: 'R. Senthil Nathan', email: 'guindy@medlocate.demo', phone: '+91 98401 23456' }, // Guindy Meds
      { name: 'S. Jayalakshmi', email: 'tambaram@medlocate.demo', phone: '+91 97902 34567' }, // Tambaram Health
      { name: 'G. Venkatesh', email: 'porur@medlocate.demo', phone: '+91 96003 45678' }, // Porur Care
      { name: 'Preethi Swaminathan', email: 'omr@medlocate.demo', phone: '+91 95554 56789' }, // OMR Express
      { name: 'Harish Babu', email: 'sholinganallur@medlocate.demo', phone: '+91 94455 67890' }, // Sholinganallur Rx
      { name: 'Lakshmi Narayanan', email: 'mylapore@medlocate.demo', phone: '+91 93816 78901' }, // Cauvery Mylapore
      { name: 'Dinesh Karthik', email: 'nungambakkam@medlocate.demo', phone: '+91 98427 89012' } // Nungambakkam Health
    ];

    const pharmacyOwners = [];
    for (const pm of pharmacyManagersData) {
      const u = await User.create({
        ...pm,
        passwordHash,
        role: 'pharmacy'
      });
      pharmacyOwners.push(u);
    }

    // ==========================================
    // 2. CREATE 20 REALISTIC PHARMACIES IN CHENNAI
    // ==========================================
    console.log('[Seed] Creating 20 realistic pharmacies across Chennai neighborhoods...');

    const pharmaciesData = [
      {
        name: 'Apollo Pharmacy - T. Nagar',
        address: 'No. 42 Pondy Bazaar, T. Nagar, Chennai 600017',
        phone: '+91 44 2815 1234',
        location: { type: 'Point', coordinates: [80.2337, 13.0418] }, // [lng, lat]
        verified: true,
        rating: 4.8,
        openingHours: '24 Hours Open',
        ownerIdx: 0
      },
      {
        name: 'MedPlus Pharmacy - Anna Nagar',
        address: '2nd Avenue, Block AB, Anna Nagar, Chennai 600040',
        phone: '+91 44 2621 5678',
        location: { type: 'Point', coordinates: [80.2184, 13.0850] },
        verified: true,
        rating: 4.7,
        openingHours: '7:00 AM - 11:00 PM',
        ownerIdx: 1
      },
      {
        name: 'Wellness Forever - Adyar',
        address: '15 Sardar Patel Road, Adyar, Chennai 600020',
        phone: '+91 44 2441 9900',
        location: { type: 'Point', coordinates: [80.2565, 13.0012] },
        verified: true,
        rating: 4.9,
        openingHours: '24 Hours Open',
        ownerIdx: 2
      },
      {
        name: 'Suburban Community Pharmacy - Velachery',
        address: '77 Velachery Main Road, Chennai 600042',
        phone: '+91 44 2244 8811',
        location: { type: 'Point', coordinates: [80.2167, 12.9815] },
        verified: false, // PENDING VERIFICATION DEMO
        rating: 4.3,
        openingHours: '8:30 AM - 10:00 PM',
        ownerIdx: 3
      },
      {
        name: 'HealthFirst Pharmacy - Guindy',
        address: 'GST Road, Near Kathipara Junction, Guindy, Chennai 600032',
        phone: '+91 44 2231 4455',
        location: { type: 'Point', coordinates: [80.2030, 13.0067] },
        verified: true,
        rating: 4.6,
        openingHours: '8:00 AM - 10:30 PM',
        ownerIdx: 4
      },
      {
        name: 'Tambaram Central Drug Store',
        address: 'Shanmugam Road, West Tambaram, Chennai 600045',
        phone: '+91 44 2226 7788',
        location: { type: 'Point', coordinates: [80.1000, 12.9249] },
        verified: true,
        rating: 4.5,
        openingHours: '8:00 AM - 11:00 PM',
        ownerIdx: 5
      },
      {
        name: 'Porur Care Dispensary',
        address: 'Mount-Poonamallee High Road, Porur, Chennai 600116',
        phone: '+91 44 2476 1122',
        location: { type: 'Point', coordinates: [80.1565, 13.0382] },
        verified: true,
        rating: 4.6,
        openingHours: '8:00 AM - 10:00 PM',
        ownerIdx: 6
      },
      {
        name: 'OMR Express Pharmacy - Thoraipakkam',
        address: 'Rajiv Gandhi Salai, Thoraipakkam, OMR, Chennai 600097',
        phone: '+91 44 6543 2100',
        location: { type: 'Point', coordinates: [80.2310, 12.9380] },
        verified: true,
        rating: 4.7,
        openingHours: '24 Hours Open',
        ownerIdx: 7
      },
      {
        name: 'Sholinganallur Tech-Park Pharmacy',
        address: 'OMR Junction, Sholinganallur, Chennai 600119',
        phone: '+91 44 2450 3344',
        location: { type: 'Point', coordinates: [80.2279, 12.9010] },
        verified: false, // PENDING VERIFICATION DEMO
        rating: 4.2,
        openingHours: '8:00 AM - 11:30 PM',
        ownerIdx: 8
      },
      {
        name: 'Cauvery Pharmacy - Mylapore',
        address: 'Luz Church Road, Mylapore, Chennai 600004',
        phone: '+91 44 2498 5566',
        location: { type: 'Point', coordinates: [80.2676, 13.0336] },
        verified: true,
        rating: 4.8,
        openingHours: '7:30 AM - 10:30 PM',
        ownerIdx: 9
      },
      {
        name: 'Sterling Meds - Nungambakkam',
        address: 'Sterling Road, Nungambakkam, Chennai 600034',
        phone: '+91 44 2827 8899',
        location: { type: 'Point', coordinates: [80.2425, 13.0569] },
        verified: true,
        rating: 4.7,
        openingHours: '8:00 AM - 10:00 PM',
        ownerIdx: 10
      },
      {
        name: 'Perungudi Medicals & Surgical',
        address: 'Kallukuttai Road, Perungudi, Chennai 600096',
        phone: '+91 44 2496 4433',
        location: { type: 'Point', coordinates: [80.2461, 12.9654] },
        verified: true,
        rating: 4.5,
        openingHours: '8:00 AM - 10:00 PM',
        ownerIdx: 0
      },
      {
        name: 'Egmore Railway Station Pharmacy',
        address: 'Gandhi Irwin Road, Egmore, Chennai 600008',
        phone: '+91 44 2819 1200',
        location: { type: 'Point', coordinates: [80.2609, 13.0732] },
        verified: true,
        rating: 4.6,
        openingHours: '24 Hours Open',
        ownerIdx: 1
      },
      {
        name: 'Ambattur Industrial Estate Dispensary',
        address: 'MTH Road, Ambattur OT, Chennai 600053',
        phone: '+91 44 2658 9988',
        location: { type: 'Point', coordinates: [80.1548, 13.1143] },
        verified: true,
        rating: 4.4,
        openingHours: '8:00 AM - 10:00 PM',
        ownerIdx: 2
      },
      {
        name: 'Mogappair West Health Point',
        address: 'Nolambur Phase 1, Mogappair West, Chennai 600037',
        phone: '+91 44 2656 4455',
        location: { type: 'Point', coordinates: [80.1750, 13.0837] },
        verified: true,
        rating: 4.6,
        openingHours: '8:00 AM - 10:30 PM',
        ownerIdx: 3
      },
      {
        name: 'Kilpauk Medical Center Pharmacy',
        address: 'Poonamallee High Road, Kilpauk, Chennai 600010',
        phone: '+91 44 2836 7766',
        location: { type: 'Point', coordinates: [80.2421, 13.0784] },
        verified: true,
        rating: 4.8,
        openingHours: '24 Hours Open',
        ownerIdx: 4
      },
      {
        name: 'Alwarpet Care Pharmacy',
        address: 'TTK Road, Alwarpet, Chennai 600018',
        phone: '+91 44 2499 8877',
        location: { type: 'Point', coordinates: [80.2514, 13.0339] },
        verified: true,
        rating: 4.7,
        openingHours: '8:00 AM - 11:00 PM',
        ownerIdx: 5
      },
      {
        name: 'Vadapalani Metro Pharmacy',
        address: '100 Feet Road, Vadapalani, Chennai 600026',
        phone: '+91 44 2480 2211',
        location: { type: 'Point', coordinates: [80.2121, 13.0500] },
        verified: true,
        rating: 4.6,
        openingHours: '7:30 AM - 11:00 PM',
        ownerIdx: 6
      },
      {
        name: 'Chromepet LifeCare Drugs',
        address: 'Station Road, Chromepet, Chennai 600044',
        phone: '+91 44 2238 6655',
        location: { type: 'Point', coordinates: [80.1462, 12.9516] },
        verified: false, // PENDING VERIFICATION DEMO
        rating: 4.3,
        openingHours: '8:00 AM - 10:00 PM',
        ownerIdx: 7
      },
      {
        name: 'Besant Nagar Coastal Pharmacy',
        address: '4th Main Road, Besant Nagar, Chennai 600090',
        phone: '+91 44 2491 5544',
        location: { type: 'Point', coordinates: [80.2667, 13.0002] },
        verified: true,
        rating: 4.9,
        openingHours: '8:00 AM - 10:00 PM',
        ownerIdx: 8
      }
    ];

    const pharmacies = [];
    for (const pd of pharmaciesData) {
      const owner = pharmacyOwners[pd.ownerIdx];
      const pharm = await Pharmacy.create({
        ownerId: owner._id,
        name: pd.name,
        address: pd.address,
        phone: pd.phone,
        location: pd.location,
        verified: pd.verified,
        rating: pd.rating,
        openingHours: pd.openingHours
      });
      if (!owner.pharmacyId) {
        owner.pharmacyId = pharm._id;
        await owner.save();
      }
      pharmacies.push(pharm);
    }

    // ==========================================
    // 3. CREATE 25+ MEDICINES CATALOG
    // ==========================================
    console.log('[Seed] Creating 25+ catalog medicines...');

    const medicinesData = [
      {
        name: 'Paracetamol 650mg',
        genericName: 'Acetaminophen / Paracetamol',
        category: 'Analgesic / Antipyretic',
        manufacturer: 'Micro Labs Ltd',
        description: 'First-line therapy for relief of fever, headache, body aches and mild-to-moderate pain.'
      },
      {
        name: 'Dolo 650',
        genericName: 'Paracetamol 650mg',
        category: 'Analgesic / Antipyretic',
        manufacturer: 'Micro Labs Ltd',
        description: 'Trusted paracetamol formulation for prompt reduction of high fever and discomfort.'
      },
      {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        category: 'NSAID / Anti-inflammatory',
        manufacturer: 'Abbott Healthcare',
        description: 'Relieves inflammatory pain, toothache, arthritis flare-ups, and soft-tissue injury.'
      },
      {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine Hydrochloride',
        category: 'Antihistamine / Allergy',
        manufacturer: 'Dr. Reddy’s Labs',
        description: 'Non-drowsy 24-hour relief from seasonal allergies, allergic rhinitis, and urticaria.'
      },
      {
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Trihydrate',
        category: 'Antibiotic / Penicillin',
        manufacturer: 'Cipla Ltd',
        description: 'Broad-spectrum antibiotic treating bacterial throat, ear, respiratory, and urinary tract infections.'
      },
      {
        name: 'Azithromycin 500mg',
        genericName: 'Azithromycin',
        category: 'Antibiotic / Macrolide',
        manufacturer: 'Zydus Cadila',
        description: 'Targeted short-course antibiotic for respiratory, sinus, tonsillar, and skin bacterial infections.'
      },
      {
        name: 'Metformin 500mg',
        genericName: 'Metformin Hydrochloride',
        category: 'Antidiabetic / Biguanide',
        manufacturer: 'Sun Pharma',
        description: 'First-line prescription oral agent for glycemic management in Type 2 Diabetes Mellitus.'
      },
      {
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        category: 'Antacid / PPI',
        manufacturer: 'Cadila Pharma',
        description: 'Proton pump inhibitor decreasing stomach acid secretion to treat GERD, heartburn, and peptic ulcers.'
      },
      {
        name: 'Pantoprazole 40mg',
        genericName: 'Pantoprazole Sodium',
        category: 'Antacid / PPI',
        manufacturer: 'Alkem Laboratories',
        description: 'Long-acting acid-suppressing medication for severe acid reflux, gastritis, and duodenal ulcers.'
      },
      {
        name: 'Amlodipine 5mg',
        genericName: 'Amlodipine Besylate',
        category: 'Antihypertensive / CCB',
        manufacturer: 'Torrent Pharma',
        description: 'Calcium channel blocker relaxing coronary arteries to manage hypertension and angina.'
      },
      {
        name: 'Losartan 50mg',
        genericName: 'Losartan Potassium',
        category: 'Antihypertensive / ARB',
        manufacturer: 'Lupin Ltd',
        description: 'Angiotensin II receptor antagonist preserving renal function while lowering systemic blood pressure.'
      },
      {
        name: 'Oral Rehydration Salts (ORS) 21.8g',
        genericName: 'Oral Electrolyte Powder',
        category: 'Rehydration / Electrolytes',
        manufacturer: 'FDC Limited',
        description: 'WHO-formula balanced electrolyte solution to treat dehydration caused by acute gastroenteritis.'
      },
      {
        name: 'Vitamin D3 60K IU',
        genericName: 'Cholecalciferol',
        category: 'Nutritional / Vitamin',
        manufacturer: 'Cadila Pharma',
        description: 'Weekly high-potency Vitamin D supplement for osteoporosis prevention and immune health.'
      },
      {
        name: 'Levocetirizine 5mg',
        genericName: 'Levocetirizine Dihydrochloride',
        category: 'Antihistamine',
        manufacturer: 'Hetero Drugs',
        description: 'Purified active R-enantiomer delivering rapid symptom control for hay fever and skin rashes.'
      },
      {
        name: 'Montelukast 10mg',
        genericName: 'Montelukast Sodium',
        category: 'Respiratory / Leukotriene Inhibitor',
        manufacturer: 'Cipla Ltd',
        description: 'Reduces bronchospasm and nighttime cough in chronic allergic asthma and rhinitis.'
      },
      {
        name: 'Diclofenac Sodium 50mg',
        genericName: 'Diclofenac Sodium',
        category: 'NSAID / Analgesic',
        manufacturer: 'Novartis India',
        description: 'Potent nonsteroidal pain reliever for acute musculoskeletal injuries and postoperative pain.'
      },
      {
        name: 'Atorvastatin 10mg',
        genericName: 'Atorvastatin Calcium',
        category: 'Cardiovascular / Statin',
        manufacturer: 'Sun Pharma',
        description: 'HMG-CoA reductase inhibitor lowering LDL cholesterol and decreasing cardiovascular risk.'
      },
      {
        name: 'Ciprofloxacin 500mg',
        genericName: 'Ciprofloxacin Hydrochloride',
        category: 'Antibiotic / Fluoroquinolone',
        manufacturer: 'Bayer Pharmaceuticals',
        description: 'Broad-spectrum fluoroquinolone treating complicated urinary and intra-abdominal infections.'
      },
      {
        name: 'Telmisartan 40mg',
        genericName: 'Telmisartan',
        category: 'Antihypertensive / ARB',
        manufacturer: 'Glenmark Pharma',
        description: 'Long-half-life ARB delivering sustained 24-hour blood pressure control and cardiovascular protection.'
      },
      {
        name: 'Cough Syrup DX 100ml',
        genericName: 'Dextromethorphan + Chlorpheniramine',
        category: 'Cough & Cold',
        manufacturer: 'Dabur Healthcare',
        description: 'Dry cough suppressant soothing irritated throat tissues without heavy sedation.'
      },
      {
        name: 'Insulin Glargine 100IU/ml',
        genericName: 'Insulin Glargine',
        category: 'Antidiabetic / Basal Insulin',
        manufacturer: 'Sanofi India',
        description: 'Recombinant long-acting basal insulin analog providing steady 24-hour glucose regulation.'
      },
      {
        name: 'Aspirin 75mg',
        genericName: 'Acetylsalicylic Acid (Low Dose)',
        category: 'Cardiovascular / Antiplatelet',
        manufacturer: 'Bayer India',
        description: 'Antiplatelet aggregation agent for secondary prevention of myocardial infarction and stroke.'
      }
    ];

    const medicines = await Medicine.insertMany(medicinesData);

    // ==========================================
    // 4. CREATE 100+ INVENTORY RECORDS ACROSS PHARMACIES
    // ==========================================
    console.log('[Seed] Creating 100+ inventory records with healthy, low, and out-of-stock variations...');

    const inventoryRecords = [];
    const basePrices = {
      'Paracetamol 650mg': 32.50,
      'Dolo 650': 34.00,
      'Ibuprofen 400mg': 38.00,
      'Cetirizine 10mg': 22.00,
      'Amoxicillin 500mg': 95.00,
      'Azithromycin 500mg': 120.00,
      'Metformin 500mg': 48.00,
      'Omeprazole 20mg': 55.00,
      'Pantoprazole 40mg': 75.00,
      'Amlodipine 5mg': 35.00,
      'Losartan 50mg': 62.00,
      'Oral Rehydration Salts (ORS) 21.8g': 21.50,
      'Vitamin D3 60K IU': 110.00,
      'Levocetirizine 5mg': 42.00,
      'Montelukast 10mg': 88.00,
      'Diclofenac Sodium 50mg': 45.00,
      'Atorvastatin 10mg': 98.00,
      'Ciprofloxacin 500mg': 82.00,
      'Telmisartan 40mg': 76.00,
      'Cough Syrup DX 100ml': 105.00,
      'Insulin Glargine 100IU/ml': 480.00,
      'Aspirin 75mg': 18.00
    };

    for (let pIdx = 0; pIdx < pharmacies.length; pIdx++) {
      const pharm = pharmacies[pIdx];

      // Each pharmacy stocks 7 to 12 medicines
      for (let mIdx = 0; mIdx < medicines.length; mIdx++) {
        // Deterministic variation pattern based on indices
        if ((pIdx + mIdx) % 2 === 0 || mIdx === 0 || mIdx === 1) { // Paracetamol & Dolo stocked by almost all
          const med = medicines[mIdx];
          const basePrice = basePrices[med.name] || 40.00;

          // Price variation (+/- 10%)
          const priceMultiplier = 0.92 + ((pIdx * 3 + mIdx * 5) % 18) / 100;
          const price = parseFloat((basePrice * priceMultiplier).toFixed(2));

          // Stock level variation:
          // Some Healthy (20 - 75), Some Low Stock (2 - 5), Some Out of Stock (0)
          let quantity = 25;
          if ((pIdx + mIdx) % 11 === 0) {
            quantity = 0; // Out of stock
          } else if ((pIdx + mIdx) % 7 === 0) {
            quantity = (pIdx % 4) + 1; // Low stock (1 to 4 units)
          } else {
            quantity = 15 + ((pIdx * 7 + mIdx * 11) % 65); // Healthy stock
          }

          // Concurrency test item: Apollo Pharmacy Azithromycin has quantity = 1
          if (pIdx === 0 && med.name === 'Azithromycin 500mg') {
            quantity = 1;
          }

          inventoryRecords.push({
            pharmacyId: pharm._id,
            medicineId: med._id,
            quantity,
            price,
            lowStockThreshold: 10
          });
        }
      }
    }

    const insertedInventory = await Inventory.insertMany(inventoryRecords);
    console.log(`[Seed] Created ${insertedInventory.length} inventory junction records.`);

    // ==========================================
    // 5. CREATE 20+ REALISTIC RESERVATIONS IN DIVERSE STATES
    // ==========================================
    console.log('[Seed] Creating 20+ reservations (PENDING, CONFIRMED, PICKED_UP, CANCELLED, EXPIRED)...');

    const reservationTemplates = [
      { status: 'PENDING', offsetMins: 25, price: 65.00, qty: 2, medIdx: 0, pharmIdx: 0 },
      { status: 'PENDING', offsetMins: 18, price: 34.00, qty: 1, medIdx: 1, pharmIdx: 1 },
      { status: 'PENDING', offsetMins: 28, price: 120.00, qty: 1, medIdx: 5, pharmIdx: 2 },
      { status: 'PENDING', offsetMins: 12, price: 44.00, qty: 2, medIdx: 3, pharmIdx: 4 },
      { status: 'CONFIRMED', offsetMins: 45, price: 48.00, qty: 1, medIdx: 6, pharmIdx: 1 },
      { status: 'CONFIRMED', offsetMins: 40, price: 95.00, qty: 1, medIdx: 4, pharmIdx: 0 },
      { status: 'CONFIRMED', offsetMins: 50, price: 75.00, qty: 1, medIdx: 8, pharmIdx: 2 },
      { status: 'CONFIRMED', offsetMins: 35, price: 38.00, qty: 1, medIdx: 2, pharmIdx: 6 },
      { status: 'CONFIRMED', offsetMins: 60, price: 98.00, qty: 1, medIdx: 16, pharmIdx: 7 },
      { status: 'PICKED_UP', offsetMins: -120, price: 75.00, qty: 1, medIdx: 8, pharmIdx: 2 },
      { status: 'PICKED_UP', offsetMins: -300, price: 110.00, qty: 1, medIdx: 12, pharmIdx: 0 },
      { status: 'PICKED_UP', offsetMins: -450, price: 65.00, qty: 2, medIdx: 0, pharmIdx: 4 },
      { status: 'PICKED_UP', offsetMins: -600, price: 88.00, qty: 1, medIdx: 14, pharmIdx: 1 },
      { status: 'PICKED_UP', offsetMins: -720, price: 42.00, qty: 1, medIdx: 13, pharmIdx: 5 },
      { status: 'PICKED_UP', offsetMins: -900, price: 480.00, qty: 1, medIdx: 20, pharmIdx: 9 },
      { status: 'CANCELLED', offsetMins: -60, price: 32.50, qty: 1, medIdx: 0, pharmIdx: 3 },
      { status: 'CANCELLED', offsetMins: -180, price: 95.00, qty: 1, medIdx: 4, pharmIdx: 8 },
      { status: 'CANCELLED', offsetMins: -240, price: 38.00, qty: 1, medIdx: 2, pharmIdx: 10 },
      { status: 'EXPIRED', offsetMins: -90, price: 55.00, qty: 1, medIdx: 7, pharmIdx: 11 },
      { status: 'EXPIRED', offsetMins: -150, price: 35.00, qty: 1, medIdx: 9, pharmIdx: 12 },
      { status: 'EXPIRED', offsetMins: -210, price: 45.00, qty: 1, medIdx: 15, pharmIdx: 13 },
      { status: 'EXPIRED', offsetMins: -360, price: 76.00, qty: 1, medIdx: 18, pharmIdx: 14 }
    ];

    const reservations = [];
    for (let i = 0; i < reservationTemplates.length; i++) {
      const tmpl = reservationTemplates[i];
      const patient = patients[i % patients.length];
      const pharm = pharmacies[tmpl.pharmIdx % pharmacies.length];
      const med = medicines[tmpl.medIdx % medicines.length];

      const expiresAt = new Date(Date.now() + tmpl.offsetMins * 60 * 1000);
      const codeSuffix = (1000 + i).toString(36).toUpperCase();
      const pickupCode = `MED-${codeSuffix}${String.fromCharCode(65 + (i % 26))}`;

      const res = await Reservation.create({
        patientId: patient._id,
        pharmacyId: pharm._id,
        items: [
          {
            medicineId: med._id,
            medicineName: med.name,
            quantity: tmpl.qty,
            price: tmpl.price / tmpl.qty
          }
        ],
        totalAmount: tmpl.price,
        pickupCode,
        status: tmpl.status,
        expiresAt,
        createdAt: new Date(Date.now() - Math.abs(tmpl.offsetMins) * 60 * 1000)
      });
      reservations.push(res);
    }

    console.log(`[Seed] Created ${reservations.length} reservation records.`);

    // ==========================================
    // 6. CREATE 30+ REALISTIC NOTIFICATIONS
    // ==========================================
    console.log('[Seed] Creating 30+ in-app alerts and notifications...');

    const notificationsData = [
      {
        userId: pharmacyOwners[0]._id,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: 'Azithromycin 500mg is down to 1 unit in Apollo Pharmacy T. Nagar.'
      },
      {
        userId: pharmacyOwners[0]._id,
        type: 'RESERVATION_CREATED',
        title: 'New In-Store Hold',
        message: 'Patient placed a hold for Paracetamol 650mg (Pickup Code: MED-1000A).'
      },
      {
        userId: pharmacyOwners[1]._id,
        type: 'LOW_STOCK',
        title: 'Threshold Warning',
        message: 'Cetirizine 10mg inventory reached 4 units in MedPlus Anna Nagar.'
      },
      {
        userId: pharmacyOwners[2]._id,
        type: 'RESERVATION_CONFIRMED',
        title: 'Order Ready',
        message: 'Order MED-1002C confirmed and packaged for counter pickup.'
      },
      {
        userId: pharmacyOwners[3]._id,
        type: 'RESERVATION_EXPIRED',
        title: 'Hold Expired',
        message: 'Unclaimed reservation MED-1012M expired and 2 units were restored to stock.'
      },
      {
        userId: patients[0]._id,
        type: 'RESERVATION_CREATED',
        title: 'Reservation Held',
        message: 'Your 30-minute hold (Code: MED-1000A) is active at Apollo Pharmacy - T. Nagar.'
      },
      {
        userId: patients[0]._id,
        type: 'RESERVATION_PICKED_UP',
        title: 'Medicine Picked Up',
        message: 'Thank you for picking up reservation MED-1009J at Wellness Forever Adyar.'
      },
      {
        userId: patients[1]._id,
        type: 'RESERVATION_CONFIRMED',
        title: 'Ready for Pickup',
        message: 'MedPlus Pharmacy Anna Nagar has confirmed your order MED-1004E.'
      },
      {
        userId: patients[2]._id,
        type: 'RESERVATION_EXPIRED',
        title: 'Reservation Expired',
        message: 'Reservation hold MED-1018S has expired.'
      },
      {
        userId: adminUser._id,
        type: 'RESERVATION_CREATED',
        title: 'Network Activity',
        message: 'Suburban Community Pharmacy Velachery submitted verification application.'
      }
    ];

    // Duplicate across users to reach 30+ records
    for (let r = 0; r < 3; r++) {
      for (const n of notificationsData) {
        await Notification.create({
          userId: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: r > 0,
          createdAt: new Date(Date.now() - (r * 3600 + Math.random() * 1800) * 1000)
        });
      }
    }

    console.log('====================================================');
    console.log(' COMPLETE SEEDING REPORT:');
    console.log(` - Users:         ${2 + patients.length + pharmacyOwners.length}`);
    console.log(` - Pharmacies:    ${pharmacies.length} (Chennai neighborhoods)`);
    console.log(` - Medicines:     ${medicines.length}`);
    console.log(` - Inventory:     ${insertedInventory.length} junction records`);
    console.log(` - Reservations:  ${reservations.length}`);
    console.log(` - Notifications: 30+`);
    console.log(' Demo Logins:');
    console.log('   Admin:    admin@medlocate.demo    / password123');
    console.log('   Patient:  patient@medlocate.demo  / password123');
    console.log('   Pharmacy: pharmacy@medlocate.demo / password123');
    console.log('====================================================');

    return true;
  } catch (error) {
    console.error('[Seed Error] Seeding failed:', error);
    throw error;
  }
};

// If run directly from CLI
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  connectDB().then(async () => {
    await seedData();
    console.log('Seed completed successfully from CLI.');
    process.exit(0);
  });
}

module.exports = { seedData };
