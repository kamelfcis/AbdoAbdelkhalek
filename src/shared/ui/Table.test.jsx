import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Table from './Table';

describe('Table', () => {
  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role' },
  ];

  it('renders rows from data', () => {
    render(
      <Table
        columns={columns}
        data={[
          { id: '1', name: 'Alice', role: 'Coach' },
          { id: '2', name: 'Bob', role: 'Trainee' },
        ]}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('invokes onSort for sortable columns', async () => {
    const onSort = vi.fn();
    render(
      <Table
        columns={columns}
        data={[{ id: '1', name: 'A', role: 'X' }]}
        onSort={onSort}
      />
    );
    await userEvent.click(screen.getByText('Name'));
    expect(onSort).toHaveBeenCalledWith('name');
  });
});
