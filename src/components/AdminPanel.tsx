import React, { useState, useEffect } from 'react';
import {
  Save,
  Trash2,
  X,
  AlertTriangle,
  Info,
  Building,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { Cafe } from '../types';
import { api } from '../utils/api';

interface AdminPanelProps {
  editCafe: Cafe | null; // If present, we are in Edit mode, else Add mode
  onClose: () => void;
  onRefresh: () => void;
}

export default function AdminPanel({ editCafe, onClose, onRefresh }: AdminPanelProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Coffee Shop');
  const [rating, setRating] = useState('4.2');
  const [reviews, setReviews] = useState('150');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Chandigarh');
  const [website, setWebsite] = useState('N');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('9:00 AM - 11:00 PM');
  const [latitude, setLatitude] = useState('30.7333');
  const [longitude, setLongitude] = useState('76.7794');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hydrate form in edit mode
  useEffect(() => {
    if (editCafe) {
      setName(editCafe.name);
      setCategory(editCafe.category);
      setRating(String(editCafe.rating));
      setReviews(String(editCafe.reviews));
      setAddress(editCafe.address);
      setArea(editCafe.area);
      setCity(editCafe.city);
      setWebsite(editCafe.website);
      setPhone(editCafe.phone);
      setHours(editCafe.hours);
      setLatitude(String(editCafe.latitude));
      setLongitude(String(editCafe.longitude));
    } else {
      // Reset form
      setName('');
      setCategory('Coffee Shop');
      setRating('4.2');
      setReviews('150');
      setAddress('');
      setArea('');
      setCity('Chandigarh');
      setWebsite('N');
      setPhone('');
      setHours('9:00 AM - 11:00 PM');
      setLatitude('30.7333');
      setLongitude('76.7794');
    }
    setError('');
    setSuccess('');
  }, [editCafe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Form validation
    const parsedRating = parseFloat(rating);
    const parsedReviews = parseInt(reviews, 10);
    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    if (!name.trim() || !address.trim() || !area.trim()) {
      setError('Name, Address, and Area are required fields.');
      setLoading(false);
      return;
    }

    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      setError('Rating must be a numerical value between 0.0 and 5.0.');
      setLoading(false);
      return;
    }

    if (isNaN(parsedReviews) || parsedReviews < 0) {
      setError('Review count must be a non-negative integer.');
      setLoading(false);
      return;
    }

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setError('Latitude and Longitude coordinates must be numerical float values.');
      setLoading(false);
      return;
    }

    const payload = {
      name,
      category,
      rating: parsedRating,
      reviews: parsedReviews,
      address,
      area,
      city,
      website: website as 'Y' | 'N',
      phone,
      hours,
      latitude: parsedLat,
      longitude: parsedLng,
    };

    try {
      if (editCafe) {
        // Edit mode
        await api.updateCafe(editCafe.id, payload);
        setSuccess('Business record successfully modified!');
      } else {
        // Add mode
        await api.createCafe(payload);
        setSuccess('New business record successfully created!');
      }
      onRefresh();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred committing the database transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editCafe) return;
    if (!window.confirm('WARNING: Are you absolutely sure you want to delete this business record? This action is irreversible.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.deleteCafe(editCafe.id);
      setSuccess('Business record successfully purged.');
      onRefresh();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Purging transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel border-l border-white/[0.06] w-full lg:w-[480px] h-full flex flex-col shadow-2xl relative z-20 animate-slideLeft">
      
      {/* Sticky Header */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-[#0E1117]/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7C5CFF] bg-[#7C5CFF]/10 px-2.5 py-1 rounded-full border border-[#7C5CFF]/20">
            Admin Console
          </span>
          <h3 className="font-serif italic text-base text-white mt-2 leading-tight">
            {editCafe ? `Edit ${editCafe.name}` : 'Register New Business'}
          </h3>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/[0.04] text-white/40 hover:text-white rounded-xl cursor-pointer transition-colors duration-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {error && (
          <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs rounded-xl flex gap-2.5 items-start font-mono shadow-md">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-normal">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-[#32D583]/10 border border-[#32D583]/20 text-[#32D583] text-xs rounded-xl flex gap-2.5 items-start font-mono shadow-md">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-normal">{success}</p>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
            Business Title Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. The Brew House"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
          />
        </div>

        {/* Category & City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Category Format
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white/60 focus:outline-none transition-all duration-300 font-mono cursor-pointer"
            >
              <option value="Coffee Shop">Coffee Shop</option>
              <option value="Bistro">Bistro</option>
              <option value="Bakery Cafe">Bakery Cafe</option>
              <option value="Book Cafe">Book Cafe</option>
              <option value="Dessert Cafe">Dessert Cafe</option>
              <option value="Traditional Cafe">Traditional Cafe</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Urban City
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white/60 focus:outline-none transition-all duration-300 font-mono cursor-pointer"
            >
              <option value="Chandigarh">Chandigarh</option>
              <option value="Mohali">Mohali</option>
            </select>
          </div>
        </div>

        {/* Rating & Reviews */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Google Maps Rating
            </label>
            <input
              type="number"
              step="0.1"
              required
              min="0"
              max="5"
              placeholder="e.g. 4.4"
              value={rating}
              onChange={e => setRating(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Total Reviews Count
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 850"
              value={reviews}
              onChange={e => setReviews(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
            GMB Address
          </label>
          <input
            type="text"
            required
            placeholder="SCO 14, Sector 35C"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
          />
        </div>

        {/* Area & Website */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Area Sector/Phase
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sector 35"
              value={area}
              onChange={e => setArea(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Active Website?
            </label>
            <select
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white/60 focus:outline-none transition-all duration-300 font-mono cursor-pointer"
            >
              <option value="Y">Yes (Active Domain)</option>
              <option value="N">No (Missing Website)</option>
            </select>
          </div>
        </div>

        {/* Phone & Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Contact Phone (Optional)
            </label>
            <input
              type="text"
              placeholder="+91 172 501 2233"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Business Hours (Optional)
            </label>
            <input
              type="text"
              placeholder="9:00 AM - 11:00 PM"
              value={hours}
              onChange={e => setHours(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
            />
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Latitude Coord
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 30.7333"
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
              Longitude Coord
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 76.7794"
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0E1117]/80 border border-white/[0.06] focus:border-[#4F8CFF]/50 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-mono"
            />
          </div>
        </div>

        <div className="bg-[#141922]/30 p-4 border border-white/[0.04] rounded-xl text-[10px] font-mono text-white/40 flex gap-2.5 shadow-inner">
          <Info className="w-4 h-4 text-[#4F8CFF] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Digital Presence and Growth Opportunity scores are derived using a robust multi-criteria heuristic scoring model over the provided business profile telemetry.
          </p>
        </div>

        {/* Sticky Action Footer */}
        <div className="pt-5 border-t border-white/[0.06] flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white font-mono font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 border-t border-white/10 hover:opacity-95"
          >
            <Save className="w-4 h-4" />
            {editCafe ? 'Commit Changes' : 'Publish Business'}
          </button>
          
          {editCafe && (
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="p-3 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20 rounded-xl cursor-pointer transition-all duration-300"
              title="Delete Cafe"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
