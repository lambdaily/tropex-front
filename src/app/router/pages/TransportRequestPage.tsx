import { useNavigate } from 'react-router-dom';
import { TransportRequestWizard } from '@/features/transport-requests';

export function TransportRequestPage() {
  const navigate = useNavigate();

  return <TransportRequestWizard onClose={() => navigate('/dashboard')} />;
}
