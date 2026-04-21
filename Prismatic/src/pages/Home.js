import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import '../styles/theme.css';
import '../styles/home.css';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import ScrollSection from '../components/landing/ScrollSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import DashboardPreview from '../components/landing/DashboardPreview';
import DevelopersSection from '../components/landing/DevelopersSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';
export default function Home() {
    return (_jsxs("div", { className: "home-root", children: [_jsx(Navbar, {}), _jsx(Hero, {}), _jsx(ScrollSection, {}), _jsx(FeaturesSection, {}), _jsx(DashboardPreview, {}), _jsx(DevelopersSection, {}), _jsx(CTASection, {}), _jsx(Footer, {})] }));
}
