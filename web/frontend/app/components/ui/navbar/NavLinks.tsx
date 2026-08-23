import { Link } from 'react-router';

const navLinks = [
    { to: '/theme', label: 'Theme' },
    { to: '/beers', label: 'Beers' },
    { to: '/breweries', label: 'Breweries' },
    { to: '/beer-styles', label: 'Beer Styles' },
];

interface NavLinksProps {
    variant: 'desktop' | 'mobile';
    showRegister: boolean;
}

const NavLinks = ({ variant, showRegister }: NavLinksProps) => {
    if (variant === 'desktop') {
        return (
            <div className="navbar-center hidden lg:flex gap-2">
                {navLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="btn btn-ghost btn-sm">
                        {link.label}
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="btn btn-ghost btn-sm justify-start">
                    {link.label}
                </Link>
            ))}
            {showRegister && (
                <Link to="/register" className="btn btn-ghost btn-sm justify-start">
                    Register User
                </Link>
            )}
        </div>
    );
};

export default NavLinks;
