import type { MarketplaceShipmentRequest, MarketplaceOfferWithRequest } from '../types/marketplace.types';

export interface MarketplaceTripViewModel {
  id: string;
  backendId: number;
  rancherId: string;
  rancherName: string;
  rancherPhone: string;
  rancherRating: number;
  establishmentName: string;
  establishmentCode: string;
  origin: string;
  originCoords: string;
  destination: string;
  destinationCoords: string;
  cattleType: string;
  heads: number;
  distance: number;
  pickupDate: string;
  pickupTime: string;
  estimatedDuration: string;
  specialRequirements?: string;
  bidStatus: 'new' | 'awaiting-rancher' | 'rancher-countered' | 'awaiting-trucker' | 'accepted';
  yourBid?: number;
  rancherCounterOffer?: number;
  yourFinalBid?: number;
  negotiationCount: number;
  marketPrice?: number;
  guides?: Array<{ guideNumber: 1 | 2; backendGuideId?: number; heads: number; status: string; activeOfferId?: string }>;
  estimatedWeight?: number;
  verified?: boolean;
}

const asNumber = (value: number | string | null | undefined): number => Number(value ?? 0);

const formatRequestId = (id: number) => `SOL-${String(id).padStart(4, '0')}`;

export function toMarketplaceTrip(request: MarketplaceShipmentRequest): MarketplaceTripViewModel {
  return {
    id: formatRequestId(request.id),
    backendId: request.id,
    rancherId: String(request.requester?.id ?? ''),
    rancherName: request.requester_name || request.requester?.first_name || 'Ganadero',
    rancherPhone: request.requester_phone || '',
    rancherRating: 0,
    establishmentName: request.origin,
    establishmentCode: '',
    origin: request.origin,
    originCoords: `${request.origin_lat}, ${request.origin_lng}`,
    destination: request.destination,
    destinationCoords: `${request.destination_lat}, ${request.destination_lng}`,
    cattleType: request.cattle_type_label,
    heads: request.heads,
    distance: asNumber(request.distance_km),
    pickupDate: request.pickup_date,
    pickupTime: 'A confirmar',
    estimatedDuration: `${Math.ceil(asNumber(request.distance_km) / 60)} hs aprox.`,
    specialRequirements: request.notes || undefined,
    bidStatus: 'new',
    negotiationCount: 0,
    marketPrice: asNumber(request.market_price),
    guides: request.guides.map((guide) => ({
      guideNumber: guide.guide_number as 1 | 2,
      backendGuideId: guide.id,
      heads: guide.heads,
      status: guide.status,
      activeOfferId: undefined,
    })),
    estimatedWeight: asNumber(request.estimated_weight_per_head),
    verified: true,
  };
}

export function toRancherOfferViewModel(item: MarketplaceOfferWithRequest) {
  const { request, offer } = item;
  const rounds = [...(offer.rounds || [])].sort((a, b) => a.round_number - b.round_number);
  const firstRound = rounds[0];
  const rancherRound = [...rounds].reverse().find((round) => round.by === 'rancher');
  const transporterRound = [...rounds].reverse().find((round) => round.by === 'transporter');

  return {
    id: String(offer.id),
    backendId: offer.id,
    requestId: formatRequestId(request.id),
    backendRequestId: request.id,
    transporterName: offer.transporter_name || 'Transportista',
    transporterType: 'empresa' as const,
    transporterRating: asNumber(offer.transporter_rating),
    tripsCompleted: 0,
    verified: true,
    offeredPrice: asNumber(firstRound?.amount ?? offer.amount),
    yourCounterOffer: rancherRound ? asNumber(rancherRound.amount) : undefined,
    theirFinalOffer: transporterRound && transporterRound !== firstRound ? asNumber(transporterRound.amount) : undefined,
    negotiationRound: Math.max(rounds.length, 1),
    status: offer.status === 'accepted'
      ? 'accepted' as const
      : offer.status === 'rancher-countered'
        ? 'you-countered' as const
        : 'new' as const,
    tripDetails: {
      origin: request.origin,
      destination: request.destination,
      cattleType: request.cattle_type_label,
      heads: request.heads,
      pickupDate: request.pickup_date,
      pickupTime: 'A confirmar',
      distance: asNumber(request.distance_km),
    },
    marketPrice: asNumber(request.market_price),
  };
}
