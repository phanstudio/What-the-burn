import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DragAndDropFileInput from '../components/burnPage/dragNdrop';
import { useAccount, useWalletClient } from 'wagmi';
import NFTSelector from '../components/burnPage/NFTSelector';
import TextArea from '../components/burnPage/TextArea';
import NFTNameInput from '../components/burnPage/NFTNameInput';
import { ethers } from 'ethers';
import { disconnect } from '@wagmi/core'
import { config } from '../utils/wagmi'

const NFT_ADDRESS = '0xbB700D8Ce0D97f9600E5c5f3EF37ec01147Db4b9';
const NFT_ABI = [
    "function symbol() public view returns (string)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
];

const BURN_MANGER_ADDRESS = '0x6BaAA6BbC7278579fCDeE38E3f3c4E4eE2272e13';
const BURN_MANGER_ABI = [
    "function createPremium(uint32[] tokenIds, uint32 update_id)"
];

const BurnPage = () => {
    const { address, isConnected } = useAccount();
    const [nfts, setNfts] = useState([]);
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

    const callContract = async () => {
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
            await burnManager.createPremium([...Array(10)].map((_, i) => i + 2), 2)

        } catch (error) {
            console.error("❌ Contract call failed:", error);
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

            // Here you would typically call your API
            await callContract();

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
        <div className="p-6 flex flex-col bg-[#0F1A1F] min-h-screen text-white">
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Burn NFTs</h1>
                </div>
                <p className="mb-4">
                    Connected Wallet: <span className="font-mono text-wrap text-emerald-400">{address}</span>
                </p>
            </div>

            <div className="flex flex-col mx-auto w-full max-w-3xl bg-[#1A2429] p-6 rounded-lg shadow-lg">
                <div className="space-y-8">
                    <NFTSelector
                        nfts={nfts}
                        onSelect={handleNFTSelection}
                        maxSelections={10}
                        error={errors.nftSelections}
                    />
                    {errors.nftSelections && (
                        <p className="text-red-400 text-sm">{errors.nftSelections}</p>
                    )}

                    <DragAndDropFileInput
                        onFileUpload={handleFileUpload}
                        required={true}
                        error={errors.uploadedFiles}
                        initialFiles={formData.uploadedFiles}
                    />
                    {/* {errors.uploadedFiles && (
                        <p className="text-red-400 text-sm">{errors.uploadedFiles}</p>
                    )} */}

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
                        <p className="text-red-400 text-sm">{errors.nftName}</p>
                    )}

                    <TextArea
                        placeholder="Enter a description (minimum 10 characters)..."
                        value={formData.description}
                        onChange={handleDescriptionChange}
                        error={errors.description}
                    />
                    {errors.description && (
                        <p className="text-red-400 text-sm">{errors.description}</p>
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBurn}
                            disabled={isSubmitting}
                            className={`p-3 w-32 rounded-md font-semibold transition-all duration-200 ${!isSubmitting
                                ? 'bg-[#50D2C1] hover:bg-cyan-500 text-white'
                                : 'bg-gray-600 cursor-not-allowed text-gray-400'
                                }`}
                        >
                            {isSubmitting ? 'Burning...' : 'Burn'}
                        </button>
                    </div>

                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-gray-800 p-3 rounded text-xs">
                            <details>
                                <summary className="cursor-pointer text-gray-400">Debug Info</summary>
                                <pre className="mt-2 text-gray-300">
                                    {JSON.stringify({ formData, nftName, errors }, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BurnPage;