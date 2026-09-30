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
  ArrowUpDown,
  Compass,
  CheckCircle2,
  XCircle,
  Hospital,
  ShieldAlert,
  PhoneCall,
  Clock,
  Layers
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
  const [scanSteps, setScanSteps] = useState([]);
  const [currentRadius, setCurrentRadius] = useState(10);
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'price', 'availability'
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Selection & Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick search suggestions
  const popularMedicines = [
    'Paracetamol',
    'Amoxicillin',
    'Cetirizine',
    'Metformin',
    'Azithromycin',
    'Ibuprofen'
  ];

  const performSearch = useCallback(
    async (queryText, isEmergency = false) => {
      if (!queryText.trim()) return;

      setLoading(true);
      setError(null);
      setResults([]);
      setFallbackFacilities([]);
      setSelectedItem(null);
      setScanSteps([]);

      try {
        let finalResults = [];
        let usedRadius = 10;
        let facilities = [];
        const steps = [];

        if (isEmergency) {
          // Emergency Mode: Scan up to 35 km immediately, prioritizing verified stores with highest stock
          steps.push({
            radius: 35,
            status: 'searching',
            message: 'Emergency Scan: Scanning 35 km perimeter for immediate stock...'
          });
          setScanSteps([...steps]);

          const res = await medicineService.search({
            medicine: queryText,
            latitude,
            longitude,
            radius: 35,
            emergency: 'true'
          });

          finalResults = res.data?.data || [];
          usedRadius = 35;
          facilities = res.data?.fallbackFacilities || [];

          if (finalResults.length > 0) {
            steps[0] = {
              radius: 35,
              status: 'found',
              count: finalResults.length,
              message: `Emergency Scan: ${finalResults.length} pharmacies found with immediate stock.`
            };
          } else {
            steps[0] = {
              radius: 35,
              status: 'none',
              count: 0,
              message: `Emergency Scan (35 km): No pharmacies currently stock this medication.`
            };
          }
          setScanSteps([...steps]);
        } else {
          // Progressive Radius Search: 2 km -> 5 km -> 10 km -> 25 km
          for (const rad of PROGRESSIVE_RADII) {
            setCurrentRadius(rad);

            const activeStep = {
              radius: rad,
              status: 'searching',
              message: `Searching within ${rad} km...`
            };
            steps.push(activeStep);
            setScanSteps([...steps]);

            const res = await medicineService.search({
              medicine: queryText,
              latitude,
              longitude,
              radius: rad,
              sort: sortBy
            });

            const data = res.data?.data || [];
            facilities = res.data?.fallbackFacilities || [];

            if (data.length > 0) {
              finalResults = data;
              usedRadius = rad;
              steps[steps.length - 1] = {
                radius: rad,
                status: 'found',
                count: data.length,
                message: `${data.length} ${data.length === 1 ? 'pharmacy' : 'pharmacies'} found.`
              };
              setScanSteps([...steps]);
              break;
            } else {
              steps[steps.length - 1] = {
                radius: rad,
                status: 'none',
                count: 0,
                message: 'No stock found.'
              };
              setScanSteps([...steps]);
              // Brief progressive feedback pause
              await new Promise((r) => setTimeout(r, 220));
            }
          }
        }

        setResults(finalResults);
        setFallbackFacilities(facilities);
        setCurrentRadius(usedRadius);
      } catch (err) {
        console.error('Search query error:', err);
        setError('Failed to fetch medicine search results. Please check your network connection.');
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
            Progressively scans nearby dispensaries, compares prices and distance, and secures a 30-minute hold for in-store pickup.
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

      {/* Emergency Mode Disclaimer Banner (Visually noticeable & professional) */}
      {emergencyMode && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3 text-rose-900 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-sm text-rose-950 flex items-center space-x-1.5">
              <span>Emergency Search Mode Active</span>
              <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-bold uppercase">
                35 km Radius
              </span>
            </h4>
            <p className="text-rose-800 leading-relaxed">
              Prioritizing dispensaries with verified on-hand stock and sorting by immediate availability.
              Reservation locks inventory for <strong>30 minutes</strong> for in-store pickup.
            </p>
            <p className="text-[11px] text-rose-600 font-medium italic">
              Notice: MedLocate does not claim guaranteed delivery or immediate emergency transit. Please contact the dispensary directly or emergency services (108) if critical ambulance assistance is required.
            </p>
          </div>
        </div>
      )}

      {/* Progressive Search Step-by-Step Trace Display */}
      {scanSteps.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Progressive Search Execution Log</span>
            </span>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span>Effective Radius: <strong>{currentRadius} km</strong></span>
              {/* Sort Filter */}
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-700 font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="distance">Nearest Distance</option>
                  <option value="price">Lowest Price</option>
                  <option value="availability">Highest Stock</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 font-mono text-xs">
            {scanSteps.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                {step.status === 'searching' && (
                  <Compass className="w-3.5 h-3.5 text-teal-600 animate-spin flex-shrink-0" />
                )}
                {step.status === 'found' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                )}
                {step.status === 'none' && (
                  <XCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}

                <span className="text-slate-600">
                  Searching within {step.radius} km...
                </span>
                <span
                  className={`font-semibold ${
                    step.status === 'found'
                      ? 'text-emerald-700'
                      : step.status === 'none'
                      ? 'text-slate-500'
                      : 'text-teal-600'
                  }`}
                >
                  {step.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Main Split View: Left Results Cards, Right Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Results List or Fallback */}
        <div className="lg:col-span-6 space-y-4">
          {loading && results.length === 0 ? (
            <LoadingSpinner message="Scanning MongoDB 2dsphere indexes across Chennai..." />
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
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
            /* No Results: Exact User Prompt Message & Authentic Healthcare Facilities Fallback */
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 text-center space-y-2 shadow-xs">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-2">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No pharmacies with this medicine were found in the searched area.
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We completed progressive searches up to {currentRadius} km. No registered pharmacy has verified available stock for "{searchTerm}".
                </p>
                {!emergencyMode && (
                  <button
                    type="button"
                    onClick={() => setEmergencyMode(true)}
                    className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Activate 35 km Emergency Scan
                  </button>
                )}
              </div>

              {/* Verified Healthcare Facility Fallback Section (Non-Fabricated) */}
              {fallbackFacilities.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-900">
                    <Hospital className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Nearby Healthcare & Pharmacy Desks</h4>
                      <p className="text-[11px] text-amber-800">
                        The following verified dispensaries are nearby in Chennai. Contact them directly to inquire about incoming batches:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {fallbackFacilities.map((fac) => (
                      <div
                        key={fac._id || fac.name}
                        className="bg-white p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div>
                          <strong className="font-bold text-slate-900 block">{fac.name}</strong>
                          <span className="text-slate-500 text-[11px] block">{fac.address}</span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <span className="font-extrabold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded text-[11px] block mb-1">
                            {fac.distanceKm} km
                          </span>
                          <a
                            href={`tel:${fac.phone}`}
                            className="inline-flex items-center space-x-1 text-teal-700 hover:text-teal-800 font-bold text-[11px]"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Call</span>
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

        {/* Right Column: Leaflet Interactive Map */}
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
