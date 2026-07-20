export type ChangeRequestType = 'datos_legales' | 'establecimiento' | 'documentos' | 'alta_camion' | 'conversion_cuenta' | 'baja_empresa';

export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ChangeRequest {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  change_type: ChangeRequestType;
  payload: Record<string, unknown>;
  status: ChangeRequestStatus;
  rejection_reason: string;
  /** Compatibility aliases returned by some backend serializers. */
  reason?: string | null;
  rejectionReason?: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const CHANGE_REQUEST_TYPE_LABELS: Record<ChangeRequestType, { title: string; description: string }> = {
  datos_legales: {
    title: 'Cambio de datos legales',
    description: 'Nombre, RUC o razón social. El equipo lo revisa antes de aplicarlo.',
  },
  establecimiento: {
    title: 'Cambio de establecimiento',
    description: 'RUC, razón social, departamento o distrito. El equipo lo revisa antes de aplicarlo.',
  },
  documentos: {
    title: 'Cambio de documento',
    description: 'Reemplazo de documento. Queda en revisión hasta validarse.',
  },
  alta_camion: {
    title: 'Alta de vehículo',
    description: 'Solicitud de alta de un nuevo vehículo. Pendiente de aprobación.',
  },
  conversion_cuenta: {
    title: 'Conversión a Empresa',
    description: 'Solicitud de conversión de cuenta Transportista a Empresa.',
  },
  baja_empresa: {
    title: 'Baja de la empresa',
    description: 'Solicitud de baja de la empresa. Pendiente de confirmación.',
  },
};
