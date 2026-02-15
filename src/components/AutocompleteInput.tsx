'use client';

import { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
  options: string[];
  name: string;
  defaultValue?: string;
  placeholder?: string;
  label: string;
  required?: boolean;
}

export default function AutocompleteInput({ options, name, defaultValue = '', placeholder, label, required = false }: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(value.toLowerCase()) && option.toLowerCase() !== value.toLowerCase()
  );

  return (
    <div className="input-group" ref={wrapperRef} style={{ position: 'relative' }}>
      <label className="input-label" htmlFor={name} style={{ marginBottom: '8px', display: 'block' }}>{label}</label>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          id={name}
          name={name}
          className="input-field"
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
          style={{ paddingRight: '40px' }}
        />

        {/* Toggle / Clear Controls */}
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {value && !isOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setValue('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer', padding: 0, display: 'flex' }}
              title="Clear text"
            >
              &times;
            </button>
          )}
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer', padding: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            ▼
          </button>
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          borderRadius: '8px',
          marginTop: '6px',
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          padding: '4px'
        }}>
          {filteredOptions.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                setValue(option);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                transition: 'background-color 0.1s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
