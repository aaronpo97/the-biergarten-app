/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Page {
  slug: string;
  name: string;
}
const Navbar = () => {
  const router = useRouter();
  const [currentURL, setCurrentURL] = useState('/');

  useEffect(() => {
    setCurrentURL(router.asPath);
  }, [router.asPath]);

  const pages: Page[] = [
    { slug: '/beers', name: 'Beers' },
    { slug: '/breweries', name: 'Breweries' },
  ];

  return (
    <nav className="navbar bg-base-300">
      <div className="flex-1">
        <Link className="btn-ghost btn text-3xl normal-case" href="/">
          <span className="cursor-pointer text-xl font-bold">Aaron William Po</span>
        </Link>
      </div>
      <div className="hidden flex-none lg:block">
        <ul className="menu menu-horizontal p-0">
          {pages.map((page) => {
            return (
              <li key={page.slug}>
                <Link tabIndex={0} href={page.slug}>
                  <span
                    className={`text-lg uppercase ${
                      currentURL === page.slug ? 'font-extrabold' : 'font-semibold'
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
      <div className="flex-none lg:hidden">
        <div className="dropdown-end dropdown">
          <label tabIndex={0} className="btn-ghost btn-circle btn">
            <span className="w-10 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </span>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu rounded-box menu-compact mt-3 w-48 bg-base-100 p-2 shadow"
          >
            {pages.map((page) => (
              <li key={page.slug}>
                <Link href={page.slug}>
                  <span className="select-none">{page.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
