import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { medicineService } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import PharmacyCard from '../../components/PharmacyCard';
import PharmacyMap from '../../components/PharmacyMap';
import ReservationModal from '../../components/ReservationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import {
  Search,
  Filter,
  AlertTriangle,
  Flame,
  ArrowUpDown,
  Navigation,
  Compass,
  CheckCircle2,
  Hospital
} from 'lucide-react';

const PROGRESSIVE_RADII = [2, 5, 10, 25];

export const PatientSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || 'Paracetamol';

  const { latitude, longitude, locationLabel } = useLocation();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [fallbackFacilities, setFallbackFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Progressive search state
  const [searchStageMessage, setSearchStageMessage] = useState('');
  const [currentRadius, setCurrentRadius] = useState(10);
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'price', 'availability'
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Selection & Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick search tags
  const popularMedicines = ['Paracetamol', 'Amoxicillin', 'Cetirizine', 'Metformin', 'Azithromycin', 'Ibuprofen'];

  const performSearch = useCallback(
    async (queryText, isEmergency = false) => {
      if (!queryText.trim()) return;

      setLoading(true);
      setError(null);
      setResults([]);
      setFallbackFacilities([]);
      setSelectedItem(null);

      try {
        let finalResults = [];
        let usedRadius = 10;
        let facilities = [];

        if (isEmergency) {
          // In Emergency mode: search wider radius (35 km) directly for immediate availability
          setSearchStageMessage('🚨 Emergency Search: Scanning up to 35 km for immediate stock...');
          const res = await medicineService.search({
            medicine: queryText,
            latitude,
            longitude,
            radius: 35,
            emergency: 'true'
          });

          finalResults = res.data.data || [];
          usedRadius = 35;
          facilities = res.data.fallbackFacilities || [];
        } else {
          // Progressive Radius Search: 2km -> 5km -> 10km -> 25km
          for (const rad of PROGRESSIVE_RADII) {
            setSearchStageMessage(`Scanning pharmacies within ${rad} km...`);
            setCurrentRadius(rad);

            const res = await medicineService.search({
              medicine: queryText,
              latitude,
              longitude,
              radius: rad,
              sort: sortBy
            });

            const data = res.data.data || [];
            facilities = res.data.fallbackFacilities || [];

            if (data.length > 0) {
              finalResults = data;
              usedRadius = rad;
              setSearchStageMessage(`Found ${data.length} pharmacies with stock within ${rad} km.`);
              break;
            } else {
              setSearchStageMessage(`No stock within ${rad} km. Expanding search...`);
              // Small artificial pause for smooth progressive feedback in UI
              await new Promise((r) => setTimeout(r, 200));
            }
          }
        }

        setResults(finalResults);
        setFallbackFacilities(facilities);
        setCurrentRadius(usedRadius);

        if (finalResults.length === 0) {
          setSearchStageMessage(`No pharmacies with "${queryText}" were found in the searched area.`);
        }
      } catch (err) {
        console.error('Search query error:', err);
        setError('Failed to fetch medicine search results. Please check connection.');
      } finally {
        setLoading(false);
      }
    },
    [latitude, longitude, sortBy]
  );

  useEffect(() => {
    performSearch(searchTerm, emergencyMode);
  }, [performSearch, emergencyMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
    performSearch(searchTerm, emergencyMode);
  };

  const handleQuickTagClick = (tag) => {
    setSearchTerm(tag);
    setSearchParams({ q: tag });
    performSearch(tag, emergencyMode);
  };

  const handleOpenReserve = (item) => {
    setModalItem(item);
    setIsModalOpen(true);
  };

  const handleReservationSuccess = () => {
    // Refresh search after reservation to show decremented stock in near-real-time!
    performSearch(searchTerm, emergencyMode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
        <div className="max-w-3xl">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Find Medicine in Nearby Pharmacies
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Check real-time pharmacy stock, compare prices, see distance on map, and hold for in-store pickup.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by medicine name (e.g. Paracetamol, Amoxicillin)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2"
          >
            <span>Search Stock</span>
          </button>
        </form>

        {/* Quick Suggestion Pills + Emergency Mode Toggle */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">Popular:</span>
            {popularMedicines.map((med) => (
              <button
                key={med}
                type="button"
                onClick={() => handleQuickTagClick(med)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  searchTerm.toLowerCase() === med.toLowerCase()
                    ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {med}
              </button>
            ))}
          </div>

          {/* Emergency Search Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                emergencyMode
                  ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${emergencyMode ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>Emergency Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progressive Search Status Indicator */}
      {searchStageMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between border ${
            emergencyMode
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-teal-50/60 border-teal-200/80 text-teal-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {loading ? (
              <Compass className="w-4 h-4 animate-spin text-teal-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            )}
            <span>{searchStageMessage}</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-500">
            <span>Radius: <strong>{currentRadius} km</strong></span>
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold cursor-pointer focus:outline-none"
              >
                <option value="distance">Nearest First</option>
                <option value="price">Lowest Price</option>
                <option value="availability">Highest Stock</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Main Content Area: Split View (List on Left, Map on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Results List */}
        <div className="lg:col-span-6 space-y-4">
          {loading && results.length === 0 ? (
            <LoadingSpinner message="Querying geospatial indexes across pharmacies..." />
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {results.length} Pharmacies with Available Stock
                </span>
                <span className="text-xs text-slate-500">
                  Sorted by {sortBy}
                </span>
              </div>

              {results.map((item) => (
                <PharmacyCard
                  key={item._id}
                  item={item}
                  isSelected={selectedItem?._id === item._id}
                  onSelect={() => setSelectedItem(item)}
                  onReserve={handleOpenReserve}
                  isEmergency={emergencyMode}
                />
              ))}
            </div>
          ) : (
            /* No Results / Fallback Section */
            <div className="space-y-4">
              <EmptyState
                title="No pharmacies found with stock"
                description={`We scanned up to ${currentRadius} km around your location, but no pharmacies currently have "${searchTerm}" in stock.`}
                actionText="Try Emergency 35km Scan"
                onAction={() => setEmergencyMode(true)}
              />

              {/* Emergency Healthcare Facility Fallback */}
              {fallbackFacilities.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-900">
                    <Hospital className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-sm">Nearby Healthcare Facilities / Major Pharmacies</h4>
                  </div>
                  <p className="text-xs text-amber-800">
                    While exact online stock for "{searchTerm}" could not be confirmed, the following verified medical stores and emergency desks are nearby:
                  </p>
                  <div className="space-y-2 mt-2">
                    {fallbackFacilities.map((fac) => (
                      <div
                        key={fac._id || fac.name}
                        className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="font-semibold text-slate-800 block">{fac.name}</strong>
                          <span className="text-slate-500">{fac.address}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-amber-700 block">{fac.distanceKm} km</span>
                          <a
                            href={`tel:${fac.phone}`}
                            className="text-[11px] text-teal-600 font-semibold hover:underline"
                          >
                            Call Store
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Leaflet Map */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <PharmacyMap
            userLat={latitude}
            userLng={longitude}
            pharmacies={results}
            selectedPharmacyId={selectedItem?.pharmacy?.id}
            onSelectPharmacy={(p) => setSelectedItem(p)}
            onReserve={handleOpenReserve}
            isEmergency={emergencyMode}
          />
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isModalOpen}
        item={modalItem}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleReservationSuccess}
      />
    </div>
  );
};

export default PatientSearch;
