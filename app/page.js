"use client";

import { useEffect, useMemo, useState } from "react";

const APP_KEY = "kine-expert-roubaix-running-app";

const BRAND = {
  bg: "#050505",
  panel: "#111111",
  panel2: "#181818",
  border: "#2a2a2a",
  text: "#ffffff",
  muted: "#a1a1aa",
  red: "#e11d2e",
  redSoft: "#7f1d1d",
  green: "#16a34a",
  orange: "#f59e0b",
};


const initialPatient = {
  firstName: "",
  lastName: "",
  age: "",
  weight: "",
  height: "",
  sex: "",
  job: "",
  runningHistory: "",
  objective: "",
  eventDate: "",
  weeklyKm: "",
  weeklySessions: "",
  painZone: "",
  painLevel: "",
  shoes: "",
  notes: "",  
};

const initialScores = {
  anamnesis: {
    progression: 0,
    blessures: 0,
    coherence: 0,
    hygiene: 0,
  },
  mobility: {
    cheville: 0,
    hanche: 0,
    unipodal: 0,
    gainage: 0,
  },
  technique: {
    cadence: 0,
    attaque: 0,
    oscillation: 0,
    alignement: 0,
    dynamisme: 0,
  },
  physical: {
    force: 0,
    plyo: 0,
    enduranceMuscu: 0,
    cardio: 0,
  },
  load: {
    progressivite: 0,
    regularite: 0,
    recuperation: 0,
  },
};

const initialComments = {
  anamnesis: {
    progression: "",
    blessures: "",
    coherence: "",
    hygiene: "",
  },
  mobility: {
    cheville: "",
    hanche: "",
    unipodal: "",
    gainage: "",
  },
  technique: {
    cadence: "",
    attaque: "",
    oscillation: "",
    alignement: "",
    dynamisme: "",
  },
  physical: {
    force: "",
    plyo: "",
    enduranceMuscu: "",
    cardio: "",
  },
  load: {
    progressivite: "",
    regularite: "",
    recuperation: "",
  },
};

const sections = [
  {
    id: "patient",
    title: "Patient",
  },
  {
    id: "anamnesis",
    title: "Anamnèse",
    max: 20,
    items: [
      { key: "progression", label: "Progression de charge", hint: "Pics, hausse récente, cohérence" },
      { key: "blessures", label: "Historique de blessures", hint: "Récidive, blessure en cours" },
      { key: "coherence", label: "Cohérence objectif / niveau", hint: "Objectif réaliste ou non" },
      { key: "hygiene", label: "Hygiène de vie / récupération", hint: "Sommeil, stress, récup" },
    ],
  },
  {
    id: "mobility",
    title: "Mobilité & contrôle",
    max: 20,
    items: [
      { key: "cheville", label: "Cheville", hint: "Mobilité utile à la course" },
      { key: "hanche", label: "Hanche", hint: "Extension, rotation, contrôle" },
      { key: "unipodal", label: "Contrôle unipodal", hint: "Squat, valgus, stabilité" },
      { key: "gainage", label: "Gainage / tronc", hint: "Contrôle lombo-pelvien" },
    ],
  },
  {
    id: "technique",
    title: "Technique de course",
    max: 25,
    items: [
      { key: "cadence", label: "Cadence", hint: "Efficience, contrainte mécanique" },
      { key: "attaque", label: "Attaque / overstride", hint: "Placement du pied" },
      { key: "oscillation", label: "Oscillation verticale", hint: "Économie de course" },
      { key: "alignement", label: "Alignement dynamique", hint: "Genou, bassin, tronc" },
      { key: "dynamisme", label: "Dynamisme / temps de contact", hint: "Réactivité, légèreté" },
    ],
  },
  {
    id: "physical",
    title: "Capacités physiques",
    max: 20,
    items: [
      { key: "force", label: "Force unipodale", hint: "Squat, pont, mollets" },
      { key: "plyo", label: "Plyométrie", hint: "Hop test, restitution" },
      { key: "enduranceMuscu", label: "Endurance musculaire", hint: "Fatigue locale" },
      { key: "cardio", label: "Endurance cardio", hint: "Capacité aérobie" },
    ],
  },
  {
    id: "load",
    title: "Gestion de charge",
    max: 15,
    items: [
      { key: "progressivite", label: "Progressivité", hint: "Montée de charge" },
      { key: "regularite", label: "Régularité", hint: "Continuité des semaines" },
      { key: "recuperation", label: "Charge / récupération", hint: "Repos, tolérance" },
    ],
  },
  {
    id: "results",
    title: "Résultats",
  },
];

function sumCategory(obj) {
  return Object.values(obj).reduce((a, b) => a + Number(b || 0), 0);
}

function getLevel(score) {
  if (score < 50) return { label: "Risque élevé", color: BRAND.red };
  if (score < 65) return { label: "Fragile", color: BRAND.orange };
  if (score < 80) return { label: "Intermédiaire", color: "#facc15" };
  if (score < 90) return { label: "Bon niveau", color: BRAND.green };
  return { label: "Optimisé", color: "#38bdf8" };
}

function fullName(patient) {
  return [patient.firstName, patient.lastName].filter(Boolean).join(" ").trim() || "Nouveau patient";
}

function buildRecommendations(scores) {
  const recos = [];

  if (scores.load.progressivite <= 2 || scores.load.regularite <= 2) {
    recos.push("Sécuriser la charge : réduire les pics, stabiliser 2 à 3 semaines, reconstruire progressivement.");
  }
  if (scores.mobility.cheville <= 2) {
    recos.push("Améliorer la mobilité de cheville : genou-au-mur, travail spécifique cheville-pied 4 à 5 fois/semaine.");
  }
  if (scores.mobility.hanche <= 2 || scores.mobility.unipodal <= 2) {
    recos.push("Renforcer le contrôle proximal : abducteurs, extenseurs de hanche, stabilité unipodale.");
  }
  if (scores.technique.cadence <= 2 || scores.technique.attaque <= 2) {
    recos.push("Optimiser la mécanique : tester +5 à 7 % de cadence et limiter l’overstride.");
  }
  if (scores.technique.oscillation <= 2 || scores.technique.dynamisme <= 2) {
    recos.push("Améliorer l’économie de course : éducatifs, travail de pied, appuis réactifs.");
  }
  if (scores.physical.force <= 2 || scores.physical.enduranceMuscu <= 2) {
    recos.push("Développer la force spécifique : mollets, chaîne postérieure, fessiers, tronc, 2 fois/semaine.");
  }
  if (scores.physical.cardio <= 2) {
    recos.push("Recaler le travail aérobie : base d’endurance stable avant d’augmenter l’intensité.");
  }
  if (scores.anamnesis.hygiene <= 2) {
    recos.push("Renforcer la récupération : sommeil, nutrition, monitoring de fatigue.");
  }
  if (scores.anamnesis.blessures <= 2) {
    recos.push("Surveiller le risque de récidive : progression prudente et critères de douleur tolérable.");
  }

  if (recos.length === 0) {
    recos.push("Profil globalement solide : consolider les acquis et optimiser finement la performance.");
  }

  return recos.slice(0, 6);
}

function buildSynthesis(patient, totals, totalScore) {
  const ordered = Object.entries(totals).sort((a, b) => a[1] - b[1]);
  const weakest = ordered[0]?.[0];
  const strongest = [...ordered].reverse()[0]?.[0];

  const labelMap = {
    anamnesis: "l’anamnèse et le contexte",
    mobility: "la mobilité et le contrôle",
    technique: "la technique de course",
    physical: "les capacités physiques",
    load: "la gestion de charge",
  };

  return `Le bilan de ${fullName(patient)} met en évidence un profil ${getLevel(totalScore).label.toLowerCase()}. Le principal levier de progression concerne ${labelMap[weakest]}. Le point le plus solide concerne ${labelMap[strongest]}. L’objectif est de transformer ce bilan en plan d’action simple, progressif et mesurable sur les 4 à 8 prochaines semaines.`;
}

function RadarSimple({ totals }) {
  const width = 360;
  const height = 320;
  const cx = 180;
  const cy = 150;
  const radius = 95;

  const data = [
    { label: "Anamnèse", value: totals.anamnesis, max: 20, angle: -90 },
    { label: "Mobilité", value: totals.mobility, max: 20, angle: -18 },
    { label: "Technique", value: totals.technique, max: 25, angle: 54 },
    { label: "Physique", value: totals.physical, max: 20, angle: 126 },
    { label: "Charge", value: totals.load, max: 15, angle: 198 },
  ];

  const point = (angleDeg, r) => {
    const a = (Math.PI / 180) * angleDeg;
    return {
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
    };
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const poly = data
    .map((d) => {
      const p = point(d.angle, radius * (d.value / d.max));
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: 360, height: "auto" }}>
      {rings.map((ring, idx) => {
        const pts = data
          .map((d) => {
            const p = point(d.angle, radius * ring);
            return `${p.x},${p.y}`;
          })
          .join(" ");
        return (
          <polygon
            key={idx}
            points={pts}
            fill="none"
            stroke="#333"
            strokeWidth="1"
          />
        );
      })}

      {data.map((d, idx) => {
        const p = point(d.angle, radius);
        return (
          <line
            key={idx}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#333"
            strokeWidth="1"
          />
        );
      })}

      <polygon points={poly} fill={BRAND.red} fillOpacity="0.35" stroke={BRAND.red} strokeWidth="2" />

      {data.map((d, idx) => {
        const p = point(d.angle, radius + 26);
        return (
          <text
            key={idx}
            x={p.x}
            y={p.y}
            fill="#bbb"
            fontSize="12"
            textAnchor="middle"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={styles.input}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={styles.textarea}
      />
    </div>
  );
}

function ScoreItem({ label, hint, value, onChange, comment, onCommentChange }) {
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <div style={{ color: BRAND.text, fontWeight: 700, fontSize: 17 }}>{label}</div>
          <div style={{ color: BRAND.muted, fontSize: 13, marginTop: 4 }}>{hint}</div>
        </div>
        <div style={styles.badge}>{value}/5</div>
      </div>

      <input
        type="range"
        min="0"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", marginTop: 16, accentColor: BRAND.red }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", color: BRAND.muted, fontSize: 12, marginTop: 6 }}>
        <span>Faible</span>
        <span>Excellent</span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Commentaire clinique optionnel"
        style={{ ...styles.textarea, marginTop: 14, minHeight: 84 }}
      />
    </div>
  );
}

export default function Page() {
  const [patient, setPatient] = useState(initialPatient);
  const [scores, setScores] = useState(initialScores);
  const [comments, setComments] = useState(initialComments);
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState("bilan");

  useEffect(() => {
    const raw = localStorage.getItem(APP_KEY);
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(APP_KEY, JSON.stringify(history));
  }, [history]);

  const totals = useMemo(
    () => ({
      anamnesis: sumCategory(scores.anamnesis),
      mobility: sumCategory(scores.mobility),
      technique: sumCategory(scores.technique),
      physical: sumCategory(scores.physical),
      load: sumCategory(scores.load),
    }),
    [scores]
  );

  const totalScore = useMemo(() => Object.values(totals).reduce((a, b) => a + b, 0), [totals]);
  const level = getLevel(totalScore);
  const recommendations = useMemo(() => buildRecommendations(scores), [scores]);
  const synthesis = useMemo(() => buildSynthesis(patient, totals, totalScore), [patient, totals, totalScore]);

  const currentSection = sections[step];

  function updateScore(category, key, value) {
    setScores((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  }

  function updateComment(category, key, value) {
    setComments((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  }

  function resetForm() {
    setPatient(initialPatient);
    setScores(initialScores);
    setComments(initialComments);
    setStep(0);
    setTab("bilan");
  }

  function saveAssessment() {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      patient,
      scores,
      comments,
      totals,
      totalScore,
      synthesis,
      recommendations,
    };
    setHistory((prev) => [entry, ...prev]);
    alert("Bilan enregistré.");
  }

  function loadAssessment(entry) {
    setPatient(entry.patient);
    setScores(entry.scores);
    setComments(entry.comments);
    setStep(sections.length - 1);
    setTab("bilan");
  }

  function exportPrint() {
  const weakest = Object.entries(totals).sort((a, b) => a[1] - b[1])[0]?.[0];
  const strongest = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];

  const labelMap = {
    anamnesis: "Anamnèse",
    mobility: "Mobilité & contrôle",
    technique: "Technique de course",
    physical: "Capacités physiques",
    load: "Gestion de charge",
  };

  const radarSvg = (() => {
    const width = 420;
    const height = 320;
    const cx = 210;
    const cy = 150;
    const radius = 95;

    const data = [
      { label: "Anamnèse", value: totals.anamnesis, max: 20, angle: -90 },
      { label: "Mobilité", value: totals.mobility, max: 20, angle: -18 },
      { label: "Technique", value: totals.technique, max: 25, angle: 54 },
      { label: "Physique", value: totals.physical, max: 20, angle: 126 },
      { label: "Charge", value: totals.load, max: 15, angle: 198 },
    ];

    const point = (angleDeg, r) => {
      const a = (Math.PI / 180) * angleDeg;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    };

    const ringPoints = (ring) =>
      data
        .map((d) => {
          const p = point(d.angle, radius * ring);
          return `${p.x},${p.y}`;
        })
        .join(" ");

    const poly = data
      .map((d) => {
        const p = point(d.angle, radius * (d.value / d.max));
        return `${p.x},${p.y}`;
      })
      .join(" ");

    return `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${ringPoints(0.25)}" fill="none" stroke="#d4d4d8" stroke-width="1" />
        <polygon points="${ringPoints(0.5)}" fill="none" stroke="#d4d4d8" stroke-width="1" />
        <polygon points="${ringPoints(0.75)}" fill="none" stroke="#d4d4d8" stroke-width="1" />
        <polygon points="${ringPoints(1)}" fill="none" stroke="#d4d4d8" stroke-width="1" />
        ${data
          .map((d) => {
            const p = point(d.angle, radius);
            return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#d4d4d8" stroke-width="1" />`;
          })
          .join("")}
        <polygon points="${poly}" fill="#e11d2e" fill-opacity="0.28" stroke="#e11d2e" stroke-width="2.5" />
        ${data
          .map((d) => {
            const p = point(d.angle, radius + 28);
            return `<text x="${p.x}" y="${p.y}" text-anchor="middle" font-size="12" fill="#52525b" font-family="Arial, sans-serif">${d.label}</text>`;
          })
          .join("")}
      </svg>
    `;
  })();

  const html = `
  <html>
    <head>
      <title>Bilan Running V4</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        @page { size: A4; margin: 12mm; }
        :root {
          --black: #0b0b0b;
          --red: #e11d2e;
          --text: #111827;
          --muted: #6b7280;
          --line: #e5e7eb;
          --soft: #f8fafc;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
          margin: 0;
          color: var(--text);
          background: #fff;
        }
        .page {
          max-width: 820px;
          margin: 0 auto;
        }
        .topband {
          height: 8px;
          background: var(--red);
          border-radius: 999px;
          margin-bottom: 18px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 18px;
        }
        .brand {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: 0.2px;
        }
        .brand .red { color: var(--red); }
        .subtitle {
          color: var(--muted);
          font-size: 14px;
          margin-top: 6px;
        }
        .meta {
          text-align: right;
          font-size: 12px;
          color: var(--muted);
        }
        .hero {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .card {
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 18px;
          background: #fff;
        }
        .card-dark {
          background: var(--black);
          color: white;
          border-radius: 20px;
          padding: 20px;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.7px;
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 8px;
        }
        .card-dark .eyebrow { color: #d4d4d8; }
        .name {
          font-size: 26px;
          font-weight: 900;
          margin: 0 0 12px;
        }
        .score {
          font-size: 58px;
          font-weight: 900;
          line-height: 0.95;
          color: var(--red);
          margin: 6px 0 10px;
        }
        .pill {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: white;
          font-weight: 800;
          font-size: 13px;
        }
        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .small-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 14px;
        }
        .small-box {
          background: var(--soft);
          border: 1px solid #eef2f7;
          border-radius: 16px;
          padding: 12px;
        }
        h2 {
          margin: 0 0 12px;
          font-size: 18px;
        }
        p {
          margin: 0;
          line-height: 1.65;
          font-size: 14px;
        }
        ul {
          margin: 0;
          padding-left: 18px;
        }
        li {
          margin-bottom: 10px;
          line-height: 1.55;
          font-size: 14px;
        }
        .radar-wrap {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th, td {
          border-bottom: 1px solid var(--line);
          padding: 12px 8px;
          text-align: left;
          font-size: 14px;
        }
        th {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--muted);
          font-weight: 800;
        }
        .footer {
          margin-top: 18px;
          padding-top: 12px;
          border-top: 1px solid var(--line);
          color: var(--muted);
          font-size: 11px;
          text-align: center;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="topband"></div>

        <div class="header">
          <div>
            <div class="brand">KINÉ <span class="red">EXPERT</span> ROUBAIX</div>
            <div class="subtitle">Bilan course à pied — Analyse & performance</div>
          </div>
          <div class="meta">
            <div>Document de restitution clinique</div>
            <div>${new Date().toLocaleDateString("fr-FR")}</div>
          </div>
        </div>

        <div class="hero">
          <div class="card">
            <div class="eyebrow">Patient</div>
            <div class="name">${fullName(patient)}</div>
            <p><strong>Objectif :</strong> ${patient.objective || "Non renseigné"}</p>
            <p><strong>Date objectif :</strong> ${patient.eventDate || "-"}</p>
            <p><strong>Volume hebdomadaire :</strong> ${patient.weeklyKm || "-"} km</p>
            <p><strong>Séances / semaine :</strong> ${patient.weeklySessions || "-"}</p>

            <div class="small-grid">
              <div class="small-box">
                <div class="eyebrow">Levier prioritaire</div>
                <p><strong>${labelMap[weakest] || "-"}</strong></p>
              </div>
              <div class="small-box">
                <div class="eyebrow">Point fort</div>
                <p><strong>${labelMap[strongest] || "-"}</strong></p>
              </div>
            </div>
          </div>

          <div class="card-dark">
            <div class="eyebrow">Score global</div>
            <div class="score">${totalScore}/100</div>
            <div class="pill">${level.label}</div>
          </div>
        </div>

        <div class="grid2">
          <div class="card">
            <h2>Synthèse clinique</h2>
            <p>${synthesis}</p>
          </div>
          <div class="card">
            <h2>Radar clinique</h2>
            <div class="radar-wrap">${radarSvg}</div>
          </div>
        </div>

        <div class="grid2">
          <div class="card">
            <h2>Plan d’action prioritaire</h2>
            <ul>
              ${recommendations.map((r) => `<li>${r}</li>`).join("")}
            </ul>
          </div>
          <div class="card">
            <h2>Scores par domaine</h2>
            <table>
              <thead>
                <tr><th>Domaine</th><th>Score</th></tr>
              </thead>
              <tbody>
                <tr><td>Anamnèse</td><td>${totals.anamnesis}/20</td></tr>
                <tr><td>Mobilité & contrôle</td><td>${totals.mobility}/20</td></tr>
                <tr><td>Technique de course</td><td>${totals.technique}/25</td></tr>
                <tr><td>Capacités physiques</td><td>${totals.physical}/20</td></tr>
                <tr><td>Gestion de charge</td><td>${totals.load}/15</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h2>Notes complémentaires</h2>
          <p>${patient.notes || "Aucune note complémentaire."}</p>
        </div>

        <div class="footer">
          Document généré par Kiné Expert Roubaix — version V4 cabinet premium
        </div>
      </div>
    </body>
  </html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}

  function renderPatient() {
    return (
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Identité & contexte</div>
          <div style={styles.grid2}>
            <InputField
              label="Prénom"
              value={patient.firstName}
              onChange={(e) => setPatient({ ...patient, firstName: e.target.value })}
            />
            <InputField
              label="Nom"
              value={patient.lastName}
              onChange={(e) => setPatient({ ...patient, lastName: e.target.value })}
            />
            <InputField
              label="Objectif sportif"
              value={patient.objective}
              onChange={(e) => setPatient({ ...patient, objective: e.target.value })}
              placeholder="Ex : Marathon < 4h"
            />
            <InputField
              label="Date objectif"
              type="date"
              value={patient.eventDate}
              onChange={(e) => setPatient({ ...patient, eventDate: e.target.value })}
            />
            <InputField
              label="Kilométrage hebdo"
              value={patient.weeklyKm}
              onChange={(e) => setPatient({ ...patient, weeklyKm: e.target.value })}
              placeholder="Ex : 35"
            />
            <InputField
              label="Séances / semaine"
              value={patient.weeklySessions}
              onChange={(e) => setPatient({ ...patient, weeklySessions: e.target.value })}
              placeholder="Ex : 3"
            />
            <InputField
              label="Zone douloureuse"
              value={patient.painZone}
              onChange={(e) => setPatient({ ...patient, painZone: e.target.value })}
              placeholder="Ex : tendon d’Achille droit"
            />
            <InputField
              label="Douleur /10"
              value={patient.painLevel}
              onChange={(e) => setPatient({ ...patient, painLevel: e.target.value })}
              placeholder="Ex : 3"
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <InputField
              label="Chaussures / rotation"
              value={patient.shoes}
              onChange={(e) => setPatient({ ...patient, shoes: e.target.value })}
              placeholder="Ex : Novablast, Vaporfly..."
            />
          </div>
<div style={{ marginTop: 16 }}>
  <TextAreaField
    label="Historique de course"
    value={patient.runningHistory}
    onChange={(e) => setPatient({ ...patient, runningHistory: e.target.value })}
    placeholder="Ancienneté en course à pied, distances habituelles, niveau, fréquence, antécédents sportifs..."
  />
</div>
          <div style={{ marginTop: 16 }}>
            <TextAreaField
              label="Notes cliniques"
              value={patient.notes}
              onChange={(e) => setPatient({ ...patient, notes: e.target.value })}
              placeholder="Anamnèse libre, éléments clés, conduite à tenir"
            />
          </div>
        </div>
      </div>
    );
  }

  function renderScoreSection(section) {
    return (
      <div style={styles.layoutScore}>
        <div>
          {section.items.map((item) => (
            <ScoreItem
              key={item.key}
              label={item.label}
              hint={item.hint}
              value={scores[section.id][item.key]}
              onChange={(val) => updateScore(section.id, item.key, val)}
              comment={comments[section.id][item.key]}
              onCommentChange={(val) => updateComment(section.id, item.key, val)}
            />
          ))}
        </div>

        <div style={styles.cardSticky}>
          <div style={styles.sectionTitle}>{section.title}</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: BRAND.text }}>
            {totals[section.id]}/{section.max}
          </div>
          <div style={styles.progressWrap}>
            <div
              style={{
                ...styles.progressBar,
                width: `${(totals[section.id] / section.max) * 100}%`,
              }}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            {section.items.map((item) => (
              <div key={item.key} style={styles.rowStat}>
                <span style={{ color: BRAND.muted }}>{item.label}</span>
                <span style={{ color: BRAND.text, fontWeight: 700 }}>{scores[section.id][item.key]}/5</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderResults() {
    return (
      <div>
        <div style={styles.resultsTop}>
          <div style={styles.heroCard}>
            <div style={{ color: BRAND.muted, fontSize: 14 }}>Restitution finale</div>
            <div style={{ color: BRAND.text, fontSize: 34, fontWeight: 800, marginTop: 8 }}>
              {fullName(patient)}
            </div>
            <div style={{ color: BRAND.muted, marginTop: 8 }}>
              {patient.objective || "Objectif non renseigné"}
            </div>

            <div style={styles.heroGrid}>
              <div style={styles.heroMini}>
                <div style={{ color: BRAND.muted, fontSize: 13 }}>Score global</div>
                <div style={{ color: level.color, fontSize: 48, fontWeight: 900, marginTop: 8 }}>
                  {totalScore}/100
                </div>
              </div>
              <div style={styles.heroMini}>
                <div style={{ color: BRAND.muted, fontSize: 13 }}>Profil</div>
                <div style={{ color: BRAND.text, fontSize: 24, fontWeight: 800, marginTop: 18 }}>
                  {level.label}
                </div>
              </div>
              <div style={styles.heroMini}>
                <div style={{ color: BRAND.muted, fontSize: 13 }}>Objectif</div>
                <div style={{ color: BRAND.text, fontSize: 18, fontWeight: 700, marginTop: 18 }}>
                  {patient.objective || "À préciser"}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Radar clinique</div>
            <div style={{ color: BRAND.muted, fontSize: 14, marginBottom: 10 }}>
              Support visuel premium pour la restitution patient
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <RadarSimple totals={totals} />
            </div>
          </div>
        </div>

        <div style={styles.resultsGrid}>
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Synthèse clinique</div>
            <p style={styles.paragraph}>{synthesis}</p>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Recommandations automatiques</div>
            <div style={{ display: "grid", gap: 10 }}>
              {recommendations.map((r, i) => (
                <div key={i} style={styles.recoItem}>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.resultsGrid}>
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Scores détaillés</div>
            {[
              ["Anamnèse", totals.anamnesis, 20],
              ["Mobilité & contrôle", totals.mobility, 20],
              ["Technique de course", totals.technique, 25],
              ["Capacités physiques", totals.physical, 20],
              ["Gestion de charge", totals.load, 15],
            ].map(([name, score, max]) => (
              <div key={name} style={{ marginBottom: 14 }}>
                <div style={styles.rowStat}>
                  <span style={{ color: BRAND.text, fontWeight: 700 }}>{name}</span>
                  <span style={{ color: BRAND.muted }}>{score}/{max}</span>
                </div>
                <div style={styles.progressWrap}>
                  <div
                    style={{
                      ...styles.progressBar,
                      width: `${(score / max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Notes patient</div>
            <p style={styles.paragraph}>
              {patient.notes || "Aucune note complémentaire."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.brandPill}>KINÉ EXPERT ROUBAIX</div>
            <h1 style={styles.h1}>
              Bilan course à pied – version cabinet premium
            </h1>
            <p style={styles.subtitle}>
              Saisie tactile, scoring intelligent, restitution premium et historique patient.
            </p>
          </div>

          <div style={styles.actions}>
            <button style={styles.secondaryBtn} onClick={resetForm}>Nouveau bilan</button>
            <button style={styles.secondaryBtn} onClick={saveAssessment}>Enregistrer</button>
            <button style={styles.primaryBtn} onClick={exportPrint}>Imprimer / PDF</button>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            style={tab === "bilan" ? styles.tabActive : styles.tab}
            onClick={() => setTab("bilan")}
          >
            Bilan en cours
          </button>
          <button
            style={tab === "patients" ? styles.tabActive : styles.tab}
            onClick={() => setTab("patients")}
          >
            Historique patients
          </button>
        </div>

        {tab === "patients" ? (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Historique</div>
            {history.length === 0 ? (
              <div style={{ color: BRAND.muted }}>Aucun bilan enregistré.</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {history.map((entry) => (
                  <div key={entry.id} style={styles.historyItem}>
                    <div>
                      <div style={{ color: BRAND.text, fontWeight: 800 }}>
                        {fullName(entry.patient)}
                      </div>
                      <div style={{ color: BRAND.muted, fontSize: 14, marginTop: 4 }}>
                        {entry.patient.objective || "Objectif non renseigné"}
                      </div>
                      <div style={{ color: BRAND.muted, fontSize: 12, marginTop: 6 }}>
                        {new Date(entry.date).toLocaleDateString("fr-FR")} • {entry.totalScore}/100
                      </div>
                    </div>
                    <button style={styles.secondaryBtn} onClick={() => loadAssessment(entry)}>
                      Ouvrir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={styles.mainGrid}>
            <div style={styles.sidebar}>
              <div style={styles.cardSticky}>
                <div style={styles.sectionTitle}>Parcours bilan</div>

                <div style={{ display: "grid", gap: 10 }}>
                  {sections.map((section, index) => {
                    const active = step === index;
                    const scoreText = section.max ? `${totals[section.id] || 0}/${section.max}` : "";
                    return (
                      <button
                        key={section.id}
                        onClick={() => setStep(index)}
                        style={active ? styles.navActive : styles.navItem}
                      >
                        <div>
                          <div style={{ fontWeight: 800 }}>{section.title}</div>
                          {section.max ? (
                            <div style={{ fontSize: 12, color: active ? "#fca5a5" : BRAND.muted, marginTop: 4 }}>
                              {scoreText}
                            </div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: 18 }}>
                  <div style={{ color: BRAND.muted, fontSize: 13 }}>Score actuel</div>
                  <div style={{ color: level.color, fontSize: 42, fontWeight: 900, marginTop: 6 }}>
                    {totalScore}/100
                  </div>
                  <div style={{ color: BRAND.text, fontWeight: 700 }}>{level.label}</div>
                </div>
              </div>
            </div>

            <div>
              <div style={styles.card}>
                <div style={styles.sectionTitle}>{currentSection.title}</div>
                <div style={{ color: BRAND.muted, fontSize: 14 }}>
                  {currentSection.id === "patient"
                    ? "Renseigne le contexte du coureur avant l’évaluation."
                    : currentSection.id === "results"
                    ? "Restitution premium avec synthèse et plan d’action."
                    : "Attribue une note de 0 à 5 pour chaque item puis ajoute ton commentaire clinique si besoin."}
                </div>
              </div>

              {currentSection.id === "patient" && renderPatient()}
              {["anamnesis", "mobility", "technique", "physical", "load"].includes(currentSection.id) &&
                renderScoreSection(currentSection)}
              {currentSection.id === "results" && renderResults()}

              <div style={styles.bottomNav}>
                <button
                  style={styles.secondaryBtn}
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  Précédent
                </button>
                <button
                  style={styles.primaryBtn}
                  disabled={step === sections.length - 1}
                  onClick={() => setStep((s) => Math.min(sections.length - 1, s + 1))}
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #050505 0%, #101010 100%)",
    color: BRAND.text,
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: 1400,
    margin: "0 auto",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  brandPill: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 999,
    border: `1px solid ${BRAND.border}`,
    background: BRAND.panel,
    color: BRAND.text,
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
  h1: {
    margin: "14px 0 8px",
    fontSize: 36,
    lineHeight: 1.1,
    fontWeight: 900,
  },
  subtitle: {
    margin: 0,
    color: BRAND.muted,
    maxWidth: 800,
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  tab: {
    padding: "12px 16px",
    borderRadius: 16,
    border: `1px solid ${BRAND.border}`,
    background: BRAND.panel,
    color: BRAND.text,
    cursor: "pointer",
    fontWeight: 700,
  },
  tabActive: {
    padding: "12px 16px",
    borderRadius: 16,
    border: `1px solid ${BRAND.red}`,
    background: BRAND.red,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 18,
  },
  sidebar: {
    minWidth: 0,
  },
  card: {
    background: BRAND.panel,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  cardSticky: {
    background: BRAND.panel,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    position: "sticky",
    top: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 10,
  },
  label: {
    color: BRAND.muted,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 14px",
    borderRadius: 16,
    border: `1px solid ${BRAND.border}`,
    background: BRAND.panel2,
    color: BRAND.text,
    outline: "none",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 14px",
    borderRadius: 16,
    border: `1px solid ${BRAND.border}`,
    background: BRAND.panel2,
    color: BRAND.text,
    outline: "none",
    minHeight: 110,
    resize: "vertical",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  layoutScore: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr",
    gap: 16,
  },
  badge: {
    padding: "10px 14px",
    borderRadius: 999,
    background: BRAND.red,
    color: "#fff",
    fontWeight: 900,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  progressWrap: {
    width: "100%",
    height: 12,
    background: "#222",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    background: BRAND.red,
    borderRadius: 999,
  },
  rowStat: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  primaryBtn: {
    padding: "12px 18px",
    borderRadius: 16,
    border: "none",
    background: BRAND.red,
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 18px",
    borderRadius: 16,
    border: `1px solid ${BRAND.border}`,
    background: BRAND.panel,
    color: BRAND.text,
    fontWeight: 800,
    cursor: "pointer",
  },
  navItem: {
    width: "100%",
    textAlign: "left",
    padding: 14,
    borderRadius: 18,
    border: `1px solid ${BRAND.border}`,
    background: BRAND.panel2,
    color: BRAND.text,
    cursor: "pointer",
  },
  navActive: {
    width: "100%",
    textAlign: "left",
    padding: 14,
    borderRadius: 18,
    border: `1px solid ${BRAND.red}`,
    background: "#2a0b0d",
    color: BRAND.text,
    cursor: "pointer",
  },
  bottomNav: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },
  resultsTop: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 16,
    marginBottom: 16,
  },
  heroCard: {
    background: BRAND.panel,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    marginTop: 22,
  },
  heroMini: {
    background: BRAND.panel2,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 20,
    padding: 16,
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  paragraph: {
    color: "#e4e4e7",
    lineHeight: 1.7,
    margin: 0,
  },
  recoItem: {
    background: BRAND.panel2,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 18,
    padding: 14,
    color: "#f3f4f6",
    lineHeight: 1.6,
  },
  historyItem: {
    background: BRAND.panel2,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 18,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
};