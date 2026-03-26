"use client";

import { useEffect, useMemo, useState } from "react";

const BRAND = {
  bg: "#050505",
  panel: "#121212",
  panel2: "#1a1a1a",
  border: "#2a2a2a",
  text: "#ffffff",
  muted: "#a1a1aa",
  red: "#e11d2e",
  green: "#16a34a",
  orange: "#f59e0b",
  yellow: "#facc15",
  blue: "#38bdf8",
};

const APP_KEY = "kine-expert-roubaix-elite-v1";

const initialPatient = {
  name: "",
  age: "",
  weight: "",
  height: "",
  sex: "",
  job: "",
  runningHistory: "",
  objective: "",
  eventDate: "",
  weeklyKm: "",
  sessionsPerWeek: "",
  level: "",
  favoriteDistance: "",
  painZone: "",
  painLevel: "",
  shoes: "",
  surface: "",
  notes: "",
};

const initialScores = {
  anamnesis: 0,
  mobility: 0,
  technique: 0,
  physical: 0,
  load: 0,
};

const sections = [
  { id: "patient", title: "Patient" },
  { id: "anamnesis", title: "Anamnèse", max: 20 },
  { id: "mobility", title: "Mobilité & contrôle", max: 20 },
  { id: "technique", title: "Technique de course", max: 25 },
  { id: "physical", title: "Capacités physiques", max: 20 },
  { id: "load", title: "Gestion de charge", max: 15 },
  { id: "results", title: "Résultats" },
];

const labels = {
  anamnesis: "Anamnèse",
  mobility: "Mobilité & contrôle",
  technique: "Technique de course",
  physical: "Capacités physiques",
  load: "Gestion de charge",
};

const maxScores = {
  anamnesis: 20,
  mobility: 20,
  technique: 25,
  physical: 20,
  load: 15,
};

function getLevel(total) {
  if (total < 50) return { label: "Risque élevé", color: BRAND.red };
  if (total < 65) return { label: "Fragile", color: BRAND.orange };
  if (total < 80) return { label: "Intermédiaire", color: BRAND.yellow };
  if (total < 90) return { label: "Bon niveau", color: BRAND.green };
  return { label: "Optimisé", color: BRAND.blue };
}

function buildRecommendations(scores) {
  const recos = [];
  if (scores.load <= 8) {
    recos.push("Sécuriser la charge : réduire les pics, stabiliser 2 à 3 semaines, reconstruire progressivement.");
  }
  if (scores.mobility <= 12) {
    recos.push("Améliorer le contrôle et la mobilité : cheville, hanche et stabilité unipodale.");
  }
  if (scores.technique <= 14) {
    recos.push("Améliorer l’économie de course : éducatifs, travail de pied, appuis réactifs.");
  }
  if (scores.physical <= 14) {
    recos.push("Développer la force spécifique : mollets, chaîne postérieure, fessiers, tronc, 2 fois/semaine.");
  }
  if (scores.anamnesis <= 12) {
    recos.push("Surveiller le risque de récidive : progression prudente et critères de douleur tolérable.");
  }
  if (recos.length === 0) {
    recos.push("Consolider les acquis et affiner la performance avec un suivi périodique.");
  }
  return recos.slice(0, 4);
}

function buildSynthesis(patient, scores, total) {
  const ordered = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const weakest = labels[ordered[0][0]].toLowerCase();
  const strongest = labels[[...ordered].sort((a, b) => b[1] - a[1])[0][0]].toLowerCase();
  const name = patient.name || "Le bilan";
  return `Le bilan de ${name} met en évidence un profil ${getLevel(total).label.toLowerCase()}. Le principal levier de progression concerne ${weakest}. Le point le plus solide concerne ${strongest}. L’objectif est de transformer ce bilan en plan d’action simple, progressif et mesurable sur les 4 à 8 prochaines semaines.`;
}

function radarSvg(scores) {
  const width = 420;
  const height = 320;
  const cx = 210;
  const cy = 150;
  const radius = 95;
  const data = [
    { label: "Anamnèse", value: scores.anamnesis, max: 20, angle: -90 },
    { label: "Mobilité", value: scores.mobility, max: 20, angle: -18 },
    { label: "Technique", value: scores.technique, max: 25, angle: 54 },
    { label: "Physique", value: scores.physical, max: 20, angle: 126 },
    { label: "Charge", value: scores.load, max: 15, angle: 198 },
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
    <polygon points="${ringPoints(0.25)}" fill="none" stroke="#454545" stroke-width="1" />
    <polygon points="${ringPoints(0.5)}" fill="none" stroke="#454545" stroke-width="1" />
    <polygon points="${ringPoints(0.75)}" fill="none" stroke="#454545" stroke-width="1" />
    <polygon points="${ringPoints(1)}" fill="none" stroke="#454545" stroke-width="1" />
    ${data
      .map((d) => {
        const p = point(d.angle, radius);
        return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#454545" stroke-width="1" />`;
      })
      .join("")}
    <polygon points="${poly}" fill="#e11d2e" fill-opacity="0.38" stroke="#e11d2e" stroke-width="2.5" />
    ${data
      .map((d) => {
        const p = point(d.angle, radius + 28);
        return `<text x="${p.x}" y="${p.y}" text-anchor="middle" font-size="12" fill="#d4d4d8" font-family="Arial, sans-serif">${d.label}</text>`;
      })
      .join("")}
  </svg>`;
}

function scoreBar(current, max) {
  return `${(current / max) * 100}%`;
}

export default function RunningClinicElite() {
  const [tab, setTab] = useState("bilan");
  const [step, setStep] = useState(6);
  const [patient, setPatient] = useState(initialPatient);
  const [scores, setScores] = useState(initialScores);
  const [history, setHistory] = useState([]);

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

  const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
  const level = useMemo(() => getLevel(total), [total]);
  const synthesis = useMemo(() => buildSynthesis(patient, scores, total), [patient, scores, total]);
  const recommendations = useMemo(() => buildRecommendations(scores), [scores]);

  const bmi = useMemo(() => {
    const weight = Number(patient.weight);
    const heightCm = Number(patient.height);
    if (!weight || !heightCm) return "";
    const heightM = heightCm / 100;
    if (!heightM) return "";
    return (weight / (heightM * heightM)).toFixed(1);
  }, [patient.weight, patient.height]);

  const handlePatientChange = (key, value) => {
    setPatient((prev) => ({ ...prev, [key]: value }));
  };

  const handleScoreChange = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const saveAssessment = () => {
    const entry = {
      id: Date.now(),
      patient,
      scores,
      total,
      date: new Date().toLocaleDateString("fr-FR"),
    };
    setHistory((prev) => [entry, ...prev]);
  };

  const resetAssessment = () => {
    setPatient(initialPatient);
    setScores(initialScores);
    setStep(6);
  };

  const openHistory = (entry) => {
    setPatient(entry.patient);
    setScores(entry.scores);
    setTab("bilan");
    setStep(6);
  };

  const exportPDF = () => {
    const weakest = labels[Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0]];
    const strongest = labels[Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]];

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
          .page { max-width: 820px; margin: 0 auto; }
          .topband { height: 8px; background: var(--red); border-radius: 999px; margin-bottom: 18px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 18px; }
          .brand { font-size: 30px; font-weight: 900; letter-spacing: 0.2px; }
          .brand .red { color: var(--red); }
          .subtitle { color: var(--muted); font-size: 14px; margin-top: 6px; }
          .meta { text-align: right; font-size: 12px; color: var(--muted); }
          .hero { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px; margin-bottom: 16px; }
          .card { border: 1px solid var(--line); border-radius: 20px; padding: 18px; background: #fff; }
          .card-dark { background: var(--black); color: white; border-radius: 20px; padding: 20px; }
          .eyebrow { text-transform: uppercase; letter-spacing: 0.7px; font-size: 11px; color: var(--muted); margin-bottom: 8px; }
          .card-dark .eyebrow { color: #d4d4d8; }
          .name { font-size: 26px; font-weight: 900; margin: 0 0 12px; }
          .score { font-size: 58px; font-weight: 900; line-height: 0.95; color: var(--red); margin: 6px 0 10px; }
          .pill { display: inline-block; padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: white; font-weight: 800; font-size: 13px; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
          .small-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
          .small-box { background: var(--soft); border: 1px solid #eef2f7; border-radius: 16px; padding: 12px; }
          h2 { margin: 0 0 12px; font-size: 18px; }
          p { margin: 0 0 8px; line-height: 1.65; font-size: 14px; }
          ul { margin: 0; padding-left: 18px; }
          li { margin-bottom: 10px; line-height: 1.55; font-size: 14px; }
          .radar-wrap { height: 300px; display: flex; align-items: center; justify-content: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border-bottom: 1px solid var(--line); padding: 12px 8px; text-align: left; font-size: 14px; }
          th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--muted); font-weight: 800; }
          .footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--line); color: var(--muted); font-size: 11px; text-align: center; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
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
              <div class="name">${patient.name || "Non renseigné"}</div>
              <p><strong>Âge :</strong> ${patient.age || "-"}</p>
              <p><strong>Sexe :</strong> ${patient.sex || "-"}</p>
              <p><strong>Poids :</strong> ${patient.weight || "-"} kg</p>
              <p><strong>Taille :</strong> ${patient.height || "-"} cm</p>
              <p><strong>IMC :</strong> ${bmi || "-"}</p>
              <p><strong>Métier :</strong> ${patient.job || "-"}</p>
              <p><strong>Objectif :</strong> ${patient.objective || "Non renseigné"}</p>
              <p><strong>Date objectif :</strong> ${patient.eventDate || "-"}</p>
              <p><strong>Volume hebdomadaire :</strong> ${patient.weeklyKm || "-"} km</p>
              <p><strong>Séances / semaine :</strong> ${patient.sessionsPerWeek || "-"}</p>

              <div class="small-grid">
                <div class="small-box">
                  <div class="eyebrow">Levier prioritaire</div>
                  <p><strong>${weakest}</strong></p>
                </div>
                <div class="small-box">
                  <div class="eyebrow">Point fort</div>
                  <p><strong>${strongest}</strong></p>
                </div>
              </div>
            </div>

            <div class="card-dark">
              <div class="eyebrow">Score global</div>
              <div class="score">${total}/100</div>
              <div class="pill">${level.label}</div>
            </div>
          </div>

          <div class="grid2">
            <div class="card"><h2>Synthèse clinique</h2><p>${synthesis}</p></div>
            <div class="card"><h2>Radar clinique</h2><div class="radar-wrap">${radarSvg(scores)}</div></div>
          </div>

          <div class="grid2">
            <div class="card"><h2>Plan d’action prioritaire</h2><ul>${recommendations.map((r) => `<li>${r}</li>`).join("")}</ul></div>
            <div class="card">
              <h2>Scores par domaine</h2>
              <table>
                <thead><tr><th>Domaine</th><th>Score</th></tr></thead>
                <tbody>
                  <tr><td>Anamnèse</td><td>${scores.anamnesis}/20</td></tr>
                  <tr><td>Mobilité & contrôle</td><td>${scores.mobility}/20</td></tr>
                  <tr><td>Technique de course</td><td>${scores.technique}/25</td></tr>
                  <tr><td>Capacités physiques</td><td>${scores.physical}/20</td></tr>
                  <tr><td>Gestion de charge</td><td>${scores.load}/15</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <h2>Contexte course à pied</h2>
            <p><strong>Niveau / expérience :</strong> ${patient.level || "-"}</p>
            <p><strong>Distance favorite :</strong> ${patient.favoriteDistance || "-"}</p>
            <p><strong>Zone douloureuse :</strong> ${patient.painZone || "-"}</p>
            <p><strong>Douleur /10 :</strong> ${patient.painLevel || "-"}</p>
            <p><strong>Chaussures :</strong> ${patient.shoes || "-"}</p>
            <p><strong>Terrain habituel :</strong> ${patient.surface || "-"}</p>
          </div>

          <div class="card">
            <h2>Historique de course</h2>
            <p>${patient.runningHistory || "Non renseigné."}</p>
          </div>

          <div class="card">
            <h2>Notes complémentaires</h2>
            <p>${patient.notes || "Aucune note complémentaire."}</p>
          </div>

          <div class="footer">Document généré par Kiné Expert Roubaix — version V4 cabinet premium</div>
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
  };

  const card = {
    background: BRAND.panel,
    border: `1px solid ${BRAND.border}`,
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
  };

  const navItem = (active) => ({
    width: "100%",
    textAlign: "left",
    padding: 16,
    borderRadius: 20,
    border: `1px solid ${active ? BRAND.red : BRAND.border}`,
    background: active ? "linear-gradient(180deg, #3b0a0f 0%, #2a090d 100%)" : BRAND.panel2,
    color: BRAND.text,
    cursor: "pointer",
    marginBottom: 10,
  });

  const tabStyle = (active) => ({
    padding: "14px 18px",
    borderRadius: 18,
    border: `1px solid ${active ? BRAND.red : BRAND.border}`,
    background: active ? BRAND.red : BRAND.panel,
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  });

  const renderMain = () => (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18 }}>
      <div style={card}>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Parcours bilan</div>
        {sections.map((section, index) => {
          const scoreText = section.max ? `${scores[section.id] || 0}/${section.max}` : "";
          return (
            <button key={section.id} onClick={() => setStep(index)} style={navItem(step === index)}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{section.title}</div>
              {section.max ? <div style={{ fontSize: 13, color: BRAND.muted, marginTop: 6 }}>{scoreText}</div> : null}
            </button>
          );
        })}

        <div style={{ marginTop: 16, borderTop: `1px solid ${BRAND.border}`, paddingTop: 16 }}>
          <div style={{ color: BRAND.muted, fontSize: 13 }}>Score actuel</div>
          <div style={{ color: level.color, fontSize: 56, fontWeight: 900, lineHeight: 1, marginTop: 6 }}>{total}/100</div>
          <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>{level.label}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <div style={card}>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{sections[step].title}</div>
          <div style={{ color: BRAND.muted, fontSize: 14 }}>
            {step === 6 ? "Restitution premium avec synthèse et plan d’action." : "Saisie tactile et lecture rapide en consultation."}
          </div>
        </div>

        {step === 0 && (
          <div style={card}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>Identité & contexte</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                value={patient.name}
                onChange={(e) => handlePatientChange("name", e.target.value)}
                placeholder="Nom du patient"
                style={inputStyle}
              />
              <input
                value={patient.age}
                onChange={(e) => handlePatientChange("age", e.target.value)}
                placeholder="Âge"
                style={inputStyle}
              />
              <input
                value={patient.weight}
                onChange={(e) => handlePatientChange("weight", e.target.value)}
                placeholder="Poids (kg)"
                style={inputStyle}
              />
              <input
                value={patient.height}
                onChange={(e) => handlePatientChange("height", e.target.value)}
                placeholder="Taille (cm)"
                style={inputStyle}
              />
              <input
                value={bmi}
                readOnly
                placeholder="IMC"
                style={{ ...inputStyle, opacity: 0.8 }}
              />
              <input
                value={patient.job}
                onChange={(e) => handlePatientChange("job", e.target.value)}
                placeholder="Métier"
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ color: BRAND.muted, fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Sexe</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Homme", "Femme", "Autre"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handlePatientChange("sex", option)}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 14,
                      border: `1px solid ${patient.sex === option ? BRAND.red : BRAND.border}`,
                      background: patient.sex === option ? BRAND.red : BRAND.panel2,
                      color: "white",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 24, marginBottom: 16 }}>Profil course à pied</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                value={patient.objective}
                onChange={(e) => handlePatientChange("objective", e.target.value)}
                placeholder="Objectif sportif"
                style={inputStyle}
              />
              <input
                value={patient.eventDate}
                onChange={(e) => handlePatientChange("eventDate", e.target.value)}
                placeholder="Date objectif"
                style={inputStyle}
              />
              <input
                value={patient.weeklyKm}
                onChange={(e) => handlePatientChange("weeklyKm", e.target.value)}
                placeholder="Km / semaine"
                style={inputStyle}
              />
              <input
                value={patient.sessionsPerWeek}
                onChange={(e) => handlePatientChange("sessionsPerWeek", e.target.value)}
                placeholder="Séances / semaine"
                style={inputStyle}
              />
              <input
                value={patient.level}
                onChange={(e) => handlePatientChange("level", e.target.value)}
                placeholder="Niveau / expérience"
                style={inputStyle}
              />
              <input
                value={patient.favoriteDistance}
                onChange={(e) => handlePatientChange("favoriteDistance", e.target.value)}
                placeholder="Distance favorite"
                style={inputStyle}
              />
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 24, marginBottom: 16 }}>Contexte clinique</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                value={patient.painZone}
                onChange={(e) => handlePatientChange("painZone", e.target.value)}
                placeholder="Zone douloureuse"
                style={inputStyle}
              />
              <input
                value={patient.painLevel}
                onChange={(e) => handlePatientChange("painLevel", e.target.value)}
                placeholder="Douleur /10"
                style={inputStyle}
              />
              <input
                value={patient.shoes}
                onChange={(e) => handlePatientChange("shoes", e.target.value)}
                placeholder="Chaussures / rotation"
                style={inputStyle}
              />
              <input
                value={patient.surface}
                onChange={(e) => handlePatientChange("surface", e.target.value)}
                placeholder="Terrain habituel"
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ color: BRAND.muted, fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Historique de course</div>
              <textarea
                value={patient.runningHistory}
                onChange={(e) => handlePatientChange("runningHistory", e.target.value)}
                placeholder="Ancienneté en course à pied, distances habituelles, fréquence, antécédents sportifs, périodes d’arrêt..."
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ color: BRAND.muted, fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Notes complémentaires</div>
              <textarea
                value={patient.notes}
                onChange={(e) => handlePatientChange("notes", e.target.value)}
                placeholder="Notes cliniques"
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
              />
            </div>
          </div>
        )}

        {step > 0 && step < 6 && (
          <div style={card}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>{sections[step].title}</div>
            <div style={{ background: BRAND.panel2, border: `1px solid ${BRAND.border}`, borderRadius: 20, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 800 }}>{sections[step].title}</span>
                <span style={{ color: BRAND.red, fontWeight: 900 }}>{scores[sections[step].id]}/{sections[step].max}</span>
              </div>
              <input
                type="range"
                min="0"
                max={sections[step].max}
                value={scores[sections[step].id]}
                onChange={(e) => handleScoreChange(sections[step].id, e.target.value)}
                style={{ width: "100%", accentColor: BRAND.red }}
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16 }}>
              <div style={card}>
                <div style={{ color: BRAND.muted, fontSize: 14 }}>Restitution finale</div>
                <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{patient.name || "Nom patient"}</div>
                <div style={{ color: BRAND.muted, fontSize: 18, marginTop: 8 }}>{patient.objective || "Objectif"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 18 }}>
                  <div style={miniCard}>
                    <div style={miniLabel}>Score global</div>
                    <div style={{ fontSize: 40, fontWeight: 900, color: level.color }}>{total}/100</div>
                  </div>
                  <div style={miniCard}>
                    <div style={miniLabel}>Profil</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 18 }}>{level.label}</div>
                  </div>
                  <div style={miniCard}>
                    <div style={miniLabel}>Objectif</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 18 }}>{patient.objective || "-"}</div>
                  </div>
                </div>
              </div>

              <div style={card}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>Radar clinique</div>
                <div style={{ color: BRAND.muted, fontSize: 14, marginTop: 8 }}>Support visuel premium pour la restitution patient</div>
                <div dangerouslySetInnerHTML={{ __html: radarSvg(scores) }} style={{ marginTop: 8 }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={card}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Synthèse clinique</div>
                <div style={{ color: BRAND.text, fontSize: 18, lineHeight: 1.5 }}>{synthesis}</div>
              </div>

              <div style={card}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Recommandations automatiques</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {recommendations.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        background: BRAND.panel2,
                        border: `1px solid ${BRAND.border}`,
                        borderRadius: 18,
                        padding: 16,
                        fontSize: 16,
                        lineHeight: 1.45,
                      }}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={card}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Scores détaillés</div>
                {Object.keys(labels).map((key) => (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 800 }}>{labels[key]}</span>
                      <span style={{ fontSize: 18, fontWeight: 800 }}>{scores[key]}/{maxScores[key]}</span>
                    </div>
                    <div style={{ width: "100%", height: 12, background: "#d1d5db", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          width: scoreBar(scores[key], maxScores[key]),
                          height: "100%",
                          background: BRAND.red,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={card}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Notes patient</div>
                <div style={{ fontSize: 18, lineHeight: 1.5 }}>{patient.notes || "Aucune note complémentaire."}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #050505 0%, #101010 100%)",
        color: BRAND.text,
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.3 }}>KINÉ EXPERT ROUBAIX</div>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.05, marginTop: 10 }}>
              Bilan course à pied – version cabinet premium
            </div>
            <div style={{ color: BRAND.muted, fontSize: 22, marginTop: 8 }}>
              Saisie tactile, scoring intelligent, restitution premium et historique patient
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={resetAssessment} style={topBtn(false)}>Nouveau bilan</button>
            <button onClick={saveAssessment} style={topBtn(false)}>Enregistrer</button>
            <button onClick={exportPDF} style={topBtn(true)}>Imprimer / PDF</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button style={tabStyle(tab === "bilan")} onClick={() => setTab("bilan")}>Bilan en cours</button>
          <button style={tabStyle(tab === "patients")} onClick={() => setTab("patients")}>Historique patients</button>
        </div>

        {tab === "patients" ? (
          <div style={card}>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Historique patients</div>
            {history.length === 0 ? (
              <div style={{ color: BRAND.muted, fontSize: 18 }}>Aucun bilan enregistré.</div>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    padding: 16,
                    borderRadius: 18,
                    border: `1px solid ${BRAND.border}`,
                    background: BRAND.panel2,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{entry.patient.name || "Patient"}</div>
                    <div style={{ color: BRAND.muted, marginTop: 6 }}>{entry.patient.objective || "Objectif non renseigné"}</div>
                    <div style={{ color: BRAND.muted, marginTop: 6, fontSize: 14 }}>{entry.date} • {entry.total}/100</div>
                  </div>
                  <button onClick={() => openHistory(entry)} style={topBtn(false)}>Ouvrir</button>
                </div>
              ))
            )}
          </div>
        ) : (
          renderMain()
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: 16,
  borderRadius: 18,
  border: `1px solid ${BRAND.border}`,
  background: BRAND.panel2,
  color: BRAND.text,
  outline: "none",
  fontSize: 18,
};

const miniCard = {
  background: "rgba(255,255,255,0.03)",
  border: `1px solid ${BRAND.border}`,
  borderRadius: 18,
  padding: 16,
};

const miniLabel = {
  color: BRAND.muted,
  fontSize: 14,
};

const topBtn = (primary) => ({
  padding: "16px 22px",
  borderRadius: 18,
  border: `1px solid ${primary ? BRAND.red : BRAND.border}`,
  background: primary ? BRAND.red : BRAND.panel,
  color: "white",
  fontWeight: 800,
  fontSize: 18,
  cursor: "pointer",
});