import { useState } from 'react';
import { Clock, Check, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useMyChangeRequests, CHANGE_REQUEST_TYPE_LABELS, type ChangeRequest, type ChangeRequestStatus } from '@/features/my-change-requests';
import { ui } from '@/app/components/AccountShell';

const STATUS_META: Record<ChangeRequestStatus, { color: string; bg: string; label: string }> = {
  pending: { color: '#B45309', bg: '#FEF3E2', label: 'En revisión' },
  approved: { color: '#1E5126', bg: 'rgba(30,81,38,0.08)', label: 'Aprobado' },
  rejected: { color: '#B91C1C', bg: '#FEE2E2', label: 'Rechazado' },
};

type TabFilter = 'pending' | 'history';

interface ChangeRequestListProps {
  intro?: string;
  filterType?: keyof typeof CHANGE_REQUEST_TYPE_LABELS;
  showAll?: boolean;
}

export function MyChangeRequestsSection({ intro, filterType, showAll = false }: ChangeRequestListProps) {
  const { data: requests = [], isLoading, isError, error, refetch } = useMyChangeRequests();
  const [activeTab, setActiveTab] = useState<TabFilter>('pending');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {intro && (
          <div className="text-xs text-gray-500 leading-relaxed">{intro}</div>
        )}
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#1E5126' }} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3">
        {intro && (
          <div className="text-xs text-gray-500 leading-relaxed">{intro}</div>
        )}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 text-red-700 font-semibold">
            <AlertCircle className="w-5 h-5" />
            Error al cargar solicitudes
          </div>
          <p className="text-sm mt-1 text-red-600">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
          <button onClick={() => refetch()} className="mt-3 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const filtered = filterType
    ? requests.filter((r) => r.change_type === filterType)
    : requests;

  const pendingRequests = filtered.filter((r) => r.status === 'pending');
  const historyRequests = filtered.filter((r) => r.status !== 'pending');

  const display = activeTab === 'pending' ? pendingRequests : historyRequests;

  return (
    <div className="flex flex-col gap-3">
      {intro && (
        <div className="text-xs text-gray-500 leading-relaxed">{intro}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('pending'); setExpandedId(null); }}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors"
          style={{
            color: activeTab === 'pending' ? '#1E5126' : '#6B7280',
            borderBottom: activeTab === 'pending' ? '2px solid #1E5126' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <Clock size={14} />
          Pendientes
          {pendingRequests.length > 0 && (
            <span
              className="inline-flex items-center justify-center text-[10px] font-bold rounded-full"
              style={{ background: '#FEF3E2', color: '#B45309', padding: '1px 6px', minWidth: 18 }}
            >
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('history'); setExpandedId(null); }}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors"
          style={{
            color: activeTab === 'history' ? '#1E5126' : '#6B7280',
            borderBottom: activeTab === 'history' ? '2px solid #1E5126' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <Check size={14} />
          Historial
          {historyRequests.length > 0 && (
            <span
              className="inline-flex items-center justify-center text-[10px] font-bold rounded-full"
              style={{ background: '#F3F4F6', color: '#6B7280', padding: '1px 6px', minWidth: 18 }}
            >
              {historyRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {display.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl text-center py-7">
          <Check className="w-7 h-7 text-gray-300 mx-auto block" style={{ margin: '0 auto 8px' }} />
          <div className="text-sm font-bold text-gray-900">
            {activeTab === 'pending' ? 'No tenés solicitudes pendientes' : 'Sin historial'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {activeTab === 'pending'
              ? 'Los cambios que requieran aprobación aparecerán acá.'
              : 'Las solicitudes aprobadas o rechazadas se mostrarán aquí.'}
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col gap-2"
          style={{ maxHeight: display.length > 3 ? 420 : undefined, overflowY: display.length > 3 ? 'auto' : undefined }}
        >
          {display.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isExpanded={expandedId === request.id}
              onToggle={() => setExpandedId(expandedId === request.id ? null : request.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  isExpanded,
  onToggle,
}: {
  request: ChangeRequest;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const typeMeta = CHANGE_REQUEST_TYPE_LABELS[request.change_type];
  const statusMeta = STATUS_META[request.status];
  const changes = extractChanges(request.payload);
  const rejectionReason = request.rejection_reason?.trim();

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl transition-shadow"
      style={{ cursor: changes.length > 2 ? 'pointer' : 'default' }}
      onClick={changes.length > 2 ? onToggle : undefined}
    >
      <div className="p-4 flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#FEF3E2' }}
        >
          <Clock size={18} className="text-[#F58718]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{typeMeta.title}</span>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: statusMeta.color, background: statusMeta.bg, padding: '2px 8px', borderRadius: 99 }}
            >
              {statusMeta.label}
            </span>
            {changes.length > 2 && (
              <span className="ml-auto">
                {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </span>
            )}
          </div>
          <div className="mt-2 space-y-1">
            {(isExpanded ? changes : changes.slice(0, 2)).map((change) => (
              <div key={change.field} className="text-xs leading-snug">
                <span className="font-semibold text-gray-700">{change.label}:</span>{' '}
                <span className="text-gray-500 line-through">{change.old || '(vacío)'}</span>
                {' → '}
                <span className="text-gray-900 font-medium">{change.new}</span>
              </div>
            ))}
          </div>
          {!isExpanded && changes.length > 2 && (
            <div className="text-[11px] text-gray-400 mt-1">
              +{changes.length - 2} cambio{changes.length - 2 !== 1 ? 's' : ''} más
            </div>
          )}
          {request.status === 'rejected' && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <div className="font-semibold">Motivo del rechazo</div>
              <div className="mt-1">{rejectionReason || 'El administrador no informó un motivo.'}</div>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-1">
            <span>REV-{String(request.id).padStart(4, '0')}</span>
            <span>·</span>
            <span>{new Date(request.created_at).toLocaleString('es-PY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  ruc: 'RUC',
  owner_name: 'Razón social',
  department: 'Departamento',
  district: 'Ciudad / Distrito',
  name: 'Nombre',
  frequency: 'Frecuencia',
  code_sigor: 'Código SENACSA',
  first_name: 'Nombre',
  last_name: 'Apellido',
  phone: 'Teléfono',
  legal_name: 'Razón social',
};

function extractChanges(payload: Record<string, unknown>): Array<{ field: string; label: string; old: string; new: string }> {
  const changes: Array<{ field: string; label: string; old: string; new: string }> = [];
  const seen = new Set<string>();

  for (const key of Object.keys(payload)) {
    if (key.endsWith('_new')) {
      const field = key.replace(/_new$/, '');
      if (seen.has(field)) continue;
      seen.add(field);

      const oldVal = payload[`${field}_old`];
      const newVal = payload[key];

      if (newVal !== undefined) {
        changes.push({
          field,
          label: FIELD_LABELS[field] || field,
          old: oldVal != null ? String(oldVal) : '',
          new: String(newVal),
        });
      }
    }
  }

  return changes;
}
