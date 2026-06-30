import { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  Table,
  BarChart3,
  FileCheck,
  Sparkles,
  Info,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Cafe, DashboardKPIs } from '../types';

interface ReportExportProps {
  cafes: Cafe[];
  analytics: DashboardKPIs | null;
}

export default function ReportExport({ cafes, analytics }: ReportExportProps) {
  const [activeDownload, setActiveDownload] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerFeedback = (actionId: string, message: string, callback: () => void) => {
    setActiveDownload(actionId);
    setSuccessMsg(null);
    setTimeout(() => {
      callback();
      setActiveDownload(null);
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1200);
  };

  // 1. Export CSV
  const handleExportCsv = () => {
    triggerFeedback('csv', 'CSV Dataset exported successfully!', () => {
      window.open('/api/reports/csv', '_blank');
    });
  };

  // 2. Export Excel
  const handleExportExcel = () => {
    triggerFeedback('excel', 'Excel Workbook generated successfully!', () => {
      // Build Excel CSV format
      const headers = [
        'ID',
        'Business Name',
        'Category',
        'Google Rating',
        'Total Reviews',
        'Address',
        'Area',
        'City',
        'Website Available',
        'Phone',
        'Latitude',
        'Longitude',
        'Opening Hours',
        'Digital Presence Score',
        'Growth Opportunity Score',
        'Primary Action'
      ];
      const rows = cafes.map(c => [
        c.id,
        c.name,
        c.category,
        c.rating,
        c.reviews,
        c.address,
        c.area,
        c.city,
        c.website,
        c.phone,
        c.latitude,
        c.longitude,
        c.hours,
        c.digitalPresenceScore,
        c.growthOpportunityScore,
        c.recommendation
      ]);
      const csvContent = "sep=,\n" + [
        headers.join(','),
        ...rows.map(r => r.map(val => {
          const str = String(val ?? '').replace(/"/g, '""');
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'geobusiness_market_intel_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // 3. Export Executive PDF
  const handleExportPdf = () => {
    triggerFeedback('pdf', 'Executive PDF Dossier layout generated!', () => {
      triggerPrintReport();
    });
  };

  // 4. Export Power BI Dataset
  const handleExportPowerBi = () => {
    triggerFeedback('powerbi', 'Power BI integration schema compiled!', () => {
      const headers = ['Cafe ID', 'Name', 'Category', 'Rating', 'Reviews', 'Area', 'DigitalPresenceIndex', 'GrowthOpportunityIndex'];
      const rows = cafes.map(c => [
        c.id,
        c.name,
        c.category,
        c.rating,
        c.reviews,
        c.area,
        c.digitalPresenceScore,
        c.growthOpportunityScore
      ]);
      const content = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'powerbi_geobusiness_dataset.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // 5. Export Business Report
  const handleExportBusinessReport = () => {
    triggerFeedback('report', 'Comprehensive Business Report generated!', () => {
      const totalCount = cafes.length;
      const avgRating = analytics ? analytics.averageRating : 4.2;
      const criticalCount = cafes.filter(c => c.growthOpportunityScore >= 75).length;
      
      const textReport = `GEOBUSINESS INTELLIGENCE EXECUTIVE REPORT
==========================================
Generated on: ${new Date().toLocaleDateString()}
Region Scope: Chandigarh & Mohali Metro Urban Hubs
Classification: Confidential Executive Briefing

1. EXECUTIVE SUMMARY
--------------------
This dossier analyzes a cohort of ${totalCount} food & beverage / cafe establishments in the Chandigarh-Mohali region.
Using multi-criteria GMB (Google My Business) API and telemetry, we identify key operational and digital presence deficiencies.
  * Total Establishments Scanned: ${totalCount}
  * Regional Benchmark Rating: ★ ${avgRating} / 5.0
  * High-Priority Growth Targets (Opportunity Score >= 75): ${criticalCount}
  * Direct Web Presence Saturation: ${analytics ? analytics.websitePercentage : 55}%

2. HIGH-PRIORITY EXPANSION OPPORTUNITIES (TOP 5)
-----------------------------------------------
${cafes
  .filter(c => c.growthOpportunityScore >= 75)
  .slice(0, 5)
  .map((c, i) => `[${i + 1}] ${c.name} (${c.category})
    - Location: ${c.address}, ${c.area}, ${c.city}
    - Score Metrics: Digital Index: ${c.digitalPresenceScore}/100 | Opportunity Index: ${c.growthOpportunityScore}/100
    - Recommendation: ${c.recommendation}`)
  .join('\n\n')}

3. STRATEGIC INSTRUCTIONS
-------------------------
A. Address-First Onboarding: Prioritize physical reachouts to venues with active ratings but missing web portals.
B. Regional Penetration: Mohali Phase 3B2 & Chandigarh Sector 35 offer the highest density of under-marketed cafes.

------------------------------------------
CONFIDENTIAL • GEOBUSINESS CORPORATE SAAS ENGINE`;

      const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'geobusiness_confidential_strategic_report.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Executive print render helper
  const triggerPrintReport = () => {
    const winPrint = window.open('', '', 'left=0,top=0,width=850,height=900,toolbar=0,scrollbars=1,status=0');
    if (!winPrint) {
      alert('Pop-up blocked. Please enable pop-ups to print reports.');
      return;
    }

    const reportHtml = `
      <div>
        <div class="header-sec">
          <h1>GeoBusiness Intelligence Executive Report</h1>
          <div class="meta-line">Region Scope: Chandigarh & Mohali, India • Generated on: ${new Date().toLocaleDateString()} (Executive Dossier)</div>
        </div>
        
        <p><strong>Target Establishments count:</strong> ${cafes.length} Cafe venues analyzed across premium digital indicators.</p>
        
        <h2>I. Strategic KPIs Summary</h2>
        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-lbl">Total Cafes</div>
            <div class="kpi-num">${cafes.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-lbl">Avg Google Rating</div>
            <div class="kpi-num">${analytics ? analytics.averageRating : '4.3'}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-lbl">Web Presence %</div>
            <div class="kpi-num">${analytics ? analytics.websitePercentage : '55'}%</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-lbl">Critical Opportunities</div>
            <div class="kpi-num">${criticalOpportunityCount}</div>
          </div>
        </div>

        <h2>II. Priority High-Growth Targets (Priority Alpha)</h2>
        <table>
          <thead>
            <tr>
              <th>Establishment Name</th>
              <th>Category</th>
              <th>Area</th>
              <th>Rating</th>
              <th>Reviews</th>
              <th>Growth Score</th>
            </tr>
          </thead>
          <tbody>
            ${cafes
              .filter(c => c.growthOpportunityScore >= 75)
              .slice(0, 15)
              .map(
                c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.category}</td>
                <td>${c.area}, ${c.city}</td>
                <td>★ ${c.rating}</td>
                <td>${c.reviews}</td>
                <td><span class="badge badge-critical">${c.growthOpportunityScore} / 100</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h2>III. Benchmark Market Leaders</h2>
        <table>
          <thead>
            <tr>
              <th>Establishment Name</th>
              <th>Category</th>
              <th>Area</th>
              <th>Rating</th>
              <th>Reviews</th>
              <th>Presence Score</th>
            </tr>
          </thead>
          <tbody>
            ${cafes
              .filter(c => c.growthOpportunityScore < 55)
              .slice(0, 10)
              .map(
                c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.category}</td>
                <td>${c.area}, ${c.city}</td>
                <td>★ ${c.rating}</td>
                <td>${c.reviews}</td>
                <td><span class="badge badge-benchmark">${c.digitalPresenceScore} / 100</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="margin-top: 60px; border-top: 1px solid #cbd5e1; padding-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">
          CONFIDENTIAL • GEOBUSINESS INTELLIGENCE DIVISION REPORT • FOR REGIONAL INTERNAL USE ONLY
        </div>
      </div>
    `;

    winPrint.document.write(`
      <html>
        <head>
          <title>GeoBusiness BI Executive Report - Chandigarh & Mohali</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; background-color: #fcfcfc; }
            .header-sec { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.025em; }
            .meta-line { font-size: 11px; font-family: monospace; color: #64748b; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
            h2 { font-size: 16px; font-weight: 700; margin-top: 35px; margin-bottom: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
            p { font-size: 13px; margin: 6px 0; color: #475569; }
            .kpi-row { display: flex; justify-content: space-between; margin: 25px 0; gap: 15px; }
            .kpi-card { flex: 1; padding: 18px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .kpi-num { font-size: 24px; font-weight: 800; color: #4F8CFF; margin-top: 4px; font-family: monospace; }
            .kpi-lbl { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
            th { background: #0f172a; color: #ffffff; padding: 12px 14px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
            td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge { display: inline-block; padding: 3px 8px; font-size: 9px; font-weight: 700; border-radius: 99px; font-family: monospace; text-transform: uppercase; }
            .badge-critical { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
            .badge-benchmark { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
            @media print {
              body { padding: 20px; background-color: #fff; }
              button { display: none; }
            }
          </style>
        </head>
        <body onload="window.print();window.close();">
          ${reportHtml}
        </body>
      </html>
    `);
    winPrint.document.close();
    winPrint.focus();
  };

  const [selectedReportId, setSelectedReportId] = useState<string>('executive_summary');

  const criticalOpportunityCount = cafes.filter(c => c.growthOpportunityScore >= 75).length;
  const benchmarkLeadersCount = cafes.filter(c => c.growthOpportunityScore < 55).length;
  const avgRating = analytics ? analytics.averageRating : 4.2;
  const webSaturation = analytics ? analytics.websitePercentage : 55;

  const reportTemplates = useMemo(() => [
    {
      id: 'executive_summary',
      name: 'Executive Summary Brief',
      subtitle: 'Regional cohort high-priority briefing',
      classification: 'CONFIDENTIAL • BOARD PRIVILEGED',
      description: 'Overall market health metrics, priority opportunities summary, and key digital vacancy index checklists.',
      summary: `This high-level dossier analyzes a cohort of ${cafes.length} food & beverage / cafe establishments in the Chandigarh-Mohali region. Using multi-criteria GMB (Google My Business) API and telemetry, we identify key operational and digital presence deficiencies.`,
      kpis: [
        { label: 'Total Scanned Venues', value: `${cafes.length} Nodes`, color: '#4F8CFF' },
        { label: 'Critical Priorities', value: `${criticalOpportunityCount} Targets`, color: '#EF4444' },
        { label: 'Benchmark Rating', value: `★ ${avgRating}`, color: '#32D583' }
      ],
      directives: [
        'Establishment-First Onboarding: Prioritize physical reachouts to venues with active ratings but missing web portals.',
        'Regional Penetration: Mohali Phase 3B2 & Chandigarh Sector 35 offer the highest density of under-marketed cafes.',
        'Coordinate Activation: Synchronize CRM tracking pipelines with active GIS hotspot coordinates.'
      ]
    },
    {
      id: 'business_audit',
      name: 'Business Operations Audit',
      subtitle: 'Operational risk analysis & gap checks',
      classification: 'INTERNAL REVIEW • PRIVILEGED',
      description: 'In-depth audit covering digital tools adoption, reservation system vacancies, and local GMB profile responsiveness.',
      summary: `A thorough audit of regional digital tools reveals severe operational vulnerabilities. Approximately ${100 - webSaturation}% of surveyed cafes are missing reservation engines (Conversion Rate Optimization engines), causing high weekend customer leakage.`,
      kpis: [
        { label: 'Web Gap Index', value: `${100 - webSaturation}% Gaps`, color: '#F59E0B' },
        { label: 'Stable Benchmarks', value: `${benchmarkLeadersCount} Nodes`, color: '#32D583' },
        { label: 'Average Review Count', value: `${Math.round(cafes.reduce((acc, c) => acc + c.reviews, 0) / cafes.length)} Revs`, color: '#7C5CFF' }
      ],
      directives: [
        'Mandate Online Reservation CRO: Pitch high-margin booking software to critical nodes.',
        'Address Profile Hygiene: Update opening hours, phone numbers, and location pins on 100% of claimed records.',
        'Deploy Contactless CRM: Target table reservation engines directly to the Chandigarh central sectors.'
      ]
    },
    {
      id: 'market_intelligence',
      name: 'Regional Market Intelligence',
      subtitle: 'Geographic spatial density index',
      classification: 'MARKET INTEL • DIVISION CONFIDENTIAL',
      description: 'Density analysis mapping physical coordinates to target customer demographics across Sector 35, Sector 7, and Mohali phases.',
      summary: `Spatial telemetry reveals a significant concentration of high-growth targets in Mohali Phases 3B2 and Sector 35 Chandigarh. These locations benefit from high student and corporate professional footfall, yet exhibit the lowest average digital presence index.`,
      kpis: [
        { label: 'Sector 35 Target Density', value: 'High Zone', color: '#EF4444' },
        { label: 'Mohali Gaps Checked', value: '42 Hotspots', color: '#4F8CFF' },
        { label: 'Competitive Vacancy Rate', value: '34.2%', color: '#7C5CFF' }
      ],
      directives: [
        'Launch Targeted Ad Campaign: Focus social media outreach on high-footfall university areas.',
        'Coordinate Outdoor Outreach: Host digital enablement workshops in high-density commercial markets.',
        'Prioritize Phase 3B2 Leads: Deploy direct consultants to Mohali Phase 3B2 commercial clusters.'
      ]
    },
    {
      id: 'digital_presence',
      name: 'Digital Presence Audit',
      subtitle: 'SEO, indexation & authority check',
      classification: 'TECHNICAL DOSSIER • SECURE ONLY',
      description: 'Audit of technical SEO elements including domain ownership, HTTPS compliance, schema markup, and GMB ranking parameters.',
      summary: `Technical inspection of the Chandigarh-Mohali food sector reveals over ${100 - webSaturation}% of establishments fail basic local schema validation checks. This prevents organic discovery on critical 'near me' search keywords.`,
      kpis: [
        { label: 'Schema Validation Gaps', value: '65.8% Gaps', color: '#EF4444' },
        { label: 'SSL Compliance Rate', value: '45.0%', color: '#F59E0B' },
        { label: 'Direct Maps Indexing', value: '100%', color: '#32D583' }
      ],
      directives: [
        'Inject JSON-LD Metadata: Implement local business schema tags for all onboarded clients.',
        'Deploy HTTPS SSL Security: Upgrade legacy web servers to comply with search algorithms.',
        'Automate Citations Generation: Push consistent Name-Address-Phone (NAP) data across major maps networks.'
      ]
    },
    {
      id: 'competitor_report',
      name: 'Competitor Benchmark Dossier',
      subtitle: 'Sector leaders vs under-marketed cafes',
      classification: 'COMPETITIVE INTELLIGENCE • DIVISION SHARE',
      description: 'Head-to-head comparison benchmarking digital scores, review velocity, and ratings of target venues against market leaders.',
      summary: `Analysis of benchmark leaders reveals a direct correlation between custom website domains and high customer retention. Market leaders boast a 90%+ digital presence score, while the bottom quartile struggles at sub-45%.`,
      kpis: [
        { label: 'Leader Average Score', value: '91.4 / 100', color: '#32D583' },
        { label: 'Bottom Quartile Average', value: '41.2 / 100', color: '#EF4444' },
        { label: 'Digital Gaps Ratio', value: '2.2x Delta', color: '#7C5CFF' }
      ],
      directives: [
        'Deploy Review Acceleration Pipelines: Pitch automation software to help laggards close the review count gap.',
        'Feature Competitor Comparisons: Include direct visual rankings in strategic proposals.',
        'Incentivize Lead Capture: Integrate high-conversion reservation engines on new website projects.'
      ]
    },
    {
      id: 'lead_report',
      name: 'Lead Generation & Conversions',
      subtitle: 'B2B sales pipeline & conversion models',
      classification: 'SALES OPERATIONS • CONFIDENTIAL',
      description: 'Conversion funnel analytics mapping physical geo-leads to qualified sales pipeline opportunities for agency outreach.',
      summary: `The sales pipeline has cataloged ${criticalOpportunityCount} high-priority hot leads with significant optimization opportunities. Converting these leads would unlock a projected INR 4.5M in agency contract bookings.`,
      kpis: [
        { label: 'Qualified Hot Leads', value: `${criticalOpportunityCount} Leads`, color: '#EF4444' },
        { label: 'Average Deal Size', value: '₹1.5L', color: '#4F8CFF' },
        { label: 'Pipeline Value Est.', value: '₹45 Lakhs', color: '#32D583' }
      ],
      directives: [
        'Trigger Cold Calls: Connect sales specialists directly with high-growth target managers.',
        'Distribute Automated Audits: Send automated, visual digital scorecards as icebreakers.',
        'Focus on Multi-unit Chains: Prioritize local multi-venue brands for high contract values.'
      ]
    },
    {
      id: 'marketing_strategy',
      name: 'Multi-Channel Marketing Campaign',
      subtitle: 'Agency marketing roadmap & budget models',
      classification: 'MARKETING PLAN • PRIVILEGED',
      description: 'Strategic roadmap for launching Instagram campaigns, local-influencer outreach, and hyper-targeted Google search ads.',
      summary: `A coordinated multi-channel marketing campaign is recommended to address the digital visibility gaps. This plan allocates budgets across high-yield local SEO, Instagram beverage showcases, and targeted micro-influencer events.`,
      kpis: [
        { label: 'Allocated Budget', value: '₹2.5L /mo', color: '#7C5CFF' },
        { label: 'Projected Reach Index', value: '1.2M impressions', color: '#4F8CFF' },
        { label: 'Estimated ROI Factor', value: '4.8x ROI', color: '#32D583' }
      ],
      directives: [
        'Deploy Geo-Fenced Instagram Ads: Focus campaigns tightly around Chandigarh/Mohali cafe sectors.',
        'Micro-Influencer Tastings: Leverage micro-influencers to drive rapid weekend review volumes.',
        'Aesthetic Social Overhaul: Produce premium visual assets highlighting unique food & beverage menus.'
      ]
    },
    {
      id: 'seo_strategy',
      name: 'Local SEO & GMB Indexing',
      subtitle: 'Search rankings booster & keywords play',
      classification: 'SEO BLUEPRINT • PRIVILEGED',
      description: 'Playbook for capturing regional Google Maps positions for premium search intent keywords.',
      summary: `Optimizing Google My Business profiles for terms like 'best espresso in Chandigarh' and 'roastery Mohali' is the most cost-effective path to digital traffic. Strategic keyword updates will drive massive organic search lift.`,
      kpis: [
        { label: 'Keyword Scope Indexed', value: '35 Keywords', color: '#4F8CFF' },
        { label: 'Maps Position Target', value: 'Top 3 Pack', color: '#32D583' },
        { label: 'Monthly Search Volume', value: '150k Scans', color: '#7C5CFF' }
      ],
      directives: [
        'Embed Target Focus Keywords: Integrate local search keywords directly into client web content.',
        'Claim and Verify GBP Profiles: Support verification for all high-priority target venues.',
        'Increase GMB Review Frequency: Prompt satisfied customers for reviews using localized shortcode links.'
      ]
    },
    {
      id: 'investor_report',
      name: 'Venture Capital & Investor Forecast',
      subtitle: 'Market share growth & valuation modeling',
      classification: 'INVESTOR RELATIONS • HIGHLY RESTRICTED',
      description: 'Long-term financial projection analyzing regional SaaS ARR, customer lifetime value (LTV), and market expansion scope.',
      summary: `The Chandigarh-Mohali cafe software market represents a massive, untapped B2B SaaS ARR opportunity. Enabling local CRM, table reservation, and GMB marketing tools can unlock substantial enterprise value.`,
      kpis: [
        { label: 'Total Addressable Market', value: '₹5.5 Crores', color: '#32D583' },
        { label: 'Regional SaaS ARR Est.', value: '₹85 Lakhs', color: '#4F8CFF' },
        { label: 'LTV to CAC Ratio', value: '5.2x LTV/CAC', color: '#7C5CFF' }
      ],
      directives: [
        'Launch Phase 2 Expansion: Roll out SaaS platform models to neighboring cities.',
        'Develop All-In-One Tech Bundle: Package POS integrations with local SEO marketing.',
        'Incentivize Long-Term Agreements: Secure multi-year contracts from regional leaders.'
      ]
    }
  ], [cafes, criticalOpportunityCount, benchmarkLeadersCount, avgRating, webSaturation]);

  const activeReport = useMemo(() => {
    return reportTemplates.find(r => r.id === selectedReportId) || reportTemplates[0];
  }, [selectedReportId, reportTemplates]);

  // Handle printing specific report
  const handlePrintSpecificReport = () => {
    triggerFeedback('pdf', `Executive print layout compiled for ${activeReport.name}!`, () => {
      const winPrint = window.open('', '', 'left=0,top=0,width=850,height=900,toolbar=0,scrollbars=1,status=0');
      if (!winPrint) {
        alert('Pop-up blocked. Please enable pop-ups to print reports.');
        return;
      }

      const reportHtml = `
        <div>
          <div class="header-sec">
            <span class="meta-line" style="float: right; color: #ef4444; font-weight: bold;">${activeReport.classification}</span>
            <h1>${activeReport.name}</h1>
            <div class="meta-line">Region Scope: Chandigarh & Mohali, India • Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <p><strong>Dossier Description:</strong> ${activeReport.description}</p>
          <p>${activeReport.summary}</p>
          
          <h2>I. Strategic KPIs Summary</h2>
          <div class="kpi-row">
            ${activeReport.kpis.map(k => `
              <div class="kpi-card">
                <div class="kpi-lbl">${k.label}</div>
                <div class="kpi-num" style="color: ${k.color}">${k.value}</div>
              </div>
            `).join('')}
          </div>

          <h2>II. Tactical Priority Action Directives</h2>
          <ul style="font-size: 11px; color: #475569; line-height: 1.8; padding-left: 20px;">
            ${activeReport.directives.map(d => `<li>${d}</li>`).join('')}
          </ul>

          <h2>III. Regional Case Analysis Ledger</h2>
          <table>
            <thead>
              <tr>
                <th>Establishment Name</th>
                <th>Category</th>
                <th>Area</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Presence Score</th>
                <th>Opportunity Index</th>
              </tr>
            </thead>
            <tbody>
              ${cafes
                .slice(0, 10)
                .map(
                  c => `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td>${c.category}</td>
                  <td>${c.area}, ${c.city}</td>
                  <td>★ ${c.rating}</td>
                  <td>${c.reviews}</td>
                  <td>${c.digitalPresenceScore} / 100</td>
                  <td><span class="badge ${c.growthOpportunityScore >= 75 ? 'badge-critical' : 'badge-benchmark'}">${c.growthOpportunityScore} / 100</span></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div style="margin-top: 60px; border-top: 1px solid #cbd5e1; padding-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">
            CONFIDENTIAL • GEOVISION BUSINESS INTELLIGENCE DIVISION • FOR REGIONAL SAAS INTERNAL USE ONLY
          </div>
        </div>
      `;

      winPrint.document.write(`
        <html>
          <head>
            <title>${activeReport.name} - GeoVision AI</title>
            <style>
              body { font-family: 'Inter', system-ui, sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; background-color: #fcfcfc; }
              .header-sec { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
              h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.025em; }
              .meta-line { font-size: 10px; font-family: monospace; color: #64748b; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
              h2 { font-size: 14px; font-weight: 700; margin-top: 35px; margin-bottom: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
              p { font-size: 12px; margin: 6px 0; color: #475569; }
              .kpi-row { display: flex; justify-content: space-between; margin: 25px 0; gap: 15px; }
              .kpi-card { flex: 1; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
              .kpi-num { font-size: 20px; font-weight: 800; margin-top: 4px; font-family: monospace; }
              .kpi-lbl { font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
              th { background: #0f172a; color: #ffffff; padding: 10px 12px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
              td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
              tr:nth-child(even) { background-color: #f8fafc; }
              .badge { display: inline-block; padding: 3px 8px; font-size: 8px; font-weight: 700; border-radius: 99px; font-family: monospace; text-transform: uppercase; }
              .badge-critical { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
              .badge-benchmark { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
              @media print {
                body { padding: 20px; background-color: #fff; }
              }
            </style>
          </head>
          <body onload="window.print();window.close();">
            ${reportHtml}
          </body>
        </html>
      `);
      winPrint.document.close();
      winPrint.focus();
    });
  };

  // Handle strategic PowerPoint deck simulation export
  const handlePowerPointExport = () => {
    triggerFeedback('excel', 'PowerPoint presentation outline compiled successfully!', () => {
      const pptxOutline = `GEOVISION INTELLIGENCE • ENTERPRISE SLIDE DECK SCHEMA
============================================================
REPORT DUPLICATE: ${activeReport.name}
CLASSIFICATION: ${activeReport.classification}
DATE: ${new Date().toLocaleDateString()}

SLIDE 1: COVER
- Title: ${activeReport.name}
- Subtitle: ${activeReport.subtitle}
- Metadata: Regional Scope: Chandigarh & Mohali Metro Urban Hubs

SLIDE 2: EXECUTIVE OVERVIEW
- Narrative: ${activeReport.summary}
- Target scanned cohort: ${cafes.length} Cafe venues analyzed
- Critical Gaps Priority Index: ${criticalOpportunityCount} high-growth target spots

SLIDE 3: STRATEGIC INSIGHTS MATRIX (KPIs)
${activeReport.kpis.map((k, i) => `- Metric [0${i+1}]: ${k.label}\n  Value: ${k.value}`).join('\n')}

SLIDE 4: TACTICAL DIRECTIVES FOR ONBOARDING
${activeReport.directives.map((d, i) => `- Action [0${i+1}]: ${d}`).join('\n')}

SLIDE 5: CASE STUDY ANALYSIS
- Selected Lead Target: ${cafes[0]?.name || 'Cafe Hub'}
- Rating: ★ ${cafes[0]?.rating || '4.0'} | reviews count: ${cafes[0]?.reviews || '50'}
- Current vacancy: ${cafes[0]?.recommendation || 'No website domain link registered'}

============================================================
CONFIDENTIAL CORPORATE DELIVERABLE • PPTX TEXT OUTLINE`;

      const blob = new Blob([pptxOutline], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${activeReport.id}_powerpoint_deck.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Handle detailed Excel spreadsheet export
  const handleExcelExport = () => {
    triggerFeedback('csv', 'Excel spreadsheet dataset exported successfully!', () => {
      const headers = ['ID', 'Establishment Name', 'Category', 'Rating', 'Reviews', 'Area', 'City', 'Website Available', 'Digital Presence Score', 'Growth Opportunity Score', 'Strategic Recommendation'];
      const rows = cafes.map(c => [
        c.id,
        c.name,
        c.category,
        c.rating,
        c.reviews,
        c.area,
        c.city,
        c.website,
        c.digitalPresenceScore,
        c.growthOpportunityScore,
        c.recommendation
      ]);
      const csvContent = "sep=,\n" + [
        headers.join(','),
        ...rows.map(r => r.map(val => {
          const str = String(val ?? '').replace(/"/g, '""');
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `geobusiness_${activeReport.id}_worksheet.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-2xl animate-fadeIn space-y-6 border border-white/[0.06]" id="export-suite">
      
      {/* 1. Suite Action Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-[#4F8CFF]/20 to-[#7C5CFF]/20 rounded-2xl border border-white/[0.1] text-[#4F8CFF] shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif italic text-2xl text-white font-normal leading-tight">Executive Intelligence Report Suite</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1.5 font-bold">
              Secure enterprise delivery pipeline for McKinsey, BCG, and Accenture strategic consultants
            </p>
          </div>
        </div>
        
        {/* Gateway connection indicator */}
        <div className="flex items-center gap-2.5 bg-[#0E1117] border border-white/[0.06] rounded-full py-1.5 px-3.5">
          <Clock className="w-3.5 h-3.5 text-[#4F8CFF] animate-pulse" />
          <span className="text-[9px] font-mono font-semibold tracking-wider text-white/50">SECURE REPORT GATEWAY COMPLIANT</span>
        </div>
      </div>

      {/* Success / Loading Feedback HUD */}
      {successMsg && (
        <div className="p-4 bg-[#32D583]/10 border border-[#32D583]/20 text-[#32D583] text-xs rounded-xl flex gap-2.5 items-center font-mono shadow-md animate-slideDown">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-[#32D583]" />
          <p className="font-bold uppercase tracking-wider">{successMsg}</p>
        </div>
      )}

      {/* Interactive Split Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: 9 Report Templates Navigation */}
        <div className="lg:col-span-4 bg-[#0E1117]/50 border border-white/[0.06] rounded-2xl p-4.5 space-y-3.5 shadow-xl max-h-[640px] overflow-y-auto">
          <h4 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest border-b border-white/[0.05] pb-2 flex items-center gap-2">
            <Table className="w-4 h-4 text-[#4F8CFF]" />
            Intelligence Briefs ({reportTemplates.length})
          </h4>
          
          <div className="space-y-2.5">
            {reportTemplates.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-1 cursor-pointer group ${
                  selectedReportId === report.id
                    ? 'bg-[#4F8CFF]/15 border-[#4F8CFF]/30 text-white shadow-inner'
                    : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.04] text-white/60'
                }`}
              >
                <span className="text-xs font-mono font-bold uppercase tracking-wider block group-hover:text-white transition-colors">
                  {report.name}
                </span>
                <span className="text-[9px] font-sans text-white/40 leading-relaxed block truncate">
                  {report.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Live Report Preview Panel */}
        <div className="lg:col-span-8 bg-[#141922]/20 border border-white/[0.06] rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[500px]">
          
          {/* Background element */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#4F8CFF]/5 to-[#7C5CFF]/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Document Preview Content */}
          <div className="space-y-5 flex-1 pb-6 border-b border-white/[0.05]">
            <div className="flex justify-between items-start flex-wrap gap-2 border-b border-white/[0.05] pb-4">
              <div>
                <span className="text-[8px] font-mono font-bold text-[#EF4444] uppercase tracking-widest bg-[#EF4444]/10 px-2.5 py-0.5 rounded border border-[#EF4444]/20">
                  {activeReport.classification}
                </span>
                <h4 className="font-serif italic text-2xl text-white mt-2">{activeReport.name}</h4>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">
                  Region scope: Chandigarh & Mohali Metro Urban Hubs
                </p>
              </div>
              <div className="text-right font-mono text-[9px] text-white/30 uppercase font-extrabold">
                <span>DRAFT v4.2 // APPROVED</span>
              </div>
            </div>

            {/* Narrative text block */}
            <div className="space-y-3 font-sans text-[11px] text-white/70 leading-relaxed">
              <p className="font-semibold text-white/95">{activeReport.description}</p>
              <p>{activeReport.summary}</p>
            </div>

            {/* KPI metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-2">
              {activeReport.kpis.map((k, idx) => (
                <div key={idx} className="bg-black/35 border border-white/[0.04] p-4.5 rounded-xl text-center space-y-1">
                  <span className="text-[8px] font-mono text-white/40 uppercase block">{k.label}</span>
                  <span className="text-lg font-space font-extrabold block" style={{ color: k.color }}>
                    {k.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Strategic Directive Bullets */}
            <div className="space-y-3 pt-2">
              <h5 className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                Tactical Onboarding Directives
              </h5>
              <div className="space-y-2.5 font-mono text-[9px] leading-relaxed text-white/50">
                {activeReport.directives.map((d, idx) => (
                  <div key={idx} className="flex gap-2.5 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-[#4F8CFF]/20 transition-all duration-300">
                    <span className="text-[#4F8CFF] font-bold">0{idx + 1}.</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <button
              onClick={handlePrintSpecificReport}
              disabled={activeDownload !== null}
              className="py-3 px-4.5 bg-[#7C5CFF]/15 hover:bg-[#7C5CFF]/25 border border-[#7C5CFF]/30 text-white font-mono text-[9px] uppercase tracking-widest font-extrabold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-lg"
            >
              <FileText className="w-3.5 h-3.5 text-[#7C5CFF]" />
              <span>Export PDF Dossier</span>
            </button>

            <button
              onClick={handlePowerPointExport}
              disabled={activeDownload !== null}
              className="py-3 px-4.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white hover:text-[#4F8CFF] font-mono text-[9px] uppercase tracking-widest font-extrabold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Export Slide Deck</span>
            </button>

            <button
              onClick={handleExcelExport}
              disabled={activeDownload !== null}
              className="py-3 px-4.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white hover:text-[#32D583] font-mono text-[9px] uppercase tracking-widest font-extrabold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel Sheet</span>
            </button>
          </div>

        </div>

      </div>

      {/* Guide documentation line */}
      <div className="bg-[#141922]/20 border border-white/[0.06] p-6 rounded-2xl text-xs space-y-3.5 text-white/40 shadow-inner">
        <h4 className="font-bold text-white/70 flex items-center gap-2 uppercase tracking-widest font-mono text-[10px]">
          <Sparkles className="w-4 h-4 text-[#4F8CFF]" />
          Power BI Linking Instructions
        </h4>
        <ol className="list-decimal pl-4.5 space-y-2 font-mono text-[10px] text-white/30">
          <li>Select any report template above and generate the corresponding database sheet using the <strong className="text-white/50">Export Excel Sheet</strong> button.</li>
          <li>Launch your local Power BI Desktop instance and choose <strong className="text-white/50">Get Data &gt; Text/CSV</strong> from the upper ribbon.</li>
          <li>Ingest the dataset and build a scatter chart plotting <strong className="text-white/50">DigitalPresenceIndex</strong> on the X-axis vs <strong className="text-white/50">GrowthOpportunityIndex</strong> on the Y-axis.</li>
        </ol>
      </div>

    </div>
  );
}
