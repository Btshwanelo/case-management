import React, { useState, useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import config from '@/config';

type GoogleAutocompleteProps = {
  onPlaceSelected: (place: google.maps.places.PlaceResult | null) => void;
  initialValue?: string;
  placeholder?: string;
};

const GoogleAutocompleteV2: React.FC<GoogleAutocompleteProps> = ({
  onPlaceSelected,
  initialValue = '',
  placeholder = 'Search places...',
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [options, setOptions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with initialValue
  useEffect(() => {
    if (initialValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    const loadScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleKey}&libraries=places`;
        script.async = true;
        script.onload = () => initAutocomplete();
        document.body.appendChild(script);
      } else {
        initAutocomplete();
      }
    };

    const initAutocomplete = () => {
      if (window.google && inputValue.trim()) {
        const autocompleteService = new window.google.maps.places.AutocompleteService();

        setLoading(true);
        autocompleteService.getPlacePredictions({ input: inputValue.trim() }, (predictions, status) => {
          setLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setOptions(predictions);
          } else {
            setOptions([]);
          }
        });
      } else {
        setOptions([]);
      }
    };

    // Only trigger autocomplete if the popover is open
    if (open) {
      const debounceTimer = setTimeout(loadScript, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [inputValue, config.googleKey, open]);

  const handleSelect = (value: string) => {
    const selectedOption = options.find((option) => option.description === value);

    if (selectedOption && window.google) {
      const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
      placesService.getDetails({ placeId: selectedOption.place_id }, (placeDetails, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          onPlaceSelected(placeDetails);
          setInputValue(selectedOption.description);
        } else {
          onPlaceSelected(null);
        }
        setOpen(false);
      });
    } else {
      onPlaceSelected(null);
    }
  };

  // Focus the input when the popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!open) {
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full"
        />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px] md:w-[400px]" align="start">
        <Command>
          <CommandInput
            value={inputValue}
            onValueChange={(value) => {
              setInputValue(value);
            }}
            placeholder={placeholder}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                'No places found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.place_id} value={option.description} onSelect={handleSelect}>
                  {option.description}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GoogleAutocompleteV2;
