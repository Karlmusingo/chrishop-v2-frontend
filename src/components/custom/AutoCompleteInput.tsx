import React, { useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';

interface AutocompleteInputProps {
  onLoad?: (autocomplete: google.maps.places.Autocomplete) => void;
  onPlaceChanged?: () => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ onLoad, onPlaceChanged }) => {
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDomNodeInserted = (event: Event): void => {
      if (event.target instanceof Element && event.target.classList.contains('pac-container')) {
        event.target.classList.add('mt-1', 'border', 'border-gray-300', 'bg-white', 'rounded-md', 'shadow-lg', 'z-50');

        const items = event.target.getElementsByClassName('pac-item');
        Array.from(items).forEach(item => {
          item.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-100', 'transition-colors', 'duration-150');
        });

        const queries = event.target.getElementsByClassName('pac-item-query');
        Array.from(queries).forEach(query => {
          query.classList.add('text-gray-900', 'font-semibold');
        });

        const secondaryText = event.target.getElementsByClassName('pac-secondary-text');
        Array.from(secondaryText).forEach(text => {
          text.classList.add('text-gray-600', 'text-sm');
        });

        const icons = event.target.getElementsByClassName('pac-icon');
        Array.from(icons).forEach(icon => {
          icon.classList.add('hidden');
        });
      }
    };

    inputRef.current?.addEventListener('click', handleDomNodeInserted);

    return () => {
      inputRef.current?.removeEventListener('click', handleDomNodeInserted);
    };

  }, []);

  return (
    <div className='w-full' ref={inputRef}>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder="Search for a location"
          className="w-full p-3 mb-4 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Autocomplete>
    </div>
  );
};

export default AutocompleteInput;