import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center bg-white dark:bg-[#0a0a0a] px-6">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-[#111111] dark:text-white mb-4">
              404
            </h1>
            <p className="text-xl text-[#525252] dark:text-[#999999] mb-4">
              Oops! Page not found
            </p>
            <p className="text-[#737373] dark:text-[#666666] mb-8">
              The page you're looking for doesn't exist or may have been moved.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-all duration-200 hover:translate-y-[-2px]"
          >
            Return to Home
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
