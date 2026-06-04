import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from './Input';

describe('Input', () => {
  it('renders label and associates with input', () => {
    render(<Input label="Email" id="email-field" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Name" error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('marks required fields', () => {
    render(<Input label="Phone" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
