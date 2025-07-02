import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Image, X, Check } from 'lucide-react';

const NFTMultiSelect = ({
    nfts = [],
    onSelect,
    placeholder = "Select NFTs",
    className = "",
    maxSelections = null,
    disabled = false,
    unavailableNFTs = [],
    required = false,
    onValidationChange
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
        onSelect(newSelection);

        // Simple validation feedback for parent
        if (onValidationChange) {
            const isValid = !required || newSelection.length > 0;
            onValidationChange(isValid);
        }
    };

    const removeNFT = (nftToRemove, e) => {
        e.stopPropagation();
        const newSelection = selectedNFTs.filter(nft => nft.id !== nftToRemove.id);
        setSelectedNFTs(newSelection);
        onSelect(newSelection);

        if (onValidationChange) {
            const isValid = !required || newSelection.length > 0;
            onValidationChange(isValid);
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
                className={`w-full flex items-center justify-between p-3 border rounded-lg bg-transparent transition-all duration-200 ${disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' :
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

export default NFTMultiSelect;