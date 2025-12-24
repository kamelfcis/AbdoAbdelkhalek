/**
 * Error Boundary Component for Lazy Loaded Components
 * Provides graceful error handling and fallback UI
 */
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[300px] bg-gray-50 rounded-lg">
          <div className="text-center px-4">
            <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h3>
            <p className="text-gray-600 mb-4">
              {this.props.fallbackMessage || 'We encountered an error loading this section. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-[#0074b7] text-white px-6 py-2 rounded-lg hover:bg-[#005a8a] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


