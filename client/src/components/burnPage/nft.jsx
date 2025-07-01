import React, { useState, useRef, useEffect } from 'react';
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
    required = false,
    minSelections = 0,
    value = []
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNFTs, setSelectedNFTs] = useState(value || []);
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

    // Update selected NFTs when value prop changes
    useEffect(() => {
        setSelectedNFTs(value || []);
    }, [value]);

    // Validate selection
    const validateSelection = (selection) => {
        if (required && (!selection || selection.length === 0)) {
            setLocalError('Please select at least one NFT');
            return false;
        }

        if (minSelections && selection.length < minSelections) {
            setLocalError(`Please select at least ${minSelections} NFTs (currently ${selection.length} selected)`);
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
    // https://placehold.co/600x400?text=Hello+World
    const sampleNFTs = [
        { id: "1", name: "Cool NFT #1", image: "https://placehold.co/40x40/6366f1/white?text=1" },
        { id: "2", name: "Awesome NFT #2", image: "https://placeholder.co/40x40/8b5cf6/white?text=2" },
        { id: "3", name: "Epic NFT #3", image: "https://placeholder.co/40x40/ec4899/white?text=3" },
        { id: "4", name: "Rare NFT #4", image: "https://placeholder.co/40x40/10b981/white?text=4" },
        { id: "5", name: "Legendary NFT #5", image: "https://placeholder.co/40x40/f59e0b/white?text=5" },
        { id: "6", name: "Mystic NFT #6", image: "https://placeholder.co/40x40/ef4444/white?text=6" },
        { id: "7", name: "Dragon NFT #7", image: "https://placeholder.co/40x40/3b82f6/white?text=7" },
        { id: "8", name: "Phoenix NFT #8", image: "https://placeholder.co/40x40/f97316/white?text=8" },
        { id: "9", name: "Unicorn NFT #9", image: "https://placeholder.co/40x40/06b6d4/white?text=9" },
        { id: "10", name: "Griffin NFT #10", image: "https://placeholder.co/40x40/84cc16/white?text=10" }
    ];

    const nftList = nfts.length > 0 ? nfts : sampleNFTs;
    const hasError = error || localError;
    const isMinimumMet = selectedNFTs.length >= minSelections;

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
                                <div className={`font-medium truncate ${isMinimumMet ? 'text-gray-900' : 'text-orange-500'}`}>
                                    {getDisplayText()}
                                </div>
                                <div className={`text-sm ${isMinimumMet ? 'text-gray-500' : 'text-orange-500'}`}>
                                    {selectedNFTs.length} selected {!isMinimumMet && minSelections > 0 && `(need ${minSelections - selectedNFTs.length} more)`}
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

            {/* Progress Indicator */}
            {minSelections > 0 && selectedNFTs.length > 0 && selectedNFTs.length < minSelections && (
                <div className="mt-2 mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress to minimum</span>
                        <span>{selectedNFTs.length}/{minSelections}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((selectedNFTs.length / minSelections) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Selected Tags */}
            {selectedNFTs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedNFTs.map((nft) => (
                        <div
                            key={nft.id}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${isMinimumMet
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                                }`}
                        >
                            <span className="truncate max-w-24">{nft.name}</span>
                            <button
                                onClick={(e) => removeNFT(nft, e)}
                                className={`rounded-full p-0.5 ${isMinimumMet
                                    ? 'hover:bg-blue-200'
                                    : 'hover:bg-orange-200'
                                    }`}
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
                            <div className="p-2 text-xs bg-gray-50 border-b">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">
                                        {selectedNFTs.length} selected
                                        {maxSelections && ` / ${maxSelections} max`}
                                    </span>
                                    {minSelections > 0 && (
                                        <span className={`font-medium ${isMinimumMet ? 'text-green-600' : 'text-orange-600'}`}>
                                            {isMinimumMet ? '✓ Minimum met' : `Need ${minSelections - selectedNFTs.length} more`}
                                        </span>
                                    )}
                                </div>
                                {maxSelections && selectedNFTs.length >= maxSelections && (
                                    <span className="text-red-500 ml-2">Limit reached</span>
                                )}
                            </div>
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
                                            {selected && <Check size={14} className="text-[#50D2C1]" />}
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
    placeholder = "Select NFT",
    className = "",
    disabled = false,
    unavailableNFTs = [],
    error = null,
    required = false,
    value = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(value);
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

    // Update selected NFT when value prop changes
    useEffect(() => {
        setSelectedNFT(value);
    }, [value]);

    // Validate selection
    const validateSelection = (selection) => {
        if (required && !selection) {
            setLocalError('Please select an NFT');
            return false;
        }

        setLocalError('');
        return true;
    };

    const isUnavailable = (nft) => {
        return unavailableNFTs.some(unavailable => unavailable.id === nft.id);
    };

    const handleNFTClick = (nft) => {
        if (isUnavailable(nft)) return;

        setSelectedNFT(nft);
        setIsOpen(false);
        validateSelection(nft);

        if (onSelect) {
            onSelect(nft);
        }
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        setSelectedNFT(null);
        validateSelection(null);

        if (onSelect) {
            onSelect(null);
        }
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const sampleNFTs = [
        { id: "1", name: "Cool NFT #1", image: "https://placeholder.co/40x40/6366f1/white?text=1" },
        { id: "2", name: "Awesome NFT #2", image: "https://placeholder.co/40x40/8b5cf6/white?text=2" },
        { id: "3", name: "Epic NFT #3", image: "https://placeholder.co/40x40/ec4899/white?text=3" },
        { id: "4", name: "Rare NFT #4", image: "https://placeholder.co/40x40/10b981/white?text=4" },
        { id: "5", name: "Legendary NFT #5", image: "https://placeholder.co/40x40/f59e0b/white?text=5" }
    ];

    const nftList = nfts.length > 0 ? nfts : sampleNFTs;
    const hasError = error || localError;

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
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
                    {selectedNFT ? (
                        <>
                            {selectedNFT.image ? (
                                <img
                                    src={selectedNFT.image}
                                    alt={selectedNFT.name}
                                    className="w-8 h-8 rounded-md object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                                    <Image size={16} className="text-gray-400" />
                                </div>
                            )}
                            <div className="text-left min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate">
                                    {selectedNFT.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    ID: {selectedNFT.id}
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
                    {selectedNFT && !disabled && (
                        <button
                            onClick={clearSelection}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X size={16} className="text-gray-400" />
                        </button>
                    )}
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

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {nftList.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <AlertCircle size={24} className="mx-auto mb-2 text-red-400" />
                            No NFTs available
                        </div>
                    ) : (
                        nftList.map((nft) => {
                            const selected = selectedNFT?.id === nft.id;
                            const unavailable = isUnavailable(nft);

                            return (
                                <button
                                    key={nft.id}
                                    onClick={() => handleNFTClick(nft)}
                                    disabled={unavailable}
                                    className={`w-full flex items-center space-x-3 p-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${unavailable
                                        ? 'bg-red-50 opacity-60 cursor-not-allowed'
                                        : selected
                                            ? 'bg-blue-50 hover:bg-blue-100'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${unavailable
                                        ? 'bg-red-200 border-red-300'
                                        : selected
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'border-gray-300'
                                        }`}>
                                        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
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
                                            <Image size={18} className="text-[#50D2C1]" />
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
                        })
                    )}
                </div>
            )}
        </div>
    );
};



// Selector Component showing both selectors
const Selector = (
    {
        nfts = [],
        onSelect,
        placeholder = "Select NFT",
        className = "",
        disabled = false,
        unavailableNFTs = [],
        error = null,
        required = false,
        value = null
    }
) => {
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [selectedNFTs, setSelectedNFTs] = useState([]);

    return (
        <div className="p-8  mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-[#50D2C1] text-center">NFT Selector Components</h1>

            {/* Multiple Select Selector */}
            <div className="bg-inherit p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Multiple NFT Select (Min: 10, Max: 15)</h2>

                <NFTMultiSelect
                    nfts={nfts}
                    onSelect={setSelectedNFTs}
                    placeholder="Select 10-15 NFTs"
                    className="mb-4"
                    minSelections={10}
                    maxSelections={15}
                    required={true}
                    value={selectedNFTs}
                />

                <div className="mt-4 p-4 bg-inherit rounded-lg">
                    <h3 className="font-semibold mb-2">Selected NFTs ({selectedNFTs.length}):</h3>
                    {selectedNFTs.length === 0 ? (
                        <p className="text-gray-500">No NFTs selected</p>
                    ) : (
                        <div className="space-y-1">
                            {selectedNFTs.map((nft) => (
                                <div key={nft.id} className="text-sm">
                                    • {nft.name} (ID: {nft.id})
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedNFTs.length > 0 && selectedNFTs.length < 3 && (
                        <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded text-orange-800 text-sm">
                            ⚠️ You need to select at least 10 NFTs. Currently selected: {selectedNFTs.length}
                        </div>
                    )}

                    {selectedNFTs.length >= 10 && (
                        <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-green-800 text-sm">
                            ✅ Minimum requirement met! You have selected {selectedNFTs.length} NFTs.
                        </div>
                    )}
                </div>
            </div>

            {/* Single Select Selector */}
            <div className="bg-inherit p-6 rounded-lg border border-[#50D2C1]">
                <h2 className="text-xl font-semibold mb-4 text-[#50D2C1]">Single NFT Select</h2>

                <NFTSelect
                    nfts={nfts}
                    onSelect={setSelectedNFT}
                    placeholder="Choose one NFT"
                    className="mb-4"
                    required={true}
                    value={selectedNFT}
                />

                <div className="mt-4 p-4 bg-inherit rounded-lg">
                    <h3 className="font-semibold mb-2">Selected NFT:</h3>
                    {selectedNFT ? (
                        <div className="text-sm">
                            • {selectedNFT.name} (ID: {selectedNFT.id})
                        </div>
                    ) : (
                        <p className="text-gray-500">No NFT selected</p>
                    )}
                </div>
            </div>


        </div>
    );
};

// Export both components and the Selector
export default Selector;
export { NFTSelect, NFTMultiSelect };