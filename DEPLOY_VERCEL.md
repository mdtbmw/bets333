# Vercel Deployment Guide

This guide details the steps to deploy the Intuition BETs application to Vercel.

## Prerequisites

1.  **Vercel Account:** Create an account at [vercel.com](https://vercel.com).
2.  **GitHub Repository:** Ensure your code is pushed to a GitHub repository.

## Environment Variables

The following environment variables are **REQUIRED** for the application to function correctly. You must configure these in the Vercel Project Settings under **Settings > Environment Variables**.

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Project ID from WalletConnect Cloud | `b8c2273b...` |
| `NEXT_PUBLIC_ADMIN_ADDRESS` | Wallet address of the admin | `0x123...` |
| `NEXT_PUBLIC_INTUITION_BETTING_ADDRESS` | Deployed Betting Contract Address | `0xABC...` |
| `NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS` | Deployed Profile Registry Contract Address | `0xDEF...` |
| `NEXT_PUBLIC_INTUITION_RPC` | RPC URL for the Intuition Chain | `https://rpc.intuition.systems/http` |
| `NEXT_PUBLIC_INTUITION_CHAIN_ID` | Chain ID for the Intuition Chain | `1155` |

> **Note:** If you haven't deployed the contracts yet, follow the instructions in `DEPLOY_GUIDE.md` to deploy them and get the addresses.

## Deployment Steps

1.  **Import Project:**
    *   Go to your Vercel Dashboard.
    *   Click **"Add New..."** -> **"Project"**.
    *   Import your GitHub repository.

2.  **Configure Project:**
    *   **Framework Preset:** Vercel should automatically detect **Next.js**.
    *   **Root Directory:** `./` (default).
    *   **Build Command:** `next build` (default).
    *   **Output Directory:** `.next` (default).
    *   **Install Command:** `npm install` (default).

3.  **Add Environment Variables:**
    *   Expand the **"Environment Variables"** section.
    *   Add all the variables listed in the table above.

4.  **Deploy:**
    *   Click **"Deploy"**.
    *   Wait for the build to complete.

## Verification

After deployment:

1.  Visit the deployed URL.
2.  Check the browser console for any errors.
3.  Connect your wallet.
4.  Verify that events are loading (this confirms the RPC and Contract Address are correct).

## Troubleshooting

*   **Build Failed:** Check the build logs in Vercel. Common issues include TypeScript errors or linting errors.
    *   If you see `Type error`, fix the TypeScript issues locally.
    *   If you see `Lint error`, fix the linting issues locally.
*   **Runtime Error:** If the app loads but crashes or shows errors, check the browser console and ensure all environment variables are set correctly.
