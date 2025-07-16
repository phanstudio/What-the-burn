import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DragAndDropFileInput from '../components/burnPage/dragNdrop';
import { useAccount, useWalletClient } from 'wagmi';
import NFTSelector from '../components/burnPage/NFTSelector';
import TextArea from '../components/burnPage/TextArea';
import NFTNameInput from '../components/burnPage/NFTNameInput';
import { ethers } from 'ethers';
import VideoBackground from '../components/LandingPage/VideoBackground';
import {
    BURN_MANGER_ABI, BURN_MANGER_ADDRESS,
    NFT_ABI, NFT_ADDRESS
} from '../utils/abi';

const uri = 'https://what-the-burn-backend-phanstudios-projects.vercel.app'

const BurnPage = () => {
    const { address, isConnected } = useAccount();
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const jwt = sessionStorage.getItem('jwt');
    const { data: walletClient } = useWalletClient();
    const [nftName, setNftName] = useState('');
    const [errors, setErrors] = useState({});
    const [resetTrigger, setResetTrigger] = useState(0);

    // Add refs for form components
    const nftSelectorRef = useRef(null);
    const fileInputRef = useRef(null);
    const textAreaRef = useRef(null);
    const nftNameInputRef = useRef(null);

    const [formData, setFormData] = useState({
        description: '',
        nftSelections: {
            multiple: [],
            single: null
        },
        uploadedFiles: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const showMessage = (message, type = 'info') => {
        const id = Date.now();
        const notification = {
            id,
            text: message,
            type
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Reset all form inputs
    const resetForm = () => {
        // Reset state
        setFormData({
            description: '',
            nftSelections: { multiple: [], single: null },
            uploadedFiles: []
        });
        setNftName('');
        setErrors({});

        // Trigger reset for NFTSelector and NFTMultiSelect components
        setResetTrigger(prev => prev + 1);

        // Reset other form components via refs if they have reset methods
        if (nftSelectorRef.current && nftSelectorRef.current.reset) {
            nftSelectorRef.current.reset();
        }
        if (fileInputRef.current && fileInputRef.current.reset) {
            fileInputRef.current.reset();
        }
        if (textAreaRef.current && textAreaRef.current.reset) {
            textAreaRef.current.reset();
        }
        if (nftNameInputRef.current && nftNameInputRef.current.reset) {
            nftNameInputRef.current.reset();
        }
    };

    const handleUpdateBackend = async () => {
        if (!isConnected || !walletClient) {
            throw new Error('Wallet not connected');
        }

        try {
            const burnIds = formData.nftSelections.multiple.map(nft => Number(nft.id));
            const updateId = Number(formData.nftSelections.single.id);
            const txHash = await callContract(burnIds, updateId);
            const url = `${uri}/update-requests/`;

            const newForm = new FormData();
            newForm.append('transaction_hash', txHash);
            newForm.append('address', address);
            newForm.append('description', formData.description);
            newForm.append('update_id', updateId);
            newForm.append('burn_ids', JSON.stringify(burnIds));
            newForm.append('update_name', nftName);
            newForm.append('image', formData.uploadedFiles[0]);

            const response = await axios.post(url, newForm, {
                headers: {
                    'Authorization': `Token ${jwt}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Upload success:', response.data);
            return response.data;
        } catch (error) {
            console.error('Backend update failed:', error);
            throw new Error(`Backend update failed: ${error.message}`);
        }
    };

    const callContract = async (burnIds, updateId) => {
        if (!isConnected || !walletClient) {
            throw new Error('Wallet not connected');
        }

        try {
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();
            const burnManager = new ethers.Contract(BURN_MANGER_ADDRESS, BURN_MANGER_ABI, signer);
            const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);

            // Check and set approval if needed
            const isApproved = await nftContract.isApprovedForAll(address, BURN_MANGER_ADDRESS);
            if (!isApproved) {
                showMessage('Setting approval for burn manager...', 'info');
                const approvalTx = await nftContract.setApprovalForAll(BURN_MANGER_ADDRESS, true);
                await approvalTx.wait();
            }

            const burnFee = await burnManager.getBurnFee();
            showMessage('Executing burn transaction...', 'info');
            console.log(burnIds, burnFee, updateId)
            const tx = await burnManager.createPremium(burnIds, updateId, { value: burnFee });
            await tx.wait();

            return tx.hash;
        } catch (error) {
            console.error('Contract call failed:', error);
            throw new Error(`Contract call failed: ${error.message}`);
        }
    };

    useEffect(() => {
        if (!isConnected) {
            sessionStorage.removeItem('jwt');
            navigate('/', { replace: true });
        }
    }, [isConnected, navigate]);

    const fetchNFTs = async () => {
        if (!jwt || !address) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${uri}/user-tokens/`,
                {
                    headers: {
                        Authorization: `Token ${jwt}`
                    }
                }
            );
            setNfts(response.data.tokens);
        } catch (err) {
            console.error('Failed to fetch NFTs:', err);
            showMessage('Failed to fetch NFTs. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNFTs();
    }, [jwt, address]);

    const handleDescriptionChange = (value) => {
        setFormData(prev => ({ ...prev, description: value }));
        if (errors.description) {
            setErrors(prev => ({ ...prev, description: undefined }));
        }
    };

    const handleNFTSelection = (selectionData) => {
        const nftSelections = {
            multiple: selectionData.multiple || [],
            single: selectionData.single || null
        };

        setFormData(prev => ({ ...prev, nftSelections }));
        if (errors.nftSelections) {
            setErrors(prev => ({ ...prev, nftSelections: undefined }));
        }
    };

    const handleFileUpload = (uploadedFiles) => {
        const filesArray = Array.isArray(uploadedFiles) ? uploadedFiles : (uploadedFiles ? [uploadedFiles] : []);
        setFormData(prev => ({ ...prev, uploadedFiles: filesArray }));
        if (errors.uploadedFiles) {
            setErrors(prev => ({ ...prev, uploadedFiles: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate multiple NFT selections
        if (!formData.nftSelections.multiple || formData.nftSelections.multiple.length === 0) {
            newErrors.nftSelections = 'Select at least one NFT to burn.';
        } else if (formData.nftSelections.multiple.length > 10) {
            newErrors.nftSelections = 'You can select a maximum of 10 NFTs.';
        }

        // Validate single NFT selection for update
        if (!formData.nftSelections.single) {
            newErrors.singleNFT = 'Select one NFT to update.';
        }

        // Validate description
        if (!formData.description || formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters.';
        }

        // Validate NFT name
        if (!nftName || nftName.trim().length < 3) {
            newErrors.nftName = 'NFT name must be at least 3 characters.';
        }

        // Validate files
        if (formData.uploadedFiles.length === 0) {
            newErrors.uploadedFiles = 'Please upload at least one file.';
        }

        return newErrors;
    };

    const handleBurn = async () => {
        const newErrors = validateForm();
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showMessage('Please fix the errors in the form.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            showMessage('Starting burn process...', 'info');

            await handleUpdateBackend();

            showMessage('Burn successful! Your NFTs have been burned and updated.', 'success');

            // Reset all form inputs automatically after successful submission
            resetForm();

            // Refresh NFT list to show updated data
            await fetchNFTs();

            // Optional: Navigate to success page
            // navigate('/success');

        } catch (error) {
            console.error('Burn failed:', error);
            showMessage(`Burn failed: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const NotificationContainer = () => {
        if (notifications.length === 0) return null;

        return (
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map((notification) => {
                    const bgColor = {
                        error: 'bg-red-500',
                        success: 'bg-green-500',
                        info: 'bg-blue-500'
                    }[notification.type] || 'bg-blue-500';

                    const iconColor = {
                        error: 'text-red-100',
                        success: 'text-green-100',
                        info: 'text-blue-100'
                    }[notification.type] || 'text-blue-100';

                    return (
                        <div
                            key={notification.id}
                            className={`${bgColor} text-white p-4 rounded-lg shadow-lg max-w-sm min-w-80 animate-slide-in-right`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {notification.type === 'error' && (
                                            <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {notification.type === 'success' && (
                                            <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {notification.type === 'info' && (
                                            <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {notification.text}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="ml-2 flex-shrink-0 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-40 rounded"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0F1A1F] text-white">
            {/* Notification Container */}
            <NotificationContainer />

            {/* Add custom CSS for animation */}
            <style jsx>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>

            <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 relative z-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Burn NFTs</h1>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p className="mt-2">Loading your NFTs...</p>
                    </div>
                )}

                {/* Main content container */}
                <div className="w-full max-w-none sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
                    <div className="bg-[#1A2429] p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
                        <div className="space-y-6 sm:space-y-8">
                            {/* NFT Selector */}
                            <div className="w-full">
                                <NFTSelector
                                    ref={nftSelectorRef}
                                    nfts={nfts}
                                    onSelect={handleNFTSelection}
                                    maxSelections={10}
                                    error={errors.nftSelections}
                                    resetTrigger={resetTrigger}
                                />
                                {errors.nftSelections && (
                                    <p className="text-red-400 text-sm mt-2">{errors.nftSelections}</p>
                                )}
                                {errors.singleNFT && (
                                    <p className="text-red-400 text-sm mt-2">{errors.singleNFT}</p>
                                )}
                            </div>

                            {/* File Upload */}
                            <div className="w-full">
                                <DragAndDropFileInput
                                    ref={fileInputRef}
                                    onFileUpload={handleFileUpload}
                                    required={true}
                                    error={errors.uploadedFiles}
                                    initialFiles={formData.uploadedFiles}
                                />
                            </div>

                            {/* NFT Name Input */}
                            <div className="w-full">
                                <NFTNameInput
                                    ref={nftNameInputRef}
                                    value={nftName}
                                    onChange={(value) => {
                                        setNftName(value);
                                        if (errors.nftName) {
                                            setErrors(prev => ({ ...prev, nftName: undefined }));
                                        }
                                    }}
                                    minLength={3}
                                    maxLength={50}
                                    placeholder="Enter your NFT name..."
                                    error={errors.nftName}
                                />
                                {errors.nftName && (
                                    <p className="text-red-400 text-sm mt-2">{errors.nftName}</p>
                                )}
                            </div>

                            {/* Description TextArea */}
                            <div className="w-full">
                                <TextArea
                                    ref={textAreaRef}
                                    placeholder="Enter a description (minimum 10 characters)..."
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    error={errors.description}
                                />
                                {errors.description && (
                                    <p className="text-red-400 text-sm mt-2">{errors.description}</p>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className="flex items-center justify-center pt-4">
                                <button
                                    onClick={handleBurn}
                                    disabled={isSubmitting || loading}
                                    className={`px-8 py-3 rounded-md font-semibold text-lg transition-all duration-200 ${!isSubmitting && !loading
                                        ? 'bg-[#50D2C1] hover:bg-cyan-500 text-white'
                                        : 'bg-gray-600 cursor-not-allowed text-gray-400'
                                        }`}
                                >
                                    {isSubmitting ? 'Burning...' : 'Burn NFTs'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BurnPage;