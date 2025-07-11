import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import axios from 'axios';
import WalletSignaturePopup from '../components/LandingPage/WalletPopUp';
import { connect, disconnect } from '@wagmi/core';
import { config } from '../utils/wagmi';
import { Video } from 'lucide-react';
import VideoBackground from '../components/LandingPage/VideoBackground';


function LandingPage() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [showPopup, setShowPopup] = useState(false);
    const [jwt, setJwt] = useState(() => sessionStorage.getItem('jwt'));
    const [isLoading, setIsLoading] = useState(false);

    const handlePopupClose = useCallback((shouldDisconnect = true) => {
        if (shouldDisconnect) {
            disconnect(config);
        }
        setShowPopup(false);
    }, []);

    const connectAndValidate = useCallback(async () => {
        if (!walletClient || !isConnected || !address) return;

        setIsLoading(true);
        try {
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();

            const messageResponse = await axios.get(
                `https://what-the-burn-backend-phanstudios-projects.vercel.app/sign-message/?wallet=${address}`
            );
            const message = messageResponse.data.message;

            const signature = await signer.signMessage(message);

            const verifyResponse = await axios.post(
                'https://what-the-burn-backend-phanstudios-projects.vercel.app/verify-signature/',
                {
                    wallet_address: walletAddress,
                    signature: signature,
                }
            );

            const token = verifyResponse.data.token;
            sessionStorage.setItem('jwt', token);
            setJwt(token);
        } catch (err) {
            console.error("❌ Wallet verification failed:", err);
            handlePopupClose(true);
        } finally {
            setIsLoading(false);
        }
    }, [walletClient, isConnected, address, handlePopupClose]);

    const connectAndShow = useCallback(() => {
        const timeoutId = setTimeout(() => {
            setShowPopup(true);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        if (!isConnected) {
            sessionStorage.removeItem('jwt');
            setJwt(null);
        } else if (!jwt) {
            connectAndShow();
        }
    }, [isConnected, jwt, address, connectAndShow]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0F1A1F]">
            {/* <video
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => console.error("Video failed to load", e)}
            >

                <source src="Whattheburnlanding.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video> */}
            <VideoBackground />
            <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />


            <div className="relative z-20 flex flex-col items-center justify-center h-full gap-6 text-white">
                <h1 className="text-lg md:text-2xl lg:text-4xl font-bold">
                    Welcome to Your dApp
                </h1>


                <Link
                    className="underline hover:text-emerald-300 transition-colors"
                    to="/burn"
                >
                    <button className="bg-teal-400 p-2 rounded-sm hover:bg-teal-500 transition-colors">
                        {isLoading ? 'Loading...' : 'Burn NFTs'}
                    </button>
                </Link>
            </div>

            {showPopup && (
                <WalletSignaturePopup
                    onClose={handlePopupClose}
                    onapprove={connectAndValidate}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}

export default LandingPage;