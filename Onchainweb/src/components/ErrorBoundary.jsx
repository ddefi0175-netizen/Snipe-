// React automatic JSX runtime in use — default import not required
import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree and displays fallback UI
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
        this.handleRetry = this.handleRetry.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleClearAndRefresh = this.handleClearAndRefresh.bind(this);
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console (could also send to error tracking service)
        console.error('Error Boundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        // Could send to error tracking service here
        // errorTrackingService.log({ error, errorInfo });
    }

    handleRetry() {
        this.setState({ hasError: false, error: null, errorInfo: null });
    }

    handleRefresh() {
        window.location.reload();
    }

    handleClearAndRefresh() {
        // Clear local storage and session storage
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
                    <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full text-center border border-red-500/30">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h2>
                        <p className="text-gray-400 mb-6">
                            An unexpected error occurred. This could be due to a network issue,
                            server timeout, or application error.
                        </p>

                        {/* Error details (collapsed by default) */}
                        {this.state.error && (
                            <details className="text-left mb-6 bg-gray-900/50 rounded-lg p-4">
                                <summary className="text-yellow-400 cursor-pointer text-sm">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 text-xs text-gray-400 overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Try Again
                            </button>

                            <button
                                onClick={this.handleRefresh}
                                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Refresh Page
                            </button>

                            <button
                                onClick={this.handleClearAndRefresh}
                                className="w-full px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-sm transition-colors"
                            >
                                Clear Cache & Refresh
                            </button>
                        </div>

                        {/* Tips */}
                        <div className="mt-6 text-left bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
                            <h4 className="text-blue-400 text-sm font-medium mb-2">Troubleshooting Tips:</h4>
                            <ul className="text-gray-400 text-xs space-y-1">
                                <li>• Try hard refresh: <kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+R</kbd></li>
                                <li>• Check your internet connection</li>
                                <li>• The server may be waking up (try again in 30s)</li>
                                <li>• Clear browser cache if issues persist</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
