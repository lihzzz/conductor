import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error): void {
    // Surface to terminal via BrowserWindow console-message hook in main process.
    console.error("[renderer] uncaught react error", error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
          <h2>Renderer Crash</h2>
          <p>{this.state.message || "Unknown render error."}</p>
          <p>See terminal logs for stack trace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
