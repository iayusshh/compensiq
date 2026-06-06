"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Salaries", link: "/salaries" },
  { name: "Companies", link: "/companies" },
  { name: "Compare", link: "/compare" },
];

function CompensIQLogo() {
  return (
    <Link href="/" className="relative z-20 flex items-center px-2 py-1">
      <span className="text-[15px] font-bold tracking-tight text-slate-900">
        Compens<span className="text-indigo-600">IQ</span>
      </span>
    </Link>
  );
}

export function AppNavbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar className="sticky top-0 z-50 w-full inset-x-0 bg-white/95">
      <NavBody>
        <CompensIQLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-2">
          <NavbarButton href="/submit" variant="dark">
            Add Salary
          </NavbarButton>
          {session ? (
            <NavbarButton
              as="button"
              variant="secondary"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </NavbarButton>
          ) : (
            <NavbarButton href="/auth/login" variant="secondary">
              Sign in
            </NavbarButton>
          )}
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <CompensIQLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          {navItems.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              {item.name}
            </Link>
          ))}
          <div className="flex w-full flex-col gap-2 pt-2">
            <NavbarButton href="/submit" variant="dark" className="w-full text-center">
              Add Salary
            </NavbarButton>
            {session ? (
              <NavbarButton
                as="button"
                variant="secondary"
                className="w-full text-center"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                Sign out
              </NavbarButton>
            ) : (
              <NavbarButton href="/auth/login" variant="secondary" className="w-full text-center">
                Sign in
              </NavbarButton>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
