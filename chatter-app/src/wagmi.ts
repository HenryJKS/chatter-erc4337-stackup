import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

const anvil: Chain = {
    id: 31_337,
    name: "Anvil Local",
    nativeCurrency: {
        decimals: 18,
        name: 'GO',
        symbol: 'GO'
    },
    rpcUrls: {
        public: { http: ["http://localhost:8545"] },
        default: { http: ["http://localhost:8545"] },
    },
    testnet: true
}

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    anvil,
    sepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});