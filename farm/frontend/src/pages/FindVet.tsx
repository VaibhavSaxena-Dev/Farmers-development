import { useEffect, useRef, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Clock, Phone, Loader2, Navigation, AlertCircle } from "lucide-react";
import { doctorApi } from "@/Backend/api/medicalApi";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }; // Bangalore fallback
const MAP_ZOOM = 14;

const ANIMALS = ["Veterinarian", "Cow", "Buffalo", "Goat", "Sheep", "Pig", "Chicken", "Duck", "Horse", "Dog", "Cat", "Rabbit"];
const RADIUS_OPTIONS = [5, 10, 25, 50];

export interface VetPlace {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  openingHours: string[];
  openNow?: boolean;
}

// Demo clinics shown when Google Maps is not available (no API key or map failed)
const DEMO_VET_CLINICS: VetPlace[] = [
  {
    placeId: "demo-1",
    name: "Pet Care Veterinary Hospital",
    address: "123 MG Road, Bangalore 560001",
    lat: 12.9755,
    lng: 77.6063,
    phone: "+91 80 1234 5678",
    openingHours: ["Monday: 9:00 AM – 7:00 PM", "Tuesday: 9:00 AM – 7:00 PM", "Wednesday: 9:00 AM – 7:00 PM", "Thursday: 9:00 AM – 7:00 PM", "Friday: 9:00 AM – 7:00 PM", "Saturday: 9:00 AM – 2:00 PM", "Sunday: Closed"],
    openNow: true,
  },
  {
    placeId: "demo-2",
    name: "Animal Health Clinic",
    address: "45 Koramangala 5th Block, Bangalore 560034",
    lat: 12.9352,
    lng: 77.6245,
    phone: "+91 80 8765 4321",
    openingHours: ["Monday: 8:00 AM – 8:00 PM", "Tuesday: 8:00 AM – 8:00 PM", "Wednesday: 8:00 AM – 8:00 PM", "Thursday: 8:00 AM – 8:00 PM", "Friday: 8:00 AM – 8:00 PM", "Saturday: 8:00 AM – 4:00 PM", "Sunday: 10:00 AM – 2:00 PM"],
    openNow: true,
  },
  {
    placeId: "demo-3",
    name: "Livestock & Poultry Veterinary Services",
    address: "78 Hebbal, Bangalore 560024",
    lat: 13.0358,
    lng: 77.597,
    phone: "+91 80 2222 3333",
    openingHours: ["Monday: 8:30 AM – 6:00 PM", "Tuesday: 8:30 AM – 6:00 PM", "Wednesday: 8:30 AM – 6:00 PM", "Thursday: 8:30 AM – 6:00 PM", "Friday: 8:30 AM – 6:00 PM", "Saturday: 8:30 AM – 1:00 PM", "Sunday: Closed"],
    openNow: false,
  },
  {
    placeId: "demo-4",
    name: "Rural Vet Care Centre",
    address: "12 Tumakuru Road, Bangalore 560022",
    lat: 13.0122,
    lng: 77.5615,
    phone: "+91 80 4444 5555",
    openingHours: ["Monday: 9:00 AM – 6:30 PM", "Tuesday: 9:00 AM – 6:30 PM", "Wednesday: 9:00 AM – 6:30 PM", "Thursday: 9:00 AM – 6:30 PM", "Friday: 9:00 AM – 6:30 PM", "Saturday: 9:00 AM – 2:30 PM", "Sunday: Emergency only"],
    openNow: false,
  },
  {
    placeId: "demo-5",
    name: "Agro Vet Hospital",
    address: "56 Whitefield Main Road, Bangalore 560066",
    lat: 12.9698,
    lng: 77.7499,
    phone: "+91 80 6666 7777",
    openingHours: ["Monday: 8:00 AM – 7:00 PM", "Tuesday: 8:00 AM – 7:00 PM", "Wednesday: 8:00 AM – 7:00 PM", "Thursday: 8:00 AM – 7:00 PM", "Friday: 8:00 AM – 7:00 PM", "Saturday: 8:00 AM – 3:00 PM", "Sunday: Closed"],
    openNow: true,
  },
];

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: object) => {
          setCenter: (c: { lat: number; lng: number }) => void;
          getCenter: () => { lat: () => number; lng: () => number };
          setZoom: (z: number) => void;
          fitBounds: (b: { extend: (p: { lat: number; lng: number }) => void }) => void;
        };
        LatLng: new (lat: number, lng: number) => object;
        Marker: new (opts: { map: object; position: { lat: number; lng: number }; title?: string }) => object;
        event: { addListener: (obj: object, event: string, fn: () => void) => void };
        places: {
          PlacesService: new (map: object) => {
            nearbySearch: (
              req: { location: object; radius: number; type?: string; keyword?: string },
              cb: (results: unknown[] | null, status: string) => void
            ) => void;
            getDetails: (
              req: { placeId: string; fields: string[] },
              cb: (place: unknown, status: string) => void
            ) => void;
          };
        };
      };
    };
    initFindVetMap?: () => void;
  }
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

function FindVet() {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<VetPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const [registeredDoctors, setRegisteredDoctors] = useState<VetPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<VetPlace | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState("Veterinarian");
  const [searchRadius, setSearchRadius] = useState(10);
  const mapInstanceRef = useRef<ReturnType<typeof window.google.maps.Map> | null>(null);
  const markersRef = useRef<unknown[]>([]);
  const mapErrorCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const registeredMarkersRef = useRef<unknown[]>([]);

  const allPlaces = useMemo(() => [...places, ...registeredDoctors], [places, registeredDoctors]);

  // Fetch registered veterinary doctors (from Vet Doctors page) for map & list
  useEffect(() => {
    doctorApi.getDoctorsForMap().then((r) => {
      const list = (r.doctors || []).map((d: { _id: string; name: string; address?: string; clinicName?: string; lat: number; lng: number; phone?: string; consultationFee?: number }) => ({
        placeId: "reg-" + d._id,
        name: d.name + (d.clinicName ? ` — ${d.clinicName}` : ""),
        address: d.address || d.clinicName || "",
        lat: d.lat,
        lng: d.lng,
        phone: d.phone,
        openingHours: [],
      }));
      setRegisteredDoctors(list);
    }).catch(() => setRegisteredDoctors([]));
  }, []);

  // Add markers for registered doctors when map is ready
  useEffect(() => {
    if (!window.google?.maps || !mapInstanceRef.current || registeredDoctors.length === 0) return;
    const google = window.google;
    registeredMarkersRef.current.forEach((m) => (m as { setMap: (n: null) => void }).setMap(null));
    registeredMarkersRef.current = [];
    for (const p of registeredDoctors) {
      const marker = new google.maps.Marker({
        map: mapInstanceRef.current,
        position: { lat: p.lat, lng: p.lng },
        title: p.name,
      });
      registeredMarkersRef.current.push(marker);
      google.maps.event.addListener(marker, "click", () => setSelectedPlace(p));
    }
  }, [registeredDoctors]);

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_CENTER);
      setError(t("findVetLocationUnsupported") || "Location not supported. Using default area.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setUserLocation(DEFAULT_CENTER);
        setError(t("findVetLocationDenied") || "Location denied. Showing default area.");
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [t]);

  // Load map and search when we have a location and API key
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    if (!GOOGLE_MAPS_API_KEY) {
      setError(t("findVetNoApiKey") || "Google Maps API key not set. Add VITE_GOOGLE_MAPS_API_KEY to .env");
      setMapLoadFailed(true);
      setPlaces(DEMO_VET_CLINICS);
      setLoading(false);
      return;
    }

    let cancelled = false;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled || !mapRef.current || !window.google?.maps) return;

        const google = window.google;
        const map = new google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: MAP_ZOOM,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });
        mapInstanceRef.current = map;

        // Detect when Google shows "Something went wrong" (invalid key / billing / APIs)
        const checkMapError = () => {
          if (cancelled || !mapRef.current) return;
          const text = mapRef.current.innerText || "";
          if (text.includes("Something went wrong") || text.includes("didn't load Google Maps correctly")) {
            setMapLoadFailed(true);
            setPlaces(DEMO_VET_CLINICS);
            setLoading(false);
          }
        };
        mapErrorCheckRef.current = setTimeout(checkMapError, 3500);

        const service = new google.maps.places.PlacesService(map);

        const location = new google.maps.LatLng(userLocation.lat, userLocation.lng) as { lat: () => number; lng: () => number };

        const keyword = selectedAnimal === "Veterinarian" ? "veterinarian" : `${selectedAnimal} veterinarian`;

        service.nearbySearch(
          {
            location,
            radius: searchRadius * 1000,
            type: "veterinary_care",
            keyword,
          },
          (results: { place_id?: string; name?: string; vicinity?: string; geometry?: { location: { lat: () => number; lng: () => number } } }[] | null, status: string) => {
            if (cancelled) return;
            if (status !== "OK" || !results?.length) {
              setPlaces([]);
              setLoading(false);
              return;
            }

            const placesList: VetPlace[] = [];
            let processed = 0;
            const total = Math.min(results.length, 15);

            const finishLoading = () => {
              if (cancelled) return;
              setPlaces(placesList);
              setLoading(false);
            };

            // Stop spinning after 12s even if some getDetails never return
            const finishTimeout = setTimeout(finishLoading, 12000);

            results.slice(0, 15).forEach((place) => {
              service.getDetails(
                {
                  placeId: place.place_id!,
                  fields: ["name", "formatted_address", "formatted_phone_number", "opening_hours", "geometry"],
                },
                (detail: { name?: string; formatted_address?: string; formatted_phone_number?: string; opening_hours?: { weekday_text?: string[]; open_now?: boolean }; geometry?: { location: { lat: () => number; lng: () => number } } } | null, detailStatus: string) => {
                  if (cancelled) return;
                  if (detailStatus === "OK" && detail) {
                    const lat = detail.geometry?.location?.lat() ?? 0;
                    const lng = detail.geometry?.location?.lng() ?? 0;
                    const vetPlace: VetPlace = {
                      placeId: place.place_id!,
                      name: detail.name || place.name || "Vet Clinic",
                      address: detail.formatted_address || place.vicinity || "",
                      lat,
                      lng,
                      phone: detail.formatted_phone_number,
                      openingHours: detail.opening_hours?.weekday_text || [],
                      openNow: detail.opening_hours?.open_now,
                    };
                    placesList.push(vetPlace);

                    const marker = new google.maps.Marker({
                      map,
                      position: { lat, lng },
                      title: vetPlace.name,
                    });
                    markersRef.current.push(marker);
                    google.maps.event.addListener(marker, "click", () => setSelectedPlace(vetPlace));
                  }
                  processed++;
                  if (processed === total) {
                    clearTimeout(finishTimeout);
                    setPlaces(placesList);
                    setLoading(false);
                  }
                }
              );
            });
          }
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Failed to load map");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (mapErrorCheckRef.current) clearTimeout(mapErrorCheckRef.current);
      markersRef.current = [];
      registeredMarkersRef.current.forEach((m) => (m as { setMap: (n: null) => void })?.setMap?.(null));
      registeredMarkersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, [userLocation, t, selectedAnimal, searchRadius]);

  const openInMaps = (place: VetPlace) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">{t("findVetTitle") || "Find Nearby Veterinary Clinics"}</h1>
            <p className="text-muted-foreground mt-1">
              {t("findVetSubtitle") || "View clinics on the map with addresses and opening hours."}
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Animal</label>
                <select
                  value={selectedAnimal}
                  onChange={(e) => { setSelectedAnimal(e.target.value); setPlaces([]); setLoading(true); }}
                  className="border rounded-md px-3 py-2 text-sm bg-background"
                >
                  {ANIMALS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Radius</label>
                <select
                  value={searchRadius}
                  onChange={(e) => { setSearchRadius(Number(e.target.value)); setPlaces([]); setLoading(true); }}
                  className="border rounded-md px-3 py-2 text-sm bg-background"
                >
                  {RADIUS_OPTIONS.map((r) => <option key={r} value={r}>{r} km</option>)}
                </select>
              </div>
            </div>
          </div>

          {error && !mapLoadFailed && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className={mapLoadFailed ? "max-w-2xl" : "grid lg:grid-cols-3 gap-6"}>
            {!mapLoadFailed && (
              <div className="lg:col-span-2">
                <div className="rounded-xl overflow-hidden border border-border bg-muted/30 h-[480px] relative">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  )}
                  <div ref={mapRef} className="w-full h-full min-h-[400px]" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                {t("findVetNearby") || "Nearby clinics"}
              </h2>
              <ScrollArea className={mapLoadFailed ? "min-h-[400px] pr-2" : "h-[460px] pr-4"}>
                {allPlaces.length === 0 && !loading && (
                  <p className="text-muted-foreground text-sm py-4">
                    {t("findVetNoResults") || "No veterinary clinics found in this area. Try allowing location or moving the map."}
                  </p>
                )}
                {allPlaces.map((place) => (
                  <Card
                    key={place.placeId}
                    className={`mb-3 cursor-pointer transition-all hover:shadow-md ${selectedPlace?.placeId === place.placeId ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                        {place.name}
                        {place.placeId.startsWith("reg-") && (
                          <span className="text-xs font-normal text-primary">Registered</span>
                        )}
                        {place.openNow !== undefined && !place.placeId.startsWith("reg-") && (
                          <span className={`text-xs font-normal ${place.openNow ? "text-green-600" : "text-muted-foreground"}`}>
                            {place.openNow ? t("findVetOpenNow") || "Open now" : t("findVetClosed") || "Closed"}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {place.address && (
                        <p className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          {place.address}
                        </p>
                      )}
                      {place.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0" />
                          <a href={`tel:${place.phone}`} className="text-primary hover:underline">
                            {place.phone}
                          </a>
                        </p>
                      )}
                      {place.openingHours && place.openingHours.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                          <ul className="text-muted-foreground text-xs space-y-0.5">
                            {place.openingHours.map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInMaps(place);
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        {t("findVetDirections") || "Get directions"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindVet;
