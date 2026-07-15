import { useState, useEffect } from 'react';

export interface DemoGuide {
  guideNumber: 1 | 2;
  heads: number;
  status: 'available' | 'in-negotiation' | 'accepted';
  activeOfferId?: string;
}

export interface DemoOrder {
  id: string;
  rancherName: string;
  origin: string;
  originDepartment: string;
  destination: string;
  destinationType: string;
  cattleType: 'weaned' | 'fat';
  cattleTypeLabel: string;
  heads: number;
  pickupDate: string;
  flexibility: string;
  notes: string;
  distance: number;
  marketPrice: number;
  guides: DemoGuide[];
  status: 'new' | 'partial' | 'accepted';
  createdAt: number;
  estimatedWeight?: number;
}

export interface NegotiationRound {
  round: number;
  by: 'transporter' | 'rancher';
  amount: number;
  timestamp: number;
}

export interface DemoOffer {
  id: string;
  orderId: string;
  guideNumber?: 1 | 2;
  transporterName: string;
  transporterType: 'owner-operator' | 'empresa';
  amount: number;
  status: 'pending' | 'rancher-countered' | 'accepted' | 'rejected';
  rounds: NegotiationRound[];
  createdAt: number;
  assignedDriverId?: string;
  assignedVehicleId?: string;
}

export interface UserProfile {
  role: string;
  subType: string;
  establishmentName: string;
  establishmentAddress: string;
  establishmentType: string;
}

export interface EmpresaVehicle {
  id: string;
  plate: string;
  type: string;
  capacityAdults: number;
  capacityYoung: number;
  status: 'disponible' | 'en-viaje' | 'mantenimiento';
  driverId: string | null;
}

export interface EmpresaDriver {
  id: string;
  name: string;
  phone: string;
  currentLat: number;
  currentLng: number;
  available: boolean;
  assignedVehicleId: string | null;
  rating: number;
  tripsCompleted: number;
}

// Module-level singleton — resets on page refresh, persists across role switches within same session
let _orders: DemoOrder[] = [];
let _offers: DemoOffer[] = [];
let _userProfile: UserProfile | null = null;
let _nextOrderSeq = 8008;
let _nextOfferSeq = 1;

let _empresaFleet: EmpresaVehicle[] = [
  { id: 'CAM-001', plate: 'ABC-123', type: 'semirremolque', capacityAdults: 45, capacityYoung: 80, status: 'en-viaje', driverId: 'DRV-001' },
  { id: 'CAM-004', plate: 'DEF-456', type: 'camion-acoplado', capacityAdults: 50, capacityYoung: 60, status: 'disponible', driverId: 'DRV-002' },
  { id: 'CAM-007', plate: 'GHI-789', type: 'semirremolque', capacityAdults: 50, capacityYoung: 80, status: 'en-viaje', driverId: 'DRV-003' },
  { id: 'CAM-009', plate: 'JKL-012', type: 'camion-mediano', capacityAdults: 40, capacityYoung: 70, status: 'mantenimiento', driverId: 'DRV-004' },
  { id: 'CAM-012', plate: 'MNO-345', type: 'semirremolque', capacityAdults: 45, capacityYoung: 80, status: 'disponible', driverId: 'DRV-005' },
];

let _empresaDrivers: EmpresaDriver[] = [
  { id: 'DRV-001', name: 'Carlos Mendez', phone: '+595 981 123456', currentLat: -25.2637, currentLng: -57.5759, available: false, assignedVehicleId: 'CAM-001', rating: 4.8, tripsCompleted: 142 },
  { id: 'DRV-002', name: 'Roberto Silva', phone: '+595 981 234567', currentLat: -22.3510, currentLng: -60.0311, available: true, assignedVehicleId: 'CAM-004', rating: 4.6, tripsCompleted: 87 },
  { id: 'DRV-003', name: 'María González', phone: '+595 981 345678', currentLat: -23.4064, currentLng: -57.4344, available: false, assignedVehicleId: 'CAM-007', rating: 4.9, tripsCompleted: 203 },
  { id: 'DRV-004', name: 'Juan Pérez', phone: '+595 981 456789', currentLat: -25.0931, currentLng: -57.5247, available: false, assignedVehicleId: 'CAM-009', rating: 4.5, tripsCompleted: 61 },
  { id: 'DRV-005', name: 'Ana López', phone: '+595 981 567890', currentLat: -25.3500, currentLng: -57.4800, available: true, assignedVehicleId: 'CAM-012', rating: 4.7, tripsCompleted: 118 },
];

type Listener = () => void;
let _listeners: Listener[] = [];

function notify() {
  _listeners.forEach(fn => fn());
}

export function subscribe(fn: Listener): () => void {
  _listeners = [..._listeners, fn];
  return () => {
    _listeners = _listeners.filter(l => l !== fn);
  };
}

export function getOrders(): DemoOrder[] { return _orders; }
export function getOffers(): DemoOffer[] { return _offers; }
export function getUserProfile(): UserProfile | null { return _userProfile; }
export function setUserProfile(profile: UserProfile): void {
  _userProfile = profile;
  notify();
}

export function getEmpresaFleet(): EmpresaVehicle[] { return _empresaFleet; }
export function getEmpresaDrivers(): EmpresaDriver[] { return _empresaDrivers; }
export function setEmpresaFleet(fleet: EmpresaVehicle[]): void { _empresaFleet = fleet; notify(); }
export function setEmpresaDrivers(drivers: EmpresaDriver[]): void { _empresaDrivers = drivers; notify(); }

export function addOrder(data: Omit<DemoOrder, 'id' | 'createdAt'>): DemoOrder {
  const id = `SOL-${_nextOrderSeq++}`;
  const order: DemoOrder = { ...data, id, createdAt: Date.now() };
  _orders = [..._orders, order];
  notify();
  return order;
}

export function addOffer(data: Omit<DemoOffer, 'id' | 'createdAt'>): DemoOffer {
  const id = `OFF-D${String(_nextOfferSeq++).padStart(3, '0')}`;
  const offer: DemoOffer = { ...data, id, createdAt: Date.now() };
  _offers = [..._offers, offer];

  // Lock the guide for split orders
  if (data.guideNumber !== undefined) {
    _orders = _orders.map(o => {
      if (o.id !== data.orderId) return o;
      return {
        ...o,
        guides: o.guides.map(g =>
          g.guideNumber === data.guideNumber
            ? { ...g, status: 'in-negotiation' as const, activeOfferId: id }
            : g
        ),
      };
    });
  }

  notify();
  return offer;
}

export function counterOfferByRancher(offerId: string, amount: number): void {
  _offers = _offers.map(o => {
    if (o.id !== offerId) return o;
    const newRound: NegotiationRound = {
      round: o.rounds.length + 1,
      by: 'rancher',
      amount,
      timestamp: Date.now(),
    };
    return { ...o, status: 'rancher-countered', rounds: [...o.rounds, newRound] };
  });
  notify();
}

export function rejectOffer(offerId: string): void {
  const offer = _offers.find(o => o.id === offerId);
  _offers = _offers.map(o => o.id === offerId ? { ...o, status: 'rejected' as const } : o);

  if (offer && offer.guideNumber !== undefined) {
    _orders = _orders.map(o => {
      if (o.id !== offer.orderId) return o;
      return {
        ...o,
        guides: o.guides.map(g =>
          g.guideNumber === offer.guideNumber
            ? { ...g, status: 'available' as const, activeOfferId: undefined }
            : g
        ),
      };
    });
  }

  notify();
}

export function acceptOffer(offerId: string): void {
  const offer = _offers.find(o => o.id === offerId);
  if (!offer) return;

  _offers = _offers.map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o);

  _orders = _orders.map(o => {
    if (o.id !== offer.orderId) return o;
    if (offer.guideNumber !== undefined) {
      const updatedGuides = o.guides.map(g =>
        g.guideNumber === offer.guideNumber ? { ...g, status: 'accepted' as const } : g
      );
      const allAccepted = updatedGuides.every(g => g.status === 'accepted');
      return { ...o, guides: updatedGuides, status: allAccepted ? 'accepted' as const : 'partial' as const };
    }
    return { ...o, status: 'accepted' as const };
  });

  notify();
}

// Cancela una solicitud del ganadero: elimina la orden y sus ofertas asociadas.
export function cancelOrder(orderId: string): void {
  _orders = _orders.filter(o => o.id !== orderId);
  _offers = _offers.filter(o => o.orderId !== orderId);
  notify();
}

// Returns true if a transporter has a pending offer (bid lock); empresa role is never locked
export function hasActiveTransporterOffer(role?: string): boolean {
  if (role === 'empresa') return false;
  return _offers.some(o => o.status === 'pending');
}

// React hook — triggers re-render whenever the store changes
export function useDemoStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribe(() => setTick(n => n + 1));
  }, []);

  return {
    orders: getOrders(),
    offers: getOffers(),
    userProfile: getUserProfile(),
    addOrder,
    addOffer,
    setUserProfile,
    getUserProfile,
    counterOfferByRancher,
    rejectOffer,
    acceptOffer,
    cancelOrder,
    hasActiveTransporterOffer,
    getEmpresaFleet,
    getEmpresaDrivers,
    setEmpresaFleet,
    setEmpresaDrivers,
  };
}
