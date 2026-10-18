import { Bookmark, GlassHalf, MapPin } from 'iconoir-react';

const features = [
    {
        icon: MapPin,
        title: 'Browse breweries',
        body: 'Search the directory by name or city. Every listing shows location, hours and what is on tap.',
    },
    {
        icon: GlassHalf,
        title: 'Explore the beers',
        body: 'See each brewery’s full lineup with style, ABV and tasting notes from other members.',
    },
    {
        icon: Bookmark,
        title: 'Keep a record',
        body: 'Save the places you want to visit and check off the beers you have tried from your dashboard.',
    },
];

const FeatureHighlights = () => (
    <section className="border-y border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-16">
            <h2 className="m-0 max-w-[36rem] font-serif text-3xl leading-tight">
                Everything you need to plan the next round
            </h2>

            <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
                {features.map(({ icon: Icon, title, body }) => (
                    <div key={title} className="flex flex-col gap-3">
                        <div className="flex size-11 items-center justify-center rounded-field bg-[var(--color-highlight)] text-[var(--color-highlight-content)]">
                            <Icon width={20} height={20} aria-hidden />
                        </div>
                        <h3 className="m-0 font-serif text-xl">{title}</h3>
                        <p className="m-0 leading-[1.55] text-[var(--color-muted)]">{body}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default FeatureHighlights;
