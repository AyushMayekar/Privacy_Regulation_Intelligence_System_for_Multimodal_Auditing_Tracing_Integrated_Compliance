import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ToggleSwitch({ checked, onChange, disabled, id }) {
    return (_jsxs("label", { className: "settings-toggle", htmlFor: id, children: [_jsx("input", { id: id, type: "checkbox", checked: checked, onChange: e => onChange(e.target.checked), disabled: disabled }), _jsx("span", { className: "settings-toggle__track" }), _jsx("span", { className: "settings-toggle__thumb" })] }));
}
