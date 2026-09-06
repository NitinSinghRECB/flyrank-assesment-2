import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SettingsForm from './SettingsForm';
import React from 'react';

describe('SettingsForm', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders all fields with correct defaults', () => {
    render(<SettingsForm />);
    
    expect(screen.getByLabelText('Display Name')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Bio')).toHaveValue('');
    expect(screen.getByLabelText('System')).toBeChecked();
    expect(screen.getByLabelText('Email Notifications')).toBeChecked();
  });

  it('shows error when Display Name is empty', async () => {
    render(<SettingsForm />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    
    expect(await screen.findByText('Display Name must be at least 2 characters')).toBeInTheDocument();
  });

  it('shows error when Display Name is too short', async () => {
    render(<SettingsForm />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    await user.type(screen.getByLabelText('Display Name'), 'A');
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    
    expect(await screen.findByText('Display Name must be at least 2 characters')).toBeInTheDocument();
  });

  it('shows error when Email is empty', async () => {
    render(<SettingsForm />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
  });

  it('shows error for invalid email', async () => {
    render(<SettingsForm />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    await user.type(screen.getByLabelText('Display Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'notanemail');
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    
    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('shows character counter for Bio', async () => {
    render(<SettingsForm />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    expect(screen.getByText('0/200')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Bio'), 'Hello');
    expect(screen.getByText('5/200')).toBeInTheDocument();
  });

  it('submit button shows Saving and is disabled during submission', async () => {
    render(<SettingsForm />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    await user.type(screen.getByLabelText('Display Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Settings' })).toBeEnabled();
    }, { timeout: 2000 });
  });

  it('calls onSave with cleaned data on valid submit', async () => {
    const onSave = vi.fn();
    render(<SettingsForm onSave={onSave} />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    await user.type(screen.getByLabelText('Display Name'), '  John Doe  ');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Bio'), 'Developer');
    await user.click(screen.getByLabelText('Dark'));
    await user.click(screen.getByLabelText('Email Notifications')); // uncheck
    
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        displayName: 'John Doe',
        email: 'john@example.com',
        bio: 'Developer',
        theme: 'dark',
        notifications: false,
      });
    }, { timeout: 2000 });
  });

  it('shows and auto-dismisses success banner', async () => {
    render(<SettingsForm />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    await user.type(screen.getByLabelText('Display Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    
    const banner = await screen.findByRole('status');
    expect(banner).toHaveTextContent('Settings saved!');
    
    vi.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
