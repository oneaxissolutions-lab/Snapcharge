import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";

const coverItems = [
  "Premium Covers",
  "Printed Covers",
  "Transparent Covers",
  "Crossbody Straps",
  "Fine Woven Magsafe",
  "Android Covers",
  "Tech Woven",
  "Luxury Covers",
  "Silicone Covers",
  "Leather Collection Magsafe",
  "Carbon Covers",
  "Baseball Knit",
  "Metal Ring Leather",
];

const watchItems = ["Watch Straps", "Watch Cases", "Watch Chargers"];

const chargingItems = [
  "Power Bank",
  "Car Accessories",
  "Adapters",
  "Wireless Accessories",
  "Laptop Accessories",
];

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();

  const coverRoutes = {
    "Premium Covers": "/premium-covers",
    "Printed Covers": "/printed-covers",
    "Transparent Covers": "/transparent-covers",
    "Crossbody Straps": "/crossbody-straps",
    "Fine Woven Magsafe": "/fine-woven-magsafe",
    "Android Covers": "/android-covers",
    "Tech Woven": "/tech-woven",
    "Luxury Covers": "/luxury-covers",
    "Silicone Covers": "/silicone-covers",
    "Leather Collection Magsafe": "/leather-collection-magsafe",
    "Carbon Covers": "/carbon-covers",
    "Baseball Knit": "/baseball-knit",
    "Metal Ring Leather": "/metal-ring-leather",
  };

  const watchRoutes = {
    "Watch Straps": "/watch-straps",
    "Watch Cases": "/watch-cases",
    "Watch Chargers": "/watch-chargers",
  };

  const chargingRoutes = {
    "Power Bank": "/power-bank",
    "Car Accessories": "/car-accessories",
    Adapters: "/adapters",
    "Wireless Accessories": "/wireless-accessories",
    "Laptop Accessories": "/laptop-accessories",
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-[999] flex justify-center">
      <div className="w-[92%] max-w-6xl">
        <header className="rounded-[26px] bg-[#FAEBD7]/95 backdrop-blur-md border-2 border-[#9DC183] shadow-[0_12px_40px_rgba(67,96,86,0.14)]">
          <div className="flex h-[70px] items-center px-4 sm:px-6">
            <Link
              to="/"
              className="text-lg sm:text-xl font-extrabold tracking-wide text-[#436056]"
            >
              SNAP<span className="text-[#9DC183]">CHARGE</span>
            </Link>

            {/* DESKTOP */}
            <nav className="ml-auto hidden md:flex items-center gap-8 text-[15px] font-medium">
              <Dropdown
                label="Charging Solutions"
                items={chargingItems}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                name="charging"
                routes={chargingRoutes}
              />

              <Link
                to="/screen-protectors"
                className="text-[#436056] hover:text-[#9DC183] transition"
              >
                Screen Protector
              </Link>

              <Dropdown
                label="Covers"
                items={coverItems}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                name="covers"
                routes={coverRoutes}
              />

              <Dropdown
                label="Watch Accessories"
                items={watchItems}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                name="watch"
                routes={watchRoutes}
              />

              <Link
                to="/cart"
                className="relative rounded-full border border-[#8eb072] bg-[#9DC183] px-5 py-2 text-white font-semibold hover:bg-[#436056] hover:border-[#436056] transition shadow-sm"
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-[#436056] text-white text-[11px] flex items-center justify-center border border-white/30">
                    {cartCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* MOBILE BUTTON */}
            <div className="ml-auto md:hidden flex items-center gap-3">
              <Link
                to="/cart"
                className="relative rounded-full border border-[#8eb072] bg-[#9DC183] px-4 py-2 text-white text-sm font-semibold shadow-sm"
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 rounded-full bg-[#436056] text-white text-[10px] flex items-center justify-center border border-white/30">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="h-10 w-10 rounded-full border border-[#9DC183] bg-white/60 text-[#436056] text-xl flex items-center justify-center shadow-sm"
              >
                ☰
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {mobileOpen && (
            <div className="md:hidden border-t border-[#9DC183] bg-[#fffaf2] px-4 pb-4">
              <MobileSection
                title="Charging Solutions"
                items={chargingItems}
                routes={chargingRoutes}
                setMobileOpen={setMobileOpen}
              />

              <Link
                to="/screen-protectors"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-[#436056] font-medium"
              >
                Screen Protector
              </Link>

              <MobileSection
                title="Covers"
                items={coverItems}
                routes={coverRoutes}
                setMobileOpen={setMobileOpen}
              />

              <MobileSection
                title="Watch Accessories"
                items={watchItems}
                routes={watchRoutes}
                setMobileOpen={setMobileOpen}
              />
            </div>
          )}
        </header>
      </div>
    </div>
  );
};

const Dropdown = ({ label, items, openMenu, setOpenMenu, name, routes }) => {
  const isOpen = openMenu === name;

  const panelBase =
    "absolute left-0 top-full mt-4 w-64 rounded-[22px] bg-[#fffaf4] border border-[#9DC183] shadow-[0_18px_35px_rgba(0,0,0,0.10)] backdrop-blur-md transition-all duration-300 overflow-hidden z-[1000]";
  const panelState = isOpen
    ? " opacity-100 visible translate-y-0"
    : " opacity-0 invisible -translate-y-2";

  const baseClasses =
    "block px-5 py-2.5 hover:bg-[#9DC18322] hover:text-[#436056] cursor-pointer transition";

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenMenu(name)}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <button className="text-[#436056] hover:text-[#9DC183] transition flex items-center gap-1">
        {label} <span className="text-xs mt-[1px]">▾</span>
      </button>

      <div className={panelBase + panelState}>
        <ul className="py-3 text-sm text-[#2f3e38] max-h-80 overflow-y-auto">
          {items.map((item) => {
            const route = routes[item];

            if (route) {
              return (
                <li key={item}>
                  <Link to={route} className={baseClasses}>
                    {item}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item}>
                <span className={baseClasses}>{item}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const MobileSection = ({ title, items, routes, setMobileOpen }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-2 border-b border-[#dfe8d7] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-2 font-semibold text-[#436056] flex items-center justify-between"
      >
        {title}
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="pl-3 pb-1">
          {items.map((item) => (
            <Link
              key={item}
              to={routes[item]}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-[#436056] hover:text-[#9DC183] transition"
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navbar;