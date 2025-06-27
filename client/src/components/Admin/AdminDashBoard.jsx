import React, { useState } from 'react';
import {
    Copy,
    Download,
    DownloadCloud,
    Check,
    ImageIcon,
    Hash,
    Coins
} from 'lucide-react';

const AdminDashboard = () => {
    const [copiedId, setCopiedId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Sample data for the first list
    const pendingItems = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop&crop=center',
            tokenId: 'TKN-001-2024',
            transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=center',
            tokenId: 'TKN-002-2024',
            transactionHash: '0x9876543210fedcba0987654321fedcba09876543'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1494790108755-2616c2d3648c?w=80&h=80&fit=crop&crop=center',
            tokenId: 'TKN-003-2024',
            transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12'
        }
    ];

    // Sample data for the second list
    const approvedItems = [
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=center',
            tokenId: 'TKN-004-2024',
            transactionHash: '0x1111222233334444555566667777888899990000'
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=center',
            tokenId: 'TKN-005-2024',
            transactionHash: '0xaaaa111122223333444455556666777788889999'
        },
        {
            id: 6,
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=center',
            tokenId: 'TKN-006-2024',
            transactionHash: '0xbbbb222233334444555566667777888899990000'
        },
        {
            id: 7,
            image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=center',
            tokenId: 'TKN-007-2024',
            transactionHash: '0xcccc333344445555666677778888999900001111'
        }
    ];

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleDownload = (item) => {
        // Simulate download functionality
        const link = document.createElement('a');
        link.href = item.image;
        link.download = `${item.tokenId}.jpg`;
        link.click();
    };

    const handleDownloadAll = (items, listName) => {
        // Simulate downloading all items
        items.forEach((item, index) => {
            setTimeout(() => {
                handleDownload(item);
            }, index * 100); // Stagger downloads
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save operation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSaving(false);
    };

    const ListItem = ({ item, listType }) => (
        <div className="bg-[#141f24] rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md hover:shadow-[#13776a] transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Image */}
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                    <img
                        src={item.image}
                        alt={`Token ${item.tokenId}`}
                        className="w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {/* Token ID */}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <div className="flex items-center space-x-2">
                                <Coins className="w-4 h-4 text-[#50D2C1]" />
                                <span className="text-sm font-medium text-[#d6d6d6]">Token ID:</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-[#50D2C1] font-mono break-all sm:break-normal">{item.tokenId}</span>
                                <button
                                    onClick={() => handleCopy(item.tokenId, `token-${item.id}`)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 flex-shrink-0"
                                    title="Copy Token ID"
                                >
                                    {copiedId === `token-${item.id}` ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Transaction Hash */}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <div className="flex items-center space-x-2">
                                <Hash className="w-4 h-4 text-[#50D2C1]" />
                                <span className="text-sm font-medium text-gray-300">Hash:</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-[#50D2C1] font-mono truncate max-w-[200px] sm:max-w-32 lg:max-w-40">
                                    {item.transactionHash}
                                </span>
                                <button
                                    onClick={() => handleCopy(item.transactionHash, `hash-${item.id}`)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 flex-shrink-0"
                                    title="Copy Transaction Hash"
                                >
                                    {copiedId === `hash-${item.id}` ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download Button */}
                <div className="flex-shrink-0 flex justify-center sm:justify-end">
                    <button
                        onClick={() => handleDownload(item)}
                        className="flex items-center space-x-2 px-3 py-2 bg-[#115E4C] text-white rounded-lg hover:bg-[#50D2C1] transition-colors duration-200 w-full sm:w-auto justify-center"
                        title="Download Item"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Download</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-inherit p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#50D2C1] mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Manage tokens and transactions</p>
                </div>

                {/* First List - Pending Items */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center space-x-2">
                            <ImageIcon className="w-5 h-5 text-[#50D2C1]" />
                            <span className='text-[#50D2C1]'>Pending Approvals</span>
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                {pendingItems.length}
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-3 sm:space-y-4 mb-4">
                        {pendingItems.map((item) => (
                            <ListItem key={item.id} item={item} listType="pending" />
                        ))}
                    </div>

                    <button
                        onClick={() => handleDownloadAll(pendingItems, 'pending')}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 w-full sm:w-auto"
                    >
                        <DownloadCloud className="w-4 h-4" />
                        <span className="font-medium text-sm sm:text-base">Download All Pending</span>
                    </button>
                </div>

                {/* Second List - Approved Items */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center space-x-2">
                            <ImageIcon className="w-5 h-5 text-[#50D2C1]" />
                            <span className='text-[#50D2C1]'>Approved Items</span>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {approvedItems.length}
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-3 sm:space-y-4 mb-4">
                        {approvedItems.map((item) => (
                            <ListItem key={item.id} item={item} listType="approved" />
                        ))}
                    </div>

                    <button
                        onClick={() => handleDownloadAll(approvedItems, 'approved')}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#115E4C] text-white rounded-lg hover:bg-[#50D2C1] transition-colors duration-200 w-full sm:w-auto"
                    >
                        <DownloadCloud className="w-4 h-4" />
                        <span className="font-medium text-sm sm:text-base">Download All Approved</span>
                    </button>
                </div>

                {/* Save Button */}
                {/* <div className="flex justify-center pt-6 border-t border-gray-200">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 w-full sm:w-auto justify-center ${isSaving
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                            }`}
                    >
                        <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
                        <span>{isSaving ? 'Saving Changes...' : 'Save All Changes'}</span>
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default AdminDashboard;