import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import AuthCardHeading from './AuthCardHeading';
import RegisterForm from './RegisterForm';
import RegisterStepProgress from './RegisterStepProgress';
import { useRegisterWizard } from '../hooks/useRegisterWizard';
import { type RegisterSchema } from '../schemas';

const registerFormDescription = `Renders the real \`RegisterForm\` driven by the real \`useRegisterWizard\` hook, so these stories exercise the production three-step flow: each step validates its own fields through \`registerSchema\` (zod) before the next one opens, entered values survive going back, and only the final step submits.`;

const RegisterFormHarness = () => {
    const [submitted, setSubmitted] = useState<RegisterSchema | null>(null);
    const wizard = useRegisterWizard(setSubmitted);

    return (
        <div className="flex w-full max-w-md flex-col gap-4 rounded-box bg-base-100 p-6 shadow-lg">
            <RegisterStepProgress
                step={wizard.step}
                totalSteps={wizard.totalSteps}
                name={wizard.name}
            />

            <AuthCardHeading title={wizard.title} subtitle={wizard.subtitle} />

            <RegisterForm wizard={wizard} submitting={false} />

            {submitted ? <p data-testid="submit-result">Registered {submitted.username}</p> : null}
        </div>
    );
};

const meta = {
    title: 'Forms/RegisterForm',
    component: RegisterFormHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: registerFormDescription,
            },
        },
    },
} satisfies Meta<typeof RegisterFormHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;

const adultDateOfBirth = '2000-01-15';

const underageDateOfBirth = () => {
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    return tenYearsAgo.toISOString().slice(0, 10);
};

const completeAccountStep = async (canvas: Canvas) => {
    await userEvent.type(canvas.getByLabelText(/^username$/i), 'jane_doe');
    await userEvent.type(canvas.getByLabelText(/^email$/i), 'jane@example.com');
    await userEvent.click(canvas.getByRole('button', { name: /continue/i }));
    await canvas.findByLabelText(/first name/i);
};

const completeDetailsStep = async (canvas: Canvas, dateOfBirth = adultDateOfBirth) => {
    await userEvent.type(canvas.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(canvas.getByLabelText(/last name/i), 'Doe');
    await fireEvent.change(canvas.getByLabelText(/date of birth/i), {
        target: { value: dateOfBirth },
    });
    await userEvent.click(canvas.getByRole('button', { name: /continue/i }));
};

export const Empty: Story = {};

export const BlocksAdvanceOnInvalidAccount: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /continue/i }));
        await expect(
            await canvas.findByText(/username must be at least 3 characters/i),
        ).toBeInTheDocument();
        await expect(canvas.getByText(/invalid email address/i)).toBeInTheDocument();
        await expect(canvas.getByText(/step 1 of 3/i)).toBeInTheDocument();
    },
};

export const ClearsFieldErrorOnEdit: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /continue/i }));
        await canvas.findByText(/username must be at least 3 characters/i);

        await userEvent.type(canvas.getByLabelText(/^username$/i), 'jane_doe');
        await expect(
            canvas.queryByText(/username must be at least 3 characters/i),
        ).not.toBeInTheDocument();
    },
};

export const AdvancesToPersonalDetails: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await completeAccountStep(canvas);
        await expect(canvas.getByRole('heading', { name: 'About you' })).toBeInTheDocument();
        await expect(canvas.getByText(/step 2 of 3 · personal details/i)).toBeInTheDocument();
    },
};

export const KeepsValuesWhenGoingBack: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await completeAccountStep(canvas);
        await userEvent.click(canvas.getByRole('button', { name: /back/i }));
        await expect(await canvas.findByLabelText(/^username$/i)).toHaveValue('jane_doe');
        await expect(canvas.getByLabelText(/^email$/i)).toHaveValue('jane@example.com');
    },
};

export const RejectsUnderageDateOfBirth: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await completeAccountStep(canvas);
        await completeDetailsStep(canvas, underageDateOfBirth());
        await expect(await canvas.findByText(/at least 19 years old/i)).toBeInTheDocument();
        await expect(canvas.getByText(/step 2 of 3/i)).toBeInTheDocument();
    },
};

export const RejectsMismatchedConfirmPassword: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await completeAccountStep(canvas);
        await completeDetailsStep(canvas);
        await userEvent.type(await canvas.findByLabelText('Password'), 'StrongPass1!');
        await userEvent.type(canvas.getByLabelText(/confirm password/i), 'Different1!');
        await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
        await expect(await canvas.findByText(/passwords must match/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const RevealsBothPasswords: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await completeAccountStep(canvas);
        await completeDetailsStep(canvas);
        await userEvent.click(await canvas.findByRole('button', { name: /show password/i }));
        await expect(canvas.getByLabelText('Password')).toHaveAttribute('type', 'text');
        await expect(canvas.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'text');
    },
};

export const AcceptsValidRegistration: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await completeAccountStep(canvas);
        await completeDetailsStep(canvas);
        await userEvent.type(await canvas.findByLabelText('Password'), 'StrongPass1!');
        await userEvent.type(canvas.getByLabelText(/confirm password/i), 'StrongPass1!');
        await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
        await expect(await canvas.findByTestId('submit-result')).toHaveTextContent('jane_doe');
    },
};
