const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const { notifyPharmacyStaff } = require('../services/notificationService');

/**
 * @route   GET /api/inventory
 * @desc    Get pharmacy inventory (filtered by logged-in pharmacy or pharmacyId query)
 * @access  Private (Pharmacy, Admin)
 */
const getInventory = async (req, res, next) => {
  try {
    let pharmacyId = req.user.pharmacyId;

    // Admin can query any pharmacy's inventory, or all if unspecified
    if (req.user.role === 'admin') {
      pharmacyId = req.query.pharmacyId || null;
    }

    if (!pharmacyId && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No pharmacy associated with this account or query.'
      });
    }

    const { lowStock, search } = req.query;
    const query = pharmacyId ? { pharmacyId } : {};

    if (lowStock === 'true') {
      // Find where quantity <= lowStockThreshold
      query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
    }

    let items = await Inventory.find(query)
      .populate('medicineId')
      .sort({ updatedAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(
        item =>
          item.medicineId?.name.toLowerCase().includes(s) ||
          item.medicineId?.genericName.toLowerCase().includes(s) ||
          item.medicineId?.category.toLowerCase().includes(s)
      );
    }

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/inventory
 * @desc    Add a medicine to pharmacy inventory
 * @access  Private (Pharmacy, Admin)
 */
const createInventory = async (req, res, next) => {
  try {
    const pharmacyId = req.user.pharmacyId || req.body.pharmacyId;
    const { medicineId, quantity, price, lowStockThreshold = 10 } = req.body;

    if (!pharmacyId || !medicineId || quantity === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy ID, medicine ID, quantity, and price are required.'
      });
    }

    if (quantity < 0 || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and price cannot be negative numbers.'
      });
    }

    // Check if medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found in catalog.'
      });
    }

    // Check if item already exists in pharmacy's inventory
    const existing = await Inventory.findOne({ pharmacyId, medicineId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This medicine already exists in your inventory. Please update the existing entry instead.'
      });
    }

    const item = await Inventory.create({
      pharmacyId,
      medicineId,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
      lowStockThreshold: parseInt(lowStockThreshold, 10)
    });

    const populatedItem = await Inventory.findById(item._id).populate('medicineId');

    return res.status(201).json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update stock quantity, price, or threshold
 * @access  Private (Pharmacy, Admin)
 */
const updateInventory = async (req, res, next) => {
  try {
    const { quantity, price, lowStockThreshold } = req.body;
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found.'
      });
    }

    // Strict ownership verification: Pharmacy can only edit their own inventory
    if (req.user.role === 'pharmacy') {
      if (inventoryItem.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. You can only manage inventory for your own pharmacy.'
        });
      }
    }

    if (quantity !== undefined) {
      const q = parseInt(quantity, 10);
      if (q < 0) return res.status(400).json({ success: false, message: 'Quantity cannot be negative.' });
      inventoryItem.quantity = q;
    }

    if (price !== undefined) {
      const p = parseFloat(price);
      if (p < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
      inventoryItem.price = p;
    }

    if (lowStockThreshold !== undefined) {
      inventoryItem.lowStockThreshold = parseInt(lowStockThreshold, 10);
    }

    await inventoryItem.save();

    // Check low stock alert
    if (inventoryItem.quantity <= inventoryItem.lowStockThreshold) {
      const medicine = await Medicine.findById(inventoryItem.medicineId);
      await notifyPharmacyStaff(
        inventoryItem.pharmacyId,
        'LOW_STOCK',
        'Low Stock Warning',
        `Stock for ${medicine?.name || 'item'} is low: ${inventoryItem.quantity} units remaining.`,
        { inventoryId: inventoryItem._id, medicineId: inventoryItem.medicineId }
      );
    }

    const updated = await Inventory.findById(inventoryItem._id).populate('medicineId');

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Remove an item from inventory
 * @access  Private (Pharmacy, Admin)
 */
const deleteInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    if (req.user.role === 'pharmacy' && item.pharmacyId.toString() !== req.user.pharmacyId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this inventory.' });
    }

    await item.deleteOne();
    return res.status(200).json({ success: true, message: 'Inventory item removed successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/inventory/sync
 * @desc    Synchronize inventory batch from external Point of Sale (POS) system
 * @access  Private (Pharmacy)
 */
const syncPOSInventory = async (req, res, next) => {
  try {
    const pharmacyId = req.user.pharmacyId;
    const { batch } = req.body; // Array of { medicineName or medicineId, quantity, price }

    if (!Array.isArray(batch) || !batch.length) {
      return res.status(400).json({ success: false, message: 'POS sync batch array required.' });
    }

    const results = [];
    for (const entry of batch) {
      let med = null;
      if (entry.medicineId) {
        med = await Medicine.findById(entry.medicineId);
      } else if (entry.medicineName) {
        med = await Medicine.findOne({ name: { $regex: new RegExp(`^${entry.medicineName}$`, 'i') } });
      }

      if (!med) continue;

      const updated = await Inventory.findOneAndUpdate(
        { pharmacyId, medicineId: med._id },
        {
          $set: {
            quantity: Math.max(0, parseInt(entry.quantity, 10)),
            price: Math.max(0, parseFloat(entry.price || 10))
          }
        },
        { upsert: true, new: true }
      );
      results.push(updated);
    }

    return res.status(200).json({
      success: true,
      message: `POS batch synchronization completed. Processed ${results.length} records.`,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  syncPOSInventory
};
