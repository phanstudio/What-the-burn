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

const NFT_ADDRESS = '0xbB700D8Ce0D97f9600E5c5f3EF37ec01147Db4b9'//'0xbB700D8Ce0D97f9600E5c5f3EF37ec01147Db4b9';//'0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
const NFT_ABI = [
    "function symbol() public view returns (string)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
];

const BURN_MANGER_ADDRESS = '0xe906c4e51f70639ee59da0d54e37740760118cf1'//'0x6BaAA6BbC7278579fCDeE38E3f3c4E4eE2272e13';//'0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
const BURN_MANGER_ABI = [
    "function createPremium(uint32[] tokenIds, uint32 update_id)",
    "function getBurnFee() public view returns (uint256)",
];

function BurnPage() {
    const { address, isConnected } = useAccount();
    const [nfts, setNfts] = useState([]);
    const navigate = useNavigate();
    const jwt = sessionStorage.getItem('jwt');
    const { data: walletClient } = useWalletClient();

    const callContract = async () => {
        if (!isConnected || !walletClient) return;
        try {
            const provider = new ethers.BrowserProvider(walletClient.transport);
            const signer = await provider.getSigner();
            const burnManager = new ethers.Contract(BURN_MANGER_ADDRESS, BURN_MANGER_ABI, signer);
            const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
            // check if no errors occured
            if (await nftContract.isApprovedForAll(address, BURN_MANGER_ADDRESS) === false){
                await nftContract.setApprovalForAll(BURN_MANGER_ADDRESS, true)
            }
            const burnFee = await burnManager.getBurnFee()
            console.log(ethers.formatEther(burnFee))
            const startingPoint = 12+4
            const loopAmount = 2
            await burnManager.createPremium([...Array(loopAmount)].map((_, i) => i + startingPoint), startingPoint+loopAmount, {
                value: burnFee
            })
            
        } catch (error) {
            console.error("❌ Contract call failed:", error);
        }
    };

    const newfunc2 = async () => {
        if (!isConnected || !walletClient) return;
        try {

            const url = 'http://localhost:8000/update-requests/';
            // Create FormData for file + data
            const formData = new FormData();
            formData.append('transaction_hash', '0xabc123456789abcdef');
            formData.append('address', '9zYhGFWkUGW8Wr6zZZuayXZzBbGiyCehqgThpD9TgXEU');
            formData.append('update_id', 1);
            formData.append('burn_ids', JSON.stringify([101, 102])); // Stringified JSON
            formData.append('update_name', 'phantomkid');

            // File must come from an input or Blob (for browser), or fs in Node.js
            const fileInput = document.querySelector('#file'); // <input type="file" id="file" />
            formData.append('image', fileInput.files[0]); // Or use File/Blob directly

            const response = await axios.post(url, formData, {
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'multipart/form-data'
            }
            })
            console.log('Upload success:', response.data);
        } catch (error) {
            console.error("❌ Contract call failed:", error);
        }
    };

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
        fetchNFTs();
    }, [jwt]);

    return (
        <div className="p-6 flex flex-col bg-[#0F1A1F] min-h-screen text-white">
            <div className="">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Burn NFTs</h1>
                </div>
            </div>
            <div className=" flex flex-col mx-auto w-full max-w-3xl bg-[#1A2429] p-6 rounded-lg shadow-lg">
                <div className=" space-y-8">
                    <Selector nfts={nfts} />
                    < DragAndDropFileInput />
                    <TextArea />
                    {/* Burn them all */}
                    <button className=' bg-[#50D2C1] hover:bg-cyan-500 transition-all p-2 w-32 rounded-md  mt-2' onClick={callContract}>Burn</button>
                </div>
            </div>
        </div>
    );
}

export default BurnPage;
