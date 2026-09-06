import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './SettingsForm.css';

export const settingsSchema = z.object({
  displayName: z.string()
    .trim()
    .min(2, 'Display Name must be at least 2 characters')
    .max(50, 'Display Name must be at most 50 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  bio: z.string()
    .max(200, 'Bio must be at most 200 characters')
    .optional()
    .or(z.literal('')),
  theme: z.enum(['light', 'dark', 'system']),
  notifications: z.boolean(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  onSave?: (data: SettingsFormData) => void | Promise<void>;
}

export default function SettingsForm({ onSave }: SettingsFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    shouldFocusError: true,
    defaultValues: {
      displayName: '',
      email: '',
      bio: '',
      theme: 'system',
      notifications: true,
    },
  });

  const watchedBio = watch('bio') || '';

  const onSubmit = async (data: SettingsFormData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (onSave) {
      await onSave(data);
    }
    setShowSuccess(true);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="settings-form-container">
      {showSuccess && <div role="status" className="success-banner">Settings saved!</div>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input 
            type="text" 
            id="displayName" 
            {...register('displayName')} 
            aria-describedby={errors.displayName ? "displayName-error" : undefined}
          />
          {errors.displayName && (
            <span role="alert" id="displayName-error" className="error-text">
              {errors.displayName.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            {...register('email')} 
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <span role="alert" id="email-error" className="error-text">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea 
            id="bio" 
            {...register('bio')} 
            aria-describedby={errors.bio ? "bio-error" : undefined}
          />
          <span className="char-counter">{watchedBio.length}/200</span>
          {errors.bio && (
            <span role="alert" id="bio-error" className="error-text">
              {errors.bio.message}
            </span>
          )}
        </div>

        <fieldset>
          <legend>Theme</legend>
          <label>
            <input type="radio" value="light" {...register('theme')} />
            Light
          </label>
          <label>
            <input type="radio" value="dark" {...register('theme')} />
            Dark
          </label>
          <label>
            <input type="radio" value="system" {...register('theme')} />
            System
          </label>
        </fieldset>
        {errors.theme && (
          <span role="alert" id="theme-error" className="error-text">
            {errors.theme.message}
          </span>
        )}

        <div className="form-group checkbox-group">
          <input type="checkbox" id="notifications" {...register('notifications')} />
          <label htmlFor="notifications">Email Notifications</label>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
