import React, { useEffect, useState } from 'react';
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

const BurnPage = () => {
    const { address, isConnected } = useAccount();
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userMessage, setUserMessage] = useState('');
    const navigate = useNavigate();
    const jwt = sessionStorage.getItem('jwt');
    const { data: walletClient } = useWalletClient();
    const [nftName, setNftName] = useState('');
    const [errors, setErrors] = useState({});

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
        setUserMessage({ text: message, type });
        setTimeout(() => setUserMessage(''), 5000);
    };

    const handleUpdateBackend = async () => {
        if (!isConnected || !walletClient) {
            throw new Error('Wallet not connected');
        }

        try {
            const burnIds = formData.nftSelections.multiple.map(nft => Number(nft.id));
            const updateId = Number(formData.nftSelections.single.id);

            const txHash = await callContract(burnIds, updateId);
            const url = `${process.env.REACT_APP_API_URL}/update-requests/`;

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
                    'Authorization': `Bearer ${jwt}`,
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

    useEffect(() => {
        const fetchNFTs = async () => {
            if (!jwt || !address) return;

            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/user-tokens/?wallet=${address}`,
                    {
                        headers: {
                            Authorization: `Token ${jwt}`
                        }
                    }
                );
                setNfts(response.data.tokens);
            } catch (err) {
                console.error('Failed to fetch NFTs:', err);
                showMessage('Failed to fetch your NFTs. Please try again.', 'error');
            } finally {
                setLoading(false);
            }
        };

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

            // Reset form
            setFormData({
                description: '',
                nftSelections: { multiple: [], single: null },
                uploadedFiles: []
            });
            setNftName('');
            setErrors({});

            // Optional: Navigate to success page
            // navigate('/success');

        } catch (error) {
            console.error('Burn failed:', error);
            showMessage(`Burn failed: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const MessageComponent = ({ message }) => {
        if (!message) return null;

        const bgColor = {
            error: 'bg-red-600',
            success: 'bg-green-600',
            info: 'bg-blue-600'
        }[message.type] || 'bg-blue-600';

        return (
            <div className={`${bgColor} text-white p-3 rounded-md mb-4`}>
                {message.text}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0F1A1F] text-white">
            {/*  */}
            <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 relative z-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Burn NFTs</h1>
                </div>

                {/* Message Display */}
                <MessageComponent message={userMessage} />

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
                                    nfts={nfts}
                                    onSelect={handleNFTSelection}
                                    maxSelections={10}
                                    error={errors.nftSelections}
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
                                    onFileUpload={handleFileUpload}
                                    required={true}
                                    error={errors.uploadedFiles}
                                    initialFiles={formData.uploadedFiles}
                                />

                            </div>

                            {/* NFT Name Input */}
                            <div className="w-full">
                                <NFTNameInput
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
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                                <button
                                    onClick={handleBurn}
                                    disabled={isSubmitting || loading}
                                    className={`w-full sm:w-auto px-6 py-3 rounded-md font-semibold transition-all duration-200 ${!isSubmitting && !loading
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