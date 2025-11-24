# Deploy Readiness Checklist

This document is your final checklist before initiating a production deployment. Ensure every item is marked as `[x]` before running the `deploy.sh` script.

### Phase 1: Configuration

- [ ] **`.env` file is complete:** All required environment variables are set:
    - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
    - `NEXT_PUBLIC_ADMIN_ADDRESS`
    - `NEXT_PUBLIC_INTUITION_BETTING_ADDRESS`
    - `NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS`
    - `NEXT_PUBLIC_INTUITION_RPC`
    - `NEXT_PUBLIC_INTUITION_CHAIN_ID`
- [ ] **Vercel Project Created:** You have created a new project in your Vercel dashboard.
- [ ] **Vercel Environment Variables Set:** You have added all the above variables to the Vercel project settings.

### Phase 2: Code & Quality

- [ ] **All Code Committed:** All recent changes have been committed to your Git repository. The deployment script will deploy the current state of your local files.
- [ ] **`npm run lint` passes:** There are no linting errors in the codebase. The deploy script will fail if this check doesn't pass.
- [ ] **`npm run typecheck` passes:** The project has no TypeScript errors. The deploy script will fail if this check doesn't pass.

### Phase 3: Local Verification

- [ ] **`npm run build` succeeds locally:** You can successfully build the application for production on your local machine. This is a good indicator that the Vercel build will also succeed.
- [ ] **`npm run start` works locally:** After building, you can run the app in production mode locally and verify that it loads correctly.

### Phase 4: Deployment Execution

- [ ] **Vercel CLI Installed:** You have the Vercel CLI installed globally (`npm install -g vercel`).
- [ ] **Logged into Vercel:** You have run `vercel login` and are authenticated with the Vercel CLI.
- [ ] **Ready to Deploy:** You are ready to execute the final deployment script.

**Final Command:**
```bash
bash deploy.sh
```
