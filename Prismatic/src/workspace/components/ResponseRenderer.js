import { jsx as _jsx } from "react/jsx-runtime";
import ScanCard from './renderers/ScanCard';
import TransformCard from './renderers/TransformCard';
import AuditCard from './renderers/AuditCard';
/** Central dispatcher — picks the right card based on backend response type */
export default function ResponseRenderer({ message }) {
    const { responseType, data, content } = message;
    if (responseType === 'scan') {
        return _jsx(ScanCard, { data: data, summary: content });
    }
    if (responseType === 'transform') {
        return _jsx(TransformCard, { data: data, summary: content });
    }
    if (responseType === 'audit') {
        return _jsx(AuditCard, { data: data, summary: content });
    }
    // Default: plain info bubble with lightweight markdown rendering
    return (_jsx("div", { className: "ws-info-bubble", children: content.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (_jsx("div", { style: i > 0 && line.trim() === '' ? { marginTop: 8 } : undefined, children: parts.map((p, j) => p.startsWith('**') && p.endsWith('**')
                    ? _jsx("strong", { style: { color: 'var(--c-text)', fontWeight: 700 }, children: p.slice(2, -2) }, j)
                    : _jsx("span", { children: p }, j)) }, i));
        }) }));
}
