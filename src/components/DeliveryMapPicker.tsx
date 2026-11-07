import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { DeliveryAddress } from '../types.ts';

interface DeliveryMapPickerProps {
  initialAddress?: DeliveryAddress | null;
  onConfirmAddress: (address: DeliveryAddress) => void;
  onCancel?: () => void;
}

// Fix default Leaflet icon paths in Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const DeliveryMapPicker: React.FC<DeliveryMapPickerProps> = ({
  initialAddress,
  onConfirmAddress,
  onCancel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default coordinate: Karnataka Kirana location default (Hubballi-Dharwad / Bangalore belt: ~15.3647, 75.1240)
  const [lat, setLat] = useState<number>(initialAddress?.latitude || 15.3647);
  const [lng, setLng] = useState<number>(initialAddress?.longitude || 75.1240);

  const [houseNo, setHouseNo] = useState(initialAddress?.houseNo || '');
  const [street, setStreet] = useState(initialAddress?.street || '');
  const [landmark, setLandmark] = useState(initialAddress?.landmark || '');
  const [villageOrCity, setVillageOrCity] = useState(initialAddress?.villageOrCity || '');
  const [pincode, setPincode] = useState(initialAddress?.pincode || '');

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: defaultIcon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setLat(position.lat);
      setLng(position.lng);
      fetchReverseGeocode(position.lat, position.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
      fetchReverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Invalidate map size after animation/render
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Reverse Geocode using Nominatim
  const fetchReverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setReverseGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        if (addr.road || addr.suburb || addr.neighbourhood) {
          setStreet(addr.road || addr.suburb || addr.neighbourhood || '');
        }
        if (addr.village || addr.town || addr.city || addr.county) {
          setVillageOrCity(addr.village || addr.town || addr.city || addr.county || '');
        }
        if (addr.postcode) {
          setPincode(addr.postcode);
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding unavailable, manual entry active', e);
    } finally {
      setReverseGeocoding(false);
    }
  };

  // Request Live GPS Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setPermissionGranted(true);
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
          markerRef.current.setLatLng([latitude, longitude]);
        }

        fetchReverseGeocode(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Could not retrieve GPS location. Please pinpoint your house on the map or enter address manually.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can still drag the pin or enter your address manually.';
        }
        setLocationError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) {
      alert('Please enter your Street / Area name.');
      return;
    }
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      alert('Please enter a valid 6-digit PIN code.');
      return;
    }

    const formattedAddress = [
      houseNo.trim(),
      street.trim(),
      landmark.trim() ? `Near ${landmark.trim()}` : '',
      villageOrCity.trim(),
      pincode.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    const address: DeliveryAddress = {
      houseNo: houseNo.trim(),
      street: street.trim(),
      landmark: landmark.trim(),
      villageOrCity: villageOrCity.trim() || 'Local Area',
      pincode: pincode.trim(),
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      formattedAddress,
    };

    onConfirmAddress(address);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-w-2xl w-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Set Grocery Delivery Location
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pin-drop your home so our delivery partner reaches your doorstep quickly
          </p>
        </div>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-60"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Locating...' : 'Use My GPS'}
        </button>
      </div>

      {locationError && (
        <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{locationError}</span>
        </div>
      )}

      {permissionGranted && (
        <div className="mx-4 mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Live GPS coordinates acquired. Drag the pin to adjust your exact entrance.</span>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div className="relative w-full h-56 sm:h-64 bg-slate-100 border-b border-slate-200">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-700 shadow-sm border border-slate-200">
          GPS: {lat.toFixed(5)}, {lng.toFixed(5)} {reverseGeocoding && '· Fetching address...'}
        </div>
      </div>

      {/* Address Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              House / Flat / Building No. *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. House #14, 2nd Cross"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Street / Road / Colony *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Main Bazaar Road, Gandhi Nagar"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nearby Landmark (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Behind Chodeshwari Temple, Near Govt School"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Village / Town / City *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Local Town / Ward"
              value={villageOrCity}
              onChange={(e) => setVillageOrCity(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Postal PIN Code (6 digits) *
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 580020"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="w-full sm:w-1/2 px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            Confirm Delivery Address
          </button>
        </div>
      </form>
    </div>
  );
};
