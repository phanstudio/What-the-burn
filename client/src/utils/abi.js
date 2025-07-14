export const NFT_ADDRESS = '0x22fD304D495Bd4579766Aaa78Bba450397FD7B1E';
export const NFT_ABI = [
    "function symbol() public view returns (string)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
];

export const BURN_MANGER_ADDRESS = '0xF83AeF425Ab69124a398E08F289048FF8404a6a3';//'0x6BaAA6BbC7278579fCDeE38E3f3c4E4eE2272e13';//'0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
export const BURN_MANGER_ABI = [
    "function createPremium(uint32[] tokenIds, uint32 update_id)",
    "function getBurnFee() public view returns (uint256)",
    "function BurnAmount() public view returns (uint16)",
    "function setBurnFee(uint256 _newFee)",
    "function setBurnAmount(uint16 amount)"
];
