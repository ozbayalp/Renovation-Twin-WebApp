import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";

export function Navigation() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#333333] h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo and Product Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#111111] dark:bg-white rounded-md flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white dark:text-[#111111]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
            </svg>
          </div>
          <span className="font-semibold text-[#111111] dark:text-white text-base">
            Façade Risk
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm font-medium transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm font-medium transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            to="/upload"
            className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm font-medium transition-colors duration-200"
          >
            Analyze
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-[#E5E7EB] dark:bg-[#333333]"></div>

          {/* Auth Buttons */}
          <Link
            to="#"
            className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm font-medium transition-colors duration-200"
          >
            Sign in
          </Link>
          <button className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-colors duration-200">
            Sign up
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-[#F3F4F6] dark:hover:bg-[#222222] rounded-lg transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                className="w-5 h-5 text-[#525252] dark:text-[#999999]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-[#999999]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 3.536l.707-.707a1 1 0 011.414 0zM3 17a1 1 0 100 2h1a1 1 0 100-2H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
