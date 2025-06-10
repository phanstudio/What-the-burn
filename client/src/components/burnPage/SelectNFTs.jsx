import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Image } from 'lucide-react';

const NFTSelect = ({
    nfts = [],
    onSelect,
    placeholder = "Select an NFT",
    className = "",
    value = null,
    disabled = false
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
                    {nfts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No NFTs available
                        </div>
                    ) : (
                        nfts.map((nft) => (
                            <button
                                key={nft.id}
                                onClick={() => handleSelect(nft)}
                                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0 text-left"
                            >
                                {nft.image ? (
                                    <img
                                        src={nft.image}
                                        alt={nft.name}
                                        className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                                        <Image size={18} className="text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">{nft.name}</div>
                                    <div className="text-sm text-gray-500">ID: {nft.id}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NFTSelect; 