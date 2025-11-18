import React from 'react';

interface CustomCheckboxProps {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ id, label, description, checked, onChange, disabled = false }) => {
    return (
        <label
            htmlFor={id}
            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 ${
                disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-700/50'
            }`}
        >
            <div className="relative flex items-center">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only" // Hide default checkbox
                    disabled={disabled}
                />
                <div
                    className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${
                        checked ? 'bg-green-500 border-green-500' : 'bg-transparent border-slate-500'
                    }`}
                >
                    {checked && (
                        <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </div>
            <div className="ml-4">
                <span className="font-mono text-green-400">&gt; {label}</span>
                <span className="text-slate-400"> - {description}</span>
            </div>
        </label>
    );
};
