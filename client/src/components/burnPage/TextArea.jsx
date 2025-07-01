import React, { useState, useEffect } from 'react';

export const TextArea = ({
    value = '',
    onChange,
    placeholder = "Enter your text here...",
    maxLength = 1000,
    rows = 2,
    className = "",
    name = "name", // Add name prop for form identification
    required = false,
}) => {
    const [charCount, setCharCount] = useState(value.length);

    // Update character count when value changes
    useEffect(() => {
        setCharCount(value.length);
    }, [value]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setCharCount(newValue.length);

        if (onChange) {
            onChange(newValue);
        }
    };

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
                    placeholder={placeholder}
                    rows={rows}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#50D2C1] focus:border-[#50D2C1] transition-all duration-200"
                />

                {/* Character counter */}
                <div className="flex justify-end mt-2">
                    <div className="text-sm text-gray-400">
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