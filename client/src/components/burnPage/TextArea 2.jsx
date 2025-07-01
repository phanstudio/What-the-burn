import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export const TextArea = ({
    value = '',
    onChange,
    onValidationChange, // New prop to communicate validation state to parent
    error = null,
    required = false,
    placeholder = "Enter your text here...",
    minLength = 0,
    maxLength = 1000,
    rows = 4,
    className = "",
    name = "description" // Add name prop for form identification
}) => {
    const [localError, setLocalError] = useState('');
    const [charCount, setCharCount] = useState(value.length);
    const [isValid, setIsValid] = useState(true);

    const validateInput = (inputValue) => {
        let errorMessage = '';
        let valid = true;

        if (required && (!inputValue || inputValue.trim() === '')) {
            errorMessage = 'This field is required';
            valid = false;
        } else if (minLength > 0 && inputValue.length < minLength) {
            errorMessage = `Minimum ${minLength} characters required`;
            valid = false;
        } else if (maxLength > 0 && inputValue.length > maxLength) {
            errorMessage = `Maximum ${maxLength} characters allowed`;
            valid = false;
        }

        setLocalError(errorMessage);
        setIsValid(valid);

        // Communicate validation state to parent component
        if (onValidationChange) {
            onValidationChange({
                name,
                isValid: valid,
                error: errorMessage,
                value: inputValue
            });
        }

        return valid;
    };

    // Validate initial value on mount
    useEffect(() => {
        validateInput(value);
    }, []);

    // Re-validate when external error changes
    useEffect(() => {
        if (error) {
            setIsValid(false);
            if (onValidationChange) {
                onValidationChange({
                    name,
                    isValid: false,
                    error,
                    value
                });
            }
        }
    }, [error]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setCharCount(newValue.length);
        validateInput(newValue);

        if (onChange) {
            onChange(newValue);
        }
    };

    const handleBlur = (e) => {
        // Re-validate on blur for better UX
        validateInput(e.target.value);
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
                    name={name}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full px-3 py-2 border rounded-lg bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 transition-all duration-200 ${hasError
                        ? 'border-red-400 focus:ring-red-500'
                        : isValid && value.length > 0
                            ? 'border-green-400 focus:ring-green-500'
                            : 'border-gray-300 focus:ring-[#50D2C1] focus:border-[#50D2C1]'
                        }`}
                />

                {/* Character counter and error display */}
                <div className="flex justify-between items-center mt-2">
                    <div className="flex-1">
                        {hasError && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle size={14} />
                                {error || localError}
                            </p>
                        )}
                        {!hasError && isValid && value.length > 0 && (
                            <p className="text-green-400 text-sm flex items-center gap-1">
                                ✓ Valid
                            </p>
                        )}
                    </div>
                    <div className="text-sm text-gray-400 flex-shrink-0 ml-4">
                        <span className={charCount >= maxLength && maxLength > 0 ? 'text-red-400' : ''}>
                            {charCount}
                        </span>
                        {maxLength > 0 && `/${maxLength}`}
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