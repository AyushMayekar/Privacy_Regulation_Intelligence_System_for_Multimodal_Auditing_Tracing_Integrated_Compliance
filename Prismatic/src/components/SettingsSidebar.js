import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const UserIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }), _jsx("circle", { cx: "12", cy: "7", r: "4" })] }));
const OrgIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }), _jsx("polyline", { points: "9 22 9 12 15 12 15 22" })] }));
const LockIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }), _jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })] }));
const IntIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "2", y: "2", width: "9", height: "9", rx: "1" }), _jsx("rect", { x: "13", y: "2", width: "9", height: "9", rx: "1" }), _jsx("rect", { x: "2", y: "13", width: "9", height: "9", rx: "1" }), _jsx("rect", { x: "13", y: "13", width: "9", height: "9", rx: "1" })] }));
const PrefIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "3" }), _jsx("path", { d: "M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" })] }));
const DangerIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), _jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), _jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })] }));
const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: _jsx(UserIcon, {}) },
    { id: 'organization', label: 'Organization', icon: _jsx(OrgIcon, {}) },
    { id: 'security', label: 'Security', icon: _jsx(LockIcon, {}) },
    { id: 'integrations', label: 'Integrations', icon: _jsx(IntIcon, {}) },
    { id: 'preferences', label: 'Preferences', icon: _jsx(PrefIcon, {}) },
    { id: 'danger', label: 'Danger Zone', icon: _jsx(DangerIcon, {}), danger: true },
];
export default function SettingsSidebar({ active, onSelect }) {
    return (_jsxs("nav", { className: "settings-nav", children: [_jsx("p", { className: "settings-nav__label", children: "Settings" }), _jsx("ul", { className: "settings-nav__list", children: SECTIONS.map((s, i) => (_jsxs(_Fragment, { children: [i === SECTIONS.length - 1 && _jsx("div", { className: "settings-nav__divider" }, "div"), _jsx("li", { children: _jsxs("button", { className: [
                                    'settings-nav__item',
                                    active === s.id ? 'settings-nav__item--active' : '',
                                    s.danger ? 'settings-nav__item--danger' : '',
                                ].join(' '), onClick: () => onSelect(s.id), children: [s.icon, s.label] }) }, s.id)] }))) })] }));
}
