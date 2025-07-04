import React, { useState, useEffect } from 'react';

const WalletSignaturePopup = ({ onClose, onapprove}) => {
    const [isSigning, setIsSigning] = useState(false);
    const [signed, setSigned] = useState(false);

    const closePopup = (shouldDisconnect = true) => {
        if (onClose) onClose(shouldDisconnect);
    };

    const approveSign = async () => {
        if (onapprove) await onapprove();
    }

    const rejectSignature = () => {
        console.log('Transaction rejected by user');
        closePopup();
    }

    const approveSignature = async() => { // disable closing once clicked
        setIsSigning(true);
        await approveSign();
        setSigned(true);
        setTimeout(() => {
            closePopup(false);
        }, 1500);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closePopup();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div
            className="fixed inset-0 z-[1000] bg-[#0F1A1F] backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closePopup}
        >
            <div
                className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-0.5 max-w-md w-full animate-[slideUp_0.3s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white rounded-[22px] p-8 text-center relative">
                    <button
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 text-2xl"
                        onClick={closePopup}
                    >
                        &times;
                    </button>

                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
                        <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                            <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zM12 16h10V8H12v8zm2-2a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-3">
                        Sign Transaction
                    </h2>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Your wallet is requesting permission to sign this transaction. Please review the details carefully before proceeding.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl text-left p-5 my-6">
                        {[
                            { label: 'Network', value: 'Ethereum Mainnet' },
                            { label: 'From', value: '0x742d...35Ac' },
                            { label: 'Gas Fee', value: '0.0023 ETH' },
                            { label: 'Nonce', value: '42' },
                        ].map(({ label, value }, idx, arr) => (
                            <div
                                key={label}
                                className={`flex justify-between py-2 ${idx < arr.length - 1 ? 'border-b border-gray-200' : ''}`}
                            >
                                <span className="text-sm font-semibold text-gray-700">{label}</span>
                                <span className="text-sm text-gray-500 font-mono">{value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 flex gap-3 text-left mb-5">
                        <div className="text-yellow-600 mt-1 shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div className="text-sm text-yellow-800 leading-snug">
                            <strong>Security reminder:</strong> Only sign transactions you understand and trust. Make sure you're on the correct website and verify all transaction details.
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            className="flex-1 py-4 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-base hover:bg-gray-200 transition"
                            onClick={rejectSignature}
                            disabled={isSigning}
                        >
                            Cancel
                        </button>
                        <button
                            className={`flex-1 py-4 text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition hover:shadow-lg ${isSigning ? 'opacity-70 pointer-events-none' : ''
                                }`}
                            onClick={approveSignature}
                        >
                            {isSigning ? (
                                signed ? (
                                    '✓ Signed Successfully'
                                ) : (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                                        Signing...
                                    </>
                                )
                            ) : (
                                'Sign Transaction'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletSignaturePopup;
