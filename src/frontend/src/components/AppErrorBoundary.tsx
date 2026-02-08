import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught error:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
    });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-space-dark via-space-dark/95 to-space-dark p-4">
          <Card className="w-full max-w-md border-2 border-destructive/50 bg-space-card/90 p-6 shadow-[0_0_30px_oklch(0.55_0.25_30/0.3)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            </div>
            
            <p className="mb-4 text-sm text-muted-foreground">
              The application encountered an unexpected error. This has been logged for debugging.
            </p>

            {this.state.error && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3">
                <p className="text-xs font-mono text-destructive">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <Button
              onClick={this.handleReset}
              className="w-full bg-neon-cyan/20 hover:bg-neon-cyan/30 text-white border border-neon-cyan/50"
            >
              Reload Application
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
