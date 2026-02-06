
# Onchainweb

Welcome to the Onchainweb project, a cutting-edge web3 trading platform. This document provides a comprehensive overview of the project, setup instructions, and key development guidelines.

## Quick Start

To get started with the project, follow these steps:

1. **Clone the repository**
2. **Install dependencies**: `cd Onchainweb && npm install`
3. **Set up environment variables**: Create a `.env` file in the `Onchainweb` directory and add the required Firebase and WalletConnect credentials.
4. **Run the development server**: `npm run dev`

For more detailed instructions, please refer to the `QUICK_START_GUIDE.md` document.

## AI Development Assistant

This project is supported by a new AI guidance system, designed to streamline development and ensure adherence to best practices. The AI assistant is programmed with our project's specific architectural patterns, including:

- **Firebase-first with `localStorage` fallback** for all data services.
- **Real-time data synchronization** using `onSnapshot` listeners instead of polling.
- **Standardized error handling** through the `formatApiError` utility.
- **Wallet integration** best practices for our 11 supported providers.

The AI can assist with a wide range of tasks, such as refactoring components, implementing new features, and answering questions about the codebase. All developers are encouraged to leverage the AI to accelerate their work and maintain code quality.

To learn more about the AI's capabilities and how to interact with it, please refer to the internal documentation provided by our team.

## Key Resources

- **Quick Start**: `QUICK_START_GUIDE.md`
- **Backend Architecture**: `BACKEND_REPLACEMENT.md`
- **Real-time Data**: `REALTIME_DATA_ARCHITECTURE.md`
- **Deployment**: `VERCEL_DEPLOYMENT_GUIDE.md`

By following these guidelines and leveraging the new AI assistant, we can ensure a consistent and high-quality development process.
