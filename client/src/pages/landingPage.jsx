import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import axios from 'axios';

const CONTRACT_ADDRESS = '0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
const CONTRACT_ABI = [
    "function symbol() public view returns (string)"
];

function LandingPage() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const [jwt, setJwt] = useState(null);
    // we are getting the jwt we want to use it everywhere in the code

    const connectAndValidate = async () => {
        if (!walletClient || !isConnected) return;

        try {
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();

            const walletAddress = await signer.getAddress();

            // Step 1: Request message to sign
            const messageResponse = await axios.get( // use the main
                `https://what-the-burn-backend-phanstudios-projects.vercel.app/sign-message/?wallet=${walletAddress}`
            );
            console.log(messageResponse.data, "s")
            const messageToSign = messageResponse.data.message;

            // Step 2: Sign the message
            const signature = await signer.signMessage(messageToSign);
            console.log(signature)

            // Step 3: Send signature for verification
            const verifyResponse = await axios.post(
                'https://what-the-burn-backend-phanstudios-projects.vercel.app/verify-signature/',
                {
                    wallet_address: walletAddress,
                    signature: signature,
                }
            );

            const token = verifyResponse.data.access;
            setJwt(token);

            console.log("✅ Wallet authenticated. JWT:", token);
        } catch (err) {
            console.error("❌ Wallet verification failed:", err);
        }
    };

    const callContract = async () => {
        if (!isConnected || !walletClient) return;

        try {
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            console.log("📞 Calling symbol()...");
            const result = await contract.symbol();
            console.log("✅ symbol():", result);
        } catch (error) {
            console.error("❌ Contract call failed:", error);
        }
    };

    return (
        <div className='h-screen flex flex-col items-center justify-center w-full bg-emerald-950 gap-6'>
            <h1 className="text-4xl font-bold text-white mb-8">Welcome to Your dApp</h1>

            <ConnectButton />

            {isConnected && (
                <>
                    { !jwt&&(
                        <>
                            <p className="text-white mt-4">Connected Wallet: {address}</p>
                            <button
                                onClick={connectAndValidate}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Sign & Authenticate Wallet
                            </button>
                        </>
                    )}

                    {jwt && (
                        <button
                            onClick={callContract}
                            className="mt-4 px-4 py-2 bg-emerald-500 text-white font-semibold rounded hover:bg-emerald-600"
                        >
                            Call Contract
                        </button>
                    )}
                </>
            )}

            <Link className='text-white underline hover:text-emerald-300 transition-colors' to="/burn">
                Go to Dashboard
            </Link>
        </div>
    );
}

export default LandingPage;
