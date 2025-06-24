import React from 'react'
import { useAccount, useWalletClient } from 'wagmi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Results() {
    const { address, isConnected } = useAccount();
    const [nfts, setNfts] = useState([]);
    const navigate = useNavigate();
    const jwt = sessionStorage.getItem('jwt');
    const { data: walletClient } = useWalletClient();

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

        console.log(nfts)

        fetchNFTs();
    }, [jwt]);
    return (
        <div className=' h-screen w-full bg-[#0F1A1F] text-white'>Results</div>
    )
}

export default Results