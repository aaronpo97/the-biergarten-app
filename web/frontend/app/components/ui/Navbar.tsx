import {
   Disclosure,
   DisclosureButton,
   DisclosurePanel,
   Menu,
   MenuButton,
   MenuItem,
   MenuItems,
} from '@headlessui/react';
import { Link } from 'react-router';

interface NavbarProps {
   auth: {
      username: string;
      accessToken: string;
      refreshToken: string;
      userAccountId: string;
   } | null;
}

const Navbar = ({ auth }: NavbarProps) => {
   const navLinks = [
      { to: '/theme', label: 'Theme' },
      { to: '/beers', label: 'Beers' },
      { to: '/breweries', label: 'Breweries' },
      { to: '/beer-styles', label: 'Beer Styles' },
   ];

   return (
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

                  <div className="navbar-center hidden lg:flex gap-2">
                     {navLinks.map((link) => (
                        <Link key={link.to} to={link.to} className="btn btn-ghost btn-sm">
                           {link.label}
                        </Link>
                     ))}
                  </div>

                  <div className="navbar-end gap-2">
                     {!auth && (
                        <Link to="/register" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                           Register User
                        </Link>
                     )}

                     {auth ? (
                        <>
                           <Link to="/dashboard" className="btn btn-primary btn-sm">
                              Dashboard
                           </Link>

                           <Menu as="div" className="relative">
                              <MenuButton className="btn btn-ghost btn-sm">
                                 {auth.username}
                              </MenuButton>
                              <MenuItems className="menu absolute right-0 z-60 mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl focus:outline-none">
                                 <MenuItem>
                                    {({ focus }) => (
                                       <Link to="/dashboard" className={focus ? 'active' : ''}>
                                          Dashboard
                                       </Link>
                                    )}
                                 </MenuItem>
                                 <MenuItem>
                                    {({ focus }) => (
                                       <Link to="/logout" className={focus ? 'active' : ''}>
                                          Logout
                                       </Link>
                                    )}
                                 </MenuItem>
                              </MenuItems>
                           </Menu>
                        </>
                     ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">
                           Login
                        </Link>
                     )}
                  </div>
               </div>

               <DisclosurePanel className="border-t border-base-300 bg-base-100 px-4 py-3 lg:hidden">
                  <div className="flex flex-col gap-2">
                     {navLinks.map((link) => (
                        <Link
                           key={link.to}
                           to={link.to}
                           className="btn btn-ghost btn-sm justify-start"
                        >
                           {link.label}
                        </Link>
                     ))}
                     {!auth && (
                        <Link to="/register" className="btn btn-ghost btn-sm justify-start">
                           Register User
                        </Link>
                     )}
                  </div>
               </DisclosurePanel>
            </>
         )}
      </Disclosure>
   );
};

export default Navbar;
