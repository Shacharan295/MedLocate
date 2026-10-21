import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MedLocate ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected interface issue occurred. You can return to the home page or reload the view.
              </p>
              {this.state.error?.message && (
                <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs font-mono text-slate-600 overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
