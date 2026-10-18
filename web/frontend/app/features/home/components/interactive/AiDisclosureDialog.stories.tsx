import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import AiDisclosureDialog from './AiDisclosureDialog';

const aiDisclosureDescription = `Tells visitors that the catalogue is AI-generated fixture data before they engage with it, as the pipeline ethics documentation requires. It opens on every full page load and closes for the rest of that load once acknowledged.`;

const meta = {
    title: 'Disclosure/AiDisclosureDialog',
    component: AiDisclosureDialog,
    tags: ['autodocs'],
    args: {
        defaultOpen: true,
    },
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: aiDisclosureDescription,
            },
        },
    },
} satisfies Meta<typeof AiDisclosureDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitFor(async () => {
            await expect(
                canvas.getByRole('heading', { name: /this content is ai-generated/i }),
            ).toBeVisible();
        });
        await expect(
            canvas.getByRole('link', { name: /how this data was generated/i }),
        ).toBeVisible();
    },
};

export const Acknowledged: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /i understand/i }));
        await expect(
            canvas.queryByRole('heading', { name: /this content is ai-generated/i }),
        ).toBeNull();
    },
};

export const InitiallyDismissed: Story = {
    args: {
        defaultOpen: false,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.queryByRole('heading', { name: /this content is ai-generated/i }),
        ).toBeNull();
    },
};
