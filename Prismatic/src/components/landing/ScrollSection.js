import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
const ScanVisual = () => (_jsx("div", { style: { width: '100%', padding: '8px 0' }, children: ['user_data.json', 'payments_db', 'logs/access.log', 'customer_pii', 'api_responses'].map((name, i) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }, children: [_jsx("div", { style: {
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: i < 3 ? 'rgba(64,138,113,0.15)' : 'rgba(176,228,204,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }, children: _jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: i < 3 ? '#408a71' : 'rgba(176,228,204,0.35)', strokeWidth: "2", children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14 2 14 8 20 8" })] }) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: '0.78rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: 4 }, children: name }), _jsx("div", { style: { height: 4, background: 'var(--c-border)', borderRadius: 2, overflow: 'hidden' }, children: _jsx("div", { style: {
                                height: '100%',
                                width: i < 3 ? '100%' : i === 3 ? '60%' : '25%',
                                background: 'linear-gradient(90deg, #408a71, #b0e4cc)',
                                borderRadius: 2,
                                transition: 'width 1s ease',
                            } }) })] }), _jsx("div", { style: { fontSize: '0.7rem', color: i < 3 ? '#10b981' : 'var(--c-text-3)', fontWeight: 600 }, children: i < 3 ? '✓ Done' : i === 3 ? 'Scanning…' : 'Queued' })] }, name))) }));
const ComplianceVisual = () => (_jsxs("div", { style: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }, children: [[
            { label: 'GDPR', score: 94, color: '#10b981' },
            { label: 'HIPAA', score: 87, color: '#f59e0b' },
            { label: 'CCPA', score: 98, color: '#10b981' },
            { label: 'SOC2', score: 73, color: '#ef4444' },
        ].map(({ label, score, color }) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("div", { style: { width: 52, fontSize: '0.8rem', fontWeight: 700, color: 'var(--c-text)' }, children: label }), _jsx("div", { style: { flex: 1, height: 8, background: 'var(--c-border)', borderRadius: 4, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', width: `${score}%`, background: color, borderRadius: 4 } }) }), _jsxs("div", { style: { width: 36, fontSize: '0.8rem', fontWeight: 700, color, textAlign: 'right' }, children: [score, "%"] })] }, label))), _jsx("div", { style: { marginTop: 8, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }, children: _jsx("div", { style: { fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }, children: "\u2713 3 frameworks passing \u00B7 1 needs attention" }) })] }));
const PipelineVisual = () => {
    const steps = [
        { icon: '🔍', label: 'Ingest', desc: 'Collect from all sources' },
        { icon: '⚡', label: 'Analyze', desc: 'AI-powered processing' },
        { icon: '🛡️', label: 'Audit', desc: 'Policy enforcement' },
        { icon: '📋', label: 'Report', desc: 'Immutable logs' },
    ];
    return (_jsxs("div", { style: { width: '100%' }, children: [_jsx("div", { style: { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }, children: steps.map((s, i) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', flex: 1 }, children: [_jsxs("div", { style: {
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1
                            }, children: [_jsx("div", { style: {
                                        width: 44, height: 44, borderRadius: 12,
                                        background: 'var(--c-accent-dim)', border: '1.5px solid var(--c-border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.1rem',
                                    }, children: s.icon }), _jsx("div", { style: { fontSize: '0.72rem', fontWeight: 700, color: 'var(--c-text)', textAlign: 'center' }, children: s.label }), _jsx("div", { style: { fontSize: '0.65rem', color: 'var(--c-text-3)', textAlign: 'center' }, children: s.desc })] }), i < steps.length - 1 && (_jsx("div", { style: {
                                width: 20, height: 2,
                                background: 'linear-gradient(90deg, var(--c-accent), transparent)',
                                flex: '0 0 auto', margin: '0 2px',
                            } }))] }, s.label))) }), _jsx("div", { style: { padding: '10px 14px', background: 'var(--c-accent-dim)', borderRadius: 8, border: '1px solid var(--c-border)' }, children: _jsx("code", { style: { fontSize: '0.75rem', color: 'var(--c-accent)' }, children: "agent.run(pipeline=\"gdpr-audit\", scope=\"all_sources\")" }) })] }));
};
const steps = [
    {
        num: '01 — What it does',
        heading: 'Comprehensive Data Discovery & Scanning',
        body: 'Prismatic automatically discovers and scans your entire data landscape — databases, APIs, file systems, and cloud services. Our AI identifies personal data, classifies sensitivity levels, and maps data flows in real time.',
        pills: ['Database Scanning', 'API Discovery', 'PII Detection', 'Cloud Integration'],
        visual: _jsx(ScanVisual, {}),
    },
    {
        num: '02 — Why it matters',
        heading: 'Stay Ahead of Compliance Risk',
        body: 'Regulatory violations cost enterprises millions. Prismatic gives you a live compliance scorecard across GDPR, HIPAA, CCPA, and more — identifying gaps before auditors do, with actionable remediation steps.',
        pills: ['GDPR', 'HIPAA', 'CCPA', 'SOC 2', 'ISO 27701'],
        reversed: true,
        visual: _jsx(ComplianceVisual, {}),
    },
    {
        num: '03 — How it works',
        heading: 'Agentic AI Pipeline, End to End',
        body: 'Powered by autonomous AI agents, Prismatic ingests, analyzes, and enforces policies continuously. Every action is logged to an immutable audit trail — giving you proof of compliance at any moment.',
        pills: ['Autonomous Agents', 'Real-Time Processing', 'Immutable Logs', 'One-Click Reports'],
        visual: _jsx(PipelineVisual, {}),
    },
];
export default function ScrollSection() {
    const refs = useRef([]);
    useEffect(() => {
        const observers = [];
        refs.current.forEach((el) => {
            if (!el)
                return;
            const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting)
                el.classList.add('visible'); }, { threshold: 0.2 });
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, []);
    return (_jsx("section", { className: "pris-scroll", id: "how-it-works", children: _jsxs("div", { className: "pris-scroll__inner", children: [_jsxs("div", { className: "pris-scroll__header", children: [_jsx("div", { className: "pris-label", children: "How It Works" }), _jsxs("h2", { className: "pris-scroll__title", children: ["Intelligence built for", _jsx("br", {}), "modern privacy challenges"] }), _jsx("p", { className: "pris-scroll__sub", children: "From discovery to audit, Prismatic handles the full compliance lifecycle so your team can focus on what matters." })] }), _jsx("div", { className: "pris-scroll__steps", children: steps.map((step, i) => (_jsxs("div", { ref: (el) => { refs.current[i] = el; }, className: `pris-scroll__step${step.reversed ? ' reversed' : ''}`, style: { transitionDelay: `${i * 0.08}s` }, children: [_jsxs("div", { className: "pris-scroll__step-text", children: [_jsx("div", { className: "pris-scroll__step-num", children: step.num }), _jsx("h3", { className: "pris-scroll__step-h", children: step.heading }), _jsx("p", { className: "pris-scroll__step-p", children: step.body }), _jsx("div", { className: "pris-scroll__step-pills", children: step.pills.map((p) => (_jsx("span", { className: "pris-scroll__pill", children: p }, p))) })] }), _jsx("div", { className: "pris-scroll__visual", children: step.visual })] }, step.num))) })] }) }));
}
