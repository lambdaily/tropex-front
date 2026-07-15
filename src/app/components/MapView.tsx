import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
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
  className?: string;
  /** Ajusta el encuadre a los marcadores/ruta (default: true). */
  fitToContent?: boolean;
  /** Permite pan/zoom (default: true). */
  interactive?: boolean;
  /** Si se define, hace al mapa un selector de ubicación. */
  onMapClick?: (lat: number, lng: number) => void;
  /** Click sobre un marcador (devuelve el id del marker). */
  onMarkerClick?: (id: string) => void;
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

// Captura clicks para selección de ubicación.
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export function MapView({
  markers = [],
  route,
  routes,
  center,
  zoom = 6,
  height = 300,
  className,
  fitToContent = true,
  interactive = true,
  onMapClick,
  onMarkerClick,
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
        height,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 0,
      }}
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
        zoomControl={interactive}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

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
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m.id) } : undefined}
          >
            {m.label && (
              <Tooltip direction="top" offset={[0, -12]}>
                {m.label}
              </Tooltip>
            )}
          </Marker>
        ))}

        {fitToContent && allPoints.length > 0 && <FitToContent points={allPoints} />}

        {onMapClick && <ClickHandler onMapClick={onMapClick} />}
      </MapContainer>
    </div>
  );
}