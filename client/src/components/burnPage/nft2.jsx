// NFTMultiSelect.jsx - Enhanced with validation
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Image, X, Check, AlertCircle } from 'lucide-react';

const NFTMultiSelect = ({
    nfts = [],
    onSelect,
    placeholder = "Select NFTs",
    className = "",
    maxSelections = null,
    minSelections = 0,
    disabled = false,
    unavailableNFTs = [],
    required = false,
    onValidationChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNFTs, setSelectedNFTs] = useState([]);
    const [validationError, setValidationError] = useState('');
    const dropdownRef = useRef(null);

    // Validation function
    const validateSelection = (selection) => {
        const errors = [];

        if (required && selection.length === 0) {
            errors.push('At least one NFT must be selected');
        }

        if (minSelections > 0 && selection.length < minSelections) {
            errors.push(`Minimum ${minSelections} NFT${minSelections > 1 ? 's' : ''} required`);
        }

        if (maxSelections && selection.length > maxSelections) {
            errors.push(`Maximum ${maxSelections} NFT${maxSelections > 1 ? 's' : ''} allowed`);
        }

        // Check for duplicate IDs
        const ids = selection.map(nft => nft.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
            errors.push('Duplicate NFTs detected');
        }

        // Validate NFT structure
        const invalidNFTs = selection.filter(nft => !nft.id || !nft.name);
        if (invalidNFTs.length > 0) {
            errors.push('Invalid NFT data detected');
        }

        return errors;
    };

    // Update validation when selection changes
    useEffect(() => {
        const errors = validateSelection(selectedNFTs);
        const errorMessage = errors.join(', ');
        setValidationError(errorMessage);

        if (onValidationChange) {
            onValidationChange(!errorMessage, errorMessage);
        }
    }, [selectedNFTs, maxSelections, minSelections, required]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Validate NFT data structure
    const isValidNFT = (nft) => {
        return nft && typeof nft === 'object' && nft.id && nft.name;
    };

    const isSelected = (nft) => {
        return selectedNFTs.some(selected => selected.id === nft.id);
    };

    const isUnavailable = (nft) => {
        return unavailableNFTs.some(unavailable => unavailable.id === nft.id);
    };

    const handleNFTClick = (nft) => {
        if (!isValidNFT(nft) || isUnavailable(nft)) return;

        let newSelection;

        if (isSelected(nft)) {
            newSelection = selectedNFTs.filter(item => item.id !== nft.id);
        } else {
            if (maxSelections && selectedNFTs.length >= maxSelections) {
                return;
            }
            newSelection = [...selectedNFTs, nft];
        }

        setSelectedNFTs(newSelection);

        if (onSelect) {
            onSelect(newSelection);
        }
    };

    const removeNFT = (nftToRemove, e) => {
        e.stopPropagation();
        const newSelection = selectedNFTs.filter(nft => nft.id !== nftToRemove.id);
        setSelectedNFTs(newSelection);

        if (onSelect) {
            onSelect(newSelection);
        }
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const getDisplayText = () => {
        if (selectedNFTs.length === 0) return placeholder;
        if (selectedNFTs.length === 1) return selectedNFTs[0].name;
        return `${selectedNFTs[0].name} (+${selectedNFTs.length - 1} more)`;
    };

    // Filter out invalid NFTs
    const validNFTs = nfts.filter(isValidNFT);
    const sampleNFTs = [
        { id: "1", name: "Cool NFT #1", image: "https://via.placeholder.com/40x40/6366f1/white?text=1" },
        { id: "2", name: "Awesome NFT #2", image: "https://via.placeholder.com/40x40/8b5cf6/white?text=2" },
        { id: "3", name: "Epic NFT #3", image: "https://via.placeholder.com/40x40/ec4899/white?text=3" },
        { id: "4", name: "Rare NFT #4", image: "https://via.placeholder.com/40x40/10b981/white?text=4" },
        { id: "5", name: "Legendary NFT #5", image: "https://via.placeholder.com/40x40/f59e0b/white?text=5" }
    ];

    const nftList = validNFTs.length > 0 ? validNFTs : sampleNFTs;

    return (
        <div className={`relative w-full max-w-md ${className}`} ref={dropdownRef}>
            {/* Main Button */}
            <button
                onClick={toggleDropdown}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 border rounded-lg bg-transparent transition-all duration-200 ${validationError ? 'border-red-400 focus:ring-red-500' :
                        disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' :
                            'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }`}
            >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {selectedNFTs.length > 0 ? (
                        <>
                            {selectedNFTs[0].image ? (
                                <img
                                    src={selectedNFTs[0].image}
                                    alt={selectedNFTs[0].name}
                                    className="w-8 h-8 rounded-md object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                                    <Image size={16} className="text-gray-400" />
                                </div>
                            )}
                            <div className="text-left min-w-0 flex-1">
                                <div className="font-medium text-[#50D2C1] truncate">
                                    {getDisplayText()}
                                </div>
                                <div className="text-sm text-[#50D2C1]">
                                    {selectedNFTs.length} selected
                                </div>
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-500">
                            {placeholder}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {validationError && (
                        <AlertCircle size={16} className="text-red-400" />
                    )}
                    <ChevronDown
                        size={20}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-gray-300' : 'text-gray-400'
                            }`}
                    />
                </div>
            </button>

            {/* Validation Error Message */}
            {validationError && (
                <div className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationError}
                </div>
            )}

            {/* Selected Tags */}
            {selectedNFTs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedNFTs.map((nft) => (
                        <div
                            key={nft.id}
                            className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                            <span className="truncate max-w-24">{nft.name}</span>
                            <button
                                onClick={(e) => removeNFT(nft, e)}
                                className="hover:bg-blue-200 rounded-full p-0.5"
                                disabled={disabled}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {nftList.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No valid NFTs available
                        </div>
                    ) : (
                        <>
                            {maxSelections && (
                                <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                                    {selectedNFTs.length}/{maxSelections} selected
                                    {selectedNFTs.length >= maxSelections && (
                                        <span className="text-red-500 ml-2">Limit reached</span>
                                    )}
                                </div>
                            )}
                            {nftList.map((nft) => {
                                const selected = isSelected(nft);
                                const unavailable = isUnavailable(nft);
                                const canSelect = !unavailable && (!maxSelections || selectedNFTs.length < maxSelections || selected);

                                return (
                                    <button
                                        key={nft.id}
                                        onClick={() => handleNFTClick(nft)}
                                        disabled={!canSelect}
                                        className={`w-full flex items-center space-x-3 p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${unavailable ? 'bg-red-50 opacity-60 cursor-not-allowed' :
                                                selected ? 'bg-blue-50 hover:bg-blue-100' :
                                                    canSelect ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${unavailable ? 'bg-red-200 border-red-300' :
                                                selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                            }`}>
                                            {selected && <Check size={14} className="text-white" />}
                                            {unavailable && <X size={14} className="text-red-600" />}
                                        </div>

                                        {nft.image ? (
                                            <img
                                                src={nft.image}
                                                alt={nft.name}
                                                className={`w-10 h-10 rounded-md object-cover ${unavailable ? 'grayscale' : ''}`}
                                            />
                                        ) : (
                                            <div className={`w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center ${unavailable ? 'grayscale' : ''}`}>
                                                <Image size={18} className="text-gray-400" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className={`font-medium truncate flex items-center gap-2 ${unavailable ? 'text-red-600' :
                                                    selected ? 'text-blue-900' : 'text-gray-900'
                                                }`}>
                                                {nft.name}
                                                {unavailable && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Unavailable</span>}
                                            </div>
                                            <div className={`text-sm ${unavailable ? 'text-red-500' :
                                                    selected ? 'text-blue-700' : 'text-gray-500'
                                                }`}>
                                                ID: {nft.id}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// NFTSelect.jsx - Enhanced with validation
const NFTSelect = ({
    nfts = [],
    onSelect,
    placeholder = "Select an NFT",
    className = "",
    value = null,
    disabled = false,
    unavailableNFTs = [],
    required = false,
    onValidationChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(value);
    const [validationError, setValidationError] = useState('');
    const dropdownRef = useRef(null);

    // Validation function
    const validateSelection = (selection) => {
        const errors = [];

        if (required && !selection) {
            errors.push('Please select an NFT');
        }

        if (selection && (!selection.id || !selection.name)) {
            errors.push('Invalid NFT data');
        }

        return errors;
    };

    useEffect(() => {
        setSelectedNFT(value);
    }, [value]);

    // Update validation when selection changes
    useEffect(() => {
        const errors = validateSelection(selectedNFT);
        const errorMessage = errors.join(', ');
        setValidationError(errorMessage);

        if (onValidationChange) {
            onValidationChange(!errorMessage, errorMessage);
        }
    }, [selectedNFT, required]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Validate NFT data structure
    const isValidNFT = (nft) => {
        return nft && typeof nft === 'object' && nft.id && nft.name;
    };

    const handleSelect = (nft) => {
        if (!isValidNFT(nft)) return;

        const isUnavailable = unavailableNFTs.some(unavailable => unavailable.id === nft.id);
        if (isUnavailable) return;

        setSelectedNFT(nft);
        setIsOpen(false);

        if (onSelect) {
            onSelect(nft);
        }
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    // Filter out invalid NFTs
    const validNFTs = nfts.filter(isValidNFT);
    const sampleNFTs = [
        { id: "1", name: "Cool NFT #1", image: "https://via.placeholder.com/40x40/6366f1/white?text=1" },
        { id: "2", name: "Awesome NFT #2", image: "https://via.placeholder.com/40x40/8b5cf6/white?text=2" },
        { id: "3", name: "Epic NFT #3", image: "https://via.placeholder.com/40x40/ec4899/white?text=3" },
        { id: "4", name: "Rare NFT #4", image: "https://via.placeholder.com/40x40/10b981/white?text=4" },
        { id: "5", name: "Legendary NFT #5", image: "https://via.placeholder.com/40x40/f59e0b/white?text=5" }
    ];

    const nftList = validNFTs.length > 0 ? validNFTs : sampleNFTs;

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            {/* Select Button */}
            <button
                onClick={toggleDropdown}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 border rounded-lg bg-transparent transition-all duration-200 ${validationError ? 'border-red-400 focus:ring-red-500' :
                        disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' :
                            'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
            >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {selectedNFT ? (
                        <>
                            {selectedNFT.image ? (
                                <img
                                    src={selectedNFT.image}
                                    alt={selectedNFT.name}
                                    className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                                    <Image size={16} className="text-gray-400" />
                                </div>
                            )}
                            <div className="text-left min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate">{selectedNFT.name}</div>
                                <div className="text-sm text-gray-500">ID: {selectedNFT.id}</div>
                            </div>
                        </>
                    ) : (
                        <span className={disabled ? 'text-gray-400' : 'text-gray-500'}>
                            {placeholder}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {validationError && (
                        <AlertCircle size={16} className="text-red-400" />
                    )}
                    <ChevronDown
                        size={20}
                        className={`transition-transform duration-200 flex-shrink-0 ${disabled ? 'text-gray-300' : 'text-gray-400'
                            } ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {/* Validation Error Message */}
            {validationError && (
                <div className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationError}
                </div>
            )}

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {nftList.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No valid NFTs available
                        </div>
                    ) : (
                        nftList.map((nft) => {
                            const isUnavailable = unavailableNFTs.some(unavailable => unavailable.id === nft.id);

                            return (
                                <button
                                    key={nft.id}
                                    onClick={() => handleSelect(nft)}
                                    disabled={isUnavailable}
                                    className={`w-full flex items-center space-x-3 p-3 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0 text-left ${isUnavailable ? 'bg-red-50 opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 focus:bg-gray-50'
                                        }`}
                                >
                                    {nft.image ? (
                                        <img
                                            src={nft.image}
                                            alt={nft.name}
                                            className={`w-10 h-10 rounded-md object-cover flex-shrink-0 ${isUnavailable ? 'grayscale' : ''}`}
                                        />
                                    ) : (
                                        <div className={`w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0 ${isUnavailable ? 'grayscale' : ''}`}>
                                            <Image size={18} className="text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium truncate flex items-center gap-2 ${isUnavailable ? 'text-red-600' : 'text-gray-900'}`}>
                                            {nft.name}
                                            {isUnavailable && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Unavailable</span>}
                                        </div>
                                        <div className={`text-sm ${isUnavailable ? 'text-red-500' : 'text-gray-500'}`}>
                                            ID: {nft.id}
                                        </div>
                                    </div>
                                    {isUnavailable && (
                                        <X size={16} className="text-red-500 flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

// NFTNameInput.jsx - Enhanced with validation
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
        if (trimmedValue !== inputValue && inputValue.length > 0) {
            errors.push('NFT name cannot contain only whitespace');
        }

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

// NFTSelector.jsx - Enhanced with validation
const NFTSelector = forwardRef(({
    nfts = [],
    onSelect,
    placeholder = "Select NFTs",
    className = "",
    maxSelections = null,
    minSelections = 1,
    disabled = false,
    unavailableNFTs = [],
    onValidationChange
}, ref) => {
    const [multipleSelection, setMultipleSelection] = useState([]);
    const [singleSelection, setSingleSelection] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Validation function
    const validateSelections = (multiple, single) => {
        const errors = {};

        if (minSelections > 0 && multiple.length < minSelections) {
            errors.multiple = `At least ${minSelections} NFT${minSelections > 1 ? 's' : ''} must be selected for burning`;
        }

        if (maxSelections && multiple.length > maxSelections) {
            errors.multiple = `Maximum ${maxSelections} NFT${maxSelections > 1 ? 's' : ''} allowed for burning`;
        }

        // Check for conflicts between selections
        if (single && multiple.some(nft => nft.id === single.id)) {
            errors.conflict = 'Featured NFT cannot be the same as burn NFTs';
        }

        return errors;
    };

    // Update validation when selections change
    useEffect(() => {
        const errors = validateSelections(multipleSelection, singleSelection);
        setValidationErrors(errors);

        if (onValidationChange) {
            const isValid = Object.keys(errors).length === 0;
            const errorMessage = Object.values(errors).join(', ');
            onValidationChange(isValid, errorMessage);
        }
    }, [multipleSelection, singleSelection, minSelections, maxSelections]);

    // Handle multiple selection change
    const handleMultipleSelection = (selection) => {
        setMultipleSelection(selection);

        // Notify parent component
        if (onSelect) {
            onSelect({
                multiple: selection,
                single: singleSelection
            });
        }
    };