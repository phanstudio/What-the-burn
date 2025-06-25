import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';


export const TextArea = ({
    value = '',
    onChange,
    error = null,
    required = false,
    placeholder = "Enter your text here...",
    minLength = 0,
    maxLength = 1000,
    rows = 4,
    className = ""
}) => {
    const [localError, setLocalError] = useState('');
    const [charCount, setCharCount] = useState(value.length);

    const validateInput = (inputValue) => {
        if (required && (!inputValue || inputValue.trim() === '')) {
            setLocalError('This field is required');
            return false;
        }

        if (minLength > 0 && inputValue.length < minLength) {
            setLocalError(`Minimum ${minLength} characters required`);
            return false;
        }

        if (maxLength > 0 && inputValue.length > maxLength) {
            setLocalError(`Maximum ${maxLength} characters allowed`);
            return false;
        }

        setLocalError('');
        return true;
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setCharCount(newValue.length);
        validateInput(newValue);

        if (onChange) {
            onChange(newValue);
        }
    };

    const hasError = error || localError;

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-2">
                <label className="block text-sm font-medium text-white mb-1">
                    Description
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            </div>

            <div className="relative">
                <textarea
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full px-3 py-2 border rounded-lg bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 transition-all duration-200 ${hasError
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#50D2C1] focus:border-[#50D2C1]'
                        }`}
                />

                {/* Character counter */}
                <div className="flex justify-between items-center mt-2">
                    <div>
                        {hasError && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle size={14} />
                                {error || localError}
                            </p>
                        )}
                    </div>
                    <div className="text-sm text-gray-400">
                        {charCount}{maxLength > 0 && `/${maxLength}`}
                        {charCount >= maxLength && maxLength > 0 && (
                            <span className="text-red-400 ml-1">Max reached</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextArea;