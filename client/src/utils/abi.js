export const NFT_ADDRESS = '0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
export const NFT_ABI = [
    "function symbol() public view returns (string)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
];

export const BURN_MANGER_ADDRESS = '0xFFaCdbB2BF77efDE0d26650213B1804ff89c824f';
export const BURN_MANGER_ABI = [
    "function createPremium(uint32[] tokenIds, uint32 update_id)",
    "function getBurnFee() public view returns (uint256)",
    "function BurnAmount() public view returns (uint16)",
    "function setBurnFee(uint256 _newFee)",
    "function setBurnAmount(uint16 amount)"
];
