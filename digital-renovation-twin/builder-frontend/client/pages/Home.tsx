import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0a0a0a]">
        {/* SVG Grid Background */}
        <div className="absolute inset-0">
          <svg
            className="w-full h-full opacity-[0.03] dark:opacity-[0.05]"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Radial Gradient Background */}
          <div className="absolute inset-0 bg-radial-gradient opacity-40" />
        </div>

        {/* Content */}
        <div className="relative max-w-3xl mx-auto px-6 py-32 text-center">
          {/* Badge */}
          <div className="inline-block mb-6 px-4 py-2 bg-[#F3F4F6] dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-full">
            <span className="text-[#525252] dark:text-[#999999] text-xs font-medium tracking-wide">
              AI-POWERED ANALYSIS
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-[#111111] dark:text-white mb-6 leading-tight">
            Façade Risk Analysis
            <br />
            <span className="text-[#525252] dark:text-[#999999]">Made Simple</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-[#525252] dark:text-[#999999] mb-12 leading-relaxed max-w-2xl mx-auto">
            Analyze building facades for damage, estimate repair costs, and assess
            structural risks with AI-powered precision. Get comprehensive reports
            in minutes, not weeks.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/upload"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-all duration-200 hover:translate-y-[-2px]"
            >
              Start Analysis
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] text-[#111111] dark:text-white rounded-lg font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#252525] transition-all duration-200 hover:translate-y-[-2px]"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section 1 */}
      <section className="bg-white dark:bg-[#0a0a0a] py-20 border-t border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#111111] dark:text-white mb-6">
                Intelligent Damage Detection
              </h2>
              <p className="text-lg text-[#525252] dark:text-[#999999] mb-8 leading-relaxed">
                Powered by OpenAI's Vision API (GPT-4o), our system performs multi-class defect classification on facade imagery. Images are base64-encoded and analyzed against a structured JSON schema that extracts damage type, severity level (low/medium/high), approximate measurements (length in meters, area in m²), and confidence scores. Detectable anomalies include cracks, spalling, concrete delamination, water damage streaks, discoloration, missing plaster, and corrosion.
              </p>
              <Link
                to="/about#damage-detection"
                className="text-[#111111] dark:text-white font-medium text-base hover:underline inline-flex items-center gap-2"
              >
                Learn more
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Right: Visual */}
            <div className="bg-[#F3F4F6] dark:bg-[#1a1a1a] rounded-lg p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#111111] dark:bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white dark:text-[#111111]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m11-11a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-[#525252] dark:text-[#999999] font-medium">Damage Detection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 */}
      <section className="bg-white dark:bg-[#0a0a0a] py-20 border-t border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Visual */}
            <div className="bg-[#F3F4F6] dark:bg-[#1a1a1a] rounded-lg p-8 aspect-square flex items-center justify-center order-2 md:order-1">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#111111] dark:bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white dark:text-[#111111]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-[#525252] dark:text-[#999999] font-medium">Cost Analysis</p>
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111111] dark:text-white mb-6">
                Accurate Cost Estimation
              </h2>
              <p className="text-lg text-[#525252] dark:text-[#999999] mb-8 leading-relaxed">
                Cost estimation is driven by a configurable rate table that maps damage types to per-unit repair costs. Cracks are priced at $20/linear meter, spalling at $50/m², water damage at $15/m², and discoloration at $4/m². The engine aggregates detected quantities from the AI pipeline, computes itemized costs per damage category, and outputs a JSON summary with total estimated repair cost in USD.
              </p>
              <Link
                to="/about#cost-estimation"
                className="text-[#111111] dark:text-white font-medium text-base hover:underline inline-flex items-center gap-2"
              >
                Learn more
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3 */}
      <section className="bg-white dark:bg-[#0a0a0a] py-20 border-t border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#111111] dark:text-white mb-6">
                Comprehensive Risk Assessment
              </h2>
              <p className="text-lg text-[#525252] dark:text-[#999999] mb-8 leading-relaxed">
                Risk scoring employs weighted coefficients per damage type (cracks: 3.0, spalling: 4.0, corrosion: 4.5, water damage: 2.5) multiplied by severity factors (low: 0.8×, medium: 1.0×, high: 1.4×) and damage magnitude. The aggregate risk points are normalized to a 0-100 overall risk score and a 0-10 severity index. Building health grades are assigned via threshold mapping: A (&lt;20), B (20-39), C (40-69), D (≥70).
              </p>
              <Link
                to="/about#risk-assessment"
                className="text-[#111111] dark:text-white font-medium text-base hover:underline inline-flex items-center gap-2"
              >
                Learn more
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Right: Visual */}
            <div className="bg-[#F3F4F6] dark:bg-[#1a1a1a] rounded-lg p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#111111] dark:bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white dark:text-[#111111]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-[#525252] dark:text-[#999999] font-medium">Risk Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#F9FAFB] dark:bg-[#0a0a0a] py-24 border-t border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111111] dark:text-white mb-6">
            Ready to analyze your building?
          </h2>
          <p className="text-lg text-[#525252] dark:text-[#999999] mb-12">
            Start a new analysis today and get comprehensive insights about your
            building facade condition.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium text-lg hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-all duration-200 hover:translate-y-[-2px]"
          >
            Begin Analysis
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
