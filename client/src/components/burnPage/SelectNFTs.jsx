import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Image, X, Check } from 'lucide-react';

// Multiple Select NFT Component
const NFTMultiSelect = ({
    nfts = [],
    onSelect,
    placeholder = "Select NFTs",
    className = "",
    maxSelections = null,
    disabled = false,
    unavailableNFTs = []
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNFTs, setSelectedNFTs] = useState([]);
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

    const isSelected = (nft) => {
        return selectedNFTs.some(selected => selected.id === nft.id);
    };

    const isUnavailable = (nft) => {
        return unavailableNFTs.some(unavailable => unavailable.id === nft.id);
    };

    const handleNFTClick = (nft) => {
        if (isUnavailable(nft)) return; // Don't allow selection of unavailable NFTs

        let newSelection;

        if (isSelected(nft)) {
            // Remove NFT
            newSelection = selectedNFTs.filter(item => item.id !== nft.id);
        } else {
            // Add NFT (check max limit)
            if (maxSelections && selectedNFTs.length >= maxSelections) {
                return; // Don't add if at limit
            }
            newSelection = [...selectedNFTs, nft];
        }

        setSelectedNFTs(newSelection);

        // Call onSelect callback
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
        if (selectedNFTs.length === 0) {
            return placeholder;
        }
        if (selectedNFTs.length === 1) {
            return selectedNFTs[0].name;
        }
        return `${selectedNFTs[0].name} (+${selectedNFTs.length - 1} more)`;
    };

    // Sample data for testing
    const sampleNFTs = [
        { id: "1", name: "Cool NFT #1", image: "https://via.placeholder.com/40x40/6366f1/white?text=1" },
        { id: "2", name: "Awesome NFT #2", image: "https://via.placeholder.com/40x40/8b5cf6/white?text=2" },
        { id: "3", name: "Epic NFT #3", image: "https://via.placeholder.com/40x40/ec4899/white?text=3" },
        { id: "4", name: "Rare NFT #4", image: "https://via.placeholder.com/40x40/10b981/white?text=4" },
        { id: "5", name: "Legendary NFT #5", image: "https://via.placeholder.com/40x40/f59e0b/white?text=5" }
    ];

    const nftList = nfts.length > 0 ? nfts : sampleNFTs;

    return (
        <div className={`relative w-full max-w-md ${className}`} ref={dropdownRef}>
            {/* Main Select Button */}
            <button
                onClick={toggleDropdown}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 border rounded-lg bg-white transition-all duration-200 ${disabled
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
                                <div className="font-medium text-gray-900 truncate">
                                    {getDisplayText()}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {selectedNFTs.length} selected
                                </div>
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                </div>
                <ChevronDown
                    size={20}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-gray-300' : 'text-gray-400'
                        }`}
                />
            </button>

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
                            No NFTs available
                        </div>
                    ) : (
                        <>
                            {maxSelections && (
                                <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                                    {selectedNFTs.length}/{maxSelections} selected
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
    unavailableNFTs = []
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(value);
    const dropdownRef = useRef(null);

    // Update selected NFT when value prop changes
    useEffect(() => {
        setSelectedNFT(value);
    }, [value]);

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

    const handleSelect = (nft) => {
        // Check if NFT is unavailable
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

    // Sample data for testing
    const sampleNFTs = [
        { id: "1", name: "Cool NFT #1", image: "https://via.placeholder.com/40x40/6366f1/white?text=1" },
        { id: "2", name: "Awesome NFT #2", image: "https://via.placeholder.com/40x40/8b5cf6/white?text=2" },
        { id: "3", name: "Epic NFT #3", image: "https://via.placeholder.com/40x40/ec4899/white?text=3" },
        { id: "4", name: "Rare NFT #4", image: "https://via.placeholder.com/40x40/10b981/white?text=4" },
        { id: "5", name: "Legendary NFT #5", image: "https://via.placeholder.com/40x40/f59e0b/white?text=5" }
    ];

    const nftList = nfts.length > 0 ? nfts : sampleNFTs;

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            {/* Select Button */}
            <button
                onClick={toggleDropdown}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 border rounded-lg bg-white transition-all duration-200 ${disabled
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
                        <span className={`${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                            {placeholder}
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={20}
                    className={`transition-transform duration-200 flex-shrink-0 ${disabled ? 'text-gray-300' : 'text-gray-400'
                        } ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {nftList.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
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
const Selector = ({
    nfts = [],
    onSelect,
    placeholder = "Select NFTs",
    className = "",
    maxSelections = null,
    disabled = false,
    unavailableNFTs = []
}) => {
    const [multipleSelection, setMultipleSelection] = useState([]);
    const [singleSelection, setSingleSelection] = useState(null);

    // Create unavailable lists - NFTs selected in one component are unavailable in the other
    const unavailableForMultiple = singleSelection ? [singleSelection] : [];
    const unavailableForSingle = multipleSelection;

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">NFT Select Components</h1>


                {/* Multiple Select */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Multiple Select (Max 10)</h2>
                    <NFTMultiSelect
                        nfts={nfts}
                        maxSelections={10}
                        onSelect={setMultipleSelection}
                        placeholder="Choose multiple NFTs..."
                        unavailableNFTs={unavailableForMultiple}
                    />
                    {multipleSelection.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                            <strong className="text-green-800">Selected {multipleSelection.length} NFTs:</strong>
                            <ul className="mt-2 text-green-700">
                                {multipleSelection.map(nft => (
                                    <li key={nft.id}>• {nft.name} (ID: {nft.id})</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Single Select */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Single Select</h2>
                    <NFTSelect
                        nfts={nfts}
                        onSelect={setSingleSelection}
                        placeholder="Choose one NFT..."
                        className="max-w-md"
                        unavailableNFTs={unavailableForSingle}
                    />
                    {singleSelection && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                            <strong className="text-blue-800">Selected:</strong>
                            <span className="text-blue-700"> {singleSelection.name} (ID: {singleSelection.id})</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Selector;