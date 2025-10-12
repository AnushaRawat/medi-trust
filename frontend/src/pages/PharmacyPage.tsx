import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Pharmacy } from "@/hooks/use-api";
import { useNavigate } from "react-router-dom";
import { fetchPharmaciesByGeolocation } from "@/hooks/use-api";
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: "100%",
  height: "100%",
};

const PharmacyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log("API Key:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
          const { pharmacies } = await fetchPharmaciesByGeolocation(lat, lng);
          setFilteredPharmacies(pharmacies);  // Update to handle multiple pharmacies
          setUserLocation({ lat, lng });
          setLoading(false);
          setIsMapLoaded(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation({ lat: 28.6139, lng: 77.2090 }); // default to Delhi
          setLoading(false);
          setIsMapLoaded(true);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
      setLoading(false);
      setIsMapLoaded(true);
    }
  }, []);

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleLocationClick = (pharmacy: Pharmacy) => {
    // In a real app, this would center the map on the selected pharmacy
    console.log(`Navigate to pharmacy: ${pharmacy.Name}`);
    
    // Open in Google Maps (for demonstration)
    const url = `https://www.google.com/maps/search/?api=1&query=${pharmacy.lat},${pharmacy.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Jan Aushadhi Kendra Locator</h1>
        <p className="text-muted-foreground">Find government pharmacies with affordable generic medicines near you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - search and list */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Pharmacies</CardTitle>
              <CardDescription>Find pharmacies by name or address</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search pharmacies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">
                {filteredPharmacies.length} pharmacies found
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 bg-muted rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))
            ) : filteredPharmacies.length > 0 ? (
              filteredPharmacies.map((pharmacy) => (
                <Card key={pharmacy.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Staff Name: {pharmacy.Name}</CardTitle>
                    <CardDescription>{pharmacy.Address}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div>
                      <p><strong>Kendra Code:</strong> {pharmacy.Kendra_code}</p>
                      <p><strong>State:</strong> {pharmacy.State_name}</p>
                      <p><strong>District:</strong> {pharmacy.District_name}</p>
                      <p><strong>Pincode:</strong> {pharmacy.Pin_code}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleLocationClick(pharmacy)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Show on Map
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No pharmacies found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right side - map */}
        <div className="lg:col-span-2">
          <Card className="h-[70vh] overflow-hidden">
            {isLoaded && userLocation ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation}
                zoom={13}
              >
                <Marker position={userLocation} label="You" />
                {filteredPharmacies.map((pharmacy) => (
                  <Marker
                    key={pharmacy.id}
                    position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
                    label={pharmacy.Name ? pharmacy.Name.split(" ")[0] : ""}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${pharmacy.lat},${pharmacy.lng}`,
                        "_blank"
                      )
                    }
                  />
                ))}
              </GoogleMap>
            ) : (
              <div className="h-full flex items-center justify-center bg-muted">
                <div className="text-center animate-pulse">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PharmacyPage;