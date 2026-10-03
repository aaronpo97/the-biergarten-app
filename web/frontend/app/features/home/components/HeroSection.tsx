import { Link } from 'react-router';
import barBackground from '../assets/bar-background.jpg';

const HeroSection = () => (
    <section className="mx-auto max-w-7xl px-5 pt-18 pb-16">
        <div className="grid items-center gap-12 grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))]">
            <div className="flex flex-col gap-6">
                <p className="m-0 text-sm font-semibold uppercase tracking-widest text-[var(--color-muted)]">
                    Brewery discovery
                </p>

                <h1 className="m-0 font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.08] text-balance">
                    Find the breweries worth the trip.
                </h1>

                <p className="m-0 max-w-[34rem] text-lg leading-[1.55] text-[var(--color-muted)]">
                    Browse our partner breweries, see what they pour, and keep track of the beers
                    you have tried — all in one account.
                </p>

                <div className="flex flex-wrap gap-3">
                    <Link to="/register" className="btn btn-primary">
                        Create an account
                    </Link>
                    <Link to="/breweries" className="btn btn-outline">
                        Browse breweries
                    </Link>
                </div>

                <p className="m-0 text-sm text-[var(--color-muted)]">
                    Free to join. Must be 19 years or older.
                </p>
            </div>

            <img
                src={barBackground}
                alt="A glass of lager on a bar counter"
                className="w-full max-h-[34rem] aspect-[4/5] rounded-box bg-base-300 object-cover shadow-xl"
            />
        </div>
    </section>
);

export default HeroSection;
