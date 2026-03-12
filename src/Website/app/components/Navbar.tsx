import { Link } from "react-router";

interface NavbarProps {
  auth: {
    username: string;
    accessToken: string;
    refreshToken: string;
    userAccountId: string;
  } | null;
}

export default function Navbar({ auth }: NavbarProps) {
  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <div className="navbar-start">
        <Link to="/" className="text-xl font-bold px-4">
          🍺 The Biergarten App
        </Link>
      </div>

      <div className="navbar-center gap-4">
        <Link to="/beers" className="btn btn-ghost btn-sm">
          Beers
        </Link>
        <Link to="/breweries" className="btn btn-ghost btn-sm">
          Breweries
        </Link>
        <Link to="/beer-styles" className="btn btn-ghost btn-sm">
          Beer Styles
        </Link>
      </div>

      <div className="navbar-end gap-2 pr-4">
        <Link to="/register" className="btn btn-ghost btn-sm">
          Register User
        </Link>

        {auth ? (
          <>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
            <div className="divider divider-horizontal m-0 h-6"></div>
            <span className="text-sm text-base-content/70">
              {auth.username}
            </span>
            <Link to="/logout" className="btn btn-ghost btn-sm">
              Logout
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
