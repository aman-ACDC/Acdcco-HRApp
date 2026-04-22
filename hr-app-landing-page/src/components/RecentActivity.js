import React, { useMemo } from "react";
import "./RecentActivity.css";

function formatLastSynced(date) {
  if (!date) return "Last synced: —";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "Last synced: just now";
  if (diffSec < 60) return `Last synced: ${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Last synced: ${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Last synced: ${diffHr}h ago`;

  return `Last synced: ${date.toLocaleString()}`;
}

export default function RecentActivity({
  employees = [],
  lastSynced = null,
  onAdd = () => {},
  onViewAll = () => {},
}) {
  const stats = useMemo(() => {
    const total = employees.length;

    const active = employees.filter((e) => e.status === "Employee").length;
    const onLeave = employees.filter((e) => e.status === "On leave").length;

    return { total, active, onLeave };
  }, [employees]);

  const top = useMemo(() => {
    // Show up to 3 most recent by id (best guess without created_at)
    const arr = [...employees].filter(Boolean);
    arr.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    return arr.slice(0, 3);
  }, [employees]);

  return (
    <section className="recent-wrap">
      <div className="recent-card recent-animate">
        <div className="recent-header">
          <div>
            <h2 className="recent-title">Recent Activity</h2>
            <p className="recent-subtitle">
              Latest updates from your employee directory
            </p>
            <p className="recent-synced">{formatLastSynced(lastSynced)}</p>
          </div>

          <div className="recent-actions">
            <button className="recent-btn" onClick={onAdd}>
              + Add
            </button>
            <button className="recent-btn recent-btn-outline" onClick={onViewAll}>
              View all →
            </button>
          </div>
        </div>

        <div className="recent-pills">
          <span className="recent-pill">{stats.total} Total</span>
          <span className="recent-pill">{stats.active} Active</span>
          <span className="recent-pill">{stats.onLeave} On leave</span>
        </div>

        <div className="recent-list">
          {top.length === 0 ? (
            <div className="recent-empty">
              No employees yet. Click <b>+ Add</b> to create your first record.
            </div>
          ) : (
            top.map((e) => (
              <div key={e.id ?? e.name} className="recent-item">
                <div className="recent-item-left">
                  <div className="recent-item-name">
                    {e.name || "Unnamed"}{" "}
                    <span className="recent-dot">•</span>{" "}
                    <span className="recent-item-role">{e.title || "—"}</span>
                  </div>
                  <div className="recent-item-meta">
                    {(e.department || "—")} <span className="recent-dot">•</span>{" "}
                    {(e.status || "Inactive")}
                  </div>
                </div>

                <div className="recent-item-right">
                  <span className="recent-id">ID #{e.id ?? "—"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
