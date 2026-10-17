"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  HeartHandshake,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import { useDemo } from "./demo-provider";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { reset, error } = useDemo();
  return (
    <div className="app">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/caseload" className="brand">
          <span className="brand-icon">
            <HeartHandshake size={23} />
          </span>
          <span>
            care manager<small>COPILOT</small>
          </span>
        </Link>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {[
            ["/caseload", "My Caseload", LayoutDashboard],
            ["/follow-ups", "Follow-through", ListChecks],
          ].map(([url, label, Icon]) => {
            const Component = Icon as typeof LayoutDashboard;
            return (
              <Link
                key={String(url)}
                href={String(url)}
                className={path.startsWith(String(url)) ? "active" : ""}
              >
                <Component size={19} />
                {String(label)}
                <ArrowUpRight size={14} />
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <span className="live-dot" /> SYNTHETIC DATA DEMO
            <p>
              A little clarity.
              <br />
              More time for people.
            </p>
          </div>
          <button
            className="reset"
            onClick={() => {
              if (
                window.confirm(
                  "Reset all demo changes and restore the fictional scenarios?",
                )
              )
                reset();
            }}
          >
            <RotateCcw size={15} /> Reset demo data
          </button>
          <div className="identity">
            <span className="avatar">SM</span>
            <div>
              Sarah Mitchell<small>Care manager · Demo</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <div className="topbar">
          <span>YOUR DAILY CARE WORKSPACE</span>
          <span className="demo-pill">
            Demo environment · Fictional clients only
          </span>
        </div>
        <main id="main">
          {error && (
            <p className="notice" role="alert">
              {error}
            </p>
          )}
          {children}
        </main>
        <footer>
          Built around people. Guided by you.
          <span>
            Suggestions support human judgement. Contact documentation is not
            compliance certification.
          </span>
        </footer>
      </div>
    </div>
  );
}
