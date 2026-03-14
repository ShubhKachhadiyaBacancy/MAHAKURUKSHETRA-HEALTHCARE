"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useState } from "react";

type CommandStyle = CSSProperties & {
  "--rotate-x": string;
  "--rotate-y": string;
  "--move-x": string;
  "--move-y": string;
};

const baseStyle: CommandStyle = {
  "--rotate-x": "-10deg",
  "--rotate-y": "14deg",
  "--move-x": "0px",
  "--move-y": "0px"
};

const readinessChecklist = [
  {
    label: "Benefits verified",
    description: "Plan and pharmacy distribution route confirmed.",
    progress: "92%"
  },
  {
    label: "PA packet assembled",
    description: "Clinical notes, labs, and payer criteria aligned.",
    progress: "84%"
  },
  {
    label: "Affordability mapped",
    description: "Copay and patient support options attached to the case.",
    progress: "76%"
  }
];

const operationalSignals = [
  { value: "14", label: "cases due by noon" },
  { value: "4", label: "payer escalations" },
  { value: "9", label: "first-fill clearances" }
];

const timeline = [
  "Enrollment complete",
  "Clinical review",
  "Coverage approved",
  "Patient ready"
];

export function TherapyCommandCenter() {
  const [style, setStyle] = useState<CommandStyle>(baseStyle);

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;

    setStyle({
      "--rotate-x": `${-8 - vertical * 12}deg`,
      "--rotate-y": `${12 + horizontal * 18}deg`,
      "--move-x": `${horizontal * 16}px`,
      "--move-y": `${vertical * 12}px`
    });
  }

  function resetTilt() {
    setStyle(baseStyle);
  }

  return (
    <div
      className="command-stage"
      onMouseLeave={resetTilt}
      onMouseMove={handlePointerMove}
    >
      <div className="command-aurora command-aurora--one" />
      <div className="command-aurora command-aurora--two" />
      <div className="command-orbit" aria-hidden>
        <span className="command-node command-node--one" />
        <span className="command-node command-node--two" />
        <span className="command-node command-node--three" />
      </div>

      <div className="command-canvas" style={style}>
        <div className="command-floating-card command-floating-card--left">
          <span className="command-pill">Copay sync</span>
          <strong>$4,280 recovered</strong>
          <p>Support options surfaced before shipment coordination began.</p>
        </div>

        <div className="command-floating-card command-floating-card--right">
          <span className="command-pill">Provider callback</span>
          <strong>11:40 AM due</strong>
          <p>Appeal narrative pending signature from the clinical team.</p>
        </div>

        <section className="command-board">
          <div className="command-board__header">
            <div>
              <span className="command-label">Live therapy command center</span>
              <h3>New start orchestration</h3>
            </div>
            <div className="command-board__status">
              <span className="command-status-dot" />
              <span>Queue healthy</span>
            </div>
          </div>

          <div className="command-board__grid">
            <div className="command-spotlight">
              <div className="command-kpi">
                <span>Therapy readiness</span>
                <strong>86%</strong>
              </div>

              <div className="command-list">
                {readinessChecklist.map((item) => (
                  <div className="command-list__row" key={item.label}>
                    <div className="command-list__copy">
                      <p>{item.label}</p>
                      <span>{item.description}</span>
                    </div>
                    <div className="command-progress">
                      <span style={{ width: item.progress }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="command-side-stack">
              {operationalSignals.map((item) => (
                <div className="command-stat" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="command-trace">
            {timeline.map((item, index) => (
              <div className="command-trace__step" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
