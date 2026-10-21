import React, { createContext, useContext, useState, useEffect } from 'react';

const PharmacyContext = createContext(null);

export const DEFAULT_PORUR_PHARMACY = {
  id: 'PORUR_CARE',
  _id: 'PORUR_CARE',
  name: 'Porur Care Dispensary',
  address: 'Mount-Poonamallee High Road, Porur, Chennai 600116',
  phone: '+91 44 2476 1122',
  verified: true,
  rating: 4.6,
  openingHours: '8:00 AM - 10:00 PM',
  latitude: 13.0382,
  longitude: 80.1565
};

export const DEFAULT_APOLLO_PHARMACY = {
  id: 'APOLLO_TNAGAR',
  _id: 'APOLLO_TNAGAR',
  name: 'Apollo Pharmacy - T. Nagar',
  address: 'G.N. Chetty Road, T. Nagar, Chennai 600017',
  phone: '+91 44 2815 6789',
  verified: true,
  rating: 4.7,
  openingHours: '24 Hours Open',
  latitude: 13.0418,
  longitude: 80.2341
};

const INITIAL_INVENTORIES = {
  PORUR_CARE: [
    {
      _id: 'inv-porur-01',
      id: 'inv-porur-01',
      pharmacyId: 'PORUR_CARE',
      medicineName: 'Paracetamol 650mg',
      medicineId: { name: 'Paracetamol 650mg', category: 'Analgesic', genericName: 'Acetaminophen' },
      quantity: 45,
      price: 29.90,
      lowStockThreshold: 10
    },
    {
      _id: 'inv-porur-02',
      id: 'inv-porur-02',
      pharmacyId: 'PORUR_CARE',
      medicineName: 'Amoxicillin 500mg',
      medicineId: { name: 'Amoxicillin 500mg', category: 'Antibiotic', genericName: 'Amoxicillin Trihydrate' },
      quantity: 28,
      price: 85.00,
      lowStockThreshold: 10
    },
    {
      _id: 'inv-porur-03',
      id: 'inv-porur-03',
      pharmacyId: 'PORUR_CARE',
      medicineName: 'Vitamin D3 60K',
      medicineId: { name: 'Vitamin D3 60K', category: 'Vitamin', genericName: 'Cholecalciferol' },
      quantity: 4,
      price: 65.00,
      lowStockThreshold: 10
    },
    {
      _id: 'inv-porur-04',
      id: 'inv-porur-04',
      pharmacyId: 'PORUR_CARE',
      medicineName: 'Cetirizine 10mg',
      medicineId: { name: 'Cetirizine 10mg', category: 'Antihistamine', genericName: 'Cetirizine Dihydrochloride' },
      quantity: 32,
      price: 35.00,
      lowStockThreshold: 10
    },
    {
      _id: 'inv-porur-05',
      id: 'inv-porur-05',
      pharmacyId: 'PORUR_CARE',
      medicineName: 'Metformin 500mg',
      medicineId: { name: 'Metformin 500mg', category: 'Antidiabetic', genericName: 'Metformin Hydrochloride' },
      quantity: 55,
      price: 42.00,
      lowStockThreshold: 10
    },
    {
      _id: 'inv-porur-06',
      id: 'inv-porur-06',
      pharmacyId: 'PORUR_CARE',
      medicineName: 'Pantoprazole 40mg',
      medicineId: { name: 'Pantoprazole 40mg', category: 'Antacid', genericName: 'Pantoprazole Sodium' },
      quantity: 18,
      price: 78.00,
      lowStockThreshold: 10
    },
    {
      _id: 'inv-porur-07',
      id: 'inv-porur-07',
      pharmacyId: 'PORUR_CARE',
      medicineName: 'ORS Electrolyte Powder',
      medicineId: { name: 'ORS Electrolyte Powder', category: 'Rehydration', genericName: 'Oral Rehydration Salts' },
      quantity: 5,
      price: 21.50,
      lowStockThreshold: 10
    }
  ],
  APOLLO_TNAGAR: [
    {
      _id: 'inv-apollo-01',
      id: 'inv-apollo-01',
      pharmacyId: 'APOLLO_TNAGAR',
      medicineName: 'Paracetamol 650mg',
      medicineId: { name: 'Paracetamol 650mg', category: 'Analgesic', genericName: 'Acetaminophen' },
      quantity: 60,
      price: 32.00,
      lowStockThreshold: 10
    },
    {
      _id: 'inv-apollo-02',
      id: 'inv-apollo-02',
      pharmacyId: 'APOLLO_TNAGAR',
      medicineName: 'Ibuprofen 400mg',
      medicineId: { name: 'Ibuprofen 400mg', category: 'Analgesic', genericName: 'Ibuprofen' },
      quantity: 25,
      price: 45.00,
      lowStockThreshold: 10
    },
    {
      _id: 'inv-apollo-03',
      id: 'inv-apollo-03',
      pharmacyId: 'APOLLO_TNAGAR',
      medicineName: 'Azithromycin 500mg',
      medicineId: { name: 'Azithromycin 500mg', category: 'Antibiotic', genericName: 'Azithromycin' },
      quantity: 15,
      price: 120.00,
      lowStockThreshold: 10
    },
    {
      _id: 'inv-apollo-04',
      id: 'inv-apollo-04',
      pharmacyId: 'APOLLO_TNAGAR',
      medicineName: 'Montelukast 10mg',
      medicineId: { name: 'Montelukast 10mg', category: 'Respiratory', genericName: 'Montelukast Sodium' },
      quantity: 3,
      price: 95.00,
      lowStockThreshold: 10
    }
  ]
};

const INITIAL_RESERVATIONS = [
  {
    _id: 'res-porur-init-01',
    id: 'MED-4821',
    pickupCode: 'MED-4821',
    pharmacyId: 'PORUR_CARE',
    pharmacyName: 'Porur Care Dispensary',
    patientName: 'Karthik Subramanian',
    patientPhone: '+91 98402 77889',
    patientId: { name: 'Karthik Subramanian', phone: '+91 98402 77889' },
    medicineName: 'Amoxicillin 500mg',
    quantity: 2,
    price: 85.00,
    totalAmount: 170.00,
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    items: [{ medicineName: 'Amoxicillin 500mg', quantity: 2, price: 85.00 }]
  },
  {
    _id: 'res-apollo-init-01',
    id: 'MED-1194',
    pickupCode: 'MED-1194',
    pharmacyId: 'APOLLO_TNAGAR',
    pharmacyName: 'Apollo Pharmacy - T. Nagar',
    patientName: 'Ananya Roy',
    patientPhone: '+91 98403 99881',
    patientId: { name: 'Ananya Roy', phone: '+91 98403 99881' },
    medicineName: 'Ibuprofen 400mg',
    quantity: 1,
    price: 45.00,
    totalAmount: 45.00,
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    items: [{ medicineName: 'Ibuprofen 400mg', quantity: 1, price: 45.00 }]
  }
];

export const isPharmacyMatch = (pharmacyA, pharmacyB) => {
  if (!pharmacyA || !pharmacyB) return false;
  const idA = typeof pharmacyA === 'string' ? pharmacyA : pharmacyA.id || pharmacyA._id;
  const idB = typeof pharmacyB === 'string' ? pharmacyB : pharmacyB.id || pharmacyB._id;
  if (idA && idB && (idA === idB || String(idA) === String(idB))) return true;

  const nameA = (typeof pharmacyA === 'object' ? pharmacyA.name || pharmacyA.pharmacyName : '').toLowerCase();
  const nameB = (typeof pharmacyB === 'object' ? pharmacyB.name || pharmacyB.pharmacyName : '').toLowerCase();

  if (nameA && nameB && nameA === nameB) return true;
  if ((idA === 'PORUR_CARE' || idB === 'PORUR_CARE' || nameA.includes('porur') || nameB.includes('porur')) &&
      (nameA.includes('porur') || nameB.includes('porur') || idA === 'PORUR_CARE' || idB === 'PORUR_CARE')) {
    return true;
  }
  if ((idA === 'APOLLO_TNAGAR' || idB === 'APOLLO_TNAGAR' || nameA.includes('apollo') || nameB.includes('apollo')) &&
      (nameA.includes('apollo') || nameB.includes('apollo') || idA === 'APOLLO_TNAGAR' || idB === 'APOLLO_TNAGAR')) {
    return true;
  }
  return false;
};

export const PharmacyProvider = ({ children }) => {
  // 1. Single Active Pharmacy State (Persisted)
  const [activePharmacy, setActivePharmacyState] = useState(() => {
    try {
      const saved = localStorage.getItem('medlocate_active_pharmacy');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse active pharmacy from storage', e);
    }
    return DEFAULT_PORUR_PHARMACY;
  });

  // 2. Shared Multi-Pharmacy Reservations (Persisted)
  const [reservations, setReservations] = useState(() => {
    try {
      const saved = localStorage.getItem('medlocate_reservations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse reservations from storage', e);
    }
    return INITIAL_RESERVATIONS;
  });

  // 3. Shared Inventories (Persisted)
  const [inventories, setInventories] = useState(() => {
    try {
      const saved = localStorage.getItem('medlocate_inventories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse inventories from storage', e);
    }
    return INITIAL_INVENTORIES;
  });

  // Persist whenever activePharmacy changes
  useEffect(() => {
    localStorage.setItem('medlocate_active_pharmacy', JSON.stringify(activePharmacy));
  }, [activePharmacy]);

  // Persist reservations
  useEffect(() => {
    localStorage.setItem('medlocate_reservations', JSON.stringify(reservations));
  }, [reservations]);

  // Persist inventories
  useEffect(() => {
    localStorage.setItem('medlocate_inventories', JSON.stringify(inventories));
  }, [inventories]);

  // Set active pharmacy with normalization
  const setActivePharmacy = (pharmacyInput) => {
    if (!pharmacyInput) return;
    const p = pharmacyInput.pharmacy || pharmacyInput;
    let normalized = { ...p };

    // Standardize IDs for Porur and Apollo
    if (p.name?.toLowerCase().includes('porur') || p.id === 'PORUR_CARE') {
      normalized = {
        ...DEFAULT_PORUR_PHARMACY,
        ...p,
        id: 'PORUR_CARE',
        name: 'Porur Care Dispensary',
        address: 'Mount-Poonamallee High Road, Porur, Chennai 600116',
        phone: '+91 44 2476 1122'
      };
    } else if (p.name?.toLowerCase().includes('apollo') || p.id === 'APOLLO_TNAGAR') {
      normalized = {
        ...DEFAULT_APOLLO_PHARMACY,
        ...p,
        id: 'APOLLO_TNAGAR',
        name: 'Apollo Pharmacy - T. Nagar',
        address: 'G.N. Chetty Road, T. Nagar, Chennai 600017',
        phone: '+91 44 2815 6789'
      };
    } else {
      normalized.id = normalized.id || normalized._id || `PHARM_${Date.now()}`;
    }

    setActivePharmacyState(normalized);
  };

  // Add reservation to shared application state
  const addReservation = (reservationData) => {
    const pharmId = reservationData.pharmacyId || activePharmacy.id || 'PORUR_CARE';
    const pharmName = reservationData.pharmacyName || activePharmacy.name || 'Porur Care Dispensary';
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const pickupCode = reservationData.pickupCode || `MED-${codeNumber}`;
    const qty = parseInt(reservationData.quantity, 10) || 1;
    const price = parseFloat(reservationData.price) || 29.90;
    const medName = reservationData.medicineName || 'Paracetamol 650mg';

    const newReservation = {
      _id: `res-${Date.now()}`,
      id: pickupCode,
      pickupCode,
      pharmacyId: pharmId,
      pharmacyName: pharmName,
      patientName: reservationData.patientName || 'Rahul Sharma',
      patientPhone: reservationData.patientPhone || '+91 98401 23456',
      patientId: {
        _id: 'pat-default-01',
        name: reservationData.patientName || 'Rahul Sharma',
        phone: reservationData.patientPhone || '+91 98401 23456'
      },
      medicineName: medName,
      quantity: qty,
      price,
      totalAmount: parseFloat((price * qty).toFixed(2)),
      status: reservationData.status || 'READY_FOR_PICKUP',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      items: [
        {
          medicineName: medName,
          quantity: qty,
          price
        }
      ]
    };

    setReservations((prev) => [newReservation, ...prev]);

    // Also decrement local stock if present
    setInventories((prev) => {
      const pKey = pharmId.includes('PORUR') || pharmName.includes('Porur') ? 'PORUR_CARE' : 'APOLLO_TNAGAR';
      const storeItems = prev[pKey] || [];
      const updatedItems = storeItems.map((item) => {
        if (item.medicineName?.toLowerCase().includes(medName.toLowerCase().split(' ')[0])) {
          return {
            ...item,
            quantity: Math.max(0, item.quantity - qty)
          };
        }
        return item;
      });
      return {
        ...prev,
        [pKey]: updatedItems
      };
    });

    return newReservation;
  };

  // Update reservation status (e.g. Mark Picked Up, Confirm)
  const updateReservationStatus = (reservationId, newStatus) => {
    setReservations((prev) =>
      prev.map((res) => {
        if (res._id === reservationId || res.id === reservationId || res.pickupCode === reservationId) {
          return {
            ...res,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return res;
      })
    );
  };

  // Get active pharmacy's inventory items
  const getActivePharmacyInventory = () => {
    const isPorur = activePharmacy.name?.toLowerCase().includes('porur') || activePharmacy.id === 'PORUR_CARE';
    const key = isPorur ? 'PORUR_CARE' : 'APOLLO_TNAGAR';
    return inventories[key] || inventories.PORUR_CARE || [];
  };

  // Filter reservations for current active pharmacy
  const getActivePharmacyReservations = () => {
    return reservations.filter((r) => isPharmacyMatch(r, activePharmacy));
  };

  return (
    <PharmacyContext.Provider
      value={{
        activePharmacy,
        setActivePharmacy,
        reservations,
        addReservation,
        updateReservationStatus,
        getActivePharmacyInventory,
        getActivePharmacyReservations,
        isPharmacyMatch
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};

export default PharmacyContext;
