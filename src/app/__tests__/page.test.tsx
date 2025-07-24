import { render, screen } from '@testing-library/react';

import { TestQueryWrapper } from '@/lib/testing';

import Home from '../page';

// Mock Next.js modules
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: any): React.ReactElement {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(
      <TestQueryWrapper>
        <Home />
      </TestQueryWrapper>
    );
    
    // Check if main content is rendered
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('contains expected content structure', () => {
    render(
      <TestQueryWrapper>
        <Home />
      </TestQueryWrapper>
    );
    
    // Check for heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    const { container } = render(
      <TestQueryWrapper>
        <Home />
      </TestQueryWrapper>
    );
    
    // Check for main landmark
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    
    // Check for proper heading hierarchy
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
  });
});