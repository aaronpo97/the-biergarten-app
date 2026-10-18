import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import ShowPasswordToggle from './ShowPasswordToggle';

const showPasswordToggleDescription = `Text button under password fields that reveals or hides the typed password. Its label always names the action it will perform.`;

const ShowPasswordToggleHarness = ({ initialShown }: { initialShown: boolean }) => {
    const [shown, setShown] = useState(initialShown);

    return <ShowPasswordToggle shown={shown} onToggle={() => setShown((value) => !value)} />;
};

const meta = {
    title: 'Auth/ShowPasswordToggle',
    component: ShowPasswordToggleHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: showPasswordToggleDescription,
            },
        },
    },
    args: {
        initialShown: false,
    },
} satisfies Meta<typeof ShowPasswordToggleHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
    },
};

export const Shown: Story = {
    args: { initialShown: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
    },
};

export const TogglesLabel: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));
        await expect(canvas.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'Hide password' }));
        await expect(canvas.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
    },
};
