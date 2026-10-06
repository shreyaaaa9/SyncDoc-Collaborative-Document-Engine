import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorState from './ErrorState';
import StatusMessage from './StatusMessage';
import Loader from './Loader';
import ErrorBoundary from './ErrorBoundary';

describe('Loader', () => {
  it('shows the given text', () => {
    render(<Loader text="Loading documents..." />);
    expect(screen.getByText('Loading documents...')).toBeInTheDocument();
  });

  it('shows default text', () => {
    render(<Loader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('shows the message and calls retry / back', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onBack = vi.fn();
    render(<ErrorState message="Could not load" onRetry={onRetry} onBack={onBack} />);

    expect(screen.getByText('Could not load')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await user.click(screen.getByRole('button', { name: /Back to Dashboard/ }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('hides buttons when no handlers are given', () => {
    render(<ErrorState message="Oops" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('StatusMessage', () => {
  it('renders nothing when there is no message', () => {
    const { container } = render(<StatusMessage type="error" message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the message and a Retry button', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<StatusMessage type="error" message="Failed" onRetry={onRetry} />);

    expect(screen.getByText('Failed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorBoundary', () => {
  const Bomb = () => {
    throw new Error('boom');
  };

  it('shows a fallback UI when a child crashes', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders children when nothing crashes', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});