import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
const SunIcon = () => (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "5" }), _jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }), _jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }), _jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), _jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), _jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }), _jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }), _jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), _jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })] }));
const MoonIcon = () => (_jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }) }));
export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    const scrollTo = (id) => {
        setDrawerOpen(false);
        const el = document.getElementById(id);
        if (el)
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: `pris-nav${scrolled ? ' pris-nav--scrolled' : ''}`, children: _jsxs("div", { className: "pris-nav__inner", children: [_jsx(Link, { to: "/", className: "pris-nav__logo", onClick: () => setDrawerOpen(false), children: _jsx("img", { src: "https://res.cloudinary.com/dpuqctqfl/image/upload/v1776519708/Prismatic_Logo_qzrypl.png", alt: "Prismatic" }) }), _jsxs("div", { className: "pris-nav__links", children: [_jsx(Link, { to: "/", className: "pris-nav__link", children: "Home" }), _jsx("button", { className: "pris-nav__link", onClick: () => scrollTo('features'), children: "Features" }), _jsx("button", { className: "pris-nav__link", onClick: () => scrollTo('developers'), children: "Developers" })] }), _jsxs("div", { className: "pris-nav__actions", children: [_jsx("button", { id: "theme-toggle", className: "pris-nav__theme", onClick: toggleTheme, "aria-label": "Toggle theme", children: theme === 'dark' ? _jsx(SunIcon, {}) : _jsx(MoonIcon, {}) }), _jsx("button", { className: "pris-btn pris-btn--ghost", onClick: () => navigate('/login'), children: "Sign In" }), _jsx("button", { className: "pris-btn pris-btn--primary", onClick: () => navigate('/login'), children: "Sign Up" }), _jsxs("button", { className: "pris-nav__hamburger", onClick: () => setDrawerOpen((p) => !p), "aria-label": "Menu", children: [_jsx("span", { style: drawerOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {} }), _jsx("span", { style: drawerOpen ? { opacity: 0 } : {} }), _jsx("span", { style: drawerOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {} })] })] })] }) }), _jsxs("div", { className: `pris-nav__drawer${drawerOpen ? ' open' : ''}`, children: [_jsx(Link, { to: "/", className: "pris-nav__link", onClick: () => setDrawerOpen(false), children: "Home" }), _jsx("button", { className: "pris-nav__link", onClick: () => scrollTo('features'), children: "Features" }), _jsx("button", { className: "pris-nav__link", onClick: () => scrollTo('developers'), children: "Developers" }), _jsxs("div", { style: { marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsx("button", { className: "pris-btn pris-btn--ghost", style: { justifyContent: 'center' }, onClick: () => { setDrawerOpen(false); navigate('/login'); }, children: "Sign In" }), _jsx("button", { className: "pris-btn pris-btn--primary", style: { justifyContent: 'center' }, onClick: () => { setDrawerOpen(false); navigate('/login'); }, children: "Sign Up" })] })] })] }));
}
