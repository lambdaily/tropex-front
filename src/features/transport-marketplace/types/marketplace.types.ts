import type { Guide, ShipmentRequest } from '@/features/shipments';

export interface MarketplaceShipmentRequest extends ShipmentRequest {
  requester_name?: string;
  requester_phone?: string;
  requester_email?: string;
  offers?: MarketplaceOffer[];
}

export interface NegotiationRound {
  id: number;
  round_number: number;
  by: 'transporter' | 'rancher' | string;
  amount: number | string;
  timestamp: string;
}

export type MarketplaceOfferStatus = 'pending' | 'rancher-countered' | 'accepted' | 'rejected';

export interface MarketplaceOffer {
  id: number;
  shipment_request: number;
  guide: number | null;
  transporter: number;
  transporter_name: string;
  transporter_rating: number | string | null;
  amount: number | string;
  price_per_km: number | string | null;
  status: MarketplaceOfferStatus;
  rounds: NegotiationRound[];
  created_at: string;
}

export interface CreateOfferPayload {
  guide?: number | null;
  amount: number;
  price_per_km?: number | null;
}

export interface MarketplaceOfferWithRequest {
  request: MarketplaceShipmentRequest;
  offer: MarketplaceOffer;
}

export interface MarketplaceGuide extends Guide {
  guide_number: number;
  id: number;
}
