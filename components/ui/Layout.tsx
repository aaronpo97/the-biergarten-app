import { FC, ReactNode } from 'react';
import Navbar from './Navbar';

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>
      <div className="relative top-0 h-full flex-1">{children}</div>
    </div>
  );
};

export default Layout;
