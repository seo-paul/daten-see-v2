import { render, screen, fireEvent } from '@testing-library/react';

import { Button } from '../Button';

describe('Button Component', () => {
  it('should handle click events', () => {
    const mockClick = jest.fn();
    render(<Button onClick={mockClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should handle disabled state', () => {
    const mockClick = jest.fn();
    render(<Button disabled onClick={mockClick}>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(mockClick).not.toHaveBeenCalled();
  });
});