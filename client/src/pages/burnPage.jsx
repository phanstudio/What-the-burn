import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DragAndDropFileInput from '../components/burnPage/dragNdrop';
import Selector from '../components/burnPage/SelectNFTs';
import TextArea from '../components/burnPage/TextArea';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { disconnect } from '@wagmi/core'
import { config } from '../utils/wagmi'

const nft_address = '0xbB700D8Ce0D97f9600E5c5f3EF37ec01147Db4b9';//'0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
const nft_abi = [
    "function symbol() public view returns (string)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
];

const CONTRACT_ADDRESS = '0x6BaAA6BbC7278579fCDeE38E3f3c4E4eE2272e13';//'0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
const CONTRACT_ABI = [
    "function createPremium(uint32[] tokenIds, uint32 update_id)"
];


function BurnPage() {
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
        <div className="p-6 flex flex-col bg-[#0F1A1F] min-h-screen text-white">
            <div className="">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Burn NFTs</h1>
                </div>

                <p className="mb-4">
                    Connected Wallet: <span className="font-mono text-wrap text-emerald-400">{address}</span>
                </p>
            </div>
            <div className=" flex flex-col mx-auto w-full max-w-3xl bg-[#1A2429] p-6 rounded-lg shadow-lg">


                <div className=" space-y-8">
                    <Selector nfts={nfts} />
                    < DragAndDropFileInput />
                    <TextArea />


                    {/* Burn them all */}
                    <button className=' bg-[#50D2C1] hover:bg-cyan-500 transition-all p-2 w-32 rounded-md  mt-2'>Burn</button>
                </div>
            </div>
        </div>
    );
}

export default BurnPage;
