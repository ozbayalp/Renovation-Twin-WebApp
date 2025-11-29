import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#F9FAFB] dark:bg-[#0a0a0a] border-t border-[#E5E7EB] dark:border-[#333333]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-center mb-16">
          <div className="flex gap-44">
            {/* Products */}
            <div className="text-center">
              <h4 className="text-[#111111] dark:text-white font-semibold text-base mb-5 tracking-wide">
                PRODUCTS
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/about#risk-assessment"
                    className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-base transition-colors duration-200"
                  >
                    Risk Analysis
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about#cost-estimation"
                    className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-base transition-colors duration-200"
                  >
                    Cost Estimation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about#reporting"
                    className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-base transition-colors duration-200"
                  >
                    Reporting
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="text-center">
              <h4 className="text-[#111111] dark:text-white font-semibold text-base mb-5 tracking-wide">
                RESOURCES
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/about"
                    className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-base transition-colors duration-200"
                  >
                    About Page
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about#risk-assessment"
                    className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-base transition-colors duration-200"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <a
                    href="https://platform.openai.com/docs/guides/vision"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-base transition-colors duration-200"
                  >
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div className="text-center">
              <h4 className="text-[#111111] dark:text-white font-semibold text-base mb-5 tracking-wide">
                SOCIAL
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:ao2680@nyu.edu"
                    className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-base transition-colors duration-200"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/alp-ozbay-a13208331/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-base transition-colors duration-200"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ozbayalp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-base transition-colors duration-200"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E5E7EB] dark:border-[#333333] pt-8 flex items-center justify-between">
          <p className="text-[#737373] dark:text-[#999999] text-xs">
            © 2024 Façade Risk Analyzer. All rights reserved.
          </p>
          <p className="text-[#525252] dark:text-[#999999] text-xs">
            Light/Dark mode enabled
          </p>
        </div>
      </div>
    </footer>
  );
}
