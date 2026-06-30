import { useState, useMemo } from 'react';
import { 
  MapPin, Compass, Info, CheckCircle2, Sparkles, Filter, 
  ZoomIn, ZoomOut, Sliders, Layers, Navigation, Eye, Map, 
  ChevronRight, Car, Clock, Phone, Globe, Star
} from 'lucide-react';
import { Cafe } from '../types';

interface CafeMapProps {
  cafes: Cafe[];
  onSelectCafe: (id: string) => void;
}

export default function CafeMap({ cafes, onSelectCafe }: CafeMapProps) {
  const [hoveredCafe, setHoveredCafe] = useState<Cafe | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  
  // Interactive Controls State
  const [mapZoom, setMapZoom] = useState<number>(1); // zoom level multiplier
  const [filterType, setFilterType] = useState<'all' | 'alpha' | 'beta' | 'benchmark'>('all');
  const [radiusCenter, setRadiusCenter] = useState<string>('Sector 35, Chandigarh');
  const [radiusKm, setRadiusKm] = useState<number>(20); // Slider value (1km to 5km)
  const [showRadiusCircle, setShowRadiusCircle] = useState<boolean>(true);
  const [enableHeatmap, setEnableHeatmap] = useState<boolean>(false);
  const [enableClustering, setEnableClustering] = useState<boolean>(false);
  const [showDirections, setShowDirections] = useState<boolean>(false);

  // Geographic coordinates boundaries for Chandigarh & Mohali region
  const MIN_LAT = 30.660;
const MAX_LAT = 30.770;

const MIN_LNG = 76.700;
const MAX_LNG = 76.810;

  // Center coordinate of Chandigarh Sector 35 for Radius searches
  const CENTER_LAT = 30.7220;
  const CENTER_LNG = 76.7680;

  // Map latitude & longitude coordinates to visual percentage values, with zoom adjustment
  const getCoordinates = (lat: number, lng: number) => {
    // x represents longitude mapped left-to-right (0 to 100)
    let x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    // y represents latitude mapped top-to-bottom (100 to 0)
    let y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
    
    // Apply simulated zoom scaling relative to center (50%)
   x = 50 + (x - 50) * mapZoom;
   y = 50 + (y - 50) * mapZoom;

   return {
   x: Math.max(3, Math.min(x, 97)),
   y: Math.max(3, Math.min(y, 97))
   }
  };

  // Distance helper (Haversine formula approximation)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filtered and clustered cafes
  const processedCafes = useMemo(() => {
    return cafes.filter(cafe => {
      // 1. Filter by category type
      if (filterType === 'alpha' && cafe.growthOpportunityScore < 75) return false;
      if (filterType === 'beta' && (cafe.growthOpportunityScore < 55 || cafe.growthOpportunityScore >= 75)) return false;
      if (filterType === 'benchmark' && cafe.growthOpportunityScore >= 55) return false;

      // 2. Filter by radius from Center (Sector 35)
      const dist = calculateDistance(CENTER_LAT, CENTER_LNG, cafe.latitude, cafe.longitude);
      //if (dist > radiusKm) return false;

      return true;
    });
  }, [cafes, filterType, radiusKm, ]);

  // Handle Marker Pin Click
  const handleMarkerClick = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    onSelectCafe(cafe.id);
    setShowDirections(true);
  };

  // Center Coordinates mapping
  const centerCoords = getCoordinates(CENTER_LAT, CENTER_LNG);

  // Simulated Clustering visualization calculation
  const clusters = useMemo(() => {
    if (!enableClustering) return [];
    // Divide map area into 4 quadrants and average their spots
    const quadrantDefinitions = [
      { name: 'Chandigarh North', minX: 0, maxX: 50, minY: 0, maxY: 50 },
      { name: 'Chandigarh South', minX: 50, maxX: 100, minY: 0, maxY: 50 },
      { name: 'Mohali West', minX: 0, maxX: 50, minY: 50, maxY: 100 },
      { name: 'Mohali East', minX: 50, maxX: 100, minY: 50, maxY: 100 },
    ];

    return quadrantDefinitions.map(quad => {
      const itemsInQuad = processedCafes.filter(c => {
        const coords = getCoordinates(c.latitude, c.longitude);
        return coords.x >= quad.minX && coords.x < quad.maxX && coords.y >= quad.minY && coords.y < quad.maxY;
      });

      if (itemsInQuad.length === 0) return null;

      // Find average lat/lng for cluster center
      const avgLat = itemsInQuad.reduce((sum, item) => sum + item.latitude, 0) / itemsInQuad.length;
      const avgLng = itemsInQuad.reduce((sum, item) => sum + item.longitude, 0) / itemsInQuad.length;
      const avgOpp = Math.round(itemsInQuad.reduce((sum, item) => sum + item.growthOpportunityScore, 0) / itemsInQuad.length);

      return {
        id: `cluster_${quad.name.replace(/\s+/g, '_')}`,
        name: quad.name,
        count: itemsInQuad.length,
        latitude: avgLat,
        longitude: avgLng,
        avgOpportunity: avgOpp
      };
    }).filter(Boolean);

  }, [processedCafes, enableClustering, mapZoom]);

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
            Chandigarh & Mohali coordinate distribution plot mapping opportunities
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
              max="6"
              step="0.5"
              value={radiusKm}
              onChange={e => setRadiusKm(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#7C5CFF]"
            />
            <div className="flex items-center justify-between text-[8px] font-mono text-white/30 uppercase">
              <span>Center: Sector 35 Hub</span>
              <button 
                onClick={() => setShowRadiusCircle(!showRadiusCircle)}
                className={`hover:text-white transition-colors flex items-center gap-1 ${showRadiusCircle ? 'text-[#7C5CFF] font-bold' : ''}`}
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
        <div className={`relative bg-[#050505] border border-white/[0.06] rounded-2xl overflow-hidden shadow-inner transition-all duration-500 min-h-[700px] w-full lg:col-span-${selectedCafe && showDirections ? '8' : '12'}`}>
          
          {/* Simulated Heatmap glow layer */}
          {enableHeatmap && (
            <div className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-50">
              {processedCafes.map(cafe => {
                const { x, y } = getCoordinates(cafe.latitude, cafe.longitude);
                return (
                  <div
                    key={`heat_${cafe.id}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.25)_0%,rgba(124,92,255,0.08)_40%,transparent_70%)] animate-pulse"
                  />
                );
              })}
            </div>
          )}

          {/* SVG Grid Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0">
            <defs>
              <pattern id="gisPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gisPattern)" />
            
            {/* Sector Guidelines */}
            <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="rgba(255,255,255,0.08)" strokeDasharray="5,5" strokeWidth="1.5" />
            <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" strokeWidth="1" />
          </svg>

          {/* Radius circles overlay around Sector 35 */}
          {showRadiusCircle && (
            <div 
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none border border-[#7C5CFF]/20 rounded-full bg-[#7C5CFF]/2 z-0 flex items-center justify-center animate-pulse"
              style={{
                left: `${centerCoords.x}%`,
                top: `${centerCoords.y}%`,
                width: `${radiusKm * 120 * mapZoom}px`,
                height: `${radiusKm * 120 * mapZoom}px`,
                animationDuration: '6s'
              }}
            >
              <span className="text-[7px] font-mono text-[#7C5CFF] uppercase font-bold tracking-widest absolute top-2">Radius limit: {radiusKm}km</span>
              {/* Radius Center Marker */}
              <div className="w-2 h-2 rounded-full bg-[#7C5CFF] shadow-[0_0_10px_#7C5CFF]" />
            </div>
          )}

          {/* Region Label Indicators */}
          <div className="absolute top-4 left-6 pointer-events-none font-mono text-left z-10 select-none">
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">CHANDIGARH SECTORS 14/15</p>
            <p className="text-[7px] text-white/15 italic">Educational / PU Precinct</p>
          </div>

          <div className="absolute top-4 right-6 pointer-events-none font-mono text-right z-10 select-none">
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">CHANDIGARH SECTORS 7/26</p>
            <p className="text-[7px] text-white/15 italic">Culinary Benchmark Core</p>
          </div>

          <div className="absolute bottom-4 left-6 pointer-events-none font-mono text-left z-10 select-none">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">MOHALI COMMERCIAL HUBS</p>
            <p className="text-[7px] text-white/10 italic">Phases 3B2 / 5 / 7</p>
          </div>

          {/* Map Zoom Controls */}
          <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 z-20">
            <button
              onClick={() => setMapZoom(prev => Math.min(prev + 0.2, 3.0))}
              className="p-2 bg-[#0E1117]/90 border border-white/[0.08] text-white hover:text-[#4F8CFF] hover:border-[#4F8CFF]/20 rounded-lg shadow-xl cursor-pointer transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapZoom(prev => Math.max(prev - 0.2, 0.6))}
              className="p-2 bg-[#0E1117]/90 border border-white/[0.08] text-white hover:text-[#4F8CFF] hover:border-[#4F8CFF]/20 rounded-lg shadow-xl cursor-pointer transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* ACTIVE NODES */}
          <div className="absolute inset-0 z-10 w-full h-full">
            
            {/* RENDER CLUSTERS */}
            {enableClustering ? (
              clusters.map((cl: any) => {
                if (!cl) return null;
                const { x, y } = getCoordinates(cl.latitude, cl.longitude);
                return (
                  <div
                    key={cl.id}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-15 flex flex-col items-center justify-center cursor-pointer animate-fadeIn"
                    onClick={() => {
                      // Zoom in slightly on cluster click
                      setMapZoom(prev => Math.min(prev + 0.3, 2.5));
                      setEnableClustering(false);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center relative shadow-lg group hover:scale-110 duration-300">
                      <span className="text-[10px] font-mono text-[#F59E0B] font-bold">{cl.count}</span>
                      <span className="absolute -inset-1 rounded-full border border-[#F59E0B]/20 animate-pulse" />
                    </div>
                    <span className="text-[6px] font-mono uppercase bg-black/60 px-1 py-0.2 rounded mt-1 border border-white/5 text-white/50">{cl.name}</span>
                  </div>
                );
              })
            ) : (
              // RENDER SINGLE PLOTS
              processedCafes.map(cafe => {
                const { x, y } = getCoordinates(cafe.latitude, cafe.longitude);
                const isHovered = hoveredCafe?.id === cafe.id;
                const isSelected = selectedCafe?.id === cafe.id;

                return (
                  <div
                    key={cafe.id}
                    style={{
                     left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)"
                       }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
                    onMouseEnter={() => setHoveredCafe(cafe)}
                    onMouseLeave={() => setHoveredCafe(null)}
                    onClick={() => handleMarkerClick(cafe)}
                  >
                    {/* Ring indicator for target opportunity priorities */}
                    {cafe.growthOpportunityScore >= 75 ? (
                      <span className="absolute -inset-3.5 rounded-full bg-[#EF4444]/15 animate-ping pointer-events-none" />
                    ) : cafe.growthOpportunityScore >= 55 ? (
                      <span className="absolute -inset-3 rounded-full bg-[#F59E0B]/10 animate-ping pointer-events-none" />
                    ) : null}

                    {/* Interactive Pin Circle */}
                    <div className={`rounded-full border border-black/90 transition-all duration-300 shadow-xl relative ${
                      isHovered || isSelected ? 'w-5 h-5 ring-4 ring-white/10 z-35 scale-125' : 'w-3.5 h-3.5'
                    } ${
                      cafe.growthOpportunityScore >= 75 ? 'bg-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.7)]' :
                      cafe.growthOpportunityScore >= 55 ? 'bg-[#F59E0B] shadow-[0_0_9px_rgba(245,158,11,0.5)]' : 
                      'bg-[#32D583] shadow-[0_0_6px_rgba(50,213,131,0.4)]'
                    }`}>
                      {/* Innermost pulsing light */}
                      {(isHovered || isSelected) && (
                        <div className="absolute inset-1 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Hover tooltip anchor */}
          {hoveredCafe && !enableClustering && (
            <div
              style={{
                left: `${Math.min(getCoordinates(hoveredCafe.latitude, hoveredCafe.longitude).x, 75)}%`,
                top: `${Math.min(getCoordinates(hoveredCafe.latitude, hoveredCafe.longitude).y, 55)}%`
              }}
              className="absolute z-40 pointer-events-none bg-[#0E1117]/95 backdrop-blur-md border border-white/[0.08] p-4.5 rounded-2xl shadow-2xl w-64 translate-x-4 translate-y-4 transition-all duration-300 font-mono text-xs animate-fadeIn"
            >
              <h5 className="text-xs font-bold text-white truncate leading-tight">{hoveredCafe.name}</h5>
              <p className="text-[8px] text-white/40 mt-1 uppercase tracking-widest font-extrabold">{hoveredCafe.category} • {hoveredCafe.area}</p>
              
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.06] text-[8px] tracking-widest uppercase font-extrabold">
                <div>
                  <span className="text-white/40 block">Digital score</span>
                  <span className="text-[10px] font-bold text-[#4F8CFF] block mt-0.5">{hoveredCafe.digitalPresenceScore}/100</span>
                </div>
                <div>
                  <span className="text-white/40 block">Opportunity</span>
                  <span className="text-[10px] font-bold text-[#7C5CFF] block mt-0.5">{hoveredCafe.growthOpportunityScore}/100</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[8px] text-white/30 font-bold uppercase tracking-wider">
                <span>★ {hoveredCafe.rating.toFixed(1)}</span>
                <span>Reviews: {hoveredCafe.reviews.toLocaleString()}</span>
              </div>
            </div>
          )}

        </div>

        {/* 4. Side drawer: Business Photo and Directions Simulator */}
        {selectedCafe && showDirections && (
          <div className="lg:col-span-4 glass-panel rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden flex flex-col justify-between animate-slideLeft">
            
            {/* Header / Cover Photo */}
            <div className="relative h-44 bg-[#0E1117]/90 overflow-hidden flex items-center justify-center">
              {/* Premium dark pattern / abstract coffee illustration as business cover photo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.4),transparent_70%)] animate-pulse" />
              
              {/* Simulated high-quality cafe image representation */}
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
          <span className="font-bold text-[#4F8CFF] uppercase tracking-widest mr-1">GIS Intelligence Guidance:</span> Toggle display layers to run real-time heatmap densities or group markers into clustered geographic zones. Center of search radius is anchored to Sector 35. Click any individual marker pin to load its full telemetry coordinates, driving steps, and digital checklists.
        </p>
      </div>

    </div>
  );
}
