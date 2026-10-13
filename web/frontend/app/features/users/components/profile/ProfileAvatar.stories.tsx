import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ProfileAvatar from './ProfileAvatar';

const profileAvatarDescription = `Avatar shown at the top of the public profile sidebar. It renders the photo from the public profile payload's \`avatarUrl\`, and shows the first two letters of the display name when that field is empty or the image fails to load.`;

const meta = {
    title: 'Users/ProfileAvatar',
    component: ProfileAvatar,
    tags: ['autodocs'],
    args: {
        displayName: 'Maren Iverson',
        avatarUrl: 'https://picsum.photos/id/1027/240/240',
    },
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: profileAvatarDescription,
            },
        },
    },
} satisfies Meta<typeof ProfileAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPhoto: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const image = canvas.getByRole('img', { name: "Maren Iverson's avatar" });
        await expect(image).toHaveAttribute('src', 'https://picsum.photos/id/1027/240/240');
    },
};

export const WithoutPhoto: Story = {
    args: { avatarUrl: '' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('MA')).toBeInTheDocument();
        await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
    },
};

export const BrokenPhotoUrl: Story = {
    args: { avatarUrl: 'https://example.invalid/missing-avatar.jpg' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('MA')).toBeInTheDocument();
    },
};
