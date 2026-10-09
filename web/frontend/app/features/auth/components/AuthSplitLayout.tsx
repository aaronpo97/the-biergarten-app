interface AuthSplitLayoutProps {
    headline: string;
    blurb: string;
    children: React.ReactNode;
}

const AuthSplitLayout = ({ headline, blurb, children }: AuthSplitLayoutProps) => (
    <div className="grid flex-1 grid-cols-1 bg-base-200 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <aside className="flex flex-col justify-end gap-5 bg-secondary px-5 py-7 text-secondary-content lg:px-14 lg:py-12">
            <h2 className="text-3xl leading-[1.15] text-balance lg:text-[2.75rem]">{headline}</h2>
            <p className="max-w-[23.75rem] text-base leading-relaxed lg:text-lg">{blurb}</p>
        </aside>

        <main className="flex items-start justify-center px-5 pt-7 pb-10 lg:items-center lg:px-6 lg:py-10">
            {children}
        </main>
    </div>
);

export default AuthSplitLayout;
