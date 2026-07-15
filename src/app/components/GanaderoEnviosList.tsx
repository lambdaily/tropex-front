import { ShipmentsList, NewShipmentButton } from '@/features/shipments';
import { useActiveShipments } from '@/features/shipments';
import { BRAND_COLORS } from '@/app/config/brand';

interface Props {
  onSelect?: (id: number) => void;
}

export function GanaderoEnviosList({ onSelect }: Props) {
  const { data: shipments = [], isLoading, isError, error, refetch } = useActiveShipments();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold" style={{ color: BRAND_COLORS.verdeNoche }}>
            Mis envíos activos
          </h3>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
            Vista con datos reales del backend
          </p>
        </div>
        <NewShipmentButton onClick={() => alert('TODO: implementar modal de creación')} />
      </div>

      <ShipmentsList
        filter="active"
        onSelect={(s) => onSelect?.(s.id)}
        emptyMessage="No tenés envíos activos. Creá uno con el botón de arriba."
        loading={isLoading}
        error={error as Error | null}
        onRetry={() => refetch()}
      />

      {shipments.length > 0 && (
        <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
          Mostrando {shipments.length} envío{shipments.length !== 1 ? 's' : ''} activo{shipments.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
