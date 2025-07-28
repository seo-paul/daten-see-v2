import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateDashboardModal } from '../CreateDashboardModal';

describe('CreateDashboardModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<CreateDashboardModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Dashboard Name'), 'New Dashboard');
    await user.type(screen.getByLabelText('Beschreibung'), 'Test description');
    await user.click(screen.getByText('Dashboard erstellen'));

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      name: 'New Dashboard',
      description: 'Test description',
      isPublic: false,
    });
  });

  it('should not submit with empty name', async () => {
    const user = userEvent.setup();
    render(<CreateDashboardModal {...defaultProps} />);

    await user.click(screen.getByText('Dashboard erstellen'));
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});