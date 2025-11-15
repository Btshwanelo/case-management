import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, MapPin, Navigation, Search, Edit2 } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: AddressData) => void;
  defaultAddress?: AddressData;
  googleApiKey: string; // Pass API key directly to component
}

export interface AddressData {
  streetNumber: string;
  addressLine1: string;
  city: string;
  suburb: string;
  postalCode: string;
  province: string;
  formatted_address?: string;
  lat?: number;
  lng?: number;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onConfirm, defaultAddress, googleApiKey }) => {
  const [addressData, setAddressData] = useState<AddressData>({
    streetNumber: '',
    addressLine1: '',
    city: '',
    suburb: '',
    postalCode: '',
    province: '',
    formatted_address: '',
  });

  const [inputValue, setInputValue] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState('');
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize with default address if provided
  useEffect(() => {
    if (defaultAddress) {
      setAddressData(defaultAddress);
      setInputValue(defaultAddress.formatted_address || defaultAddress.addressLine1);
    } else {
      setAddressData({
        streetNumber: '',
        addressLine1: '',
        city: '',
        suburb: '',
        postalCode: '',
        province: '',
        formatted_address: '',
      });
      setInputValue('');
    }
    setShowEditForm(false);
  }, [defaultAddress, isOpen]);

  // Initialize Google Maps script after the modal is fully rendered
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOpen) {
      // Small delay to ensure modal is fully rendered before loading script
      timeoutId = setTimeout(() => {
        loadGoogleMapsScript();
      }, 500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [isOpen]);

  const loadGoogleMapsScript = () => {
    console.log('Starting Google Maps script loading...');

    // Check if the script is already loaded
    if (window.google?.maps?.places) {
      console.log('Google Maps already loaded');
      setScriptLoaded(true);
      initServices();
      return;
    }

    // Create script element
    console.log('Loading Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    const handleScriptLoad = () => {
      console.log('Google Maps script loaded successfully');
      setScriptLoaded(true);

      // Small delay to ensure Google Maps is fully initialized
      setTimeout(() => {
        if (window.google?.maps) {
          initServices();
        } else {
          console.error('Google Maps failed to initialize properly');
          setScriptError('Google Maps failed to initialize. Please refresh the page.');
        }
      }, 300);
    };

    script.onload = handleScriptLoad;

    script.onerror = (error) => {
      const errorMsg = 'Error loading Google Maps script. Check your API key.';
      console.error(errorMsg, error);
      setScriptError(errorMsg);
    };

    // Remove any existing Google Maps scripts to avoid conflicts
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com/maps/api"]');
    existingScripts.forEach((s) => s.remove());

    document.head.appendChild(script);

    // Set a timeout to check if the script loaded properly
    const timeoutId = setTimeout(() => {
      if (!window.google?.maps) {
        console.error('Google Maps script load timed out');
        setScriptError('Failed to load Google Maps. Check your internet connection and API key.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  };

  const initServices = () => {
    console.log('Initializing Google Maps services...');

    try {
      if (window.google?.maps) {
        // Initialize the Places Autocomplete service
        autocompleteRef.current = new window.google.maps.places.AutocompleteService();
        console.log('Autocomplete service initialized');

        // Initialize the Places Service (for detailed place info)
        if (!placesServiceRef.current) {
          const mapDiv = document.createElement('div');
          placesServiceRef.current = new window.google.maps.places.PlacesService(mapDiv);
          console.log('Places service initialized');
        }

        // Wait to make sure the map container is rendered
        setTimeout(() => {
          if (mapContainerRef.current) {
            console.log('Map container found, initializing map...');
            initMap();
          } else {
            console.warn('Map container ref still not found after delay');
          }
        }, 500);

        // Focus on the input
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 200);
      } else {
        throw new Error('Google Maps not available');
      }
    } catch (error) {
      console.error('Error initializing services:', error);
      setScriptError('Failed to initialize Google Maps services. Please refresh the page.');
    }
  };

  const initMap = () => {
    if (!mapContainerRef.current || !window.google?.maps) {
      console.error('Cannot initialize map: Missing container ref or Google Maps not loaded');
      return;
    }

    try {
      console.log('Initializing map...');
      const defaultLocation = { lat: -26.2041, lng: 28.0473 }; // Johannesburg as default

      // Use location from default address if available
      const initialLocation = addressData.lat && addressData.lng ? { lat: addressData.lat, lng: addressData.lng } : defaultLocation;

      // Force container to have dimensions
      mapContainerRef.current.style.width = '100%';
      mapContainerRef.current.style.height = '300px';

      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: initialLocation,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Make sure the map is properly sized
      window.google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);

        // Add marker if we have location data
        if (addressData.lat && addressData.lng) {
          addMarker({ lat: addressData.lat, lng: addressData.lng });
        }
      });

      // Trigger resize event after a slight delay to ensure the map renders correctly
      setTimeout(() => {
        window.google.maps.event.trigger(mapRef.current, 'resize');
      }, 200);
    } catch (error) {
      console.error('Error initializing map:', error);
      setScriptError('Failed to initialize map. Please try again.');
    }
  };

  // Handle input change and fetch predictions
  useEffect(() => {
    // Clear timeout on component unmount
    const fetchTimeout = setTimeout(() => {
      if (inputValue.trim().length > 2 && autocompleteRef.current) {
        try {
          console.log('Fetching predictions for:', inputValue);
          autocompleteRef.current.getPlacePredictions(
            {
              input: inputValue,
              types: ['address'],
            },
            (predictions, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                console.log('Received predictions:', predictions);
                setSearchResults(predictions);
                setShowResults(true);
              } else {
                console.log('No predictions or error:', status);
                setSearchResults([]);
              }
            }
          );
        } catch (error) {
          console.error('Error fetching predictions:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(fetchTimeout);
  }, [inputValue]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addMarker = (location: google.maps.LatLngLiteral) => {
    if (!mapRef.current) return;

    // Clear existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create new marker
    markerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapRef.current,
      animation: window.google.maps.Animation.DROP,
    });

    // Center map on marker
    mapRef.current.panTo(location);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim().length > 0) {
      setShowResults(true);
    }
  };

  const handlePlaceSelect = (placeId: string, description: string) => {
    console.log('Selected place ID:', placeId);

    if (!placesServiceRef.current) {
      console.error('Places service not initialized');
      return;
    }

    placesServiceRef.current.getDetails(
      {
        placeId: placeId,
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          console.log('Got place details:', place);
          handlePlaceDetails(place);

          // Update map with the selected location
          if (place.geometry?.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            addMarker(location);
          }
        } else {
          console.error('Error fetching place details:', status);
        }
      }
    );

    // Update input value immediately for better UX
    setInputValue(description);
    setShowResults(false);
  };

  const handlePlaceDetails = (place: google.maps.places.PlaceResult) => {
    console.log('Processing place details:', place);

    if (!place?.address_components) {
      console.warn('No address components found in the place result');
      return;
    }

    function getLongNameByType(components: google.maps.GeocoderAddressComponent[], type: string): string | undefined {
      const component = components.find((comp) => comp.types.includes(type));
      return component?.long_name || '';
    }

    const streetNumber = getLongNameByType(place.address_components, 'street_number');
    const route = getLongNameByType(place.address_components, 'route');
    const locality = getLongNameByType(place.address_components, 'locality');
    const sublocalitylevel1 = getLongNameByType(place.address_components, 'sublocality_level_1');
    const administrativeAreaLevel1 = getLongNameByType(place.address_components, 'administrative_area_level_1');
    const postalCode = getLongNameByType(place.address_components, 'postal_code');
    const country = getLongNameByType(place.address_components, 'country');

    console.log('Extracted components:', {
      streetNumber,
      route,
      locality,
      sublocalitylevel1,
      administrativeAreaLevel1,
      postalCode,
      country,
    });

    // Find matching province ID from options
    const provinceOption = getProvinceOptions().find((opt) => opt.lable.toLowerCase() === (administrativeAreaLevel1 || '').toLowerCase());

    const addressLine = cleanAddressString(streetNumber, route, locality, sublocalitylevel1);

    // Get latitude and longitude if available
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();

    const newAddressData = {
      streetNumber: streetNumber || '',
      addressLine1: addressLine,
      city: locality || '',
      suburb: sublocalitylevel1 || '',
      postalCode: postalCode || '',
      province: provinceOption?.value || '',
      formatted_address: place.formatted_address || '',
      lat: lat,
      lng: lng,
    };

    console.log('New address data:', newAddressData);
    setAddressData(newAddressData);
  };

  const cleanAddressString = (streetNumber?: string, route?: string, locality?: string, sublocalitylevel1?: string): string => {
    return [streetNumber, route, sublocalitylevel1, locality].filter(Boolean).join(', ');
  };

  const getProvinceOptions = () => {
    return [
      { value: '1', lable: 'Gauteng' },
      { value: '2', lable: 'Western Cape' },
      { value: '3', lable: 'KwaZulu-Natal' },
      { value: '4', lable: 'Eastern Cape' },
      { value: '5', lable: 'Free State' },
      { value: '6', lable: 'North West' },
      { value: '7', lable: 'Mpumalanga' },
      { value: '8', lable: 'Limpopo' },
      { value: '9', lable: 'Northern Cape' },
    ];
  };

  const handleUserLocation = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          mapRef.current?.setCenter(userLocation);
          mapRef.current?.setZoom(15);
          addMarker(userLocation);

          // Reverse geocode to get address details
          if (window.google?.maps?.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: userLocation }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                const place = results[0];
                handlePlaceDetails(place);
                setInputValue(place.formatted_address || '');
              }
            });
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  };

  const handleToggleEditForm = () => {
    setShowEditForm(!showEditForm);
  };

  const handleEditAddressChange = (field: keyof AddressData, value: string) => {
    setAddressData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateAddressData = () => {
    // Check if required fields are filled
    const requiredFields: (keyof AddressData)[] = ['streetNumber', 'addressLine1', 'city', 'province', 'postalCode'];
    return requiredFields.every((field) => {
      const value = addressData[field];
      // Convert to string and check if it has content after trimming
      const stringValue = value != null ? String(value) : '';
      return stringValue.trim().length > 0;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Change location</DialogTitle>
          <DialogDescription id="dialog-description" className="sr-only">
            Search for and select your address
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {scriptError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{scriptError}</div>}

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Search by city, neighborhood or ZIP code.</p>
            <div className="relative">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onClick={() => setShowResults(inputValue.length > 0)}
                  placeholder="Enter your address..."
                  className="w-full pr-10"
                  disabled={!scriptLoaded}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Search results dropdown */}
              {showResults && searchResults.length > 0 && (
                <div
                  ref={resultsRef}
                  className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                >
                  {searchResults.map((result) => (
                    <div
                      key={result.place_id}
                      className="cursor-pointer hover:bg-gray-100 py-2 px-3"
                      onClick={() => handlePlaceSelect(result.place_id, result.description)}
                    >
                      {result.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-2 p-3 bg-gray-100 rounded-md mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{addressData.formatted_address || addressData.addressLine1 || 'Select a location'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleToggleEditForm}>
                <Edit2 className="h-4 w-4 mr-1" />
                {showEditForm ? 'Hide' : 'Edit'}
              </Button>
            </div>

            {/* Manual Address Entry Form */}
            {showEditForm && (
              <div className="mb-6 p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-3">Edit Address Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="streetNumber" className="text-xs">
                        Street Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="streetNumber"
                        value={addressData.streetNumber}
                        onChange={(e) => handleEditAddressChange('streetNumber', e.target.value)}
                        placeholder=""
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="text-xs">
                        Postal Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        value={addressData.postalCode}
                        onChange={(e) => handleEditAddressChange('postalCode', e.target.value)}
                        placeholder=""
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1" className="text-xs">
                      Street Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="addressLine1"
                      value={addressData.addressLine1}
                      onChange={(e) => handleEditAddressChange('addressLine1', e.target.value)}
                      placeholder=""
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="suburb" className="text-xs">
                        Suburb
                      </Label>
                      <Input
                        id="suburb"
                        value={addressData.suburb}
                        onChange={(e) => handleEditAddressChange('suburb', e.target.value)}
                        placeholder=""
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-xs">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={addressData.city}
                        onChange={(e) => handleEditAddressChange('city', e.target.value)}
                        placeholder=""
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="province" className="text-xs">
                      Province <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="province"
                      value={addressData.province}
                      onChange={(e) => handleEditAddressChange('province', e.target.value)}
                      className="w-full mt-1 rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm"
                    >
                      <option value="">Select a province</option>
                      {getProvinceOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.lable}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </div>
            )}

            {/* Map container - important to keep this structure intact */}
            <div className="relative w-full h-[300px] rounded-md overflow-hidden">
              <div
                id="google-map-container"
                ref={mapContainerRef}
                className="absolute inset-0"
                style={{ width: '100%', height: '100%' }}
              ></div>

              {/* Loading overlay */}
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80 z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-700">Loading map...</p>
                  </div>
                </div>
              )}

              {/* User location button - now inside the map container but positioned absolutely */}
              <div className="absolute bottom-4 right-4 z-20">
                <Button
                  onClick={handleUserLocation}
                  size="sm"
                  variant="secondary"
                  className="bg-white shadow-md rounded-full h-10 w-10 p-0"
                  type="button"
                  disabled={!scriptLoaded || !mapLoaded}
                >
                  <Navigation className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onConfirm(addressData)} className="w-full bg-blue-600 hover:bg-blue-700" disabled={!validateAddressData()}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;
