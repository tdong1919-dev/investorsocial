'use client';

import { CSSProperties, FormEvent, ReactNode, useEffect, useState } from 'react';

type Role = 'investor' | 'agent' | 'network_admin' | 'city_organizer' | 'service_partner' | 'jidoka_admin';
type Stage = 'Preparing' | 'Acquisition Ready' | 'Active Investor' | 'Verified Investor' | 'Investor Social Private';
type Tone = 'good' | 'warn' | 'danger' | 'neutral';

type User = {
  id: string;
  name: string;
  role: Role;
  city: string;
  marketId: string;
  targetMarketIds?: string[];
  level: number;
  stage: Stage;
  headline: string;
  canInvest?: boolean;
  assignedInvestorIds?: string[];
  assignedDealIds?: string[];
  invitedDealIds?: string[];
};

type Passport = {
  userId: string;
  experience: string;
  risk: string;
  timeline: string;
  intent: string;
  targetIrr: number;
  partnerNote: string;
  marketId: string;
  priceMin: number;
  priceMax: number;
  minCap: number;
  minCash: number;
  capital: number;
  preapproval: number;
  financingStatus: string;
  assetClasses: string[];
  strategies: string[];
  blockers: string[];
  readiness: number;
};

type Opportunity = {
  id: string;
  title: string;
  marketId: string;
  assetClass: string;
  strategy: string;
  address: string;
  cityLine: string;
  summary: string;
  price: number;
  capital: number;
  capRate: number;
  cashOnCash: number;
  risk: Tone;
  minLevel: number;
  status: string;
  verified: boolean;
  analysisId?: string;
};

type Deal = {
  id: string;
  ref: string;
  investorId: string;
  agentId: string;
  opportunityId: string;
  stageIndex: number;
  targetClose: string;
  tasks: { id: string; label: string; ownerId: string; due: string; priority: Tone; complete: boolean }[];
  participants: string[];
};

type IntroRequest = {
  id: string;
  requesterId: string;
  targetId: string;
  context: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
};

type InsightNode = {
  id: string;
  label: string;
  type: 'market' | 'investor' | 'agent' | 'partner' | 'event' | 'deal' | 'system';
  x: number;
  y: number;
  detail: string;
};

type ReideCalc = {
  label: string;
  value: string;
  note: string;
  tone?: Tone;
  formula: string;
  insight: string;
};

type ReideSource = {
  label: string;
  source: string;
  status: 'Clear' | 'Conflict' | 'Missing' | 'Watch';
  confidence: string;
  finding: string;
  owner: string;
};

type ReideStage = {
  label: string;
  owner: string;
  status: 'Complete' | 'In review' | 'Blocked';
  detail: string;
};

type EvidenceItem = {
  id: string;
  name: string;
  type: string;
  status: 'Parsed' | 'Missing' | 'Needs review';
  extracted: string;
};

type ScenarioItem = {
  label: string;
  irr: string;
  dscr: string;
  cash: string;
  assumption: string;
  tone: Tone;
};

type MemoVersion = {
  id: string;
  label: string;
  date: string;
  decision: string;
  note: string;
};

type ReideOutreachStatus = 'Needs outreach' | 'Draft ready' | 'Email opened' | 'Answered';

type ReideSopItem = {
  id: string;
  question: string;
  ownerName: string;
  ownerEmail: string;
  ownerRole: string;
  due: string;
  evidenceRequest: string;
  sourceLabel: string;
  sourceDetail: string;
  targetStage: string;
  subject: string;
  body: string;
};

const demoClockLabel = '26 Aug 2026';

const markets = [
  { id: 'mkt_rva', name: 'Richmond, VA', short: 'Richmond' },
  { id: 'mkt_clt', name: 'Charlotte, NC', short: 'Charlotte' },
  { id: 'mkt_bna', name: 'Nashville, TN', short: 'Nashville' },
  { id: 'mkt_tpa', name: 'Tampa, FL', short: 'Tampa' },
  { id: 'mkt_cmh', name: 'Columbus, OH', short: 'Columbus' },
];

const users: User[] = [
  { id: 'u_alex', name: 'Alex Morgan', role: 'network_admin', city: 'Richmond, VA', marketId: 'mkt_rva', level: 8, stage: 'Investor Social Private', headline: 'Founder and network operator.', assignedDealIds: ['dl_1', 'dl_2'] },
  { id: 'u_marcus', name: 'Marcus Bell', role: 'investor', city: 'Market-flexible', marketId: 'mkt_rva', targetMarketIds: ['mkt_rva', 'mkt_cmh'], level: 6, stage: 'Active Investor', headline: 'Buying small multifamily; target markets are Richmond and Columbus.', canInvest: true, assignedDealIds: ['dl_1'] },
  { id: 'u_dana', name: 'Dana Whitfield', role: 'investor', city: 'Market-flexible', marketId: 'mkt_clt', targetMarketIds: ['mkt_clt', 'mkt_tpa'], level: 4, stage: 'Preparing', headline: 'First rental property; target markets are Charlotte and Tampa.', canInvest: true },
  { id: 'u_priya', name: 'Priya Raman', role: 'investor', city: 'Market-flexible', marketId: 'mkt_bna', targetMarketIds: ['mkt_bna', 'mkt_tpa'], level: 7, stage: 'Verified Investor', headline: 'Operates 9 short-term rentals; target markets are Nashville and Tampa.', canInvest: true, assignedDealIds: ['dl_2'] },
  { id: 'u_alicia', name: 'Alicia Torres', role: 'agent', city: 'Richmond, VA', marketId: 'mkt_rva', level: 6, stage: 'Active Investor', headline: 'Investor-focused agent. 41 investor transactions closed.', assignedInvestorIds: ['u_marcus'], assignedDealIds: ['dl_1'] },
  { id: 'u_ray', name: 'Ray Sandoval', role: 'agent', city: 'Charlotte, NC', marketId: 'mkt_clt', level: 5, stage: 'Acquisition Ready', headline: 'Charlotte agent partner. Declines with reasons, not silence.', assignedInvestorIds: ['u_dana'] },
  { id: 'u_tom', name: 'Tom Ngo', role: 'city_organizer', city: 'Richmond, VA', marketId: 'mkt_rva', level: 5, stage: 'Acquisition Ready', headline: 'Runs the Richmond Investor Social chapter.' },
  { id: 'u_kelly', name: 'Kelly Brandt', role: 'service_partner', city: 'Richmond, VA', marketId: 'mkt_rva', level: 4, stage: 'Preparing', headline: 'DSCR and small-balance commercial lender.', invitedDealIds: ['dl_1'] },
  { id: 'u_hector', name: 'Hector Alvarez', role: 'service_partner', city: 'Richmond, VA', marketId: 'mkt_rva', level: 4, stage: 'Preparing', headline: 'Tax strategist and cost segregation partner.', invitedDealIds: ['dl_1'] },
  { id: 'u_sam', name: 'Sam Okafor', role: 'jidoka_admin', city: 'Cheyenne, WY', marketId: 'mkt_rva', level: 5, stage: 'Acquisition Ready', headline: 'Infrastructure, integrations, audit, and REIDE operations.' },
];

const initialPassports: Record<string, Passport> = {
  u_marcus: {
    userId: 'u_marcus',
    experience: '1-3 deals',
    risk: 'Moderate',
    timeline: 'Within 90 days',
    intent: 'Buying',
    targetIrr: 15,
    partnerNote: 'Prefers a lender who can close DSCR in under 30 days.',
    marketId: 'mkt_rva',
    priceMin: 600000,
    priceMax: 2000000,
    minCap: 6.5,
    minCash: 7,
    capital: 350000,
    preapproval: 1950000,
    financingStatus: 'Pre-approved',
    assetClasses: ['Small multifamily', 'Multifamily'],
    strategies: ['Value-add', 'Buy and hold'],
    blockers: ['Underwriting ability'],
    readiness: 81,
  },
  u_dana: {
    userId: 'u_dana',
    experience: 'No acquisitions yet',
    risk: 'Conservative',
    timeline: '6-12 months',
    intent: 'Buying',
    targetIrr: 12,
    partnerNote: 'Needs a first-deal agent and lender introduction.',
    marketId: 'mkt_clt',
    priceMin: 250000,
    priceMax: 650000,
    minCap: 6,
    minCash: 6,
    capital: 75000,
    preapproval: 0,
    financingStatus: 'Researching lenders',
    assetClasses: ['Single family', 'Small multifamily'],
    strategies: ['Long-term rental', 'BRRRR'],
    blockers: ['Financing readiness', 'Capital position', 'Timeline commitment'],
    readiness: 58,
  },
  u_priya: {
    userId: 'u_priya',
    experience: 'More than 10',
    risk: 'Aggressive',
    timeline: '90-180 days',
    intent: 'Buying',
    targetIrr: 18,
    partnerNote: 'Needs operator-friendly agents in Nashville.',
    marketId: 'mkt_bna',
    priceMin: 900000,
    priceMax: 4500000,
    minCap: 7,
    minCash: 9,
    capital: 1250000,
    preapproval: 4200000,
    financingStatus: 'Pre-approved',
    assetClasses: ['Short-term rental', 'Small multifamily'],
    strategies: ['Short-term rental', 'Value-add'],
    blockers: [],
    readiness: 94,
  },
};

const opportunities: Opportunity[] = [
  { id: 'opp_1', title: '12-unit multifamily, Southside Richmond', marketId: 'mkt_rva', assetClass: 'Multifamily', strategy: 'Value-add', address: '2418 Bainbridge Street', cityLine: 'Richmond 23225', summary: 'Eight units are below market and month-to-month. Estate sale requires disciplined diligence.', price: 2400000, capital: 480000, capRate: 7.1, cashOnCash: 8.4, risk: 'warn', minLevel: 5, status: 'Under contract', verified: true, analysisId: 'rde_1' },
  { id: 'opp_2', title: 'Church Hill duplex, turnkey', marketId: 'mkt_rva', assetClass: 'Small multifamily', strategy: 'Buy and hold', address: '914 N 27th Street', cityLine: 'Richmond 23223', summary: 'Renovated in 2019 with leases through mid-2027 and low variance.', price: 625000, capital: 156000, capRate: 6.4, cashOnCash: 6.9, risk: 'good', minLevel: 5, status: 'Active', verified: true, analysisId: 'rde_2' },
  { id: 'opp_3', title: '6-unit value-add, Museum District', marketId: 'mkt_rva', assetClass: 'Small multifamily', strategy: 'Value-add', address: '3307 Hanover Avenue', cityLine: 'Richmond 23221', summary: 'Four cosmetic turns and a 14 percent rent gap against comparable stabilized units.', price: 1100000, capital: 275000, capRate: 6.8, cashOnCash: 7.6, risk: 'warn', minLevel: 5, status: 'Active', verified: true },
  { id: 'opp_4', title: '3-property STR group, East Nashville', marketId: 'mkt_bna', assetClass: 'Short-term rental', strategy: 'Short-term rental', address: 'Withheld until approved', cityLine: 'Nashville, TN', summary: 'Permit transferability is the central diligence question.', price: 1850000, capital: 462000, capRate: 8.2, cashOnCash: 11.3, risk: 'danger', minLevel: 7, status: 'Blinded preview', verified: true, analysisId: 'rde_3' },
  { id: 'opp_6', title: 'BRRRR candidate, West Charlotte', marketId: 'mkt_clt', assetClass: 'Single family', strategy: 'BRRRR', address: '5122 Sunbury Avenue', cityLine: 'Charlotte 28208', summary: 'Three-bedroom needing kitchen, bath, and roof. Contractor estimate on file.', price: 285000, capital: 71000, capRate: 6.9, cashOnCash: 8.1, risk: 'warn', minLevel: 5, status: 'Active', verified: true },
  { id: 'opp_7', title: 'Mixed-use, Ybor City', marketId: 'mkt_tpa', assetClass: 'Commercial', strategy: 'Value-add', address: 'Withheld until approved', cityLine: 'Tampa, FL', summary: 'Two retail bays and three residential units. One bay has been vacant for eleven months.', price: 1450000, capital: 435000, capRate: 7.4, cashOnCash: 7.9, risk: 'danger', minLevel: 7, status: 'Blinded preview', verified: true },
  { id: 'opp_8', title: '8-unit near campus, Columbus', marketId: 'mkt_cmh', assetClass: 'Small multifamily', strategy: 'Value-add', address: 'Withheld during review', cityLine: 'Columbus, OH', summary: 'Wholesaler-submitted student-adjacent asset. Rent roll is not verified.', price: 940000, capital: 235000, capRate: 7.8, cashOnCash: 8.8, risk: 'warn', minLevel: 5, status: 'Awaiting review', verified: false },
];

const initialDeals: Deal[] = [
  {
    id: 'dl_1',
    ref: 'IS-2026-0114',
    investorId: 'u_marcus',
    agentId: 'u_alicia',
    opportunityId: 'opp_1',
    stageIndex: 8,
    targetClose: '30 Sep 2026',
    participants: ['u_marcus', 'u_alicia', 'u_kelly', 'u_hector', 'u_alex'],
    tasks: [
      { id: 'tsk_1', label: 'Confirm written permit status with county', ownerId: 'u_alicia', due: '28 Aug 2026', priority: 'danger', complete: false },
      { id: 'tsk_2', label: 'Upload updated proof of funds', ownerId: 'u_marcus', due: '27 Aug 2026', priority: 'danger', complete: false },
      { id: 'tsk_3', label: 'Order roof and HVAC specialist inspection', ownerId: 'u_alicia', due: '29 Aug 2026', priority: 'warn', complete: false },
      { id: 'tsk_4', label: 'Rate lock decision', ownerId: 'u_kelly', due: '8 Sep 2026', priority: 'warn', complete: false },
      { id: 'tsk_5', label: 'Cost segregation feasibility memo', ownerId: 'u_hector', due: '12 Sep 2026', priority: 'neutral', complete: false },
    ],
  },
  {
    id: 'dl_2',
    ref: 'IS-2026-0139',
    investorId: 'u_priya',
    agentId: 'u_alex',
    opportunityId: 'opp_4',
    stageIndex: 4,
    targetClose: '12 Nov 2026',
    participants: ['u_priya', 'u_alex'],
    tasks: [{ id: 'tsk_6', label: 'Verify STR permit transferability', ownerId: 'u_priya', due: '3 Sep 2026', priority: 'danger', complete: false }],
  },
];

const initialIntroductions: IntroRequest[] = [
  { id: 'intro_1', requesterId: 'u_marcus', targetId: 'u_priya', context: 'Network', reason: 'I want to compare multi-unit turnover sequencing before my next offer.', status: 'approved' },
  { id: 'intro_2', requesterId: 'u_dana', targetId: 'u_kelly', context: 'Charlotte event', reason: 'My diagnostic blocker is financing readiness and I need a first-deal DSCR conversation.', status: 'pending' },
];

const stages = ['Qualification', 'Agent matched', 'Financing', 'Property search', 'Analysis', 'Shortlist', 'Offer', 'Under contract', 'Due diligence', 'Closing', 'Closed'];
const reideModels: Record<string, { thesis: string; confidence: string; decision: string; publicRecordScore: string; calculations: ReideCalc[]; sources: ReideSource[]; stages: ReideStage[]; risks: string[]; aiFindings: string[]; nextQuestions: string[] }> = {
  rde_1: {
    decision: 'Conditional proceed',
    publicRecordScore: '71',
    thesis: 'Investable only if permit status and rent roll reconcile.',
    confidence: 'Medium confidence: rent roll and inspection evidence agree, permit evidence is still unresolved.',
    calculations: [
      { label: 'Base IRR', value: '15.8%', note: '5-year levered', tone: 'good', formula: 'Year 5 sale proceeds + annual cash flow - invested equity, solved as IRR. Inputs: $480K equity, 5.8% exit cap, 3.5% rent growth, $116K renovation reserve.', insight: 'The number works because eight leases normalize inside eighteen months. If turns slip by six months, base IRR falls below the Passport target.' },
      { label: 'Downside IRR', value: '8.9%', note: 'Vacancy stress', tone: 'warn', formula: 'Same model with 12% vacancy, 9-month renovation delay, 6.25% exit cap, and $42K added capex.', insight: 'The deal survives but stops compensating Marcus for execution risk. This is the guardrail scenario, not a prediction.' },
      { label: 'DSCR', value: '1.31x', note: 'Year two', tone: 'neutral', formula: 'Net operating income / annual debt service. Inputs: $165K stabilized NOI and $126K annual debt service.', insight: 'A lender can likely support it if reserves are documented. Kelly should test rate-lock sensitivity before financing contingency removal.' },
      { label: 'AI Conviction', value: '73', note: 'Evidence-weighted', tone: 'warn', formula: 'Weighted score: rent evidence 28/35, permit confidence 9/20, capex confidence 16/20, liquidity fit 20/25.', insight: 'The calculator says possible; the intelligence layer says the permit file is the decision point.' },
    ],
    risks: ['Permit status is not written yet', 'Eight lease turns create execution concentration', 'Roof and HVAC inspection can move reserve needs materially'],
    aiFindings: ['Seller NOI excludes two recurring repair categories found in bank memos.', 'Comparable rents support the upside, but only for renovated two-bedroom units.', 'Investor Passport fit is strong on market and strategy, weaker on liquidity cushion.'],
    nextQuestions: ['Can Alicia obtain written county permit confirmation?', 'Will Kelly approve DSCR terms at 6.75 percent?', 'Does Hector see cost-seg timing that improves after-tax return?'],
    sources: [
      { label: 'Permits', source: 'City permit portal + county building file', status: 'Conflict', confidence: '62%', finding: 'Renovation permit appears open; seller says closed.', owner: 'Alicia Torres' },
      { label: 'Zoning', source: 'City GIS zoning layer', status: 'Clear', confidence: '91%', finding: 'Use appears consistent with multifamily residential.', owner: 'REIDE' },
      { label: 'Tax assessment', source: 'County assessor + transfer history', status: 'Watch', confidence: '78%', finding: 'Assessment reset could move taxes above seller model.', owner: 'Hector Alvarez' },
      { label: 'Rent comps', source: 'MLS rentals + member rent roll benchmarks', status: 'Clear', confidence: '84%', finding: 'Upside supported after renovation, not before.', owner: 'REIDE' },
      { label: 'Crime/flood', source: 'Public safety trend + FEMA panel', status: 'Watch', confidence: '73%', finding: 'No flood issue; insurance quote should include neighborhood risk.', owner: 'Kelly Brandt' },
      { label: 'Physical', source: 'Inspection upload + roof age estimate', status: 'Missing', confidence: '48%', finding: 'Roof/HVAC specialist report not uploaded.', owner: 'Alicia Torres' },
    ],
    stages: [
      { label: 'Evidence intake', owner: 'REIDE', status: 'Complete', detail: 'Listing, rent roll, bank memos, tax record, and comps parsed.' },
      { label: 'Public records', owner: 'REIDE', status: 'In review', detail: 'Permit and assessment records disagree with seller package.' },
      { label: 'Zoning/use', owner: 'REIDE', status: 'Complete', detail: 'Current use appears allowed.' },
      { label: 'Physical diligence', owner: 'Alicia', status: 'Blocked', detail: 'Specialist reports outstanding.' },
      { label: 'Capital stack', owner: 'Kelly', status: 'In review', detail: 'DSCR terms depend on reserve and rate-lock timing.' },
      { label: 'IC memo', owner: 'Alex', status: 'Blocked', detail: 'Cannot finalize until permit conflict clears.' },
    ],
  },
  rde_2: {
    decision: 'Proceed',
    publicRecordScore: '88',
    thesis: 'Stable hold. Clean evidence, modest upside.',
    confidence: 'High confidence: leases, renovation dates, and tax records reconcile.',
    calculations: [
      { label: 'Base IRR', value: '12.4%', note: '5-year levered', tone: 'good', formula: '$156K equity, 6.1% exit cap, 2.4% rent growth, $18K maintenance reserve.', insight: 'Not flashy, but the cash flow is durable and the operating spread is easier to defend.' },
      { label: 'Downside IRR', value: '9.7%', note: 'Rent-flat case', tone: 'warn', formula: 'Flat rent for 24 months, 6.5% exit cap, $11K added maintenance.', insight: 'Downside compression is modest because renovation risk is already behind the buyer.' },
      { label: 'DSCR', value: '1.42x', note: 'Current lease base', tone: 'good', formula: '$51K NOI / $36K annual debt service.', insight: 'Financing risk is low relative to other active deals.' },
      { label: 'AI Conviction', value: '84', note: 'Evidence-weighted', tone: 'good', formula: 'Lease evidence 34/35, capex confidence 18/20, market liquidity 15/20, Passport fit 17/25.', insight: 'The intelligence layer likes this because fewer assumptions need to be true at once.' },
    ],
    risks: ['Upside is limited', 'Tenant concentration across two leases', 'Insurance quote needs refresh'],
    aiFindings: ['Listing rent matches lease file.', 'Tax reassessment risk is already reflected in the pro forma.', 'Best use is buy-and-hold, not forced appreciation.'],
    nextQuestions: ['Does Marcus prefer certainty over IRR target stretch?', 'Can Alicia confirm renewal intent?', 'Can Kelly quote DSCR before the next event?'],
    sources: [
      { label: 'Permits', source: 'City permit portal', status: 'Clear', confidence: '93%', finding: '2019 renovation permits closed.', owner: 'REIDE' },
      { label: 'Zoning', source: 'City GIS zoning layer', status: 'Clear', confidence: '95%', finding: 'Duplex use conforms.', owner: 'REIDE' },
      { label: 'Tax assessment', source: 'County assessor', status: 'Clear', confidence: '87%', finding: 'Reassessment modeled.', owner: 'Hector Alvarez' },
      { label: 'Rent comps', source: 'MLS rentals + lease file', status: 'Clear', confidence: '90%', finding: 'Current leases sit near market.', owner: 'REIDE' },
      { label: 'Crime/flood', source: 'Public safety trend + FEMA panel', status: 'Watch', confidence: '76%', finding: 'Insurance quote should be refreshed.', owner: 'Kelly Brandt' },
      { label: 'Physical', source: 'Renovation records + seller disclosure', status: 'Clear', confidence: '82%', finding: 'No major deferred capex detected.', owner: 'Alicia Torres' },
    ],
    stages: [
      { label: 'Evidence intake', owner: 'REIDE', status: 'Complete', detail: 'Lease file, renovations, taxes, and comps reconcile.' },
      { label: 'Public records', owner: 'REIDE', status: 'Complete', detail: 'No blocking permit or zoning issue.' },
      { label: 'Zoning/use', owner: 'REIDE', status: 'Complete', detail: 'Conforming duplex.' },
      { label: 'Physical diligence', owner: 'Alicia', status: 'In review', detail: 'Insurance refresh pending.' },
      { label: 'Capital stack', owner: 'Kelly', status: 'In review', detail: 'Likely financeable.' },
      { label: 'IC memo', owner: 'Alex', status: 'Complete', detail: 'Suitable as lower-volatility acquisition.' },
    ],
  },
  rde_3: {
    decision: 'Hold',
    publicRecordScore: '54',
    thesis: 'Attractive return, permit-gated business model.',
    confidence: 'Low-medium confidence: operating history is strong, legal continuity is unresolved.',
    calculations: [
      { label: 'Base IRR', value: '18.6%', note: 'STR operating case', tone: 'good', formula: '$462K equity, 64% occupancy, $231 ADR, 6.5% exit cap, 7% expense growth.', insight: 'The calculator shows why operators want it. The AI layer is worried because a single permit assumption drives the entire case.' },
      { label: 'Downside IRR', value: '4.2%', note: 'Permit loss', tone: 'danger', formula: 'Convert to long-term rental, $5,900 monthly gross rent, 7% exit cap, $38K reconfiguration cost.', insight: 'This is not a small variance. It is a different asset if permits fail.' },
      { label: 'DSCR', value: '1.18x', note: 'Seasonal trough', tone: 'warn', formula: 'Q1 annualized NOI / annual debt service after furniture reserve.', insight: 'Priya can operate through it, but lenders may price the volatility.' },
      { label: 'AI Conviction', value: '61', note: 'Permit-gated', tone: 'danger', formula: 'Operating evidence 30/35, legal continuity 4/25, liquidity fit 18/20, exit confidence 9/20.', insight: 'The wow factor is not a bigger number. It is identifying the one assumption that matters most.' },
    ],
    risks: ['Permit transferability unresolved', 'Seasonality creates lender friction', 'Furniture reserve is under-modeled'],
    aiFindings: ['AirDNA-style revenue supports the seller claim, but licensing evidence does not.', 'Downside use is materially worse than the marketing deck suggests.', 'Best path is a legal memo before LOI, not after.'],
    nextQuestions: ['Can local counsel confirm transferability in writing?', 'Can Ray identify long-term rental comps as a fallback?', 'Does Priya want this risk profile inside her next allocation?'],
    sources: [
      { label: 'Permits', source: 'Municipal STR registry + code notes', status: 'Conflict', confidence: '41%', finding: 'Operating permit may not transfer with sale.', owner: 'Alex Morgan' },
      { label: 'Zoning', source: 'Parcel zoning + STR overlay', status: 'Watch', confidence: '59%', finding: 'Overlay allows use only under active permit.', owner: 'REIDE' },
      { label: 'Tax assessment', source: 'County assessor', status: 'Clear', confidence: '81%', finding: 'Assessment within modeled range.', owner: 'Hector Alvarez' },
      { label: 'Revenue comps', source: 'STR market data + seller exports', status: 'Clear', confidence: '83%', finding: 'Revenue history is plausible.', owner: 'REIDE' },
      { label: 'Crime/flood', source: 'Public safety trend + FEMA panel', status: 'Clear', confidence: '79%', finding: 'No geographic blocker detected.', owner: 'REIDE' },
      { label: 'Fallback use', source: 'MLS long-term rents', status: 'Conflict', confidence: '66%', finding: 'Long-term rental fallback fails return target.', owner: 'Ray Sandoval' },
    ],
    stages: [
      { label: 'Evidence intake', owner: 'REIDE', status: 'Complete', detail: 'Revenue and seller files parsed.' },
      { label: 'Public records', owner: 'REIDE', status: 'In review', detail: 'Permit registry does not confirm transferability.' },
      { label: 'Zoning/use', owner: 'REIDE', status: 'Blocked', detail: 'Legal use depends on permit continuity.' },
      { label: 'Physical diligence', owner: 'Ray', status: 'In review', detail: 'Furniture reserve needs validation.' },
      { label: 'Capital stack', owner: 'Kelly', status: 'In review', detail: 'Lender may haircut seasonal income.' },
      { label: 'IC memo', owner: 'Alex', status: 'Blocked', detail: 'Memo should wait for legal-use answer.' },
    ],
  },
};

const marketPulse = [
  { marketId: 'mkt_rva', readiness: 81, blocker: 'Underwriting confidence', agent: 'Alicia Torres', helper: 'Hector Alvarez', suggestion: 'Run two REIDE review sessions before offer deadlines. Pair Marcus with Hector to pressure-test reserves and after-tax return before Alicia advances diligence.' },
  { marketId: 'mkt_clt', readiness: 58, blocker: 'Financing readiness', agent: 'Ray Sandoval', helper: 'Kelly Brandt', suggestion: 'Route Dana to Kelly before any property tour. Ray should only receive the lead after written preapproval or a DSCR term sheet is attached.' },
  { marketId: 'mkt_bna', readiness: 94, blocker: 'Agent coverage gap', agent: 'Open territory', helper: 'Alex Morgan', suggestion: 'Approve a Nashville agent before routing Priya more STR opportunities. Alex should hold the relationship until an investor-literate agent is assigned.' },
  { marketId: 'mkt_tpa', readiness: 67, blocker: 'Permit and partner coverage', agent: 'Open territory', helper: 'Sam Okafor', suggestion: 'Use REIDE to screen legal-use risk first, then recruit a Tampa agent with mixed-use and STR ordinance depth.' },
  { marketId: 'mkt_cmh', readiness: 72, blocker: 'Unverified opportunity supply', agent: 'Open territory', helper: 'Alicia Torres', suggestion: 'Keep Columbus submissions blinded until rent roll verification. Alicia can provide an underwriting second read while the territory is unfilled.' },
];

const initialEvidence: Record<string, EvidenceItem[]> = {
  rde_1: [
    { id: 'ev_1', name: 'Seller OM', type: 'Broker package', status: 'Parsed', extracted: 'Asking price, unit mix, seller NOI.' },
    { id: 'ev_2', name: 'Rent roll', type: 'Spreadsheet', status: 'Parsed', extracted: '8 below-market leases. 4 month-to-month.' },
    { id: 'ev_3', name: 'T12', type: 'Financials', status: 'Needs review', extracted: 'Repairs understated vs bank memos.' },
    { id: 'ev_4', name: 'Roof/HVAC report', type: 'Inspection', status: 'Missing', extracted: 'Required before contingency release.' },
  ],
  rde_2: [
    { id: 'ev_5', name: 'Lease file', type: 'Lease package', status: 'Parsed', extracted: 'Lease terms match rent roll.' },
    { id: 'ev_6', name: '2019 permits', type: 'Public record', status: 'Parsed', extracted: 'Renovation permits closed.' },
    { id: 'ev_7', name: 'Insurance quote', type: 'Quote', status: 'Needs review', extracted: 'Needs refresh before financing.' },
  ],
  rde_3: [
    { id: 'ev_8', name: 'STR revenue export', type: 'Operating history', status: 'Parsed', extracted: 'Revenue supports seller claim.' },
    { id: 'ev_9', name: 'Permit file', type: 'Public record', status: 'Needs review', extracted: 'Transferability not confirmed.' },
    { id: 'ev_10', name: 'Fallback rent comps', type: 'Public/private comps', status: 'Parsed', extracted: 'Long-term fallback fails target.' },
  ],
};

const reideScenarios: Record<string, ScenarioItem[]> = {
  rde_1: [
    { label: 'Base', irr: '15.8%', dscr: '1.31x', cash: '8.4%', assumption: '18-month rent normalization', tone: 'good' },
    { label: 'Downside', irr: '8.9%', dscr: '1.08x', cash: '4.6%', assumption: 'Vacancy + capex stress', tone: 'warn' },
    { label: 'Higher rate', irr: '12.1%', dscr: '1.17x', cash: '6.2%', assumption: '+75 bps debt cost', tone: 'warn' },
    { label: 'Permit delay', irr: '7.4%', dscr: '1.01x', cash: '3.9%', assumption: '6-month renovation hold', tone: 'danger' },
  ],
  rde_2: [
    { label: 'Base', irr: '12.4%', dscr: '1.42x', cash: '6.9%', assumption: 'Current leases hold', tone: 'good' },
    { label: 'Flat rent', irr: '9.7%', dscr: '1.25x', cash: '5.1%', assumption: 'No rent growth 24 months', tone: 'warn' },
    { label: 'Upside', irr: '14.2%', dscr: '1.51x', cash: '7.8%', assumption: 'Renewals at market', tone: 'good' },
  ],
  rde_3: [
    { label: 'Base STR', irr: '18.6%', dscr: '1.29x', cash: '11.3%', assumption: 'Permit transfers', tone: 'good' },
    { label: 'No permit', irr: '4.2%', dscr: '.91x', cash: '1.6%', assumption: 'Long-term fallback', tone: 'danger' },
    { label: 'Seasonal stress', irr: '10.8%', dscr: '1.02x', cash: '5.4%', assumption: 'Q1 trough haircut', tone: 'warn' },
  ],
};

const initialMemoVersions: Record<string, MemoVersion[]> = {
  rde_1: [{ id: 'memo_1', label: 'IC memo v1', date: '26 Aug 2026', decision: 'Conditional proceed', note: 'Permit conflict open.' }],
  rde_2: [{ id: 'memo_2', label: 'IC memo v1', date: '26 Aug 2026', decision: 'Proceed', note: 'Insurance refresh pending.' }],
  rde_3: [{ id: 'memo_3', label: 'IC memo v1', date: '26 Aug 2026', decision: 'Hold', note: 'STR permit transfer unresolved.' }],
};
const roleLabels: Record<Role, string> = {
  investor: 'Investor',
  agent: 'Investor Agent Partner',
  network_admin: 'Network Admin',
  city_organizer: 'City Organizer',
  service_partner: 'Service Partner',
  jidoka_admin: 'JIDOKA Admin',
};

function money(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(value % 1000000 ? 2 : 0)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
}

function marketName(id: string) {
  return markets.find((m) => m.id === id)?.name ?? 'Unknown market';
}

function targetMarketLabel(user: User) {
  return (user.targetMarketIds?.length ? user.targetMarketIds : [user.marketId]).map(marketName).join(', ');
}

function profileScope(user: User) {
  if (user.role === 'investor') return `Target markets: ${targetMarketLabel(user)}`;
  if (user.role === 'agent') return `Agent territory: ${marketName(user.marketId)}`;
  if (user.role === 'city_organizer') return `Chapter market: ${marketName(user.marketId)}`;
  if (user.role === 'service_partner') return `Service market: ${marketName(user.marketId)}`;
  if (user.role === 'network_admin') return 'Network-wide operator';
  return 'Systems scope';
}

function personTouchesMarket(person: User, marketId: string) {
  if (person.role === 'investor') return person.targetMarketIds?.includes(marketId) ?? person.marketId === marketId;
  return person.marketId === marketId;
}

function contactForOwner(ownerName: string) {
  const lower = ownerName.toLowerCase();
  if (lower.includes('local counsel')) {
    return { name: 'Local counsel', email: 'legal@investorsocial.com', role: 'Legal diligence partner' };
  }
  const user = users.find((person) => person.name === ownerName || person.name.split(' ')[0].toLowerCase() === lower.split(' ')[0]);
  if (!user) return { name: ownerName || 'REIDE Ops', email: 'reide@investorsocial.com', role: 'REIDE operator' };
  return {
    name: user.name,
    email: `${user.name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/\.$/, '')}@investorsocial.com`,
    role: roleLabels[user.role],
  };
}

function ownerFromQuestion(question: string) {
  const named = users.find((person) => question.toLowerCase().includes(person.name.split(' ')[0].toLowerCase()));
  if (named) return named.name;
  if (question.toLowerCase().includes('local counsel')) return 'Local counsel';
  return 'Sam Okafor';
}

function evidenceRequestFor(label: string, question: string) {
  const text = `${label} ${question}`.toLowerCase();
  if (text.includes('permit')) return 'Written confirmation, permit number, status, and screenshot or PDF from the city/county record.';
  if (text.includes('dscr') || text.includes('loan') || text.includes('rate')) return 'Term quote with rate, leverage, reserve requirement, DSCR sensitivity, and expiration date.';
  if (text.includes('tax') || text.includes('cost-seg')) return 'After-tax estimate, timing, eligible basis, and CPA review caveats.';
  if (text.includes('roof') || text.includes('hvac') || text.includes('physical')) return 'Specialist report or quote with remaining useful life, repair scope, and cost range.';
  if (text.includes('renewal') || text.includes('lease')) return 'Written renewal intent, current lease terms, rent amount, and expiration date.';
  if (text.includes('comps')) return 'Three comparable records with source, date, distance, rent or sale value, and adjustment notes.';
  return 'Direct answer, source evidence, confidence level, and any recommended next step.';
}

function makeReideSopItem(input: { id: string; question: string; label: string; detail: string; targetStage: string; ownerName: string; selectedTitle: string; requesterName: string }) {
  const owner = contactForOwner(input.ownerName);
  const evidenceRequest = evidenceRequestFor(input.label, input.question);
  const due = input.detail.toLowerCase().includes('missing') || input.detail.toLowerCase().includes('open') ? '48 hours' : 'Before recommendation';
  const firstName = owner.name.split(' ')[0];
  const subject = `REIDE request: ${input.selectedTitle} - ${input.label}`;
  const body = [
    `Hi ${firstName},`,
    '',
    `Can you help resolve this REIDE diligence item for ${input.selectedTitle}?`,
    '',
    `Question: ${input.question}`,
    `Evidence needed: ${evidenceRequest}`,
    `Why it matters: ${input.detail}`,
    `Needed by: ${due}`,
    '',
    'Please reply with the evidence source, confidence level, and any blocker that should stay in the recommendation.',
    '',
    `Thanks,`,
    input.requesterName,
  ].join('\n');
  return {
    id: input.id,
    question: input.question,
    ownerName: owner.name,
    ownerEmail: owner.email,
    ownerRole: owner.role,
    due,
    evidenceRequest,
    sourceLabel: input.label,
    sourceDetail: input.detail,
    targetStage: input.targetStage,
    subject,
    body,
  };
}

function mailtoFor(item: ReideSopItem) {
  return `mailto:${item.ownerEmail}?subject=${encodeURIComponent(item.subject)}&body=${encodeURIComponent(item.body)}`;
}

function sourceUrlFor(source: string) {
  const text = source.toLowerCase();
  if (text.includes('fema') || text.includes('flood')) return 'https://msc.fema.gov/portal/home';
  if (text.includes('permit') || text.includes('building')) return 'https://www.rva.gov/planning-development-review/permits-and-inspections';
  if (text.includes('gis') || text.includes('zoning') || text.includes('overlay')) return 'https://www.rva.gov/planning-development-review/gis';
  if (text.includes('assessor') || text.includes('tax') || text.includes('transfer')) return 'https://www.rva.gov/finance/real-estate-assessments';
  if (text.includes('mls') || text.includes('rent') || text.includes('lease')) return 'https://www.realtor.com/rentals/';
  if (text.includes('str') || text.includes('short')) return 'https://www.rva.gov/planning-development-review/short-term-rentals';
  if (text.includes('inspection') || text.includes('roof')) return 'https://www.nachi.org/sop.htm';
  return 'https://www.rva.gov/';
}

function stageStatusMeta(stage: ReideStage) {
  const owner = contactForOwner(stage.owner);
  if (stage.status === 'Blocked') {
    return {
      lastViewed: stage.owner === 'Alicia' ? '27 Aug 2026, 4:18 PM' : '26 Aug 2026, 10:42 AM',
      note: `${owner.name} has not uploaded the required evidence yet. REIDE should hold the recommendation until this item is answered.`,
    };
  }
  if (stage.status === 'In review') {
    return {
      lastViewed: stage.owner === 'Kelly' ? '28 Aug 2026, 9:12 AM' : '27 Aug 2026, 2:35 PM',
      note: `${owner.name} reviewed the packet and has not posted a final note. Send a targeted follow-up before moving this to complete.`,
    };
  }
  return {
    lastViewed: '28 Aug 2026, 8:40 AM',
    note: 'Evidence is reconciled and no action is required unless new documents are uploaded.',
  };
}

function scoreOpportunity(passport: Passport | undefined, opportunity: Opportunity) {
  if (!passport) return 50;
  let score = 18;
  if (passport.marketId === opportunity.marketId) score += 28;
  if (passport.assetClasses.includes(opportunity.assetClass)) score += 18;
  if (passport.strategies.includes(opportunity.strategy)) score += 14;
  if (opportunity.price >= passport.priceMin && opportunity.price <= passport.priceMax) score += 14;
  if (opportunity.capRate >= passport.minCap) score += 4;
  if (opportunity.cashOnCash >= passport.minCash) score += 4;
  return Math.min(score, 100);
}

function actorCanUseRoute(user: User, path: string) {
  if (path === '/' || path === '/network' || path === '/events' || path.startsWith('/events/') || path === '/introductions' || path === '/join' || path === '/apply/agent') return true;
  if (path === '/passport' || path === '/diagnostic' || path === '/next-steps') return user.role === 'investor' || user.role === 'network_admin';
  if (path === '/agent') return user.role === 'agent';
  if (path === '/deals' || path.startsWith('/deals/')) return ['investor', 'agent', 'service_partner', 'network_admin'].includes(user.role);
  if (path === '/opportunities/new') return ['investor', 'agent', 'network_admin'].includes(user.role);
  if (path === '/opportunities' || path.startsWith('/opportunities/')) return ['investor', 'agent', 'network_admin'].includes(user.role);
  if (path === '/reide') return ['investor', 'agent', 'service_partner', 'network_admin', 'jidoka_admin'].includes(user.role);
  if (path === '/admin/systems') return user.role === 'network_admin' || user.role === 'jidoka_admin';
  if (path === '/admin/events' || path === '/admin/investors') return user.role === 'network_admin' || user.role === 'city_organizer';
  if (path.startsWith('/admin')) return user.role === 'network_admin';
  return false;
}

function userDealIds(user: User, deals: Deal[]) {
  if (user.role === 'network_admin') return deals.map((d) => d.id);
  return deals.filter((deal) => deal.participants.includes(user.id)).map((d) => d.id);
}

function canSeeOpportunity(user: User, opportunity: Opportunity, deals: Deal[], passport?: Passport) {
  if (user.role === 'network_admin') return true;
  if (user.role === 'service_partner' || user.role === 'city_organizer') return false;
  if (user.role === 'jidoka_admin') return false;
  if (user.role === 'agent') return opportunity.marketId === user.marketId || deals.some((d) => d.opportunityId === opportunity.id && d.participants.includes(user.id));
  if (user.role === 'investor') return user.level >= opportunity.minLevel || scoreOpportunity(passport, opportunity) >= 70;
  return false;
}

function hasFullOpportunityAccess(user: User, opportunity: Opportunity, deals: Deal[], passport?: Passport) {
  if (user.role === 'network_admin') return true;
  if (deals.some((d) => d.opportunityId === opportunity.id && d.participants.includes(user.id))) return true;
  if (user.role === 'agent' && opportunity.marketId === user.marketId) return true;
  if (user.role === 'investor' && user.level >= opportunity.minLevel && scoreOpportunity(passport, opportunity) >= 70) return true;
  return false;
}

function navFor(user: User) {
  const base = [{ href: '/', label: 'Command Center' }];
  if (user.role === 'investor') base.push({ href: '/passport', label: 'Investor Passport' }, { href: '/opportunities', label: 'Opportunities' }, { href: '/deals', label: 'My Deals' }, { href: '/opportunities/new', label: 'Submit Deal' }, { href: '/network', label: 'Network' }, { href: '/events', label: 'Events' }, { href: '/reide', label: 'REIDE' }, { href: '/next-steps', label: 'Next Steps' }, { href: '/introductions', label: 'Introductions' });
  if (user.role === 'agent') base.push({ href: '/agent', label: 'Agent Hub' }, { href: '/opportunities', label: 'Territory Deals' }, { href: '/deals', label: 'Deal Workspaces' }, { href: '/opportunities/new', label: 'Submit Deal' }, { href: '/network', label: 'Network' }, { href: '/events', label: 'Events' }, { href: '/reide', label: 'REIDE' }, { href: '/introductions', label: 'Introductions' });
  if (user.role === 'city_organizer') base.push({ href: '/network', label: 'Market Network' }, { href: '/events', label: 'Events' }, { href: '/introductions', label: 'Introductions' }, { href: '/admin/events', label: 'Event Ops' }, { href: '/admin/investors', label: 'Investor Interest' });
  if (user.role === 'service_partner') base.push({ href: '/deals', label: 'Invited Deals' }, { href: '/reide', label: 'Assigned REIDE' }, { href: '/network', label: 'Network' }, { href: '/events', label: 'Events' }, { href: '/introductions', label: 'Introductions' });
  if (user.role === 'jidoka_admin') base.push({ href: '/admin/systems', label: 'JIDOKA Systems' }, { href: '/reide', label: 'REIDE Health' }, { href: '/network', label: 'Network Map' }, { href: '/events', label: 'Events' }, { href: '/introductions', label: 'Introductions' });
  if (user.role === 'network_admin') base.push({ href: '/opportunities', label: 'Opportunities' }, { href: '/deals', label: 'Deals' }, { href: '/opportunities/new', label: 'Submit Deal' }, { href: '/network', label: 'Network' }, { href: '/events', label: 'Events' }, { href: '/reide', label: 'REIDE' }, { href: '/introductions', label: 'Introductions' }, { href: '/admin', label: 'Ecosystem Map' }, { href: '/admin/agents', label: 'Agent Hub' }, { href: '/admin/investors', label: 'Investor Pipeline' }, { href: '/admin/opportunities', label: 'Opportunity Ops' }, { href: '/admin/market-pulse', label: 'Market Pulse' }, { href: '/admin/systems', label: 'JIDOKA Systems' });
  return base;
}

export default function Home() {
  const [path, setPath] = useState('/');
  const [query, setQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState(() => {
    if (typeof window === 'undefined') return 'u_marcus';
    const savedUserId = window.localStorage.getItem('investor-social-persona');
    return savedUserId && users.some((person) => person.id === savedUserId) ? savedUserId : 'u_marcus';
  });
  const [passports, setPassports] = useState(initialPassports);
  const [deals, setDeals] = useState(initialDeals);
  const [intros, setIntros] = useState(initialIntroductions);
  const [reviewedReide, setReviewedReide] = useState<Record<string, string[]>>({});
  const [audit, setAudit] = useState([
    'Alicia Torres uploaded inspection report to IS-2026-0114.',
    'Alex Morgan granted Priya Raman contact access to Marcus Bell.',
    'Ray Sandoval declined a lead: not transaction-ready.',
  ]);
  const [toast, setToast] = useState('');

  const user = users.find((u) => u.id === currentUserId) ?? users[1];
  const passport = passports[user.id];
  const params = new URLSearchParams(query);

  useEffect(() => {
    function syncLocation() {
      setPath(window.location.pathname);
      setQuery(window.location.search);
    }
    syncLocation();
    window.addEventListener('popstate', syncLocation);
    return () => window.removeEventListener('popstate', syncLocation);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function go(href: string) {
    const url = new URL(href, window.location.origin);
    setPath(url.pathname);
    setQuery(url.search);
    setToast('');
    window.history.pushState({}, '', url.pathname + url.search);
    window.scrollTo({ top: 0 });
  }

  function record(message: string) {
    setToast(message);
    setAudit((items) => [`${user.name}: ${message}`, ...items].slice(0, 8));
  }

  function changeUser(id: string) {
    const next = users.find((u) => u.id === id);
    if (!next) return;
    setCurrentUserId(id);
    window.localStorage.setItem('investor-social-persona', id);
    setPath('/');
    setQuery('');
    if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
    setToast(`Switched demo persona to ${next.name}. Production auth would not allow this switcher.`);
  }

  const allowed = actorCanUseRoute(user, path);

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => go('/')} aria-label="Open Command Center">
          <span>Investor Social</span>
          <small>Operating Network</small>
        </button>
        <div className="demo-strip">
          <span>Simulated demo</span>
          <span>Demo clock: {demoClockLabel}</span>
        </div>
        <label className="persona">
          <span>Signed in as</span>
          <select value={user.id} onChange={(event) => changeUser(event.target.value)} aria-label="Demo persona">
            {users.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} - {roleLabels[person.role]}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="mobile-nav">
        <select aria-label="Navigate" value={path} onChange={(event) => go(event.target.value)}>
          {navFor(user).map((item) => (
            <option key={item.href} value={item.href}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="layout">
        <aside className="sidebar">
          <div className="identity-card">
            <strong>{user.name}</strong>
            <span>{roleLabels[user.role]}</span>
            <small>Level {user.level} - {user.stage}</small>
          </div>
          <nav aria-label="Primary navigation">
            {navFor(user).map((item) => (
              <button key={item.href} className={path === item.href ? 'active' : ''} onClick={() => go(item.href)}>
                {item.label}
              </button>
            ))}
          </nav>
          <p className="operator">JIDOKA Group<br />Infrastructure and orchestration</p>
        </aside>

        <section className="content">
          {toast ? <div className="toast" role="status">{toast}</div> : null}
          {!allowed ? (
            <AccessDenied user={user} path={path} go={go} />
          ) : (
            <Router
              path={path}
              query={query}
              user={user}
              passport={passport}
              passports={passports}
              setPassports={setPassports}
              deals={deals}
              setDeals={setDeals}
              intros={intros}
              setIntros={setIntros}
              reviewedReide={reviewedReide}
              setReviewedReide={setReviewedReide}
              audit={audit}
              record={record}
              go={go}
              params={params}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function Router(props: {
  path: string;
  query: string;
  user: User;
  passport?: Passport;
  passports: Record<string, Passport>;
  setPassports: (value: Record<string, Passport>) => void;
  deals: Deal[];
  setDeals: (value: Deal[]) => void;
  intros: IntroRequest[];
  setIntros: (value: IntroRequest[]) => void;
  reviewedReide: Record<string, string[]>;
  setReviewedReide: (value: Record<string, string[]>) => void;
  audit: string[];
  record: (message: string) => void;
  go: (href: string) => void;
  params: URLSearchParams;
}) {
  const { path } = props;
  if (path === '/') return <CommandCenter {...props} />;
  if (path === '/passport') return <PassportScreen {...props} />;
  if (path === '/diagnostic') return <Diagnostic {...props} />;
  if (path === '/next-steps') return <NextSteps {...props} />;
  if (path === '/opportunities') return <OpportunityFeed {...props} />;
  if (path === '/opportunities/new') return <SubmitOpportunity {...props} />;
  if (path.startsWith('/opportunities/')) return <OpportunityDetail id={path.split('/')[2]} {...props} />;
  if (path === '/deals') return <Deals {...props} />;
  if (path.startsWith('/deals/')) return <DealDetail id={path.split('/')[2]} {...props} />;
  if (path === '/network') return <Network {...props} />;
  if (path === '/events') return <Events {...props} />;
  if (path.startsWith('/events/')) return <EventDetail id={path.split('/')[2]} {...props} />;
  if (path === '/reide') return <Reide {...props} />;
  if (path === '/introductions') return <Introductions {...props} />;
  if (path === '/agent') return <AgentHub {...props} />;
  if (path === '/join') return <Join {...props} />;
  if (path === '/apply/agent') return <AgentApplication {...props} />;
  if (path.startsWith('/admin')) return <Admin {...props} />;
  return <AccessDenied user={props.user} path={path} go={props.go} />;
}

function PageHeader({ eyebrow, title, intro, actions }: { eyebrow: string; title: string; intro?: string; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </header>
  );
}

function Stat({ label, value, note, tone = 'neutral' }: { label: string; value: string; note: string; tone?: Tone }) {
  return (
    <div className={`stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function Card({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <article className={`card ${tone}`}>{children}</article>;
}

function CommandCenter({ user, passport, deals, intros, audit, go }: Parameters<typeof Router>[0]) {
  const visibleDeals = deals.filter((deal) => userDealIds(user, deals).includes(deal.id));
  const openTasks = visibleDeals.flatMap((deal) => deal.tasks.filter((task) => !task.complete));
  const nextTask = openTasks[0];
  const firstDeal = visibleDeals[0];
  const firstOpp = firstDeal ? opportunities.find((opp) => opp.id === firstDeal.opportunityId) : undefined;
  const visibleOpps = opportunities.filter((opp) => canSeeOpportunity(user, opp, deals, passport));
  const pendingRequests = intros.filter((intro) => intro.targetId === user.id && intro.status === 'pending');
  const myRequests = intros.filter((intro) => intro.requesterId === user.id);
  const admin = user.role === 'network_admin';
  return (
    <>
      <PageHeader eyebrow="Command Center" title={`Good morning, ${user.name.split(' ')[0]}`} />
      <div className="stat-grid dashboard-metrics">
        <Stat label="Next action" value={nextTask ? 'Due' : 'Clear'} note={nextTask?.label ?? 'No open task'} tone={nextTask ? nextTask.priority : 'good'} />
        <Stat label="Introductions" value={`${pendingRequests.length}`} note="Waiting on you" tone={pendingRequests.length ? 'warn' : 'good'} />
        <Stat label="Active deal" value={firstDeal ? stages[firstDeal.stageIndex] : 'None'} note={firstOpp?.title ?? 'No workspace'} />
        <Stat label={admin ? 'Review queue' : 'Matched deals'} value={admin ? '1' : `${visibleOpps.length}`} note={admin ? 'Opportunity pending' : 'In your feed'} tone={admin ? 'warn' : 'neutral'} />
      </div>
      <section className="quiet-section">
        <Card>
          <h2>Today</h2>
          <ActionRow tone="danger" title={nextTask?.label ?? 'No overdue work'} body={nextTask ? `${users.find((u) => u.id === nextTask.ownerId)?.name} - ${nextTask.due}` : 'You are clear.'} cta="Open" onClick={() => go(firstDeal ? `/deals/${firstDeal.id}` : '/deals')} />
          <ActionRow tone="warn" title="Review matched opportunities" body={`${visibleOpps.length} records available`} cta="Open feed" onClick={() => go('/opportunities')} />
          <ActionRow tone="neutral" title="September event matches" body="4 recommended intros" cta="View" onClick={() => go('/events/evt_rva_sep')} />
        </Card>
      </section>
      <section className="two-col low-priority">
        <Card>
          <h2>Introductions</h2>
          {pendingRequests.length ? pendingRequests.map((intro) => <ActionRow key={intro.id} tone="warn" title={users.find((u) => u.id === intro.requesterId)?.name ?? 'Request'} body={intro.context} cta="Review" onClick={() => go('/introductions')} />) : <p>No requests waiting.</p>}
          {myRequests.slice(0, 2).map((intro) => <p className="fine-print" key={intro.id}>{users.find((u) => u.id === intro.targetId)?.name}: {intro.status}</p>)}
        </Card>
        <Card>
          <h2>Activity</h2>
          <ul className="audit-list">
            {audit.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>
      </section>
    </>
  );
}

function ActionRow({ title, body, cta, tone, onClick }: { title: string; body: string; cta: string; tone: Tone; onClick: () => void }) {
  return (
    <div className={`action-row ${tone}`}>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <button onClick={onClick}>{cta}</button>
    </div>
  );
}

function PassportScreen({ user, passport, passports, setPassports, record, go }: Parameters<typeof Router>[0]) {
  const [draft, setDraft] = useState(passport);
  if (!passport || !draft) return <AccessDenied user={user} path="/passport" go={go} />;
  function update<K extends keyof Passport>(key: K, value: Passport[K]) {
    setDraft({ ...draft!, [key]: value });
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const readiness = Math.min(100, 45 + (draft.preapproval ? 16 : 0) + (draft.capital >= 200000 ? 14 : 6) + (draft.timeline === 'Within 90 days' ? 8 : 3) + draft.assetClasses.length * 3 + draft.strategies.length * 3 + (draft.targetIrr >= 15 ? 4 : 2));
    const blockers = [
      draft.preapproval ? '' : 'Financing readiness',
      draft.capital >= 200000 ? '' : 'Capital position',
      draft.strategies.length ? '' : 'Strategy clarity',
      draft.timeline === 'Exploring' ? 'Timeline commitment' : '',
    ].filter(Boolean);
    setPassports({ ...passports, [user.id]: { ...draft, readiness, blockers } });
    record(`Passport saved. Readiness is now ${readiness}, and match scores were recalculated.`);
  }
  return (
    <>
      <PageHeader eyebrow="Investor Passport" title={user.name} intro="Buy box, capital, readiness." actions={<button onClick={() => go('/diagnostic')}>Reassess readiness</button>} />
      <form className="form-grid" onSubmit={save}>
        <Card>
          <h2>Investment profile</h2>
          <Field label="Experience"><select value={draft.experience} onChange={(e) => update('experience', e.target.value)}><option>No acquisitions yet</option><option>1-3 deals</option><option>4-10 deals</option><option>More than 10</option></select></Field>
          <Field label="Risk tolerance"><select value={draft.risk} onChange={(e) => update('risk', e.target.value)}><option>Conservative</option><option>Moderate</option><option>Aggressive</option></select></Field>
          <Field label="Acquisition timeline"><select value={draft.timeline} onChange={(e) => update('timeline', e.target.value)}><option>Within 90 days</option><option>90-180 days</option><option>6-12 months</option><option>Exploring</option></select></Field>
          <Field label="Target IRR (%)"><input type="number" value={draft.targetIrr} onChange={(e) => update('targetIrr', Number(e.target.value))} /></Field>
          <Field label="Preferred partners"><textarea value={draft.partnerNote} onChange={(e) => update('partnerNote', e.target.value)} /></Field>
        </Card>
        <Card>
          <h2>Buy box</h2>
          <Field label="Primary target market"><select value={draft.marketId} onChange={(e) => update('marketId', e.target.value)}>{markets.map((m) => <option value={m.id} key={m.id}>{m.name}</option>)}</select></Field>
          <div className="split"><Field label="Price minimum"><input type="number" value={draft.priceMin} onChange={(e) => update('priceMin', Number(e.target.value))} /></Field><Field label="Price maximum"><input type="number" value={draft.priceMax} onChange={(e) => update('priceMax', Number(e.target.value))} /></Field></div>
          <div className="split"><Field label="Capital available"><input type="number" value={draft.capital} onChange={(e) => update('capital', Number(e.target.value))} /></Field><Field label="Preapproval amount"><input type="number" value={draft.preapproval} onChange={(e) => update('preapproval', Number(e.target.value))} /></Field></div>
          <CheckGroup label="Asset classes" values={['Single family', 'Small multifamily', 'Multifamily', 'Short-term rental', 'Commercial']} selected={draft.assetClasses} onChange={(assetClasses) => update('assetClasses', assetClasses)} />
          <CheckGroup label="Strategies" values={['Long-term rental', 'Short-term rental', 'BRRRR', 'Flip', 'Value-add', 'Buy and hold']} selected={draft.strategies} onChange={(strategies) => update('strategies', strategies)} />
          <button type="submit">Save Passport</button>
        </Card>
      </form>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function CheckGroup({ label, values, selected, onChange }: { label: string; values: string[]; selected: string[]; onChange: (values: string[]) => void }) {
  return (
    <fieldset className="checks">
      <legend>{label}</legend>
      {values.map((value) => (
        <label key={value}>
          <input type="checkbox" checked={selected.includes(value)} onChange={(e) => onChange(e.target.checked ? [...selected, value] : selected.filter((item) => item !== value))} />
          {value}
        </label>
      ))}
    </fieldset>
  );
}

function Diagnostic({ user, passport, passports, setPassports, record, go }: Parameters<typeof Router>[0]) {
  const [answers, setAnswers] = useState({
    financing: passport?.preapproval ? 20 : 8,
    capital: passport && passport.capital > 200000 ? 18 : 9,
    strategy: passport?.strategies.length ? 12 : 5,
    market: 10,
    underwriting: 8,
    experience: passport?.experience === 'No acquisitions yet' ? 4 : 9,
    docs: 6,
    timeline: passport?.timeline === 'Within 90 days' ? 6 : 2,
  });
  const total = Object.values(answers).reduce((sum, value) => sum + value, 0);
  const blockers = Object.entries(answers).filter(([, value]) => value < 8).map(([key]) => key.replace(/\b\w/g, (letter) => letter.toUpperCase()));
  function submit(event: FormEvent) {
    event.preventDefault();
    if (passport) {
      setPassports({ ...passports, [user.id]: { ...passport, readiness: total, blockers } });
    }
    record(`Diagnostic complete. Score ${total}; ${blockers.length ? blockers.join(', ') : 'no blockers'}.`);
    go('/next-steps');
  }
  return (
    <>
      <PageHeader eyebrow="Investor Diagnostic" title="Readiness check" intro="Score, blocker, next move." />
      <form onSubmit={submit} className="two-col">
        <Card>
          <h2>Assessment</h2>
          {Object.entries(answers).map(([key, value]) => (
            <label className="range-field" key={key}>
              <span>{key.replace(/\b\w/g, (letter) => letter.toUpperCase())}</span>
              <input type="range" min="0" max={key === 'timeline' ? 6 : key === 'financing' ? 20 : 18} value={value} onChange={(e) => setAnswers({ ...answers, [key]: Number(e.target.value) })} />
              <strong>{value}</strong>
            </label>
          ))}
          <button type="submit">Reassess readiness</button>
        </Card>
        <Card tone={total >= 75 ? 'good' : 'warn'}>
          <h2>Result preview</h2>
          <div className="score">{total}</div>
          <p>{total >= 75 ? 'Ready for deal flow.' : 'Clear blockers first.'}</p>
          <ul className="tag-list">{blockers.length ? blockers.map((b) => <li key={b}>{b}</li>) : <li>No blocker detected</li>}</ul>
        </Card>
      </form>
    </>
  );
}

function NextSteps({ user, passport, reviewedReide, go }: Parameters<typeof Router>[0]) {
  const blockers = passport ? passport.blockers : ['Underwriting ability'];
  const reviewedCount = reviewedReide[user.id]?.length ?? 0;
  const reviewTargets = opportunities.filter((opp) => opp.analysisId && hasFullOpportunityAccess(user, opp, [], passport)).slice(0, 2);
  if (!blockers.length) {
    return (
      <>
        <PageHeader eyebrow="Next Steps" title="Ready for deal flow" />
        <Card tone="good">
          <h2>No open blockers</h2>
          <div className="action-row good">
            <div><strong>Verified</strong><p>REIDE review complete.</p></div>
            <button onClick={() => go('/opportunities')}>Open feed</button>
          </div>
        </Card>
      </>
    );
  }
  return (
    <>
      <PageHeader eyebrow="Next Steps" title="Clear the blocker" />
      <div className="stack">
        {blockers.map((blocker, index) => (
          <Card key={blocker}>
            <p className="eyebrow">Priority {index + 1}</p>
            <h2>{blocker}</h2>
            <div className="action-row neutral">
              <div>
                <strong>{blocker === 'Underwriting ability' && reviewedCount >= 2 ? 'Verified' : 'Required'}</strong>
                <p>{blocker === 'Financing readiness' ? 'Upload pre-approval or term sheet.' : blocker === 'Capital position' ? 'Confirm deployable capital.' : `${Math.min(reviewedCount, 2)}/2 REIDE analyses reviewed.`}</p>
              </div>
              {blocker === 'Underwriting ability' ? null : <button onClick={() => go('/passport')}>Open path</button>}
            </div>
            {blocker === 'Underwriting ability' ? <ReviewProgress count={reviewedCount} targets={reviewTargets} go={go} /> : null}
          </Card>
        ))}
      </div>
    </>
  );
}

function ReviewProgress({ count, targets, go }: { count: number; targets: Opportunity[]; go: (href: string) => void }) {
  return (
    <div className="review-progress" aria-label="REIDE review verification progress">
      {[0, 1].map((index) => {
        const target = targets[index];
        const label = target ? `${target.address} - ${index < count ? 'Reviewed' : 'Open'}` : `${index < count ? 'Reviewed' : 'Open'} analysis`;
        return <button key={index} type="button" className={index < count ? 'done' : ''} onClick={() => target?.analysisId ? go(`/reide?analysis=${target.analysisId}`) : go('/reide')}>{label}</button>;
      })}
    </div>
  );
}

function OpportunityFeed({ user, passport, deals, go }: Parameters<typeof Router>[0]) {
  const visible = opportunities.filter((opp) => canSeeOpportunity(user, opp, deals, passport));
  return (
    <>
      <PageHeader eyebrow="Opportunity Exchange" title={user.role === 'agent' ? 'Territory opportunities' : 'Passport matches'} actions={<button onClick={() => go('/passport')}>Adjust buy box</button>} />
      <div className="cards-grid">
        {visible.map((opp) => {
          const score = scoreOpportunity(passport, opp);
          const full = hasFullOpportunityAccess(user, opp, deals, passport);
          return (
            <button key={opp.id} className="opportunity-card" onClick={() => go(`/opportunities/${opp.id}`)}>
              <span>{opp.assetClass}</span>
              <strong>{opp.title}</strong>
              <small>{full ? `${opp.address}, ${opp.cityLine}` : `${marketName(opp.marketId)} - location withheld`}</small>
              <div className="metric-row"><b>{score}% match</b><b>{money(opp.price)}</b><b>{opp.capRate}% cap</b></div>
              <em>{full ? 'Full access' : 'Blinded preview'}</em>
            </button>
          );
        })}
      </div>
    </>
  );
}

function OpportunityDetail({ id, user, passport, deals, record, go }: Parameters<typeof Router>[0] & { id: string }) {
  const opp = opportunities.find((item) => item.id === id);
  if (!opp || !canSeeOpportunity(user, opp, deals, passport)) return <AccessDenied user={user} path={`/opportunities/${id}`} go={go} />;
  const full = hasFullOpportunityAccess(user, opp, deals, passport);
  return (
    <>
      <PageHeader eyebrow={`${marketName(opp.marketId)} - ${opp.assetClass}`} title={opp.title} intro={full ? `${opp.address}, ${opp.cityLine}` : 'Blinded preview'} actions={full ? <button onClick={() => go('/deals/dl_1')}>Open workspace</button> : <button onClick={() => record(`Access request created for ${opp.title}. Status: pending approval.`)}>Request access</button>} />
      <section className="two-col">
        <Card>
          <h2>Opportunity overview</h2>
          <p>{opp.summary}</p>
          <div className="stat-grid compact">
            <Stat label="Target acquisition" value={money(opp.price)} note="Seller stated" />
            <Stat label="Capital required" value={money(opp.capital)} note="Equity, not purchase price" />
            <Stat label="Cap rate" value={`${opp.capRate}%`} note="Stabilized" />
            <Stat label="Cash-on-cash" value={`${opp.cashOnCash}%`} note="Projected" />
          </div>
        </Card>
        <Card tone={full ? 'good' : 'warn'}>
          <h2>Access state</h2>
          <div className="access-chip-grid" aria-label="Access state checks">
            <span>{opp.verified ? 'Network reviewed' : 'Awaiting review'}</span>
            <span>{opp.analysisId ? 'REIDE analysis available' : 'No analysis yet'}</span>
            <span>{opp.status}</span>
          </div>
          {opp.analysisId && full ? <button onClick={() => go(`/reide?analysis=${opp.analysisId}`)}>Open REIDE analysis</button> : null}
        </Card>
      </section>
    </>
  );
}

function SubmitOpportunity({ user, record }: Parameters<typeof Router>[0]) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    record(`Opportunity "${form.get('title')}" submitted for network review. It is not visible in investor feeds until approved.`);
    event.currentTarget.reset();
  }
  return (
    <>
      <PageHeader eyebrow="Opportunity Exchange" title="Submit opportunity" intro="Review first. Feed second." />
      <form className="form-grid" onSubmit={submit}>
        <Card>
          <h2>The deal</h2>
          <Field label="Title required"><input name="title" required placeholder="12-unit multifamily, Southside Richmond" /></Field>
          <Field label="Summary required"><textarea name="summary" required placeholder="Key facts, risk, source." /></Field>
          <Field label="Source"><select name="source"><option>Agent</option><option>Broker</option><option>Owner</option><option>Wholesaler</option><option>Investor member</option></select></Field>
        </Card>
        <Card>
          <h2>The property</h2>
          <Field label="Market required"><select name="marketId" required>{markets.map((m) => <option value={m.id} key={m.id}>{m.name}</option>)}</select></Field>
          <Field label="Address"><input name="address" placeholder="Withheld from blinded previews" /></Field>
          <div className="split"><Field label="Target acquisition required"><input name="price" type="number" required /></Field><Field label="Capital required"><input name="capital" type="number" required /></Field></div>
          <button type="submit">Submit for review</button>
          <p className="fine-print">Submitted by {user.name}</p>
        </Card>
      </form>
    </>
  );
}

function Deals({ user, deals, go }: Parameters<typeof Router>[0]) {
  const rows = deals.filter((deal) => userDealIds(user, deals).includes(deal.id));
  return (
    <>
      <PageHeader eyebrow="Transactions" title={user.role === 'service_partner' ? 'Invited deals' : 'My deals'} />
      <div className="table-card">
        <table>
          <thead><tr><th>Reference</th><th>Investor</th><th>Opportunity</th><th>Stage</th><th>Next action</th><th>Open</th></tr></thead>
          <tbody>{rows.map((deal) => {
            const opp = opportunities.find((o) => o.id === deal.opportunityId)!;
            return <tr key={deal.id} onClick={() => go(`/deals/${deal.id}`)}><td>{deal.ref}</td><td>{users.find((u) => u.id === deal.investorId)?.name}</td><td>{opp.title}</td><td>{stages[deal.stageIndex]}</td><td>{deal.tasks.find((t) => !t.complete)?.label ?? 'No open work'}</td><td><button type="button" onClick={(event) => { event.stopPropagation(); go(`/deals/${deal.id}`); }}>Open</button></td></tr>;
          })}</tbody>
        </table>
      </div>
    </>
  );
}

function DealDetail({ id, user, deals, setDeals, record, go }: Parameters<typeof Router>[0] & { id: string }) {
  const deal = deals.find((item) => item.id === id);
  if (!deal || !userDealIds(user, deals).includes(deal.id)) return <AccessDenied user={user} path={`/deals/${id}`} go={go} />;
  const opp = opportunities.find((item) => item.id === deal.opportunityId)!;
  const canAdvance = user.role === 'network_admin' || user.role === 'agent' || user.id === deal.investorId;
  function updateDeal(next: Deal) {
    setDeals(deals.map((item) => item.id === next.id ? next : item));
  }
  return (
    <>
      <PageHeader eyebrow={`${deal.ref} - target ${deal.targetClose}`} title={opp.title} intro={stages[deal.stageIndex]} actions={canAdvance ? <button onClick={() => { updateDeal({ ...deal, stageIndex: Math.min(deal.stageIndex + 1, stages.length - 1) }); record(`Deal advanced to ${stages[Math.min(deal.stageIndex + 1, stages.length - 1)]}.`); }}>Advance stage</button> : <button disabled title="Service partners cannot advance stage">Stage locked</button>} />
      <section className="two-col">
        <Card>
          <h2>Milestones</h2>
          <MilestoneRail current={deal.stageIndex} />
        </Card>
        <Card>
          <h2>Outstanding actions</h2>
          {deal.tasks.map((task) => {
            const owner = users.find((u) => u.id === task.ownerId);
            const canComplete = user.role === 'network_admin' || user.id === task.ownerId || user.role === 'agent';
            return <div className="task" key={task.id}><div><strong>{task.label}</strong><small>{owner?.name} - due {task.due}</small></div><button disabled={!canComplete || task.complete} onClick={() => { updateDeal({ ...deal, tasks: deal.tasks.map((item) => item.id === task.id ? { ...item, complete: true } : item) }); record(`Task completed: ${task.label}.`); }}>{task.complete ? 'Complete' : canComplete ? 'Mark complete' : 'Not yours'}</button></div>;
          })}
        </Card>
      </section>
    </>
  );
}

function MilestoneRail({ current }: { current: number }) {
  return (
    <div className="milestone-rail" role="list" aria-label="Transaction milestone progress">
      {stages.map((stage, index) => {
        const reached = index <= current;
        const active = index === current;
        return (
          <div key={stage} className={`milestone-step ${reached ? 'reached' : 'pending'} ${active ? 'active' : ''}`} role="listitem">
            <span className="milestone-dot">{index + 1}</span>
            <strong>{stage}</strong>
            <small>{reached ? (active ? 'Current' : 'Reached') : 'Not done'}</small>
          </div>
        );
      })}
    </div>
  );
}

function Network({ user, intros, setIntros, record }: Parameters<typeof Router>[0]) {
  const visibleUsers = users.filter((person) => person.id !== user.id && (user.role !== 'city_organizer' || personTouchesMarket(person, user.marketId)));
  function requestIntro(event: FormEvent<HTMLFormElement>, targetId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const reason = String(form.get('reason') ?? '');
    const target = users.find((u) => u.id === targetId)!;
    setIntros([{ id: `intro_${intros.length + 1}`, requesterId: user.id, targetId, context: 'Network', reason, status: 'pending' }, ...intros]);
    record(`Introduction requested with ${target.name}. Contact remains hidden until approval.`);
    event.currentTarget.reset();
  }
  return (
    <>
      <PageHeader eyebrow="Network" title="Members" intro={user.role === 'city_organizer' ? 'Investors target this market. Agents own territories.' : 'Contact unlocks by approval.'} />
      <div className="cards-grid">
        {visibleUsers.map((person) => {
          const approved = intros.some((intro) => intro.status === 'approved' && ((intro.requesterId === user.id && intro.targetId === person.id) || (intro.targetId === user.id && intro.requesterId === person.id)));
          return (
            <Card key={person.id}>
              <p className="eyebrow">{roleLabels[person.role]} - {profileScope(person)}</p>
              <h2>{person.name}</h2>
              <p>{person.headline}</p>
              {approved ? <p className="contact">Contact released: {person.name.toLowerCase().replace(' ', '.')}@example.demo</p> : (
                <form onSubmit={(event) => requestIntro(event, person.id)} className="inline-form">
                  <textarea name="reason" required placeholder={`Why do you want to meet ${person.name}?`} aria-label={`Reason for introduction to ${person.name}`} />
                  <button type="submit" aria-label={`Request introduction to ${person.name}`}>Request intro</button>
                </form>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

function Events({ go }: Parameters<typeof Router>[0]) {
  const events = [
    { id: 'evt_rva_sep', title: 'Richmond Investor Social - September', market: 'Richmond, VA', date: '3 Sep 2026', status: 'Upcoming', count: 5 },
    { id: 'evt_clt_sep', title: 'Charlotte Investor Social - September', market: 'Charlotte, NC', date: '17 Sep 2026', status: 'Upcoming', count: 3 },
    { id: 'evt_past_rva', title: 'Richmond Investor Social - June', market: 'Richmond, VA', date: '11 Jun 2026', status: 'Past event', count: 2 },
    { id: 'evt_past_tpa', title: 'Tampa Investor Social - August', market: 'Tampa, FL', date: '13 Aug 2026', status: 'Past event', count: 1 },
  ];
  return (
    <>
      <PageHeader eyebrow="Events" title="Matchmaking" />
      <div className="cards-grid">{events.map((event) => <button key={event.id} className="opportunity-card" onClick={() => go(`/events/${event.id}`)}><span>{event.status}</span><strong>{event.title}</strong><small>{event.market} - {event.date}</small><em>{event.count} registered</em></button>)}</div>
    </>
  );
}

function EventDetail({ id, user, intros, setIntros, record, go }: Parameters<typeof Router>[0] & { id: string }) {
  const past = id.includes('past');
  const eventMarket = id.includes('clt') ? 'mkt_clt' : id.includes('tpa') ? 'mkt_tpa' : 'mkt_rva';
  const title = id.includes('clt') ? 'Charlotte Investor Social - September' : id.includes('tpa') ? 'Tampa Investor Social - August' : id.includes('past') ? 'Richmond Investor Social - June' : 'Richmond Investor Social - September';
  const matches = users.filter((person) => person.id !== user.id && personTouchesMarket(person, eventMarket)).slice(0, 4);
  return (
    <>
      <PageHeader eyebrow={past ? 'Past event' : 'Upcoming event'} title={title} intro={past ? 'Closed' : 'Seek, offer, match.'} actions={<button onClick={() => go('/events')}>All events</button>} />
      <section className="two-col">
        <Card>
          <h2>{past ? 'Past event matches' : 'You should meet'}</h2>
          {matches.map((person) => <ActionRow key={person.id} tone="neutral" title={person.name} body={profileScope(person)} cta="Request intro" onClick={() => { setIntros([{ id: `intro_${intros.length + 1}`, requesterId: user.id, targetId: person.id, context: title, reason: `Event-context intro from ${title}`, status: 'pending' }, ...intros]); record(`Event-context introduction requested with ${person.name}.`); }} />)}
        </Card>
        <Card>
          <h2>{past ? 'Event closed' : 'Registration'}</h2>
          <form onSubmit={(event) => { event.preventDefault(); record(`Event preferences updated for ${title}. Matchmaking recalculated.`); }} className="checks">
            <legend>I am looking for</legend>
            {['Capital', 'Deals', 'Partners', 'Lenders', 'Knowledge'].map((item) => <label key={item}><input type="checkbox" disabled={past} />{item}</label>)}
            <legend>I can provide</legend>
            {['Capital', 'Deals', 'Expertise', 'Services', 'Introductions'].map((item) => <label key={item}><input type="checkbox" disabled={past} />{item}</label>)}
            <button disabled={past}>{past ? 'Closed' : 'Register or update'}</button>
          </form>
        </Card>
      </section>
    </>
  );
}

function Reide({ user, deals, passport, passports, setPassports, reviewedReide, setReviewedReide, params, record, go }: Parameters<typeof Router>[0]) {
  const available = opportunities.filter((opp) => opp.analysisId && (user.role === 'jidoka_admin' || hasFullOpportunityAccess(user, opp, deals, passport)));
  const selected = available.find((opp) => opp.analysisId === params.get('analysis')) ?? available[0];
  const model = selected?.analysisId ? reideModels[selected.analysisId] : undefined;
  const [activeCalc, setActiveCalc] = useState(model?.calculations[0]?.label ?? '');
  const [activeStage, setActiveStage] = useState(model?.stages[0]?.label ?? '');
  const [activeScenario, setActiveScenario] = useState('Base');
  const [evidence, setEvidence] = useState(initialEvidence);
  const [memoVersions, setMemoVersions] = useState(initialMemoVersions);
  const [reviewChecks, setReviewChecks] = useState<Record<string, { calculator: boolean; records: boolean; risks: boolean }>>({});
  const [outreachStatus, setOutreachStatus] = useState<Record<string, ReideOutreachStatus>>({});
  const [stagePanelOpen, setStagePanelOpen] = useState(false);
  const selectedAnalysisId = selected?.analysisId ?? '';
  const attestations = reviewChecks[selectedAnalysisId] ?? { calculator: false, records: false, risks: false };
  const active = model?.calculations.find((calc) => calc.label === activeCalc) ?? model?.calculations[0];
  const stage = model?.stages.find((item) => item.label === activeStage) ?? model?.stages[0];
  const evidenceItems = evidence[selectedAnalysisId] ?? [];
  const scenarios = reideScenarios[selectedAnalysisId] ?? [];
  const scenario = scenarios.find((item) => item.label === activeScenario) ?? scenarios[0];
  const conflicts = model?.sources.filter((source) => source.status === 'Conflict' || source.status === 'Missing') ?? [];
  const qualityScore = model ? Math.round((Number(model.publicRecordScore) * .45) + ((model.sources.filter((source) => source.status === 'Clear').length / model.sources.length) * 35) + (conflicts.length ? 8 : 20)) : 0;
  const conflictSopItems = selected && model ? conflicts.map((source) => makeReideSopItem({
    id: `${selectedAnalysisId}_conflict_${source.label}`,
    question: `Can you resolve ${source.label.toLowerCase()} for REIDE?`,
    label: source.label,
    detail: source.finding,
    targetStage: source.label === 'Physical' ? 'Physical diligence' : source.label === 'Tax assessment' ? 'Capital stack' : 'Public records',
    ownerName: source.owner,
    selectedTitle: selected.title,
    requesterName: user.name,
  })) : [];
  const nextSopItems = selected && model ? model.nextQuestions.map((question) => makeReideSopItem({
    id: `${selectedAnalysisId}_next_${question}`,
    question,
    label: question.includes('DSCR') ? 'Financing' : question.includes('cost-seg') ? 'Tax strategy' : question.includes('permit') ? 'Permits' : question.includes('renewal') ? 'Lease renewal' : 'Next question',
    detail: 'Needed before REIDE can move from analysis to a clean operating recommendation.',
    targetStage: question.includes('DSCR') ? 'Capital stack' : question.includes('permit') ? 'Public records' : question.includes('cost-seg') ? 'IC memo' : 'Physical diligence',
    ownerName: ownerFromQuestion(question),
    selectedTitle: selected.title,
    requesterName: user.name,
  })) : [];
  const activeStageSopItem = selected && stage ? makeReideSopItem({
    id: `${selectedAnalysisId}_stage_active_${stage.label}`,
    question: `Can you clear ${stage.label.toLowerCase()} for REIDE?`,
    label: stage.label,
    detail: stage.detail,
    targetStage: stage.label,
    ownerName: stage.owner,
    selectedTitle: selected.title,
    requesterName: user.name,
  }) : undefined;
  const stageMeta = stage ? stageStatusMeta(stage) : undefined;
  const reviewedForUser = reviewedReide[user.id] ?? [];
  const alreadyReviewed = selectedAnalysisId ? reviewedForUser.includes(selectedAnalysisId) : false;
  const canMarkReviewed = Object.values(attestations).every(Boolean);
  function markReviewed() {
    if (!selectedAnalysisId || alreadyReviewed || !canMarkReviewed) return;
    const nextReviewed = [...reviewedForUser, selectedAnalysisId];
    setReviewedReide({ ...reviewedReide, [user.id]: nextReviewed });
    if (passport && nextReviewed.length >= 2 && passport.blockers.includes('Underwriting ability')) {
      setPassports({ ...passports, [user.id]: { ...passport, blockers: passport.blockers.filter((blocker) => blocker !== 'Underwriting ability'), readiness: Math.min(100, passport.readiness + 8) } });
    }
    record(`REIDE analysis reviewed: ${selected?.title}. ${Math.min(nextReviewed.length, 2)}/2 verified.`);
  }
  function updateReviewCheck(key: 'calculator' | 'records' | 'risks', checked: boolean) {
    setReviewChecks({ ...reviewChecks, [selectedAnalysisId]: { ...attestations, [key]: checked } });
  }
  function addEvidence(files: FileList | null) {
    if (!files?.length || !selectedAnalysisId) return;
    const uploads = Array.from(files).map((file, index) => ({
      id: `ev_${selectedAnalysisId}_${evidenceItems.length + index + 1}`,
      name: file.name,
      type: file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Upload',
      status: 'Parsed' as const,
      extracted: 'Demo parser extracted assumptions, dates, and dollar fields.',
    }));
    setEvidence({ ...evidence, [selectedAnalysisId]: [...uploads, ...evidenceItems] });
    record(`${uploads.length} evidence file${uploads.length > 1 ? 's' : ''} parsed by REIDE.`);
  }
  function generateMemo() {
    if (!selectedAnalysisId || !model) return;
    const next = {
      id: `memo_${selectedAnalysisId}_${(memoVersions[selectedAnalysisId]?.length ?? 0) + 1}`,
      label: `IC memo v${(memoVersions[selectedAnalysisId]?.length ?? 0) + 1}`,
      date: demoClockLabel,
      decision: model.decision,
      note: `${conflicts.length} open diligence item${conflicts.length === 1 ? '' : 's'}. Scenario: ${scenario?.label ?? 'Base'}.`,
    };
    setMemoVersions({ ...memoVersions, [selectedAnalysisId]: [next, ...(memoVersions[selectedAnalysisId] ?? [])] });
    record(`REIDE memo generated for ${selected?.title}.`);
  }
  function refreshRecords() {
    if (!model) return;
    record(`Public records refreshed: ${model.sources.length} sources checked, ${conflicts.length} conflicts open.`);
  }
  function setOutreach(item: ReideSopItem, status: ReideOutreachStatus) {
    setOutreachStatus({ ...outreachStatus, [item.id]: status });
    record(`${item.ownerName}: ${item.sourceLabel} SOP ${status.toLowerCase()}.`);
  }
  function openSopTarget(item: ReideSopItem) {
    setActiveStage(item.targetStage);
    record(`Opened ${item.targetStage} path for ${item.sourceLabel}.`);
  }
  function emailOwner(item: ReideSopItem) {
    setOutreach(item, 'Email opened');
    if (typeof window !== 'undefined') window.open(mailtoFor(item), '_self');
  }
  return (
    <>
      <PageHeader eyebrow={user.role === 'jidoka_admin' ? 'REIDE Health' : user.role === 'service_partner' ? 'Assigned REIDE' : 'REIDE'} title="Underwrite faster" intro={user.role === 'service_partner' ? 'Your assigned diligence items only.' : 'Click a number to see the math.'} />
      {!selected || !model ? <Card><h2>No accessible analyses</h2><p>This role has no REIDE records in scope.</p></Card> : (
        <div className="stack">
          <section className="two-col">
            <Card>
              <h2>Analyses</h2>
              {available.map((opp) => <button className="list-button" key={opp.id} onClick={() => go(`/reide?analysis=${opp.analysisId}`)}>{opp.title}<span>{marketName(opp.marketId)}</span></button>)}
            </Card>
            <Card>
              <h2>{selected.title}</h2>
              <div className="decision-strip">
                <span>{model.decision}</span>
                <strong>{model.publicRecordScore}</strong>
                <small>public-record score</small>
              </div>
              <p>{model.thesis}</p>
              <button onClick={() => go(`/opportunities/${selected.id}`)}>Open opportunity</button>
            </Card>
          </section>
          <section className="reide-grid">
            <Card>
              <h2>Calculator</h2>
              <div className="calc-grid">
                {model.calculations.map((calc) => (
                  <CalculatedStat key={calc.label} calc={calc} active={active?.label === calc.label} onSelect={() => setActiveCalc(calc.label)} />
                ))}
              </div>
              {active ? <div className="calc-explain"><strong>{active.label}</strong><p>{active.formula}</p><p>{active.insight}</p></div> : null}
            </Card>
            <Card>
              <h2>AI layer</h2>
              <div className="ai-stack">
                {model.aiFindings.map((finding) => <p key={finding}>{finding}</p>)}
              </div>
              <h3 className="section-subhead">Risks</h3>
              <ul className="tag-list">{model.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
              <h3 className="section-subhead">Next</h3>
              <div className="sop-list">{nextSopItems.map((item) => <ReideSopCard key={item.id} item={item} status={outreachStatus[item.id] ?? 'Needs outreach'} onPrepare={() => setOutreach(item, 'Draft ready')} onEmail={() => emailOwner(item)} onOpen={() => openSopTarget(item)} onAnswer={() => setOutreach(item, 'Answered')} />)}</div>
            </Card>
          </section>
          <section className="reide-grid">
            <Card>
              <div className="section-title-row">
                <h2>Evidence</h2>
                <label className="file-button">Upload<input type="file" multiple onChange={(event) => addEvidence(event.target.files)} /></label>
              </div>
              <div className="evidence-list">
                {evidenceItems.map((item) => <EvidenceRow item={item} key={item.id} />)}
              </div>
            </Card>
            <Card>
              <h2>Conflicts</h2>
              {conflictSopItems.length ? <div className="sop-list">{conflictSopItems.map((item) => <ReideSopCard key={item.id} item={item} status={outreachStatus[item.id] ?? 'Needs outreach'} compact onPrepare={() => setOutreach(item, 'Draft ready')} onEmail={() => emailOwner(item)} onOpen={() => openSopTarget(item)} onAnswer={() => setOutreach(item, 'Answered')} />)}</div> : <p>No blocking conflicts.</p>}
            </Card>
          </section>
          <section className="reide-grid">
            <Card>
              <h2>Scenarios</h2>
              <div className="scenario-grid">
                {scenarios.map((item) => <button key={item.label} className={`scenario-card ${item.tone} ${scenario?.label === item.label ? 'active' : ''}`} onClick={() => setActiveScenario(item.label)} type="button"><span>{item.label}</span><strong>{item.irr}</strong><small>DSCR {item.dscr} - cash {item.cash}</small><p>{item.assumption}</p></button>)}
              </div>
            </Card>
            <Card>
              <h2>Quality score</h2>
              <div className={`quality-score ${qualityScore >= 80 ? 'good' : qualityScore < 65 ? 'danger' : 'warn'}`}>{qualityScore}</div>
              <p>{conflicts.length ? `${conflicts.length} issue${conflicts.length === 1 ? '' : 's'} before clean recommendation.` : 'Evidence and records support the thesis.'}</p>
              {conflictSopItems.length ? (
                <div className="quality-issues">
                  {conflictSopItems.map((item) => (
                    <div key={item.id}>
                      <strong>{item.sourceLabel}</strong>
                      <p>{item.ownerName} - {item.sourceDetail}</p>
                      <div>
                        <button type="button" onClick={() => openSopTarget(item)}>Open path</button>
                        <button type="button" onClick={() => emailOwner(item)}>Email</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          </section>
          <section className="reide-grid">
            <Card>
              <div className="section-title-row">
                <h2>Public records</h2>
                <button type="button" onClick={refreshRecords}>Refresh</button>
              </div>
              <div className="source-ledger">
                {model.sources.map((source) => <SourceRow source={source} key={source.label} />)}
              </div>
            </Card>
            <Card>
              <h2>Diligence path</h2>
              <div className="stage-tabs">
                {model.stages.map((item) => <button key={item.label} title={`${item.status}: last viewed ${stageStatusMeta(item).lastViewed}`} className={stage?.label === item.label ? 'active' : ''} onClick={() => { setActiveStage(item.label); setStagePanelOpen(false); }} type="button">{item.label}</button>)}
              </div>
              {stage && activeStageSopItem && stageMeta ? (
                <div className={`stage-note ${stage.status.toLowerCase().replace(' ', '-')}`}>
                  <button className="stage-note-main" type="button" onClick={() => setStagePanelOpen(!stagePanelOpen)}>
                    <span>{stage.status}</span>
                    <strong>{contactForOwner(stage.owner).name}</strong>
                    <small>Last viewed {stageMeta.lastViewed}</small>
                    <p>{stage.detail}</p>
                  </button>
                  <div className={`stage-popover ${stagePanelOpen ? 'open' : ''}`} role="dialog" aria-label={`${stage.label} status`}>
                    <strong>{stage.label}</strong>
                    <p>{stageMeta.note}</p>
                    <div>
                      <button type="button" onClick={() => setOutreach(activeStageSopItem, 'Draft ready')}>Show draft</button>
                      <button type="button" onClick={() => emailOwner(activeStageSopItem)}>Email {contactForOwner(stage.owner).name.split(' ')[0]}</button>
                      <button type="button" onClick={() => setOutreach(activeStageSopItem, 'Answered')}>Answered</button>
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>
          </section>
          <section className="reide-grid">
            <Card>
              <h2>Action routing</h2>
              {model.stages.filter((item) => item.status !== 'Complete').map((item) => {
                const owner = contactForOwner(item.owner);
                const sopItem = makeReideSopItem({
                  id: `${selectedAnalysisId}_stage_${item.label}`,
                  question: `Can you clear ${item.label.toLowerCase()} for REIDE?`,
                  label: item.label,
                  detail: item.detail,
                  targetStage: item.label,
                  ownerName: owner.name,
                  selectedTitle: selected.title,
                  requesterName: user.name,
                });
                return <ReideSopCard key={item.label} item={sopItem} status={outreachStatus[sopItem.id] ?? 'Needs outreach'} compact onPrepare={() => setOutreach(sopItem, 'Draft ready')} onEmail={() => emailOwner(sopItem)} onOpen={() => openSopTarget(sopItem)} onAnswer={() => setOutreach(sopItem, 'Answered')} />;
              })}
            </Card>
            <Card>
              <div className="section-title-row">
                <h2>IC memo</h2>
                <button type="button" onClick={generateMemo}>Generate</button>
              </div>
              <div className="memo-preview">
                <strong>{model.decision}</strong>
                <p>{model.thesis}</p>
                <small>{conflicts.length ? `Open: ${conflicts.map((item) => item.label).join(', ')}` : 'No open conflicts'}</small>
              </div>
              <h3 className="section-subhead">History</h3>
              <div className="version-list">
                {(memoVersions[selectedAnalysisId] ?? []).map((version) => <div key={version.id}><strong>{version.label}</strong><span>{version.date}</span><p>{version.decision} - {version.note}</p></div>)}
              </div>
            </Card>
          </section>
          <Card>
            <div className="review-card">
              <div>
                <h2>Review verification</h2>
                <p>{alreadyReviewed ? 'Reviewed' : `${Math.min(reviewedForUser.length, 2)}/2 completed`}</p>
              </div>
              <div className="review-checks">
                <label><input type="checkbox" checked={attestations.calculator || alreadyReviewed} disabled={alreadyReviewed} onChange={(event) => updateReviewCheck('calculator', event.target.checked)} />Calculator</label>
                <label><input type="checkbox" checked={attestations.records || alreadyReviewed} disabled={alreadyReviewed} onChange={(event) => updateReviewCheck('records', event.target.checked)} />Records</label>
                <label><input type="checkbox" checked={attestations.risks || alreadyReviewed} disabled={alreadyReviewed} onChange={(event) => updateReviewCheck('risks', event.target.checked)} />Risks</label>
              </div>
              <button type="button" disabled={alreadyReviewed || !canMarkReviewed} onClick={markReviewed}>{alreadyReviewed ? 'Reviewed' : 'Mark reviewed'}</button>
            </div>
          </Card>
          <SourceFooter sources={model.sources} />
        </div>
      )}
    </>
  );
}

function ReideSopCard({ item, status, compact = false, onPrepare, onEmail, onOpen, onAnswer }: { item: ReideSopItem; status: ReideOutreachStatus; compact?: boolean; onPrepare: () => void; onEmail: () => void; onOpen: () => void; onAnswer: () => void }) {
  const draftVisible = !compact || status !== 'Needs outreach';
  return (
    <div className={`sop-card ${compact ? 'compact' : ''}`}>
      <div className="sop-head">
        <span>{status}</span>
        <strong>{item.question}</strong>
        <small>{item.ownerName} - {item.ownerRole} - due {item.due}</small>
      </div>
      <p>{item.evidenceRequest}</p>
      {draftVisible ? (
        <div className="email-draft">
          <span>Prepared email to {item.ownerEmail}</span>
          <strong>{item.subject}</strong>
          <pre>{item.body}</pre>
        </div>
      ) : null}
      <div className="sop-actions">
        <button type="button" onClick={onOpen}>Open path</button>
        <button type="button" onClick={onPrepare} aria-expanded={draftVisible}>{draftVisible ? 'Draft ready' : 'Show draft'}</button>
        <button type="button" onClick={onEmail}>Email</button>
        <button type="button" onClick={onAnswer}>Answered</button>
      </div>
    </div>
  );
}

function CalculatedStat({ calc, active, onSelect }: { calc: ReideCalc; active: boolean; onSelect: () => void }) {
  return (
    <button className={`calc-stat ${calc.tone ?? 'neutral'} ${active ? 'active' : ''}`} title={calc.formula} onClick={onSelect} type="button">
      <span>{calc.label}</span>
      <strong>{calc.value}</strong>
      <small>{calc.note}</small>
    </button>
  );
}

function EvidenceRow({ item }: { item: EvidenceItem }) {
  return (
    <div className={`evidence-row ${item.status.toLowerCase().replace(' ', '-')}`}>
      <span>{item.type}</span>
      <strong>{item.name}</strong>
      <small>{item.status}</small>
      <p>{item.extracted}</p>
    </div>
  );
}

function SourceFooter({ sources }: { sources: ReideSource[] }) {
  return (
    <Card>
      <div className="source-footer">
        <h2>Sources</h2>
        <div>
          {sources.map((source) => <a key={`${source.label}-${source.source}`} href={sourceUrlFor(source.source)} target="_blank" rel="noreferrer">{source.source}</a>)}
        </div>
      </div>
    </Card>
  );
}

function SourceRow({ source }: { source: ReideSource }) {
  return (
    <a className={`source-row ${source.status.toLowerCase()}`} title={`${source.source}: ${source.finding}`} href={sourceUrlFor(source.source)} target="_blank" rel="noreferrer">
      <span>{source.label}</span>
      <strong>{source.status}</strong>
      <small>{source.confidence} - {source.owner}</small>
      <p>{source.finding}</p>
    </a>
  );
}

function Introductions({ user, intros, setIntros, record }: Parameters<typeof Router>[0]) {
  const waiting = intros.filter((intro) => intro.targetId === user.id && intro.status === 'pending');
  const mine = intros.filter((intro) => intro.requesterId === user.id);
  function decide(id: string, status: 'approved' | 'declined') {
    const intro = intros.find((item) => item.id === id);
    setIntros(intros.map((item) => item.id === id ? { ...item, status } : item));
    record(`${status === 'approved' ? 'Approved' : 'Declined'} introduction ${intro?.context}. ${status === 'approved' ? 'Contact grant and relationship edge written.' : 'No contact was released.'}`);
  }
  return (
    <>
      <PageHeader eyebrow="Introductions" title="Requests" />
      <section className="two-col">
        <Card>
          <h2>Waiting on you</h2>
          {waiting.length ? waiting.map((intro) => <div className="task" key={intro.id}><div><strong>{users.find((u) => u.id === intro.requesterId)?.name}</strong><small>{intro.reason}</small></div><div><button onClick={() => decide(intro.id, 'approved')}>Approve</button><button onClick={() => decide(intro.id, 'declined')}>Decline</button></div></div>) : <p>No pending requests.</p>}
        </Card>
        <Card>
          <h2>Your requests</h2>
          {mine.length ? mine.map((intro) => <div className="task" key={intro.id}><div><strong>{users.find((u) => u.id === intro.targetId)?.name}</strong><small>{intro.context} - {intro.status}</small></div>{intro.status === 'approved' ? <span className="contact">Contact released</span> : null}</div>) : <p>No requests yet. Open Network or an event to request one.</p>}
        </Card>
      </section>
    </>
  );
}

function AgentHub({ user, deals, go, record }: Parameters<typeof Router>[0]) {
  const lead = users.find((person) => user.assignedInvestorIds?.includes(person.id));
  return (
    <>
      <PageHeader eyebrow="Agent Hub" title={`${marketName(user.marketId)} territory`} intro="Qualified investor leads." />
      <section className="two-col">
        <Card>
          <h2>Qualified investor leads</h2>
          {lead ? <ActionRow title={lead.name} body={`${lead.stage}. ${targetMarketLabel(lead)}. ${lead.headline}`} cta="Open workspace" tone="good" onClick={() => go('/deals/dl_1')} /> : <p>No waiting leads.</p>}
          <div className="split"><button onClick={() => record('Lead accepted. Consultation task created and relationship edge written.')}>Accept lead</button><button onClick={() => record('Lead declined: outside price band. Market Pulse updated and lead rerouted.')}>Decline with reason</button></div>
        </Card>
        <Card>
          <h2>Transactions</h2>
          {deals.filter((deal) => deal.agentId === user.id).map((deal) => <ActionRow key={deal.id} title={deal.ref} body={opportunities.find((opp) => opp.id === deal.opportunityId)?.title ?? ''} cta="Open" tone="neutral" onClick={() => go(`/deals/${deal.id}`)} />)}
        </Card>
      </section>
    </>
  );
}

function Admin({ path, user, record }: Parameters<typeof Router>[0]) {
  if (user.role === 'jidoka_admin' || path === '/admin/systems') {
    return <><PageHeader eyebrow="JIDOKA" title="Systems" intro="Health, audit, REIDE." /><section className="cards-grid"><Card><h2>Integrations</h2><p>Healthy</p></Card><Card><h2>Audit</h2><p>7 access events. 0 failed probes.</p></Card><Card><h2>Schema</h2><p>37 tables. 77 policies.</p></Card></section></>;
  }
  if (user.role === 'city_organizer') {
    return <><PageHeader eyebrow="Market" title={path === '/admin/investors' ? 'Investor interest' : 'Events'} intro="No financial fields." /><Card><h2>Richmond</h2><p>1 agent. 2 events. 4 intros.</p></Card></>;
  }
  if (path === '/admin/agents') return <AdminAgents record={record} />;
  if (path === '/admin/opportunities') return <AdminOpportunities record={record} />;
  if (path === '/admin/market-pulse') return <AdminMarketPulse record={record} />;
  if (path === '/admin/relationships' || path === '/admin/events' || path === '/admin') return <AdminEcosystem record={record} />;
  return <AdminEcosystem record={record} />;
}

function AdminAgents({ record }: { record: (message: string) => void }) {
  const agentCoverage = markets.map((market) => ({
    market,
    agent: users.find((person) => person.role === 'agent' && person.marketId === market.id),
  }));
  return (
    <>
      <PageHeader eyebrow="Administration" title="Agent Hub" intro="City territories for real estate agents." />
      <section className="two-col">
        <Card>
          <h2>Application awaiting review</h2>
          <p>Nina Okonkwo - Nashville requested.</p>
          <form onSubmit={(event) => { event.preventDefault(); record('Nina Okonkwo approved and assigned to Nashville. Audit log written.'); }}>
            <Field label="Territory"><select><option>Nashville, TN</option><option>Tampa, FL</option><option>Columbus, OH</option></select></Field>
            <label className="check-line"><input type="checkbox" defaultChecked /> Exclusive placement</label>
            <button>Approve agent</button>
          </form>
        </Card>
        <Card>
          <h2>Assign real estate agent territory</h2>
          <form onSubmit={(event) => { event.preventDefault(); record('Territory assignment saved. Conflicting exclusive markets were blocked.'); }}>
            <Field label="Agent"><select><option>Alicia Torres</option><option>Ray Sandoval</option></select></Field>
            <Field label="City territory"><select><option>Richmond, VA</option><option>Charlotte, NC</option><option>Nashville, TN</option></select></Field>
            <button>Assign territory</button>
          </form>
        </Card>
      </section>
      <div className="cards-grid">
        {agentCoverage.map(({ market, agent }) => (
          <Card key={market.id} tone={agent ? 'good' : 'warn'}>
            <p className="eyebrow">City territory</p>
            <h2>{market.name}</h2>
            <p>{agent ? agent.name : 'Open'}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

function AdminOpportunities({ record }: { record: (message: string) => void }) {
  return (
    <>
      <PageHeader eyebrow="Administration" title="Opportunity Management" />
      <Card>
        <h2>Awaiting review</h2>
        <p>8-unit near campus, Columbus.</p>
        <div className="ops-actions"><button onClick={() => record('Opportunity published to eligible feeds. Blinded previews preserved.')} >Publish to feeds</button><button onClick={() => record('Opportunity withdrawn from review queue.')} >Withdraw</button><button onClick={() => record('Access grant revoked. Contact and documents removed from payload.')} >Revoke grant</button></div>
      </Card>
    </>
  );
}

function AdminMarketPulse({ record }: { record: (message: string) => void }) {
  return (
    <>
      <PageHeader eyebrow="Administration" title="Market Pulse" intro="Blocker, owner, next move." />
      <div className="market-pulse-grid">
        {marketPulse.map((pulse) => {
          const market = markets.find((item) => item.id === pulse.marketId)!;
          return (
            <Card key={pulse.marketId} tone={pulse.readiness >= 80 ? 'good' : pulse.readiness < 65 ? 'danger' : 'warn'}>
              <div className="pulse-head">
                <div>
                  <p className="eyebrow">{market.name}</p>
                  <h2>{pulse.blocker}</h2>
                </div>
                <strong>{pulse.readiness}</strong>
              </div>
              <div className="pulse-facts">
                <span>Agent: {pulse.agent}</span>
                <span>Best helper: {pulse.helper}</span>
              </div>
              <div className="ai-recommendation">
                <span>AI recommendation</span>
                <p>{pulse.suggestion}</p>
              </div>
              <button onClick={() => record(`Market Pulse action queued for ${market.name}: ${pulse.helper} assigned to help with ${pulse.blocker}.`)}>Queue intervention</button>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function AdminEcosystem({ record }: { record: (message: string) => void }) {
  const nodes: InsightNode[] = [
    { id: 'network', label: 'Investor Social', type: 'system', x: 50, y: 50, detail: 'Operating layer connecting investors, agent territories, service partners, events, deal workspaces, REIDE, and access grants.' },
    { id: 'richmond', label: 'Richmond', type: 'market', x: 18, y: 50, detail: 'Covered market with Alicia as real estate agent, Tom as organizer, two active opportunities, and one live deal.' },
    { id: 'charlotte', label: 'Charlotte', type: 'market', x: 82, y: 24, detail: 'Covered by Ray. Dana targets this market but needs financing readiness before agent routing.' },
    { id: 'nashville', label: 'Nashville', type: 'market', x: 82, y: 76, detail: 'High investor demand from Priya, but no approved city agent yet. Agent approval is the blocker.' },
    { id: 'marcus', label: 'Marcus', type: 'investor', x: 18, y: 74, detail: 'Investor targeting Richmond and Columbus. Currently in diligence on IS-2026-0114.' },
    { id: 'alicia', label: 'Alicia', type: 'agent', x: 18, y: 26, detail: 'Approved real estate agent for Richmond. Owns property search, diligence coordination, and investor lead acceptance.' },
    { id: 'kelly', label: 'Kelly', type: 'partner', x: 82, y: 50, detail: 'Lender partner invited into deal workspaces only when financing expertise is needed.' },
    { id: 'event', label: 'Sept Event', type: 'event', x: 18, y: 91, detail: 'Richmond event creates explainable intro recommendations across investors, agents, and partners.' },
    { id: 'deal', label: 'IS-2026-0114', type: 'deal', x: 50, y: 76, detail: 'Live deal connecting Marcus, Alicia, Kelly, Hector, REIDE analysis, and network admin approvals.' },
    { id: 'reide', label: 'REIDE', type: 'system', x: 50, y: 24, detail: 'AI intelligence layer explains which assumptions matter and who should act before the deal advances.' },
  ];
  const [selectedId, setSelectedId] = useState('network');
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const links = [
    'M 42 50 C 34 44, 27 44, 24 50',
    'M 58 45 C 64 33, 70 27, 76 24',
    'M 58 55 C 65 65, 70 73, 76 76',
    'M 18 43 C 12 39, 12 32, 18 30',
    'M 18 57 C 12 62, 12 69, 18 70',
    'M 16 79 C 10 84, 10 90, 16 91',
    'M 24 74 C 34 69, 41 70, 44 74',
    'M 24 28 C 36 38, 38 62, 44 72',
    'M 76 52 C 68 61, 64 70, 56 74',
    'M 54 31 C 66 43, 66 62, 56 70',
    'M 49 43 C 44 37, 45 31, 49 30',
  ];
  return (
    <>
      <PageHeader eyebrow="Administration" title="Ecosystem Map" intro="Click any node." />
      <section className="ecosystem-layout">
        <Card>
          <div className="ecosystem-map" aria-label="Interactive Investor Social ecosystem map">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              {links.map((d) => <path key={d} d={d} />)}
            </svg>
            {nodes.map((node) => (
              <button
                key={node.id}
                className={`graph-node ${node.type} ${selected.id === node.id ? 'active' : ''}`}
                style={{ '--x': `${node.x}%`, '--y': `${node.y}%` } as CSSProperties}
                onClick={() => setSelectedId(node.id)}
                type="button"
              >
                <span>{node.type}</span>
                <strong>{node.label}</strong>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <p className="eyebrow">{selected.type}</p>
          <h2>{selected.label}</h2>
          <p>{selected.detail}</p>
          <div className="stat-grid compact">
            <Stat label="Intro edges" value={selected.type === 'event' ? '4' : '11'} note="Permissioned" />
            <Stat label="Deal links" value={selected.type === 'deal' ? '5' : '2'} note="Active" tone={selected.type === 'deal' ? 'warn' : 'neutral'} />
          </div>
          <div className="event-relations">
            <h3>Events and relationships</h3>
            <p>Sept event: Marcus, Kelly, Hector.</p>
            <p>Chain: Alex {'>'} Marcus {'>'} Alicia {'>'} Kelly {'>'} IS-2026-0114.</p>
          </div>
          <button onClick={() => record(`Ecosystem focus saved: ${selected.label}. Event and relationship recommendations refreshed.`)}>Refresh recommendations</button>
        </Card>
      </section>
    </>
  );
}

function Join({ record }: Parameters<typeof Router>[0]) {
  return <><PageHeader eyebrow="Join" title="Create Passport" /><SubmitShell button="Create my Passport" onSubmit={(name) => record(`Passport created for ${name}. Diagnostic is the next step.`)} /></>;
}

function AgentApplication({ record }: Parameters<typeof Router>[0]) {
  return <><PageHeader eyebrow="Agent Partner" title="Apply for territory" /><SubmitShell button="Submit application" onSubmit={(name) => record(`Agent application submitted for ${name}. Status: in review.`)} /></>;
}

function SubmitShell({ button, onSubmit }: { button: string; onSubmit: (name: string) => void }) {
  const isAgent = button === 'Submit application';
  return (
    <form className="form-grid" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSubmit(String(form.get('name') || 'new member')); event.currentTarget.reset(); }}>
      <Card><h2>You</h2><Field label="Full name required"><input name="name" required /></Field><Field label="Email required"><input name="email" type="email" required /></Field><Field label="Phone"><input name="phone" /></Field></Card>
      <Card><h2>Scope</h2><Field label={isAgent ? 'City territory requested' : 'Target market required'}><select required>{markets.map((m) => <option key={m.id}>{m.name}</option>)}</select></Field><Field label="Context"><textarea placeholder="Anything the network should know." /></Field><button>{button}</button></Card>
    </form>
  );
}

function AccessDenied({ user, path, go }: { user: User; path: string; go: (href: string) => void }) {
  return (
    <Card tone="danger">
      <p className="eyebrow">Access controlled</p>
      <h1>Not available to this role</h1>
      <p>{roleLabels[user.role]} cannot open {path}.</p>
      <button onClick={() => go('/')}>Command Center</button>
    </Card>
  );
}
