import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
const features = [
    {
        title: 'Intelligent Data Scanning',
        desc: 'Automatically crawl databases, APIs, file systems, and cloud storage to identify and classify sensitive PII with ML-powered accuracy.',
        icon: (_jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "var(--c-accent)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })] })),
    },
    {
        title: 'Data Transformation',
        desc: 'Anonymize, pseudonymize, and mask personal data at scale with policy-driven transformation pipelines that maintain referential integrity.',
        icon: (_jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "var(--c-accent)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("polyline", { points: "17 1 21 5 17 9" }), _jsx("path", { d: "M3 11V9a4 4 0 0 1 4-4h14" }), _jsx("polyline", { points: "7 23 3 19 7 15" }), _jsx("path", { d: "M21 13v2a4 4 0 0 1-4 4H3" })] })),
    },
    {
        title: 'Real-Time Compliance Monitoring',
        desc: 'Live dashboards track your compliance posture across GDPR, HIPAA, CCPA, SOC 2, and custom internal policies, 24/7.',
        icon: (_jsx("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "var(--c-accent)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) })),
    },
    {
        title: 'Immutable Audit Logs',
        desc: 'Every action, access, and policy decision is written to a tamperproof, timestamped audit trail — ready for regulators on demand.',
        icon: (_jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "var(--c-accent)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14 2 14 8 20 8" }), _jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), _jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" }), _jsx("polyline", { points: "10 9 9 9 8 9" })] })),
    },
    {
        title: 'Agentic Automation',
        desc: 'Deploy autonomous AI agents that handle end-to-end compliance workflows — from discovery to remediation — without human intervention.',
        icon: (_jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "var(--c-accent)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }), _jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }), _jsx("circle", { cx: "12", cy: "16", r: "1" })] })),
    },
    {
        title: 'Smart Violation Alerts',
        desc: 'Context-aware alerts surface only critical risks, reducing noise and letting your team act fast on what actually matters.',
        icon: (_jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "var(--c-accent)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }), _jsx("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" })] })),
    },
];
export default function FeaturesSection() {
    const cardRefs = useRef([]);
    useEffect(() => {
        const observers = [];
        cardRefs.current.forEach((el, i) => {
            if (!el)
                return;
            const obs = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => el.classList.add('visible'), i * 80);
                }
            }, { threshold: 0.15 });
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, []);
    return (_jsx("section", { className: "pris-features", id: "features", children: _jsxs("div", { className: "pris-features__inner", children: [_jsxs("div", { className: "pris-features__header", children: [_jsx("div", { className: "pris-label", children: "Features" }), _jsxs("h2", { className: "pris-features__title", children: ["Everything compliance", _jsx("br", {}), "teams need"] }), _jsx("p", { className: "pris-features__sub", children: "Purpose-built tools for every stage of the privacy and compliance lifecycle." })] }), _jsx("div", { className: "pris-features__grid", children: features.map((f, i) => (_jsxs("div", { ref: (el) => { cardRefs.current[i] = el; }, className: "pris-feature-card", style: { transitionDelay: `${i * 0.05}s` }, children: [_jsx("div", { className: "pris-feature-card__icon", children: f.icon }), _jsx("h3", { className: "pris-feature-card__title", children: f.title }), _jsx("p", { className: "pris-feature-card__desc", children: f.desc })] }, f.title))) })] }) }));
}
