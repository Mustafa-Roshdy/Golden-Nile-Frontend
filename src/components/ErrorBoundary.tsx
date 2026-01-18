import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Standard Error Boundary component to catch utility errors in the chat.
 */
interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-red-600 font-semibold">An error occurred in the chat</h2>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
