import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from '../Input';

describe('Input Component', () => {
  it('should handle value changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    
    render(<Input onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should apply disabled state correctly', () => {
    render(<Input disabled placeholder="Disabled input" />);
    
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });
});