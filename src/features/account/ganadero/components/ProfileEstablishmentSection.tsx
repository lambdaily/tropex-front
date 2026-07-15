import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, MapPin, Check, X, Loader2, AlertCircle, ShieldCheck, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useMyProfile, useUpdateMyProfile, type MyProfile } from '@/features/my-profile';
import { useMyEstablishment } from '@/features/my-establishment';
import { MyEstablishmentSection } from '@/features/my-establishment';
import { ui, fieldRow } from '@/app/components/AccountShell';
import { BRAND_COLORS } from '@/app/config/brand';

type Tab = 'profile' | 'establishment';

type ProfileFormData = Pick<MyProfile, 'first_name' | 'last_name' | 'phone'>;

export function ProfileEstablishmentSection() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useMyProfile();
  const { data: establishments = [], isLoading: estabLoading, error: estabError, refetch: refetchEstab } = useMyEstablishment();

  if (profileLoading || estabLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND_COLORS.verdeProfundo }} />
      </div>
    );
  }

  if (profileError || estabError) {
    const error = (profileError || estabError) as Error | null;
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-700 font-semibold">
          <AlertCircle className="w-5 h-5" />
          Error al cargar datos
        </div>
        <p className="text-sm mt-1 text-red-600">
          {error?.message ?? 'Error desconocido'}
        </p>
        <button
          onClick={() => { refetchProfile(); refetchEstab(); }}
          className="mt-3 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b" style={{ borderColor: BRAND_COLORS.neutroTecnico }}>
        <TabButton
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
          icon={User}
          label="Datos personales"
        />
        <TabButton
          active={activeTab === 'establishment'}
          onClick={() => setActiveTab('establishment')}
          icon={MapPin}
          label="Establecimiento"
          badge={establishments.length > 0 ? '✓' : undefined}

        />
      </div>

      {activeTab === 'profile' ? (
        <ProfileTab profile={profile!} />
      ) : (
        <EstablishmentTab hasEstablishment={establishments.length > 0} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, badge }: { active: boolean; onClick: () => void; icon: typeof User; label: string; badge?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors"
      style={{
        color: active ? BRAND_COLORS.verdeProfundo : '#6B7280',
        borderBottom: active ? `2px solid ${BRAND_COLORS.verdeProfundo}` : '2px solid transparent',
        marginBottom: '-1px',
      }}
    >
      <Icon size={16} />
      {label}
      {badge && (
        <span
          className="px-1.5 py-0.5 rounded-full text-xs font-bold"
          style={{ background: BRAND_COLORS.verdeProfundo, color: '#fff' }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function ProfileTab({ profile }: { profile: MyProfile }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={ui.card}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 4 }}
      >
        <div className="flex items-center gap-2">
          <div style={ui.sectionTitle}>Datos de contacto</div>
          {profile.is_active && (
            <span style={ui.verifiedChip}>
              <ShieldCheck size={11} /> Verificado
            </span>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{ ...ui.ghostBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Pencil size={14} /> Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <EditProfileForm profile={profile} onCancel={() => setIsEditing(false)} />
      ) : (
        <ProfileDetails profile={profile} />
      )}
    </div>
  );
}

function ProfileDetails({ profile }: { profile: MyProfile }) {
  return (
    <div>
      {fieldRow('Nombre', profile.first_name || '—')}
      {fieldRow('Apellido', profile.last_name || '—')}
      {fieldRow('Teléfono', profile.phone || 'No informado')}
    </div>
  );
}

function EditProfileForm({ profile, onCancel }: { profile: MyProfile; onCancel: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
    },
  });
  const updateProfile = useUpdateMyProfile();

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Perfil actualizado correctamente.');
      onCancel();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`No se pudo actualizar el perfil: ${msg}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
      <FormField label="Nombre" error={errors.first_name?.message}>
        <input
          {...register('first_name', { required: 'El nombre es obligatorio', maxLength: { value: 80, message: 'Máximo 80 caracteres' } })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-transparent"
        />
      </FormField>
      <FormField label="Apellido" error={errors.last_name?.message}>
        <input
          {...register('last_name', { required: 'El apellido es obligatorio', maxLength: { value: 80, message: 'Máximo 80 caracteres' } })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-transparent"
        />
      </FormField>
      <FormField label="Teléfono" error={errors.phone?.message}>
        <input
          {...register('phone', { required: 'El teléfono es obligatorio', maxLength: { value: 20, message: 'Máximo 20 caracteres' } })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-transparent"
        />
      </FormField>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel} style={{ ...ui.ghostBtn, flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <X size={14} /> Cancelar
        </button>
        <button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          style={{
            ...ui.primaryBtn,
            flex: 1,
            opacity: !isDirty || updateProfile.isPending ? 0.5 : 1,
            cursor: !isDirty || updateProfile.isPending ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Check size={14} /> {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

function EstablishmentTab({ hasEstablishment }: { hasEstablishment: boolean }) {
  if (!hasEstablishment) {
    return (
      <div style={ui.card}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(30,81,38,0.08)' }}
          >
            <MapPin size={22} style={{ color: BRAND_COLORS.verdeProfundo }} />
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

  return <MyEstablishmentSection />;
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>{label}</label>
      {children}
      {error && <div className="text-xs mt-1" style={{ color: '#B91C1C' }}>{error}</div>}
    </div>
  );
}
