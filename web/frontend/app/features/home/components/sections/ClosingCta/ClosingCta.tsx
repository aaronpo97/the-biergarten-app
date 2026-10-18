import { Link } from 'react-router';

const ClosingCta = () => (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-5 py-20 text-center">
        <h2 className="m-0 font-serif text-[clamp(2rem,4vw,2.75rem)] leading-tight text-balance">
            Your next favourite brewery is on the list.
        </h2>

        <p className="m-0 text-lg leading-[1.55] text-[var(--color-muted)]">
            Create an account to save breweries and log the beers you try.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn btn-primary">
                Create an account
            </Link>
            <Link to="/login" className="btn btn-ghost">
                Sign in
            </Link>
        </div>
    </section>
);

export default ClosingCta;
