import React from 'react';

interface InputProps {
  type?: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  className?: string;
  placeholder?: string;
}

const CustomInput: React.FC<InputProps> = ({ 
  type = 'text', 
  value, 
  onChange, 
  min, 
  max, 
  className = '',
  placeholder
}) => {
  const baseClasses = 'px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200';

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      placeholder={placeholder}
      className={`${baseClasses} ${className}`}
    />
  );
};

export default CustomInput;