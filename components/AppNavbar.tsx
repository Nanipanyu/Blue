"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStatus } from "../hooks/useauthentication";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStatus();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Prefetch key routes to reduce perceived latency
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/create-team");
    router.prefetch("/explore");
  }, [router]);

  // Close drawer on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const nav = [
    {
      name: "Home",
      href: "/dashboard",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10.707 1.707a1 1 0 00-1.414 0l-8 8A1 1 0 002 11h1v6a1 1 0 001 1h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-8-8z" />
        </svg>
      )
    },
    {
      name: "Create Team",
      href: "/create-team",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: "Explore Teams",
      href: "/explore",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    }
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left brand: BLUE with gradient */}
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800 bg-clip-text text-transparent drop-shadow-sm select-none">
            BLUE
          </span>

          {/* Centered nav */}
          <div className="flex-1 flex justify-center h-full">
            <nav className="flex items-center space-x-2 sm:space-x-14 h-full">
              {nav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  className={classNames(
                    "flex items-center gap-1.5 text-sm px-3 h-full border-b-4 transition-colors",
                    isActive(item.href)
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-600 border-transparent hover:text-gray-700 hover:border-gray-300"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Notifications + Profile avatar */}
          <div className="relative flex items-center ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-200">
            {/* Notification bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="mr-2 sm:mr-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors relative"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {/* Unread dot (decorative for now) */}
              <span className="absolute top-1.5 right-1.5 inline-block w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>
            <button
              type="button"
              aria-label="Open profile menu"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-transparent hover:ring-blue-200 transition-all flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold shadow-sm"
              onClick={() => setDrawerOpen(true)}
            >
              {user?.avatar ? (
                <Image src={user.avatar} alt={user?.name || "Profile"} fill sizes="40px" className="object-cover" />
              ) : (
                <span className="text-sm sm:text-base">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            {drawerOpen && (
              <div className="absolute right-0 top-full mt-3 z-50">
                {/* arrow */}
                <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 shadow-md border border-gray-100" />
                <div className="relative bg-white w-80 max-w-[90vw] rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold">
                      {user?.avatar ? (
                        <Image src={user.avatar} alt={user?.name || "Profile"} fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="text-lg">{(user?.name || "U").charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-500">Signed in as</div>
                      <div className="text-base font-semibold text-gray-900 truncate">{user?.name || "User"}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                    </div>
                  </div>
                  <nav className="p-3">
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-800" onClick={() => setDrawerOpen(false)}>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a5 5 0 00-3.535 8.535A7.001 7.001 0 003 17a1 1 0 102 0 5 5 0 1110 0 1 1 0 102 0 7.001 7.001 0 00-3.465-6.465A5 5 0 0010 2z" clipRule="evenodd"/></svg>
                      </span>
                      <div>
                        <div className="text-sm font-medium">Profile</div>
                        <div className="text-xs text-gray-500">View and edit your profile</div>
                      </div>
                    </Link>
                    <Link href="/profile?tab=privacy" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-800" onClick={() => setDrawerOpen(false)}>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11.983 1.447a1 1 0 00-1.966 0l-.2 1.2a7.967 7.967 0 00-1.813.75l-1.086-.63a1 1 0 00-1.366.366l-1 1.732a1 1 0 00.366 1.366l1.086.63a7.967 7.967 0 000 1.5l-1.086.630a1 1 0 00-.366 1.366l1 1.732a1 1 0 001.366.366l1.086-.63c.57.327 1.18.582 1.813.75l.2 1.2a1 1 0 001.966 0l.2-1.2a7.967 7.967 0 001.813-.75l1.086.63a1 1 0 001.366-.366l1-1.732a1 1 0 00-.366-1.366l-1.086-.63a7.967 7.967 0 000-1.5l1.086-.63a1 1 0 00.366-1.366l-1-1.732a1 1 0 00-1.366-.366l-1.086.63a7.967 7.967 0 00-1.813-.75l-.2-1.2zM10 13a3 3 0 100-6 3 3 0 000 6z"/></svg>
                      </span>
                      <div>
                        <div className="text-sm font-medium">Account Settings</div>
                        <div className="text-xs text-gray-500">Privacy and preferences</div>
                      </div>
                    </Link>
                    <Link href="/logout" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-800" onClick={() => setDrawerOpen(false)}>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a2 2 0 012-2h6a2 2 0 012 2v3a1 1 0 11-2 0V3H5v14h6v-3a1 1 0 112 0v3a2 2 0 01-2 2H5a2 2 0 01-2-2V3zm12.293 5.293a1 1 0 011.414 1.414L14.414 12H9a1 1 0 110-2h5.414l2.293-2.293z" clipRule="evenodd"/></svg>
                      </span>
                      <div>
                        <div className="text-sm font-medium">Log out</div>
                        <div className="text-xs text-gray-500">Sign out of your account</div>
                      </div>
                    </Link>
                  </nav>
                  <div className="px-4 pb-4 text-xs text-gray-400">© {new Date().getFullYear()} BLUE</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  </header>
  {/* Right side drawer */}
    {drawerOpen && (
      <div
        className="fixed inset-0 bg-black/10 z-40"
        onClick={() => setDrawerOpen(false)}
      />
    )}
  </>
  );
}
