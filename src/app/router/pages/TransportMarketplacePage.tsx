import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { useSignupStore } from '../signupStore';
import { AvailableTripsView } from '@/app/components/tropero-v2/AvailableTripsView';
import { RancherOffersView } from '@/app/components/dashboards/RancherOffersView';

const RANCHER_ROLES = new Set([
  'ganadero',
  'frigorifico',
  'consignataria',
  'feria-remate',
  'otro-productor',
]);

export function TransportMarketplacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedRole = useSignupStore((state) => state.selectedRole);
  const role = selectedRole || user?.roles[0] || '';

  useEffect(() => {
    if (!role || RANCHER_ROLES.has(role) || role === 'empresa' || role === 'owner-operator') {
      return;
    }

    toast.error(role === 'chofer'
      ? 'El marketplace está disponible para empresas y transportistas independientes. El chofer opera desde la app.'
      : 'No se pudo determinar el tipo de cuenta.');
    navigate('/dashboard', { replace: true });
  }, [navigate, role]);

  if (RANCHER_ROLES.has(role)) {
    return (
      <RancherOffersView
        onBack={() => navigate('/dashboard')}
        onAcceptOffer={() => navigate('/dashboard')}
      />
    );
  }

  if (role === 'empresa' || role === 'owner-operator') {
    return (
      <AvailableTripsView
        userType={role === 'empresa' ? 'empresa' : 'owner-operator'}
        onBack={() => navigate('/dashboard')}
      />
    );
  }

  return null;
}
