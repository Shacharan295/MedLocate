import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { inventoryService, medicineService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  UploadCloud,
  Check,
  X
} from 'lucide-react';

export const PharmacyInventory = () => {
  const [searchParams] = useSearchParams();
  const initialLowFilter = searchParams.get('filter') === 'low';

  const [inventory, setInventory] = useState([]);
  const [catalogMedicines, setCatalogMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(initialLowFilter);

  // Edit stock/price modal state
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editSaving, setEditSaving] = useState(false);

  // Add Item to Inventory Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [newQuantity, setNewQuantity] = useState(20);
  const [newPrice, setNewPrice] = useState(45.00);
  const [addSaving, setAddSaving] = useState(false);

  // POS Sync Modal
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [posSyncing, setPosSyncing] = useState(false);
  const [posMessage, setPosMessage] = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resInv, resMeds] = await Promise.all([
        inventoryService.getAll({ lowStock: onlyLowStock ? 'true' : undefined }),
        medicineService.getAll()
      ]);
      setInventory(resInv.data?.data || []);
      setCatalogMedicines(resMeds.data?.data || []);
    } catch (err) {
      setError('Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [onlyLowStock]);

  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
    setEditPrice(item.price);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      setEditSaving(true);
      await inventoryService.update(editingItem._id, {
        quantity: parseInt(editQuantity, 10),
        price: parseFloat(editPrice)
      });
      setEditingItem(null);
      await fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update inventory.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!selectedMedicineId) return;
    try {
      setAddSaving(true);
      await inventoryService.create({
        medicineId: selectedMedicineId,
        quantity: parseInt(newQuantity, 10),
        price: parseFloat(newPrice)
      });
      setIsAddModalOpen(false);
      setSelectedMedicineId('');
      await fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add medicine to inventory.');
    } finally {
      setAddSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await inventoryService.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove inventory item.');
    }
  };

  const handleSimulatePOSSync = async () => {
    try {
      setPosSyncing(true);
      setPosMessage(null);

      // Simulated POS batch payload
      const mockBatch = [
        { medicineName: 'Paracetamol 650mg', quantity: 50, price: 31.00 },
        { medicineName: 'Amoxicillin 500mg', quantity: 22, price: 92.50 },
        { medicineName: 'Cetirizine 10mg', quantity: 15, price: 25.00 }
      ];

      const res = await inventoryService.syncPOS(mockBatch);
      setPosMessage(`Success! Synchronized POS batch feed (${res.data.data.length} records reconciled).`);
      await fetchInventory();
    } catch (err) {
      setPosMessage('POS Synchronization error: ' + (err.response?.data?.message || err.message));
    } finally {
      setPosSyncing(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const s = searchTerm.toLowerCase();
    return (
      item.medicineId?.name?.toLowerCase().includes(s) ||
      item.medicineId?.genericName?.toLowerCase().includes(s) ||
      item.medicineId?.category?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pharmacy Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add medicines, adjust live stock, update prices, and synchronize POS feeds.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* POS Sync Button */}
          <button
            type="button"
            onClick={() => setIsPosModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
            <span>Sync POS Feed</span>
          </button>

          {/* Add Medicine Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine to Store</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stock by name, generic formula, or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center space-x-1.5 transition-colors ${
              onlyLowStock
                ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-500/20'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyLowStock ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Low Stock Filter</span>
          </button>

          <span className="text-xs text-slate-400 font-medium">
            {filteredInventory.length} items
          </span>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <LoadingSpinner message="Loading pharmacy inventory..." />
      ) : filteredInventory.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory records found"
          description="Click 'Add Medicine to Store' to stock medicines from the global catalog."
          actionText="Add First Medicine"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Medicine</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Stock Quantity</th>
                  <th className="py-3.5 px-5">Selling Price</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInventory.map((item) => {
                  const isLow = item.quantity <= (item.lowStockThreshold || 10);
                  const isEditing = editingItem?._id === item._id;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5">
                        <strong className="font-bold text-slate-900 block text-sm">
                          {item.medicineId?.name}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {item.medicineId?.genericName} • {item.medicineId?.manufacturer}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {item.medicineId?.category}
                      </td>

                      <td className="py-4 px-5">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            className="w-20 px-2 py-1 bg-white border border-teal-500 rounded-lg text-xs font-bold text-slate-800"
                          />
                        ) : (
                          <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                            {item.quantity} units
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 px-2 py-1 bg-white border border-teal-500 rounded-lg text-xs font-bold text-slate-800"
                          />
                        ) : (
                          <span className="font-extrabold text-slate-900">
                            ₹{item.price?.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        {item.quantity === 0 ? (
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Healthy Stock
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              disabled={editSaving}
                              className="p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItem(null)}
                              className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditClick(item)}
                              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit Quantity or Price"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Medicine to Store Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Medicine to Store</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Medicine from Global Catalog
                </label>
                <select
                  value={selectedMedicineId}
                  onChange={(e) => setSelectedMedicineId(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">-- Choose Medicine --</option>
                  {catalogMedicines.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.genericName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSaving}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {addSaving ? 'Saving...' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POS Synchronization Modal */}
      {isPosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">POS Feed Synchronization</h3>
              </div>
              <button
                onClick={() => setIsPosModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              MedLocate provides an API-ready architecture for external Point of Sale (POS) inventory synchronization.
              Clicking below simulates a real-time POS batch feed sync that reconciles in-store stock levels without overwriting active patient holds.
            </p>

            {posMessage && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-semibold text-teal-900">
                {posMessage}
              </div>
            )}

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsPosModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSimulatePOSSync}
                disabled={posSyncing}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                {posSyncing ? 'Synchronizing POS Batch...' : 'Simulate POS Sync'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Medicine from Inventory?"
        message={`Are you sure you want to remove "${deleteTarget?.medicineId?.name}" from your store? It will no longer appear in patient search results.`}
        isDangerous={true}
        confirmText="Remove Item"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default PharmacyInventory;
