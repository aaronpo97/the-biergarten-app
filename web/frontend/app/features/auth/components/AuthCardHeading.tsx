interface AuthCardHeadingProps {
    title: string;
    subtitle: string;
}

const AuthCardHeading = ({ title, subtitle }: AuthCardHeadingProps) => (
    <div className="flex flex-col gap-1.5">
        <h1 className="text-[1.875rem]">{title}</h1>
        <p className="text-[var(--color-muted)]">{subtitle}</p>
    </div>
);

export default AuthCardHeading;
