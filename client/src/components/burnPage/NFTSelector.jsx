import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import NFTMultiSelect from './NFTMultiSelect';
import NFTSelect from './NFTSelect';

const NFTSelector = forwardRef(({
    nfts = [],
    onSelect,
    placeholder = "Select NFTs",
    className = "",
    maxSelections = null,
    disabled = false,
    unavailableNFTs = [],
    resetTrigger = 0 // New prop to trigger reset
}, ref) => {
    const [multipleSelection, setMultipleSelection] = useState([]);
    const [singleSelection, setSingleSelection] = useState(null);
    const [internalResetTrigger, setInternalResetTrigger] = useState(0);

    const multiSelectRef = useRef(null);
    const singleSelectRef = useRef(null);

    // Reset functionality when resetTrigger changes
    useEffect(() => {
        if (resetTrigger > 0) {
            setMultipleSelection([]);
            setSingleSelection(null);
            setInternalResetTrigger(prev => prev + 1);

            // Also reset child components via refs
            if (multiSelectRef.current) {
                multiSelectRef.current.reset();
            }
            if (singleSelectRef.current) {
                singleSelectRef.current.reset();
            }

            // Notify parent component of reset
            if (onSelect) {
                onSelect({
                    multiple: [],
                    single: null
                });
            }
        }
    }, [resetTrigger, onSelect]);

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

    // Handle single selection change
    const handleSingleSelection = (selection) => {
        setSingleSelection(selection);

        // Notify parent component
        if (onSelect) {
            onSelect({
                multiple: multipleSelection,
                single: selection
            });
        }
    };

    // Create unavailable lists to prevent conflicts
    const unavailableForMultiple = singleSelection ? [singleSelection, ...unavailableNFTs] : unavailableNFTs;
    const unavailableForSingle = [...multipleSelection, ...unavailableNFTs];

    // Expose data retrieval and reset via ref
    useImperativeHandle(ref, () => ({
        getSelections: () => ({
            multiple: multipleSelection,
            single: singleSelection
        }),
        reset: () => {
            setMultipleSelection([]);
            setSingleSelection(null);
            setInternalResetTrigger(prev => prev + 1);

            // Reset child components
            if (multiSelectRef.current) {
                multiSelectRef.current.reset();
            }
            if (singleSelectRef.current) {
                singleSelectRef.current.reset();
            }

            // Notify parent component
            if (onSelect) {
                onSelect({
                    multiple: [],
                    single: null
                });
            }
        },
        getMultipleCount: () => multipleSelection.length,
        getSingleSelection: () => singleSelection
    }));

    return (
        <div className="space-y-8 bg-transparent h-auto">
            <div className="mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">Select NFTs</h1>
                    {/* {(multipleSelection.length > 0 || singleSelection) && (
                        <button
                            onClick={() => {
                                setMultipleSelection([]);
                                setSingleSelection(null);
                                setInternalResetTrigger(prev => prev + 1);

                                if (multiSelectRef.current) {
                                    multiSelectRef.current.reset();
                                }
                                if (singleSelectRef.current) {
                                    singleSelectRef.current.reset();
                                }

                                if (onSelect) {
                                    onSelect({
                                        multiple: [],
                                        single: null
                                    });
                                }
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                        >
                            Reset All
                        </button>
                    )} */}
                </div>

                {/* Multiple Selection Section */}
                <div className="bg-transparent border border-[#50D2C1] p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[#50D2C1]">
                            NFTs for Burning (Min {maxSelections || 10})
                        </h2>
                        <div className="text-sm text-gray-400">
                            {multipleSelection.length}/{maxSelections || 10} selected
                        </div>
                    </div>

                    <NFTMultiSelect
                        ref={multiSelectRef}
                        nfts={nfts}
                        maxSelections={maxSelections || 10}
                        onSelect={handleMultipleSelection}
                        placeholder="Choose multiple NFTs to burn..."
                        unavailableNFTs={unavailableForMultiple}
                        disabled={disabled}
                        resetTrigger={internalResetTrigger}
                    />
                </div>

                {/* Single Selection Section */}
                <div className="bg-transparent border border-[#50D2C1] p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[#50D2C1]">
                            Featured NFT Selection
                        </h2>
                        {singleSelection && (
                            <button
                                onClick={() => {
                                    setSingleSelection(null);
                                    if (singleSelectRef.current) {
                                        singleSelectRef.current.reset();
                                    }
                                    if (onSelect) {
                                        onSelect({
                                            multiple: multipleSelection,
                                            single: null
                                        });
                                    }
                                }}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <NFTSelect
                        ref={singleSelectRef}
                        nfts={nfts}
                        onSelect={handleSingleSelection}
                        placeholder="Choose a featured NFT..."
                        className="max-w-md"
                        unavailableNFTs={unavailableForSingle}
                        disabled={disabled}
                        resetTrigger={internalResetTrigger}
                    />
                </div>

                {/* Selection Summary */}
                {(multipleSelection.length > 0 || singleSelection) && (
                    <div className="bg-[#0F1A1F] border border-[#50D2C1] p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-[#50D2C1]">Selection Summary</h3>
                            <div className="text-sm text-gray-400">
                                Total: {multipleSelection.length + (singleSelection ? 1 : 0)} NFTs
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-white">NFTs to Burn:</span>
                                    <span className="font-semibold text-[#50D2C1]">
                                        {multipleSelection.length}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-white">Featured NFT:</span>
                                    <span className="font-semibold text-[#50D2C1]">
                                        {singleSelection ? 'Selected' : 'Not Selected'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-white">Status:</span>
                                    <span className={`font-semibold ${multipleSelection.length > 0 && singleSelection
                                        ? 'text-green-400'
                                        : 'text-yellow-400'
                                        }`}>
                                        {multipleSelection.length > 0 && singleSelection
                                            ? 'Ready'
                                            : 'Incomplete'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Show selected NFT details */}
                        {(multipleSelection.length > 0 || singleSelection) && (
                            <div className="mt-4 pt-3 border-t border-gray-600">
                                {multipleSelection.length > 0 && (
                                    <div className="mb-3">
                                        <h4 className="text-sm font-medium text-[#50D2C1] mb-1">Burn NFTs:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {multipleSelection.map((nft, index) => (
                                                <span key={index} className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded">
                                                    {nft.name || `NFT #${nft.id}`}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {singleSelection && (
                                    <div>
                                        <h4 className="text-sm font-medium text-[#50D2C1] mb-1">Featured NFT:</h4>
                                        <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
                                            {singleSelection.name || `NFT #${singleSelection.id}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

NFTSelector.displayName = 'NFTSelector';

export default NFTSelector;