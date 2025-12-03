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

          {/* API Key Info Banner */}
          <div className="mt-10 mx-auto max-w-xl">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Want to use real AI analysis?</strong> Click the{" "}
                    <Link to="/settings" className="inline-flex items-center font-semibold hover:underline" aria-label="Settings">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>{" "}
                    button and enter your OpenAI API key. Without a key, the app runs in demo mode with sample data.
                  </p>
                </div>
              </div>
            </div>
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

            {/* Right: Visual - Building with Scan Lines */}
            <div className="bg-[#F3F4F6] dark:bg-[#1a1a1a] rounded-xl p-6 aspect-square flex items-center justify-center relative overflow-hidden">
              {/* Scan lines animation */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent animate-pulse" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#10B981] to-transparent animate-pulse delay-75" />
                <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent animate-pulse delay-150" />
              </div>
              
              {/* Building facade illustration */}
              <div className="relative flex flex-col items-center">
                <svg className="w-72 h-72" viewBox="0 0 200 200" fill="none">
                  {/* Building outline */}
                  <rect x="30" y="15" width="140" height="170" rx="4" className="stroke-[#111111] dark:stroke-white" strokeWidth="2" fill="none" />
                  {/* Windows grid - 3x3, evenly spaced */}
                  {[0, 1, 2].map((row) => (
                    [0, 1, 2].map((col) => (
                      <rect 
                        key={`${row}-${col}`}
                        x={45 + col * 42} 
                        y={28 + row * 42} 
                        width="28" 
                        height="32" 
                        rx="3" 
                        className="fill-[#E5E7EB] dark:fill-[#333333] stroke-[#111111] dark:stroke-white" 
                        strokeWidth="1.5"
                      />
                    ))
                  ))}
                  {/* Detection markers - centered in windows */}
                  <circle cx={45 + 14} cy={28 + 16} r="10" className="fill-[#EF4444]/20 stroke-[#EF4444]" strokeWidth="2" />
                  <circle cx={45 + 2*42 + 14} cy={28 + 42 + 16} r="10" className="fill-[#F59E0B]/20 stroke-[#F59E0B]" strokeWidth="2" />
                  <circle cx={45 + 42 + 14} cy={28 + 2*42 + 16} r="10" className="fill-[#10B981]/20 stroke-[#10B981]" strokeWidth="2" />
                  {/* Door - positioned below the window grid */}
                  <rect x="82" y="158" width="36" height="27" rx="3" className="fill-[#111111] dark:fill-white" />
                </svg>
                <p className="text-[#525252] dark:text-[#999999] font-medium mt-2">AI-Powered Scanning</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 */}
      <section className="bg-white dark:bg-[#0a0a0a] py-20 border-t border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Visual - Cost Breakdown Chart */}
            <div className="bg-[#F3F4F6] dark:bg-[#1a1a1a] rounded-xl p-6 aspect-square flex items-center justify-center order-2 md:order-1 relative overflow-hidden">
              <div className="relative w-full max-w-[340px] border border-[#111111]/10 dark:border-white/10 rounded-2xl p-8 bg-white/30 dark:bg-white/5">
                {/* Mock cost breakdown bars */}
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#525252] dark:text-[#999999] w-20">Cracks</span>
                    <div className="flex-1 h-8 bg-[#E5E7EB] dark:bg-[#333333] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full" />
                    </div>
                    <span className="text-sm font-mono font-medium text-[#111111] dark:text-white w-12 text-right">$240</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#525252] dark:text-[#999999] w-20">Spalling</span>
                    <div className="flex-1 h-8 bg-[#E5E7EB] dark:bg-[#333333] rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full" />
                    </div>
                    <span className="text-sm font-mono font-medium text-[#111111] dark:text-white w-12 text-right">$150</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#525252] dark:text-[#999999] w-20">Water</span>
                    <div className="flex-1 h-8 bg-[#E5E7EB] dark:bg-[#333333] rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full" />
                    </div>
                    <span className="text-sm font-mono font-medium text-[#111111] dark:text-white w-12 text-right">$60</span>
                  </div>
                </div>
                {/* Total */}
                <div className="mt-8 pt-5 border-t border-[#E5E7EB] dark:border-[#333333] flex justify-between items-center">
                  <span className="text-base font-medium text-[#525252] dark:text-[#999999]">Total Estimate</span>
                  <span className="text-2xl font-bold text-[#111111] dark:text-white">$450</span>
                </div>
                <p className="text-center mt-6 text-[#525252] dark:text-[#999999] font-medium">Itemized Breakdown</p>
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

            {/* Right: Visual - Risk Dashboard */}
            <div className="bg-[#F3F4F6] dark:bg-[#1a1a1a] rounded-xl p-6 aspect-square flex items-center justify-center relative overflow-hidden">
              <div className="relative w-full max-w-[280px]">
                {/* Health Grade Circle */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-[#E5E7EB] dark:stroke-[#333333]" strokeWidth="8" fill="none" />
                      <circle 
                        cx="50" cy="50" r="40" 
                        className="stroke-[#1565C0]" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray="251.2" 
                        strokeDashoffset="75" 
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-[#1565C0]">B</span>
                    </div>
                  </div>
                </div>
                
                {/* Risk Metrics */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 text-center border border-[#E5E7EB] dark:border-[#333333]">
                    <div className="text-2xl font-bold text-[#111111] dark:text-white">24</div>
                    <div className="text-sm text-[#525252] dark:text-[#999999]">Risk Score</div>
                  </div>
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 text-center border border-[#E5E7EB] dark:border-[#333333]">
                    <div className="text-2xl font-bold text-[#111111] dark:text-white">4.8</div>
                    <div className="text-sm text-[#525252] dark:text-[#999999]">Severity</div>
                  </div>
                </div>
                
                {/* Grade Legend */}
                <div className="flex justify-center gap-3 mt-6">
                  <span className="w-5 h-5 rounded bg-[#2E7D32]" title="Grade A" />
                  <span className="w-5 h-5 rounded bg-[#1565C0] ring-2 ring-[#1565C0] ring-offset-2 ring-offset-[#F3F4F6] dark:ring-offset-[#1a1a1a]" title="Grade B" />
                  <span className="w-5 h-5 rounded bg-[#E65100]" title="Grade C" />
                  <span className="w-5 h-5 rounded bg-[#C62828]" title="Grade D" />
                </div>
                
                <p className="text-center mt-5 text-[#525252] dark:text-[#999999] font-medium">Health Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#F9FAFB] dark:bg-[#0a0a0a] py-32 border-t border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6 text-center">
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
