import { redirect, useNavigation, useSubmit } from 'react-router';
import { z } from 'zod';
import { createAuthSession, getOptionalAuth, register } from '../auth.server';
import AuthCardHeading from '../components/AuthCardHeading';
import AuthErrorAlert from '../components/AuthErrorAlert';
import AuthSplitLayout from '../components/AuthSplitLayout';
import AuthSwitchPrompt from '../components/AuthSwitchPrompt';
import RegisterForm from '../components/RegisterForm';
import RegisterStepProgress from '../components/RegisterStepProgress';
import { useActionErrorToast } from '../hooks/useActionErrorToast';
import { useRegisterWizard } from '../hooks/useRegisterWizard';
import { registerSchema } from '../schemas';
import type { Route } from './+types/register';

export const meta = ({}: Route.MetaArgs) => {
    return [
        { title: 'Register | The Biergarten App' },
        {
            name: 'description',
            content:
                'Create a Biergarten account to rate breweries, track the beers you have tried, and join the community.',
        },
    ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const auth = await getOptionalAuth(request);
    if (auth) throw redirect('/dashboard');
    return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const result = registerSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { error: null, fieldErrors: z.flattenError(result.error).fieldErrors };
    }

    try {
        const { confirmPassword: _confirmPassword, ...body } = result.data;
        const payload = await register(body);
        return createAuthSession(payload, '/dashboard');
    } catch (err) {
        return {
            error: err instanceof Error ? err.message : 'Registration failed.',
            fieldErrors: null,
        };
    }
};

const Register = ({ actionData }: Route.ComponentProps) => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const isSubmitting = navigation.state === 'submitting';

    const wizard = useRegisterWizard((data) => {
        submit(data, { method: 'post' });
    });

    // A request that reached the action without passing client validation, so the
    // rejected fields may well sit on a step other than the one on screen.
    const rejectedFields = Object.values(actionData?.fieldErrors ?? {}).flatMap(
        (messages) => messages ?? [],
    );

    useActionErrorToast(actionData?.error);

    return (
        <AuthSplitLayout
            headline="Pull up a chair."
            blurb="Create an account to explore partner breweries and their beers."
        >
            <RegisterStepProgress
                step={wizard.step}
                totalSteps={wizard.totalSteps}
                name={wizard.name}
            />

            <AuthCardHeading title={wizard.title} subtitle={wizard.subtitle} />

            {actionData?.error && <AuthErrorAlert message={actionData.error} />}

            {rejectedFields.length > 0 && (
                <AuthErrorAlert
                    message="Check these details before creating your account."
                    details={rejectedFields}
                />
            )}

            <RegisterForm wizard={wizard} submitting={isSubmitting} />

            <AuthSwitchPrompt lead="Already have an account?" to="/login" label="Sign in" />
        </AuthSplitLayout>
    );
};

export default Register;
