import useMediaQuery from '@/hooks/useMediaQuery';
import useNavbar from '@/hooks/useNavbar';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { GiHamburgerMenu } from 'react-icons/gi';

const DesktopLinks: FC = () => {
  const { pages, currentURL } = useNavbar();

  return (
    <div className="block flex-none">
      <ul className="menu menu-horizontal p-0">
        {pages.map((page) => {
          return (
            <li key={page.slug}>
              <Link tabIndex={0} href={page.slug}>
                <span
                  className={`text-lg uppercase ${
                    currentURL === page.slug ? 'font-extrabold' : 'font-semibold'
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
        <label tabIndex={0} className="btn-ghost btn-circle btn">
          <GiHamburgerMenu />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box menu-compact mt-3 w-48 bg-base-100 p-2 shadow"
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

const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (prefersDarkMode && !savedTheme) {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
      return;
    }
    setTheme(savedTheme as 'light' | 'dark');
  }, [prefersDarkMode, theme]);

  return { theme, setTheme };
};

const Navbar = () => {
  const isDesktopView = useMediaQuery('(min-width: 1024px)');

  const { theme, setTheme } = useTheme();

  return (
    <nav className="navbar sticky top-0 z-50 bg-primary text-primary-content">
      <div className="flex-1">
        <Link className="btn-ghost btn normal-case" href="/">
          <span className="cursor-pointer text-lg font-bold">The Biergarten App</span>
        </Link>
      </div>
      <div>
        <div>{isDesktopView ? <DesktopLinks /> : <MobileLinks />}</div>{' '}
        {theme === 'light' ? (
          <button
            className="btn-ghost btn-md btn-circle btn"
            data-set-theme="dark"
            data-act-class="ACTIVECLASS"
            onClick={() => setTheme('dark')}
          >
            <MdLightMode className="text-xl" />
          </button>
        ) : (
          <button
            className="btn-ghost btn-md btn-circle btn"
            data-set-theme="light"
            data-act-class="ACTIVECLASS"
            onClick={() => setTheme('light')}
          >
            <MdDarkMode className="text-xl" />
          </button>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
