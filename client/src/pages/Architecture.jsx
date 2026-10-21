import React, { useState, useEffect } from 'react';
import {
  Layers,
  User,
  Store,
  ShieldCheck,
  Server,
  Database,
  ArrowRight,
  Compass,
  Cpu,
  Lock,
  Bell,
  RefreshCw,
  Search,
  CheckCircle,
  FileCode,
  Globe,
  Radio,
  Share2,
  Zap,
  Info,
  ChevronRight,
  Eye,
  Play,
  RotateCcw
} from 'lucide-react';

const ARCHITECTURE_FLOWS = [
  {
    id: 'flow-a',
    name: 'Flow A: Medicine Discovery & Map Search',
    tag: 'Patient Workflow',
    description: 'Patient searches medicine name and coordinates → Axios triggers Express $geoNear aggregation → MongoDB queries 2dsphere index → Returns pharmacies within radius → Leaflet renders pins & stock cards.',
    steps: [
      { step: 1, node: 'node-patient', label: 'Patient triggers medicine query (e.g. "Paracetamol") with geolocation' },
      { step: 2, node: 'node-react', label: 'React client captures query and coordinates from LocationContext' },
      { step: 3, node: 'node-axios', label: 'Axios sends GET /api/medicines/search?query=...&latitude=...&radius=...' },
      { step: 4, node: 'node-express', label: 'Express routes to medicineController.searchNearbyWithMedicine' },
      { step: 5, node: 'node-search-svc', label: 'Search Service initiates MongoDB $geoNear aggregation pipeline' },
      { step: 6, node: 'node-2dsphere', label: '2dsphere index calculates spherical distance to each pharmacy' },
      { step: 7, node: 'node-mongodb', label: 'Database matches inventory stock > 0 and returns sorted pharmacies' },
      { step: 8, node: 'node-leaflet', label: 'Leaflet Map renders interactive markers; cards highlight matching inventory' }
    ]
  },
  {
    id: 'flow-b',
    name: 'Flow B: Guaranteed Atomic Reservation Hold',
    tag: 'Critical Concurrency',
    description: 'Patient requests 30-min hold → JWT authentication verifies identity → Atomic findOneAndUpdate with stock >= qty check decrements inventory → Reservation generated with pickup code → Notification sent to pharmacy.',
    steps: [
      { step: 1, node: 'node-patient', label: 'Patient clicks "Reserve Medicine" specifying quantity and pharmacy' },
      { step: 2, node: 'node-jwt', label: 'Client passes Bearer JWT; protect middleware verifies token and patient role' },
      { step: 3, node: 'node-express', label: 'Express routes to reservationController.create' },
      { step: 4, node: 'node-reservation-svc', label: 'Reservation Service initiates atomic stock validation' },
      { step: 5, node: 'node-atomic', label: 'MongoDB atomic findOneAndUpdate({ stock: { $gte: qty } }, { $inc: { stock: -qty } })' },
      { step: 6, node: 'node-mongodb', label: 'Reservation record saved in reservations collection with 30-min expiration' },
      { step: 7, node: 'node-notif-svc', label: 'Notification Service triggers alert for pharmacy staff' },
      { step: 8, node: 'node-pharmacy-staff', label: 'Pharmacy dashboard alerts staff of new pending pickup order' }
    ]
  },
  {
    id: 'flow-c',
    name: 'Flow C: POS & Inventory Synchronization',
    tag: 'Pharmacy Staff',
    description: 'Pharmacy updates stock/price → JWT validates pharmacy store ownership → Compound index prevents duplicates → MongoDB updates inventory → Search cache and patient discovery immediately reflect new stock.',
    steps: [
      { step: 1, node: 'node-pharmacy-staff', label: 'Staff enters updated stock or unit price in Pharmacy Inventory table' },
      { step: 2, node: 'node-react', label: 'React form handles validation and dispatches inventoryService.updateStock' },
      { step: 3, node: 'node-express', label: 'Express verifies pharmacy ownership via req.user.pharmacyId' },
      { step: 4, node: 'node-inventory-svc', label: 'Inventory Service executes upsert on pharmacyId + medicineId' },
      { step: 5, node: 'node-compound', label: 'Compound index { pharmacyId: 1, medicineId: 1 } ensures uniqueness' },
      { step: 6, node: 'node-mongodb', label: 'Inventories collection updated with new quantity and audit timestamp' },
      { step: 7, node: 'node-search-svc', label: 'Updated stock and pricing are immediately discoverable on public map' }
    ]
  },
  {
    id: 'flow-d',
    name: 'Flow D: Admin Dispensary Verification',
    tag: 'Admin & Compliance',
    description: 'Admin reviews license & coordinates → Admin verification endpoint toggles verified=true → MongoDB updates status → Pharmacy badge changes to Verified across search results and map popups.',
    steps: [
      { step: 1, node: 'node-admin', label: 'Platform Admin opens Verifications panel in Admin Dashboard' },
      { step: 2, node: 'node-jwt', label: 'Admin token authorized via authorize("admin") role-based guard' },
      { step: 3, node: 'node-express', label: 'Express routes to adminController.verifyPharmacy' },
      { step: 4, node: 'node-admin-svc', label: 'Admin Service audits license number, phone, and store coordinates' },
      { step: 5, node: 'node-mongodb', label: 'Pharmacy document updated: isVerified=true, verifiedAt=Date.now()' },
      { step: 6, node: 'node-notif-svc', label: 'Notification dispatched to pharmacy owner confirming verification' },
      { step: 7, node: 'node-leaflet', label: 'Pharmacy receives green verified badge on map marker and public listings' }
    ]
  }
];

const COMPONENT_DETAILS = {
  'node-patient': {
    title: 'Patient User Persona',
    layer: 'User Layer',
    tech: 'Browser / Mobile Client',
    status: 'LIVE',
    purpose: 'End-user looking for critical prescription drugs or OTC medicine within immediate vicinity.',
    api: 'Direct user interaction via web interface',
    responsibilities: [
      'Search medicine by brand or generic name',
      'Grant or deny browser geolocation (automatic fallback to Chennai central coordinates)',
      'Adjust radius filter (2km, 5km, 10km, 25km)',
      'Engage Emergency Search mode with progressive radius fallback',
      'Place 30-minute holds and receive pickup codes'
    ]
  },
  'node-pharmacy-staff': {
    title: 'Pharmacy Staff Persona',
    layer: 'User Layer',
    tech: 'Browser / POS Dashboard',
    status: 'LIVE',
    purpose: 'Dispensary staff managing in-store medicine stock, verifying reservations, and dispensing medicine.',
    api: 'POST /api/pharmacies/register, POST /api/inventory',
    responsibilities: [
      'Manage inventory catalog, stock levels, and prices',
      'Review real-time incoming reservation orders',
      'Update reservation lifecycle: CONFIRMED, PICKED_UP, CANCELLED',
      'Receive low-stock inventory warnings'
    ]
  },
  'node-admin': {
    title: 'System Administrator Persona',
    layer: 'User Layer',
    tech: 'Browser / Admin Portal',
    status: 'LIVE',
    purpose: 'Platform operator responsible for compliance, dispensary verification, and platform integrity.',
    api: 'GET /api/admin/reports, PUT /api/admin/pharmacies/:id/verify',
    responsibilities: [
      'Verify physical drug store licenses and geolocation accuracy',
      'Manage user accounts, roles, and suspension states',
      'Audit platform-wide metrics: total volume, hold completion rate, active dispensaries'
    ]
  },
  'node-react': {
    title: 'React 18 + Vite Frontend',
    layer: 'Frontend Layer',
    tech: 'React 18.3, Vite 6, Tailwind CSS 3.4',
    status: 'LIVE',
    purpose: 'Modern, high-performance Single Page Application (SPA) with responsive layouts and componentized state.',
    api: 'Consumes backend REST APIs via Axios',
    responsibilities: [
      'Client-side routing via React Router DOM 6',
      'Global state management via Context API (AuthContext, LocationContext, NotificationContext)',
      'Reactive responsive styling with medical color palette (teal/navy/slate)',
      'Subtle UI micro-animations and accessible feedback loops'
    ]
  },
  'node-leaflet': {
    title: 'Leaflet & React-Leaflet Map Engine',
    layer: 'Frontend Layer',
    tech: 'Leaflet 1.9.4, React-Leaflet 4.2.1, OpenStreetMap Tiles',
    status: 'LIVE',
    purpose: 'Zero-API-key interactive map engine rendering Chennai coordinates, radius overlays, and custom markers.',
    api: 'Direct browser DOM rendering with tileerror resilience',
    responsibilities: [
      'Renders custom SVG marker pins with stock count indicators',
      'Centers on Chennai (13.0827, 80.2707) with dynamic geolocation pan',
      'Draws translucent search radius circle (2km to 25km)',
      'Synchronizes two-way selection: clicking card pans map; clicking pin scrolls to card',
      'Displays rich popup cards with stock status, distance, rating, and reserve CTA'
    ]
  },
  'node-axios': {
    title: 'Centralized Axios HTTP Client',
    layer: 'Frontend Layer',
    tech: 'Axios 1.7.9 with Interceptors',
    status: 'LIVE',
    purpose: 'Encapsulated API communication layer managing headers, authentication tokens, and error handling.',
    api: 'http://localhost:5000/api',
    responsibilities: [
      'Attaches Bearer JWT from localStorage to outgoing requests',
      'Automatically logs out and redirects on 401 Unauthorized responses',
      'Translates backend error structures into clean user-facing notifications'
    ]
  },
  'node-express': {
    title: 'Node.js & Express.js REST Gateway',
    layer: 'Application Layer',
    tech: 'Node.js 20+, Express 4.21, CORS, Morgan',
    status: 'LIVE',
    purpose: 'High-throughput asynchronous backend server orchestrating RESTful endpoints and middleware pipelines.',
    api: '/api/auth, /api/medicines, /api/pharmacies, /api/inventory, /api/reservations, /api/admin',
    responsibilities: [
      'Input validation and sanitization on all payload bodies',
      'CORS configuration for cross-origin frontend communication',
      'Route-level middleware orchestration (auth, role guards, error handlers)'
    ]
  },
  'node-jwt': {
    title: 'JWT Authentication & Role Guard',
    layer: 'Application Layer',
    tech: 'jsonwebtoken, bcryptjs',
    status: 'LIVE',
    purpose: 'Stateless cryptographic token security protecting private resources with role-based authorization.',
    api: 'Authorization: Bearer <token>',
    responsibilities: [
      'Signs JWT containing user ID, role, and pharmacy ID on login',
      'Verifies token signature on incoming protected requests (protect middleware)',
      'Enforces granular role permissions (authorize("patient", "pharmacy", "admin"))'
    ]
  },
  'node-search-svc': {
    title: 'Geospatial Medicine Search Service',
    layer: 'Business Services Layer',
    tech: 'MongoDB $geoNear Aggregation Pipeline',
    status: 'LIVE',
    purpose: 'High-speed proximity discovery engine filtering dispensaries by inventory availability and physical distance.',
    api: 'GET /api/medicines/search',
    responsibilities: [
      'Executes spherical distance calculations using Earth radius in meters',
      'Filters inventory documents for stock > 0 matching queried medicine name/regex',
      'Applies progressive radius expansion (2km → 5km → 10km → 25km) when local stock is exhausted',
      'Includes emergency search prioritization and verified fallback facilities'
    ]
  },
  'node-reservation-svc': {
    title: 'Reservation Engine & Concurrency Lock',
    layer: 'Business Services Layer',
    tech: 'Mongoose & MongoDB Atomic findOneAndUpdate',
    status: 'LIVE',
    purpose: 'Atomic reservation engine ensuring zero-overbooking guarantees under high concurrency.',
    api: 'POST /api/reservations',
    responsibilities: [
      'Executes atomic conditional decrement: { stock: { $gte: requestedQty } }',
      'Guarantees no race condition even if multiple patients reserve the last box simultaneously',
      'Generates unique human-readable pickup codes (e.g. ML-7492)',
      'Enforces 30-minute hold window before auto-restoration'
    ]
  },
  'node-inventory-svc': {
    title: 'Inventory Sync Service',
    layer: 'Business Services Layer',
    tech: 'Mongoose Model & Compound Indexing',
    status: 'LIVE',
    purpose: 'Pharmacy catalog management and stock synchronizer.',
    api: 'POST /api/inventory, PUT /api/inventory/:id',
    responsibilities: [
      'Prevents duplicate medicine rows per pharmacy via compound unique indexing',
      'Monitors low-stock threshold triggers (default <= 10 units)',
      'Calculates real-time catalog analytics for pharmacy dashboard'
    ]
  },
  'node-notif-svc': {
    title: 'Notification Dispatcher',
    layer: 'Business Services Layer',
    tech: 'Mongoose Notification Schema & Event Triggers',
    status: 'LIVE',
    purpose: 'Dispatches in-app notifications for order updates, verification changes, and system alerts.',
    api: 'GET /api/notifications, PUT /api/notifications/:id/read',
    responsibilities: [
      'Creates notifications on reservation state transitions (CREATED, CONFIRMED, READY)',
      'Notifies pharmacy staff instantly when an urgent hold is placed',
      'Tracks read/unread states and badge counters'
    ]
  },
  'node-admin-svc': {
    title: 'Admin Audit & Compliance Service',
    layer: 'Business Services Layer',
    tech: 'MongoDB Aggregation & Mongoose',
    status: 'LIVE',
    purpose: 'Platform analytics, dispensary verification audit, and user governance.',
    api: 'GET /api/admin/reports',
    responsibilities: [
      'Aggregates platform KPIs: users, verified vs pending stores, total volume',
      'Toggles pharmacy verification state with audit timestamps',
      'Generates daily operational reports'
    ]
  },
  'node-mongodb': {
    title: 'MongoDB Database Layer',
    layer: 'Database Layer',
    tech: 'MongoDB 7+ / Mongoose 8.9',
    status: 'LIVE',
    purpose: 'NoSQL document store holding user accounts, pharmacies, medicine master, inventory, and reservations.',
    api: 'mongodb://localhost:27017/medlocate',
    responsibilities: [
      'Houses 6 core collections: users, pharmacies, medicines, inventories, reservations, notifications',
      'Guarantees ACID transactions within single-document operations',
      'Maintains index trees for sub-10ms query execution'
    ]
  },
  'node-2dsphere': {
    title: '2dsphere Geospatial Index',
    layer: 'Database Layer',
    tech: 'MongoDB 2dsphere Indexing on { location: "2dsphere" }',
    status: 'LIVE',
    purpose: 'Calculates spherical geometries and proximity metrics across Chennai coordinates on the Earth sphere.',
    api: 'db.pharmacies.createIndex({ location: "2dsphere" })',
    responsibilities: [
      'Powers $geoNear aggregation queries with zero CPU table scans',
      'Computes accurate geodesic distance in kilometers between patient and pharmacy',
      'Enables progressive radius perimeter rings (2km to 25km)'
    ]
  },
  'node-atomic': {
    title: 'Atomic Concurrency Engine',
    layer: 'Database Layer',
    tech: 'MongoDB Single-Document Mutex Semantics',
    status: 'LIVE',
    purpose: 'Prevents double-booking and overselling during peak medicine shortages.',
    api: 'Atomic findOneAndUpdate with $inc',
    responsibilities: [
      'Locks and updates inventory row in a single atomic database operation',
      'Returns 409 Conflict if remaining stock is less than quantity requested',
      'Verified with zero-overbooking concurrent stress tests'
    ]
  },
  'node-compound': {
    title: 'Compound Unique Index',
    layer: 'Database Layer',
    tech: 'Compound Index on { pharmacyId: 1, medicineId: 1 }',
    status: 'LIVE',
    purpose: 'Maintains referential integrity between pharmacy stores and medicine master items.',
    api: 'db.inventories.createIndex({ pharmacyId: 1, medicineId: 1 }, { unique: true })',
    responsibilities: [
      'Eliminates duplicate inventory records for identical medicine within the same store',
      'Accelerates stock update and catalog lookups by O(log N) compound binary search'
    ]
  }
};

export const Architecture = () => {
  const [selectedFlow, setSelectedFlow] = useState('flow-a');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState('node-search-svc');

  const activeFlow = ARCHITECTURE_FLOWS.find((f) => f.id === selectedFlow) || ARCHITECTURE_FLOWS[0];
  const activeStep = activeFlow.steps[currentStepIndex] || activeFlow.steps[0];
  const activeNodeDetails = COMPONENT_DETAILS[selectedNodeId] || COMPONENT_DETAILS['node-search-svc'];

  // Step-by-step automatic playback
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= activeFlow.steps.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          setSelectedNodeId(activeFlow.steps[next].node);
          return next;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeFlow]);

  const handleSelectFlow = (flowId) => {
    setSelectedFlow(flowId);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    const flow = ARCHITECTURE_FLOWS.find((f) => f.id === flowId);
    if (flow && flow.steps[0]) {
      setSelectedNodeId(flow.steps[0].node);
    }
  };

  const isNodeInFlow = (nodeId) => {
    return activeFlow.steps.some((s) => s.node === nodeId);
  };

  const isNodeCurrentlyActive = (nodeId) => {
    return activeStep && activeStep.node === nodeId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4" />
                <span>Production System Architecture & Data Flow</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Med<span className="text-teal-400">Locate</span> Architecture
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl">
                "From medicine discovery to pharmacy reservation" — Complete end-to-end full-stack visualization showing real MERN components, indexing, atomic concurrency locks, and data flows.
              </p>
            </div>

            {/* Architecture Tech Badges */}
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">
                React 18 & Vite
              </span>
              <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 rounded-lg border border-sky-500/30">
                Node.js & Express
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                MongoDB & 2dsphere
              </span>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
                Leaflet / OSM
              </span>
            </div>
          </div>

          {/* Interactive Flow Switcher Tabs */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 block mb-3 uppercase tracking-wider">
              Select Interactive Execution Flow:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ARCHITECTURE_FLOWS.map((flow) => {
                const selected = flow.id === selectedFlow;
                return (
                  <button
                    key={flow.id}
                    onClick={() => handleSelectFlow(flow.id)}
                    className={`text-left p-3 rounded-2xl border transition-all text-xs ${
                      selected
                        ? 'bg-teal-900/60 border-teal-400 text-white shadow-md shadow-teal-900/30 ring-1 ring-teal-400'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        selected ? 'bg-teal-400 text-teal-950' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {flow.id.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-teal-300 font-medium">{flow.tag}</span>
                    </div>
                    <div className="font-bold text-xs truncate">{flow.name.split(':')[1]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flow Stepper Controller */}
          <div className="mt-6 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
              >
                {isPlaying ? <span className="w-2 h-2 rounded-xs bg-slate-950" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause Flow' : 'Animate Flow'}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(0);
                  if (activeFlow.steps[0]) setSelectedNodeId(activeFlow.steps[0].node);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Reset to Step 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="text-xs">
                <span className="text-slate-400">Step {currentStepIndex + 1} of {activeFlow.steps.length}: </span>
                <span className="text-teal-300 font-semibold">{activeStep?.label}</span>
              </div>
            </div>

            {/* Step Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
              {activeFlow.steps.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(idx);
                    setSelectedNodeId(st.node);
                  }}
                  className={`w-6 h-6 rounded-full text-[11px] font-bold transition-all flex items-center justify-center ${
                    idx === currentStepIndex
                      ? 'bg-teal-400 text-teal-950 ring-2 ring-teal-300 scale-110'
                      : idx < currentStepIndex
                      ? 'bg-teal-800/60 text-teal-200 border border-teal-600/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tiered Architecture Visualization Board */}
      <div className="space-y-6">
        {/* Tier 1: User Layer */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                1
              </span>
              <h2 className="font-bold text-sm text-slate-800 tracking-tight uppercase">User Personas Layer</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Browser & Mobile Clients</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Patient Actor */}
            <div
              onClick={() => setSelectedNodeId('node-patient')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-patient'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-patient')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-patient')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Patient</h3>
                    <span className="text-[10px] text-slate-500 block">End-User Healthcare</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
                  Consumer
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Search</span>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Live Map</span>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Reserve</span>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Track Code</span>
              </div>
            </div>

            {/* Pharmacy Staff Actor */}
            <div
              onClick={() => setSelectedNodeId('node-pharmacy-staff')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-pharmacy-staff'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-pharmacy-staff')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-pharmacy-staff')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Pharmacy Staff</h3>
                    <span className="text-[10px] text-slate-500 block">Dispensary Operator</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                  Business
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Manage Stock</span>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Verify Pickup</span>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Price Sync</span>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Alerts</span>
              </div>
            </div>

            {/* Admin Actor */}
            <div
              onClick={() => setSelectedNodeId('node-admin')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-admin'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-admin')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-admin')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">System Admin</h3>
                    <span className="text-[10px] text-slate-500 block">Platform Governance</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                  Compliance
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Verify Store</span>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Users Audit</span>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Aggregations</span>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">Reports</span>
              </div>
            </div>
          </div>
        </section>

        {/* Downward Connection Indicator */}
        <div className="flex justify-center -my-2">
          <div className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center space-x-1">
            <span>HTTPS Client Requests</span>
            <ArrowRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Tier 2: Frontend Client Layer */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                2
              </span>
              <h2 className="font-bold text-sm text-slate-800 tracking-tight uppercase">Frontend Layer (React + Vite SPA)</h2>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] text-teal-700 font-bold">
              <span className="px-2 py-0.5 bg-teal-50 rounded border border-teal-200">React 18</span>
              <span className="px-2 py-0.5 bg-teal-50 rounded border border-teal-200">Vite 6</span>
              <span className="px-2 py-0.5 bg-teal-50 rounded border border-teal-200">Tailwind CSS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* React Core App & Contexts */}
            <div
              onClick={() => setSelectedNodeId('node-react')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-react'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-react')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-react')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <FileCode className="w-4 h-4 text-teal-600" />
                  <span>React UI & Contexts</span>
                </span>
                <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                  Auth & Location
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                App.jsx routes, ProtectedRoute, RoleRoute, AuthContext, LocationContext with Chennai default.
              </p>
            </div>

            {/* Leaflet Map Engine */}
            <div
              onClick={() => setSelectedNodeId('node-leaflet')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-leaflet'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-leaflet')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-leaflet')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Leaflet & OSM Tiles</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  No API Key
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                PharmacyMap.jsx with radius circle (2km-25km), tileerror recovery, two-way card sync, and Chennai center.
              </p>
            </div>

            {/* Centralized Axios Client */}
            <div
              onClick={() => setSelectedNodeId('node-axios')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-axios'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-axios')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-axios')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Axios API Client</span>
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  Bearer Interceptor
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Centralized api.js client attaching JWT tokens, handling 401 redirects, and standardizing JSON payloads.
              </p>
            </div>
          </div>
        </section>

        {/* Downward Connection Indicator */}
        <div className="flex justify-center -my-2">
          <div className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center space-x-1">
            <span>REST API / JSON Payloads</span>
            <ArrowRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Tier 3: Application & Gateway Layer */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                3
              </span>
              <h2 className="font-bold text-sm text-slate-800 tracking-tight uppercase">Application & API Gateway (Node.js + Express)</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Port: 5000 / Prefix: /api
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Express Router Gateway */}
            <div
              onClick={() => setSelectedNodeId('node-express')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-express'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-express')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-express')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Server className="w-4 h-4 text-teal-600" />
                  <span>Express.js REST Gateway</span>
                </span>
                <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                  Modular Routers
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Dispatches incoming requests through controllers: medicineController, reservationController, inventoryController, adminController.
              </p>
            </div>

            {/* JWT Auth Guard */}
            <div
              onClick={() => setSelectedNodeId('node-jwt')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-jwt'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-jwt')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-jwt')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>JWT & Role-Based Middleware</span>
                </span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  protect & authorize()
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Cryptographic signature validation with bcryptjs password hashing and role boundary verification.
              </p>
            </div>
          </div>
        </section>

        {/* Downward Connection Indicator */}
        <div className="flex justify-center -my-2">
          <div className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center space-x-1">
            <span>Domain Business Logic Execution</span>
            <ArrowRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Tier 4: Business Services Layer */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                4
              </span>
              <h2 className="font-bold text-sm text-slate-800 tracking-tight uppercase">Business Services Layer</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Domain Core Operations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Search Service */}
            <div
              onClick={() => setSelectedNodeId('node-search-svc')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-search-svc'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-search-svc')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-search-svc')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1.5">
                <Search className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-xs text-slate-900">Geospatial Search</h3>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                $geoNear aggregation with progressive radius fallback (2km to 25km) & emergency sorting.
              </p>
            </div>

            {/* Reservation Service */}
            <div
              onClick={() => setSelectedNodeId('node-reservation-svc')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-reservation-svc'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-reservation-svc')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-reservation-svc')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-xs text-slate-900">Reservation Lock</h3>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Single-step atomic inventory decrement preventing race conditions and overselling.
              </p>
            </div>

            {/* Inventory Sync Service */}
            <div
              onClick={() => setSelectedNodeId('node-inventory-svc')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-inventory-svc'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-inventory-svc')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-inventory-svc')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1.5">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-900">Inventory Sync</h3>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Catalog stock updates, pricing synchronization, and low-stock threshold audits.
              </p>
            </div>

            {/* Notification Dispatcher */}
            <div
              onClick={() => setSelectedNodeId('node-notif-svc')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-notif-svc'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-notif-svc')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-notif-svc')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1.5">
                <Bell className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-xs text-slate-900">Notifications</h3>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Dispatches lifecycle alerts on order creation, fulfillment, and pharmacy verification.
              </p>
            </div>

            {/* Admin Audit Service */}
            <div
              onClick={() => setSelectedNodeId('node-admin-svc')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-admin-svc'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-admin-svc')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-admin-svc')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs text-slate-900">Admin Audit</h3>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Dispensary license validation, user roles governance, and system revenue reporting.
              </p>
            </div>
          </div>
        </section>

        {/* Downward Connection Indicator */}
        <div className="flex justify-center -my-2">
          <div className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center space-x-1">
            <span>Mongoose ODM & Indexes</span>
            <ArrowRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Tier 5: Database & Indexing Layer */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-200">
                5
              </span>
              <h2 className="font-bold text-sm text-slate-800 tracking-tight uppercase">Database Layer (MongoDB + Indexes)</h2>
            </div>
            <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-800">
              <span className="px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">6 Collections</span>
              <span className="px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">2dsphere Index</span>
              <span className="px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">Compound Index</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* MongoDB Core Collections */}
            <div
              onClick={() => setSelectedNodeId('node-mongodb')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-mongodb'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-mongodb')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-mongodb')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>MongoDB Collections</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Schema
                </span>
              </div>
              <ul className="text-[10px] text-slate-600 space-y-1 mt-2">
                <li className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Users:</strong> Patients, Staff, Admin</span>
                </li>
                <li className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Pharmacies:</strong> Coordinates, Rating</span>
                </li>
                <li className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Medicines & Inventories:</strong> Stock</span>
                </li>
                <li className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Reservations & Notifications</strong></span>
                </li>
              </ul>
            </div>

            {/* 2dsphere Geospatial Index */}
            <div
              onClick={() => setSelectedNodeId('node-2dsphere')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-2dsphere'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-2dsphere')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-2dsphere')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>2dsphere Geospatial</span>
                </span>
                <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                  Index
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                location: "2dsphere"
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Enables $geoNear distance calculations across spherical coordinates without table scans.
              </p>
            </div>

            {/* Atomic Concurrency Mutex */}
            <div
              onClick={() => setSelectedNodeId('node-atomic')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-atomic'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-atomic')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-atomic')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Atomic Mutex</span>
                </span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  Lock-Free
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                stock: &#123; $gte: qty &#125;
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Guarantees zero overbooking with atomic decrement on single-document operations.
              </p>
            </div>

            {/* Compound Unique Index */}
            <div
              onClick={() => setSelectedNodeId('node-compound')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNodeId === 'node-compound'
                  ? 'border-teal-500 bg-teal-50/70 shadow-sm ring-2 ring-teal-400/30'
                  : isNodeCurrentlyActive('node-compound')
                  ? 'border-teal-400 bg-teal-50/50 shadow-md animate-pulse'
                  : isNodeInFlow('node-compound')
                  ? 'border-slate-300 bg-white hover:border-teal-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Compound Index</span>
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  Unique
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                pharmacyId + medicineId
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Enforces catalog uniqueness and provides fast O(log N) inventory lookups.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Selected Component Inspection Drawer / Detail Card */}
      <section className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-slate-800 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 block">
                Selected Component Inspection • {activeNodeDetails.layer}
              </span>
              <h3 className="text-lg font-bold text-white">
                {activeNodeDetails.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/30 flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{activeNodeDetails.status}</span>
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono border border-slate-700">
              {activeNodeDetails.tech}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-5">
          {/* Purpose & API */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">Architectural Role & Purpose:</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                {activeNodeDetails.purpose}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">API Endpoint / Protocol:</span>
              <div className="font-mono text-xs text-teal-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 break-all">
                {activeNodeDetails.api}
              </div>
            </div>
          </div>

          {/* Technical Responsibilities */}
          <div className="md:col-span-7">
            <span className="text-xs text-slate-400 font-semibold block mb-2">Technical Responsibilities & Guarantees:</span>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
              {activeNodeDetails.responsibilities.map((resp, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Architecture;
