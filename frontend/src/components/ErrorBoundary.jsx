import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">The component couldn't be displayed.</p>
          <details className="text-sm">
            <summary>Error details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;