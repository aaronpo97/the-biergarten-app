import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { expect, within } from 'storybook/test';
import AuthSplitLayout from './AuthSplitLayout';
import AuthSwitchPrompt from './AuthSwitchPrompt';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { loginSchema, registerSchema, type LoginSchema, type RegisterSchema } from '../schemas';

const authSplitLayoutDescription = `The shared split-screen shell behind /login and /register: a brand panel carrying the headline and a form panel that centers the page's own heading, form, and switch prompt. Both stories compose the real forms, so they show the production layout at any viewport.`;

const LoginPanel = () => {
    const form = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

    return (
        <div className="flex w-full max-w-[25rem] flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <h1 className="text-[2.125rem]">Sign in</h1>
                <p className="text-[var(--color-muted)]">Sign in to your Biergarten account</p>
            </div>

            <LoginForm
                onSubmit={form.handleSubmit(() => {})}
                formState={form.formState}
                register={form.register}
                submitting={false}
            />

            <AuthSwitchPrompt lead="New to Biergarten?" to="/register" label="Create an account" />
        </div>
    );
};

const RegisterPanel = () => {
    const form = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

    return (
        <div className="flex w-full max-w-[32.5rem] flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <h1 className="text-[2.125rem]">Create your account</h1>
                <p className="text-[var(--color-muted)]">Create your Biergarten account</p>
            </div>

            <RegisterForm
                onSubmit={form.handleSubmit(() => {})}
                formState={form.formState}
                register={form.register}
                submitting={false}
            />

            <AuthSwitchPrompt lead="Already have an account?" to="/login" label="Sign in" />
        </div>
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

export const Login: Story = {
    args: {
        headline: 'Good to see you again.',
        blurb: 'Sign in to pick up where you left off with our partner breweries.',
        children: <LoginPanel />,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    },
};

export const Register: Story = {
    args: {
        headline: 'Pull up a chair.',
        blurb: 'Create an account to explore partner breweries and their beers.',
        children: <RegisterPanel />,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByLabelText(/date of birth/i)).toBeInTheDocument();
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
