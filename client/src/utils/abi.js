export const NFT_ADDRESS = '0xbB700D8Ce0D97f9600E5c5f3EF37ec01147Db4b9';
export const NFT_ABI = [
    "function symbol() public view returns (string)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
];

export const BURN_MANGER_ADDRESS = '0xe906c4e51F70639EE59DA0D54e37740760118Cf1';//'0x6BaAA6BbC7278579fCDeE38E3f3c4E4eE2272e13';//'0xF1ddcE4A958E4FBaa4a14cB65073a28663F2F350';
export const BURN_MANGER_ABI = [
    "function createPremium(uint32[] tokenIds, uint32 update_id)",
    "function getBurnFee() public view returns (uint256)",
    "function minimumBurnAmount() public view returns (uint16)",
    "function setBurnFee(uint256 _newFee)",
    "function setMinimumBurnAmount(uint16 amount)"
];
