import { FC, ReactNode } from 'react';
import Navbar from './Navbar';

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-full flex-col" id="app">
      <Navbar />
      {children}
    </div>
  );
};
export default Layout;
