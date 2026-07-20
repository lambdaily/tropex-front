import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Beef, X, ArrowLeft, CheckCircle2, AlertTriangle, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { AutocompleteInput, AutocompleteOption } from '@/app/components/ui/autocomplete-input';
import { useMyEstablishment } from '@/features/my-establishment/hooks/useMyEstablishment';
import { useCreateTransportRequest } from '../hooks/useCreateTransportRequest';
import { useTransportCatalogs } from '../hooks/useTransportCatalogs';
import type { CreateTransportRequestPayload } from '../types/transport-request.types';
import { guideLimitFor, exceedsGuideLimit, DEMO_PRICING, estimateReferencePrice } from '@/app/config/business';
import { MapView } from '@/app/components/MapView';
import { toast } from 'sonner';
import { catalogLabel, guideDraftsFor, guidesAreValid, parseHeads } from '../utils/livestock';
import { getTodayInputValue, isDateOnOrAfterToday } from '../utils/dates';

interface TransportRequestWizardProps {
  onClose: () => void;
}

export function TransportRequestWizard({ onClose }: TransportRequestWizardProps) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Step 1 - Origin
    originEstablishmentType: '',
    originEstablishmentId: '',
    originLocation: '',
    originDepartment: '',
    pickupDate: '',
    // Step 2 - Destination
    destinationLocation: '',
    destinationEstablishmentId: '',
    destinationType: '',
    // Step 3 - Livestock
    cattleCount: '',
    cattleType: '', // desmamantes o gordos
    estimatedWeight: '',
    specialNotes: '',
    // Step 4 - Preferences
    truckType: '',
    flexibleWindow: '',
    additionalNotes: '',
    // SENACSA guide split
    guide1Heads: '',
    guide2Heads: '',
  });

  const [originPin, setOriginPin] = useState<[number, number] | null>(null);
  const [destPin, setDestPin] = useState<[number, number] | null>(null);

  const totalSteps = 4;

  const createMutation = useCreateTransportRequest();
  const { data: establishments } = useMyEstablishment();
  const catalogs = useTransportCatalogs();
  const establishmentTypeOptions = useMemo(() => {
    const options = [
      ...(catalogs.establishmentTypes.data ?? []),
      { value: 'mi_establecimiento', label: 'Mi establecimiento' },
    ];
    return options.filter((option, index, all) => (
      all.findIndex((candidate) => candidate.value === option.value) === index
    ));
  }, [catalogs.establishmentTypes.data]);
  const catalogEstablishments = catalogs.establishments.data ?? [];
  const catalogFrigorificos = catalogs.frigorificos.data ?? [];
  const establishmentOptions: AutocompleteOption[] = useMemo(
    () => catalogEstablishments.map((establishment) => ({
      code: String(establishment.id),
      name: establishment.name,
      display: [establishment.name, establishment.department].filter(Boolean).join(' · '),
    })),
    [catalogEstablishments]
  );
  const frigorificoOptions = useMemo(
    () => catalogFrigorificos.map((establishment) => ({
      code: String(establishment.id),
      name: establishment.name,
      display: [establishment.name, establishment.department].filter(Boolean).join(' · '),
    })),
    [catalogFrigorificos]
  );

  // SENACSA split logic
  const needsSplit = useMemo(() => {
    const count = parseHeads(formData.cattleCount);
    return exceedsGuideLimit(formData.cattleType, count);
  }, [formData.cattleCount, formData.cattleType]);

  const guideLimit = guideLimitFor(formData.cattleType);

  // Auto-suggest equal split when heads/type changes
  useEffect(() => {
    const count = parseInt(formData.cattleCount) || 0;
    const limit = guideLimitFor(formData.cattleType);
    const isSplit = exceedsGuideLimit(formData.cattleType, count);
    if (isSplit) {
      const g1 = Math.min(limit, count);
      const g2 = count - g1;
      setFormData(prev => ({ ...prev, guide1Heads: String(g1), guide2Heads: String(g2) }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cattleCount, formData.cattleType]);

  const selectEstablishment = (option: AutocompleteOption, field: 'origin' | 'destination') => {
    const selected = [...catalogEstablishments, ...catalogFrigorificos]
      .find((establishment) => String(establishment.id) === option.code);
    if (!selected) return;
    const latitude = selected.latitude == null ? null : Number(selected.latitude);
    const longitude = selected.longitude == null ? null : Number(selected.longitude);
    setFormData((previous) => field === 'origin'
      ? { ...previous, originEstablishmentId: String(selected.id), originLocation: selected.name, originDepartment: selected.department || '' }
      : { ...previous, destinationEstablishmentId: String(selected.id), destinationLocation: selected.name });
    if (field === 'origin' && latitude != null && longitude != null) setOriginPin([latitude, longitude]);
    if (field === 'destination' && latitude != null && longitude != null) setDestPin([latitude, longitude]);
  };

  const setMyEstablishmentLocation = (field: 'origin' | 'destination') => {
    const establishment = establishments?.[0];
    if (!establishment || establishment.latitude == null || establishment.longitude == null) return;
    const point: [number, number] = [Number(establishment.latitude), Number(establishment.longitude)];
    if (field === 'origin') setOriginPin(point);
    else setDestPin(point);
  };

  const originNeedsMap = Boolean(formData.originEstablishmentType);
  const originNeedsCatalogSelection = ['campo', 'frigorifico'].includes(formData.originEstablishmentType);
  const destinationNeedsMap = Boolean(formData.destinationType);
  const destinationNeedsCatalogSelection = ['campo', 'estancia', 'frigorifico'].includes(formData.destinationType);
  const today = getTodayInputValue();
  const pickupDateIsInvalid = Boolean(formData.pickupDate) && !isDateOnOrAfterToday(formData.pickupDate, today);

  // Cálculo de precio
  const calculatePrice = () => {
    const heads = parseInt(formData.cattleCount) || 0;
    const distance = DEMO_PRICING.defaultDistanceKm;
    const totalForRancher = estimateReferencePrice(heads, distance);
    return { totalForRancher, distance, heads };
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    const count = parseInt(formData.cattleCount) || 0;
    const guides = guideDraftsFor(
      formData.cattleType,
      count,
      formData.guide1Heads,
      formData.guide2Heads,
    );
    const payload: CreateTransportRequestPayload = {
      origin: {
        type: formData.originEstablishmentType || 'campo',
        establishment_id: Number(formData.originEstablishmentId) || undefined,
        name: formData.originLocation || 'Sin especificar',
        department: formData.originDepartment || undefined,
        latitude: originPin?.[0] ?? null,
        longitude: originPin?.[1] ?? null,
      },
      destination: {
        type: formData.destinationType || 'otro',
        establishment_id: Number(formData.destinationEstablishmentId) || undefined,
        name: formData.destinationLocation || 'Sin especificar',
        latitude: destPin?.[0] ?? null,
        longitude: destPin?.[1] ?? null,
      },
      cattle_type: formData.cattleType,
      cattle_type_label: catalogLabel(
        catalogs.cattleTypes.data,
        formData.cattleType,
        formData.cattleType,
      ),
      heads: count,
      pickup_date: formData.pickupDate || '',
      truck_type: formData.truckType || undefined,
      flexibility: formData.flexibleWindow || undefined,
      notes: [formData.specialNotes, formData.additionalNotes].filter(Boolean).join('\n') || undefined,
      estimated_weight_per_head: Number(formData.estimatedWeight) || undefined,
      guides,
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success('¡Solicitud de transporte creada! Los transportistas la verán en sus paneles de viajes disponibles.');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al crear la solicitud';
      setError(msg);
    }
  };

  // Validación por paso
  const isStepValid = () => {
    switch (step) {
      case 1:
        return Boolean(formData.originEstablishmentType
          && formData.originLocation
          && isDateOnOrAfterToday(formData.pickupDate, today)
          && (!originNeedsCatalogSelection || formData.originEstablishmentId)
          && (!originNeedsMap || originPin));
      case 2:
        return Boolean(formData.destinationLocation && formData.destinationType && (!destinationNeedsCatalogSelection || formData.destinationEstablishmentId) && (!destinationNeedsMap || destPin));
      case 3: {
        if (!formData.cattleCount || !formData.cattleType) return false;
        const count = parseHeads(formData.cattleCount);
        if (count <= 0) return false;
        const weight = parseInt(formData.estimatedWeight) || 0;
        if (weight <= 0) return false;
        return guidesAreValid(
          formData.cattleType,
          count,
          guideDraftsFor(formData.cattleType, count, formData.guide1Heads, formData.guide2Heads),
        );
      }
      case 4:
        return true;
      default:
        return false;
    }
  };

  const stepNames = ['Origen', 'Destino', 'Ganado', 'Confirmación'];
  const selectedCattleTypeLabel = catalogLabel(
    catalogs.cattleTypes.data,
    formData.cattleType,
    formData.cattleType || '—',
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F6F1E8' }}>
      {/* Header */}
      <div className="bg-white px-4 lg:px-6 py-4" style={{ borderBottom: '2px solid #1E5126' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1E512615' }}>
              <Beef className="w-6 h-6" style={{ color: '#1E5126' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Nueva solicitud de transporte</h1>
              <p className="text-sm text-gray-600">Paso {step} de {totalSteps} · Conectado al backend</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex-1">
                <div
                  className={`h-2 rounded-full ${index < step ? '' : 'bg-gray-200'}`}
                  style={index < step ? { backgroundColor: '#1E5126' } : {}}
                />
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2">
            {stepNames.map((name, index) => (
              <div
                key={index}
                className="flex-1 text-center text-xs"
                style={index === step - 1 ? { color: '#1E5126', fontWeight: 600 } : { color: '#9ca3af' }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
          {/* Error banner */}
          {error && (
            <div className="mb-4 p-3 rounded-lg flex items-start gap-2" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#B91C1C' }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: '#B91C1C' }}>Error</div>
                <div className="text-xs mt-0.5" style={{ color: '#B91C1C' }}>{error}</div>
              </div>
            </div>
          )}

          {/* Step 1 - Origin */}
          {step === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8" style={{ borderTop: '3px solid #1E5126' }}>
              <h2 className="text-2xl font-bold mb-2">Origen del transporte</h2>
              <p className="text-gray-600 mb-6">Desde dónde se recogerá el ganado</p>

              <div className="space-y-5">
                {/* Tipo de establecimiento de origen */}
                <div>
                  <Label htmlFor="originEstablishmentType">Tipo de establecimiento de origen *</Label>
                  <Select
                    value={formData.originEstablishmentType}
                    onValueChange={(value) => {
                      if (value === 'mi_establecimiento') {
                        const est = establishments?.[0];
                        setFormData({
                          ...formData,
                          originEstablishmentType: value,
                          originEstablishmentId: est?.id ? String(est.id) : '',
                          originLocation: est?.name || '',
                          originDepartment: est?.department || '',
                        });
                        setMyEstablishmentLocation('origin');
                      } else {
                        setFormData({
                          ...formData,
                          originEstablishmentType: value,
                          originEstablishmentId: '',
                          originLocation: '',
                          originDepartment: '',
                        });
                        setOriginPin(null);
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Seleccioná el tipo de establecimiento" />
                    </SelectTrigger>
                    <SelectContent>
                      {establishmentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mapa selector de ubicación */}
                <div>
                  <Label>Ubicación en el mapa</Label>
                  <div className="mt-1.5 w-full rounded-lg border border-gray-300 overflow-hidden">
                    <MapView
                      heightClassName="transport-request-map-height"
                      fitToContent={false}
                      recenterOnMarkerChange
                      onMapClick={(lat, lng) => setOriginPin([lat, lng])}
                      searchable
                      searchPlaceholder="Buscá una ubicación de origen"
                      markers={originPin ? [{ id: 'origin', lat: originPin[0], lng: originPin[1], type: 'origin', label: 'Origen', draggable: true }] : []}
                      onMarkerDragEnd={(_, lat, lng) => setOriginPin([lat, lng])}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {originPin ? `Ubicación marcada: ${originPin[0].toFixed(4)}, ${originPin[1].toFixed(4)}` : 'Hacé click o usá el buscador del mapa para marcar la ubicación.'}
                  </p>
                  {originNeedsMap && !originPin && (
                    <p className="text-xs text-red-600 mt-1">Para este tipo de origen tenés que marcar una referencia en el mapa.</p>
                  )}
                </div>

                {/* Conditional origin location input */}
                {formData.originEstablishmentType === 'campo' && (
                  <>
                    <AutocompleteInput
                      id="originLocation"
                      label="Ubicación del establecimiento *"
                      placeholder="Buscá por código o nombre del establecimiento"
                      value={formData.originLocation}
                      onInputChange={() => setOriginPin(null)}
                      onSelect={(option) => selectEstablishment(option, 'origin')}
                      options={establishmentOptions}
                      required
                    />
                    <div>
                      <Label htmlFor="originDepartment">Departamento *</Label>
                      <Select value={formData.originDepartment} onValueChange={(value) => setFormData({ ...formData, originDepartment: value })}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Seleccioná el departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CENTRAL">Central</SelectItem>
                          <SelectItem value="CONCEPCION">Concepción</SelectItem>
                          <SelectItem value="BOQUERON">Boquerón</SelectItem>
                          <SelectItem value="PDTE. HAYES">Presidente Hayes</SelectItem>
                          <SelectItem value="ALTO PARAGUAY">Alto Paraguay</SelectItem>
                          <SelectItem value="SAN PEDRO">San Pedro</SelectItem>
                          <SelectItem value="CAAGUAZU">Caaguazú</SelectItem>
                          <SelectItem value="ALTO PARANA">Alto Paraná</SelectItem>
                          <SelectItem value="AMAMBAY">Amambay</SelectItem>
                          <SelectItem value="PARAGUARI">Paraguarí</SelectItem>
                          <SelectItem value="CANINDEYU">Canindeyú</SelectItem>
                          <SelectItem value="MISIONES">Misiones</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {formData.originEstablishmentType === 'frigorifico' && (
                  <AutocompleteInput
                    id="originLocation"
                    label="Frigorífico verificado por SENACSA *"
                    placeholder="Buscá por nombre del frigorífico..."
                    value={formData.originLocation}
                    onInputChange={() => setOriginPin(null)}
                    onSelect={(option) => selectEstablishment(option, 'origin')}
                    options={frigorificoOptions}
                    required
                  />
                )}

                {(formData.originEstablishmentType === 'feria' || formData.originEstablishmentType === 'otro') && (
                  <div>
                    <Label htmlFor="originLocation">Ubicación del establecimiento *</Label>
                    <Input
                      id="originLocation"
                      value={formData.originLocation}
                      onChange={(e) => {
                        setOriginPin(null);
                        setFormData({ ...formData, originLocation: e.target.value });
                      }}
                      placeholder="Ej: Feria Ganadera del Este, CDE"
                      required
                      className="mt-1.5"
                    />
                  </div>
                )}

                {formData.originEstablishmentType === 'mi_establecimiento' && (
                  <div className="rounded-lg border p-4" style={{ backgroundColor: 'rgba(30,81,38,0.06)', borderColor: 'rgba(30,81,38,0.18)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(30,81,38,0.5)' }}>MI ESTABLECIMIENTO</p>
                    <p className="text-sm font-semibold" style={{ color: '#1E5126' }}>
                      {formData.originLocation || 'Sin establecer'}
                    </p>
                    {formData.originDepartment && (
                      <p className="text-xs text-gray-500 mt-0.5">{formData.originDepartment}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="pickupDate">Fecha de carga *</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    min={today}
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                  {pickupDateIsInvalid && (
                    <p className="text-xs text-red-600 mt-1">La fecha de carga no puede ser anterior a hoy.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Destination */}
          {step === 2 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8" style={{ borderTop: '3px solid #1E5126' }}>
              <h2 className="text-2xl font-bold mb-2">Destino del transporte</h2>
              <p className="text-gray-600 mb-6">A dónde se llevará el ganado</p>

              <div className="space-y-5">
                {/* Mapa selector de destino */}
                <div>
                  <Label>Ubicación del destino en el mapa</Label>
                  <div className="mt-1.5 w-full rounded-lg border border-gray-300 overflow-hidden">
                    <MapView
                      heightClassName="transport-request-map-height"
                      fitToContent={false}
                      recenterOnMarkerChange
                      onMapClick={(lat, lng) => setDestPin([lat, lng])}
                      searchable
                      searchPlaceholder="Buscá una ubicación de destino"
                      markers={destPin ? [{ id: 'dest', lat: destPin[0], lng: destPin[1], type: 'destination', label: 'Destino', draggable: true }] : []}
                      onMarkerDragEnd={(_, lat, lng) => setDestPin([lat, lng])}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {destPin ? `Destino marcado: ${destPin[0].toFixed(4)}, ${destPin[1].toFixed(4)}` : 'Hacé click o usá el buscador del mapa para marcar la ubicación.'}
                  </p>
                  {destinationNeedsMap && !destPin && (
                    <p className="text-xs text-red-600 mt-1">Tenés que marcar una referencia del destino en el mapa.</p>
                  )}
                </div>

                {/* Tipo de destino */}
                <div>
                  <Label htmlFor="destinationType">Tipo de destino (Categorías) *</Label>
                  <Select
                    value={formData.destinationType}
                    onValueChange={(value) => {
                      if (value === 'mi_establecimiento') {
                        const est = establishments?.[0];
                        setFormData({
                          ...formData,
                          destinationType: value,
                          destinationEstablishmentId: est?.id ? String(est.id) : '',
                          destinationLocation: est?.name || '',
                        });
                        setMyEstablishmentLocation('destination');
                      } else {
                        setFormData({
                          ...formData,
                          destinationType: value,
                          destinationEstablishmentId: '',
                          destinationLocation: '',
                        });
                        setDestPin(null);
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Seleccioná el tipo de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {establishmentTypeOptions.map((option) => (
                        <SelectItem key={`destination-${option.value}`} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ubicación de destino */}
                {formData.destinationType === 'frigorifico' ? (
                  <AutocompleteInput
                    id="destinationLocation"
                    label="Frigorífico verificado por SENACSA *"
                    placeholder="Buscá por nombre del frigorífico..."
                    value={formData.destinationLocation}
                    onInputChange={() => setDestPin(null)}
                    onSelect={(option) => selectEstablishment(option, 'destination')}
                    options={frigorificoOptions}
                    required
                  />
                ) : formData.destinationType === 'mi_establecimiento' ? (
                  <div className="rounded-lg border p-4" style={{ backgroundColor: 'rgba(30,81,38,0.06)', borderColor: 'rgba(30,81,38,0.18)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(30,81,38,0.5)' }}>MI ESTABLECIMIENTO</p>
                    <p className="text-sm font-semibold" style={{ color: '#1E5126' }}>
                      {formData.destinationLocation || 'Sin establecer'}
                    </p>
                  </div>
                ) : ['campo', 'estancia'].includes(formData.destinationType) ? (
                  <AutocompleteInput
                    id="destinationLocation"
                    label="Establecimiento de destino *"
                    placeholder="Buscá por código o nombre del establecimiento"
                    value={formData.destinationLocation}
                    onInputChange={() => setDestPin(null)}
                    onSelect={(option) => selectEstablishment(option, 'destination')}
                    options={establishmentOptions}
                    required
                  />
                ) : formData.destinationType ? (
                  <div>
                    <Label htmlFor="destinationLocation">Ubicación de destino *</Label>
                    <Input
                      id="destinationLocation"
                      value={formData.destinationLocation}
                      onChange={(e) => {
                        setDestPin(null);
                        setFormData({ ...formData, destinationLocation: e.target.value });
                      }}
                      placeholder="Ej: Mercado Central, Asunción"
                      required
                      className="mt-1.5"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Step 3 - Livestock Details */}
          {step === 3 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8" style={{ borderTop: '3px solid #1E5126' }}>
              <h2 className="text-2xl font-bold mb-2">Detalles del ganado</h2>
              <p className="text-gray-600 mb-6">Información sobre la carga</p>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="cattleCount">Cantidad de cabezas *</Label>
                  <Input
                    id="cattleCount"
                    type="number"
                    min="1"
                    value={formData.cattleCount}
                    onChange={(e) => setFormData({ ...formData, cattleCount: e.target.value })}
                    placeholder="Ej: 45"
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="cattleType">Tipo de ganado *</Label>
                  <Select value={formData.cattleType} onValueChange={(value) => setFormData({ ...formData, cattleType: value })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Seleccioná tipo de ganado" />
                    </SelectTrigger>
                    <SelectContent>
                      {(catalogs.cattleTypes.data ?? []).map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SENACSA Guide Split UI */}
                {needsSplit && (
                  <div className="rounded-lg border-2 border-amber-300 p-5" style={{ backgroundColor: '#fffbeb' }}>
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-900 mb-1">División de guías SENACSA requerida</h4>
                        <p className="text-sm text-amber-800">
                          Por regulación SENACSA, el máximo por guía es <strong>{guideLimit} cabezas</strong> ({formData.cattleType === 'fat' ? 'Gordos' : 'Desmamantes'}).
                          Tu pedido de <strong>{formData.cattleCount} cabezas</strong> requiere 2 guías. Distribuí las cabezas entre ambas:
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guide1Heads">Guía 1 — cabezas</Label>
                        <Input
                          id="guide1Heads"
                          type="number"
                          min="1"
                          max={guideLimit}
                          value={formData.guide1Heads}
                          onChange={(e) => {
                            const total = parseInt(formData.cattleCount) || 0;
                            const g1 = Math.min(Math.max(0, parseInt(e.target.value) || 0), guideLimit);
                            const g2 = Math.max(0, total - g1);
                            setFormData({ ...formData, guide1Heads: String(g1), guide2Heads: String(g2) });
                          }}
                          className="mt-1.5"
                        />
                        <p className="text-xs text-amber-700 mt-1">Máx. {guideLimit} cabezas</p>
                      </div>
                      <div>
                        <Label htmlFor="guide2Heads">Guía 2 — cabezas</Label>
                        <Input
                          id="guide2Heads"
                          type="number"
                          min="1"
                          max={guideLimit}
                          value={formData.guide2Heads}
                          onChange={(e) => {
                            const total = parseInt(formData.cattleCount) || 0;
                            const g2 = Math.min(Math.max(0, parseInt(e.target.value) || 0), guideLimit);
                            const g1 = Math.max(0, total - g2);
                            setFormData({ ...formData, guide1Heads: String(g1), guide2Heads: String(g2) });
                          }}
                          className="mt-1.5"
                        />
                        <p className="text-xs text-amber-700 mt-1">Máx. {guideLimit} cabezas</p>
                      </div>
                    </div>

                    {formData.guide1Heads && formData.guide2Heads && (() => {
                      const total = parseInt(formData.cattleCount) || 0;
                      const g1 = parseInt(formData.guide1Heads) || 0;
                      const g2 = parseInt(formData.guide2Heads) || 0;
                      const sum = g1 + g2;
                      const valid = sum === total && g1 > 0 && g2 > 0 && g1 <= guideLimit && g2 <= guideLimit;
                      return (
                        <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {valid
                            ? `✓ Guía 1: ${g1} cabezas + Guía 2: ${g2} cabezas = ${total} cabezas totales`
                            : sum !== total
                              ? `⚠ La suma (${sum}) no coincide con el total (${total})`
                              : `⚠ Cada guía debe tener entre 1 y ${guideLimit} cabezas`
                          }
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div>
                  <Label htmlFor="estimatedWeight">Peso Aproximado por animal (Kg) *</Label>
                  <Input
                    id="estimatedWeight"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 420"
                    value={formData.estimatedWeight ? parseInt(formData.estimatedWeight).toLocaleString('de-DE') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, estimatedWeight: raw });
                    }}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Peso promedio por animal en kg</p>
                </div>

                <div>
                  <Label htmlFor="specialNotes">Notas especiales de manejo (Opcional)</Label>
                  <Textarea
                    id="specialNotes"
                    value={formData.specialNotes}
                    onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                    placeholder="Ej: Ganado preñado, manejo suave requerido"
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mb-4 bg-white rounded-xl p-5 border border-gray-200 space-y-4">
              <div>
                <Label htmlFor="truckType">Tipo de camión preferido</Label>
                <Select value={formData.truckType} onValueChange={(value) => setFormData({ ...formData, truckType: value })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Cualquier camión compatible" /></SelectTrigger>
                  <SelectContent>
                    {(catalogs.truckTypes.data ?? []).map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="flexibleWindow">Flexibilidad de fecha</Label>
                <Select value={formData.flexibleWindow} onValueChange={(value) => setFormData({ ...formData, flexibleWindow: value })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Seleccioná una opción" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exacta">Fecha exacta</SelectItem>
                    <SelectItem value="un_dia">± 1 día</SelectItem>
                    <SelectItem value="tres_dias">± 3 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4 - Price & Confirmation */}
          {step === 4 && (() => {
            const { totalForRancher, distance, heads } = calculatePrice();
            const formatPrice = (price: number) => {
              return new Intl.NumberFormat('es-PY').format(Math.round(price));
            };

            const totalWeight = ((parseHeads(formData.estimatedWeight) || 380) * parseHeads(formData.cattleCount)).toLocaleString('de-DE');
            const cattleTypeLabel = selectedCattleTypeLabel;

            return (
              <div className="space-y-4">
                {/* 1 — Resumen del pedido */}
                <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Resumen del pedido</p>

                  {/* Route */}
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#1E5126' }} />
                    <span className="text-sm font-medium text-gray-800 truncate">{formData.originLocation || '-'}</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <MapPin className="w-4 h-4 flex-shrink-0 text-red-500" />
                    <span className="text-sm font-medium text-gray-800 truncate">{formData.destinationLocation || '-'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Fecha de carga</span>
                      <p className="font-medium text-gray-900">{formData.pickupDate || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tipo y cabezas</span>
                      <p className="font-medium text-gray-900">{formData.cattleCount || '-'} {cattleTypeLabel}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Peso total</span>
                      <p className="font-medium text-gray-900">{totalWeight} kg total</p>
                    </div>
                    {(formData.additionalNotes || formData.specialNotes) && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Notas</span>
                        <p className="font-medium text-gray-900">{formData.additionalNotes || formData.specialNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2 — Estimación de precio */}
                <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(30,81,38,0.07)', border: '1px solid rgba(30,81,38,0.18)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#1E5126' }}>Estimación de precio</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distancia estimada</span>
                      <span className="font-medium text-gray-900">{distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cabezas</span>
                      <span className="font-medium text-gray-900">{heads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarifa</span>
                      <span className="font-medium text-gray-900">₲ {DEMO_PRICING.pricePerKmPerHead} / km / cab.</span>
                    </div>
                    <div className="border-t my-2" style={{ borderColor: 'rgba(30,81,38,0.2)' }}></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base" style={{ color: '#1E5126' }}>Total estimado</span>
                      <span className="font-bold text-xl" style={{ color: '#1E5126' }}>₲ {formatPrice(totalForRancher)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Precio de referencia. Los transportistas harán sus ofertas y vos elegís.</p>
                </div>

                {/* 3 — ¿Cómo funciona? */}
                <div className="px-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">¿Cómo funciona?</p>
                  <p className="text-sm text-gray-600">Al publicar, los transportistas disponibles verán tu solicitud y enviarán ofertas. Vos aceptás la que más te convenga.</p>
                </div>

                {/* 4 — Política de cancelación */}
                <div className="rounded-lg p-4 bg-amber-50" style={{ borderLeft: '3px solid #D97706' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">Política de cancelación</p>
                  <p className="text-xs text-amber-800">Si cancelás después de que un transportista aceptó el viaje sin causa justificada, se puede aplicar una tarifa del 2% del costo del transporte.</p>
                </div>

                {/* 5 — Publicar */}
                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending}
                    className="w-full py-3 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ backgroundColor: '#1E5126' }}
                  >
                    {createMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                    {createMutation.isPending ? 'Publicando...' : 'Publicar solicitud'}
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-2">Al publicar, aceptás los términos de la plataforma.</p>
                </div>
              </div>
            );
          })()}
            </div>

            {/* Resumen lateral - Desktop only */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="rounded-lg p-4 sticky top-4" style={{ backgroundColor: '#F6F1E8', border: '1px solid #d4c9b8' }}>
                <h3 className="font-bold text-black mb-4">Tu solicitud</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Tipo de origen</div>
                    <div className="text-sm font-medium text-black">
                      {catalogLabel(establishmentTypeOptions, formData.originEstablishmentType)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Origen</div>
                    <div className="text-sm font-medium text-black">{formData.originLocation || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Departamento</div>
                    <div className="text-sm font-medium text-black">{formData.originDepartment || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Fecha de carga</div>
                    <div className="text-sm font-medium text-black">{formData.pickupDate || '—'}</div>
                  </div>
                  <div className="border-t pt-3" style={{ borderColor: '#d4c9b8' }}>
                    <div className="text-xs text-gray-500">Destino</div>
                    <div className="text-sm font-medium text-black">{formData.destinationLocation || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Tipo de destino</div>
                    <div className="text-sm font-medium text-black">
                      {catalogLabel(establishmentTypeOptions, formData.destinationType)}
                    </div>
                  </div>
                  <div className="border-t pt-3" style={{ borderColor: '#d4c9b8' }}>
                    <div className="text-xs text-gray-500">Cabezas</div>
                    <div className="text-sm font-medium text-black">{formData.cattleCount || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Tipo de ganado</div>
                    <div className="text-sm font-medium text-black">
                      {selectedCattleTypeLabel}
                    </div>
                  </div>
                  {step === 4 && formData.cattleCount && (
                    <div className="border-t pt-3 mt-4" style={{ borderColor: '#d4c9b8' }}>
                      <div className="text-xs text-gray-500 mb-1">Precio estimado</div>
                      <div className="text-xl font-bold" style={{ color: '#1E5126' }}>
                        ₲ {new Intl.NumberFormat('es-PY').format(Math.round(calculatePrice().totalForRancher))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white px-4 lg:px-6 py-4" style={{ borderTop: '2px solid #1E5126' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={step === 1 ? onClose : handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              style={{ backgroundColor: '#1E5126' }}
              disabled={!isStepValid()}
              className={!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              style={{ backgroundColor: '#1E5126' }}
              disabled={createMutation.isPending}
              className={createMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {createMutation.isPending ? 'Publicando...' : 'Publicar solicitud'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
