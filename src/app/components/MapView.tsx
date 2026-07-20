import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mapa funcional reutilizable (Leaflet + OpenStreetMap). Sin API key.
// Cubre los usos del proyecto: seguimiento con ruta, flota con varios camiones
// y selección de ubicación (onMapClick).

export type MarkerType = 'truck' | 'origin' | 'destination' | 'default';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type?: MarkerType;
  label?: string;
  /** Sobrescribe el color por tipo. */
  color?: string;
  draggable?: boolean;
}

export interface MapViewProps {
  markers?: MapMarker[];
  /** Ruta a dibujar como línea: lista de puntos [lat, lng]. */
  route?: [number, number][];
  /** Varias rutas (cada una es una lista de puntos). */
  routes?: [number, number][][];
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  /** Clase opcional para aplicar una altura responsive al contenedor del mapa. */
  heightClassName?: string;
  className?: string;
  /** Ajusta el encuadre a los marcadores/ruta (default: true). */
  fitToContent?: boolean;
  /** Centra la cámara cuando cambia el primer marcador, sin reajustarla en cada render. */
  recenterOnMarkerChange?: boolean;
  /** Permite pan/zoom (default: true). */
  interactive?: boolean;
  /** Si se define, hace al mapa un selector de ubicación. */
  onMapClick?: (lat: number, lng: number) => void;
  /** Click sobre un marcador (devuelve el id del marker). */
  onMarkerClick?: (id: string) => void;
  onMarkerDragEnd?: (id: string, lat: number, lng: number) => void;
  /** Muestra un buscador de lugares sobre el mapa usando Nominatim/OSM. */
  searchable?: boolean;
  searchPlaceholder?: string;
}

// Centro aproximado de Paraguay
const PARAGUAY_CENTER: [number, number] = [-23.4, -58.4];

const COLOR_BY_TYPE: Record<MarkerType, string> = {
  truck: '#1E5126',
  origin: '#0ea5e9',
  destination: '#d4183d',
  default: '#F58718',
};

const EMOJI_BY_TYPE: Record<MarkerType, string> = {
  truck: '🚚',
  origin: '',
  destination: '',
  default: '',
};

function buildIcon(marker: MapMarker): L.DivIcon {
  const type = marker.type ?? 'default';
  const color = marker.color ?? COLOR_BY_TYPE[type];
  const emoji = EMOJI_BY_TYPE[type];
  const size = type === 'truck' ? 30 : 22;

  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2.5px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:${type === 'truck' ? 15 : 9}px;line-height:1;">
      ${emoji}
    </div>`;

  return L.divIcon({
    className: 'tropero-map-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Ajusta la vista a los puntos relevantes (marcadores + ruta).
function FitToContent({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }

    map.fitBounds(L.latLngBounds(points), {
      padding: [40, 40],
      maxZoom: 13,
    });
  }, [points, map]);

  return null;
}

function RecenterOnMarkerChange({ marker }: { marker?: MapMarker }) {
  const map = useMap();

  useEffect(() => {
    if (marker) map.setView([marker.lat, marker.lng], Math.max(map.getZoom(), 12), { animate: true });
  }, [marker?.lat, marker?.lng, map]);

  return null;
}

// Captura clicks para selección de ubicación.
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

function MapSearchControl({
  placeholder,
  onSelect,
}: {
  placeholder: string;
  onSelect: (lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = async () => {
    const value = query.trim();
    if (!value) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: value,
        format: 'jsonv2',
        limit: '5',
        countrycodes: 'py',
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!response.ok) throw new Error('No se pudo buscar la ubicación');
      setResults(await response.json() as SearchResult[]);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute left-3 right-3 top-14 z-[1000] sm:left-16 sm:right-3 sm:top-3 sm:max-w-2xl">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-md outline-none focus:border-[#1E5126]"
          aria-label={placeholder}
        />
        <button type="submit" className="shrink-0 rounded-md bg-[#1E5126] px-3 py-2 text-sm font-medium text-white shadow-md" disabled={isLoading}>
          {isLoading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>
      {results.length > 0 && (
        <div className="mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              className="block w-full border-b border-gray-100 px-3 py-2 text-left text-xs last:border-0 hover:bg-gray-50"
              onClick={() => {
                onSelect(Number(result.lat), Number(result.lon));
                setQuery(result.display_name);
                setResults([]);
              }}
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MapView({
  markers = [],
  route,
  routes,
  center,
  zoom = 6,
  height = 300,
  heightClassName,
  className,
  fitToContent = true,
  recenterOnMarkerChange = false,
  interactive = true,
  onMapClick,
  onMarkerClick,
  onMarkerDragEnd,
  searchable = false,
  searchPlaceholder = 'Buscá una ubicación',
}: MapViewProps) {
  const allRoutes: [number, number][][] = [
    ...(route ? [route] : []),
    ...(routes ?? []),
  ];

  const allPoints: [number, number][] = [
    ...markers.map((m) => [m.lat, m.lng] as [number, number]),
    ...allRoutes.flat(),
  ];

  return (
    <div
      style={{
        height: heightClassName ? undefined : height,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 0,
      }}
      className={heightClassName}
    >
      <MapContainer
        center={center ?? PARAGUAY_CENTER}
        zoom={zoom}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: 12,
          zIndex: 0,
          overflow: 'hidden',
        }}
        className={className}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {interactive && <ZoomControl position="topleft" />}

        {searchable && onMapClick && (
          <MapSearchControl
            placeholder={searchPlaceholder}
            onSelect={onMapClick}
          />
        )}

        {allRoutes.map((r, i) =>
          r.length >= 2 ? (
            <Polyline
              key={i}
              positions={r}
              pathOptions={{
                color: '#1E5126',
                weight: 4,
                opacity: 0.7,
                dashArray: '8 6',
              }}
            />
          ) : null,
        )}

        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={buildIcon(m)}
            draggable={m.draggable && interactive}
            eventHandlers={{
              ...(onMarkerClick ? { click: () => onMarkerClick(m.id) } : {}),
              ...(onMarkerDragEnd ? {
                dragend: (event) => {
                  const marker = event.target as L.Marker;
                  const position = marker.getLatLng();
                  onMarkerDragEnd(m.id, position.lat, position.lng);
                },
              } : {}),
            }}
          >
            {m.label && (
              <Tooltip direction="top" offset={[0, -12]}>
                {m.label}
              </Tooltip>
            )}
          </Marker>
        ))}

        {fitToContent && allPoints.length > 0 && <FitToContent points={allPoints} />}
        {recenterOnMarkerChange && <RecenterOnMarkerChange marker={markers[0]} />}

        {onMapClick && <ClickHandler onMapClick={onMapClick} />}
      </MapContainer>
    </div>
  );
}
