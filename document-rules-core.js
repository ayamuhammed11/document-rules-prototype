/* ══════════════════════════════════════════════════════════════════════════
   Document Rules — shared data layer.
   Loaded by document-rules.html and document-rules-create.html, so reference data,
   storage, the audit trail, and the one-off migrations live in a single place.
   No backend: localStorage is the "database".

   A rule is one record:
     { id, name, docs[], entities[], owners[], industries[], banks[], modules[],
       channels[]      — the channels it applies to,
       serviceMap{}    — { Online: ['Card', …], POS: […] }: the services picked under each channel,
       services[]      — every service named in serviceMap, de-duplicated (for filtering),
       createdAt, updatedAt }
   ══════════════════════════════════════════════════════════════════════════ */

const RULES_KEY = 'kashier_document_rules_v1';
const NEXT_ID_KEY = 'kashier_document_rules_next_id_v1';
const EVENTS_KEY = 'kashier_document_rules_events_v1';
const SEEDED_KEY = 'kashier_document_rules_seeded_v1';
const CURRENT_USER = 'Aya Muhammed';
const CURRENT_ROLE = 'Admin';

/* ══════════ Reference data ══════════ */
const DOC_TYPES = [
  'Commercial Registration (CR)', 'Tax Identification Card', 'National ID — Front', 'National ID — Back',
  'Bank Account Letter / IBAN proof', 'Brand Authorization Letter', 'Store Lease / Location Proof',
  'Visit Report', 'Signed Payout Contract', 'Disbursement Authorization Letter', 'Passport',
  'Commercial Registration (foreign)', 'Tax ID (foreign)', 'Foreign Residence Card', "Owner's Passport",
  "Owner's Residence Card", 'High Risk Annex (signed & stamped)', 'NGO Registration Certificate',
  'Board Resolution', 'Government Authorization Letter', 'BM PSP Agreement Annex'
];
/* The stored values are shared with the onboarding pages' rule matching, so they stay as
   they are; the short labels below are what the module shows. */
const ENTITIES = ['Individual Seller', 'Professional Business', 'Registered Business'];
const OWNER_NATIONALITIES = ['Egyptian Owner', 'Foreign Owner'];
const INDUSTRIES = ['Retail & E-commerce', 'Food & Beverage', 'Healthcare / Pharmacy', 'Education',
  'Travel & Tourism', 'Professional Services', 'Technology / SaaS', 'Real Estate', 'Automotive',
  'Fashion & Beauty', 'Entertainment & Media', 'Non-profit / NGO', 'Government', 'Financial Services',
  'Insurance', 'Marketplace', 'Logistics & Delivery'];
const BANKS = ['National Bank of Egypt', 'QNB', 'Bank Misr'];
const MODULES = ['PF', 'PSP'];
const CHANNELS = ['Online', 'POS'];
const SERVICES = ['Card', 'Wallet', 'Valu', 'OCTO', 'Souhoola', 'Contact', 'Basata', 'Mogo', 'Tru', 'Forsa',
  'Aman', 'Bank Installments', 'Transfer', 'Instapay'];
/* The services each channel offers. Pricing Rules lists every method under both Online and POS
   (each channel has its own copy of the service), so the lists match today — kept per channel
   so the form always shows a channel its own services, and one can diverge later. */
const CHANNEL_SERVICES = Object.fromEntries(CHANNELS.map(c => [c, [...SERVICES]]));
/* Installment providers with no financial institution of their own. */
const NO_FI_SERVICES = ['Souhoola', 'Valu', 'OCTO', 'Basata', 'Mogo', 'Tru', 'Forsa', 'Aman'];

const OPTIONS = {
  channels: CHANNELS, services: SERVICES, entities: ENTITIES, owners: OWNER_NATIONALITIES,
  modules: MODULES, industries: INDUSTRIES, banks: BANKS, docs: DOC_TYPES,
};
const ALL_LABELS = {
  entities: 'All merchant types', owners: 'All owner nationalities', industries: 'All industries',
  banks: 'All financial institutions', modules: 'All settlement types',
};
const FIELD_LABELS = [
  ['channels', 'Channel'], ['services', 'Service'], ['entities', 'Merchant type'],
  ['owners', 'Owner nationality'], ['industries', 'Industry'], ['banks', 'Financial institution'],
  ['modules', 'Settlement type'], ['docs', 'Required documents'],
];
const ENTITY_SHORT = { 'Individual Seller': 'Individual', 'Registered Business': 'Registered', 'Professional Business': 'Professional' };
const BANK_SHORT = { 'Bank Misr': 'BM', 'National Bank of Egypt': 'NBE', 'QNB': 'QNB' };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function optionLabel(key, v) {
  if (key === 'entities') return ENTITY_SHORT[v] || v;
  if (key === 'owners') return v.replace(' Owner', ' owner');
  if (key === 'banks') return BANK_SHORT[v] || v;
  return v;
}
/** True when the group covers every option — a rule with an empty group also matches everyone. */
function coversAll(key, vals) { return !vals || !vals.length || vals.length === OPTIONS[key].length; }
/** Display text for one condition group: "All merchant types" or "Individual, Professional". */
function describe(key, vals) {
  if (key === 'docs') return vals.length ? vals.join(', ') : '—';
  if (ALL_LABELS[key] && coversAll(key, vals)) return ALL_LABELS[key];
  return (vals || []).map(v => optionLabel(key, v)).join(', ') || '—';
}

/* ══════════ Channels and services ══════════ */
/** Every "Channel|Service" key a rule covers, in channel then service order. */
function serviceKeys(rule) {
  const out = [];
  CHANNELS.forEach(ch => ((rule.serviceMap || {})[ch] || []).forEach(svc => out.push(ch + '|' + svc)));
  return out;
}
/** serviceMap + the derived services / channels lists, from a set of "Channel|Service" keys. */
function applyServiceKeys(rule, keys) {
  const map = {};
  CHANNELS.forEach(ch => {
    const mine = CHANNEL_SERVICES[ch].filter(svc => keys.includes(ch + '|' + svc));
    if (mine.length) map[ch] = mine;
  });
  rule.serviceMap = map;
  rule.channels = CHANNELS.filter(ch => map[ch]);
  rule.services = SERVICES.filter(svc => rule.channels.some(ch => map[ch].includes(svc)));
  return rule;
}
/** "Card, Wallet" when every channel has the same services, else "Online: Card · POS: Wallet". */
function describeServices(rule) {
  const map = rule.serviceMap || {};
  const chans = CHANNELS.filter(c => map[c] && map[c].length);
  if (!chans.length) return '—';
  const same = chans.every(c => map[c].join('|') === map[chans[0]].join('|'));
  return same ? map[chans[0]].join(', ') : chans.map(c => c + ': ' + map[c].join(', ')).join(' · ');
}
/** True when no service on the rule has a financial institution of its own. */
function ruleHasNoFI(rule) {
  return !!(rule.services || []).length && rule.services.every(s => NO_FI_SERVICES.includes(s));
}

/* ══════════ Storage ══════════ */
function loadRules() { try { return JSON.parse(localStorage.getItem(RULES_KEY)) || []; } catch (e) { return []; } }
function saveRules(list) { localStorage.setItem(RULES_KEY, JSON.stringify(list)); }
function loadEvents() {
  try { return (JSON.parse(localStorage.getItem(EVENTS_KEY)) || []).map(e => ({ ...e, ts: new Date(e.ts) })); }
  catch (e) { return []; }
}
function saveEvents(list) { localStorage.setItem(EVENTS_KEY, JSON.stringify(list.map(e => ({ ...e, ts: e.ts.toISOString() })))); }
/** Next free rule id — never reuses one, even if the stored counter fell behind. */
function allocId() {
  const used = loadRules().reduce((m, r) => Math.max(m, r.id), 0);
  const id = Math.max(parseInt(localStorage.getItem(NEXT_ID_KEY) || '1', 10), used + 1);
  localStorage.setItem(NEXT_ID_KEY, String(id + 1));
  return id;
}

/* ══════════ Audit trail ══════════
   Every create / update / delete is recorded against the rule's id, so a rule's own log is
   just the events carrying its id.
     Created — carries a snapshot of the rule as it was set up (`details`).
     Updated — carries what changed (`changes`): a renamed rule as from → to, and every list
               (channels, services, industries, documents …) as what was added and removed. */
function logEvent(action, rule, extra, ts) {
  const events = loadEvents();
  events.unshift({
    ts: ts || new Date(), action, ruleId: rule.id, ruleName: rule.name,
    channel: channelsText(rule), service: describeServices(rule),
    actor: CURRENT_USER, role: CURRENT_ROLE, ...(extra || {}),
  });
  saveEvents(events);
}
function channelsText(rule) { return (rule.channels || []).join(', '); }

/** The rule as a list of {field, value} lines — what a Created log entry shows. */
function ruleSnapshot(rule) {
  const out = [{ field: 'Channel', value: channelsText(rule) || '—' }, { field: 'Service', value: describeServices(rule) }];
  FIELD_LABELS.forEach(([key, label]) => {
    if (key === 'channels' || key === 'services') return;
    if (key === 'banks' && ruleHasNoFI(rule)) return;
    out.push({ field: label, value: describe(key, rule[key] || []) });
  });
  return out;
}

/** Items to compare for one field: display labels, with "nothing ticked" read as "everything". */
function fieldItems(rule, key) {
  if (key === 'services') return serviceKeys(rule).map(k => k.replace('|', ' · '));
  const raw = rule[key] || [];
  if (ALL_LABELS[key] && !raw.length && !(key === 'banks' && ruleHasNoFI(rule))) return OPTIONS[key].map(v => optionLabel(key, v));
  return raw.map(v => optionLabel(key, v));
}
/** Field-by-field difference between two versions of a rule. */
function diffRules(before, after) {
  const out = [];
  if (before.name !== after.name) out.push({ field: 'Rule name', from: before.name, to: after.name });
  FIELD_LABELS.forEach(([key, label]) => {
    const a = fieldItems(before, key), b = fieldItems(after, key);
    const added = b.filter(x => !a.includes(x)), removed = a.filter(x => !b.includes(x));
    if (added.length || removed.length) out.push({ field: label, added, removed });
  });
  return out;
}
/** Events that belong to one rule — by id, or (for events recorded before ids existed) by name. */
function eventsForRule(rule, events) {
  return events.filter(e => e.ruleId != null ? e.ruleId === rule.id : e.ruleName === rule.name);
}

/* ══════════ Dates ══════════ */
const p2 = n => String(n).padStart(2, '0');
/** "10/21/2026. 04:54:52 PM" — the portal's event timestamp format. */
function formatEventTime(d) {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return p2(d.getMonth() + 1) + '/' + p2(d.getDate()) + '/' + d.getFullYear() + '. ' +
    p2(h) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()) + ' ' + ampm;
}
/** "21 Oct 2026, 04:54 PM" — created / last-updated stamps in the rule details. */
function formatStamp(d) {
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return d.getDate() + ' ' + mon + ' ' + d.getFullYear() + ', ' + p2(h) + ':' + p2(d.getMinutes()) + ' ' + ampm;
}

/* ══════════ Migration ══════════
   Runs on every load of either page and is idempotent. Older rules carried a flat channels[] and
   services[]; they gain a serviceMap (every listed service under every listed channel). Rules
   left without a valid service or channel can never match anything and are removed, with the
   reason logged. Missing timestamps are filled in from the audit trail. Returns what was removed. */
function normalizeStore() {
  const knownServices = new Set(SERVICES), knownChannels = new Set(CHANNELS);
  const events = loadEvents();
  const kept = [], dropped = [];
  let changed = false;

  loadRules().forEach(r => {
    const before = JSON.stringify([r.channels, r.services, r.serviceMap]);
    let keys;
    if (r.serviceMap) {
      keys = [];
      Object.keys(r.serviceMap).forEach(ch => (r.serviceMap[ch] || []).forEach(svc => {
        if (knownChannels.has(ch) && knownServices.has(svc)) keys.push(ch + '|' + svc);
      }));
    } else {
      const services = (r.services || []).filter(s => knownServices.has(s));
      const channels = (r.channels || []).filter(c => knownChannels.has(c));
      keys = channels.flatMap(ch => services.map(svc => ch + '|' + svc));
    }
    if (!keys.length) {
      dropped.push({ rule: r, reason: !(r.services || []).length && !(r.channels || []).length ? 'no service set' : 'service retired' });
      changed = true;
      return;
    }
    applyServiceKeys(r, keys);
    if (JSON.stringify([r.channels, r.services, r.serviceMap]) !== before) changed = true;
    if (!r.createdAt) {
      const mine = eventsForRule(r, events).filter(e => e.action === 'Created');
      r.createdAt = (mine.length ? mine[mine.length - 1].ts : new Date()).toISOString();
      changed = true;
    }
    if (!r.updatedAt) {
      const mine = eventsForRule(r, events).filter(e => e.action === 'Created' || e.action === 'Updated');
      r.updatedAt = (mine.length ? mine[0].ts : new Date(r.createdAt)).toISOString();
      changed = true;
    }
    kept.push(r);
  });

  if (changed) saveRules(kept);
  dropped.forEach(d => logEvent('Removed — ' + d.reason, d.rule));
  return dropped;
}

/* ══════════ Demo data ══════════
   First visit only: a populated module to review. Skipped if anything is already stored,
   and never repeated once the flag is set, so deleting everything leaves it empty. */
function seedDemoData() {
  if (localStorage.getItem(SEEDED_KEY)) return;
  localStorage.setItem(SEEDED_KEY, '1');
  if (loadRules().length || loadEvents().length) return;

  const all = k => [...OPTIONS[k]];
  const AYA = 'Aya Muhammed', GAMAL = 'Gamal Abdo';
  const d = (day, hh, mm, ss) => new Date(2026, 9, day, hh, mm, ss || 0);
  const spec = [
    // id, name, service, channel, entities, owners, industries, banks, modules, docs, created, actor
    [1, 'TEsssssssssssssssssssssssst', 'Tru', 'POS', ['Individual Seller'], ['Egyptian Owner'], ['Travel & Tourism'], [], ['PSP'], ['Visit Report', 'Tax Identification Card'], d(21, 16, 54, 52), AYA],
    [2, 'Abdo', 'Tru', 'POS', all('entities'), all('owners'), ['Government'], [], all('modules'), ['Commercial Registration (CR)'], d(20, 11, 37, 48), AYA],
    [3, 'Card Online POs Foreign Users', 'Card', 'Online', ['Professional Business'], ['Foreign Owner'], ['Retail & E-commerce', 'Education', 'Non-profit / NGO'], ['Bank Misr'], ['PF'], ['Tax Identification Card', 'National ID — Front', 'National ID — Back'], d(21, 16, 23, 36), AYA],
    [4, 'Document Rule 1 - Card Online', 'Card', 'Online', ['Individual Seller'], ['Egyptian Owner'], ['Travel & Tourism', 'Government'], ['QNB'], ['PF'], ['National ID — Front', 'Tax Identification Card', 'Passport'], d(19, 12, 4, 10), AYA],
    [5, 'Test Final', 'Aman', 'Online', ['Professional Business'], ['Foreign Owner'], ['Government', 'Entertainment & Media'], [], ['PSP'], ['Commercial Registration (CR)', 'Tax Identification Card', 'Brand Authorization Letter', 'Visit Report'], d(20, 17, 25, 46), AYA],
    [6, 'test', 'Aman', 'Online', ['Individual Seller'], ['Egyptian Owner'], ['Government'], [], ['PF'], ['Commercial Registration (CR)'], d(20, 17, 3, 3), AYA],
    [7, 'test form v2', 'Card', 'POS', ['Individual Seller'], ['Egyptian Owner'], ['Food & Beverage', 'Real Estate'], ['National Bank of Egypt'], ['PF'], ['Store Lease / Location Proof', 'Visit Report'], d(20, 15, 21, 17), GAMAL],
    [8, 'Document Rule 3 - Card POS', 'Card', 'POS', ['Professional Business'], ['Foreign Owner'], ['Technology / SaaS'], all('banks'), ['PSP'], ['Store Lease / Location Proof', 'Visit Report', 'Brand Authorization Letter', 'Passport'], d(19, 14, 12, 40), AYA],
    [9, 'Document Rule 2 - Card POS', 'Card', 'POS', ['Professional Business'], ['Foreign Owner'], ['Travel & Tourism'], ['Bank Misr'], ['PSP'], ['Store Lease / Location Proof', 'Board Resolution', 'Visit Report'], d(19, 13, 30, 5), AYA],
    [10, 'General Document Rule Basta 3', 'Basata', 'Online', all('entities'), ['Egyptian Owner'], ['Government', 'Travel & Tourism', 'Healthcare / Pharmacy'], [], ['PF'], ['Commercial Registration (CR)'], d(18, 10, 15, 22), AYA],
    [11, 'General Document Rule Basta 2', 'Basata', 'Online', all('entities'), ['Egyptian Owner'], ['Government', 'Travel & Tourism', 'Healthcare / Pharmacy'], [], ['PF'], ['Commercial Registration (CR)'], d(18, 10, 12, 8), AYA],
    [12, 'General Document Rule Basta', 'Basata', 'Online', all('entities'), ['Egyptian Owner'], ['Travel & Tourism', 'Food & Beverage', 'Healthcare / Pharmacy'], [], ['PF'], ['Commercial Registration (CR)'], d(18, 10, 5, 31), AYA],
  ];

  const rules = [], events = [];
  spec.forEach(([id, name, service, channel, entities, owners, industries, banks, modules, docs, created, actor]) => {
    const rule = applyServiceKeys({ id, name, docs, entities, owners, industries, banks, modules, createdAt: created.toISOString(), updatedAt: created.toISOString() }, [channel + '|' + service]);
    rules.push(rule);
    events.push({ ts: created, action: 'Created', ruleId: id, ruleName: name, channel, service, actor, role: CURRENT_ROLE, details: ruleSnapshot(rule) });
  });
  const ev = (id, patch) => { const r = rules.find(x => x.id === id); return { ruleId: id, ruleName: r.name, channel: channelsText(r), service: describeServices(r), role: CURRENT_ROLE, ...patch }; };

  // "test form v2" was renamed and had its documents changed shortly after it was created.
  const v2 = rules.find(r => r.id === 7), v2At = d(20, 15, 22, 23);
  v2.updatedAt = v2At.toISOString();
  events.push(ev(7, {
    ts: v2At, action: 'Updated', actor: GAMAL,
    changes: [
      { field: 'Rule name', from: 'test form', to: 'test form v2' },
      { field: 'Required documents', added: ['Visit Report'], removed: [] },
    ],
  }));
  // "Document Rule 1" was widened to POS as well, and its industries changed.
  const r4 = rules.find(r => r.id === 4), r4At = d(20, 10, 15, 41);
  applyServiceKeys(r4, ['Online|Card', 'POS|Card']);
  r4.industries = ['Travel & Tourism', 'Government', 'Education'];
  r4.updatedAt = r4At.toISOString();
  events.push(ev(4, {
    ts: r4At, action: 'Updated', actor: AYA,
    changes: [
      { field: 'Channel', added: ['POS'], removed: [] },
      { field: 'Service', added: ['POS · Card'], removed: [] },
      { field: 'Industry', added: ['Education'], removed: [] },
    ],
  }));
  // Rules that were created and deleted again.
  [[13, 'ewcec', d(19, 20, 50, 9), d(19, 20, 50, 15)], [14, 'Test Updated', d(19, 19, 40, 2), d(19, 20, 49, 12)]].forEach(([id, name, c, del]) => {
    const base = { ruleId: id, ruleName: name, channel: 'Online', service: 'Wallet', actor: AYA, role: CURRENT_ROLE };
    events.push({ ...base, ts: c, action: 'Created' });
    events.push({ ...base, ts: del, action: 'Deleted' });
  });

  events.sort((a, b) => b.ts - a.ts);
  saveRules(rules);
  saveEvents(events);
  localStorage.setItem(NEXT_ID_KEY, '15');
}
