'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  id: number;
  name: string;
  phone?: string;
  alternate_phone?: string;
}

interface SearchableSelectProps {
  addNewLabel?: string;
  onAddNew?: () => void;
  options: Option[];
  name: string;
  defaultValue?: number | string;
  placeholder?: string;
  label: string;
}

import QuickPersonModal from './QuickPersonModal';
import QuickAddVehicleModal from './QuickAddVehicleModal';

export default function SearchableSelect({ options, name, value, onChange, defaultValue, placeholder, label, onAddNew, addNewLabel, type = 'person' }: SearchableSelectProps & { type?: 'person' | 'vehicle', value?: number | string | null, onChange?: (val: number | string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Internal state for uncontrolled mode, but sync with prop if controlled
  const [internalValue, setInternalValue] = useState<string | number>(defaultValue || '');

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? (value || '') : internalValue;

  const handleSelect = (val: string | number) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    if (onChange) {
      onChange(val);
    }
  };

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<{ isOpen: boolean; data?: { id: number, name: string, phone: string, alternate_phone?: string } }>({ isOpen: false });

  const wrapperRef = useRef<HTMLDivElement>(null);

  // We need to keep a local copy of options in case we add one on the fly
  const [localOptions, setLocalOptions] = useState<Option[]>(options);

  // Update local options if props change
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const selectedOption = localOptions.find(o => o.id == selectedValue);

  // Shows "Name (Phone)" if phone exists and closed, else just Name
  const formattedDisplayValue = selectedOption
    ? `${selectedOption.name}${selectedOption.phone ? ` (${selectedOption.phone})` : ''}`
    : '';
  const displayValue = isOpen ? search : formattedDisplayValue;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch(''); // Reset search string when closed
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = localOptions.filter(option =>
    option.name.toLowerCase().includes(search.toLowerCase()) ||
    (option.phone && option.phone.includes(search))
  );

  function handleQuickModalSuccess(id: number, newName: string, newPhone: string, mode: 'add' | 'edit', newAlternatePhone?: string) {
    if (mode === 'edit') {
      setLocalOptions(prev => prev.map(o => o.id === id ? { ...o, name: newName, phone: newPhone, alternate_phone: newAlternatePhone } : o));
      setEditModalData({ isOpen: false });
    } else {
      setLocalOptions(prev => [...prev, { id, name: newName, phone: newPhone, alternate_phone: newAlternatePhone }]);
      setIsAddModalOpen(false);
    }

    handleSelect(id);
    setSearch('');
  }

  return (
    <div className="input-group" ref={wrapperRef} style={{ position: 'relative' }}>
      <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>{label}</label>

      {/* Hidden input to ensure native form submission works */}
      <input type="hidden" name={name} value={selectedValue} />

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input-field"
          placeholder={placeholder || "-- Select an option --"}
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onClick={() => {
            setIsOpen(true);
            setSearch('');
          }}
          autoComplete="off"
          style={{ paddingRight: '40px', cursor: 'pointer' }}
        />

        {/* Toggle / Clear Controls */}
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {selectedValue && !isOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer', padding: 0, display: 'flex' }}
              title="Clear selection"
            >
              &times;
            </button>
          )}
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer', padding: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}
            onClick={(e) => {
              e.stopPropagation();
              if (isOpen) {
                setIsOpen(false);
                setSearch('');
              } else {
                setIsOpen(true);
                setSearch('');
              }
            }}
          >
            ▼
          </button>
        </div>
      </div>

      {isOpen && (
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
          maxHeight: '250px',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          padding: '4px'
        }}>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsAddModalOpen(true);
            }}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              cursor: 'pointer',
              color: 'var(--accent)',
              fontWeight: 'bold',
              borderRadius: '4px',
              background: 'rgba(59, 130, 246, 0.05)', // Light blue tint
              border: '1px dashed var(--accent)',
              fontSize: '0.95rem',
              marginBottom: '4px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {addNewLabel || '+ Add New Person'}
          </button>

          <div style={{ borderBottom: '1px solid var(--border)', margin: '4px 0' }}></div>

          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.id}
                onClick={() => {
                  handleSelect(option.id);
                  setIsOpen(false);
                  setSearch('');
                }}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  backgroundColor: option.id == selectedValue ? 'var(--background)' : 'transparent',
                  transition: 'background-color 0.1s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = option.id == selectedValue ? 'var(--background)' : 'transparent'}
              >
                <div>
                  <span style={{ fontWeight: 500 }}>{option.name}</span>
                  {option.phone && (
                    <span style={{ opacity: 0.6, fontSize: '0.85em', marginLeft: '6px' }}>{option.phone}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditModalData({
                      isOpen: true,
                      data: { id: option.id, name: option.name, phone: option.phone || '', alternate_phone: option.alternate_phone }
                    });
                    setIsOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    fontSize: '0.8em',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Edit
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
              No matches found
            </div>
          )}
        </div>
      )}

      
      
      {/* Quick Add/Edit Modals */}
      {type === 'person' && (
        <>
          <QuickPersonModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            mode="add"
            defaultName={search}
            onSuccess={(id, name, phone, mode) => handleQuickModalSuccess(id, name, phone, mode)} // alternate phone isn't passed from QuickPersonModal onSuccess type yet? Wait, let's check.
          />
          <QuickPersonModal
            isOpen={editModalData.isOpen}
            onClose={() => setEditModalData({ isOpen: false })}
            mode="edit"
            initialData={editModalData.data}
            onSuccess={(id, name, phone, mode) => handleQuickModalSuccess(id, name, phone, mode)}
          />
        </>
      )}
      {type === 'vehicle' && (
        <>
          <QuickAddVehicleModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            mode="add"
            onSuccess={(id, name) => handleQuickModalSuccess(id, name, '', 'add')}
          />
          <QuickAddVehicleModal
            isOpen={editModalData.isOpen}
            onClose={() => setEditModalData({ isOpen: false })}
            mode="edit"
            initialData={editModalData.data as any}
            onSuccess={(id, name) => handleQuickModalSuccess(id, name, '', 'edit')}
          />
        </>
      )}

    </div>
  );
}