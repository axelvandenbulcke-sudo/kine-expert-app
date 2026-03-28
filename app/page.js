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

const APP_KEY = "kine-expert-roubaix-elite-v6";

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
  mobilityNote: "",
  forceNote: "",
  notes: "",
};

const initialScores = {
  anamnesis: 0,
  mobility: 0,
  physical: 0,
  technique: 0,
  load: 0,

  deepSquatLeft: 0,
  deepSquatRight: 0,
  ankleKneeWallLeft: 0,
  ankleKneeWallRight: 0,
  fingerFloor: 0,
  calfRaiseLeft: 0,
  calfRaiseRight: 0,
  shortFootLeft: 0,
  shortFootRight: 0,
  singleLegSquatLeft: 0,
  singleLegSquatRight: 0,
  singleHopLeft: 0,
  singleHopRight: 0,

  quadLeft: 0,
  quadRight: 0,
  hamLeft: 0,
  hamRight: 0,
  abdLeft: 0,
  abdRight: 0,
  addLeft: 0,
  addRight: 0,
  fibLeft: 0,
  fibRight: 0,
  tibPostLeft: 0,
  tibPostRight: 0,
  flex1Left: 0,
  flex1Right: 0,

  quadNote: 0,
  hamNote: 0,
  abdNote: 0,
  addNote: 0,
  fibNote: 0,
  tibPostNote: 0,
  flex1Note: 0,
};

const sections = [
  { id: "patient", title: "Patient" },
  { id: "anamnesis", title: "Anamnèse", max: 20 },
  { id: "mobility", title: "Mobilité", max: 20 },
  { id: "physical", title: "Force", max: 20 },
  { id: "technique", title: "Technique de course", max: 25 },
  { id: "load", title: "Gestion de charge", max: 15 },
  { id: "results", title: "Résultats" },
];

const labels = {
  anamnesis: "Anamnèse",
  mobility: "Mobilité",
  physical: "Force",
  technique: "Technique de course",
  load: "Gestion de charge",
};

const maxScores = {
  anamnesis: 20,
  mobility: 20,
  physical: 20,
  technique: 25,
  load: 15,
};

const mobilityTests = [
  { label: "Deep squat", left: "deepSquatLeft", right: "deepSquatRight", max: 3 },
  { label: "Ankle knee to wall", left: "ankleKneeWallLeft", right: "ankleKneeWallRight", max: 3 },
  { label: "Distance doigt/sol", single: "fingerFloor", max: 3 },
  { label: "Single leg calf raise", left: "calfRaiseLeft", right: "calfRaiseRight", max: 3 },
  { label: "Short foot test", left: "shortFootLeft", right: "shortFootRight", max: 3 },
  { label: "Single leg squat", left: "singleLegSquatLeft", right: "singleLegSquatRight", max: 3 },
  { label: "Single hop test", left: "singleHopLeft", right: "singleHopRight", max: 3 },
];

const forceTests = [
  { label: "Quadriceps", left: "quadLeft", right: "quadRight", note: "quadNote" },
  { label: "Ischio-jambiers", left: "hamLeft", right: "hamRight", note: "hamNote" },
  { label: "Abducteurs", left: "abdLeft", right: "abdRight", note: "abdNote" },
  { label: "Adducteurs", left: "addLeft", right: "addRight", note: "addNote" },
  { label: "Fibulaires", left: "fibLeft", right: "fibRight", note: "fibNote" },
  { label: "Tibial postérieur", left: "tibPostLeft", right: "tibPostRight", note: "tibPostNote" },
  { label: "Fléchisseur du 1", left: "flex1Left", right: "flex1Right", note: "flex1Note" },
];

function getLevel(total) {
  if (total < 50) return { label: "Risque élevé", color: BRAND.red };
  if (total < 65) return { label: "Fragile", color: BRAND.orange };
  if (total < 80) return { label: "Intermédiaire", color: BRAND.yellow };
  if (total < 90) return { label: "Bon niveau", color: BRAND.green };
  return { label: "Optimisé", color: BRAND.blue };
}

function scoreBar(current, max) {
  return `${(current / max) * 100}%`;
}

function testColor(score, max) {
  const ratio = max ? score / max : 0;
  if (ratio < 0.4) return "#dc2626";
  if (ratio < 0.7) return "#f59e0b";
  return "#16a34a";
}

function asymmetryPercent(left, right) {
  const l = Number(left || 0);
  const r = Number(right || 0);
  if (!l && !r) return 0;
  const maxVal = Math.max(l, r);
  if (!maxVal) return 0;
  return (Math.abs(l - r) / maxVal) * 100;
}

function asymmetryPenalty(percent) {
  if (percent >= 20) return 1;
  if (percent >= 10) return 0.5;
  return 0;
}

function symmetryText(left, right) {
  const diff = Math.abs(left - right);
  if (diff === 0) return "Symétrie excellente";
  if (diff === 1) return "Légère asymétrie";
  return "Asymétrie marquée";
}

function computeMobilityTotal(scores) {
  const totalRaw =
    (scores.deepSquatLeft + scores.deepSquatRight) / 2 +
    (scores.ankleKneeWallLeft + scores.ankleKneeWallRight) / 2 +
    scores.fingerFloor +
    (scores.calfRaiseLeft + scores.calfRaiseRight) / 2 +
    (scores.shortFootLeft + scores.shortFootRight) / 2 +
    (scores.singleLegSquatLeft + scores.singleLegSquatRight) / 2 +
    (scores.singleHopLeft + scores.singleHopRight) / 2;

  return Math.round((totalRaw / 21) * 20);
}

function computeSmartForceTotal(scores) {
  const muscles = [
    { note: "quadNote", left: "quadLeft", right: "quadRight" },
    { note: "hamNote", left: "hamLeft", right: "hamRight" },
    { note: "abdNote", left: "abdLeft", right: "abdRight" },
    { note: "addNote", left: "addLeft", right: "addRight" },
    { note: "fibNote", left: "fibLeft", right: "fibRight" },
    { note: "tibPostNote", left: "tibPostLeft", right: "tibPostRight" },
    { note: "flex1Note", left: "flex1Left", right: "flex1Right" },
  ];

  let total = 0;

  muscles.forEach((m) => {
    const rawNote = Number(scores[m.note] || 0);
    const asym = asymmetryPercent(scores[m.left], scores[m.right]);
    const penalty = asymmetryPenalty(asym);
    total += Math.max(0, rawNote - penalty);
  });

  const quad = (Number(scores.quadLeft || 0) + Number(scores.quadRight || 0)) / 2;
  const ham = (Number(scores.hamLeft || 0) + Number(scores.hamRight || 0)) / 2;
  const hqRatio = quad ? ham / quad : 0;

  let ratioPenalty = 0;
  if (hqRatio < 0.6) ratioPenalty = 1;
  else if (hqRatio < 0.75) ratioPenalty = 0.5;

  total = Math.max(0, total - ratioPenalty);

  return Math.round((total / 35) * 20);
}

function mobilityInterpretations(scores) {
  const out = [];

  if (Math.min(scores.ankleKneeWallLeft, scores.ankleKneeWallRight) <= 1) {
    out.push("Déficit de mobilité de cheville : possible impact sur squat, absorption et contraintes distales.");
  }
  if (Math.min(scores.calfRaiseLeft, scores.calfRaiseRight) <= 1) {
    out.push("Endurance/force du triceps sural insuffisante : à relier au risque tendon d’Achille et à la perte d’économie de course.");
  }
  if (Math.min(scores.shortFootLeft, scores.shortFootRight) <= 1) {
    out.push("Contrôle actif du pied faible : travailler arche plantaire, stabilité et transmission des appuis.");
  }
  if (Math.min(scores.singleLegSquatLeft, scores.singleLegSquatRight) <= 1) {
    out.push("Contrôle unipodal déficitaire : surveiller valgus, stabilité pelvienne et contrôle proximal.");
  }
  if (Math.min(scores.singleHopLeft, scores.singleHopRight) <= 1) {
    out.push("Capacité de restitution/réactivité diminuée : à corréler avec la tolérance mécanique à la course.");
  }
  if (
    Math.abs(scores.deepSquatLeft - scores.deepSquatRight) >= 2 ||
    Math.abs(scores.singleLegSquatLeft - scores.singleLegSquatRight) >= 2 ||
    Math.abs(scores.singleHopLeft - scores.singleHopRight) >= 2
  ) {
    out.push("Asymétrie G/D notable : à intégrer dans la stratégie de renforcement et la reprise de charge.");
  }

  if (out.length === 0) {
    out.push("Profil mobilité globalement cohérent, sans déficit majeur mis en évidence sur cette batterie.");
  }

  return out;
}

function buildForceInterpretation(scores) {
  const notes = [];

  const quadAvg = (scores.quadLeft + scores.quadRight) / 2;
  const hamAvg = (scores.hamLeft + scores.hamRight) / 2;
  const ratio = quadAvg > 0 ? hamAvg / quadAvg : 0;

  if (ratio < 0.6) notes.push("Ratio H/Q bas : ischio-jambiers probablement insuffisants par rapport aux quadriceps.");
  else if (ratio < 0.75) notes.push("Ratio H/Q perfectible : déséquilibre musculaire modéré chez le coureur.");
  else if (ratio < 0.9) notes.push("Ratio H/Q globalement satisfaisant pour un profil coureur.");
  else notes.push("Ratio H/Q élevé : dominance relative des ischio-jambiers.");

  if (scores.abdNote <= 2) notes.push("Abducteurs insuffisants : possible impact sur stabilité pelvienne et contrôle frontal.");
  if (scores.addNote <= 2) notes.push("Adducteurs à renforcer : utile pour stabilité, propulsion et prévention des douleurs médiales.");
  if (scores.fibNote <= 2) notes.push("Fibulaires faibles : penser stabilité latérale et contrôle de cheville.");
  if (scores.tibPostNote <= 2) notes.push("Tibial postérieur déficitaire : impact possible sur contrôle de voûte plantaire.");
  if (scores.flex1Note <= 2) notes.push("Fléchisseur du 1 faible : travailler propulsion et contrôle du premier rayon.");

  const markedAsymmetries = [
    asymmetryPercent(scores.quadLeft, scores.quadRight) >= 20,
    asymmetryPercent(scores.hamLeft, scores.hamRight) >= 20,
    asymmetryPercent(scores.abdLeft, scores.abdRight) >= 20,
    asymmetryPercent(scores.addLeft, scores.addRight) >= 20,
    asymmetryPercent(scores.fibLeft, scores.fibRight) >= 20,
    asymmetryPercent(scores.tibPostLeft, scores.tibPostRight) >= 20,
    asymmetryPercent(scores.flex1Left, scores.flex1Right) >= 20,
  ].filter(Boolean).length;

  if (markedAsymmetries > 0) {
    notes.push("Asymétrie droite/gauche notable sur un ou plusieurs groupes musculaires : à intégrer dans la programmation.");
  }

  if (notes.length === 0) {
    notes.push("Profil de force globalement cohérent, sans déséquilibre majeur identifié.");
  }

  return notes;
}

function buildForceRecommendations(scores) {
  const recos = [];

  if (scores.hamNote <= 2) recos.push("Ischio-jambiers : hip hinge, Romanian deadlift, Nordic assisté.");
  if (scores.quadNote <= 2) recos.push("Quadriceps : squat, split squat, Spanish squat.");
  if (scores.abdNote <= 2) recos.push("Abducteurs : monster walk, side step band, appui unipodal contrôlé.");
  if (scores.addNote <= 2) recos.push("Adducteurs : Copenhagen plank, squeeze ballon, fente latérale.");
  if (scores.fibNote <= 2) recos.push("Fibulaires : éversion élastique, équilibre latéral, contrôle cheville.");
  if (scores.tibPostNote <= 2) recos.push("Tibial postérieur : inversion contrôlée, maintien d’arche, travail pied-cheville.");
  if (scores.flex1Note <= 2) recos.push("Fléchisseur du 1 : griffe d’orteils, poussée hallux, travail du premier rayon.");

  const quadAvg = (scores.quadLeft + scores.quadRight) / 2;
  const hamAvg = (scores.hamLeft + scores.hamRight) / 2;
  const ratio = quadAvg > 0 ? hamAvg / quadAvg : 0;
  if (ratio < 0.75) {
    recos.push("Ratio H/Q perfectible : prioriser renforcement ischio-jambiers, travail excentrique et unilatéral.");
  }

  if (recos.length === 0) {
    recos.push("Force globalement cohérente : poursuivre l’entretien et la progression spécifique.");
  }

  return recos.slice(0, 6);
}

function buildRecommendations(scores) {
  const recos = [];

  if (scores.load <= 8) recos.push("Sécuriser la charge : réduire les pics, stabiliser 2 à 3 semaines, reconstruire progressivement.");
  if (scores.mobility <= 12) recos.push("Améliorer la mobilité globale et le contrôle distal : cheville, pied, stabilité unipodale et qualité d’appui.");
  if (scores.technique <= 14) recos.push("Améliorer l’économie de course : éducatifs, travail de pied, appuis réactifs et légère augmentation de cadence.");
  if (scores.physical <= 14) recos.push("Renforcer les groupes clés de propulsion et de contrôle : quadriceps, ischios, abducteurs, adducteurs, pied-cheville.");
  if (scores.anamnesis <= 12) recos.push("Surveiller le risque de récidive : progression prudente, douleur tolérable et recontrôle régulier.");

  if (recos.length === 0) recos.push("Consolider les acquis et affiner la performance avec un suivi périodique.");

  return recos.slice(0, 5);
}

function buildAutoPlan(patient, scores) {
  const plan = [];

  if (scores.load <= 9) plan.push("Charge : stabiliser 2 semaines, éviter tout pic brutal, augmenter ensuite de façon progressive et tolérable.");
  if (scores.mobility <= 13) plan.push("Mobilité : 2 à 3 blocs/semaine cheville, pied, mollets et contrôle unipodal, priorité au côté le plus faible.");
  if (scores.technique <= 15) plan.push("Technique : intégrer 6 à 10 minutes d’éducatifs, cadence, travail d’appuis et posture sur 2 séances/semaine.");
  if (scores.physical <= 13) plan.push("Force : 2 séances/semaine avec focus quadriceps, ischios, abducteurs, adducteurs, pied-cheville et progression simple.");
  plan.push(`Course : maintenir ${patient.sessionsPerWeek || "2 à 3"} séances/semaine avec une séance facile, une séance qualitative légère et une sortie longue si tolérée.`);

  return plan.slice(0, 5);
}

function computeInjuryRisk(patient, scores) {
  let risk = 0;

  const pain = Number(patient.painLevel || 0);
  if (pain >= 6) risk += 25;
  else if (pain >= 3) risk += 15;
  else if (pain > 0) risk += 8;

  if (scores.load <= 6) risk += 22;
  else if (scores.load <= 9) risk += 14;

  if (scores.mobility <= 10) risk += 18;
  else if (scores.mobility <= 13) risk += 10;

  if (scores.physical <= 10) risk += 16;
  else if (scores.physical <= 13) risk += 8;

  if (scores.technique <= 12) risk += 10;
  else if (scores.technique <= 15) risk += 5;

  const asymmetryCount = [
    asymmetryPercent(scores.deepSquatLeft, scores.deepSquatRight) >= 20,
    asymmetryPercent(scores.ankleKneeWallLeft, scores.ankleKneeWallRight) >= 20,
    asymmetryPercent(scores.calfRaiseLeft, scores.calfRaiseRight) >= 20,
    asymmetryPercent(scores.shortFootLeft, scores.shortFootRight) >= 20,
    asymmetryPercent(scores.singleLegSquatLeft, scores.singleLegSquatRight) >= 20,
    asymmetryPercent(scores.singleHopLeft, scores.singleHopRight) >= 20,
    asymmetryPercent(scores.quadLeft, scores.quadRight) >= 20,
    asymmetryPercent(scores.hamLeft, scores.hamRight) >= 20,
  ].filter(Boolean).length;

  risk += asymmetryCount * 4;
  risk = Math.max(0, Math.min(100, Math.round(risk)));

  if (risk >= 70) return { score: risk, label: "Risque élevé", color: BRAND.red };
  if (risk >= 40) return { score: risk, label: "Risque modéré", color: BRAND.orange };
  return { score: risk, label: "Risque faible", color: BRAND.green };
}

function buildSynthesis(patient, scores, total) {
  const ordered = Object.entries({
    anamnesis: scores.anamnesis,
    mobility: scores.mobility,
    physical: scores.physical,
    technique: scores.technique,
    load: scores.load,
  }).sort((a, b) => a[1] - b[1]);

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
    { label: "Force", value: scores.physical, max: 20, angle: 54 },
    { label: "Technique", value: scores.technique, max: 25, angle: 126 },
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

  const total = useMemo(
    () => scores.anamnesis + scores.mobility + scores.physical + scores.technique + scores.load,
    [scores]
  );

  const level = useMemo(() => getLevel(total), [total]);
  const synthesis = useMemo(() => buildSynthesis(patient, scores, total), [patient, scores, total]);
  const recommendations = useMemo(() => buildRecommendations(scores), [scores]);
  const mobilityNotes = useMemo(() => mobilityInterpretations(scores), [scores]);
  const injuryRisk = useMemo(() => computeInjuryRisk(patient, scores), [patient, scores]);
  const autoPlan = useMemo(() => buildAutoPlan(patient, scores), [patient, scores]);
  const forceInterpretation = useMemo(() => buildForceInterpretation(scores), [scores]);
  const forceRecommendations = useMemo(() => buildForceRecommendations(scores), [scores]);

  const quadAvg = useMemo(() => (scores.quadLeft + scores.quadRight) / 2, [scores.quadLeft, scores.quadRight]);
  const hamAvg = useMemo(() => (scores.hamLeft + scores.hamRight) / 2, [scores.hamLeft, scores.hamRight]);
  const hqRatio = useMemo(() => (quadAvg > 0 ? (hamAvg / quadAvg).toFixed(2) : "-"), [quadAvg, hamAvg]);

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

  const handleMobilityTestChange = (key, value) => {
    setScores((prev) => {
      const next = { ...prev, [key]: Number(value) };
      next.mobility = computeMobilityTotal(next);
      return next;
    });
  };

  const handleForceNewtonChange = (key, value) => {
    setScores((prev) => {
      const next = { ...prev, [key]: Number(value) };
      next.physical = computeSmartForceTotal(next);
      return next;
    });
  };

  const handleForceNoteChange = (key, value) => {
    setScores((prev) => {
      const next = { ...prev, [key]: Number(value) };
      next.physical = computeSmartForceTotal(next);
      return next;
    });
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
    alert("Bilan enregistré.");
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
    const weakest = labels[
      Object.entries({
        anamnesis: scores.anamnesis,
        mobility: scores.mobility,
        physical: scores.physical,
        technique: scores.technique,
        load: scores.load,
      }).sort((a, b) => a[1] - b[1])[0][0]
    ];

    const strongest = labels[
      Object.entries({
        anamnesis: scores.anamnesis,
        mobility: scores.mobility,
        physical: scores.physical,
        technique: scores.technique,
        load: scores.load,
      }).sort((a, b) => b[1] - a[1])[0][0]
    ];

    const hqInterpretation =
      hqRatio === "-"
        ? "Ratio non calculable"
        : Number(hqRatio) < 0.6
        ? "Risque élevé – ischios insuffisants"
        : Number(hqRatio) < 0.75
        ? "Déséquilibre musculaire"
        : Number(hqRatio) < 0.9
        ? "Bon équilibre"
        : "Ischios dominants";

    const html = `
    <html>
      <head>
        <title>Bilan Running V4</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { size: A4; margin: 12mm; }
          :root { --black:#0b0b0b; --red:#e11d2e; --text:#111827; --muted:#6b7280; --line:#e5e7eb; }
          body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif; margin:0; color:var(--text); background:#fff; }
          .page { max-width:820px; margin:0 auto; }
          .topband { height:8px; background:var(--red); border-radius:999px; margin-bottom:18px; }
          .header { display:flex; justify-content:space-between; gap:20px; margin-bottom:18px; }
          .brand { font-size:30px; font-weight:900; }
          .brand .red { color:var(--red); }
          .subtitle,.meta { color:var(--muted); font-size:14px; }
          .hero { display:grid; grid-template-columns:1.2fr 0.8fr; gap:16px; margin-bottom:16px; }
          .card { border:1px solid var(--line); border-radius:20px; padding:18px; background:#fff; margin-bottom:16px; }
          .card-dark { background:var(--black); color:white; border-radius:20px; padding:20px; }
          .score { font-size:58px; font-weight:900; color:var(--red); }
          .pill { display:inline-block; padding:8px 12px; border-radius:999px; background:rgba(255,255,255,0.08); color:white; font-weight:800; font-size:13px; }
          .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
          h2 { margin:0 0 12px; font-size:18px; }
          p,li { font-size:14px; line-height:1.6; }
          ul { margin:0; padding-left:18px; }
          table { width:100%; border-collapse:collapse; }
          th,td { border-bottom:1px solid var(--line); padding:10px 8px; text-align:left; font-size:14px; }
          .footer { margin-top:18px; padding-top:12px; border-top:1px solid var(--line); color:var(--muted); font-size:11px; text-align:center; }
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
            <div class="meta">${new Date().toLocaleDateString("fr-FR")}</div>
          </div>

          <div class="hero">
            <div class="card">
              <h2>${patient.name || "Patient"}</h2>
              <p><strong>Âge :</strong> ${patient.age || "-"}</p>
              <p><strong>Sexe :</strong> ${patient.sex || "-"}</p>
              <p><strong>Poids :</strong> ${patient.weight || "-"} kg</p>
              <p><strong>Taille :</strong> ${patient.height || "-"} cm</p>
              <p><strong>IMC :</strong> ${bmi || "-"}</p>
              <p><strong>Métier :</strong> ${patient.job || "-"}</p>
              <p><strong>Objectif :</strong> ${patient.objective || "-"}</p>
              <p><strong>Date objectif :</strong> ${patient.eventDate || "-"}</p>
              <p><strong>Volume hebdomadaire :</strong> ${patient.weeklyKm || "-"} km</p>
              <p><strong>Séances / semaine :</strong> ${patient.sessionsPerWeek || "-"}</p>
              <p><strong>Levier prioritaire :</strong> ${weakest}</p>
              <p><strong>Point fort :</strong> ${strongest}</p>
            </div>
            <div class="card-dark">
              <div>Score global</div>
              <div class="score">${total}/100</div>
              <div class="pill">${level.label}</div>
              <p>Risque blessure : <strong>${injuryRisk.label}</strong> (${injuryRisk.score}/100)</p>
            </div>
          </div>

          <div class="grid2">
            <div class="card"><h2>Synthèse clinique</h2><p>${synthesis}</p></div>
            <div class="card"><h2>Ratio H/Q</h2><p><strong>${hqRatio}</strong></p><p>${hqInterpretation}</p></div>
          </div>

          <div class="card">
            <h2>Scores par domaine</h2>
            <table>
              <tbody>
                <tr><td>Anamnèse</td><td>${scores.anamnesis}/20</td></tr>
                <tr><td>Mobilité</td><td>${scores.mobility}/20</td></tr>
                <tr><td>Force</td><td>${scores.physical}/20</td></tr>
                <tr><td>Technique de course</td><td>${scores.technique}/25</td></tr>
                <tr><td>Gestion de charge</td><td>${scores.load}/15</td></tr>
              </tbody>
            </table>
          </div>

          <div class="card"><h2>Recommandations</h2><ul>${recommendations.map((r) => `<li>${r}</li>`).join("")}</ul></div>
          <div class="card"><h2>Recommandations force</h2><ul>${forceRecommendations.map((r) => `<li>${r}</li>`).join("")}</ul></div>
          <div class="card"><h2>Plan automatique</h2><ul>${autoPlan.map((r) => `<li>${r}</li>`).join("")}</ul></div>
          <div class="card"><h2>Historique de course</h2><p>${patient.runningHistory || "Non renseigné."}</p></div>
          <div class="card"><h2>Note complémentaire mobilité</h2><p>${patient.mobilityNote || "Aucune note."}</p></div>
          <div class="card"><h2>Note complémentaire force</h2><p>${patient.forceNote || "Aucune note."}</p></div>
          <div class="card"><h2>Notes complémentaires</h2><p>${patient.notes || "Aucune note."}</p></div>

          <div class="footer">Document généré par Kiné Expert Roubaix</div>
        </div>
      </body>
    </html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
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
              <input value={patient.name} onChange={(e) => handlePatientChange("name", e.target.value)} placeholder="Nom du patient" style={inputStyle} />
              <input value={patient.age} onChange={(e) => handlePatientChange("age", e.target.value)} placeholder="Âge" style={inputStyle} />
              <input value={patient.weight} onChange={(e) => handlePatientChange("weight", e.target.value)} placeholder="Poids (kg)" style={inputStyle} />
              <input value={patient.height} onChange={(e) => handlePatientChange("height", e.target.value)} placeholder="Taille (cm)" style={inputStyle} />
              <input value={bmi} readOnly placeholder="IMC" style={{ ...inputStyle, opacity: 0.8 }} />
              <input value={patient.job} onChange={(e) => handlePatientChange("job", e.target.value)} placeholder="Métier" style={inputStyle} />
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
              <input value={patient.objective} onChange={(e) => handlePatientChange("objective", e.target.value)} placeholder="Objectif sportif" style={inputStyle} />
              <input value={patient.eventDate} onChange={(e) => handlePatientChange("eventDate", e.target.value)} placeholder="Date objectif" style={inputStyle} />
              <input value={patient.weeklyKm} onChange={(e) => handlePatientChange("weeklyKm", e.target.value)} placeholder="Km / semaine" style={inputStyle} />
              <input value={patient.sessionsPerWeek} onChange={(e) => handlePatientChange("sessionsPerWeek", e.target.value)} placeholder="Séances / semaine" style={inputStyle} />
              <input value={patient.level} onChange={(e) => handlePatientChange("level", e.target.value)} placeholder="Niveau / expérience" style={inputStyle} />
              <input value={patient.favoriteDistance} onChange={(e) => handlePatientChange("favoriteDistance", e.target.value)} placeholder="Distance favorite" style={inputStyle} />
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 24, marginBottom: 16 }}>Contexte clinique</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input value={patient.painZone} onChange={(e) => handlePatientChange("painZone", e.target.value)} placeholder="Zone douloureuse" style={inputStyle} />
              <input value={patient.painLevel} onChange={(e) => handlePatientChange("painLevel", e.target.value)} placeholder="Douleur /10" style={inputStyle} />
              <input value={patient.shoes} onChange={(e) => handlePatientChange("shoes", e.target.value)} placeholder="Chaussures / rotation" style={inputStyle} />
              <input value={patient.surface} onChange={(e) => handlePatientChange("surface", e.target.value)} placeholder="Terrain habituel" style={inputStyle} />
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ color: BRAND.muted, fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Historique de course</div>
              <textarea value={patient.runningHistory} onChange={(e) => handlePatientChange("runningHistory", e.target.value)} placeholder="Historique course à pied..." style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ color: BRAND.muted, fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Notes complémentaires</div>
              <textarea value={patient.notes} onChange={(e) => handlePatientChange("notes", e.target.value)} placeholder="Notes cliniques" style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={card}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 14 }}>Tests mobilité</div>
            <div style={{ color: BRAND.muted, marginBottom: 16, fontSize: 14 }}>
              Notation par test de 0 à 3, avec lecture de la symétrie gauche / droite.
            </div>

            {mobilityTests.map((test) => {
              const leftValue = test.left ? scores[test.left] : null;
              const rightValue = test.right ? scores[test.right] : null;
              const singleValue = test.single ? scores[test.single] : null;
              const meanScore = test.single ? singleValue : Math.round((((leftValue || 0) + (rightValue || 0)) / 2) * 10) / 10;
              const color = testColor(meanScore, test.max);

              return (
                <div key={test.label} style={{ background: BRAND.panel2, border: `1px solid ${BRAND.border}`, borderRadius: 20, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 900, fontSize: 17 }}>{test.label}</div>
                    <div style={{ padding: "8px 12px", borderRadius: 999, background: color, color: "white", fontWeight: 800, fontSize: 13 }}>
                      {meanScore}/{test.max}
                    </div>
                  </div>

                  {test.single ? (
                    <div>
                      <input type="range" min="0" max={test.max} value={singleValue} onChange={(e) => handleMobilityTestChange(test.single, e.target.value)} style={{ width: "100%", accentColor: BRAND.red }} />
                      <div style={{ marginTop: 8, fontWeight: 800 }}>{singleValue}/{test.max}</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ color: BRAND.muted, fontSize: 13, marginBottom: 8 }}>Gauche</div>
                        <input type="range" min="0" max={test.max} value={leftValue} onChange={(e) => handleMobilityTestChange(test.left, e.target.value)} style={{ width: "100%", accentColor: BRAND.red }} />
                        <div style={{ marginTop: 8, fontWeight: 800 }}>{leftValue}/{test.max}</div>
                      </div>
                      <div>
                        <div style={{ color: BRAND.muted, fontSize: 13, marginBottom: 8 }}>Droite</div>
                        <input type="range" min="0" max={test.max} value={rightValue} onChange={(e) => handleMobilityTestChange(test.right, e.target.value)} style={{ width: "100%", accentColor: BRAND.red }} />
                        <div style={{ marginTop: 8, fontWeight: 800 }}>{rightValue}/{test.max}</div>
                      </div>
                      <div style={{ gridColumn: "1 / -1", color: Math.abs((leftValue || 0) - (rightValue || 0)) >= 2 ? BRAND.red : BRAND.muted, fontSize: 13, fontWeight: 700 }}>
                        {symmetryText(leftValue || 0, rightValue || 0)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ marginTop: 18, padding: 16, borderRadius: 20, border: `1px solid ${BRAND.border}`, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Score mobilité</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: BRAND.text }}>{scores.mobility}/20</div>
              <div style={{ width: "100%", height: 12, background: "#222", borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
                <div style={{ width: `${(scores.mobility / 20) * 100}%`, height: "100%", background: BRAND.red, borderRadius: 999 }} />
              </div>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              {mobilityNotes.map((note, i) => (
                <div key={i} style={{ background: BRAND.panel, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 14, color: BRAND.text, lineHeight: 1.5 }}>
                  {note}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ color: BRAND.muted, fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Note complémentaire</div>
              <textarea value={patient.mobilityNote} onChange={(e) => handlePatientChange("mobilityNote", e.target.value)} placeholder="Observation clinique libre..." style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={card}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 14 }}>Bilan de force</div>
            <div style={{ color: BRAND.muted, marginBottom: 16, fontSize: 14 }}>
              Saisie en Newtons G/D + note clinique manuelle /5. Le score force est recalculé automatiquement avec prise en compte des asymétries et du ratio H/Q.
            </div>

            {forceTests.map((m) => {
              const L = scores[m.left];
              const R = scores[m.right];
              const note = scores[m.note];
              const asym = asymmetryPercent(L, R);
              const color = testColor(note, 5);

              return (
                <div key={m.label} style={{ background: BRAND.panel2, border: `1px solid ${BRAND.border}`, borderRadius: 20, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 900, fontSize: 17 }}>{m.label}</div>
                    <div style={{ padding: "8px 12px", borderRadius: 999, background: color, color: "white", fontWeight: 800, fontSize: 13 }}>
                      Note {note}/5
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <div style={{ color: BRAND.muted, fontSize: 13, marginBottom: 8 }}>Gauche (N)</div>
                      <input type="number" value={L} onChange={(e) => handleForceNewtonChange(m.left, e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <div style={{ color: BRAND.muted, fontSize: 13, marginBottom: 8 }}>Droite (N)</div>
                      <input type="number" value={R} onChange={(e) => handleForceNewtonChange(m.right, e.target.value)} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ color: BRAND.muted, fontSize: 13 }}>
                      Moyenne : <strong style={{ color: BRAND.text }}>{Math.round((((L || 0) + (R || 0)) / 2) * 10) / 10} N</strong>
                    </div>
                    <div style={{ color: asym >= 20 ? BRAND.red : asym >= 10 ? BRAND.orange : BRAND.green, fontSize: 13, fontWeight: 700 }}>
                      Asymétrie : {asym.toFixed(1)}% — {symmetryText(L, R)}
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: BRAND.muted, fontSize: 13, marginBottom: 8 }}>Note clinique /5</div>
                    <input type="range" min="0" max="5" value={note} onChange={(e) => handleForceNoteChange(m.note, e.target.value)} style={{ width: "100%", accentColor: BRAND.red }} />
                    <div style={{ marginTop: 8, fontWeight: 800 }}>{note}/5</div>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 18, padding: 16, borderRadius: 20, border: `1px solid ${BRAND.border}`, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Score force intelligent</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: BRAND.text }}>{scores.physical}/20</div>
              <div style={{ width: "100%", height: 12, background: "#222", borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
                <div style={{ width: `${(scores.physical / 20) * 100}%`, height: "100%", background: BRAND.red, borderRadius: 999 }} />
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 16, borderRadius: 20, border: `1px solid ${BRAND.border}`, background: BRAND.panel2 }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Ratio Ischios / Quadriceps (H/Q)</div>
              <div style={{ fontSize: 34, fontWeight: 900 }}>{hqRatio}</div>
              <div style={{ color: BRAND.muted, marginTop: 8 }}>
                {hqRatio === "-"
                  ? "Ratio non calculable"
                  : Number(hqRatio) < 0.6
                  ? "Risque élevé – ischios insuffisants"
                  : Number(hqRatio) < 0.75
                  ? "Déséquilibre musculaire"
                  : Number(hqRatio) < 0.9
                  ? "Bon équilibre"
                  : "Ischios dominants"}
              </div>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              {forceInterpretation.map((note, i) => (
                <div key={i} style={{ background: BRAND.panel, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 14, color: BRAND.text, lineHeight: 1.5 }}>
                  {note}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Recommandations & exercices spécifiques</div>
              <div style={{ display: "grid", gap: 10 }}>
                {forceRecommendations.map((item, i) => (
                  <div key={i} style={{ background: BRAND.panel2, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 14, color: BRAND.text, lineHeight: 1.5 }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ color: BRAND.muted, fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Note complémentaire</div>
              <textarea value={patient.forceNote} onChange={(e) => handlePatientChange("forceNote", e.target.value)} placeholder="Observation clinique libre..." style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
            </div>
          </div>
        )}

        {step > 0 && step < 6 && step !== 2 && step !== 3 && (
          <div style={card}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>{sections[step].title}</div>
            <div style={{ background: BRAND.panel2, border: `1px solid ${BRAND.border}`, borderRadius: 20, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 800 }}>{sections[step].title}</span>
                <span style={{ color: BRAND.red, fontWeight: 900 }}>{scores[sections[step].id]}/{sections[step].max}</span>
              </div>
              <input type="range" min="0" max={sections[step].max} value={scores[sections[step].id]} onChange={(e) => handleScoreChange(sections[step].id, e.target.value)} style={{ width: "100%", accentColor: BRAND.red }} />
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 18 }}>
                  <div style={miniCard}>
                    <div style={miniLabel}>Score global</div>
                    <div style={{ fontSize: 40, fontWeight: 900, color: level.color }}>{total}/100</div>
                  </div>
                  <div style={miniCard}>
                    <div style={miniLabel}>Profil</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 18 }}>{level.label}</div>
                  </div>
                  <div style={miniCard}>
                    <div style={miniLabel}>Risque blessure</div>
                    <div style={{ fontSize: 20, fontWeight: 900, marginTop: 18, color: injuryRisk.color }}>{injuryRisk.label}</div>
                    <div style={{ color: BRAND.muted, marginTop: 6 }}>{injuryRisk.score}/100</div>
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
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Risque blessure</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: injuryRisk.color }}>{injuryRisk.label}</div>
                  <div style={{ fontSize: 34, fontWeight: 900, color: injuryRisk.color }}>{injuryRisk.score}/100</div>
                </div>
                <div style={{ width: "100%", height: 12, background: "#222", borderRadius: 999, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ width: `${injuryRisk.score}%`, height: "100%", background: injuryRisk.color, borderRadius: 999 }} />
                </div>
                <div style={{ color: BRAND.muted, lineHeight: 1.5 }}>
                  Indicateur synthétique combinant douleur, charge, déficits de mobilité, force et asymétries droite/gauche.
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={card}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Recommandations automatiques</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {recommendations.map((r, i) => (
                    <div key={i} style={{ background: BRAND.panel2, border: `1px solid ${BRAND.border}`, borderRadius: 18, padding: 16, fontSize: 16, lineHeight: 1.45 }}>
                      {r}
                    </div>
                  ))}
                </div>
              </div>

              <div style={card}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Plan automatique</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {autoPlan.map((item, i) => (
                    <div key={i} style={{ background: BRAND.panel2, border: `1px solid ${BRAND.border}`, borderRadius: 18, padding: 16, fontSize: 16, lineHeight: 1.45 }}>
                      {item}
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
                      <div style={{ width: scoreBar(scores[key], maxScores[key]), height: "100%", background: BRAND.red, borderRadius: 999 }} />
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #050505 0%, #101010 100%)", color: BRAND.text, padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.3 }}>KINÉ EXPERT ROUBAIX</div>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.05, marginTop: 10 }}>Bilan course à pied – version cabinet premium</div>
            <div style={{ color: BRAND.muted, fontSize: 22, marginTop: 8 }}>Saisie tactile, scoring intelligent, restitution premium et historique patient</div>
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
          <div style={{ background: BRAND.panel, border: `1px solid ${BRAND.border}`, borderRadius: 24, padding: 20 }}>
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