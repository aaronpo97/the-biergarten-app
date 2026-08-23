import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link } from 'react-router';

interface UserMenuProps {
    username: string;
}

const UserMenu = ({ username }: UserMenuProps) => (
    <Menu as="div" className="relative">
        <MenuButton className="btn btn-ghost btn-sm">{username}</MenuButton>
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
);

export default UserMenu;
