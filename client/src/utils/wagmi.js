// src/wagmi.js
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  braveWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  mainnet,
  seiDevnet,
} from 'wagmi/chains';
import { defineChain } from 'viem';

const hyperEVM = defineChain({
  id: 999,
  name: 'HyperEVM',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVM Explorer',
      url: 'https://hypurrscan.io/',
    },
  },
});

const hyperEVMTestnet = defineChain({
  id: 998,
  name: 'HyperEVMTestnet',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVMTestnet Explorer',
      url: 'https://testnet.purrsec.com/',
    },
  },
});

export const config = getDefaultConfig({
  appName: 'What the burn?',
  projectId: '5379c9e3bf58798f600c7cd162a5120f',
  chains: [hyperEVM, hyperEVMTestnet],//, mainnet, seiDevnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
  wallets: [
    {
      groupName: 'Recommended Wallets',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
  ],
});

export const HyperEvm = hyperEVM;
