import React, { useEffect, useState } from 'react';
import {
    Save,
    DollarSign,
    Plus,
    Check,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { useNavigate, } from 'react-router-dom';
import { BURN_MANGER_ABI, BURN_MANGER_ADDRESS } from '../../utils/abi'

const AdminSettings = () => {
    // Current prices (these would typically come from an API or state management)
    const [currentValues, setCurrentValues] = useState({
        burnAmount: 25,
        createPrice: 0.05,
    });

    // Form state
    const [formData, setFormData] = useState({
        burnAmount: '',
        createPrice: ''
    });

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
    const jwt = sessionStorage.getItem('jwt');
    const navigate = useNavigate();

    const { _, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const callContract = async () => {
        if (!isConnected || !walletClient) return;
        try {
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();
            const burnManger = new ethers.Contract(BURN_MANGER_ADDRESS, BURN_MANGER_ABI, signer);
            if (!formData.createPrice === false) {
                await burnManger.setBurnFee(ethers.parseUnits(formData.createPrice, 18));
            }
            if (!formData.burnAmount === false) {
                await burnManger.setMinimumBurnAmount(parseInt(formData.burnAmount));
            }
            // add the withdraw method and button
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
        const fetchInfo = async () => {
            if (!jwt) return;

            try {
                const response = await axios.get(
                    `https://what-the-burn-backend-phanstudios-projects.vercel.app/app-settings/`,
                    {
                        headers: {
                            Authorization: `Token ${jwt}`
                        }
                    }
                );
                setCurrentValues({
                    burnAmount: response.data.amount_to_burn,
                    createPrice: parseFloat(response.data.base_fee)
                })
            } catch (err) {
                console.error('❌ Failed to fetch settings data:', err);
            }
        };
        fetchInfo();
    }, [jwt]);

    const handleInputChange = (field, value) => {
        // Only allow numbers and decimal points
        const numericValue = value.replace(/[^0-9.]/g, '');

        // Prevent multiple decimal points
        const parts = numericValue.split('.');
        if (parts.length > 2) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            [field]: numericValue
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            // Validate inputs
            const burnAmount = parseInt(formData.burnAmount);
            const createPrice = parseFloat(formData.createPrice);

            if (formData.burnAmount && (isNaN(burnAmount) || burnAmount <= 0)) {
                throw new Error('Change Burn amount must be a valid positive number');
            }

            if (formData.createPrice && (isNaN(createPrice) || createPrice <= 0)) {
                throw new Error('Create price must be a valid positive number');
            }

            const data = {};

            if (!isNaN(burnAmount)) data.amount_to_burn = burnAmount;
            if (!isNaN(createPrice)) data.base_fee = createPrice;

            await callContract()
            await axios.put(
                'https://what-the-burn-backend-phanstudios-projects.vercel.app/app-settings/',
                data,
                {
                    headers: {
                        Authorization: `Token ${jwt}`
                    }
                }
            );

            // Update current prices with new values if provided
            const updatedValues = { ...currentValues };
            if (formData.burnAmount) {
                updatedValues.burnAmount = burnAmount;
            }
            if (formData.createPrice) {
                updatedValues.createPrice = createPrice;
            }

            setCurrentValues(updatedValues);

            // Clear form
            setFormData({
                burnAmount: '',
                createPrice: ''
            });

            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);

        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const isFormValid = formData.burnAmount || formData.createPrice;

    return (
        <div className="min-h-screen bg-inherit p-3 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#50D2C1] mb-2">Admin Settings</h1>
                    <p className="text-gray-400 text-sm sm:text-base">Configure pricing and system settings</p>
                </div>

                {/* Settings Form */}
                <div className="bg-[#141f24] rounded-lg shadow-lg p-4 sm:p-6 mb-6">
                    <h2 className="text-xl font-semibold text-[#50D2C1] mb-6 flex items-center space-x-2">

                        <span>Configurations</span>
                    </h2>

                    <div className="space-y-6">
                        {/* Burn NFT Price */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Base number of NFTs to burnt
                            </label>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Plus className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.burnAmount}
                                        onChange={(e) => handleInputChange('burnAmount', e.target.value)}
                                        placeholder="Enter new amount"
                                        className="w-full pl-10 pr-3 py-3 bg-[#0F1A1F] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2
                                         focus:ring-[#50D2C1] focus:border-transparent transition-colors"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="text-gray-400">Current:</span>
                                    <span className="text-[#50D2C1] font-semibold text-lg">
                                        {currentValues.burnAmount.toFixed(0)} Nfts
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Set the number of NFTs to burn
                            </p>
                        </div>

                        {/* Create Item Price */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Burn NFT Price
                            </label>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.createPrice}
                                        onChange={(e) => handleInputChange('createPrice', e.target.value)}
                                        placeholder="Enter new price"
                                        className="w-full pl-10 pr-3 py-3 bg-[#0F1A1F] border border-gray-600 rounded-lg text-white
                                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#50D2C1] focus:border-transparent transition-colors"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="text-gray-400">Current:</span>
                                    <span className="text-[#50D2C1] font-semibold text-lg">
                                        ${currentValues.createPrice}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Set the price for burning NFTs
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                {saveStatus && (
                    <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${saveStatus === 'success'
                        ? 'bg-green-900/20 border border-green-500/30 text-green-400'
                        : 'bg-red-900/20 border border-red-500/30 text-red-400'
                        }`}>
                        {saveStatus === 'success' ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">
                            {saveStatus === 'success'
                                ? 'Settings saved successfully!'
                                : 'Failed to save settings. Please try again.'
                            }
                        </span>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleSave}
                        disabled={!isFormValid || isSaving}
                        className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 w-full sm:w-auto justify-center ${!isFormValid || isSaving
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-[#115E4C] text-white hover:bg-[#50D2C1] hover:shadow-lg hover:shadow-[#50D2C1]/20'
                            }`}
                    >
                        <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
                        <span className="text-sm sm:text-base">
                            {isSaving ? 'Saving Settings...' : 'Save Settings'}
                        </span>
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-[#0F1A1F]/50 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Information</h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Enter new prices to update the current pricing structure</li>
                        <li>• Leave fields empty if you don't want to change those prices</li>
                        <li>• Changes will take effect immediately after saving</li>
                        <li>• Only positive numbers are accepted for pricing</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
