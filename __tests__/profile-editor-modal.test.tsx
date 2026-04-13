import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileEditorModal } from '@/components/modals/profile-editor-modal';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'vault.edit.title': 'Edit your profile',
      'vault.edit.sub': 'Shows up in leaderboards, terminal, and your vault.',
      'vault.edit.avatar': 'Avatar',
      'vault.edit.name': 'Display name',
      'vault.edit.nameHint': 'Max 20 chars.',
      'vault.edit.initials': 'Initials',
      'vault.edit.handle': 'Handle',
      'vault.edit.bio': 'Bio',
      'vault.edit.bioPh': 'One line about how you trade',
      'vault.edit.twitter': 'Twitter / X',
      'vault.edit.discord': 'Discord',
      'vault.edit.cancel': 'Cancel',
      'vault.edit.save': 'Save Profile',
    };
    return map[key] ?? key;
  },
}));

vi.mock('@/lib/state/use-profile-store', () => ({
  useProfileStore: () => ({
    profile: {
      displayName: 'Clutch',
      handle: 'clutch.novex',
      bio: 'Test bio',
      avatarBg: 'cyan-purple',
      avatarInitials: 'CL',
    },
    setProfile: vi.fn(),
  }),
}));

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ displayName: 'Clutch', handle: 'clutch.novex', bio: 'Test bio', avatarBg: 'cyan-purple', avatarInitials: 'CL' }),
});

describe('ProfileEditorModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<ProfileEditorModal open={false} onClose={onClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title when open', () => {
    render(<ProfileEditorModal open={true} onClose={onClose} />);
    expect(screen.getByText('Edit your profile')).toBeInTheDocument();
  });

  it('shows Cancel and Save buttons', () => {
    render(<ProfileEditorModal open={true} onClose={onClose} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Profile')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<ProfileEditorModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('populates display name from profile', () => {
    render(<ProfileEditorModal open={true} onClose={onClose} />);
    const input = screen.getByDisplayValue('Clutch');
    expect(input).toBeInTheDocument();
  });
});
