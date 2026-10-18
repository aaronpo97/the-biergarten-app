import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import HeroSection from './HeroSection';

const heroSectionDescription = `Landing page hero: eyebrow, headline, supporting copy, the primary sign-up pair and the bar photo.`;

const meta = {
    title: 'Home/HeroSection',
    component: HeroSection,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: heroSectionDescription,
            },
        },
    },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            canvas.getByRole('heading', { name: 'Find the breweries worth the trip.' }),
        ).toBeInTheDocument();

        await expect(canvas.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
            'href',
            '/register',
        );
        await expect(canvas.getByRole('link', { name: 'Browse breweries' })).toHaveAttribute(
            'href',
            '/breweries',
        );
    },
};
