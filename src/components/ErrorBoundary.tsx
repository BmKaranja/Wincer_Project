import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message || 'Something went wrong.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(JSON.stringify({
      level: 'error',
      source: 'ErrorBoundary',
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center p-8 bg-background text-secondary">
          <div className="max-w-xl rounded-3xl border border-secondary/10 bg-surface p-10 shadow-2xl text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Something went wrong</h1>
            <p className="mb-6 text-secondary/80">We hit an unexpected problem while loading the page. Refresh the browser or try again in a few minutes.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-sm font-bold text-white hover:bg-secondary/90"
            >
              Reload page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
