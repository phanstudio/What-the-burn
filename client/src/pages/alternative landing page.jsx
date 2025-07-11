import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import axios from 'axios';
import WalletSignaturePopup from '../components/LandingPage/WalletPopUp';
import { connect, disconnect } from '@wagmi/core'
import { config } from '../utils/wagmi'


function LandingPage() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [showPopup, setShowPopup] = useState(false);
    const [jwt, setJwt] = useState(() => sessionStorage.getItem('jwt'));

    useEffect(() => {
        if (!isConnected) {
            sessionStorage.removeItem('jwt');
            setJwt(null);
        } else {
            if (!jwt) {
                connectAndShow();
            }
        }
    }, [isConnected, jwt]);

    const connectAndShow = async () => {
        setTimeout(() => {
            setShowPopup(true);
        }, 500);
    };

    const connectAndValidate = async () => {
        if (!walletClient || !isConnected) return;
        try {
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();

            // Step 1: Request message to sign
            const messageResponse = await axios.get(
                `https://what-the-burn-backend-phanstudios-projects.vercel.app/sign-message/?wallet=${address}`
            );
            const message = messageResponse.data.message

            // Step 2: Sign the message (this will trigger the wallet popup)
            const signature = await signer.signMessage(message);
            console.log(signature);

            // Step 3: Send signature for verification
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
        }
    };

    const handlePopupClose = (shouldDisconnect = true) => {
        if (shouldDisconnect) {
            disconnect(config);
        }
        setShowPopup(false);
    };

    return (
        <div className='h-auto flex flex-col items-center justify-center w-full bg-[#0F1A1F] gap-6'>
            <h1 className="text-lg md:text-2xl lg:text-4xl font-bold text-white mb-8">
                Welcome to Your dApp
            </h1>

            <Link className='text-white underline hover:text-emerald-300 transition-colors' to="/burn">
                <button className='bg-teal-400 p-2 rounded-sm'>Go to Dashboard</button>
            </Link>

            {/* Wallet Signature Popup */}
            {showPopup && <WalletSignaturePopup onClose={handlePopupClose} onapprove={connectAndValidate} />}
        </div>
    );
}

export default LandingPage;