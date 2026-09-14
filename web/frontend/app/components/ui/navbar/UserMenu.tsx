import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link } from 'react-router';

interface UserMenuProps {
    username: string;
    userAccountId: string;
}

const UserMenu = ({ username, userAccountId }: UserMenuProps) => (
    <Menu>
        <MenuButton className="btn btn-ghost btn-sm">{username}</MenuButton>
        <MenuItems
            anchor="bottom end"
            transition
            className="menu z-60 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl [--anchor-gap:8px] focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
            <MenuItem>
                <Link
                    to={`/users/${userAccountId}`}
                    className="rounded-field block px-3 py-1.5 data-[focus]:bg-base-200"
                >
                    My profile
                </Link>
            </MenuItem>
            <MenuItem>
                <Link
                    to="/dashboard"
                    className="rounded-field block px-3 py-1.5 data-[focus]:bg-base-200"
                >
                    Dashboard
                </Link>
            </MenuItem>
            <MenuItem>
                <Link
                    to="/logout"
                    className="rounded-field block px-3 py-1.5 data-[focus]:bg-base-200"
                >
                    Logout
                </Link>
            </MenuItem>
        </MenuItems>
    </Menu>
);

export default UserMenu;
