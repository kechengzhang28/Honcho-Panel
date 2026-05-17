import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)]">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-6 w-6 text-[var(--color-destructive)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Something went wrong
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
