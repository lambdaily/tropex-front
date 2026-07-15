import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, Check, X, Loader2, AlertCircle, ShieldCheck, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useMyProfile, useUpdateMyProfile, type MyProfile } from "@/features/my-profile";
import { useCreateChangeRequest } from "@/features/my-change-requests";;
import { ui, fieldRow } from '@/app/components/AccountShell';

type ProfileFormData = Pick<MyProfile, 'first_name' | 'last_name' | 'phone'>;

export function MyProfileSection() {
  const { data: profile, isLoading, isError, error, refetch } = useMyProfile();
  const updateMutation = useUpdateMyProfile();
  const createRequest = useCreateChangeRequest();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div style={{ ...ui.card, textAlign: 'center', padding: '40px 16px' }}>
        <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: '#1E5126' }} />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div style={{ ...ui.card, background: '#FEF2F2', borderColor: '#FECACA' }}>
        <div className="flex items-center gap-2" style={{ color: '#B91C1C', fontWeight: 700 }}>
          <AlertCircle className="w-5 h-5" />
          Error al cargar tu perfil
        </div>
        <p className="text-sm mt-1" style={{ color: '#B91C1C' }}>
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
        <button
          onClick={() => refetch()}
          style={{ ...ui.ghostBtn, marginTop: 12 }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <ProfileCard
      profile={profile}
      isEditing={isEditing}
      isSaving={updateMutation.isPending}
      onEdit={() => setIsEditing(true)}
      onCancel={() => setIsEditing(false)}
      onSave={async (data) => {
        try {
          await updateMutation.mutateAsync(data);
          toast.success('Datos actualizados.');
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

function ProfileCard({
  profile,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: {
  profile: MyProfile;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: ProfileFormData) => Promise<void>;
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
        <div style={ui.sectionTitle}>Datos de contacto</div>
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
        <EditProfileForm
          profile={profile}
          isSaving={isSaving}
          onCancel={onCancel}
          onSave={onSave}
        />
      ) : (
        <ProfileDetails profile={profile} />
      )}
    </div>
  );
}

function ProfileDetails({ profile }: { profile: MyProfile }) {
  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || 'Sin nombre';
  const isVerified = profile.is_active;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ ...ui.val }}>{fullName}</span>
        {isVerified && (
          <span style={ui.verifiedChip}>
            <ShieldCheck size={11} /> Verificado
          </span>
        )}
      </div>

      {fieldRow("Email de contacto", profile.email || 'No informado')}
      {fieldRow("Teléfono", profile.phone || 'No informado')}

      <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}>
        <strong>Email de contacto:</strong> este email también se usa para acceder a tu cuenta. Para cambiarlo acceder a la sección de cuenta y seguridad.
      </div>
    </div>
  );
}

function EditProfileForm({
  profile,
  isSaving,
  onCancel,
  onSave,
}: {
  profile: MyProfile;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (data: ProfileFormData) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
    },
  });

  useEffect(() => {
    reset({
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
    });
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    await onSave(data);
  };

  const fields: Array<{
    key: keyof ProfileFormData;
    label: string;
    type?: string;
    placeholder?: string;
    validation?: Record<string, unknown>;
  }> = [
    { key: 'first_name', label: 'Nombre', validation: { required: 'El nombre es obligatorio', maxLength: { value: 80, message: 'Máximo 80 caracteres' } } },
    { key: 'last_name', label: 'Apellido', validation: { required: 'El apellido es obligatorio', maxLength: { value: 80, message: 'Máximo 80 caracteres' } } },
    { key: 'phone', label: 'Teléfono', placeholder: '+595 981 123456', validation: { required: 'El teléfono es obligatorio', maxLength: { value: 20, message: 'Máximo 20 caracteres' } } },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
      {fields.map(({ key, label, type, placeholder, validation }) => (
        <div key={key}>
          <div style={{ ...ui.lbl, marginBottom: 5 }}>{label}</div>
          <input
            type={type ?? 'text'}
            placeholder={placeholder}
            style={{
              ...ui.input,
              borderColor: errors[key] ? '#FCA5A5' : '#E5E7EB',
            }}
            {...register(key, validation as never)}
          />
          {errors[key] && (
            <div className="text-xs mt-1" style={{ color: '#B91C1C' }}>
              {errors[key]?.message as string}
            </div>
          )}
        </div>
      ))}

      {/*<div className="p-3 rounded-lg text-xs" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}>
        <strong>Email de contacto:</strong> este email también se usa para acceder a tu cuenta. Si lo cambias, usá el nuevo email en tu próximo inicio de sesión.
      </div>*/}

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
          {isSaving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
