import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import useNavbar from '@/hooks/utilities/useNavbar';
import useTheme from '@/hooks/utilities/useTheme';

import Link from 'next/link';
import { FC, useRef } from 'react';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

import { FaBars } from 'react-icons/fa';
import classNames from 'classnames';

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
                    currentURL === page.slug ? 'font-extrabold' : 'font-bold'
                  } text-base-content`}
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

  const drawerRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex-none lg:hidden">
      <div className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" ref={drawerRef} />
        <div className="drawer-content">
          <label htmlFor="my-drawer" className="btn btn-ghost drawer-button">
            <FaBars />
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          />
          <ul className="menu min-h-full bg-primary pr-16 text-base-content">
            {pages.map((page) => {
              return (
                <li key={page.slug}>
                  <Link
                    href={page.slug}
                    tabIndex={0}
                    rel={page.slug === '/resume/main.pdf' ? 'noopener noreferrer' : ''}
                    target={page.slug === '/resume/main.pdf' ? '_blank' : ''}
                    onClick={() => {
                      if (!drawerRef.current) return;
                      drawerRef.current.checked = false;
                    }}
                  >
                    <span className="text-lg font-bold uppercase">{page.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const isDesktopView = useMediaQuery('(min-width: 1024px)');

  const { theme, setTheme } = useTheme();
  const { currentURL } = useNavbar();

  return (
    <div
      className={classNames('navbar fixed top-0 z-20 h-10 min-h-10 text-base-content', {
        'bg-transparent': currentURL === '/',
        'bg-base-100': currentURL !== '/',
      })}
    >
      <div className="flex-1">
        {currentURL === '/' ? null : (
          <Link className="btn btn-ghost btn-sm" href="/">
            <span className="cursor-pointer text-lg font-bold">The Biergarten App</span>
          </Link>
        )}
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
