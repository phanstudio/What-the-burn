import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DragAndDropFileInput from '../components/burnPage/dragNdrop';
import { useAccount, useWalletClient } from 'wagmi';
import NFTSelector from '../components/burnPage/NFTSelector';
import TextArea from '../components/burnPage/TextArea';
import NFTNameInput from '../components/burnPage/NFTNameInput';
import { ethers } from 'ethers';
// import { disconnect } from '@wagmi/core'
// import { config } from '../utils/wagmi'
import {
    BURN_MANGER_ABI, BURN_MANGER_ADDRESS,
    NFT_ABI, NFT_ADDRESS
} from '../utils/abi';

const BurnPage = () => {
    const { address, isConnected } = useAccount();
    const [nfts, setNfts] = useState([]);
    const navigate = useNavigate();
    const jwt = sessionStorage.getItem('jwt');
    const { data: walletClient } = useWalletClient();
    const [nftName, setNftName] = useState('');
    const [errors, setErrors] = useState({});
    const [current, setCurrent] = useState(0);

    const [formData, setFormData] = useState({
        description: '',
        nftSelections: {
            multiple: [],
            single: null
        },
        uploadedFiles: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handelUpdateBackend = async () => {
        if (!isConnected || !walletClient) return;
        try {
            const burniIds = formData.nftSelections.multiple.map(nft => Number(nft.id))
            const updateId = Number(formData.nftSelections.single.id)

            const startingPoint = 110 + (10 * current);
            const loopAmount = 10;
            const burniIds2 = [...Array(loopAmount)].map((_, i) => i + startingPoint)
            const updateId2 = startingPoint + loopAmount

            const txHash = await callContract(burniIds2, updateId2)
            const url = 'https://what-the-burn-backend-phanstudios-projects.vercel.app/update-requests/';

            const newForm = new FormData();
            newForm.append('transaction_hash', txHash);
            newForm.append('address', address);
            newForm.append('description', formData.description);
            newForm.append('update_id', updateId);
            newForm.append('burn_ids', JSON.stringify(
                burniIds
            ));
            newForm.append('update_name', nftName);
            newForm.append('image', formData.uploadedFiles[0]);

            const response = await axios.post(url, newForm, {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            console.log('Upload success:', response.data);
            setCurrent(current + 1);
        } catch (error) {
            setCurrent(current + 1);
            throw new Error(`❌ Backend call failed: ${error}`);
        }
    };

    const callContract = async (burnIds, updateId) => {
        if (!isConnected || !walletClient) return;
        try {
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();
            const burnManager = new ethers.Contract(BURN_MANGER_ADDRESS, BURN_MANGER_ABI, signer);
            const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);

            // check first for approval first
            if (await nftContract.isApprovedForAll(address, BURN_MANGER_ADDRESS) === false) {
                await nftContract.setApprovalForAll(BURN_MANGER_ADDRESS, true)
            }
            const burnFee = await burnManager.getBurnFee()
            const tx = await burnManager.createPremium(burnIds, updateId, { value: burnFee });
            return tx.hash
        } catch (error) {
            throw new Error(`❌ Contract call failed: ${error}`);
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
            if (!jwt) return;

            try {
                const response = await axios.get(
                    `https://what-the-burn-backend-phanstudios-projects.vercel.app/user-tokens/?wallet=0xA9A5d352B6F388583A850803e297865A499f630B`,
                    {
                        headers: {
                            Authorization: `Token ${jwt}`
                        }
                    }
                );
                setNfts(response.data.tokens);
            } catch (err) {
                console.error('❌ Failed to fetch NFTs:', err);
            }
        };

        fetchNFTs();
    }, [jwt]);

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
        // Convert to array if single file
        const filesArray = Array.isArray(uploadedFiles) ? uploadedFiles : (uploadedFiles ? [uploadedFiles] : []);
        setFormData(prev => ({ ...prev, uploadedFiles: filesArray }));
        if (errors.uploadedFiles) {
            setErrors(prev => ({ ...prev, uploadedFiles: undefined }));
        }
    };

    const handleBurn = async () => {
        const newErrors = {};

        // Validate multiple NFT selections
        if (!formData.nftSelections.multiple || formData.nftSelections.multiple.length === 0) {
            newErrors.nftSelections = 'Select at least one NFTs.';
        } else if (formData.nftSelections.multiple.length > 10) {
            newErrors.nftSelections = 'You can select a maximum of 10 NFTs.';
        }

        // Validate NFT selections
        if (!formData.nftSelections.multiple.length) {
            newErrors.nftSelections = 'Select at least one NFT.';
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

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('🔥 Starting burn process...', {
                nftName,
                description: formData.description,
                multipleNFTs: formData.nftSelections.multiple,
                featuredNFT: formData.nftSelections.single,
                files: formData.uploadedFiles
            });
            await handelUpdateBackend();

            console.log('✅ Burn successful!');

            // Reset form
            setFormData({
                description: '',
                nftSelections: { multiple: [], single: null },
                uploadedFiles: []
            });
            setNftName('');
            setErrors({});

            // Optionally navigate to success page
            // navigate('/success');

        } catch (error) {
            console.error('❌ Burn failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F1A1F] text-white">
            {/* Main container with responsive padding */}
            <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Burn NFTs</h1>
                </div>

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
                                    disabled={isSubmitting}
                                    className={`w-full sm:w-auto px-6 py-3 rounded-md font-semibold transition-all duration-200 ${!isSubmitting
                                        ? 'bg-[#50D2C1] hover:bg-cyan-500 text-white'
                                        : 'bg-gray-600 cursor-not-allowed text-gray-400'
                                        }`}
                                >
                                    {isSubmitting ? 'Burning...' : 'Burn'}
                                </button>
                            </div>

                            {/* Debug info - remove in production */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="bg-gray-800 p-3 rounded text-xs overflow-hidden">
                                    <details>
                                        <summary className="cursor-pointer text-gray-400">Debug Info</summary>
                                        <pre className="mt-2 text-gray-300 overflow-x-auto">
                                            {JSON.stringify({ formData, nftName, errors }, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BurnPage;