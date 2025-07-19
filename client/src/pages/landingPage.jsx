import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import axios from 'axios';
import WalletSignaturePopup from '../components/LandingPage/WalletPopUp';
import { connect, disconnect } from '@wagmi/core';
import { config } from '../utils/wagmi';
import VideoBackground from '../components/LandingPage/VideoBackground';
import { Flame, Zap, Shield, TrendingUp, ArrowRight, Sparkles, Bitcoin, Wallet, IdCardLanyard } from 'lucide-react';
import nftIcon from '../components/LandingPage/nftIcon';
import { useAdmin } from '../components/custom/AdminContext';

function LandingPage() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [showPopup, setShowPopup] = useState(false);
    const [jwt, setJwt] = useState(() => sessionStorage.getItem('jwt'));
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [burnCount, setBurnCount] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { setIsAdmin } = useAdmin();

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
            setIsAdmin(verifyResponse.data.admin);
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

    useEffect(() => {
        setIsVisible(true);
        // Animate burn counter
        const interval = setInterval(() => {
            setBurnCount(prev => prev < 12847 ? prev + 1 : 12847);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        {
            icon: <Flame className="w-8 h-8" />,
            title: "Instant Burning",
            description: "Permanently destroy your NFTs in seconds with our advanced burning protocol"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Verified Destruction",
            description: "Get cryptographic proof of destruction recorded on-chain forever"
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Value Recovery",
            description: "Reclaim storage space and potentially increase remaining collection value"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Gas Optimized",
            description: "Minimal transaction fees with our efficient batch burning system"
        }
    ];

    const stats = [
        { label: "NFTs Burned", value: burnCount.toLocaleString(), icon: <Flame className="w-5 h-5" /> },
        { label: "Collections", value: "2,847", icon: <Bitcoin className="w-5 h-5" /> },
        { label: "Users", value: "15,293", icon: <Wallet className="w-5 h-5" /> },
        { label: "Gas Saved", value: "847 ETH", icon: <Sparkles className="w-5 h-5" /> }
    ];

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-[#0F1A1F]">
            {/* Video Background */}
            <VideoBackground />
            <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden z-15">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-teal-400 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Cursor glow effect */}
            <div
                className="fixed w-96 h-96 pointer-events-none z-15 opacity-20"
                style={{
                    left: mousePosition.x - 192,
                    top: mousePosition.y - 192,
                    background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)',
                    transition: 'all 0.1s ease-out'
                }}
            />

            {/* Header */}
            {/* <header className="relative z-20 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                        WhatTheBurn
                    </span>
                </div>
                <nav className="hidden md:flex space-x-8">
                    <a href="#" className="text-white hover:text-teal-400 transition-colors">Features</a>
                    <a href="#" className="text-white hover:text-teal-400 transition-colors">How it Works</a>
                    <a href="#" className="text-white hover:text-teal-400 transition-colors">Stats</a>
                    <a href="#" className="text-white hover:text-teal-400 transition-colors">Support</a>
                </nav>
                <button className="bg-gradient-to-r from-teal-400 to-emerald-500 px-6 py-2 rounded-full hover:from-teal-500 hover:to-emerald-600 transition-all duration-300 font-semibold text-white">
                    Connect Wallet
                </button>
            </header> */}

            {/* Hero Section */}
            <main className="relative z-20 pt-32 pb-20">
                <div className="container mx-auto px-6 text-center">
                    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent">
                            What
                            <br />
                            <span className="text-white">The Burn?!</span>
                        </h1>
                        <p className="text-sm md:text-xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Ready to risk it all for the flex? <br />
                            Burn to claim lets you sacrifice a few of your What?! NFTs to evolve one into a
                            custom 1 in 1. Complete with altered art, deeper lore and your very own Side What (like a Side Kick or ...Side Bitch)
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <Link to="/burn">
                                <button className="group bg-gradient-to-r w-full from-teal-400 to-emerald-500 px-8 py-4 rounded-md text-lg font-semibold hover:from-teal-500 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-2xl hover:shadow-teal-500/25 text-white">
                                    <Flame className="w-5 h-5 group-hover:animate-pulse" />
                                    <span>{isLoading ? 'Loading...' : 'Burn NFTs'}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            {/* <button className="border-2 border-teal-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-400 hover:text-black transition-all duration-300 text-white">
                                Learn More
                            </button> */}
                        </div>

                        {/* Burn Steps */}
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-16">
                            <div className="flex flex-col items-center">

                                <h3 className="text-xl font-semibold text-white">Step 1</h3>
                                <p className="text-gray-300 text-center">Select 10 NFTs to burn</p>
                            </div>
                            <div className="flex flex-col items-center">

                                <h3 className="text-xl font-semibold text-white">Step 2</h3>
                                <p className="text-gray-300 text-center">Select 1 to <span className=' text-teal-400'>Evolve</span> </p>
                            </div>
                            <div className="flex flex-col items-center">

                                <h3 className="text-xl font-semibold text-white">Step 3</h3>
                                <p className="text-gray-300 text-center">Upload Reference PFP</p>
                            </div>
                            <div className="flex flex-col items-center">

                                <h3 className="text-xl font-semibold text-white">Step 4</h3>
                                <p className="text-gray-300 text-center">ADD X Handle or Name</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-teal-400/20 hover:border-teal-400/50 transition-all duration-300">
                                    <div className="flex items-center justify-center mb-2 text-teal-400">
                                        {stat.icon}
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div> */}
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section className="relative z-20 py-20 bg-black/20 backdrop-blur-sm">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                            Why Burn Your NFTs?
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Transform your digital collection with our cutting-edge burning technology
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-gradient-to-br from-gray-900/50 to-black/50 p-8 rounded-2xl border border-teal-400/20 hover:border-teal-400/50 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm"
                            >
                                <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-20 py-20">
                <div className="container mx-auto px-6 text-center">
                    <div className="bg-gradient-to-r from-teal-400/10 to-emerald-500/10 p-12 rounded-3xl border border-teal-400/30 max-w-4xl mx-auto backdrop-blur-sm">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                            Ready to Ignite Change?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join the revolution. Burn what doesn't serve you and emerge stronger.
                        </p>
                        <Link to="/burn">
                            <button className="group bg-gradient-to-r from-teal-400 to-emerald-500 px-12 py-4 rounded-md text-xl font-semibold hover:from-teal-500 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-3 mx-auto shadow-2xl hover:shadow-teal-500/25 text-white">
                                <Flame className="w-6 h-6 group-hover:animate-pulse" />
                                <span>Connect Wallet & Burn</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            {/* <footer className="relative z-20 py-12 border-t border-teal-400/20">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                <Flame className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                                WhatTheBurn
                            </span>
                        </div>
                        <div className="text-gray-400 text-sm">
                            © 2025 WhatTheBurn. Burn responsibly.
                        </div>
                    </div>
                </div>
            </footer> */}

            {/* Popup */}
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