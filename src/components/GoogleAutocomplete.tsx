import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import config from '@/config';

type GoogleAutocompleteProps = {
  onPlaceSelected: (place: google.maps.places.PlaceResult | null) => void;
};

const GoogleAutocomplete: React.FC<GoogleAutocompleteProps> = ({ onPlaceSelected }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [options, setOptions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
      if (window.google && inputValue) {
        const autocompleteService = new window.google.maps.places.AutocompleteService();

        setLoading(true);
        autocompleteService.getPlacePredictions({ input: inputValue }, (predictions) => {
          setLoading(false);
          setOptions(predictions || []);
        });
      } else {
        setOptions([]);
      }
    };

    const debounceTimer = setTimeout(loadScript, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, config.googleKey]);

  const handleSelect = (value: string) => {
    const selectedOption = options.find((option) => option.description === value);

    if (selectedOption) {
      const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
      placesService.getDetails({ placeId: selectedOption.place_id }, (placeDetails) => {
        onPlaceSelected(placeDetails);
        setOpen(false);
        setInputValue('');
      });
    } else {
      onPlaceSelected(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onClick={() => setOpen(true)}
          placeholder="Search places..."
          className="w-full"
        />
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandList>
            <CommandInput value={inputValue} onValueChange={setInputValue} placeholder="Search places..." />
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

export default GoogleAutocomplete;
