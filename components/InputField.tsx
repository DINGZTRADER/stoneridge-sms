import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  name: string;
  error?: string;
  tag?: 'input' | 'textarea'; // Add tag prop to specify input type
}

const InputField: React.FC<InputFieldProps> = ({ label, name, error, className, tag = 'input', ...props }) => {
  const commonClasses = `shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
    error ? 'border-red-500' : ''
  }`;

  return (
    <div className={`mb-4 ${className || ''}`}>
      {label && (
        <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">
          {label}
        </label>
      )}
      {tag === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={commonClasses}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} // Cast to textarea attributes
        />
      ) : (
        <input
          id={name}
          name={name}
          className={commonClasses}
          {...props as React.InputHTMLAttributes<HTMLInputElement>} // Cast to input attributes
        />
      )}
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default InputField;