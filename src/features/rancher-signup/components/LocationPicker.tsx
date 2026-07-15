import { useState, useCallback, useEffect } from 'react';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';
import { MapView } from '@/app/components/MapView';

interface LocationPickerProps {
  value: {
    latitude?: string;
    longitude?: string;
    department?: string;
    city?: string;
  };
  onChange: (location: {
    latitude: string;
    longitude: string;
    department?: string;
    city?: string;
  }) => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    state?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const hasLocation = Boolean(value.latitude && value.longitude);

  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ', Paraguay'
        )}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocation]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      onChange({
        latitude: lat.toString(),
        longitude: lng.toString(),
        department: data.address?.state || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      onChange({
        latitude: lat.toString(),
        longitude: lng.toString(),
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [onChange]);

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    onChange({
      latitude: result.lat,
      longitude: result.lon,
      department: result.address?.state || '',
      city: result.address?.city || result.address?.town || result.address?.village || '',
    });
    
    setSearchQuery(result.display_name);
    setShowResults(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    reverseGeocode(lat, lng);
  };

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en tu navegador');
      return;
    }

    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos de geolocalización.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Buscar ubicación..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126]"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          )}
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {result.display_name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isGettingLocation}
          className="px-4 py-3 bg-[#1E5126] text-white rounded-lg hover:bg-[#1E5126]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGettingLocation ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">Mi ubicación</span>
        </button>
      </div>

      <div className="relative">
        <MapView
          markers={
            hasLocation
              ? [
                  {
                    id: 'establishment',
                    lat: parseFloat(value.latitude!),
                    lng: parseFloat(value.longitude!),
                    type: 'default',
                    label: 'Establecimiento',
                  },
                ]
              : []
          }
          center={
            hasLocation
              ? [parseFloat(value.latitude!), parseFloat(value.longitude!)]
              : [-23.4, -58.4]
          }
          zoom={hasLocation ? 14 : 6}
          height={300}
          onMapClick={handleMapClick}
          fitToContent={hasLocation}
        />
        
        {isReverseGeocoding && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-gray-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Obteniendo ubicación...</span>
            </div>
          </div>
        )}
      </div>

      {hasLocation && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {value.city || 'Ubicación seleccionada'}
              {value.department && `, ${value.department}`}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {parseFloat(value.latitude!).toFixed(6)}, {parseFloat(value.longitude!).toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {!hasLocation && (
        <p className="text-xs text-gray-500">
          Buscá una ubicación, usá "Mi ubicación" o hacé click en el mapa para seleccionar
        </p>
      )}
    </div>
  );
}
