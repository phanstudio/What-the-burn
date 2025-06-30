import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DragAndDropFileInput from '../components/burnPage/dragNdrop';
import { useAccount, useWalletClient } from 'wagmi';
import NFTSelector from '../components/burnPage/NFTSelector';
import TextArea from '../components/burnPage/TextArea';
import NFTNameInput from '../components/burnPage/NFTNameInput';

<<<<<<< Updated upstream
<<<<<<< Updated upstream
const NFT_ADDRESS = '0xbB700D8Ce0D97f9600E5c5f3EF37ec01147Db4b9';//'0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
const NFT_ABI = [
    "function symbol() public view returns (string)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
];

const BURN_MANGER_ADDRESS = '0x6BaAA6BbC7278579fCDeE38E3f3c4E4eE2272e13';//'0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
const BURN_MANGER_ABI = [
    "function createPremium(uint32[] tokenIds, uint32 update_id)"
];


function BurnPage() {
=======
const BurnPage = () => {
>>>>>>> Stashed changes
=======
const BurnPage = () => {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

<<<<<<< Updated upstream
    const callContract = async () => {
        if (!isConnected || !walletClient) return;
        try {
            
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();

            const burnManager = new ethers.Contract(BURN_MANGER_ADDRESS, BURN_MANGER_ABI, signer);
            const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
            
            // check first for approval first
            if (await isApprovedForAll(address, BURN_MANGER_ADDRESS) === false){
                await nftContract.setApprovalForAll(BURN_MANGER_ADDRESS, true)
            }
            await burnManager.createPremium([...Array(10)].map((_, i) => i + 2), 2)

        } catch (error) {
            console.error("❌ Contract call failed:", error);
        }
    };

    // 🚨 Redirect to "/" if wallet disconnects
=======
>>>>>>> Stashed changes
=======

>>>>>>> Stashed changes
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
    };

    const handleNFTSelection = (selectionData) => {
        const nftSelections = {
            multiple: selectionData.multiple || [],
            single: selectionData.single || null
        };

        setFormData(prev => ({ ...prev, nftSelections }));
    };

    const handleFileUpload = (uploadedFiles) => {
        setFormData(prev => ({ ...prev, uploadedFiles }));
    };

    const handleBurn = async () => {
        const newErrors = {};

        if (!formData.nftSelections.multiple.length) {
            newErrors.nftSelections = 'Select at least one NFT.';
        }

        if (!formData.description || formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters.';
        }

        if (!nftName || nftName.trim().length < 3) {
            newErrors.nftName = 'NFT name must be at least 3 characters.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setIsSubmitting(true);

        try {
            console.log('🔥 Starting burn process...', {
                description: formData.description,
                multipleNFTs: formData.nftSelections.multiple,
                featuredNFT: formData.nftSelections.single,
                files: formData.uploadedFiles
            });

            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

            console.log('✅ Burn successful!');

            setFormData({
                description: '',
                nftSelections: { multiple: [], single: null },
                uploadedFiles: []
            });
            setNftName('');
            setErrors({});
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
            </div>
            <div className=" flex flex-col mx-auto w-full max-w-3xl bg-[#1A2429] p-6 rounded-lg shadow-lg">
                <div className=" space-y-8">
                    <Selector nfts={nfts} />
                    < DragAndDropFileInput />
                    <TextArea />
                    {/* Burn them all */}
                    <button className=' bg-[#50D2C1] hover:bg-cyan-500 transition-all p-2 w-32 rounded-md  mt-2'>Burn</button>
=======
                <p className="mb-4">
                    Connected Wallet: <span className="font-mono text-wrap text-emerald-400">{address}</span>
                </p>
            </div>
=======
                <p className="mb-4">
                    Connected Wallet: <span className="font-mono text-wrap text-emerald-400">{address}</span>
                </p>
            </div>
>>>>>>> Stashed changes

            <div className="flex flex-col mx-auto w-full max-w-3xl bg-[#1A2429] p-6 rounded-lg shadow-lg">
                <div className="space-y-8">
                    <NFTSelector
                        nfts={nfts}
                        onSelect={handleNFTSelection}
                        maxSelections={10}
                    />
                    {errors.nftSelections && (
                        <p className="text-red-400 text-sm">{errors.nftSelections}</p>
                    )}

                    <DragAndDropFileInput onFileUpload={handleFileUpload} />

                    <NFTNameInput
                        value={nftName}
                        onChange={setNftName}
                        minLength={3}
                        maxLength={50}
                        placeholder="Enter your NFT name..."
                    />
                    {errors.nftName && (
                        <p className="text-red-400 text-sm">{errors.nftName}</p>
                    )}

                    <TextArea
                        placeholder="Enter a description..."
                        value={formData.description}
                        onChange={handleDescriptionChange}
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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                </div>
            </div>
        </div>
    );
};

export default BurnPage;
