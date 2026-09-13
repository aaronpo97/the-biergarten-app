import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import ProfileTabs, { type ProfileTab } from './ProfileTabs';

const profileTabsDescription = `Activity / Following / Liked tab bar for the public profile page. Switching tabs is an instant swap with no transition, consistent with the design system's stance on tab bars.`;

const meta = {
    title: 'Users/ProfileTabs',
    component: ProfileTabs,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: profileTabsDescription,
            },
        },
    },
} satisfies Meta<typeof ProfileTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const panels = {
    activity: <p>Activity panel</p>,
    following: <p>Following panel</p>,
    liked: <p>Liked panel</p>,
};

const ControlledTabs = () => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('activity');
    return <ProfileTabs activeTab={activeTab} onChange={setActiveTab} panels={panels} />;
};

export const Default: Story = {
    args: { activeTab: 'activity', onChange: fn(), panels },
    render: () => <ControlledTabs />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const followingTab = canvas.getByRole('tab', { name: /following/i });
        await expect(followingTab).toHaveAttribute('aria-selected', 'false');
        await userEvent.click(followingTab);
        await expect(followingTab).toHaveAttribute('aria-selected', 'true');
        await expect(canvas.getByText('Following panel')).toBeInTheDocument();
    },
};
