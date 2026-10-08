import ThemeSegmentedControl from '../../theme/components/ThemeSegmentedControl';

const ThemeTryOut = () => (
    <section className="bg-neutral text-neutral-content">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-16 grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))]">
            <div className="flex flex-col gap-4">
                <h2 className="m-0 font-serif text-3xl leading-tight">
                    Pick a pour that suits you
                </h2>
                <p className="m-0 max-w-[32rem] leading-[1.55] opacity-80">
                    Four themes ship with the app — a light lager, a dark roast stout, a berry
                    cassis and a bright weizen. Try one; this page switches with it.
                </p>
            </div>

            <div className="rounded-box border border-neutral-content/15 bg-base-100 p-4 text-base-content shadow-xl sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] opacity-60">
                            Set the mood
                        </p>
                        <p className="m-0 mt-1 text-sm opacity-75">Your theme follows your pour.</p>
                    </div>
                    <span className="badge badge-outline shrink-0">4 pours</span>
                </div>
                <ThemeSegmentedControl labels="short" />
            </div>
        </div>
    </section>
);

export default ThemeTryOut;
