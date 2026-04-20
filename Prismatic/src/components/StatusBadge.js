import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function StatusBadge({ status }) {
    if (status === 'loading') {
        return (_jsxs("span", { className: "int-badge int-badge--loading", children: [_jsx("span", { className: "int-badge__dot int-badge__dot--pulse" }), "Connecting"] }));
    }
    if (status === 'connected') {
        return (_jsxs("span", { className: "int-badge int-badge--connected", children: [_jsx("span", { className: "int-badge__dot" }), "Connected"] }));
    }
    return (_jsxs("span", { className: "int-badge int-badge--disconnected", children: [_jsx("span", { className: "int-badge__dot" }), "Not Connected"] }));
}
