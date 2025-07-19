import React, { useState } from 'react';
import axios from 'axios';
import {
    Copy,
    Download,
    DownloadCloud,
    Check,
    ImageIcon,
    Hash,
    Coins,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { useAdminData } from './AdminLayout';
// import { handleForbidden } from '../custom/ProtectedRoute';

const AdminDashboard = () => {
    const [copiedId, setCopiedId] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Get data from context
    const {
        pendingItems,
        setPendingItems,
        approvedItems,
        setApprovedItems,
        isLoading,
        error,
        refreshData
    } = useAdminData();

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshData();
        setIsRefreshing(false);
    };

    function downloadBlobAsFile(blobData, contentDispositionHeader, defaultFileName = 'download.zip') {
        const blob = new Blob([blobData], { type: 'application/zip' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        let fileName = defaultFileName;
        if (contentDispositionHeader && contentDispositionHeader.includes('filename=')) {
            fileName = contentDispositionHeader
                .split('filename=')[1]
                .replace(/["']/g, '');
        }
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl); // Clean up
    }

    const handleDownload = async (item) => {
        try {
            const uri = 'https://what-the-burn-backend-phanstudios-projects.vercel.app';
            const response = await axios.get(`${uri}/update-requests/${item.transaction_hash}/download/`, {
                responseType: 'blob',
            });
            downloadBlobAsFile(response.data, response.headers['content-disposition'], `${item.transaction_hash}.zip`);
            if (pendingItems.some(p => p.transaction_hash === item.transaction_hash)) {
                setPendingItems(prev => prev.filter(i => i.transaction_hash !== item.transaction_hash));
                setApprovedItems(prev => [...prev, item]);
            }
        } catch (error) {
            // handleForbidden(error);
            console.error("Error fetching update requests:", error);
        }
    };

    const handleDownloadAll = async (_items, listName) => {
        let download_type = "download_downloaded";
        let url_type = 'update_requests_old.zip'
        if (listName === "pending") {
            download_type = "download_new";
            url_type = 'update_requests.zip'
        }
        try {
            const uri = 'https://what-the-burn-backend-phanstudios-projects.vercel.app';
            const response = await axios.get(`${uri}/update-requests/${download_type}/`, {
                responseType: 'blob',
            });
            downloadBlobAsFile(response.data, response.headers['content-disposition'], url_type);
            if (listName === "pending") {
                setApprovedItems(prev => [...prev, ...pendingItems]);
                setPendingItems([]);
            }
        } catch (error) {
            // handleForbidden(error);
            console.error("Error downloading update requests:", error);
        }
    };

    const ListItem = ({ item, listType }) => (
        <div className="bg-[#141f24] rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md hover:shadow-[#13776a] transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Image */}
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                    <img
                        src={item.image_small}
                        alt={`Token ${item.update_id}`}
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
                                <span className="text-sm text-[#50D2C1] font-mono break-all sm:break-normal">What{item.update_id}</span>
                                <button
                                    onClick={() => handleCopy(item.update_id, `token-${item.update_id}`)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 flex-shrink-0"
                                    title="Copy Token ID"
                                >
                                    {copiedId === `token-${item.update_id}` ? (
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
                                    {item.transaction_hash}
                                </span>
                                <button
                                    onClick={() => handleCopy(item.transaction_hash, `hash-${item.update_id}`)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 flex-shrink-0"
                                    title="Copy Transaction Hash"
                                >
                                    {copiedId === `hash-${item.update_id}` ? (
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

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-inherit p-3 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#50D2C1] mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600 text-sm sm:text-base">Manage tokens and transactions</p>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-3">
                            <Loader2 className="w-8 h-8 text-[#50D2C1] animate-spin" />
                            <span className="text-[#50D2C1] text-lg">Loading dashboard data...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-inherit p-3 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#50D2C1] mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600 text-sm sm:text-base">Manage tokens and transactions</p>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-red-400 mb-4">Error loading dashboard data: {error}</p>
                            <button
                                onClick={handleRefresh}
                                className="flex items-center space-x-2 px-4 py-2 bg-[#115E4C] text-white rounded-lg hover:bg-[#50D2C1] transition-colors duration-200 mx-auto"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Retry</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-inherit p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#50D2C1] mb-2">Admin Dashboard</h1>
                            <p className="text-gray-600 text-sm sm:text-base">Manage tokens and transactions</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 px-4 py-2 bg-[#115E4C] text-white rounded-lg hover:bg-[#50D2C1] transition-colors duration-200 mt-4 sm:mt-0"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </span>
                        </button>
                    </div>
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
                        {pendingItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p>No pending items to display</p>
                            </div>
                        ) : (
                            pendingItems.map((item) => (
                                <ListItem key={item.update_id} item={item} listType="pending" />
                            ))
                        )}
                    </div>

                    {pendingItems.length > 0 && (
                        <button
                            onClick={() => handleDownloadAll(pendingItems, 'pending')}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 w-full sm:w-auto"
                        >
                            <DownloadCloud className="w-4 h-4" />
                            <span className="font-medium text-sm sm:text-base">Download All Pending</span>
                        </button>
                    )}
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
                        {approvedItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p>No approved items to display</p>
                            </div>
                        ) : (
                            approvedItems.map((item) => (
                                <ListItem key={item.update_id} item={item} listType="approved" />
                            ))
                        )}
                    </div>

                    {approvedItems.length > 0 && (
                        <button
                            onClick={() => handleDownloadAll(approvedItems, 'approved')}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#115E4C] text-white rounded-lg hover:bg-[#50D2C1] transition-colors duration-200 w-full sm:w-auto"
                        >
                            <DownloadCloud className="w-4 h-4" />
                            <span className="font-medium text-sm sm:text-base">Download All Approved</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;