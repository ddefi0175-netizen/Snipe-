
# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Onchainweb project to Vercel. Following these steps will ensure a smooth and successful deployment.

## 1. Prerequisites

- A Vercel account.
- The Onchainweb project repository pushed to a Git provider (GitHub, GitLab, Bitbucket).

## 2. Project Setup in Vercel

1.  **Import Project**: From your Vercel dashboard, click "Add New..." and select "Project".
2.  **Import Git Repository**: Select the Git repository where the Onchainweb project is hosted.
3.  **Configure Project**: Vercel will automatically detect that this is a Vite project. You will need to configure the build and output settings.

## 3. Build and Development Settings

When configuring your project, ensure the following settings are correct:

-   **Framework Preset**: `Vite`
-   **Build Command**: `npm run build`
-   **Output Directory**: `dist`
-   **Root Directory**: Set this to `Onchainweb` if your Vite project is in a subdirectory.

## 4. Environment Variables

This is the most critical step for a successful deployment. You must add the following environment variables in the project settings under "Environment Variables":

-   `VITE_FIREBASE_API_KEY`
-   `VITE_FIREBASE_AUTH_DOMAIN`
-   `VITE_FIREBASE_PROJECT_ID`
-   `VITE_FIREBASE_STORAGE_BUCKET`
-   `VITE_FIREBASE_MESSAGING_SENDER_ID`
-   `VITE_FIREBASE_APP_ID`
-   `VITE_FIREBASE_MEASUREMENT_ID`
-   `VITE_WALLETCONNECT_PROJECT_ID`

**Note**: The application will not function correctly without these variables. Ensure they are copied correctly from your `.env` file.

## 5. Deploy

Once you have configured the build settings and added the environment variables, click the **Deploy** button.

Vercel will now build and deploy your project. You can monitor the progress in the deployment logs.

## 6. Post-Deployment Verification

After the deployment is complete, Vercel will provide you with a live URL.

1.  **Visit the URL** to ensure the application loads correctly.
2.  **Check the browser console** for any errors related to Firebase or WalletConnect initialization.
3.  **Test the login and wallet connection** features to ensure the environment variables are working correctly.

By following this guide, you can ensure a consistent and reliable deployment process for the Onchainweb project.
