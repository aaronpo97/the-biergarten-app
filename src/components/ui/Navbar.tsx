import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import useNavbar from '@/hooks/utilities/useNavbar';
import useTheme from '@/hooks/utilities/useTheme';

import Link from 'next/link';
import { FC } from 'react';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { GiHamburgerMenu } from 'react-icons/gi';

const DesktopLinks: FC = () => {
  const { pages, currentURL } = useNavbar();

  return (
    <div className="block flex-none">
      <ul className="menu menu-horizontal menu-sm">
        {pages.map((page) => {
          return (
            <li key={page.slug}>
              <Link tabIndex={0} href={page.slug} className="hover:bg-primary-focus">
                <span
                  className={`text-lg uppercase ${
                    currentURL === page.slug ? 'font-black' : 'font-medium'
                  } text-primary-content`}
                >
                  {page.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const MobileLinks: FC = () => {
  const { pages } = useNavbar();
  return (
    <div className="flex-none lg:hidden">
      <div className="dropdown-end dropdown">
        <label tabIndex={0} className="btn btn-circle btn-ghost">
          <GiHamburgerMenu />
        </label>
        <ul
          tabIndex={0}
          className="menu-compact menu dropdown-content rounded-box mt-3 w-48 bg-base-100 p-2 shadow"
        >
          {pages.map((page) => (
            <li key={page.slug}>
              <Link href={page.slug}>
                <span className="select-none text-primary-content">{page.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Navbar = () => {
  const isDesktopView = useMediaQuery('(min-width: 1024px)');

  const { theme, setTheme } = useTheme();

  return (
    <div className="navbar sticky top-0 z-50 bg-primary text-primary-content">
      <div className="flex-1">
        <Link className="btn btn-ghost normal-case" href="/">
          <span className="cursor-pointer text-lg font-bold">The Biergarten App</span>
        </Link>
      </div>

      <div
        className="tooltip tooltip-left"
        data-tip={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <div>
          {theme === 'light' ? (
            <button
              className="btn btn-circle btn-ghost btn-md"
              data-set-theme="dark"
              data-act-class="ACTIVECLASS"
              onClick={() => setTheme('dark')}
            >
              <MdLightMode className="text-xl" />
            </button>
          ) : (
            <button
              className="btn btn-circle btn-ghost btn-md"
              data-set-theme="light"
              data-act-class="ACTIVECLASS"
              onClick={() => setTheme('light')}
            >
              <MdDarkMode className="text-xl" />
            </button>
          )}
        </div>
      </div>
      <div>{isDesktopView ? <DesktopLinks /> : <MobileLinks />}</div>
    </div>
  );
};
export default Navbar;
