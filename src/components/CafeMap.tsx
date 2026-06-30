import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapPin, Compass, Info, CheckCircle2, Sparkles, Filter, 
  ZoomIn, ZoomOut, Sliders, Layers, Navigation, Eye, Map, 
  ChevronRight, Car, Clock, Phone, Globe, Star
} from 'lucide-react';
import { Cafe } from '../types';
import L from 'leaflet';

// Ensure L is globally available for plugins that look for window.L
if (typeof window !== 'undefined') {
  (window as any).L = L;
}

// Dynamically import Leaflet plugins (required in browser runtime)
import 'leaflet.markercluster';
import 'leaflet.heat';

interface CafeMapProps {
  cafes: Cafe[];
  onSelectCafe: (id: string) => void;
}

export default function CafeMap({ cafes, onSelectCafe }: CafeMapProps) {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  
  // Interactive Controls State
  const [filterType, setFilterType] = useState<'all' | 'alpha' | 'beta' | 'benchmark'>('all');
  const [radiusKm, setRadiusKm] = useState<number>(15); // Slider value in km
  const [showRadiusCircle, setShowRadiusCircle] = useState<boolean>(true);
  const [enableHeatmap, setEnableHeatmap] = useState<boolean>(false);
  const [enableClustering, setEnableClustering] = useState<boolean>(true);
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // Map reference hooks
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  // Layer groups to manage addition/removal dynamically
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const clusterGroupRef = useRef<any | null>(null);
  const heatLayerRef = useRef<any | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Center coordinate of Chandigarh Sector 35 for Radius searches
  const CENTER_LAT = 30.7220;
  const CENTER_LNG = 76.7680;

  // Distance helper (Haversine formula approximation)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 1. Filtered cafes calculation
  const processedCafes = useMemo(() => {
    return cafes.filter(cafe => {
      // Category filter
      if (filterType === 'alpha' && cafe.growthOpportunityScore < 75) return false;
      if (filterType === 'beta' && (cafe.growthOpportunityScore < 55 || cafe.growthOpportunityScore >= 75)) return false;
      if (filterType === 'benchmark' && cafe.growthOpportunityScore >= 55) return false;

      // Distance radius filter from Sector 35
      if (showRadiusCircle) {
        const dist = calculateDistance(CENTER_LAT, CENTER_LNG, cafe.latitude, cafe.longitude);
        if (dist > radiusKm) return false;
      }

      return true;
    });
  }, [cafes, filterType, radiusKm, showRadiusCircle]);

  // Handle Marker Pin Click
  const handleMarkerClick = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    onSelectCafe(cafe.id);
    setShowDirections(true);

    if (mapRef.current) {
      mapRef.current.setView([cafe.latitude, cafe.longitude], 15, { animate: true });
    }
  };

  // 2. Initialize Map once on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered at Chandigarh
    const map = L.map(mapContainerRef.current, {
      center: [30.7333, 76.7794],
      zoom: 13,
      zoomControl: false,
      attributionControl: true
    });

    // Dark-themed tiles to match the futuristic app look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Initialize layer groups
    markersGroupRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Ask browser Geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords([latitude, longitude]);
        },
        (error) => {
          console.warn('Geolocation permission not granted or errored:', error);
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 3. Handle browser geolocation marker addition
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userCoords) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    const userIcon = L.divIcon({
      html: `
        <div class="relative w-4 h-4">
          <div class="absolute inset-0 rounded-full bg-[#4F8CFF] animate-ping opacity-75"></div>
          <div class="absolute inset-0.5 rounded-full bg-[#4F8CFF] border-2 border-white shadow-[0_0_10px_#4F8CFF]"></div>
        </div>
      `,
      className: 'user-location-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const marker = L.marker(userCoords, { icon: userIcon })
      .addTo(map)
      .bindTooltip('<div class="font-mono text-[9px] uppercase tracking-wider font-bold">Your Location</div>', { direction: 'top' });

    userMarkerRef.current = marker;
  }, [userCoords]);

  // 4. Update markers, circle, clustering, and heatmaps whenever states change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Reset standard markers group
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    // Clear and remove previous cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    // Clear and remove previous heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Clear and remove previous circle layer
    if (circleLayerRef.current) {
      map.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    // A. Draw Radius Circle if enabled
    if (showRadiusCircle) {
      const circle = L.circle([CENTER_LAT, CENTER_LNG], {
        radius: radiusKm * 1000, // converted to meters
        color: 'rgba(124, 92, 255, 0.4)',
        fillColor: 'rgba(124, 92, 255, 0.05)',
        fillOpacity: 0.1,
        weight: 1.5,
        dashArray: '5, 5'
      }).addTo(map);
      circleLayerRef.current = circle;
    }

    // B. Build Custom HTML Icons & Bind Marker Events
    const createMarker = (cafe: Cafe) => {
      const isSelected = selectedCafe?.id === cafe.id;
      
      let pinColor = '#32D583'; // Stable Benchmark
      let glowColor = 'rgba(50, 213, 131, 0.4)';
      let pulseRing = '';

      if (cafe.growthOpportunityScore >= 75) {
        pinColor = '#EF4444'; // Alpha Priority
        glowColor = 'rgba(239, 68, 68, 0.7)';
        pulseRing = `<span class="absolute w-7 h-7 rounded-full bg-[#EF4444]/20 animate-ping pointer-events-none"></span>`;
      } else if (cafe.growthOpportunityScore >= 55) {
        pinColor = '#F59E0B'; // Beta Growth
        glowColor = 'rgba(245, 158, 11, 0.5)';
        pulseRing = `<span class="absolute w-6 h-6 rounded-full bg-[#F59E0B]/15 animate-ping pointer-events-none"></span>`;
      }

      const htmlContent = `
        <div class="relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 z-[1000]' : ''}">
          ${pulseRing}
          <div 
            style="background-color: ${pinColor}; box-shadow: 0 0 10px ${glowColor};"
            class="w-3.5 h-3.5 rounded-full border border-black/80 transition-all duration-300 relative ${isSelected ? 'w-5 h-5 ring-4 ring-white/20' : 'hover:scale-125'}"
          >
            ${isSelected ? '<div class="absolute inset-1 rounded-full bg-white animate-pulse"></div>' : ''}
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        html: htmlContent,
        className: 'custom-cafe-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([cafe.latitude, cafe.longitude], { icon: markerIcon });

      // Custom Dark Futuristic Tooltip Layout
      const tooltipContent = `
        <div class="p-1.5 font-mono text-xs space-y-1">
          <h5 class="font-bold text-white leading-tight truncate text-[11px]">${cafe.name}</h5>
          <p class="text-[8px] text-white/40 uppercase tracking-widest font-extrabold">${cafe.category} • ${cafe.area}</p>
          <div class="grid grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-white/[0.06] text-[8px] uppercase tracking-widest font-extrabold">
            <div>
              <span class="text-white/40 block">Digital Presence</span>
              <span class="text-[#4F8CFF] font-bold block mt-0.5">${cafe.digitalPresenceScore}/100</span>
            </div>
            <div>
              <span class="text-white/40 block">Growth Opp</span>
              <span class="text-[#7C5CFF] font-bold block mt-0.5">${cafe.growthOpportunityScore}/100</span>
            </div>
          </div>
          <div class="pt-2 border-t border-white/[0.06] flex justify-between text-[8px] text-white/30 font-bold uppercase tracking-wider">
            <span>★ ${cafe.rating.toFixed(1)}</span>
            <span>${cafe.reviews} reviews</span>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        className: 'custom-tooltip-panel',
        offset: [0, -6],
        opacity: 0.98
      });

      marker.on('click', () => {
        handleMarkerClick(cafe);
      });

      return marker;
    };

    // C. Heatmap layer rendering
    if (enableHeatmap) {
      const heatPoints = processedCafes.map(cafe => [
        cafe.latitude,
        cafe.longitude,
        cafe.growthOpportunityScore / 100 // mapped to intensity 0-1
      ]);

      const heatLayer = (L as any).heatLayer(heatPoints, {
        radius: 35,
        blur: 20,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.3: 'rgba(79, 140, 255, 0.6)',
          0.6: 'rgba(245, 158, 11, 0.8)',
          1.0: 'rgba(239, 68, 68, 0.95)'
        }
      }).addTo(map);

      heatLayerRef.current = heatLayer;
    }

    // D. Clustering or standard markers rendering
    if (enableClustering && !enableHeatmap) {
      const clusterGroup = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        animate: true,
        maxClusterRadius: 40,
        iconCreateFunction: (cluster: any) => {
          const childCount = cluster.getChildCount();
          return L.divIcon({
            html: `
              <div class="w-8 h-8 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center relative shadow-lg">
                <span class="text-[10px] font-mono text-[#F59E0B] font-bold">${childCount}</span>
                <span class="absolute -inset-1 rounded-full border border-[#F59E0B]/20 animate-pulse" />
              </div>
            `,
            className: 'custom-cluster-icon',
            iconSize: [32, 32]
          });
        }
      });

      processedCafes.forEach(cafe => {
        const marker = createMarker(cafe);
        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
    } else {
      // Direct marker rendering if clustering is disabled
      processedCafes.forEach(cafe => {
        const marker = createMarker(cafe);
        if (markersGroupRef.current) {
          markersGroupRef.current.addLayer(marker);
        }
      });
    }

    // E. Auto fit bounds of active filtered cafes
    if (processedCafes.length > 0) {
      const latLngs = processedCafes.map(c => [c.latitude, c.longitude] as [number, number]);
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }

  }, [processedCafes, enableClustering, enableHeatmap, showRadiusCircle, radiusKm, selectedCafe]);

  // 5. Invalidate map size on window resizing or layout columns shifts
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 320); // slightly delayed to match CSS layout transitions

    return () => clearTimeout(timer);
  }, [selectedCafe, showDirections]);

  // Handle zooming controls manually
  const zoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const zoomOut = () => {
    mapRef.current?.zoomOut();
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.06] shadow-2xl animate-fadeIn relative space-y-6">
      
      {/* 1. Header Information Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/[0.05] pb-5">
        <div>
          <h3 className="font-serif italic text-xl text-white flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#4F8CFF] animate-spin" style={{ animationDuration: '30s' }} />
            Geographical Market Intelligence Grid
          </h3>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
            Real GIS telemetry mapping active cafe coordinates across Chandigarh & Mohali
          </p>
        </div>

        {/* Dynamic Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[9px] font-mono uppercase tracking-widest bg-[#141922]/50 border border-white/[0.06] px-4 py-2.5 rounded-xl shadow-md font-extrabold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block animate-pulse shadow-[0_0_8px_#EF4444]" />
            <span className="text-white/60">Alpha Focus (Opp ≥ 75)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block shadow-[0_0_8px_#F59E0B]" />
            <span className="text-white/40">Beta Focus (Opp 55-74)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#32D583] inline-block shadow-[0_0_8px_#32D583]" />
            <span className="text-white/30">Stable Benchmark</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive GIS Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-[#0E1117]/60 border border-white/[0.05] p-5 rounded-2xl">
        
        {/* Filters */}
        <div className="md:col-span-4 space-y-2.5">
          <label className="text-[8px] font-mono uppercase tracking-widest text-white/40 font-extrabold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#4F8CFF]" />
            Strategic Filter Vector
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['all', 'alpha', 'beta', 'benchmark'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 text-[9px] font-mono uppercase tracking-wider font-bold rounded-xl border transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-[#4F8CFF]/15 border-[#4F8CFF]/30 text-[#4F8CFF] shadow-inner'
                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] text-white/50'
                }`}
              >
                {type} Node
              </button>
            ))}
          </div>
        </div>

        {/* Radius Search Slider */}
        <div className="md:col-span-4 space-y-2.5">
          <div className="flex justify-between items-center">
            <label className="text-[8px] font-mono uppercase tracking-widest text-white/40 font-extrabold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#7C5CFF]" />
              Spatial Radius limits
            </label>
            <span className="text-[10px] font-mono text-[#7C5CFF] font-bold">
              {radiusKm} km
            </span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={radiusKm}
              onChange={e => setRadiusKm(parseInt(e.target.value))}
              className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#7C5CFF]"
            />
            <div className="flex items-center justify-between text-[8px] font-mono text-white/30 uppercase font-bold">
              <span>Center: Sector 35 Hub</span>
              <button 
                onClick={() => setShowRadiusCircle(!showRadiusCircle)}
                className={`hover:text-white transition-colors flex items-center gap-1 cursor-pointer ${showRadiusCircle ? 'text-[#7C5CFF] font-bold' : ''}`}
              >
                <Eye className="w-3 h-3" />
                Radius overlay
              </button>
            </div>
          </div>
        </div>

        {/* Heatmap & Clustering Layer Toggles */}
        <div className="md:col-span-4 space-y-2.5">
          <label className="text-[8px] font-mono uppercase tracking-widest text-white/40 font-extrabold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#32D583]" />
            GIS Display Layers
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setEnableHeatmap(!enableHeatmap);
                if (enableClustering) setEnableClustering(false);
              }}
              className={`px-3 py-2 text-[9px] font-mono uppercase tracking-wider font-bold rounded-xl border transition-all cursor-pointer ${
                enableHeatmap
                  ? 'bg-[#32D583]/15 border-[#32D583]/30 text-[#32D583] shadow-inner'
                  : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] text-white/50'
              }`}
            >
              Heatmap Layer
            </button>
            <button
              onClick={() => {
                setEnableClustering(!enableClustering);
                if (enableHeatmap) setEnableHeatmap(false);
              }}
              className={`px-3 py-2 text-[9px] font-mono uppercase tracking-wider font-bold rounded-xl border transition-all cursor-pointer ${
                enableClustering
                  ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B] shadow-inner'
                  : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] text-white/50'
              }`}
            >
              Pin Clustering
            </button>
          </div>
        </div>

      </div>

      {/* 3. Main Stage Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Map Stage Canvas */}
        <div className={`relative w-full h-[700px] lg:h-[80vh] overflow-hidden rounded-2xl bg-[#050505] border border-white/[0.06] shadow-inner transition-all duration-500 ${selectedCafe && showDirections ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          
          {/* Real Leaflet Map Container Mount Point */}
          <div className="w-full h-full flex-1 relative">
            <div
              ref={mapContainerRef}
              className="w-full h-full"
              style={{
                width: "100%",
                height: "100%"
              }}
            />
          </div>

          {/* Map Zoom Controls */}
          <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 z-20">
            <button
              onClick={zoomIn}
              className="p-2 bg-[#0E1117]/90 border border-white/[0.08] text-white hover:text-[#4F8CFF] hover:border-[#4F8CFF]/20 rounded-lg shadow-xl cursor-pointer transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 bg-[#0E1117]/90 border border-white/[0.08] text-white hover:text-[#4F8CFF] hover:border-[#4F8CFF]/20 rounded-lg shadow-xl cursor-pointer transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 4. Side drawer: Business Photo and Directions Simulator */}
        {selectedCafe && showDirections && (
          <div className="lg:col-span-4 glass-panel rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden flex flex-col justify-between animate-slideLeft">
            
            {/* Header / Cover Photo */}
            <div className="relative h-44 bg-[#0E1117]/90 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.4),transparent_70%)] animate-pulse" />
              
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-20">
                <button 
                  onClick={() => setShowDirections(false)}
                  className="self-end p-1.5 bg-black/60 hover:bg-black text-white rounded-lg text-[9px] font-mono border border-white/10 uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close Profile
                </button>
                
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-widest bg-[#4F8CFF]/15 border border-[#4F8CFF]/20 text-[#4F8CFF] px-2.5 py-0.5 rounded-full font-bold">
                    {selectedCafe.category}
                  </span>
                  <h4 className="text-base font-serif italic text-white mt-1.5 leading-snug">
                    {selectedCafe.name}
                  </h4>
                </div>
              </div>

              <div className="w-full h-full bg-[#10141D] flex items-center justify-center text-white/5 font-serif text-6xl tracking-widest">
                COFFEE
              </div>
            </div>

            {/* Stats and Digital Presence Score */}
            <div className="p-4 space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#141922]/40 border border-white/[0.04] p-2.5 rounded-xl">
                  <span className="block text-[7px] font-mono text-white/30 uppercase">Rating</span>
                  <span className="text-xs font-mono font-bold text-[#F59E0B] flex items-center justify-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    {selectedCafe.rating}
                  </span>
                </div>
                <div className="bg-[#141922]/40 border border-white/[0.04] p-2.5 rounded-xl">
                  <span className="block text-[7px] font-mono text-white/30 uppercase">Reviews</span>
                  <span className="text-xs font-mono font-extrabold text-white block mt-0.5">
                    {selectedCafe.reviews}
                  </span>
                </div>
                <div className="bg-[#141922]/40 border border-white/[0.04] p-2.5 rounded-xl">
                  <span className="block text-[7px] font-mono text-white/30 uppercase">Opp Score</span>
                  <span className="text-xs font-mono font-bold text-[#7C5CFF] block mt-0.5">
                    {selectedCafe.growthOpportunityScore}
                  </span>
                </div>
              </div>

              {/* Driving Directions Simulator Section */}
              <div className="border border-white/[0.05] bg-[#0A0D14]/80 p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 text-[9px] font-mono uppercase tracking-widest text-white/40 font-extrabold">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#32D583]" />
                    Directions Telemetry
                  </span>
                  <span className="text-[#32D583]">CHANDIGARH SECTOR 35 CENTER</span>
                </div>

                <div className="flex justify-between text-xs font-mono text-white/80">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-white/30" />
                    <span>Jan Marg / Sector 35 Rd</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#32D583]" />5 mins</span>
                    <span>•</span>
                    <span>1.8 km</span>
                  </div>
                </div>

                {/* Simulated Steps */}
                <div className="space-y-1.5 text-[10px] text-white/50 font-mono border-t border-white/[0.04] pt-2.5">
                  <div className="flex gap-2 items-start">
                    <ChevronRight className="w-3.5 h-3.5 text-[#32D583] mt-0.5 flex-shrink-0" />
                    <span>Head West towards Jan Marg / Himalaya Marg. (600m)</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <ChevronRight className="w-3.5 h-3.5 text-[#32D583] mt-0.5 flex-shrink-0" />
                    <span>Turn left onto Sector 35 Inner Circle. (400m)</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <ChevronRight className="w-3.5 h-3.5 text-[#32D583] mt-0.5 flex-shrink-0" />
                    <span>Destination will be on your left. (800m)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile footer action links */}
            <div className="p-4 bg-[#141922]/20 border-t border-white/[0.05] flex gap-2">
              <button 
                onClick={() => onSelectCafe(selectedCafe.id)}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white hover:opacity-95 text-[10px] font-mono uppercase tracking-widest font-extrabold rounded-xl transition-all cursor-pointer shadow-lg text-center"
              >
                Deep-Dive Profile
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 5. Informational Alert Tip */}
      <div className="bg-[#141922]/25 border border-white/[0.06] p-4 rounded-xl text-[10px] font-mono text-white/40 flex gap-2.5 items-center shadow-inner">
        <Info className="w-4 h-4 text-[#4F8CFF] flex-shrink-0" />
        <p className="leading-relaxed">
          <span className="font-bold text-[#4F8CFF] uppercase tracking-widest mr-1">GIS Intelligence Guidance:</span> Map is powered by real OpenStreetMap and custom canvas overlays. Toggle display layers to run real-time canvas heatmaps or group markers into clustered geographic zones. Center of search radius is anchored to Sector 35, Chandigarh. Click any marker to center the viewport and view detailed directions telemetry.
        </p>
      </div>

    </div>
  );
}
