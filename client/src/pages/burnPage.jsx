import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NFTSelect from '../components/burnPage/SelectNFTs';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import NFTMultiSelect from '../components/burnPage/MultipleNft';

function BurnPage() {
    const { address, isConnected } = useAccount();
    const [nfts, setNfts] = useState([]);
    const navigate = useNavigate();
    const jwt = sessionStorage.getItem('jwt');

    // 🚨 Redirect to "/" if wallet disconnects
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
                console.log(jwt)
                const response = await axios.get(
                    `https://what-the-burn-backend-phanstudios-projects.vercel.app/user-tokens/?wallet=0xA9A5d352B6F388583A850803e297865A499f630B`,//${address}`, 
                    // `http://localhost:8000/user-tokens/?wallet=${address}`, 
                    {
                        headers: {
                            Authorization: `Token ${jwt}`
                        }
                    });
                setNfts(response.data.tokens);
            } catch (err) {
                console.error('❌ Failed to fetch NFTs:', err);
            }
        };

        fetchNFTs();
    }, [jwt]);

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Burn NFTs</h1>

            </div>

            <p className="mb-4">
                Connected Wallet: <span className="font-mono text-emerald-400">{address}</span>
            </p>

            <NFTSelect nfts={nfts} />

        </div>
    );
}

export default BurnPage;
