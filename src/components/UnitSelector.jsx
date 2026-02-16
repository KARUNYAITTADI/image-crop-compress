import React from 'react';
import './UnitSelector.css';

const UnitSelector = ({ value, onChange, label }) => {
  const units = [
    { value: 'px', label: 'Pixels (px)' },
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'in', label: 'Inches (in)' }
  ];

  return (
    <div className="unit-selector">
      <label htmlFor="unit-select">{label || 'Select Unit:'}</label>
      <select 
        id="unit-select" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {units.map((unit) => (
          <option key={unit.value} value={unit.value}>
            {unit.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UnitSelector;
