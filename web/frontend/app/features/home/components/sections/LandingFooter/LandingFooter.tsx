import { Link } from 'react-router';

const footerLinks = [
    { to: '/breweries', label: 'Breweries' },
    { to: '/beers', label: 'Beers' },
    { to: '/theme', label: 'Theme guide' },
];

interface LandingFooterProps {
    isAuthenticated: boolean;
}

const LandingFooter = ({ isAuthenticated }: LandingFooterProps) => (
    <div className="border-t border-base-300 bg-base-100">
        <footer className="footer footer-vertical sm:footer-horizontal mx-auto max-w-7xl items-center justify-between gap-4 px-5 py-6 text-sm text-[var(--color-muted)]">
            <aside>
                <span className="font-bold text-base-content">🍺 The Biergarten App</span>
            </aside>

            <nav className="flex flex-row flex-wrap gap-5">
                {footerLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="link link-hover hover:text-primary">
                        {link.label}
                    </Link>
                ))}
                {isAuthenticated ? (
                    <Link to="/dashboard" className="link link-hover hover:text-primary">
                        Dashboard
                    </Link>
                ) : (
                    <Link to="/login" className="link link-hover hover:text-primary">
                        Login
                    </Link>
                )}
            </nav>

            <p className="m-0">Please drink responsibly.</p>
        </footer>
    </div>
);

export default LandingFooter;
