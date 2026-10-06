import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SaveStatus from './SaveStatus';

describe('SaveStatus', () => {
  it.each([
    ['saved', 'All changes saved'],
    ['unsaved', 'Unsaved changes'],
    ['saving', 'Saving...'],
    ['error', 'Save failed'],
  ])('shows the right label for %s', (status, label) => {
    render(<SaveStatus status={status} lastSavedAt={null} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});