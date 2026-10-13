import barBackground from '../../../assets/bar-background.jpg';

interface AuthSplitLayoutProps {
    headline: string;
    blurb: string;
    children: React.ReactNode;
}

const AuthSplitLayout = ({ headline, blurb, children }: AuthSplitLayoutProps) => (
    <div className="relative flex flex-1 bg-base-200">
        <div
            className="absolute inset-0 bg-base-300 bg-cover bg-center"
            style={{ backgroundImage: `url(${barBackground})` }}
        />

        {/* Darkens the photo from the bottom up so the white hero text stays legible */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#000000b3_30%,#ffffff44_100%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 content-between gap-6 min-[820px]:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            <section className="flex flex-col justify-end gap-4 px-5 pt-8 pb-2 text-white min-[820px]:px-10 min-[820px]:py-14">
                <h2 className="text-[2rem] leading-[1.1] text-balance [text-shadow:0_2px_24px_#0006] min-[820px]:text-[3.25rem]">
                    {headline}
                </h2>

                <p className="max-w-[27.5rem] text-base leading-[1.5] min-[820px]:text-[1.1875rem]">
                    {blurb}
                </p>
            </section>

            <main className="flex items-center justify-center px-4 pt-4 pb-7 min-[820px]:py-10 min-[820px]:pr-10 min-[820px]:pl-0">
                <div className="flex w-full max-w-[27.5rem] flex-col gap-4 rounded-box bg-base-100 px-5 py-6 shadow-[0_20px_50px_#0005] min-[820px]:p-8">
                    {children}
                </div>
            </main>
        </div>
    </div>
);

export default AuthSplitLayout;
