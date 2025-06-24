import React, { useState } from 'react';
import {
    Copy,
    Download,
    DownloadCloud,
    Save,
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-4">
                {/* Image */}
                <div className="flex-shrink-0">
                    <img
                        src={item.image}
                        alt={`Token ${item.tokenId}`}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Token ID */}
                        <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Token ID:</span>
                            <span className="text-sm text-gray-900 font-mono">{item.tokenId}</span>
                            <button
                                onClick={() => handleCopy(item.tokenId, `token-${item.id}`)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                                title="Copy Token ID"
                            >
                                {copiedId === `token-${item.id}` ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                        </div>

                        {/* Transaction Hash */}
                        <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-700">Hash:</span>
                            <span className="text-sm text-gray-900 font-mono truncate max-w-32">
                                {item.transactionHash}
                            </span>
                            <button
                                onClick={() => handleCopy(item.transactionHash, `hash-${item.id}`)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
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

                {/* Download Button */}
                <div className="flex-shrink-0">
                    <button
                        onClick={() => handleDownload(item)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage tokens and transactions</p>
                </div>

                {/* First List - Pending Items */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                            <ImageIcon className="w-5 h-5 text-orange-500" />
                            <span>Pending Approvals</span>
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                {pendingItems.length}
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4 mb-4">
                        {pendingItems.map((item) => (
                            <ListItem key={item.id} item={item} listType="pending" />
                        ))}
                    </div>

                    <button
                        onClick={() => handleDownloadAll(pendingItems, 'pending')}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
                    >
                        <DownloadCloud className="w-4 h-4" />
                        <span className="font-medium">Download All Pending</span>
                    </button>
                </div>

                {/* Second List - Approved Items */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                            <ImageIcon className="w-5 h-5 text-green-500" />
                            <span>Approved Items</span>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {approvedItems.length}
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4 mb-4">
                        {approvedItems.map((item) => (
                            <ListItem key={item.id} item={item} listType="approved" />
                        ))}
                    </div>

                    <button
                        onClick={() => handleDownloadAll(approvedItems, 'approved')}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                        <DownloadCloud className="w-4 h-4" />
                        <span className="font-medium">Download All Approved</span>
                    </button>
                </div>

                {/* Save Button */}
                <div className="flex justify-center pt-6 border-t border-gray-200">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${isSaving
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                            }`}
                    >
                        <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
                        <span>{isSaving ? 'Saving Changes...' : 'Save All Changes'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;