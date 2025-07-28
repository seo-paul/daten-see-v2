/**
 * DashboardCard Component Tests - Streamlined
 * Testing core dashboard card functionality only
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { DashboardListItem } from '@/types/dashboard.types';

import { DashboardCard } from '../DashboardCard';

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const mockDashboard: DashboardListItem = {
  id: 'dashboard-1',
  name: 'Analytics Dashboard',
  description: 'Key metrics and performance indicators',
  isPublic: false,
  updatedAt: new Date('2024-01-15T10:30:00Z'),
  widgetCount: 5,
};

describe('DashboardCard Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard information correctly', () => {
    render(
      <DashboardCard 
        dashboard={mockDashboard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Key metrics and performance indicators')).toBeInTheDocument();
    expect(screen.getByText('5 Widgets')).toBeInTheDocument();
    expect(screen.getByText('Privat')).toBeInTheDocument();
  });

  it('should have clickable title link', () => {
    render(
      <DashboardCard 
        dashboard={mockDashboard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const titleLink = screen.getByText('Analytics Dashboard').closest('a');
    expect(titleLink).toHaveAttribute('href', '/dashboard/dashboard-1');
  });

  it('should call onEdit when edit action is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DashboardCard 
        dashboard={mockDashboard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Bearbeiten'));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockDashboard);
  });

  it('should call onDelete when delete action is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DashboardCard 
        dashboard={mockDashboard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Löschen'));
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockDashboard.id);
  });

  it('should display public status correctly', () => {
    const publicDashboard = { ...mockDashboard, isPublic: true };
    render(
      <DashboardCard 
        dashboard={publicDashboard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Öffentlich')).toBeInTheDocument();
  });

  it('should show actions menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DashboardCard 
        dashboard={mockDashboard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Bearbeiten')).toBeInTheDocument();
    expect(screen.getByText('Löschen')).toBeInTheDocument();
  });
});