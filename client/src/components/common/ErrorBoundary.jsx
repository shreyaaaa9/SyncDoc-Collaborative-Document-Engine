import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('UI crash:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="state-box state-box--error" role="alert">
          <h3>Something went wrong</h3>
          <p>An unexpected error occurred on this page.</p>
          <div className="state-box__actions">
            <button type="button" onClick={this.handleReset}>Try again</button>
            <button type="button" onClick={() => window.location.reload()}>Reload page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;