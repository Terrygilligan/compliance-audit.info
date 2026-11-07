// WCAG 2.2 success-criteria registry — Level A + AA (the EAA / EN 301 549
// conformance target). Static code, not Firestore: versioned with the repo,
// zero read cost.
//
// `tier` lists which audit tiers can evaluate the criterion ([] = manual
// only in MVP). `fullyAutomated` is true only where a clean automated run is
// conclusive evidence — the conservative set approved in the implementation
// plan's mapping matrix. `en301549Clause` is the web-content mapping
// (9.<wcag>); WCAG-2.2-only criteria have no EN 301 549 v3.2.1 equivalent
// and carry null.
//
// SC 4.1.1 (Parsing) is intentionally absent — obsoleted in WCAG 2.2.

const CRITERIA = [
  // ── Principle 1: Perceivable ────────────────────────────────────────────
  ['1.1.1', 'Non-text Content', 'A', 'perceivable', [1, 2], '9.1.1.1', false],
  ['1.2.1', 'Audio-only and Video-only (Prerecorded)', 'A', 'perceivable', [], '9.1.2.1', false],
  ['1.2.2', 'Captions (Prerecorded)', 'A', 'perceivable', [1], '9.1.2.2', false],
  ['1.2.3', 'Audio Description or Media Alternative (Prerecorded)', 'A', 'perceivable', [], '9.1.2.3', false],
  ['1.2.4', 'Captions (Live)', 'AA', 'perceivable', [], '9.1.2.4', false],
  ['1.2.5', 'Audio Description (Prerecorded)', 'AA', 'perceivable', [1], '9.1.2.5', false],
  ['1.3.1', 'Info and Relationships', 'A', 'perceivable', [1], '9.1.3.1', false],
  ['1.3.2', 'Meaningful Sequence', 'A', 'perceivable', [], '9.1.3.2', false],
  ['1.3.3', 'Sensory Characteristics', 'A', 'perceivable', [], '9.1.3.3', false],
  ['1.3.4', 'Orientation', 'AA', 'perceivable', [], '9.1.3.4', false],
  ['1.3.5', 'Identify Input Purpose', 'AA', 'perceivable', [], '9.1.3.5', false],
  ['1.4.1', 'Use of Color', 'A', 'perceivable', [1, 2], '9.1.4.1', false],
  ['1.4.2', 'Audio Control', 'A', 'perceivable', [], '9.1.4.2', false],
  ['1.4.3', 'Contrast (Minimum)', 'AA', 'perceivable', [2], '9.1.4.3', false],
  ['1.4.4', 'Resize Text', 'AA', 'perceivable', [], '9.1.4.4', false],
  ['1.4.5', 'Images of Text', 'AA', 'perceivable', [1], '9.1.4.5', false],
  ['1.4.10', 'Reflow', 'AA', 'perceivable', [2], '9.1.4.10', false],
  ['1.4.11', 'Non-text Contrast', 'AA', 'perceivable', [], '9.1.4.11', false],
  ['1.4.12', 'Text Spacing', 'AA', 'perceivable', [], '9.1.4.12', false],
  ['1.4.13', 'Content on Hover or Focus', 'AA', 'perceivable', [], '9.1.4.13', false],

  // ── Principle 2: Operable ───────────────────────────────────────────────
  ['2.1.1', 'Keyboard', 'A', 'operable', [2], '9.2.1.1', false],
  ['2.1.2', 'No Keyboard Trap', 'A', 'operable', [2], '9.2.1.2', false],
  ['2.1.4', 'Character Key Shortcuts', 'A', 'operable', [], '9.2.1.4', false],
  ['2.2.1', 'Timing Adjustable', 'A', 'operable', [], '9.2.2.1', false],
  ['2.2.2', 'Pause, Stop, Hide', 'A', 'operable', [], '9.2.2.2', false],
  ['2.3.1', 'Three Flashes or Below Threshold', 'A', 'operable', [], '9.2.3.1', false],
  ['2.4.1', 'Bypass Blocks', 'A', 'operable', [1], '9.2.4.1', false],
  ['2.4.2', 'Page Titled', 'A', 'operable', [1], '9.2.4.2', true],
  ['2.4.3', 'Focus Order', 'A', 'operable', [1, 2], '9.2.4.3', false],
  ['2.4.4', 'Link Purpose (In Context)', 'A', 'operable', [1], '9.2.4.4', false],
  ['2.4.5', 'Multiple Ways', 'AA', 'operable', [], '9.2.4.5', false],
  ['2.4.6', 'Headings and Labels', 'AA', 'operable', [1], '9.2.4.6', false],
  ['2.4.7', 'Focus Visible', 'AA', 'operable', [2], '9.2.4.7', false],
  ['2.4.11', 'Focus Not Obscured (Minimum)', 'AA', 'operable', [], null, false], // WCAG 2.2 only
  ['2.5.1', 'Pointer Gestures', 'A', 'operable', [], '9.2.5.1', false],
  ['2.5.2', 'Pointer Cancellation', 'A', 'operable', [], '9.2.5.2', false],
  ['2.5.3', 'Label in Name', 'A', 'operable', [], '9.2.5.3', false],
  ['2.5.4', 'Motion Actuation', 'A', 'operable', [], '9.2.5.4', false],
  ['2.5.7', 'Dragging Movements', 'AA', 'operable', [], null, false], // WCAG 2.2 only
  ['2.5.8', 'Target Size (Minimum)', 'AA', 'operable', [], null, false], // WCAG 2.2 only

  // ── Principle 3: Understandable ─────────────────────────────────────────
  ['3.1.1', 'Language of Page', 'A', 'understandable', [1], '9.3.1.1', false],
  ['3.1.2', 'Language of Parts', 'AA', 'understandable', [], '9.3.1.2', false],
  ['3.2.1', 'On Focus', 'A', 'understandable', [], '9.3.2.1', false],
  ['3.2.2', 'On Input', 'A', 'understandable', [], '9.3.2.2', false],
  ['3.2.3', 'Consistent Navigation', 'AA', 'understandable', [], '9.3.2.3', false],
  ['3.2.4', 'Consistent Identification', 'AA', 'understandable', [], '9.3.2.4', false],
  ['3.2.6', 'Consistent Help', 'A', 'understandable', [], null, false], // WCAG 2.2 only
  ['3.3.1', 'Error Identification', 'A', 'understandable', [], '9.3.3.1', false],
  ['3.3.2', 'Labels or Instructions', 'A', 'understandable', [], '9.3.3.2', false],
  ['3.3.3', 'Error Suggestion', 'AA', 'understandable', [], '9.3.3.3', false],
  ['3.3.4', 'Error Prevention (Legal, Financial, Data)', 'AA', 'understandable', [], '9.3.3.4', false],
  ['3.3.7', 'Redundant Entry', 'A', 'understandable', [], null, false], // WCAG 2.2 only
  ['3.3.8', 'Accessible Authentication (Minimum)', 'AA', 'understandable', [], null, false], // WCAG 2.2 only

  // ── Principle 4: Robust ─────────────────────────────────────────────────
  // 4.1.1 Parsing is obsolete/removed in WCAG 2.2 — intentionally omitted.
  ['4.1.2', 'Name, Role, Value', 'A', 'robust', [1, 2], '9.4.1.2', false],
  ['4.1.3', 'Status Messages', 'AA', 'robust', [], '9.4.1.3', false]
];

const REGISTRY = new Map(CRITERIA.map(
  ([criterionId, name, level, principle, tier, en301549Clause, fullyAutomated]) => [
    criterionId,
    { criterionId, name, level, principle, tier, en301549Clause, fullyAutomated }
  ]
));

function getCriterion(criterionId) {
  return REGISTRY.get(criterionId) || null;
}

function allCriteria() {
  return [...REGISTRY.values()];
}

function criteriaForEdition(edition) {
  if (edition === 'en301549') {
    return allCriteria().filter(c => c.en301549Clause !== null);
  }
  return allCriteria(); // wcag22-aa
}

module.exports = { REGISTRY, getCriterion, allCriteria, criteriaForEdition };
