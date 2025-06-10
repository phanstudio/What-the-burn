import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350'
const CONTRACT_ABI = [
    // Replace with your contract's ABI
    // "function myFunction() public view returns (uint256)"
    "function symbol() public view returns (string)"
]

function LandingPage() {
    const { address, isConnected } = useAccount()
    const { data: walletClient } = useWalletClient()

    useEffect(() => {
        const callContract = async () => {
            if (!isConnected || !walletClient) return

            try {
                
                // ✅ This is the right way to wrap Wagmi's walletClient for ethers v6
                const provider = new ethers.BrowserProvider(walletClient.transport)
                const signer = await provider.getSigner()
                // const signed = await signer.signMessage("love") for verifing
                // console.log(signed)
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

                console.log("📞 Calling symbol()...");

                const result = await contract.symbol();
                
                console.log('symbol():', result)
            } catch (error) {
                console.error('Contract call failed:', error)
            }
        }

        callContract()
    }, [isConnected, walletClient])

    // const callContractFunction = async () => {
    //     if (!walletClient) {
    //         alert('Wallet not connected')
    //         return
    //     }

    //     const signer = new ethers.providers.Web3Provider(walletClient).getSigner()
    //     const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

    //     try {
    //         setLoading(true)
    //         const tx = await contract.myFunction()
    //         await tx.wait() // Wait for transaction to confirm (skip this if it's a view function)
    //         setResult('Function called successfully!')
    //     } catch (error) {
    //         console.error(error)
    //         setResult('Error calling function')
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    return (
        <div className='h-screen flex flex-col items-center justify-center w-full bg-emerald-950 gap-6'>
            <h1 className="text-4xl font-bold text-white mb-8">Welcome to Your dApp</h1>

            <ConnectButton />

            {isConnected && (
                <p className="text-white mt-4">Connected Wallet: {address}</p>
            )}

            {/* {isConnected && (
                <>
                    <p className="text-white mt-4">Connected Wallet: {address}</p>
                    <button
                        onClick={callContractFunction}
                        className="mt-4 px-4 py-2 bg-emerald-500 text-white font-semibold rounded hover:bg-emerald-600"
                        disabled={loading}
                    >
                        {loading ? 'Calling...' : 'Call Contract Function'}
                    </button>
                    {result && <p className="text-white mt-2">{result}</p>}
                </>
            )} */}

            <Link className='text-white underline hover:text-emerald-300 transition-colors' to="/burn">
                Go to Dashboard
            </Link>
        </div>
    )
}

export default LandingPage