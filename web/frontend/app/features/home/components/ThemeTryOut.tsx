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

            <div className="rounded-box bg-base-100 p-3 text-base-content">
                <ThemeSegmentedControl
                    labels="short"
                    className="join join-vertical w-full sm:join-horizontal"
                />
            </div>
        </div>
    </section>
);

export default ThemeTryOut;
