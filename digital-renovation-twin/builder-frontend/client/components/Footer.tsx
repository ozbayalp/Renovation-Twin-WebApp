import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#F9FAFB] dark:bg-[#0a0a0a] border-t border-[#E5E7EB] dark:border-[#333333]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-12 mb-12">
          {/* Products */}
          <div>
            <h4 className="text-[#111111] dark:text-white font-semibold text-sm mb-4 tracking-wide">
              PRODUCTS
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  Risk Analysis
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  Cost Estimation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  Reporting
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[#111111] dark:text-white font-semibold text-sm mb-4 tracking-wide">
              RESOURCES
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[#111111] dark:text-white font-semibold text-sm mb-4 tracking-wide">
              COMPANY
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[#111111] dark:text-white font-semibold text-sm mb-4 tracking-wide">
              SOCIAL
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white text-sm transition-colors duration-200"
                >
                  GitHub
                </a>
              </li>
            </ul>
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
