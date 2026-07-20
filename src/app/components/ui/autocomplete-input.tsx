import { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';

export interface AutocompleteOption {
  code: string;
  name: string;
  display: string;
}

interface AutocompleteInputProps {
  id: string;
  label: string;
  placeholder?: string;
  options: AutocompleteOption[];
  value: string;
  onSelect: (option: AutocompleteOption) => void;
  onInputChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function AutocompleteInput({
  id,
  label,
  placeholder,
  options,
  value,
  onSelect,
  onInputChange,
  required = false,
  className = '',
}: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value with internal state
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter options based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredOptions([]);
      setIsOpen(false);
      return;
    }

    const searchTerm = inputValue.toLowerCase().trim();
    const filtered = options.filter((option) => {
      // Defensive normalization keeps the shared input safe while an API response
      // is being migrated between naming conventions.
      const codeMatch = String(option.code ?? '').toLowerCase().includes(searchTerm);
      const nameMatch = String(option.name ?? '').toLowerCase().includes(searchTerm);
      return codeMatch || nameMatch;
    });

    setFilteredOptions(filtered.slice(0, 50)); // Limit to 50 results for performance
    setIsOpen(filtered.length > 0);
    setHighlightedIndex(0);
  }, [inputValue, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onInputChange?.(e.target.value);
  };

  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.display);
    setIsOpen(false);
    onSelect(option);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1.5">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.trim() !== '' && filteredOptions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />

        {/* Dropdown */}
        {isOpen && filteredOptions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredOptions.map((option, index) => (
              <button
                key={`${option.code}-${index}`}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                  index === highlightedIndex ? 'bg-gray-100' : ''
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {option.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Código: {option.code}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-400 flex-shrink-0">
                    {option.code}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {isOpen && filteredOptions.length === 0 && inputValue.trim() !== '' && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4"
          >
            <p className="text-sm text-gray-500 text-center">
              No se encontraron establecimientos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
