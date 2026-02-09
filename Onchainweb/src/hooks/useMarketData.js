
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCryptoData, fetchCryptoNews } from '../services/marketDataService';
import { getFallbackCryptoData, getFallbackCryptoNews } from '../utils/fallbackData';

/**
 * Custom hook to fetch and manage market data with efficient polling.
 * @param {object} options - Configuration options.
 * @param {number} options.refreshInterval - The interval in ms to refresh data.
 * @returns {object} The market data, loading state, and live status.
 */
export const useMarketData = ({ refreshInterval = 30000 } = {}) => {
    const [cryptoData, setCryptoData] = useState(() => getFallbackCryptoData());
    const [cryptoNews, setCryptoNews] = useState(() => getFallbackCryptoNews());
    const [loading, setLoading] = useState(false);
    const [isLiveData, setIsLiveData] = useState(false);
    const loadingRef = useRef(false);
    const intervalRef = useRef(null);

    const fetchData = useCallback(async () => {
        // Prevent multiple fetches at the same time using ref instead of state
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        try {
            const [coins, news] = await Promise.all([
                fetchCryptoData(),
                fetchCryptoNews(),
            ]);

            if (coins.length > 0) {
                setCryptoData(coins);
                setIsLiveData(true);
            }

            if (news.length > 0) {
                setCryptoNews(news.slice(0, 10));
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        const timer = setTimeout(fetchData, 100);

        // Set up polling with ref to track current interval
        intervalRef.current = setInterval(fetchData, refreshInterval);

        // Pause polling when the tab is not visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } else {
                fetchData(); // Refresh immediately when tab becomes visible
                // Clear any existing interval before creating a new one
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                intervalRef.current = setInterval(fetchData, refreshInterval);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearTimeout(timer);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchData, refreshInterval]);

    return { cryptoData, cryptoNews, loading, isLiveData };
};
