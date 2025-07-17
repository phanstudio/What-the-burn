import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown, Image, X, Check, AlertCircle } from 'lucide-react';

const NFTNameInput = forwardRef(({
    value = '',
    onChange,
    placeholder = "Enter NFT name...",
    maxLength = 50,
    minLength = 3,
    className = "",
    disabled = false,
    required = false,
    onValidationChange
}, ref) => {
    const [localValue, setLocalValue] = useState(value);
    const [validationError, setValidationError] = useState('');

    // Validation function
    const validateInput = (inputValue) => {
        const errors = [];
        const trimmedValue = inputValue.trim();

        if (required && !trimmedValue) {
            errors.push('NFT name is required');
        }

        if (trimmedValue && trimmedValue.length < minLength) {
            errors.push(`NFT name must be at least ${minLength} characters`);
        }

        if (trimmedValue.length > maxLength) {
            errors.push(`NFT name cannot exceed ${maxLength} characters`);
        }

        // Check for invalid characters
        const invalidChars = /[<>\"'&]/;
        if (invalidChars.test(trimmedValue)) {
            errors.push('NFT name contains invalid characters');
        }

        // Check for only whitespace
        // if (trimmedValue !== inputValue && inputValue.length > 0) {
        //     errors.push('NFT name cannot contain whitespace');
        // }

        return errors;
    };

    // Sync with external value changes
    useEffect(() => {
        if (value !== localValue) {
            setLocalValue(value);
        }
    }, [value]);

    // Update validation when value changes
    useEffect(() => {
        const errors = validateInput(localValue);
        const errorMessage = errors.join(', ');
        setValidationError(errorMessage);

        if (onValidationChange) {
            onValidationChange(!errorMessage, errorMessage);
        }
    }, [localValue, minLength, maxLength, required]);

    // Handle input changes
    const handleChange = (e) => {
        const newValue = e.target.value;

        // Prevent input if it exceeds maxLength
        if (newValue.length > maxLength) {
            return;
        }

        setLocalValue(newValue);

        // Call parent onChange if provided
        if (onChange) {
            onChange(newValue);
        }
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        getValue: () => localValue.trim(),
        setValue: (newValue) => {
            setLocalValue(newValue);
            if (onChange) {
                onChange(newValue);
            }
        },
        reset: () => {
            setLocalValue('');
            if (onChange) {
                onChange('');
            }
        },
        validate: () => {
            const errors = validateInput(localValue);
            return {
                isValid: errors.length === 0,
                errors
            };
        }
    }));

    const getCharacterCountColor = () => {
        const length = localValue.length;
        if (length > maxLength * 0.9) return 'text-red-400';
        if (length > maxLength * 0.8) return 'text-yellow-400';
        return 'text-gray-500';
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-300">
                NFT Name {required && <span className="text-red-400">*</span>}
            </label>

            <div className="relative">
                <input
                    type="text"
                    value={localValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    className={`w-full px-4 py-3 rounded-lg border text-white placeholder-gray-500
                        bg-[#0F1A1F] transition-all duration-200 outline-none pr-16
                        ${validationError ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' :
                            'border-gray-600 focus:border-[#50D2C1] focus:ring-2 focus:ring-[#50D2C1]/20'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500'}
                    `}
                />

                {/* Character counter */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className={`text-xs ${getCharacterCountColor()}`}>
                        {localValue.length}/{maxLength}
                    </span>
                </div>

                {/* Validation icon */}
                {validationError && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                        <AlertCircle size={16} className="text-red-400" />
                    </div>
                )}
            </div>

            {/* Validation Error Message */}
            {validationError && (
                <div className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationError}
                </div>
            )}

            {/* Helper text */}
            {!validationError && (
                <p className="text-gray-500 text-sm">
                    Enter an NFT name between {minLength}-{maxLength} characters
                </p>
            )}
        </div>
    );
});

NFTNameInput.displayName = 'NFTNameInput';

export default NFTNameInput;