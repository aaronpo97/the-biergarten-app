import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import type { DistanceUnit } from '../../../../utils/distance';
import RadiusUnitControls from './RadiusUnitControls';

const radiusUnitControlsDescription = `Search-radius slider and km/mi toggle for the nearby breweries section. The slider always works in kilometres (10 to 300 in steps of 10); the displayed distance follows the selected unit.`;

const RadiusUnitControlsHarness = ({
    initialRadiusKm,
    initialUnit,
}: {
    initialRadiusKm: number;
    initialUnit: DistanceUnit;
}) => {
    const [radiusKm, setRadiusKm] = useState(initialRadiusKm);
    const [unit, setUnit] = useState<DistanceUnit>(initialUnit);

    return (
        <div className="w-full max-w-md">
            <RadiusUnitControls
                radiusKm={radiusKm}
                unit={unit}
                onRadiusChange={(event) => setRadiusKm(Number(event.target.value))}
                onSelectKm={() => setUnit('km')}
                onSelectMi={() => setUnit('mi')}
            />
        </div>
    );
};

const meta = {
    title: 'Breweries/RadiusUnitControls',
    component: RadiusUnitControlsHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: radiusUnitControlsDescription,
            },
        },
    },
    args: {
        initialRadiusKm: 50,
        initialUnit: 'km',
    },
} satisfies Meta<typeof RadiusUnitControlsHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Kilometres: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('50 km')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'km' })).toHaveClass('btn-active');
    },
};

export const Miles: Story = {
    args: { initialUnit: 'mi' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('31 mi')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'mi' })).toHaveClass('btn-active');
    },
};

export const MinimumRadius: Story = {
    args: { initialRadiusKm: 10 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('slider')).toHaveValue('10');
    },
};

export const MaximumRadius: Story = {
    args: { initialRadiusKm: 300 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('slider')).toHaveValue('300');
    },
};

export const SwitchesUnitAndRadius: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'mi' }));
        await expect(canvas.getByText('31 mi')).toBeInTheDocument();
        fireEvent.change(canvas.getByRole('slider'), { target: { value: '100' } });
        await expect(canvas.getByText('62 mi')).toBeInTheDocument();
    },
};
