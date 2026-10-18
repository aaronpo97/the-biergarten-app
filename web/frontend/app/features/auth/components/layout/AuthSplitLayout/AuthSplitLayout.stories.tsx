import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import AuthCardHeading from '../AuthCardHeading/AuthCardHeading';
import AuthErrorAlert from '../../feedback/AuthErrorAlert/AuthErrorAlert';
import AuthSplitLayout from './AuthSplitLayout';
import AuthSwitchPrompt from '../AuthSwitchPrompt/AuthSwitchPrompt';
import LoginForm from '../../forms/LoginForm/LoginForm';
import RegisterForm from '../../forms/RegisterForm/RegisterForm';
import RegisterStepProgress from '../../forms/RegisterStepProgress/RegisterStepProgress';
import { useRegisterWizard } from '../../../hooks/useRegisterWizard';
import { loginSchema, type LoginSchema } from '../../../schemas';

const noop = () => undefined;

const authSplitLayoutDescription = `The shared split-screen shell behind /login and /register: a full-bleed bar photo carrying the hero headline, and a solid card holding the page's own heading, form, and switch prompt. The grid splits 6fr/5fr from 820px up and stacks hero over card below it. Both stories compose the real forms, so they show the production layout at any viewport.`;

const LoginPanel = ({ error }: { error?: string }) => {
    const form = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

    return (
        <>
            <AuthCardHeading title="Sign in" subtitle="Sign in to your Biergarten account" />

            {error ? <AuthErrorAlert message={error} /> : null}

            <LoginForm
                onSubmit={form.handleSubmit(noop)}
                formState={form.formState}
                register={form.register}
                submitting={false}
            />

            <AuthSwitchPrompt lead="New to Biergarten?" to="/register" label="Create an account" />
        </>
    );
};

const RegisterPanel = () => {
    const wizard = useRegisterWizard(noop);

    return (
        <>
            <RegisterStepProgress
                step={wizard.step}
                totalSteps={wizard.totalSteps}
                name={wizard.name}
            />

            <AuthCardHeading title={wizard.title} subtitle={wizard.subtitle} />

            <RegisterForm wizard={wizard} submitting={false} />

            <AuthSwitchPrompt lead="Already have an account?" to="/login" label="Sign in" />
        </>
    );
};

const meta = {
    title: 'Layout/AuthSplitLayout',
    component: AuthSplitLayout,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: authSplitLayoutDescription,
            },
        },
    },
} satisfies Meta<typeof AuthSplitLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const loginArgs = {
    headline: 'Good to see you again.',
    blurb: 'Sign in to pick up where you left off with our partner breweries.',
};

const registerArgs = {
    headline: 'Pull up a chair.',
    blurb: 'Create an account to explore partner breweries and their beers.',
};

export const Login: Story = {
    args: {
        ...loginArgs,
        children: <LoginPanel />,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    },
};

export const LoginWithServerError: Story = {
    args: {
        ...loginArgs,
        children: <LoginPanel error="Invalid username or password." />,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('alert')).toHaveTextContent('Invalid username or password.');
    },
};

export const Register: Story = {
    args: {
        ...registerArgs,
        children: <RegisterPanel />,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText(/step 1 of 3 · account/i)).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    },
};

export const RegisterFinalStep: Story = {
    args: Register.args,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByLabelText(/^username$/i), 'jane_doe');
        await userEvent.type(canvas.getByLabelText(/^email$/i), 'jane@example.com');
        await userEvent.click(canvas.getByRole('button', { name: /continue/i }));

        await userEvent.type(await canvas.findByLabelText(/first name/i), 'Jane');
        await userEvent.type(canvas.getByLabelText(/last name/i), 'Doe');
        await fireEvent.change(canvas.getByLabelText(/date of birth/i), {
            target: { value: '2000-01-15' },
        });
        await userEvent.click(canvas.getByRole('button', { name: /continue/i }));

        await expect(
            await canvas.findByRole('heading', { name: 'Secure your account' }),
        ).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    },
};

export const RegisterMobile: Story = {
    args: Register.args,
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
};
