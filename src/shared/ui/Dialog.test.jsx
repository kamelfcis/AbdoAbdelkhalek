import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dialog from './Dialog';

describe('Dialog', () => {
  it('renders title and content when open', () => {
    render(
      <Dialog isOpen onClose={vi.fn()} title="Confirm">
        <p>Body text</p>
      </Dialog>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Dialog isOpen={false} onClose={vi.fn()} title="Hidden">
        Hidden
      </Dialog>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has aria-labelledby when title is provided', () => {
    render(
      <Dialog isOpen onClose={vi.fn()} title="Accessible title">
        Content
      </Dialog>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(screen.getByText('Accessible title')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen onClose={onClose} title="Close me">
        Content
      </Dialog>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
