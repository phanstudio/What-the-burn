import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
    const [isLoading, setIsLoading] = useState(false);

    const [jwt, setJwt] = useState(() => sessionStorage.getItem('jwt'));

    useEffect(() => {
        if (!isConnected) {
            sessionStorage.removeItem('jwt');
            setJwt(null);
        }
    }, [isConnected]);

    const connectAndValidate = async () => {
        if (!walletClient || !isConnected) return;

        setIsLoading(true); // Start loading

        try {
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();

            const walletAddress = await signer.getAddress();

            // Step 1: Request message to sign
            const messageResponse = await axios.get( // use the main
                `https://what-the-burn-backend-phanstudios-projects.vercel.app/sign-message/?wallet=${walletAddress}`
                // `http://localhost:8000/sign-message/?wallet=${walletAddress}`, 
            );
            const messageToSign = messageResponse.data.message;

            // Step 2: Sign the message
            const signature = await signer.signMessage(messageToSign);
            console.log(signature)

            // Step 3: Send signature for verification
            const verifyResponse = await axios.post(
                'https://what-the-burn-backend-phanstudios-projects.vercel.app/verify-signature/',
                // 'http://localhost:8000/verify-signature/', 
                {
                    wallet_address: walletAddress,
                    signature: signature,
                }
            );

            // expires_at // for the sessions length
            const token = verifyResponse.data.token;
            sessionStorage.setItem('jwt', token);
            setJwt(token);
            // add a callback to indicate the jwt has connected
        } catch (err) {
            console.error("❌ Wallet verification failed:", err);
        } finally {
            setIsLoading(false); // Stop loading
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



            {isConnected && (
                <>
                    {!jwt && ( // add a model for signing the message
                        <>
                            <button
                                onClick={connectAndValidate}
                                disabled={isLoading}
                                className={`mt-4 px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-3 ${isLoading
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
                                    }`}
                            >
                                {isLoading && (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                )}
                                {isLoading ? 'Authenticating...' : 'Sign & Authenticate Wallet'}
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
                <button className=' bg-teal-400 p-2 rounded-sm'>Go to Dashboard</button>
            </Link>
        </div>
    );
}

export default LandingPage;