import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, Check, X, Loader2, AlertCircle, MapPin, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useMyEstablishment, useUpdateMyEstablishment, type MyEstablishment } from '@/features/my-establishment';
import { authApi } from '@/features/auth/api/authApi';
import { ui, fieldRow } from '@/app/components/AccountShell';

type EstablishmentFormData = Pick<MyEstablishment, 'name' | 'owner_name' | 'ruc' | 'code_sigor' | 'department' | 'district' | 'frequency'>;

const PARAGUAY_DEPARTMENTS = [
  { value: 'Concepción', label: 'Concepción' },
  { value: 'San Pedro', label: 'San Pedro' },
  { value: 'Cordillera', label: 'Cordillera' },
  { value: 'Guairá', label: 'Guairá' },
  { value: 'Caaguazú', label: 'Caaguazú' },
  { value: 'Caazapá', label: 'Caazapá' },
  { value: 'Itapúa', label: 'Itapúa' },
  { value: 'Misiones', label: 'Misiones' },
  { value: 'Paraguarí', label: 'Paraguarí' },
  { value: 'Alto Paraná', label: 'Alto Paraná' },
  { value: 'Central', label: 'Central' },
  { value: 'Ñeembucú', label: 'Ñeembucú' },
  { value: 'Amambay', label: 'Amambay' },
  { value: 'Canindeyú', label: 'Canindeyú' },
  { value: 'Presidente Hayes', label: 'Presidente Hayes' },
  { value: 'Boquerón', label: 'Boquerón' },
  { value: 'Alto Paraguay', label: 'Alto Paraguay' },
];

const FREQUENCY_OPTIONS = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'eventual', label: 'Eventual' },
];

export function MyEstablishmentSection() {
  const { data: establishments = [], isLoading, isError, error, refetch } = useMyEstablishment();
  const updateMutation = useUpdateMyEstablishment();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div style={{ ...ui.card, textAlign: 'center', padding: '40px 16px' }}>
        <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: '#1E5126' }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ ...ui.card, background: '#FEF2F2', borderColor: '#FECACA' }}>
        <div className="flex items-center gap-2" style={{ color: '#B91C1C', fontWeight: 700 }}>
          <AlertCircle className="w-5 h-5" />
          Error al cargar el establecimiento
        </div>
        <p className="text-sm mt-1" style={{ color: '#B91C1C' }}>
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
        <button onClick={() => refetch()} style={{ ...ui.ghostBtn, marginTop: 12 }}>
          Reintentar
        </button>
      </div>
    );
  }

  const establishment = establishments[0];
  console.log('[MyEstablishmentSection] establishments:', establishments, 'selected:', establishment);

  if (!establishment) {
    return <NoEstablishment />;
  }

  return (
    <EstablishmentCard
      establishment={establishment}
      isEditing={isEditing}
      isSaving={updateMutation.isPending}
      onEdit={() => setIsEditing(true)}
      onCancel={() => setIsEditing(false)}
      onSave={async (data) => {
        try {
          const result = await updateMutation.mutateAsync({
            id: establishment.id,
            data,
            currentEstablishment: establishment,
          });

          if (result.hasChangeRequest && result.updated) {
            toast.success('Algunos cambios se aplicaron y otros fueron enviados a revisión.');
          } else if (result.hasChangeRequest) {
            toast.success('Cambios enviados a revisión del equipo Tropero.');
          } else if (result.updated) {
            toast.success('Establecimiento actualizado.');
          }

          setIsEditing(false);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error desconocido';
          toast.error(`No se pudo actualizar: ${msg}`);
        }
      }}
    />
  );
}

/* ─── Sub-componentes ─── */

function NoEstablishment() {
  return (
    <div style={ui.card}>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(30,81,38,0.08)' }}
        >
          <MapPin size={22} style={{ color: '#1E5126' }} />
        </div>
        <div>
          <div style={ui.sectionTitle}>Sin establecimiento</div>
          <div className="text-sm" style={{ color: '#6B7280', marginTop: 2 }}>
            Registrá tu establecimiento en el paso 2 del registro.
          </div>
        </div>
      </div>
    </div>
  );
}

function EstablishmentCard({
  establishment,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: {
  establishment: MyEstablishment;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: EstablishmentFormData) => Promise<void>;
}) {
  return (
    <div style={ui.card}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <div style={ui.sectionTitle}>Datos del establecimiento</div>
        {!isEditing && (
          <button
            onClick={onEdit}
            style={{
              ...ui.ghostBtn,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Pencil size={14} /> Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <EditEstablishmentForm
          establishment={establishment}
          isSaving={isSaving}
          onCancel={onCancel}
          onSave={onSave}
        />
      ) : (
        <EstablishmentDetails establishment={establishment} />
      )}
    </div>
  );
}

function EstablishmentDetails({ establishment }: { establishment: MyEstablishment }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ ...ui.val, fontSize: 16 }}>{establishment.name || 'Sin nombre'}</span>
        {establishment.code_sigor && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{
              color: '#1E5126',
              background: 'rgba(30,81,38,0.08)',
              padding: '2px 8px',
              borderRadius: 99,
            }}
          >
            <CheckCircle2 size={11} /> SENACSA
          </span>
        )}
      </div>

      {fieldRow('RUC', establishment.ruc || 'No informado', true)}
      {fieldRow('Razón social', establishment.owner_name || 'No informado', true)}
      {fieldRow('Código SENACSA', establishment.code_sigor || 'Sin código')}
      {fieldRow('Departamento', establishment.department || 'No informado', true)}
      {fieldRow('Ciudad / Distrito', establishment.district || 'No informado', true)}
      {establishment.frequency && fieldRow('Frecuencia de traslados', establishment.frequency)}

      <div
        className="mt-3 p-3 rounded-lg text-xs"
        style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
      >
        <strong>Importante:</strong> los cambios en nombre, RUC o ubicación requieren aprobación del equipo Tropero antes de aplicarse.
      </div>
    </div>
  );
}

function EditEstablishmentForm({
  establishment,
  isSaving,
  onCancel,
  onSave,
}: {
  establishment: MyEstablishment;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (data: EstablishmentFormData) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<EstablishmentFormData>({
    defaultValues: {
      name: establishment.name,
      owner_name: establishment.owner_name,
      ruc: establishment.ruc,
      code_sigor: establishment.code_sigor,
      department: establishment.department,
      district: establishment.district,
      frequency: establishment.frequency,
    },
  });

  const [rucVerifying, setRucVerifying] = useState(false);
  const [rucVerified, setRucVerified] = useState(false);
  const [rucError, setRucError] = useState<string | null>(null);

  const rucValue = watch('ruc');

  const verifyRuc = useCallback(async (ruc: string) => {
    if (!ruc || ruc.length < 6) {
      setRucVerified(false);
      setRucError(null);
      return;
    }

    setRucVerifying(true);
    setRucError(null);

    try {
      const result = await authApi.verifyRucReal(ruc);

      if (result.valid && result.data) {
        setRucVerified(true);
        setRucError(null);
        if (result.data.razon_social) {
          setValue('owner_name', result.data.razon_social, { shouldDirty: true });
        }
      } else {
        setRucVerified(false);
        setRucError(result.error || 'RUC no válido');
      }
    } catch {
      setRucVerified(false);
      setRucError('Error al verificar el RUC');
    } finally {
      setRucVerifying(false);
    }
  }, [setValue]);

  useEffect(() => {
    if (rucValue !== establishment.ruc) {
      const timeoutId = setTimeout(() => {
        verifyRuc(rucValue);
      }, 800);
      return () => clearTimeout(timeoutId);
    } else {
      setRucVerified(false);
      setRucError(null);
    }
  }, [rucValue, establishment.ruc, verifyRuc]);

  useEffect(() => {
    reset({
      name: establishment.name,
      owner_name: establishment.owner_name,
      ruc: establishment.ruc,
      code_sigor: establishment.code_sigor,
      department: establishment.department,
      district: establishment.district,
      frequency: establishment.frequency,
    });
  }, [establishment, reset]);

  const onSubmit = async (data: EstablishmentFormData) => {
    await onSave(data);
  };

  const fields: Array<{
    key: keyof EstablishmentFormData;
    label: string;
    type?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    validation?: Record<string, unknown>;
    sensitive?: boolean;
  }> = [
    { key: 'name', label: 'Nombre del establecimiento', validation: { required: 'El nombre es obligatorio', maxLength: { value: 200, message: 'Máximo 200 caracteres' } } },
    { key: 'ruc', label: 'RUC', validation: { required: 'El RUC es obligatorio', maxLength: { value: 20, message: 'Máximo 20 caracteres' } }, sensitive: true },
    { key: 'owner_name', label: 'Razón social', validation: { required: 'La razón social es obligatoria', maxLength: { value: 200, message: 'Máximo 200 caracteres' } }, sensitive: true },
    { key: 'code_sigor', label: 'Código SENACSA', placeholder: 'Ej: 12345', validation: { maxLength: { value: 20, message: 'Máximo 20 caracteres' } } },
    { key: 'department', label: 'Departamento', type: 'select', options: PARAGUAY_DEPARTMENTS, validation: { required: 'El departamento es obligatorio' }, sensitive: true },
    { key: 'district', label: 'Ciudad / Distrito', validation: { required: 'La ciudad es obligatoria', maxLength: { value: 80, message: 'Máximo 80 caracteres' } }, sensitive: true },
    { key: 'frequency', label: 'Frecuencia de traslados', type: 'select', options: FREQUENCY_OPTIONS },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
      {fields.map(({ key, label, type, placeholder, options, validation, sensitive }) => (
        <div key={key}>
          <div style={{ ...ui.lbl, marginBottom: 5 }}>
            {label}
            {sensitive && <span style={{ color: '#B45309', marginLeft: 6, fontSize: 9 }}>requiere aprobación</span>}
          </div>
          {type === 'select' && options ? (
            <select
              {...register(key, validation as never)}
              style={{
                ...ui.input,
                borderColor: errors[key] ? '#FCA5A5' : '#E5E7EB',
              }}
            >
              <option value="">Seleccionar…</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                type={type ?? 'text'}
                placeholder={placeholder}
                style={{
                  ...ui.input,
                  borderColor: errors[key] ? '#FCA5A5' : rucError && key === 'ruc' ? '#FCA5A5' : rucVerified && key === 'ruc' ? '#86EFAC' : '#E5E7EB',
                  paddingRight: key === 'ruc' && rucVerifying ? 36 : undefined,
                }}
                {...register(key, validation as never)}
              />
              {key === 'ruc' && rucVerifying && (
                <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
              )}
              {key === 'ruc' && rucVerified && !rucVerifying && (
                <CheckCircle2 size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#16A34A' }} />
              )}
              {key === 'ruc' && rucError && !rucVerifying && (
                <Search size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#B91C1C' }} />
              )}
            </div>
          )}
          {errors[key] && (
            <div className="text-xs mt-1" style={{ color: '#B91C1C' }}>
              {errors[key]?.message as string}
            </div>
          )}
          {key === 'ruc' && rucError && !errors[key] && (
            <div className="text-xs mt-1" style={{ color: '#B91C1C' }}>
              {rucError}
            </div>
          )}
          {key === 'ruc' && rucVerified && !rucError && (
            <div className="text-xs mt-1" style={{ color: '#16A34A' }}>
              RUC verificado correctamente
            </div>
          )}
        </div>
      ))}

      <div
        className="p-3 rounded-lg text-xs"
        style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
      >
        <strong>Importante:</strong> los campos marcados requieren aprobación del equipo Tropero antes de aplicarse.
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          style={{
            ...ui.ghostBtn,
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <X size={14} /> Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving || !isDirty}
          style={{
            ...ui.primaryBtn,
            flex: 1,
            opacity: isSaving || !isDirty ? 0.5 : 1,
            cursor: isSaving || !isDirty ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {isSaving ? 'Enviando…' : 'Enviar a revisión'}
        </button>
      </div>
    </form>
  );
}
