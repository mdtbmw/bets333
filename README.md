# Intuition BETs - Decentralized Prediction Market

Intuition BETs is a premier, fully-decentralized prediction market that empowers users to capitalize on their real-world knowledge by betting on event outcomes with the official **$TRUST token**. Built on a foundation of immutable smart contracts and a secure backend, every stake, outcome, and payout is executed with maximum transparency, security, and efficiency.

This repository contains the full source code for the Next.js frontend application.

## 1. Running the Application Locally

To run the development server, first ensure you have all dependencies installed:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## 2. Environment Setup

Before running the application or deploying the smart contracts, you must set up your local environment variables. Create a `.env` file in the root of the project and add the following values.

### Core Blockchain Configuration
These variables are required for the application to connect to the correct blockchain network.

```env
# The HTTP RPC URL for the Intuition network
NEXT_PUBLIC_INTUITION_RPC=https://rpc.intuition.systems/http

# The Chain ID for the Intuition network
NEXT_PUBLIC_INTUITION_CHAIN_ID=1155
```

### WalletConnect Configuration
This is required for the "Connect Wallet" functionality.

```env
# Your project ID from WalletConnect Cloud
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
```
*   **How to get it:**
    1.  Go to [cloud.walletconnect.com](https://cloud.walletconnect.com) and create a free project.
    2.  Copy your **Project ID** from the dashboard.

### Smart Contract Deployment & Administration
These variables are required to deploy the smart contracts and manage the platform.

```env
# The private key of the wallet that will deploy and own the contracts.
# WARNING: Keep this key secure and never commit it to version control.
INTUITION_DEPLOYER_PRIVATE_KEY=YOUR_DEPLOYER_PRIVATE_KEY

# The public wallet address corresponding to the deployer's private key.
NEXT_PUBLIC_ADMIN_ADDRESS=YOUR_ADMIN_WALLET_ADDRESS

# The wallet address where platform fees will be collected.
TREASURY_ADDRESS=YOUR_TREASURY_WALLET_ADDRESS

# The platform fee in basis points (e.g., 300 for 3%).
PLATFORM_FEE_BPS=300
```
*   **How to get them (from MetaMask):**
    1.  In MetaMask, select your deployer/admin account.
    2.  Copy the public address (`0x...`) for `NEXT_PUBLIC_ADMIN_ADDRESS`.
    3.  Click the three dots (⋮) -> **"Account details"** -> **"Show private key"** to get your `INTUITION_DEPLOYER_PRIVATE_KEY`.

### Deployed Contract Addresses
These variables must be filled in *after* you have deployed the smart contracts for the first time.

```env
# The addresses of your deployed smart contracts.
NEXT_PUBLIC_INTUITION_BETTING_ADDRESS=
NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS=
```
*   **How to get them:**
    1.  Ensure all the variables above are set correctly in your `.env` file.
    2.  Run the deployment script from your terminal:
        ```bash
        npm run deploy:contracts
        ```
    3.  The script will output the new contract addresses. Copy and paste them into your `.env` file.
