import { Layout } from "@/components/Layout";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function About() {
  const location = useLocation();

  // Scroll to section based on hash
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-white dark:bg-[#0a0a0a] border-b border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] dark:text-white mb-4">
            How It Works
          </h1>
          <p className="text-lg text-[#525252] dark:text-[#999999]">
            Technical documentation for the Façade Risk Analyzer platform.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white dark:bg-[#0a0a0a] py-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Damage Detection */}
          <article id="damage-detection" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-[#111111] dark:text-white mb-6">
              AI-Powered Damage Detection
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed mb-4">
                The damage detection pipeline leverages OpenAI's Vision API, specifically the GPT-4o-mini model (configurable via <code className="bg-[#F3F4F6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm">OPENAI_VISION_MODEL</code> environment variable), to perform multi-class defect classification on facade imagery.
              </p>
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed mb-4">
                Images are base64-encoded with their MIME type preserved and submitted to the Vision API alongside a structured prompt. The system acts as an expert facade inspector, identifying:
              </p>
              <ul className="list-disc pl-6 text-[#525252] dark:text-[#999999] mb-4 space-y-2">
                <li><strong>Cracks</strong> — with approximate length measurements in meters</li>
                <li><strong>Spalling/Concrete Delamination</strong> — with affected area in m²</li>
                <li><strong>Water Damage Streaks</strong> — moisture infiltration patterns</li>
                <li><strong>Discoloration/Missing Plaster</strong> — surface degradation</li>
                <li><strong>Corrosion</strong> — metal element deterioration</li>
              </ul>
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed mb-4">
                The API response is constrained to a JSON schema that enforces structured output with fields for damage type, severity level (low/medium/high), approximate measurements, confidence scores, and descriptions. Temperature is set to 0.2 for consistent, deterministic outputs.
              </p>
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed">
                Results are aggregated across all uploaded images and persisted to <code className="bg-[#F3F4F6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm">damages.json</code> with ISO 8601 timestamps for audit trails.
              </p>
            </div>
          </article>

          {/* Cost Estimation */}
          <article id="cost-estimation" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-[#111111] dark:text-white mb-6">
              Cost Estimation Engine
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed mb-4">
                The cost estimation module transforms detected damages into actionable repair budgets using a configurable rate table. Each damage type maps to a per-unit cost based on industry-standard repair pricing:
              </p>
              <div className="bg-[#F9FAFB] dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#333333]">
                      <th className="text-left py-2 text-[#111111] dark:text-white font-semibold">Damage Type</th>
                      <th className="text-left py-2 text-[#111111] dark:text-white font-semibold">Unit</th>
                      <th className="text-left py-2 text-[#111111] dark:text-white font-semibold">Rate (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#525252] dark:text-[#999999]">
                    <tr className="border-b border-[#E5E7EB] dark:border-[#333333]">
                      <td className="py-2">Crack</td>
                      <td className="py-2">meter</td>
                      <td className="py-2">$20.00</td>
                    </tr>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#333333]">
                      <td className="py-2">Spalling</td>
                      <td className="py-2">m²</td>
                      <td className="py-2">$50.00</td>
                    </tr>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#333333]">
                      <td className="py-2">Water Damage</td>
                      <td className="py-2">m²</td>
                      <td className="py-2">$15.00</td>
                    </tr>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#333333]">
                      <td className="py-2">Discoloration</td>
                      <td className="py-2">m²</td>
                      <td className="py-2">$4.00</td>
                    </tr>
                    <tr>
                      <td className="py-2">Default/Other</td>
                      <td className="py-2">m²</td>
                      <td className="py-2">$10.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed mb-4">
                The engine parses <code className="bg-[#F3F4F6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm">damages.json</code>, extracts quantities (preferring <code className="bg-[#F3F4F6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm">approx_length_m</code> for linear defects, <code className="bg-[#F3F4F6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm">approx_area_m2</code> for surface defects), and computes itemized costs per category.
              </p>
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed">
                Output is written to <code className="bg-[#F3F4F6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm">cost_estimate.json</code> containing the total cost, currency, and a breakdown by damage type with count, total quantity, and subtotal.
              </p>
            </div>
          </article>

          {/* Risk Assessment */}
          <article id="risk-assessment" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-[#111111] dark:text-white mb-6">
              Risk Scoring & Health Grades
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed mb-4">
                The risk scoring algorithm computes aggregate building health metrics using a weighted point system. Each detected damage contributes risk points based on three factors:
              </p>
              <div className="bg-[#F9FAFB] dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-[#111111] dark:text-white mb-3">Type Weights</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#525252] dark:text-[#999999]">
                  <div>Corrosion: <span className="font-mono">4.5</span></div>
                  <div>Spalling: <span className="font-mono">4.0</span></div>
                  <div>Crack: <span className="font-mono">3.0</span></div>
                  <div>Water/Moisture: <span className="font-mono">2.5</span></div>
                  <div>Discoloration: <span className="font-mono">1.5</span></div>
                  <div>Unknown: <span className="font-mono">2.0</span></div>
                </div>
              </div>
              <div className="bg-[#F9FAFB] dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-[#111111] dark:text-white mb-3">Severity Multipliers</h4>
                <div className="grid grid-cols-3 gap-4 text-sm text-[#525252] dark:text-[#999999]">
                  <div>Low: <span className="font-mono">0.8×</span></div>
                  <div>Medium: <span className="font-mono">1.0×</span></div>
                  <div>High: <span className="font-mono">1.4×</span></div>
                </div>
              </div>
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed mb-4">
                Risk points = Type Weight × Severity Multiplier × Damage Magnitude. Points are summed and normalized to produce:
              </p>
              <ul className="list-disc pl-6 text-[#525252] dark:text-[#999999] mb-4 space-y-2">
                <li><strong>Overall Risk Score</strong> — 0-100 scale (capped)</li>
                <li><strong>Severity Index</strong> — 0-10 scale (risk points / 5.0, capped)</li>
                <li><strong>Building Health Grade</strong> — A/B/C/D based on risk score thresholds</li>
              </ul>
              <div className="bg-[#F9FAFB] dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-[#111111] dark:text-white mb-3">Health Grade Thresholds</h4>
                <div className="grid grid-cols-4 gap-4 text-sm text-[#525252] dark:text-[#999999]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-4 rounded-sm bg-[#2E7D32]" />
                    <span>A: &lt;20</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-4 rounded-sm bg-[#1565C0]" />
                    <span>B: 20-39</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-4 rounded-sm bg-[#E65100]" />
                    <span>C: 40-69</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-4 rounded-sm bg-[#C62828]" />
                    <span>D: ≥70</span>
                  </div>
                </div>
              </div>
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed">
                Results are persisted to <code className="bg-[#F3F4F6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm">risk_summary.json</code> with per-type breakdowns for detailed analysis.
              </p>
            </div>
          </article>

          {/* Reporting */}
          <article id="reporting" className="mb-16 scroll-mt-24">
            <h2 className="text-3xl font-bold text-[#111111] dark:text-white mb-6">
              PDF Report Generation
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed mb-4">
                The reporting module synthesizes all analysis outputs into a downloadable PDF document. The generator constructs valid PDF 1.4 files programmatically without external dependencies, using Helvetica Type1 font for cross-platform compatibility.
              </p>
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed mb-4">
                Report contents include:
              </p>
              <ul className="list-disc pl-6 text-[#525252] dark:text-[#999999] mb-4 space-y-2">
                <li>Job metadata with ISO 8601 timestamps</li>
                <li>Total damage count from AI detection</li>
                <li>Itemized cost breakdown by damage type</li>
                <li>Total estimated repair cost in USD</li>
                <li>Overall risk score and severity index</li>
                <li>Building health grade with per-type risk point distribution</li>
              </ul>
              <p className="text-[#525252] dark:text-[#999999] leading-relaxed">
                Reports are stored in the <code className="bg-[#F3F4F6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm">/reports</code> directory and served via the <code className="bg-[#F3F4F6] dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm">/jobs/{'{job_id}'}/report.pdf</code> endpoint.
              </p>
            </div>
          </article>
        </div>
      </section>
    </Layout>
  );
}
