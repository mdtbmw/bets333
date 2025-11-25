# Intuition BETs - Prediction Market Platform

This is a complete Next.js application for a decentralized prediction market platform called "Intuition BETs". It allows users to bet on the outcomes of real-world events, features a robust admin panel for managing events, and includes AI-powered tools for event creation and resolution.

The application is built with a modern tech stack, including:
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, ShadCN UI
- **Blockchain:** Hardhat, Ethers.js, wagmi for wallet integration
- **Generative AI:** Genkit for AI flows (event generation, resolution, etc.)

---

## 1. Environment Setup

To run this application, create a `.env` file in the root of the project and add the following variables.

```
# =================================================================
# == CORE BLOCKCHAIN & DEPLOYMENT CONFIGURATION
# =================================================================

# --- Intuition Testnet (Default) ---
# These values connect the app to the Intuition test network.
NEXT_PUBLIC_INTUITION_RPC="https://rpc.intuition.systems/http"
NEXT_PUBLIC_INTUITION_CHAIN_ID="1155"

# --- WalletConnect ---
# This is required for the "Connect Wallet" button to function.
# Get your free Project ID from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# --- Contract Deployment & Admin Wallet ---
# This wallet will be the owner of the contracts and have admin privileges.
# WARNING: The private key gives full control over the wallet. NEVER commit it to a public repository.
INTUITION_DEPLOYER_PRIVATE_KEY=
NEXT_PUBLIC_ADMIN_ADDRESS=

# --- Platform Fees ---
# This wallet will receive the platform fees collected from resolved bets.
TREASURY_ADDRESS=
PLATFORM_FEE_BPS=300 # 300 basis points = 3%

# =================================================================
# == DEPLOYED CONTRACT ADDRESSES (Fill After First Deployment)
# =================================================================
# After you run the deployment script for the first time, paste the output addresses here.
NEXT_PUBLIC_INTUITION_BETTING_ADDRESS=
NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS=

```

### How to Get Your Wallet Details

1.  **Public Address (`NEXT_PUBLIC_ADMIN_ADDRESS`)**: In MetaMask, your public address is shown at the top of the account view. Copy it.
2.  **Private Key (`INTUITION_DEPLOYER_PRIVATE_KEY`)**: In MetaMask, click the three dots (⋮) -> **Account details** -> **Show private key**.

---

## 2. Install Dependencies

Install the required packages using npm:

```bash
npm install
```

---

## 3. Deploy Smart Contracts

Before running the application, you must deploy the smart contracts to the blockchain. This script uses the `INTUITION_DEPLOYER_PRIVATE_KEY` and other variables from your `.env` file.

```bash
npm run deploy:contracts
```

After the script succeeds, it will print the new contract addresses. **Copy these addresses and paste them into your `.env` file** for the corresponding `NEXT_PUBLIC_..._ADDRESS` variables.

---

## 4. Run the Application

Once your environment is configured and contracts are deployed, you can run the local development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

---

## Available Scripts

- **`npm run dev`**: Starts the Next.js development server with Turbopack.
- **`npm run build`**: Creates an optimized production build of the application.
- **`npm run start`**: Starts the application in production mode (requires `npm run build` first).
- **`npm run lint`**: Lints the codebase for errors and style issues.
- **`npm run typecheck`**: Runs the TypeScript compiler to check for type errors.
- **`npm run deploy:contracts`**: Deploys the smart contracts to the configured network.
```