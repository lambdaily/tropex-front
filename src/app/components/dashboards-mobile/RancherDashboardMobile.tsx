import { useState } from "react";
import {
  Bell,
  Plus,
  ArrowRight,
  CheckCircle2,
  X,
  Truck,
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
  LogOut,
  History,
  BarChart3,
  HelpCircle,
  LayoutDashboard,
  User,
  TrendingUp,
  MessageCircle,
  ExternalLink,
  Mail,
  Menu,
  Calendar,
  Map,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  baseActiveShipments,
  offersData,
  progressByShipment,
} from "../../data/rancher-dashboard-data";
import {
  formatPrice as fmt,
  calculateSavings as savingsPct,
} from "../../utils/format";
import { MapView, type MapMarker } from "../MapView";
import { coordsForCity, interpolate } from "../../data/paraguay-locations";
import { shipmentStatusColor } from "../../config/colors";
import { NewShipmentFlow } from "../dashboards/NewShipmentFlow";
import { useDemoStore, acceptOffer, rejectOffer } from "../../store/demoStore";
import { RancherOffersView } from "../dashboards/RancherOffersView";
import { RancherTripDetailModal } from "../dashboards/RancherTripDetailModal";
import { RancherOfferDetailModal } from "../dashboards/RancherOfferDetailModal";
import { GanaderoAccount } from "@/features/account";
import { TripCancelFlow } from "../TripCancelFlow";
import { MisEnviosView } from "../dashboards/MisEnviosView";
import type { GanaderoAccountInitialData } from "@/features/account";

interface RancherDashboardMobileProps {
  userName: string;
  onLogout: () => void;
  subTypeLabel?: string;
  accountInitialData?: GanaderoAccountInitialData;
}

type MobileView =
  | "home"
  | "offers"
  | "shipments"
  | "history"
  | "reports"
  | "support"
  | "cuenta";

export function RancherDashboardMobile({
  userName,
  onLogout,
  subTypeLabel = "Ganadero",
  accountInitialData,
}: RancherDashboardMobileProps) {
  const [showNewShipment, setShowNewShipment] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("home");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [heroShipmentIdx, setHeroShipmentIdx] = useState(0);
  const [shipmentViewMode, setShipmentViewMode] = useState<"info" | "map">(
    "info",
  );
  const [showGanaderoCancel, setShowGanaderoCancel] = useState(false);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState("");

  const { orders: storeOrders, offers: storeOffers } = useDemoStore();

  // ── Same data as desktop (compartido en data/rancher-dashboard-data) ─────────
  const fullyAcceptedStoreOrders = storeOrders.filter(
    (o) => o.status === "accepted",
  );
  const activeShipments = [
    ...baseActiveShipments.filter(
      (s) => !(fullyAcceptedStoreOrders.length > 0 && s.id === "ENV-003"),
    ),
    ...fullyAcceptedStoreOrders.map((o) => ({
      id: o.id,
      status: "accepted",
      statusText: "Transportista asignado",
      origin: o.origin,
      destination: o.destination,
      cattleCount: o.heads,
      cattleType: o.cattleTypeLabel,
      distance: o.distance,
      driver: "Demo Transportista",
      estimatedArrival: "A confirmar",
    })),
  ];

  const inTransitShipments = activeShipments.filter(
    (s) => s.status === "in-transit",
  );
  const safeIdx =
    inTransitShipments.length > 0
      ? heroShipmentIdx % inTransitShipments.length
      : 0;
  const heroShipment =
    inTransitShipments[safeIdx] ||
    activeShipments.find((s) => s.status === "accepted") ||
    activeShipments[0];

  const progressPercent =
    progressByShipment[heroShipment?.id ?? ""] ??
    (heroShipment?.status === "in-transit"
      ? 60
      : heroShipment?.status === "accepted"
        ? 25
        : 5);

  const cotaByShipment: Record<
    string,
    Array<{ label: string; sub: string; done: boolean; current?: boolean }>
  > = {
    "ENV-001": [
      { label: "Fila.", sub: "Km 450", done: true },
      { label: "Mariscal", sub: "Km 300", done: true },
      { label: "V.Hayes", sub: "Km 50", done: false, current: true },
      { label: "Asunc.", sub: "Destino", done: false },
    ],
    "ENV-005": [
      { label: "Fila.", sub: "Km 448", done: true },
      { label: "P.Hondo", sub: "Km 224", done: false, current: true },
      { label: "P.Casado", sub: "Destino", done: false },
    ],
  };

  const upcomingPickups = [
    {
      id: "ENV-002",
      day: "25",
      month: "MAR",
      time: "08:00",
      route: "Loma Plata → Villa Hayes",
      cattleCount: 30,
    },
    {
      id: "ENV-003",
      day: "26",
      month: "MAR",
      time: "05:30",
      route: "Neuland → Concepción",
      cattleCount: 52,
    },
  ];
  const nextPickup = upcomingPickups[0];

  const pendingStoreOffers = storeOffers.filter(
    (o) => o.status !== "rejected" && o.status !== "accepted",
  );
  const pendingOffersCount = pendingStoreOffers.length + 3;
  const activeEnviosCount = activeShipments.filter(
    (s) => s.status === "in-transit" || s.status === "accepted",
  ).length;
  const openRequestsCount =
    activeShipments.filter((s) => s.status === "waiting").length +
    storeOrders.filter((o) => o.status === "new").length;

  const staticOfferCards = [
    {
      id: "OFFER-SOL-001-1",
      name: "Transporte González S.A.",
      rating: 4.8,
      sub: "SOL-001 · 45 cab",
      price: 2800000,
      badge: "NUEVA",
    },
    {
      id: "OFFER-SOL-001-2",
      name: "Carlos Méndez",
      rating: 4.6,
      sub: "SOL-001 · 45 cab",
      price: 2700000,
      badge: "CONTRA",
    },
    {
      id: "OFFER-SOL-002-1",
      name: "Flota del Chaco",
      rating: 4.9,
      sub: "SOL-002 · 32 cab",
      price: 1800000,
      badge: "NUEVA",
    },
  ];

  // orange = requires attention/pending action, green = confirmed/progress, gray = neutral/passive
  const pendingActions = [
    {
      color: "#F58718",
      icon: "alert",
      text: "Carlos M. espera respuesta en SOL-001",
      time: "hace 12 min",
    },
    {
      color: "#F58718",
      icon: "alert",
      text: "Flota del Chaco ofertó ₲ 1.8M en SOL-002",
      time: "hace 3 h",
    },
    {
      color: "#22C55E",
      icon: "check",
      text: "ENV-001 superó Mariscal Estigarribia",
      time: "hace 2 h",
    },
    {
      color: "#9CA3AF",
      icon: "dot",
      text: "Pago de ₲ 1.65M confirmado · ENV-045",
      time: "ayer",
    },
  ];

  const getStatusColor = shipmentStatusColor;

  const isSecondaryView = ["history", "reports", "support"].includes(
    mobileView,
  );

  if (showNewShipment)
    return <NewShipmentFlow onClose={() => setShowNewShipment(false)} />;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{
        backgroundColor: "#F6F1E8",
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      }}
    >
      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {selectedTripId && (
        <RancherTripDetailModal
          tripId={selectedTripId}
          onClose={() => setSelectedTripId(null)}
        />
      )}
      {showGanaderoCancel && heroShipment && (
        <TripCancelFlow
          tripId={heroShipment.id}
          route={`${heroShipment.origin} → ${heroShipment.destination}`}
          who="ganadero"
          onClose={() => setShowGanaderoCancel(false)}
          onConfirmed={() => {
            /* demo: el flujo muestra la confirmación */
          }}
        />
      )}
      {selectedOfferId && !offersData[selectedOfferId] && (
        <RancherOfferDetailModal
          offerId={selectedOfferId}
          onClose={() => setSelectedOfferId(null)}
          onAccept={() => setSelectedOfferId(null)}
        />
      )}

      {/* ── Counteroffer bottom sheet ────────────────────────────────────────── */}
      {showCounterOffer &&
        selectedOfferId &&
        offersData[selectedOfferId] &&
        (() => {
          const offer = offersData[selectedOfferId];
          return (
            <div
              className="fixed inset-0 bg-black/60 z-[60] flex items-end"
              onClick={() => setShowCounterOffer(false)}
            >
              <div
                className="bg-white rounded-t-3xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-5 pt-5 pb-2 flex items-center justify-between border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    Tu contraoferta
                  </h3>
                  <button
                    onClick={() => setShowCounterOffer(false)}
                    className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="px-5 pt-4 pb-8 space-y-4">
                  {/* Current price reference */}
                  <div
                    className="rounded-2xl p-4 flex items-center justify-between"
                    style={{ backgroundColor: "#F6F1E8" }}
                  >
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        Oferta actual de {offer.transporterName.split(" ")[0]}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {fmt(offer.currentPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">
                        Precio de mercado
                      </p>
                      <p className="text-sm font-semibold text-gray-500">
                        {fmt(offer.marketPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Price input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tu precio (₲)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg select-none">
                        ₲
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          counterOfferAmount
                            ? new Intl.NumberFormat("es-PY").format(
                                Number(counterOfferAmount),
                              )
                            : ""
                        }
                        onChange={(e) =>
                          setCounterOfferAmount(
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                        placeholder={new Intl.NumberFormat("es-PY").format(
                          Math.round(offer.currentPrice * 0.95),
                        )}
                        className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-gray-200 text-xl font-bold text-gray-900 focus:outline-none focus:border-green-700"
                        style={{
                          borderColor: counterOfferAmount
                            ? "#1E5126"
                            : undefined,
                        }}
                      />
                    </div>
                    {counterOfferAmount &&
                      Number(counterOfferAmount) < offer.marketPrice && (
                        <p
                          className="text-xs mt-1.5"
                          style={{ color: "#22C55E" }}
                        >
                          Ahorrás{" "}
                          {savingsPct(
                            Number(counterOfferAmount),
                            offer.marketPrice,
                          )}
                          % vs precio de mercado
                        </p>
                      )}
                  </div>

                  <p className="text-xs text-gray-400">
                    Ronda {offer.currentRound} de {offer.maxRounds} · El
                    transportista podrá aceptar o responder con una nueva
                    oferta.
                  </p>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        setShowCounterOffer(false);
                        setSelectedOfferId(null);
                        setCounterOfferAmount("");
                      }}
                      disabled={!counterOfferAmount}
                      className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40"
                      style={{ backgroundColor: "#1E5126" }}
                    >
                      Enviar contraoferta
                    </button>
                    <button
                      onClick={() => setShowCounterOffer(false)}
                      className="w-full py-3 rounded-2xl font-medium text-gray-500 text-sm border border-gray-200 bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Inline offer detail bottom sheet (for hardcoded demo offers) */}
      {selectedOfferId &&
        offersData[selectedOfferId] &&
        !showCounterOffer &&
        (() => {
          const offer = offersData[selectedOfferId];
          const pct = savingsPct(offer.currentPrice, offer.marketPrice);
          const isNewOffer = offer.status === "nueva-oferta";
          return (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setSelectedOfferId(null)}
            >
              <div
                className="bg-white rounded-t-3xl w-full max-h-[88vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sheet header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-gray-900 font-mono">
                      {offer.solId}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full text-white"
                      style={{
                        backgroundColor: isNewOffer ? "#F58718" : "#1E5126",
                      }}
                    >
                      {isNewOffer ? "Nueva oferta" : "Contraoferta"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOfferId(null)}
                    className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="px-5 py-5 space-y-4 pb-8">
                  {/* Transporter */}
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900">
                        {offer.transporterName}
                      </p>
                      <p className="text-sm text-gray-400">
                        ★ {offer.transporterRating} · {offer.transporterTrips}{" "}
                        viajes
                      </p>
                    </div>
                  </div>
                  {/* Route */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-1 flex-wrap">
                      <MapPin
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "#1E5126" }}
                      />
                      <span className="font-medium">{offer.origin}</span>
                      <span className="text-gray-400">→</span>
                      <MapPin
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "#F58718" }}
                      />
                      <span className="font-medium">{offer.destination}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {offer.cattleType} · {offer.heads} cabezas ·{" "}
                      {offer.distance} km
                    </p>
                  </div>
                  {/* Negotiation history */}
                  <div>
                    <p className="font-bold text-gray-900 mb-3">
                      Historial de negociación
                    </p>
                    <div className="space-y-2">
                      {offer.negotiationHistory.map((entry: any, i: number) => (
                        <div
                          key={i}
                          className="p-4 rounded-2xl border-2"
                          style={{
                            backgroundColor:
                              entry.from === "transportista"
                                ? "rgba(30,81,38,0.06)"
                                : "#F6F1E8",
                            borderColor:
                              entry.from === "transportista"
                                ? "rgba(30,81,38,0.14)"
                                : "#E5E7EB",
                          }}
                        >
                          <p className="text-xs text-gray-400 mb-1">
                            {entry.label}
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {fmt(entry.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 bg-gray-100 rounded-2xl p-3 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">
                          Precio de mercado
                        </p>
                        <p className="font-bold text-gray-600">
                          {fmt(offer.marketPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Tu ahorro</p>
                        <p className="font-bold" style={{ color: "#22C55E" }}>
                          ↓ {pct}%
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Price hero */}
                  <div
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: "#1E5126" }}
                  >
                    <p
                      className="text-sm mb-1"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Precio actual
                    </p>
                    <p className="text-4xl font-bold text-white">
                      {fmt(offer.currentPrice)}
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Ahorrás {pct}% vs mercado
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedOfferId(null)}
                      className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                      style={{ backgroundColor: "#1E5126" }}
                    >
                      <CheckCircle2 className="w-5 h-5" /> Aceptar oferta
                    </button>
                    {offer.currentRound < offer.maxRounds && (
                      <button
                        onClick={() => setShowCounterOffer(true)}
                        className="w-full py-4 rounded-2xl font-bold border-2"
                        style={{ borderColor: "#1E5126", color: "#1E5126" }}
                      >
                        Contraofertar
                      </button>
                    )}
                    <p className="text-center text-xs text-gray-400">
                      Ronda {offer.currentRound} de {offer.maxRounds}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ── More drawer ─────────────────────────────────────────────────────── */}
      {showMoreDrawer && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowMoreDrawer(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            {(
              [
                { icon: History, label: "Historial", view: "history" },
                { icon: BarChart3, label: "Reportes", view: "reports" },
                { icon: HelpCircle, label: "Soporte", view: "support" },
              ] as { icon: LucideIcon; label: string; view: MobileView }[]
            ).map(({ icon: Icon, label, view }) => (
              <button
                key={label}
                onClick={() => {
                  setMobileView(view);
                  setShowMoreDrawer(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl active:bg-gray-50 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(30,81,38,0.07)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#1E5126" }} />
                </div>
                <span className="font-semibold text-gray-800 flex-1">
                  {label}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl active:bg-red-50 text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
                  <LogOut className="w-5 h-5 text-red-500" />
                </div>
                <span className="font-semibold text-red-500 flex-1">
                  Cerrar sesión
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 px-4 pb-3"
        style={{
          backgroundColor: "#1E5126",
          paddingTop: "max(12px, env(safe-area-inset-top))",
          display: mobileView === "cuenta" ? "none" : undefined,
        }}
      >
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#fff" }}
            >
              <img
                src="/tropex-isotipo.png"
                alt="TROPEX"
                className="w-5 h-5"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div>
              <p
                className="text-xs leading-none"
                style={{ color: "rgba(255,255,255,0.48)" }}
              >
                TROPEX · {subTypeLabel}
              </p>
              <p className="text-base font-bold text-white leading-snug mt-0.5">
                Hola, {userName.split(" ")[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileView("offers")}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Bell className="w-5 h-5 text-white" />
              {pendingOffersCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#F58718" }}
                />
              )}
            </button>
            <button
              onClick={() => setMobileView("cuenta")}
              aria-label="Cuenta"
              className="w-9 h-9 rounded-xl flex items-center justify-center border-0 cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        {mobileView === "home" && (
          <p
            className="text-xs mt-2"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            {activeEnviosCount} envíos activos · {pendingOffersCount} ofertas
            sin respuesta
          </p>
        )}
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 72 }}>
        {/* ─────────────────────────── HOME ──────────────────────────────────── */}
        {mobileView === "home" && (
          <div className="px-4 pt-4 space-y-4 pb-2">
            {/* Primary CTA */}
            <button
              onClick={() => setShowNewShipment(true)}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
              style={{
                backgroundColor: "#F58718",
                boxShadow: "0 4px 18px rgba(245,135,24,0.38)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-lg leading-tight">
                  Nuevo Envío
                </p>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Crear solicitud de transporte
                </p>
              </div>
              <ArrowRight
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "rgba(255,255,255,0.6)" }}
              />
            </button>

            {/* Summary strip — priority: Ofertas → Solicitudes → Próximo retiro */}
            <div className="grid grid-cols-3 gap-2">
              {/* 1. Ofertas — highest priority, requires action */}
              <button
                onClick={() => setMobileView("offers")}
                className="bg-white rounded-2xl p-3.5 text-center border border-gray-100 relative"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {pendingOffersCount > 0 && (
                  <span
                    className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#F58718" }}
                  />
                )}
                <p
                  className="text-2xl font-bold leading-none"
                  style={{ color: "#F58718" }}
                >
                  {pendingOffersCount}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">
                  Ofertas
                </p>
              </button>

              {/* 2. Solicitudes */}
              <button
                onClick={() => setMobileView("shipments")}
                className="bg-white rounded-2xl p-3.5 text-center border border-gray-100"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <p className="text-2xl font-bold text-gray-600 leading-none">
                  {openRequestsCount}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">
                  Solicitudes
                </p>
              </button>

              {/* 3. Próximo retiro */}
              <button
                onClick={() => setSelectedTripId(nextPickup.id)}
                className="bg-white rounded-2xl p-3.5 text-center border border-gray-100"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <p
                  className="text-lg font-bold leading-none"
                  style={{ color: "#1E5126" }}
                >
                  {nextPickup.day}/{nextPickup.month.slice(0, 3)}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium leading-tight">
                  Próx. retiro
                </p>
              </button>
            </div>

            {/* ── Active shipment hero card ──────────────────────────────── */}
            {heroShipment && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(140deg, #1E5126 0%, #08221A 100%)",
                  boxShadow: "0 6px 24px rgba(8,34,26,0.32)",
                }}
              >
                <div className="p-5">
                  {/* Top row: label + segmented toggle + shipment counter */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.42)" }}
                    >
                      Tu envío activo
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Resumen / Mapa segmented control */}
                      <div
                        className="flex rounded-lg p-0.5"
                        style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
                      >
                        <button
                          onClick={() => setShipmentViewMode("info")}
                          className="px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
                          style={{
                            backgroundColor:
                              shipmentViewMode === "info"
                                ? "white"
                                : "transparent",
                            color:
                              shipmentViewMode === "info"
                                ? "#1E5126"
                                : "rgba(255,255,255,0.55)",
                          }}
                        >
                          Resumen
                        </button>
                        <button
                          onClick={() => setShipmentViewMode("map")}
                          className="px-2.5 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                          style={{
                            backgroundColor:
                              shipmentViewMode === "map"
                                ? "white"
                                : "transparent",
                            color:
                              shipmentViewMode === "map"
                                ? "#1E5126"
                                : "rgba(255,255,255,0.55)",
                          }}
                        >
                          <Map className="w-3 h-3" />
                          Mapa
                        </button>
                      </div>
                      {inTransitShipments.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.32)" }}
                          >
                            {safeIdx + 1}/{inTransitShipments.length}
                          </span>
                          <button
                            onClick={() =>
                              setHeroShipmentIdx(
                                (i) => (i + 1) % inTransitShipments.length,
                              )
                            }
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.14)",
                            }}
                          >
                            <ChevronRight className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route — always visible */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-2xl font-bold text-white leading-tight">
                      {heroShipment.origin}
                    </span>
                    <ArrowRight
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "rgba(255,255,255,0.32)" }}
                    />
                    <span className="text-2xl font-bold text-white leading-tight">
                      {heroShipment.destination}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 mb-4"
                    style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}
                  >
                    <span className="font-mono">{heroShipment.id}</span>
                    <span>·</span>
                    <span>{heroShipment.distance} km</span>
                    <span>·</span>
                    <span>ETA {heroShipment.estimatedArrival}</span>
                  </div>

                  {/* ── Resumen view ── */}
                  {shipmentViewMode === "info" && (
                    <>
                      {/* Progress bar */}
                      <div className="mb-4">
                        <div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: "#F58718",
                              width: `${progressPercent}%`,
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.32)" }}
                          >
                            {heroShipment.origin}
                          </span>
                          <span
                            className="text-xs font-bold"
                            style={{ color: "#F58718" }}
                          >
                            {progressPercent}%
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.32)" }}
                          >
                            {heroShipment.destination}
                          </span>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {(
                          [
                            ["Cabezas", String(heroShipment.cattleCount)],
                            ["Tipo", heroShipment.cattleType],
                            ["Conductor", heroShipment.driver],
                            ["Distancia", `${heroShipment.distance} km`],
                          ] as [string, string][]
                        ).map(([label, val]) => (
                          <div
                            key={label}
                            className="rounded-xl p-3"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.18)",
                              border: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "rgba(255,255,255,0.34)",
                              }}
                            >
                              {label}
                            </p>
                            <p className="text-sm font-bold text-white mt-1 truncate">
                              {val}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* COTA checkpoints */}
                      {cotaByShipment[heroShipment.id] && (
                        <div className="mb-5">
                          <p
                            className="mb-3"
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "rgba(255,255,255,0.34)",
                            }}
                          >
                            Control COTA
                          </p>
                          <div className="flex items-start">
                            {cotaByShipment[heroShipment.id].map(
                              (cp, i, arr) => (
                                <div
                                  key={cp.label}
                                  className="flex items-start"
                                  style={{
                                    flex: i < arr.length - 1 ? 1 : "initial",
                                  }}
                                >
                                  <div className="flex flex-col items-center flex-shrink-0">
                                    <div
                                      className="w-5 h-5 rounded-full flex items-center justify-center"
                                      style={{
                                        backgroundColor: cp.done
                                          ? "rgba(255,255,255,0.2)"
                                          : cp.current
                                            ? "#F58718"
                                            : "rgba(255,255,255,0.07)",
                                        border: `2px solid ${cp.done ? "rgba(255,255,255,0.28)" : cp.current ? "#F58718" : "rgba(255,255,255,0.1)"}`,
                                      }}
                                    >
                                      {cp.done && (
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                      )}
                                      {cp.current && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                      )}
                                    </div>
                                    <p
                                      className="text-center mt-1 font-bold"
                                      style={{
                                        color: cp.done
                                          ? "rgba(255,255,255,0.48)"
                                          : cp.current
                                            ? "#F58718"
                                            : "rgba(255,255,255,0.18)",
                                        fontSize: 10,
                                      }}
                                    >
                                      {cp.label}
                                    </p>
                                    <p
                                      className="text-center"
                                      style={{
                                        color: "rgba(255,255,255,0.18)",
                                        fontSize: 10,
                                      }}
                                    >
                                      {cp.sub}
                                    </p>
                                  </div>
                                  {i < arr.length - 1 && (
                                    <div
                                      className="flex-1 h-0.5 mt-2.5 mx-1"
                                      style={{
                                        backgroundColor: cp.done
                                          ? "rgba(255,255,255,0.22)"
                                          : "rgba(255,255,255,0.07)",
                                      }}
                                    />
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Mapa view ── */}
                  {shipmentViewMode === "map" && (
                    <div className="mb-5">
                      <div
                        className="relative rounded-2xl overflow-hidden"
                        style={{ height: 200 }}
                      >
                        {(() => {
                          const origin = coordsForCity(heroShipment.origin);
                          const dest = coordsForCity(heroShipment.destination);
                          const markers: MapMarker[] = [];
                          const route: [number, number][] = [];
                          if (origin && dest) {
                            const pos = interpolate(
                              origin,
                              dest,
                              progressPercent,
                            );
                            markers.push({
                              id: "o",
                              lat: origin[0],
                              lng: origin[1],
                              type: "origin",
                              label: heroShipment.origin,
                            });
                            markers.push({
                              id: "d",
                              lat: dest[0],
                              lng: dest[1],
                              type: "destination",
                              label: heroShipment.destination,
                            });
                            markers.push({
                              id: "t",
                              lat: pos[0],
                              lng: pos[1],
                              type: "truck",
                              color: "#F58718",
                              label: heroShipment.id,
                            });
                            route.push(origin, dest);
                          }
                          return (
                            <MapView
                              height={200}
                              interactive={false}
                              markers={markers}
                              route={route}
                            />
                          );
                        })()}
                        {/* Progress overlay bar */}
                        <div
                          className="absolute bottom-0 left-0 right-0 px-3 pb-3"
                          style={{ zIndex: 500 }}
                        >
                          <div className="bg-black/60 rounded-xl p-3 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-white text-xs font-bold">
                                {heroShipment.origin} →{" "}
                                {heroShipment.destination}
                              </p>
                              <span
                                className="text-xs font-bold"
                                style={{ color: "#F58718" }}
                              >
                                {progressPercent}%
                              </span>
                            </div>
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.18)",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: "#F58718",
                                  width: `${progressPercent}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA — always visible */}
                  <button
                    onClick={() => setSelectedTripId(heroShipment.id)}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    Ver detalles del envío
                  </button>
                  {(heroShipment.status === "in-transit" ||
                    heroShipment.status === "accepted") && (
                    <button
                      onClick={() => setShowGanaderoCancel(true)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold mt-2"
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#FCA5A5",
                      }}
                    >
                      Cancelar viaje
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Offers preview ─────────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Ofertas</span>
                  {pendingOffersCount > 0 && (
                    <span
                      className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#F58718" }}
                    >
                      {pendingOffersCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMobileView("offers")}
                  className="text-sm font-semibold"
                  style={{ color: "#1E5126" }}
                >
                  Ver todas →
                </button>
              </div>
              <div className="space-y-2">
                {/* Live store offers first */}
                {pendingStoreOffers.slice(0, 1).map((offer) => {
                  const order = storeOrders.find((o) => o.id === offer.orderId);
                  const currentAmount =
                    offer.status === "rancher-countered"
                      ? offer.rounds[offer.rounds.length - 1]?.amount
                      : offer.amount;
                  const initials = offer.transporterName
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <div
                      key={offer.id}
                      className="bg-white rounded-2xl border border-gray-100 p-4"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                          style={{ backgroundColor: "#F58718" }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {offer.transporterName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {offer.orderId} · Ronda {offer.rounds.length}/3
                            {order ? ` · ${order.heads} cab` : ""}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className="font-bold text-sm"
                            style={{ color: "#1E5126" }}
                          >
                            {fmt(currentAmount)}
                          </p>
                          <span
                            className="text-xs font-bold"
                            style={{ color: "#F58718" }}
                          >
                            {offer.status === "rancher-countered"
                              ? "CONTRA"
                              : "NUEVA"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptOffer(offer.id)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: "#1E5126" }}
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => setSelectedOfferId(offer.id)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-700"
                        >
                          Ver oferta
                        </button>
                        <button
                          onClick={() => rejectOffer(offer.id)}
                          className="w-10 rounded-xl border border-gray-200 flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Hardcoded demo offers */}
                {staticOfferCards
                  .slice(0, pendingStoreOffers.length > 0 ? 1 : 2)
                  .map((o) => {
                    const initials = o.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    const isCounter = o.badge === "CONTRA";
                    return (
                      <button
                        key={o.id}
                        onClick={() => setSelectedOfferId(o.id)}
                        className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left"
                        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                            style={{
                              backgroundColor: isCounter
                                ? "#1E5126"
                                : "#F58718",
                            }}
                          >
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {o.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="font-semibold">{o.rating}</span>
                              <span>·</span>
                              <span>{o.sub}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className="font-bold text-sm"
                              style={{ color: "#1E5126" }}
                            >
                              {fmt(o.price)}
                            </p>
                            <span
                              className="text-xs font-bold"
                              style={{
                                color: isCounter ? "#1E5126" : "#F58718",
                              }}
                            >
                              {o.badge}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* ── Próximos retiros ───────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: "#1E5126" }} />
                  <span className="font-bold text-gray-900">
                    Próximos retiros
                  </span>
                </div>
                <button
                  onClick={() => setMobileView("shipments")}
                  className="text-sm font-semibold"
                  style={{ color: "#1E5126" }}
                >
                  Ver todos →
                </button>
              </div>
              <div className="space-y-2">
                {upcomingPickups.map((pickup) => (
                  <button
                    key={pickup.id}
                    onClick={() => setSelectedTripId(pickup.id)}
                    className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left flex items-center gap-4"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                      style={{ backgroundColor: "rgba(30,81,38,0.07)" }}
                    >
                      <p
                        className="text-lg font-bold leading-none"
                        style={{ color: "#1E5126" }}
                      >
                        {pickup.day}
                      </p>
                      <p
                        className="text-xs font-bold mt-0.5"
                        style={{ color: "rgba(30,81,38,0.5)" }}
                      >
                        {pickup.month}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {pickup.route}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-400">
                          {pickup.time} · {pickup.cattleCount} cab.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Acciones pendientes ─────────────────────────────────────── */}
            <div className="pb-2">
              <p className="font-bold text-gray-900 mb-3">
                Acciones pendientes
              </p>
              <div
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {pendingActions.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {item.icon === "alert" && (
                        <AlertCircle
                          className="w-4 h-4"
                          style={{ color: "#F58718" }}
                        />
                      )}
                      {item.icon === "check" && (
                        <CheckCircle2
                          className="w-4 h-4"
                          style={{ color: "#22C55E" }}
                        />
                      )}
                      {item.icon === "dot" && (
                        <div
                          className="w-2 h-2 rounded-full mt-1"
                          style={{ backgroundColor: "#9CA3AF" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{item.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.time}
                      </p>
                    </div>
                    {item.icon === "alert" && (
                      <button
                        onClick={() => setMobileView("offers")}
                        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                        style={{ backgroundColor: "#F58718" }}
                      >
                        Ver
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────── OFFERS ───────────────────────────────────── */}
        {mobileView === "offers" && (
          <RancherOffersView
            onBack={() => setMobileView("home")}
            onAcceptOffer={() => setMobileView("home")}
          />
        )}

        {/* ──────────────────────── SHIPMENTS ────────────────────────────────── */}
        {mobileView === "shipments" && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setMobileView("home")}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(30,81,38,0.08)" }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: "#1E5126" }} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Mis Envíos</h1>
            </div>
            <MisEnviosView compact />
          </div>
        )}

        {/* ──────────────────────── HISTORY ──────────────────────────────────── */}
        {mobileView === "history" && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setMobileView("home")}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(30,81,38,0.08)" }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: "#1E5126" }} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Historial</h1>
            </div>
            <div className="space-y-3">
              {[
                {
                  fecha: "15/03/2026",
                  orig: "Filadelfia",
                  dest: "Asunción",
                  cab: 45,
                  precio: "₲ 2.800.000",
                  ok: true,
                },
                {
                  fecha: "10/03/2026",
                  orig: "Loma Plata",
                  dest: "Concepción",
                  cab: 32,
                  precio: "₲ 1.950.000",
                  ok: true,
                },
                {
                  fecha: "05/03/2026",
                  orig: "Neuland",
                  dest: "Villa Hayes",
                  cab: 28,
                  precio: "₲ 1.650.000",
                  ok: false,
                },
                {
                  fecha: "28/02/2026",
                  orig: "Asunción",
                  dest: "Filadelfia",
                  cab: 52,
                  precio: "₲ 3.200.000",
                  ok: true,
                },
                {
                  fecha: "22/02/2026",
                  orig: "Mariscal Estigarribia",
                  dest: "Concepción",
                  cab: 38,
                  precio: "₲ 2.400.000",
                  ok: true,
                },
              ].map((item) => (
                <div
                  key={item.fecha + item.orig}
                  className="bg-white rounded-2xl border border-gray-100 p-4"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {item.orig} → {item.dest}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.fecha} · {item.cab} cab.
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-lg text-white ml-3 flex-shrink-0"
                      style={{
                        backgroundColor: item.ok ? "#1E5126" : "#ef4444",
                      }}
                    >
                      {item.ok ? "Completado" : "Cancelado"}
                    </span>
                  </div>
                  <p className="font-bold text-sm" style={{ color: "#1E5126" }}>
                    {item.precio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────────────── REPORTS ──────────────────────────────────── */}
        {mobileView === "reports" && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setMobileView("home")}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(30,81,38,0.08)" }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: "#1E5126" }} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Reportes</h1>
            </div>
            <div className="space-y-3 mb-5">
              {(
                [
                  {
                    icon: Truck,
                    label: "Total transportado este año",
                    value: "142 cabezas",
                    color: "#1E5126",
                  },
                  {
                    icon: TrendingUp,
                    label: "Gasto total",
                    value: "₲ 89.500.000",
                    color: "#F58718",
                  },
                  {
                    icon: CheckCircle2,
                    label: "Transportista más usado",
                    value: "Transp. González",
                    color: "#1E5126",
                  },
                  {
                    icon: MapPin,
                    label: "Ruta más frecuente",
                    value: "Filadelfia — Asunción",
                    color: "#F58718",
                  },
                ] as {
                  icon: LucideIcon;
                  label: string;
                  value: string;
                  color: string;
                }[]
              ).map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}14` }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-bold text-gray-900 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                backgroundColor: "rgba(30,81,38,0.06)",
                border: "1px solid rgba(30,81,38,0.1)",
              }}
            >
              <p className="text-sm text-gray-600">
                Reportes detallados disponibles próximamente
              </p>
            </div>
          </div>
        )}

        {/* ──────────────────────── SUPPORT ──────────────────────────────────── */}
        {mobileView === "support" && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setMobileView("home")}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(30,81,38,0.08)" }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: "#1E5126" }} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Soporte</h1>
            </div>
            <div className="space-y-3 mb-6">
              {(
                [
                  {
                    href: "https://wa.me/595211234567",
                    icon: MessageCircle,
                    label: "WhatsApp",
                    sub: "+595 21 123 4567",
                    bg: "#25D366",
                    iconColor: "#fff",
                  },
                  {
                    href: "mailto:soporte@tropero.com.py",
                    icon: Mail,
                    label: "Email",
                    sub: "soporte@tropero.com.py",
                    bg: "#f3f4f6",
                    iconColor: "#374151",
                  },
                  {
                    href: "#",
                    icon: ExternalLink,
                    label: "Centro de ayuda",
                    sub: "Documentación y guías",
                    bg: "rgba(30,81,38,0.08)",
                    iconColor: "#1E5126",
                  },
                ] as {
                  href: string;
                  icon: LucideIcon;
                  label: string;
                  sub: string;
                  bg: string;
                  iconColor: string;
                }[]
              ).map(({ href, icon: Icon, label, sub, bg, iconColor }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 no-underline"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{label}</p>
                    <p className="text-sm text-gray-400">{sub}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </a>
              ))}
            </div>
            <p className="font-bold text-gray-900 mb-3">Preguntas frecuentes</p>
            <div className="space-y-2">
              {[
                [
                  "¿Cómo funciona TROPEX?",
                  "TROPEX conecta ganaderos con transportistas verificados. Creás una solicitud de transporte, recibís ofertas y elegís la mejor opción.",
                ],
                [
                  "¿Cuándo pago por el transporte?",
                  "Los ganaderos no pagan comisión a TROPEX. El pago al transportista se coordina directamente según lo acordado.",
                ],
                [
                  "¿Qué documentos necesito?",
                  "Se requiere la Guía de Traslado (SENACSA) y el Certificado de Tránsito Animal (COTA). La plataforma te ayuda a verificar que estén en orden.",
                ],
              ].map(([q, a]) => (
                <details
                  key={q}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  <summary className="px-4 py-4 font-medium text-gray-900 cursor-pointer text-sm">
                    {q}
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-500 border-t border-gray-50 pt-3">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {mobileView === "cuenta" && (
          <GanaderoAccount
            userName={userName}
            onLogout={onLogout}
            onBack={() => setMobileView("home")}
            subTypeLabel={subTypeLabel}
            initialData={accountInitialData}
          />
        )}
      </main>

      {/* ── BOTTOM NAV ──────────────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100"
        style={{
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="grid grid-cols-4 h-14">
          {[
            {
              icon: LayoutDashboard,
              label: "Panel",
              view: "home" as MobileView,
            },
            {
              icon: Bell,
              label: "Ofertas",
              view: "offers" as MobileView,
              badge: pendingOffersCount,
            },
            { icon: Truck, label: "Envíos", view: "shipments" as MobileView },
          ].map(({ icon: Icon, label, view, badge }) => {
            const active = mobileView === view;
            return (
              <button
                key={label}
                onClick={() => setMobileView(view)}
                className="flex flex-col items-center justify-center relative"
              >
                {active && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: "#1E5126" }}
                  />
                )}
                <div className="relative">
                  <Icon
                    className="w-5 h-5"
                    style={{ color: active ? "#1E5126" : "#9CA3AF" }}
                  />
                  {badge != null && badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full border border-white"
                      style={{ backgroundColor: "#F58718" }}
                    />
                  )}
                </div>
                <span
                  className="text-xs mt-1 font-medium"
                  style={{ color: active ? "#1E5126" : "#9CA3AF" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setShowMoreDrawer(true)}
            className="flex flex-col items-center justify-center relative"
          >
            {isSecondaryView && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: "#1E5126" }}
              />
            )}
            <Menu
              className="w-5 h-5"
              style={{ color: isSecondaryView ? "#1E5126" : "#9CA3AF" }}
            />
            <span
              className="text-xs mt-1 font-medium"
              style={{ color: isSecondaryView ? "#1E5126" : "#9CA3AF" }}
            >
              Más
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
