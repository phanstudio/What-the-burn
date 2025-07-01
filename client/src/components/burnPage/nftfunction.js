const callContract = async () => {
    if (!isConnected || !walletClient) return;
    try {

        const provider = new ethers.BrowserProvider(walletClient.transport);
        const signer = await provider.getSigner();

        const burnManager = new ethers.Contract(BURN_MANGER_ADDRESS, BURN_MANGER_ABI, signer);
        const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);

        // check first for approval first
        if (await isApprovedForAll(address, BURN_MANGER_ADDRESS) === false) {
            await nftContract.setApprovalForAll(BURN_MANGER_ADDRESS, true)
        }
        await burnManager.createPremium([...Array(10)].map((_, i) => i + 2), 2)

    } catch (error) {
        console.error("❌ Contract call failed:", error);
    }
};