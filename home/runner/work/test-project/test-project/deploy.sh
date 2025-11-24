#!/bin/bash

# =================================================================
# Intuition BETs - One-Click Deployment Script for Vercel
# =================================================================
# This script automates the entire deployment process, from
# dependency installation to live deployment on Vercel.
#
# It is designed to be idempotent and fail fast.
# =================================================================

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions ---
print_step() {
  echo ""
  echo "🚀 Step: $1"
  echo "------------------------------------------------"
}

print_success() {
  echo "✅  $1"
}

print_error() {
  echo "❌ Error: $1"
  exit 1
}

# --- Main Deployment Logic ---

# 1. Install Dependencies
print_step "Installing project dependencies..."
npm install || print_error "Failed to install npm dependencies."
print_success "Dependencies installed."

# 2. Code Quality Checks
print_step "Running code quality checks..."
npm run lint || print_error "Linting failed. Please fix lint errors."
npm run typecheck || print_error "Type checking failed. Please fix TypeScript errors."
print_success "Code quality checks passed."

# 3. Deploy Smart Contracts
print_step "Deploying smart contracts..."
# Run the deployment script and capture the output.
# The `deploy.js` script is designed to print ONLY the contract addresses on its last lines.
DEPLOY_OUTPUT=$(npm run deploy:contracts)
BETTING_CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep 'NEXT_PUBLIC_INTUITION_BETTING_ADDRESS' | cut -d'=' -f2)
PROFILE_CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep 'NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS' | cut -d'=' -f2)

# Validate that we got reasonable-looking addresses
if [[ ! "$BETTING_CONTRACT_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
  echo "Full deployment output:"
  echo "$DEPLOY_OUTPUT"
  print_error "Failed to extract a valid betting contract address from deployment script. Aborting."
fi

if [[ ! "$PROFILE_CONTRACT_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
  echo "Full deployment output:"
  echo "$DEPLOY_OUTPUT"
  print_error "Failed to extract a valid profile contract address from deployment script. Aborting."
fi

print_success "Smart contracts deployed successfully."
echo "   New Betting Contract Address: $BETTING_CONTRACT_ADDRESS"
echo "   New Profile Contract Address: $PROFILE_CONTRACT_ADDRESS"


# 4. Update local .env file
print_step "Updating local .env file..."
if [ -f .env ]; then
    # Use awk to preserve comments and formatting
    awk -v addr="$BETTING_CONTRACT_ADDRESS" 'BEGIN{FS=OFS="="} $1=="NEXT_PUBLIC_INTUITION_BETTING_ADDRESS" {$2=addr} 1' .env > .env.tmp && mv .env.tmp .env
    awk -v addr="$PROFILE_CONTRACT_ADDRESS" 'BEGIN{FS=OFS="="} $1=="NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS" {$2=addr} 1' .env > .env.tmp && mv .env.tmp .env
    print_success ".env file updated with new contract addresses."
else
    echo "NEXT_PUBLIC_INTUITION_BETTING_ADDRESS=$BETTING_CONTRACT_ADDRESS" >> .env
    echo "NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS=$PROFILE_CONTRACT_ADDRESS" >> .env
    print_success "Created .env file with new contract addresses."
fi


# 5. Build the Application for Production
print_step "Building the Next.js application for production..."
npm run build || print_error "Next.js build failed."
print_success "Application built successfully."


# 6. Final Vercel Deployment with updated environment variables
print_step "Deploying to Vercel for production..."
echo "Using Betting Contract: $BETTING_CONTRACT_ADDRESS"
echo "Using Profile Contract: $PROFILE_CONTRACT_ADDRESS"

# This command assumes you have the Vercel CLI installed and are logged in.
# It will deploy the contents of the .next directory to production.
# The `--env` flags set the environment variables for THIS deployment only.
# You MUST also set this in the Vercel dashboard for future deployments.
npx vercel --prod \
  --env NEXT_PUBLIC_INTUITION_BETTING_ADDRESS=$BETTING_CONTRACT_ADDRESS \
  --env NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS=$PROFILE_CONTRACT_ADDRESS \
  || print_error "Vercel deployment failed."


# Final Success Message & Action Required
echo ""
echo "===================================================================="
echo "   🎉  Deployment to Vercel Complete!  🎉"
echo "===================================================================="
echo "Your application is now live."
echo ""
echo "🛑 FINAL ACTION REQUIRED:"
echo "You must now update your Vercel project's Environment Variables."
echo "Set the following variables in your Vercel dashboard:"
echo ""
echo "   NEXT_PUBLIC_INTUITION_BETTING_ADDRESS=$BETTING_CONTRACT_ADDRESS"
echo "   NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS=$PROFILE_CONTRACT_ADDRESS"
echo ""
echo "This ensures future automatic deployments from Git will work correctly."
echo "===================================================================="
echo ""
