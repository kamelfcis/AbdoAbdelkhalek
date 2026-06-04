import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from '../shared/ui/Button';

describe('Vitest frontend setup', () => {
  it('renders a shared Button', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
