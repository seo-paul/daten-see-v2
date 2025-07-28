import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { DashboardListItem } from '@/types/dashboard.types';

import { EditDashboardModal } from '../EditDashboardModal';

describe('EditDashboardModal', () => {
  const mockDashboard: DashboardListItem = {
    id: '1',
    name: 'Test Dashboard',
    description: 'Test description',
    isPublic: false,
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    widgetCount: 0,
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    dashboard: mockDashboard,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit form with updated data', async () => {
    const user = userEvent.setup();
    render(<EditDashboardModal {...defaultProps} />);

    const nameInput = screen.getByDisplayValue('Test Dashboard');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Dashboard');
    
    await user.click(screen.getByText('Änderungen speichern'));

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      name: 'Updated Dashboard',
      description: 'Test description',
      isPublic: false,
    });
  });

  it('should handle validation errors', async () => {
    const user = userEvent.setup();
    render(<EditDashboardModal {...defaultProps} />);

    const nameInput = screen.getByDisplayValue('Test Dashboard');
    await user.clear(nameInput);
    await user.click(screen.getByText('Änderungen speichern'));

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});