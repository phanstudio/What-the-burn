import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Image, X } from 'lucide-react';

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

export default NFTSelect;