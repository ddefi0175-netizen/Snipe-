import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://snipe-api.onrender.com/api';

/**
 * Custom hook to check API health status
 * Returns health status and provides manual refresh capability
 */
export function useAPIHealth(checkInterval = 0) {
    const [health, setHealth] = useState({
        status: 'checking',
        mongoConnected: false,
        timestamp: null,
        error: null,
        lastChecked: null
    });

    const checkHealth = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(`${API_BASE}/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setHealth({
                status: data.status || 'ok',
                mongoConnected: data.mongoConnected,
                timestamp: data.timestamp,
                error: null,
                lastChecked: new Date().toISOString()
            });
        } catch (error) {
            const isTimeout = error.name === 'AbortError';
            const isNetworkError = error.message.includes('Failed to fetch');

            setHealth(prev => ({
                ...prev,
                status: 'error',
                error: isTimeout
                    ? 'Server is waking up (cold start). Please wait...'
                    : isNetworkError
                        ? 'Cannot reach server. Check your connection.'
                        : error.message,
                lastChecked: new Date().toISOString()
            }));
        }
    }, []);

    useEffect(() => {
        checkHealth();

        if (checkInterval > 0) {
            const interval = setInterval(checkHealth, checkInterval);
            return () => clearInterval(interval);
        }
    }, [checkHealth, checkInterval]);

    return { ...health, refresh: checkHealth };
}

/**
 * API Status Banner Component
 * Shows connection status at the top of the page
 */
export function APIStatusBanner({ onDismiss }) {
    const { status, error, refresh } = useAPIHealth(30000); // Check every 30s
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || status === 'ok') return null;

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss?.();
    };

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 ${status === 'checking' ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {status === 'checking' ? (
                        <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )}
                    <span className="text-white text-sm font-medium">
                        {status === 'checking'
                            ? 'Connecting to server...'
                            : error || 'Server connection issue'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        className="text-white/80 hover:text-white text-sm underline"
                    >
                        Retry
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="text-white/80 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <svg className={`${sizes[size]} animate-spin text-purple-500`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {message && <span className="text-gray-400 text-sm">{message}</span>}
        </div>
    );
}

/**
 * Error Display Component
 * Shows user-friendly error messages with retry option
 */
export function ErrorDisplay({
    error,
    onRetry,
    title = 'Error Loading Data',
    showDetails = false
}) {
    const getErrorMessage = (err) => {
        if (typeof err === 'string') return err;

        const msg = err?.message || 'Unknown error';

        // User-friendly messages for common errors
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
            return 'Cannot connect to server. Please check your internet connection.';
        }
        if (msg.includes('timeout') || msg.includes('AbortError')) {
            return 'Server is taking too long to respond. It may be waking up from sleep mode.';
        }
        if (msg.includes('401') || msg.includes('Unauthorized')) {
            return 'Session expired. Please log in again.';
        }
        if (msg.includes('403') || msg.includes('Forbidden')) {
            return 'You do not have permission to access this resource.';
        }
        if (msg.includes('404')) {
            return 'The requested resource was not found.';
        }
        if (msg.includes('500')) {
            return 'Server error. Please try again later.';
        }

        return msg;
    };

    return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <h3 className="text-lg font-medium text-red-400 mb-2">{title}</h3>
            <p className="text-gray-400 mb-4">{getErrorMessage(error)}</p>

            {showDetails && error?.message && (
                <details className="text-left mb-4 bg-gray-900/50 rounded p-3">
                    <summary className="text-yellow-400 text-sm cursor-pointer">Technical Details</summary>
                    <pre className="mt-2 text-xs text-gray-500 overflow-auto">{error.message}</pre>
                </details>
            )}

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}

/**
 * Empty State Component
 */
export function EmptyState({
    icon,
    title,
    message,
    action
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon && (
                <div className="w-16 h-16 mb-4 bg-gray-700/50 rounded-full flex items-center justify-center text-gray-400">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
            {message && <p className="text-gray-500 mb-4 max-w-md">{message}</p>}
            {action}
        </div>
    );
}

export default { useAPIHealth, APIStatusBanner, LoadingSpinner, ErrorDisplay, EmptyState };
