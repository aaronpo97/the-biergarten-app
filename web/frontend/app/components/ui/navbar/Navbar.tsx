import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Link } from 'react-router';
import NavLinks from './NavLinks';
import UserMenu from './UserMenu';

interface NavbarProps {
    auth: {
        username: string;
        accessToken: string;
        refreshToken: string;
        userAccountId: string;
    } | null;
}

const Navbar = ({ auth }: NavbarProps) => (
    <Disclosure
        as="nav"
        className="sticky top-0 z-50 border-b border-base-300 bg-base-100 shadow-md"
    >
        {({ open }) => (
            <>
                <div className="navbar mx-auto max-w-7xl px-2 sm:px-4">
                    <div className="navbar-start gap-2">
                        <DisclosureButton
                            className="btn btn-ghost btn-square lg:hidden"
                            aria-label="Toggle navigation"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="h-5 w-5 stroke-current"
                            >
                                {open ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </DisclosureButton>

                        <Link to="/" className="text-xl font-bold">
                            🍺 The Biergarten App
                        </Link>
                    </div>

                    <NavLinks variant="desktop" showRegister={!auth} />

                    <div className="navbar-end gap-2">
                        {!auth && (
                            <Link
                                to="/register"
                                className="btn btn-ghost btn-sm hidden sm:inline-flex"
                            >
                                Register User
                            </Link>
                        )}

                        {auth ? (
                            <>
                                <Link to="/dashboard" className="btn btn-primary btn-sm">
                                    Dashboard
                                </Link>

                                <UserMenu username={auth.username} />
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                <DisclosurePanel className="border-t border-base-300 bg-base-100 px-4 py-3 lg:hidden">
                    <NavLinks variant="mobile" showRegister={!auth} />
                </DisclosurePanel>
            </>
        )}
    </Disclosure>
);

export default Navbar;
