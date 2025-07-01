import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ChevronDown, Image, X, Check, AlertCircle } from 'lucide-react';
// Multiple Select NFT Component
const NFTMultiSelect = ({
    nfts = [],
    onSelect,
    placeholder = "Select NFTs",
    className = "",
    maxSelections = null,
    disabled = false,
    unavailableNFTs = [],
    error = null,
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNFTs, setSelectedNFTs] = useState([]);
    const [localError, setLocalError] = useState('');
    const dropdownRef = useRef(null);

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

    // Validate selection
    const validateSelection = (selection) => {
        if (required && (!selection || selection.length === 0)) {
            setLocalError('Please select at least one NFT');
            return false;
        }
        setLocalError('');
        return true;
    };

    const isSelected = (nft) => {
        return selectedNFTs.some(selected => selected.id === nft.id);
    };

    const isUnavailable = (nft) => {
        return unavailableNFTs.some(unavailable => unavailable.id === nft.id);
    };

    const handleNFTClick = (nft) => {
        if (isUnavailable(nft)) return;

        let newSelection;

        if (isSelected(nft)) {
            newSelection = selectedNFTs.filter(item => item.id !== nft.id);
        } else {
            if (maxSelections && selectedNFTs.length >= maxSelections) {
                setLocalError(`You can only select up to ${maxSelections} NFTs`);
                return;
            }
            newSelection = [...selectedNFTs, nft];
        }

        setSelectedNFTs(newSelection);
        validateSelection(newSelection);

        if (onSelect) {
            onSelect(newSelection);
        }
    };

    const removeNFT = (nftToRemove, e) => {
        e.stopPropagation();
        const newSelection = selectedNFTs.filter(nft => nft.id !== nftToRemove.id);
        setSelectedNFTs(newSelection);
        validateSelection(newSelection);

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
        if (selectedNFTs.length === 0) {
            return placeholder;
        }
        if (selectedNFTs.length === 1) {
            return selectedNFTs[0].name;
        }
        return `${selectedNFTs[0].name} (+${selectedNFTs.length - 1} more)`;
    };

    const sampleNFTs = [
        { id: "1", name: "Cool NFT #1", image: "https://dummyimage.com/40x40/6366f1/white?text=1" },
        { id: "2", name: "Awesome NFT #2", image: "https://dummyimage.com/40x40/8b5cf6/white?text=2" },
        { id: "3", name: "Epic NFT #3", image: "https://dummyimage.com/40x40/ec4899/white?text=3" },
        { id: "4", name: "Rare NFT #4", image: "https://dummyimage.com/40x40/10b981/white?text=4" },
        { id: "5", name: "Legendary NFT #5", image: "https://dummyimage.com/40x40/f59e0b/white?text=5" }
    ];

    const nftList = nfts.length > 0 ? nfts : sampleNFTs;
    const hasError = error || localError;

    return (
        <div className={`relative w-full max-w-md ${className}`} ref={dropdownRef}>
            {/* Main Select Button */}
            <button
                onClick={toggleDropdown}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 border rounded-lg bg-transparent transition-all duration-200 ${hasError
                    ? 'border-red-400 focus:ring-red-500'
                    : disabled
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                        <span className={hasError ? "text-red-400" : "text-gray-500"}>
                            {placeholder}
                            {required && <span className="text-red-400 ml-1">*</span>}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {hasError && <AlertCircle size={16} className="text-red-400" />}
                    <ChevronDown
                        size={20}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-gray-300' : hasError ? 'text-red-400' : 'text-gray-400'
                            }`}
                    />
                </div>
            </button>

            {/* Error Message */}
            {hasError && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {error || localError}
                </p>
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
                            <AlertCircle size={24} className="mx-auto mb-2 text-red-400" />
                            No NFTs available
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
                                        className={`w-full flex items-center space-x-3 p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${unavailable
                                            ? 'bg-red-50 opacity-60 cursor-not-allowed'
                                            : selected
                                                ? 'bg-blue-50 hover:bg-blue-100'
                                                : canSelect
                                                    ? 'hover:bg-gray-50'
                                                    : 'opacity-50 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${unavailable
                                            ? 'bg-red-200 border-red-300'
                                            : selected
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'border-gray-300'
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
                                            <div className={`font-medium truncate flex items-center gap-2 ${unavailable
                                                ? 'text-red-600'
                                                : selected
                                                    ? 'text-blue-900'
                                                    : 'text-gray-900'
                                                }`}>
                                                {nft.name}
                                                {unavailable && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Unavailable</span>}
                                            </div>
                                            <div className={`text-sm ${unavailable
                                                ? 'text-red-500'
                                                : selected
                                                    ? 'text-blue-700'
                                                    : 'text-gray-500'
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

// Single Select NFT Component
const NFTSelect = ({
    nfts = [],
    onSelect,
    placeholder = "Select an NFT",
    className = "",
    value = null,
    disabled = false,
    unavailableNFTs = [],
    error = null,
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(value);
    const [localError, setLocalError] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        setSelectedNFT(value);
    }, [value]);

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

    const validateSelection = (selection) => {
        if (required && !selection) {
            setLocalError('Please select an NFT');
            return false;
        }
        setLocalError('');
        return true;
    };

    const handleSelect = (nft) => {
        const isUnavailable = unavailableNFTs.some(unavailable => unavailable.id === nft.id);
        if (isUnavailable) return;

        setSelectedNFT(nft);
        setIsOpen(false);
        validateSelection(nft);

        if (onSelect) {
            onSelect(nft);
        }
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const sampleNFTs = [
        { id: "1", name: "Cool NFT #1", image: "https://dummyimage.com/40x40/6366f1/white?text=1" },
        { id: "2", name: "Awesome NFT #2", image: "https://dummyimage.com/40x40/8b5cf6/white?text=2" },
        { id: "3", name: "Epic NFT #3", image: "https://dummyimage.com/40x40/ec4899/white?text=3" },
        { id: "4", name: "Rare NFT #4", image: "https://dummyimage.com/40x40/10b981/white?text=4" },
        { id: "5", name: "Legendary NFT #5", image: "https://dummyimage.com/40x40/f59e0b/white?text=5" }
    ];

    const nftList = nfts.length > 0 ? nfts : sampleNFTs;
    const hasError = error || localError;

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            {/* Select Button */}
            <button
                onClick={toggleDropdown}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 border rounded-lg bg-transparent transition-all duration-200 ${hasError
                    ? 'border-red-400 focus:ring-red-500'
                    : disabled
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                        <span className={hasError ? "text-red-400" : disabled ? 'text-gray-400' : 'text-gray-500'}>
                            {placeholder}
                            {required && <span className="text-red-400 ml-1">*</span>}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {hasError && <AlertCircle size={16} className="text-red-400" />}
                    <ChevronDown
                        size={20}
                        className={`transition-transform duration-200 flex-shrink-0 ${disabled ? 'text-gray-300' : hasError ? 'text-red-400' : 'text-gray-400'
                            } ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {/* Error Message */}
            {hasError && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {error || localError}
                </p>
            )}

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {nftList.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <AlertCircle size={24} className="mx-auto mb-2 text-red-400" />
                            No NFTs available
                        </div>
                    ) : (
                        nftList.map((nft) => {
                            const isUnavailable = unavailableNFTs.some(unavailable => unavailable.id === nft.id);

                            return (
                                <button
                                    key={nft.id}
                                    onClick={() => handleSelect(nft)}
                                    disabled={isUnavailable}
                                    className={`w-full flex items-center space-x-3 p-3 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0 text-left ${isUnavailable
                                        ? 'bg-red-50 opacity-60 cursor-not-allowed'
                                        : 'hover:bg-gray-50 focus:bg-gray-50'
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
                                        <div className={`font-medium truncate flex items-center gap-2 ${isUnavailable ? 'text-red-600' : 'text-gray-900'
                                            }`}>
                                            {nft.name}
                                            {isUnavailable && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Unavailable</span>}
                                        </div>
                                        <div className={`text-sm ${isUnavailable ? 'text-red-500' : 'text-gray-500'
                                            }`}>
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

// Demo Selector Component
const Selector = forwardRef(({
    nfts = [],
    onSelect,
    placeholder = "Select NFTs",
    className = "",
    maxSelections = null,
    disabled = false,
    unavailableNFTs = [],
    error = null
}, ref) => {
    const [multipleSelection, setMultipleSelection] = useState([]);
    const [singleSelection, setSingleSelection] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Validate both selections
    const validateSelections = () => {
        const errors = {};

        if (multipleSelection.length === 0) {
            errors.multiple = 'Please select at least one NFT for burning';
        }

        if (!singleSelection) {
            errors.single = 'Please select a featured NFT';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle multiple selection change
    const handleMultipleSelection = (selection) => {
        setMultipleSelection(selection);

        if (selection.length > 0 && validationErrors.multiple) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.multiple;
                return newErrors;
            });
        }

        if (onSelect) {
            onSelect({
                multiple: selection,
                single: singleSelection,
                isValid: selection.length > 0 && singleSelection !== null
            });
        }
    };

    // Handle single selection change
    const handleSingleSelection = (selection) => {
        setSingleSelection(selection);

        if (selection && validationErrors.single) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.single;
                return newErrors;
            });
        }

        if (onSelect) {
            onSelect({
                multiple: multipleSelection,
                single: selection,
                isValid: multipleSelection.length > 0 && selection !== null
            });
        }
    };

    // Create unavailable lists
    const unavailableForMultiple = singleSelection ? [singleSelection, ...unavailableNFTs] : unavailableNFTs;
    const unavailableForSingle = [...multipleSelection, ...unavailableNFTs];

    // Expose validation and data retrieval via ref
    useImperativeHandle(ref, () => ({
        validate: validateSelections,
        getSelections: () => ({
            multiple: multipleSelection,
            single: singleSelection
        })
    }));

    return (
        <div className="space-y-8 bg-[0000] h-auto">
            <div className="mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-white">Select NFTs</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-transparent border border-[#50D2C1] p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 text-[#50D2C1]">
                        Multiple Select (Max {maxSelections || 10})
                        <span className="text-red-400 ml-1">*</span>
                    </h2>
                    <NFTMultiSelect
                        nfts={nfts}
                        maxSelections={maxSelections || 10}
                        onSelect={handleMultipleSelection}
                        placeholder="Choose multiple NFTs to burn..."
                        unavailableNFTs={unavailableForMultiple}
                        error={validationErrors.multiple}
                        required={true}
                    />
                </div>

                <div className="bg-transparent border border-[#50D2C1] p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 text-[#50D2C1]">
                        Featured NFT Selection
                        <span className="text-red-400 ml-1">*</span>
                    </h2>
                    <NFTSelect
                        nfts={nfts}
                        onSelect={handleSingleSelection}
                        placeholder="Choose a featured NFT..."
                        className="max-w-md"
                        unavailableNFTs={unavailableForSingle}
                        error={validationErrors.single}
                        required={true}
                    />
                </div>

                {(multipleSelection.length > 0 || singleSelection) && (
                    <div className="bg-[#0F1A1F] border border-[#50D2C1] p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-[#50D2C1]">Selection Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-white mb-2">NFTs to Burn:
                                    <span className={`ml-2 font-semibold ${multipleSelection.length > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {multipleSelection.length}
                                    </span>
                                </p>
                                <p className="text-white">Featured NFT:
                                    <span className={`ml-2 font-semibold ${singleSelection ? 'text-green-400' : 'text-red-400'}`}>
                                        {singleSelection ? 'Selected' : 'Not Selected'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-white">Total Selection:
                                    <span className="ml-2 font-semibold text-[#50D2C1]">
                                        {multipleSelection.length + (singleSelection ? 1 : 0)} NFTs
                                    </span>
                                </p>
                                <p className="text-white">Status:
                                    <span className={`ml-2 font-semibold ${multipleSelection.length > 0 && singleSelection ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {multipleSelection.length > 0 && singleSelection ? 'Ready' : 'Incomplete'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default Selector;
