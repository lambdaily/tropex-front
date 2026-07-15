import { Loader2, AlertCircle, Package, MapPin, Calendar, Truck, Users, Plus } from 'lucide-react';
import {
  useShipments,
  useActiveShipments,
  useShipmentsWithoutOffer,
  SHIPMENT_STATUS_META,
  ORIGIN_TYPE_LABELS,
  DESTINATION_TYPE_LABELS,
  CATTLE_TYPE_LABELS,
  type ShipmentRequest,
} from '@/features/shipments';
import { BRAND_COLORS } from '@/app/config/brand';

interface ShipmentsListProps {
  filter?: 'all' | 'active' | 'no-offer';
  onSelect?: (shipment: ShipmentRequest) => void;
  emptyMessage?: string;
  shipments?: ShipmentRequest[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function ShipmentsList({
  filter = 'all',
  onSelect,
  emptyMessage = 'No tenés envíos registrados',
  shipments: externalShipments,
  loading: externalLoading,
  error: externalError,
  onRetry,
}: ShipmentsListProps) {
  const allQuery = useShipments();
  const activeQuery = useActiveShipments();
  const noOfferQuery = useShipmentsWithoutOffer();

  const usingExternal = externalShipments !== undefined;
  const query = filter === 'active' ? activeQuery : filter === 'no-offer' ? noOfferQuery : allQuery;
  const { data: queryData = [], isLoading: queryLoading, isError: queryIsError, error: queryError, refetch } = query;

  const shipments = usingExternal ? externalShipments! : queryData;
  const isLoading = usingExternal ? (externalLoading ?? false) : queryLoading;
  const isError = usingExternal ? !!externalError : queryIsError;
  const error = usingExternal ? externalError : queryError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND_COLORS.verdeProfundo }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-lg p-6"
        style={{ background: '#FEF2F2', borderColor: '#FECACA' }}
      >
        <div className="flex items-center gap-2 font-semibold" style={{ color: '#B91C1C' }}>
          <AlertCircle className="w-5 h-5" />
          Error al cargar envíos
        </div>
        <p className="text-sm mt-1" style={{ color: '#B91C1C' }}>
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
        <button
          onClick={() => (onRetry ? onRetry() : refetch())}
          className="mt-3 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: '#fff', border: `1px solid ${BRAND_COLORS.neutroTecnico}` }}
      >
        <Package className="w-12 h-12 text-gray-300 mx-auto" />
        <p className="text-sm mt-3" style={{ color: '#6B7280' }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shipments.map((shipment) => (
        <ShipmentCard
          key={shipment.id}
          shipment={shipment}
          onClick={() => onSelect?.(shipment)}
        />
      ))}
    </div>
  );
}

interface ShipmentCardProps {
  shipment: ShipmentRequest;
  onClick?: () => void;
}

export function ShipmentCard({ shipment, onClick }: ShipmentCardProps) {
  const statusMeta = SHIPMENT_STATUS_META[shipment.status];
  const originLabel = ORIGIN_TYPE_LABELS[shipment.origin_type] || shipment.origin_type;
  const destinationLabel = DESTINATION_TYPE_LABELS[shipment.destination_type] || shipment.destination_type;
  const cattleLabel = CATTLE_TYPE_LABELS[shipment.cattle_type] || shipment.cattle_type_label;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="bg-white rounded-xl p-4 text-left transition-all disabled:cursor-default"
      style={{ border: `1px solid #E9E4D8` }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = BRAND_COLORS.verdeProfundo;
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E9E4D8';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: '#111' }}>
              SOL-{String(shipment.id).padStart(4, '0')}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: statusMeta.color + '20', color: statusMeta.color }}
            >
              {statusMeta.label}
            </span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
            {new Date(shipment.pickup_date).toLocaleDateString('es-PY')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: BRAND_COLORS.verdeProfundo }}>
            {shipment.heads}
          </div>
          <div className="text-xs" style={{ color: '#6B7280' }}>
            cabezas
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <RoutePoint
          icon={<MapPin size={14} style={{ color: BRAND_COLORS.verdeProfundo }} />}
          label={originLabel}
          value={shipment.origin}
          sublabel={shipment.origin_department}
        />
        <RoutePoint
          icon={<MapPin size={14} style={{ color: BRAND_COLORS.naranjaGPS }} />}
          label={destinationLabel}
          value={shipment.destination}
        />
      </div>

      <div
        className="mt-3 pt-3 flex items-center justify-between text-xs"
        style={{ borderTop: `1px solid #F3F0E8`, color: '#6B7280' }}
      >
        <div className="flex items-center gap-1">
          <Truck size={12} />
          <span>{shipment.distance_km} km</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span>{cattleLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>
            {new Date(shipment.pickup_date).toLocaleDateString('es-PY', { day: '2-digit', month: 'short' })}
          </span>
        </div>
      </div>

      {shipment.market_price && (
        <div
          className="mt-3 pt-3 text-center"
          style={{ borderTop: `1px solid #F3F0E8` }}
        >
          <div className="text-xs" style={{ color: '#6B7280' }}>
            Precio referencia
          </div>
          <div className="text-sm font-bold" style={{ color: BRAND_COLORS.verdeProfundo }}>
            ₲ {Number(shipment.market_price).toLocaleString('es-PY')}
          </div>
        </div>
      )}
    </button>
  );
}

function RoutePoint({ icon, label, value, sublabel }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs" style={{ color: '#6B7280' }}>
          {label}
        </div>
        <div
          className="text-sm font-medium truncate"
          style={{ color: '#111' }}
        >
          {value}
        </div>
        {sublabel && <div className="text-xs" style={{ color: '#9CA3AF' }}>
          {sublabel}
        </div>}
      </div>
    </div>
  );
}

interface NewShipmentButtonProps {
  onClick: () => void;
  label?: string;
}

export function NewShipmentButton({ onClick, label = 'Nuevo Envío' }: NewShipmentButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 text-white font-bold rounded-lg transition-colors"
      style={{ background: BRAND_COLORS.naranjaGPS }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = BRAND_COLORS.naranjaGPS + 'E6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = BRAND_COLORS.naranjaGPS;
      }}
    >
      <Plus size={18} />
      {label}
    </button>
  );
}
