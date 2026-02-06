
import { formatApiError } from '../lib/errorHandling';

const CRYPTO_API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h';
const CRYPTO_NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular';

/**
 * Fetches cryptocurrency market data.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of coin data.
 */
export const fetchCryptoData = async () => {
    try {
        const response = await fetch(CRYPTO_API);
        if (!response.ok) {
            throw new Error(`CoinGecko API request failed with status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch crypto data:", formatApiError(error));
        // In case of an error, we can return an empty array or a cached version
        return [];
    }
};

/**
 * Fetches cryptocurrency news articles.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of news articles.
 */
export const fetchCryptoNews = async () => {
    try {
        const response = await fetch(CRYPTO_NEWS_API);
        if (!response.ok) {
            throw new Error(`CryptoCompare API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data.Data || [];
    } catch (error) {
        console.error("Failed to fetch crypto news:", formatApiError(error));
        return [];
    }
};
