interface RegisterStepProgressProps {
    step: number;
    totalSteps: number;
    name: string;
}

const RegisterStepProgress = ({ step, totalSteps, name }: RegisterStepProgressProps) => (
    <div className="flex flex-col gap-2">
        <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: totalSteps }, (_, index) => (
                <div
                    key={index}
                    className={`h-1 flex-1 rounded ${index < step ? 'bg-primary' : 'bg-base-300'}`}
                />
            ))}
        </div>

        <p className="text-[0.8125rem] font-semibold text-[var(--color-muted)]">
            Step {step} of {totalSteps} · {name}
        </p>
    </div>
);

export default RegisterStepProgress;
