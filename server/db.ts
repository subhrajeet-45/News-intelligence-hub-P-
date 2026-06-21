/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { Article, User, Bookmark, ReadingHistory } from '../src/types';

// Enforce standard storage directory
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: User[];
  articles: Article[];
  bookmarks: Bookmark[];
  readingHistory: ReadingHistory[];
  trendingTopics: {
    id: string;
    topic: string;
    articlesCount: number;
    growth: number;
    category: string;
  }[];
}

// Pre-seeded high-quality articles for June 2026
const DEFAULT_ARTICLES: Article[] = [
  {
    id: 'world-2026-06-21',
    title: 'Historically Sustained: ITER Fusion Reactor Achieves Continuous Burning Plasma for 48 Hours',
    content: 'In an unprecedented breakthrough in green municipal energy, the International Thermonuclear Experimental Reactor (ITER) consortium in southern France announced that they have successfully maintained a sustained burning plasma state for 48 consecutive hours. Operating at over 150 million degrees Celsius—ten times hotter than the center of the sun—the magnetic confinement tokamak generated a net energy multiplier (Q-factor) of 12.5 throughout the historic demonstration. Energy grids across Europe are preparing to connect to the first commercial pilot lines by late 2028, signaling a monumental shift away from traditional nuclear fission and carbon-intensive fossil utilities.',
    summary: 'The ITER international fusion consortium has successfully maintained a continuous burning plasma state for 48 hours straight, generating a net-positive Q-factor of 12.5 and paving the path for clean, commercial fusion power grids.',
    takeaways: [
      'Achieves 48 hours of continuous magnetic tokamak confinement of ultra-hot plasma.',
      'Sustains a record net Q-factor of 12.5, yielding 12.5 times more thermal energy than consumed.',
      'Sets the timeline for commercial public grid integrations by the end of 2028.'
    ],
    facts: [
      'Core Plasma Temperature: 156 million degrees Celsius.',
      'Continuous stable confinement duration: 48 hours.',
      'Net energy amplification: Q = 12.5.'
    ],
    source: 'Reuters News',
    category: 'World News',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-21T02:30:00Z',
    readTime: '4 min read',
    views: 1920,
    shares: 820
  },
  {
    id: 'tech-2026-06-21',
    title: 'Silicon Photonics: First Commercial Desktop Optical Neural Accelerator Released',
    content: 'Luminous Computing has officially launched the L-100 Iris, the world\'s first desktop-mountable silicon photonic accelerator designed to run AI models entirely using light particles rather than electronic currents. By steering standard laser pointers through nano-engineered silicon waveguides, the L-100 calculates floating-point matrix multiplications at the speed of light. Tech reviewers confirmed that the device handles local inference of 70B parameter models at over 3,000 tokens per second while consuming less than 15 watts of total power—marking an staggering 100x efficiency gain over the industry standard GPU setups.',
    summary: 'Luminous Computing released the L-100 Iris, a silicon photo-accelerator that performs AI matrix logic using light, achieving 3,000 tokens/sec on 70B models with only 15W of power.',
    takeaways: [
      'Uses optical waveguides to process matrix math at 100 times the speed of traditional transistors.',
      'Decimates power requirements from 700 watts to under 15 watts for massive 70B local networks.',
      'Supports plug-and-play local integration over standard PCIe desktop computer slots.'
    ],
    facts: [
      'Local inference rate: 3,250 tokens per second on a llama-3 70B model.',
      'Electrical thermal dissipation: 15 Watts thermal maximum.',
      'Optical interconnect frequency: Sub-picosecond signal propagation.'
    ],
    source: 'MIT Technology Review',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-21T09:00:00Z',
    readTime: '5 min read',
    views: 2300,
    shares: 945
  },
  {
    id: 'health-2026-06-20',
    title: 'First Successful Bio-Synthetic Cornea Transplants Fully Restore Sight to Blind Patients',
    content: 'Ophthalmologists at the Karolinska Institute have initiated a new era in regenerative medicine with the first series of bio-synthetic cornea implants. Unlike donor tissue, which carries high risks of rejection, these engineered scaffolds are created from purified biocompatible collagen derived from sustainable agricultural proteins. Ten legally blind trial participants diagnosed with advanced corneal sclerosis and scarring have regained 20/20 visual acuity within three weeks of receiving the surgical injection. The implants integrate with the patients\' own native ocular nerves, generating healthy cellular structures with absolutely zero rejection markers.',
    summary: 'Karolinska Institute clinical trials have successfully restored perfect sight to ten blind patients using novel bio-synthetic collagen cornea scaffolds that seamlessly integrate with native tissue without rejection.',
    takeaways: [
      'Synthesized from scalable organic plant collagen proteins rather than human donor tissue.',
      'Achieves complete 20/20 vision restoration in 10 trial participants with corneal disease.',
      'Presents a zero-rejection profile due to cell-free collagen engineering.'
    ],
    facts: [
      'Restored vision standard: 20/20 visual acuity.',
      'Clinical trial scope: 10 blind patients fully treated.',
      'Native nerve recovery time: 21 days post-operation.'
    ],
    source: 'Scientific American',
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-20T14:15:00Z',
    readTime: '3 min read',
    views: 1440,
    shares: 610
  },
  {
    id: 'fin-2026-06-20',
    title: 'Global Inflation Anchors Below 1.8% as Autonomous Logistics Networks Compress Supply Overheads',
    content: 'In its mid-year financial brief, the International Monetary Fund (IMF) reported that global inflation has stabilized beneath a historic 1.8% baseline across sixty developed economies. Economists attribute this sudden structural stabilization to the maturation of autonomous multi-agent logistics pipelines. By automating ocean container routing, self-driving trucking schedules, and local vertical warehouse delivery channels, operational freight overheads plummeted by 45% over the past year. Consumers are enjoying decreased costs on household essentials, shifting market trends towards sustained, low-volatility economic growth.',
    summary: 'The IMF announced global inflation has dropped below 1.8% due to a 45% reduction in freight and supply-chain logistics overheads enabled by autonomous cargo networks.',
    takeaways: [
      'Sinks global composite inflation index down to 1.74% across major trade territories.',
      'Autonomous multi-agent cargo nets drop supply chain bottlenecks by over 45%.',
      'Translates to lower retail pricing on organic food, manufacturing parts, and energy.'
    ],
    facts: [
      'Global baseline inflation rate: 1.74% mid-year.',
      'Supply-chain operational cost reduction: 45.2% over consecutive quarters.',
      'Participating national markets: 60 sovereign economies.'
    ],
    source: 'Financial Times',
    category: 'Finance',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-20T08:30:00Z',
    readTime: '4 min read',
    views: 1620,
    shares: 580
  },
  {
    id: 'fin-2026-06-19',
    title: 'ECB Officially Integrates with ISSS, Accelerating Cross-Border Digital Euro Transmissions',
    content: 'The European Central Bank (ECB) has announced its official integration with the Inter-Sovereign Settlement Standard (ISSS), a critical step that merges the digital Euro with the global decentralized network. Under this framework, financial institutions across thirty European nations can now perform instant, zero-friction settlement with counterparts in regions like Singapore, Brazil, and Japan. Industry watchers call this the most significant consolidation of banking technology since the creation of the SWIFT network forty years ago. ECB governors noted that transactions utilize privacy-preserving zero-knowledge proofs to satisfy strict transparency mandates while safeguarding institutional capital privacy.',
    summary: 'The European Central Bank has integrated with the ISSS ledger protocol, opening immediate, zero-fee sovereign settlement routes for the digital Euro across global trade channels.',
    takeaways: [
      'Links the digital Euro directly with 94 global central banks on the ISSS network.',
      'Reduces transaction processing buffers from several days to under 100 milliseconds.',
      'Preserves institutional privacy through specialized zero-knowledge cryptographic proofs.'
    ],
    facts: [
      'Integration date: June 19, 2026.',
      'Participating nation networks: 30 European states.',
      'Settlement velocity: Instant, sub-100ms validation.'
    ],
    source: 'Bloomberg News',
    category: 'Finance',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-19T06:45:00Z',
    readTime: '4 min read',
    views: 1845,
    shares: 720
  },
  {
    id: 'ai-2026-06-18',
    title: 'Gemini 4.0 Live API Preview: Sub-50ms Multimodal Streams and Integrated Tool-Use Realized',
    content: 'At the global developer summit, Google engineers unleashed a surprise preview of Gemini 4.0, prioritizing ultra-low latency streams and rich tool interaction. The updated model architecture processes incoming audio, visual frames, and text inputs concurrently under a sub-50ms latency threshold, making natural, fluid conversation with autonomous digital twins a reality. Furthermore, Gemini 4.0 incorporates a native feedback loop that permits agents to write, debug, and execute their own sandbox programs to solve multi-step mathematical problems on the fly.',
    summary: 'Google unveiled a preview of Gemini 4.0 at its developer summit, sporting sub-50ms multi-modal latency streams and native sandbox self-correcting code execution capabilities.',
    takeaways: [
      'Features record-shattering sub-50ms latency for real-time natural voice and video response.',
      'Employs internal sandbox loops allowing agents to run and test code before outputting answers.',
      'Expands conversational tools to operate concurrently across auditory and screen interfaces.'
    ],
    facts: [
      'Target latency: Less than 50 milliseconds.',
      'Multimodal capability: Instant voice, code, and vision frame ingestion.',
      'Developer preview access: Open immediately in AI Studio UI.'
    ],
    source: 'MIT Technology Review',
    category: 'Artificial Intelligence',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-18T10:15:00Z',
    readTime: '5 min read',
    views: 2450,
    shares: 980
  },
  {
    id: 'bus-2026-06-18',
    title: 'Dolphin Energy IPO Soars 35% as Vertical Farming Infrastructure Reaches Profit Scale',
    content: 'Shares of Dolphin Energy, the leading operator of municipal green tower conversions, skyrocketed thirty-five percent on its trading debut today. The company, which repurposes empty high-rise commercial office blocks in major city centers, reported its first multi-quarter profit after scaling automated hydroponic systems in twelve metropolitan cores. Environmental and urban planners have lauded the model, emphasizing that local food production eliminates traditional long-haul shipping routes and lowers carbon footprints significantly.',
    summary: 'Dolphin Energy surged 35% on its trading debut, establishing vertical municipal farming as a highly profitable investment class as automated city center towers achieve scale.',
    takeaways: [
      'IPO prices surge 35% within the first hours of modern trading.',
      'Demonstrates profitable high-density vegetable output directly in urban high-rises.',
      'Eliminated over 80% of vehicle carbon emissions linked with long-distance logistics.'
    ],
    facts: [
      'Trading price jump: +35% on debut.',
      'Active core towers: 12 converted metropolitan hubs.',
      'Logistics carbon reduction: 80%+ savings on freight.'
    ],
    source: 'The Wall Street Journal',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1444653303783-154ce13543a7?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-18T09:00:00Z',
    readTime: '3 min read',
    views: 1320,
    shares: 310
  },
  {
    id: 'pol-2026-06-17',
    title: 'UN Convenes Digital Sovereignty Committee to Draft Treaty Against Autonomous Cyber Threats',
    content: 'Delegates from over 140 nations gathered in Geneva to form the United Nations Digital Sovereignty Committee, aimed at establishing global safety guidelines for autonomous network entities. The proposed treaty establishes a global "No-Fly Zone" for autonomous AI agents on vital financial networks and sets criminal liability boundaries for creators of deepfake synthesis packages. Cybersecurity specialists have emphasized that uniform protocols are urgently needed to safe-guard democratic elections as synthetic audio campaigns grow increasingly difficult to trace.',
    summary: 'Representatives from 140 nations met in Geneva to draft a digital sovereignty treaty defining international code standards to limit cyber warfare and offensive agent teams.',
    takeaways: [
      'Gathers 140 countries to regulate autonomous cyber threats.',
      'Establishes strict boundaries on the deployability of automated agents in banking systems.',
      'Creates unified international law frames surrounding deceptive media packages.'
    ],
    facts: [
      'Participating delegations: 140 UN member states.',
      'Committee headquarters: Geneva, Switzerland.',
      'Treaty ratification target: September 2026.'
    ],
    source: 'BBC News',
    category: 'Politics',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-17T14:30:00Z',
    readTime: '4 min read',
    views: 1100,
    shares: 250
  },
  {
    id: 'tech-2026-06-17',
    title: 'Chicago Power Grid Successfully Deploys First Near-Room-Temperature Superconducting Links',
    content: 'In a historic first for civil infrastructure, Chicago municipal planners completed the installation of superconducting link cables along its primary commercial sector. Running at a near-room-temperature configuration of 15 degrees Celsius, the newly activated lines deliver electrical power with absolutely zero electrical resistance. Utility managers reported that the upgrade instantly saved enough electricity to power ten thousand homes, proving the viability of superconducting materials beyond highly controlled research labs.',
    summary: 'Chicago completed the first public deployment of near-room-temperature superconducting electricity grid lines, eliminating transmission resistance and showing immense energy savings.',
    takeaways: [
      'Launches the first non-cooled superconducting power grid segment in a major global city.',
      'Transmits electrical current at 15°C with zero transmission resistance loss.',
      'Provides instant proof of massive conservation utility, saving power for 10,000 residences.'
    ],
    facts: [
      'Active link length: 1.2 kilometers.',
      'Operating temperature: 15°C (59°F).',
      'Residential power equivalency saved: 10,000 households daily.'
    ],
    source: 'Reuters',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-17T08:15:00Z',
    readTime: '5 min read',
    views: 1690,
    shares: 620
  },
  {
    id: 'sport-2026-06-16',
    title: 'World Cup 2026 Opener: USA Clinches Victory Over Italy Amid Real-Time Holographic Analytics Debut',
    content: 'A legendary clash unfolded in New York as the USA national team secured a narrow 2-1 victory over Italy to open the tournament. Apart from the breathtaking play, the real star of the match was the debut of high-fidelity holographic game-tracking systems. Fans inside MetLife stadium utilized real-time cellular overlays to track ball paths, detailed sprint speeds, and immediate translations of referee announcements, turning a standard seat into a fully interactive command deck.',
    summary: 'The United States started its World Cup campaign with a 2-1 win over Italy, showcasing the debut of holographic AR crowd metrics for fans.',
    takeaways: [
      'USA defeats Italy 2-1 in a nail-biting, competitive opening fixture.',
      'Integrates 6G spatial mesh systems to stream stats to 80,005 seat locations.',
      'Fans overlay real-time velocity metrics and player fatigue data directly on their mobile screens.'
    ],
    facts: [
      'Opening match score: USA 2, Italy 1.',
      'Spectators present: 80,242 people.',
      'AR tracking latency: Less than 0.1 seconds.'
    ],
    source: 'Associated Press',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=850',
    publishedAt: '2026-06-16T21:00:00Z',
    readTime: '3 min read',
    views: 2890,
    shares: 1220
  },
  {
    id: 'health-2026-06-16',
    title: 'Epigenetic Muscle Regeneration Vector Shows Complete Muscle Sclerosis Reversal in Primates',
    content: 'A groundbreaking study published this week has verified the absolute reversal of advanced muscle sclerosis symptoms in laboratory primates. The therapy leverages an epigenetic muscle regeneration vector called E-MRV, which reactivates dormant stem pathways inside skeletal fibers. Within six weeks of treatment, targeted muscle mass and motor agility returned to baseline adolescent baselines. Researchers plan to fast-track first-in-human clinical delivery programs by early 2027.',
    summary: 'A newly formulated CRISPR-based epigenetic vector successfully restored degenerated muscle mass and motor skills in monkey models, providing hope for human sclerosis clinical targets.',
    takeaways: [
      'Uses targeted E-MRV vector to reactivate native cellular regeneration programs.',
      'Restores up to 90% of degraded motor agility within a single six-week course.',
      'Bypasses standard DNA cutting traps, minimizing off-target genomic complications.'
    ],
    facts: [
      'Treatment component: Epigenetic E-MRV vector.',
      'Motor recovery percentage: 90% improvement.',
      'Human clinical target date: First quarter of 2027.'
    ],
    source: 'Scientific American',
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-16T11:20:00Z',
    readTime: '4 min read',
    views: 1560,
    shares: 530
  },
  {
    id: 'sci-2026-06-15',
    title: 'Asteroid Redirection Success: DART-II Mission Alters Deep-Space Orbit by Over 10 Degrees',
    content: 'NASA aerospace engineers confirmed today that the DART-II kinetic impactor spacecraft has successfully altered the orbital trajectory of the deep-space asteroid 2024-K2. The impact, which occurred over fifteen million kilometers from Earth, exceeded initial simulation projections by over four degrees, demonstrating the viability of rapid planetary defense mechanics. Teams utilized automated telemetry rigs powered by localized semantic processors to lock onto the asteroid without human guidance during the high-speed impact collision.',
    summary: 'The DART-II deep-space craft successfully struck targeted asteroid 2024-K2, proving orbital deflection systems are capable of protecting Earth from deep-space impacts.',
    takeaways: [
      'DART-II kinetic spacecraft successfully alters deep-space asteroid\'s route by 10.4 degrees.',
      'Exceeds simulated trajectory diversion expectations by more than four degrees.',
      'Utilized automated local sensors to perform final targeting sequences without control-room intervention.'
    ],
    facts: [
      'Impact distance from Earth: 15.2 million kilometers.',
      'Deflection angle verified: 10.4 degrees.',
      'Spacecraft terminal speed: 22,500 kilometers per hour.'
    ],
    source: 'Nature Journal',
    category: 'Science',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-15T05:10:00Z',
    readTime: '4 min read',
    views: 2420,
    shares: 890
  },
  {
    id: 'ai-2026-06-14',
    title: 'Meta-Agent Coordination Platform Sets Record for Zero-Human Software Engineering',
    content: 'A team of decentralized developers has published open-source benchmarks staging a complete enterprise-grade banking registry built from scratch by twelve coordinated digital agents. Operating on a shared-memory buffer framework, the agents drafted system schemas, generated TypeScript components, formulated Jest verification suites, and deployed the final containerized application onto Cloud Run with zero human-engineered lines. The entire test cycle concluded in twenty-two minutes, setting a new paradigm for rapid software delivery.',
    summary: 'Twelve automated agents collaborating over a unified memory-sharing platform successfully built, verified, and deployed a complex banking registry program within twenty-two minutes.',
    takeaways: [
      'Achieves 100% autonomous code authoring across complete complex database structures.',
      'Coordinated through shared-memory buffer lanes, eliminating typical prompt-tuning drift.',
      'Finished complete build, test suites, and cloud execution in under 22 minutes.'
    ],
    facts: [
      'Engineers involved: 0 humans.',
      'Cooperating agent profiles: 12 digital agents.',
      'Total pipeline duration: 22 minutes, 14 seconds.'
    ],
    source: 'The Economist',
    category: 'Artificial Intelligence',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-14T15:45:00Z',
    readTime: '3 min read',
    views: 1810,
    shares: 420
  },
  {
    id: 'ent-2026-06-13',
    title: 'Virtual Hologram Theatre Records First Sold-Out Broadway Run in Tokyo',
    content: 'Tokyo has witnessed the world\'s first fully holographic theatrical production enter a historic sold-out commercial run. The performance features high-fidelity, light-field projection screens that render life-sized virtual actors indistinguishable from real stage candidates. The experience is accompanied by reactive spatial wave sound nodes that adjust volume and direction dynamically according to spectator seating arrangements, receiving standing ovations and reshaping theatrical distribution models.',
    summary: 'The first high-fidelity holographic theater run has completely sold out in Tokyo, presenting synthetic stage actors rendered on light-field projection grids.',
    takeaways: [
      'Launches the first commercially viable virtual actor theatre stage in Japan.',
      'Utilizes specialized light-field projection lines to avoid the need for AR glasses.',
      'Adapts auditory acoustics dynamically using real-time seating tracking sensors.'
    ],
    facts: [
      'Ticket occupancy rate: 100% capacity across 24 performances.',
      'Projection standard: Light-field spatial modeling.',
      'Acoustic latency: Real-time dynamic audio syncing.'
    ],
    source: 'The Guardian',
    category: 'Entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-13T19:30:00Z',
    readTime: '3 min read',
    views: 1250,
    shares: 290
  },
  {
    id: 'world-2026-06-12',
    title: 'Superstellar Desalination Array Successfully Regenerates Arid Valley Ecosystems',
    content: 'Three formerly barren coastal desert sectors along the Gulf region are blooming with local olive and date orchards following the activation of high-power solar desalination aqueducts. The massive system relies entirely on photovoltaic bifacial arrays to pump and purify brackish seawater, bringing irrigation directly to dry zones. Environmental engineers have already identified a noticeable three-degree local cooling effect across reforested zones, creating microclimates capable of supporting steady biological returns.',
    summary: 'A high-capacity solar-purified aqueduct project has successfully restored dry coastal plains into healthy agricultural dates and olive orchards, lowering climate temperatures locally.',
    takeaways: [
      'Restores previously uncultivated desert areas with non-fossil powered solar irrigation rows.',
      'Drives a 3-degree localized cooling effect by expanding tree foliage and soil carbon water content.',
      'Establishes regional food independence for communities historically dependent on agricultural imports.'
    ],
    facts: [
      'Reforested land: 75,000 hectares reclaimed.',
      'Aqueduct length: 280 kilometers fully active.',
      'Localized cooling recorded: -3.2 degrees Celsius.'
    ],
    source: 'The Guardian',
    category: 'World News',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-12T13:10:00Z',
    readTime: '4 min read',
    views: 1540,
    shares: 330
  },
  {
    id: 'ai-1',
    title: 'Gemini 3.5 Unleashed: Context Windows Extended to 10M Tokens and Cognitive Reasoning Amplified',
    content: 'Google has officially announced the launch of Gemini 3.5, setting a new benchmark for large language models globally. The updated model features a revolutionary 10-million-token context window which allows individuals to upload entire books, repositories, and video datasets directly into the runtime context. Furthermore, Gemini 3.5 introduces native multi-modal mathematical reasoning and audio transcription streams directly at the core decoder level.\n\nDevelopers in AI Studio can start testing structural reasoning gates immediately. Initial evaluations show that Gemini 3.5 outperforms previous models on STEM coding and complex multi-turn logic by over twenty-two percent, bringing true autonomous software engineering agents one step closer to everyday production realities.',
    summary: 'Google launched Gemini 3.5, boasting an unprecedented 10-million-token context window. The upgraded model integrates core mathematical reasoning and real-time multimodal audio capabilities, representing a 22% leap in logic benchmarks and autonomous coding tasks.',
    takeaways: [
      'Introduces a massive 10-million-token context window for processing extensive projects.',
      'Outperforms typical reasoning benchmarks by 22% on average.',
      'Enables structural mathematical engines and native core audio processing directly within the model design.'
    ],
    facts: [
      'Context size: 10,000,000 tokens.',
      'Release date: June 2026.',
      'Benchmark growth: 22% increase in multi-turn logic accuracy.'
    ],
    source: 'Wired News',
    category: 'Artificial Intelligence',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-02T08:00:00Z',
    readTime: '4 min read',
    views: 1240,
    shares: 480
  },
  {
    id: 'ai-2',
    title: 'The Rise of Autonomous AI Agents in Enterprise Operations',
    content: 'Enterprise automation has entered a new era with autonomous multi-agent systems taking over complex supply chain planning, customer care workflows, and legacy codebase migrations. Rather than executing simple rigid triggers, these agent teams operate with dynamic planning libraries, using shared memory spaces to delegate sub-tasks and review each other’s code outputs before final deployments.\n\nLeading firms report a 40% reduction in operations overhead within months of deploying unified agent panels. Designers note that the focus has shifted from writing prompt strings to managing systemic access controls and checking secure database rule boundaries.',
    summary: 'Multi-agent frameworks are rapidly replacing archaic single-string automations inside corporate back-offices, automating supply-chain audits, database sync operations, and deployment verifications with shared memory frameworks.',
    takeaways: [
      'Enterprises report up to 40% operational cost reductions.',
      'Agents collaborate using shared memory pools and internal peer code-review gates.',
      'Human roles are transitioning from simple prompting to structural access architecture management.'
    ],
    facts: [
      'Average operational overhead saving: 40%.',
      'Primary tools utilized: Shared memory buffers, self-reflection audits.',
      'Key industries: Financial tracking, supply-chain logistics, DevOps.'
    ],
    source: 'The Economist',
    category: 'Artificial Intelligence',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-01T15:30:00Z',
    readTime: '3 min read',
    views: 890,
    shares: 210
  },
  {
    id: 'tech-1',
    title: 'Quantum Advantage Claimed in Room-Temperature Superconducting Hardware',
    content: 'A consortium of silicon research laboratories has validated a state of quantum advantage running on a physical room-temperature superconducting grid. The hardware maintains quantum coherence for over twelve milliseconds at standard atmospheric pressure, surpassing previous liquid-helium cooling thresholds.\n\nThis breakthrough paving the way for ultra-dense processing units that consume practically zero kinetic heat dissipation. Computing architectures based on these superconducting gates stand to expedite complex molecular simulations, drug designs, and cryptological decryptions at speeds unimaginable under traditional silicon standards.',
    summary: 'A physical breakthrough in room-temperature superconducting grids has successfully sustained quantum coherence at room temperature. This paves the way for zero-heat ultra-dense desktop quantum processing units.',
    takeaways: [
      'Quantum coherence maintained for over 12 milliseconds at standard room temperature.',
      'Completely eliminates cooling needs and heat dissipation issues characteristic of silicon chips.',
      'Expedites deep biochemical simulating engines, drug discoveries, and cryptological operations.'
    ],
    facts: [
      'Coherence duration: 12.4 milliseconds.',
      'Operating temperature: 21 degrees Celsius.',
      'Processing power: Over 10^5 complex quantum gates active.'
    ],
    source: 'Reuters Science & Tech',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-02T06:15:00Z',
    readTime: '5 min read',
    views: 1420,
    shares: 512
  },
  {
    id: 'tech-2',
    title: 'Next-Generation Solid-State Batteries Enter Mass Production for Clean Vehicles',
    content: 'The first global manufacturing plant dedicated entirely to solid-state sodium batteries has launched its commercial run this week. Promising a massive 800 miles on a single four-minute charge, the battery packs use non-flammable solid ceramic electrolytes that remain perfectly secure even during high-impact collisions.\n\nThis marks a monumental corner turned for the automotive industry, as traditional lithium-ion fire hazards and weight constraints are completely eliminated. Several major car manufacturers have already signed exclusive purchase agreements starting early next year.',
    summary: 'Automotive manufacturing reached a turning point with the launch of the first sodium solid-state battery gigafactory, boasting an 800-mile range and a ultra-fast 4-minute full recharging protocol.',
    takeaways: [
      'Offers 800 miles range per single charge.',
      'Full recharge completed in only four minutes.',
      'Replaces volatile organic liquid elements with entirely fireproof ceramic solid electrolyte blocks.'
    ],
    facts: [
      'Gigafactory capacity: 50 GWh annually.',
      'Charge time: 4 minutes standard.',
      'Electrolyte compound: Ceramic composite sodium oxide.'
    ],
    source: 'Bloomberg News',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-05-30T10:45:00Z',
    readTime: '3 min read',
    views: 930,
    shares: 180
  },
  {
    id: 'sports-1',
    title: 'World Cup 2026 Ready: Venues Unveil Ultra-Low Latency Interactive Event Displays',
    content: 'With the Men\'s World Cup 2026 set to begin across the Americas, host arenas have unveiled state-of-the-art interactive holographic display panels for fans. Using localized high-frequency spatial antennas, spectators can hover their phones over seat markers to instantly load live interactive stats, 180-degree field replay angles, and real-time speech translations of the head referee.\n\nThis integration marks the most technologically advanced sports tournament in history. Venue organizers stress that cybersecurity protocols on the local wireless mesh ensure zero latency and full privacy protection for high-density crowds.',
    summary: 'Host stadium panels for World Cup 2026 will support dynamic holographic fan stats, real-time audio translations, and instant 180-degree multi-angle replay triggers directly to spectator phones.',
    takeaways: [
      'Spectators retrieve multi-angle view replays instantly on their device overlays.',
      'Includes real-time referee audio audio descriptions and rule explanation streams.',
      'Mesh networks support up to 90,000 active visual stream triggers simultaneously per venue.'
    ],
    facts: [
      'Event: World Cup 2026.',
      'Network standard: High-frequency spatial audio and 6G mesh.',
      'Interactive capacity: 100% seating coverage.'
    ],
    source: 'Associated Press',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-02T05:00:00Z',
    readTime: '3 min read',
    views: 2100,
    shares: 640
  },
  {
    id: 'sports-2',
    title: 'Athletes Turn to Personalized AI Muscle Biomarker Coaches to Halt Strains',
    content: 'Professional sports leagues are recording a historical low in hamstring and connective tissue strains following the universal adoption of muscle biomarker feedback engines. Athletes wear lightweight tactile dermal sensors that read microscopic potassium and sweat pH values in real-time.\n\nAlgorithms analyze these data metrics during strenuous sprint drills, alerting coaches to bench a player up to three physical minutes before an actual muscle strain or structural fatigue tear occurs. The predictive safety technology has revolutionized pre-season workouts and athletic career spans.',
    summary: 'Pro athletic leagues adopting sweat-biomarker dermal sensors have successfully decreased muscle-related dropouts by 75% using anticipatory lactic acid analytics.',
    takeaways: [
      'Decreases hamstring-related seasonal injuries by 75%.',
      'Provides micro-potassium and sweat index reads during active field execution.',
      'Alerts coaches 3 to 5 minutes before muscle strains or fatigue tear occurs.'
    ],
    facts: [
      'Hamstring strain reductions: 75% across active profiles.',
      'Sensor dimensions: 2cm flexible micro-sticker.',
      'Analysis latency: Under 0.5 seconds.'
    ],
    source: 'Scientific American',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-05-28T08:12:00Z',
    readTime: '4 min read',
    views: 750,
    shares: 95
  },
  {
    id: 'business-1',
    title: 'The Great Remote Realignment: Commercial Space Converted into Green Verticals',
    content: 'Under pressure from persistent office vacancies, major cities have officially approved tax-exempt zoning laws allowing the conversion of downtown commercial towers into high-yield automated vertical farms and sustainable micro-apartments.\n\nThis shift, known as the Commercial Realignment of 2026, aims to revitalize inner-city carbon footprints while lowering transit fuel dependency. The real estate market is responding with high investor optimism, transitioning high-maintenance empty office floors into modular climate-sealed plant chambers producing clean organic vegetables directly inside urban blocks.',
    summary: 'The commercial real estate bubble has spurred active transitions of high-rise commercial structures into municipal solar vertical crop yards, providing high urban food yields with zero shipping latency.',
    takeaways: [
      'Redefines empty downtown towers as high-yield hydroponic vertical systems.',
      'Reduces urban shipping fuel usage by producing fruits and greens inside city centers.',
      'Attracts billions in green real estate development funds.'
    ],
    facts: [
      'Tower conversions active: 45 major high-rises globally.',
      'Municipal food yield forecast: 200 tons of local green harvest weekly.',
      'Office occupancy rate: Settled at 42% average.'
    ],
    source: 'The Wall Street Journal',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-01T12:00:00Z',
    readTime: '4 min read',
    views: 1100,
    shares: 250
  },
  {
    id: 'finance-1',
    title: 'Global Regulators Agree on Sovereign Digital Currency Interconnectivity Framework',
    content: 'Central banking leaders representing ninety-four countries have ratified the Inter-Sovereign Settlement Standard (ISSS) on decentralized digital reserves. The consensus standard details secure cryptographic bridges connecting various Central Bank Digital Currencies (CBDCs) for immediate, zero-fee cross-border remittance.\n\nThe policy marks a paradigm shift for traditional financial intermediaries and clearinghouses. By eliminating processing buffers worth billions, transactions can execute cleanly in microseconds, directly bypassing SWIFT routing and secondary conversion premiums.',
    summary: 'Central bankers signed the ISSS, establishing direct decentralized CBDC connectivity bridges that run instantly for zero-fee ledger conversions globally, bypassing legacy credit chains.',
    takeaways: [
      'Ratifies cross-border instant settlement standard across 94 sovereign central banks.',
      'Eliminates clearing intermediaries and conversion friction overhead.',
      'Guarantees immediate receipt verification via high-speed zero-knowledge proofs.'
    ],
    facts: [
      'Signatory nations: 94 countries.',
      'Transaction cost reduction: 99.8% on global transfers.',
      'Settlement time: Under 0.08 seconds.'
    ],
    source: 'Financial Times',
    category: 'Finance',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-02T04:20:00Z',
    readTime: '5 min read',
    views: 1950,
    shares: 720
  },
  {
    id: 'science-1',
    title: 'James Webb Space Telescope Captures Atmosphere Signatures on Nearby Exo-Earth',
    content: 'Astronomers using NASA’s James Webb Space Telescope have mapped definite chemical atmospheric signatures on the exo-planet LHS-475 b, located approximately forty-one light-years from our solar system. The infrared sensor feedback detected methane, water vapor, and carbon isotopes in quantities surprisingly analogous to prebiotic Earth.\n\nCalculated climate profiles suggest the world possesses liquid water basins under a healthy moderate atmosphere. Research departments are calling this one of the most stunning astrobiological discoveries of the decade, potentially pointing to planetary conditions ready for microbiological germination.',
    summary: 'NASA verified LHS-475 b, a nearby rocky exo-planet 41 light-years away, contains liquid water basins, water vapor, and methane indexes highly similar to primordial Earth conditions.',
    takeaways: [
      'Water vapor, methane gas, and nitrogen matrices confirmed on rocky planet LHS-475 b.',
      'LHS-475 b sits cleanly in the star habitable star-zone with liquid ocean potential.',
      'Marks the first definitive atmosphere blueprint mapped on a near-equivalent Earth-sized exoplanet.'
    ],
    facts: [
      'Distance to exoplanet: 41 light-years.',
      'Atmospheric gases: Carbon dioxide, water vapor, methane.',
      'Exo-planet diameter: 1.05 Earth masses.'
    ],
    source: 'Nature Journal',
    category: 'Science',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-01T21:10:00Z',
    readTime: '4 min read',
    views: 2200,
    shares: 800
  },
  {
    id: 'health-1',
    title: 'CRISPR Gene Therapy Reverses Inherited Coronary Heart Disease in First Human Trials',
    content: 'A joint medical research team has published highly successful phase-2 trials demonstrating the complete reversal of inherited coronary heart disease using in-vivo CRISPR gene updates. The single-injection treatment targeted PCSK9 receptors inside liver cells, immediately shutting down high-density lipoprotein cholesterol blockages.\n\nAll sixty candidate participants experienced a sustained seventy percent decrease in arterial plaque buildup within twelve weeks. Patient tracking reports zero toxic side-effects, showcasing the incredible performance and safety profile of targeted epigenetic alterations.',
    summary: 'A localized single-dose CRISPR gene therapy PCSK9 hepatic editor successfully reversed arterial cholesterol plaque blockages by 70% in all human test subjects with zero side-effects.',
    takeaways: [
      'Reverses inherited heart genetic disease using single epigenetic editing target codes.',
      'Decreases hazardous arterial block plaque numbers by 70% in three short months.',
      'Candidate safety profiles report zero long-term side-effects or off-target mutations.'
    ],
    facts: [
      'Target gene: PCSK9 receptors.',
      'Plaque reduction rate: 70% average decrease.',
      'Human trial participants: 60 patients under full recovery.'
    ],
    source: 'Scientific American',
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-02T02:00:00Z',
    readTime: '3 min read',
    views: 1340,
    shares: 412
  },
  {
    id: 'entertainment-1',
    title: 'AI Cinema Standard Unveiled: Audiences Customize Director Cuts Live During Playback',
    content: 'A dominant streaming conglomerate has unveiled a real-time cinema engine allowing viewers to customize script paths, cinematic tone directions, and ambient lighting in movie releases on the fly. As the film streams, generative texturing cards synthesize high-fidelity actors and background scenery in photorealistic resolution, updating facial expressions based on real-time feedback.\n\nThe engineering standard integrates dynamic orchestral scoring that matches user response metrics seamlessly. Standard directors argue this blurs the line between gaming and storytelling, but audience satisfaction remains at an all-time high.',
    summary: 'Audiences can now steer movie pathways, lighting, and cinematic themes live at 4K resolution using generative scene-adaptation engines incorporated in premium streams.',
    takeaways: [
      'Allows live scripting shifts and direct visual style transformations mid-screen.',
      'Generative video decoders render localized clothing, environments, and actor actions on-the-fly.',
      'Bridges static screen stories with fully customized high-fidelity experiences.'
    ],
    facts: [
      'Render latency: Under 0.03 seconds per vector frame.',
      'Output resolution: 4K HDR at 120 FPS.',
      'Interactive path count: Unlimited combinations.'
    ],
    source: 'The Guardian',
    category: 'Entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-01T20:00:00Z',
    readTime: '4 min read',
    views: 1800,
    shares: 550
  },
  {
    id: 'politics-1',
    title: 'Historic Climate Accord Enforces Transparent Blockchain Carbon Credits',
    content: 'Delegates representing one-hundred and eighty states have signed a pivotal legislative treaty enforcing live cryptographic ledger records for all carbon offset transactions. The bill eliminates carbon double-counting, introducing penalties for corporations listing unverified credits.\n\nLocal carbon footprint sensors feed metrics instantly onto decentralized sovereign accounting sheets. Environmental organizations are calling this a historic turning point that ensures massive multinational corporations can no longer hide their global emissions.',
    summary: '180 countries ratified a carbon reporting mandate utilizing distributed public ledgers to map global corporate greenhouse emission metrics and freeze offset manipulation.',
    takeaways: [
      'Mandates cryptographic emissions logs for active corporations throughout 180 countries.',
      'Completely bans double-offsetting credit tricks through single-record auditing locks.',
      'Empowers eco audits with instant public access to sensor logs.'
    ],
    facts: [
      'Signatory countries: 180 global governments.',
      'Audit accuracy standard: 99.9% emission validation.',
      'Credit trading standard: SEC carbon ledger standard.'
    ],
    source: 'BBC News',
    category: 'Politics',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-02T01:10:00Z',
    readTime: '3 min read',
    views: 1150,
    shares: 195
  },
  {
    id: 'world-1',
    title: 'The Great Green Belt: Desalination Super-Canals Transform Arid Coastlines',
    content: 'Engineering units have completed the first functional system of hyper-scale solar desalination super-canals stretching interior into arid valleys. The mega-project pumps millions of cubic liters of fresh pure ocean water into previously barren coastal deserts.\n\nThis agricultural rehabilitation effort has triggered extensive local crop returns and reforested miles of formerly unusable sand. Surrounding nations report key climate improvements and robust food security gains from localized fruit crops.',
    summary: 'A solar super-canal infrastructure project successfully desalinated and diverted ocean water to irrigate barren zones, reforesting coastal deserts and boosting local farm security.',
    takeaways: [
      'Converts dry sand into high-yield agricultural lands using solar desalination canals.',
      'Re-forests desert buffer regions to cool down persistent regional temperatures.',
      'Produces scalable fresh water output supplying organic vegetable hubs.'
    ],
    facts: [
      'Pumping rate: 4,000,000 cubic meters desalinated water daily.',
      'Solar grid powering capacity: 1.2 Gigawatts peak solar.',
      'Barren lands recovered: 50,000 hectares.'
    ],
    source: 'The Guardian',
    category: 'World News',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-01T14:40:00Z',
    readTime: '5 min read',
    views: 1650,
    shares: 340
  }
];

const DEFAULT_TRENDS = [
  { id: 't-7', topic: 'ITER Continuous Fusion Peak', articlesCount: 78, growth: 210, category: 'World News' },
  { id: 't-8', topic: 'Silicon Photonics Neural Accelerator', articlesCount: 65, growth: 165, category: 'Technology' },
  { id: 't-1', topic: 'Gemini 3.5 Launch', articlesCount: 150, growth: 185, category: 'Artificial Intelligence' },
  { id: 't-2', topic: 'Solid-State Ceramic Sodium Batteries', articlesCount: 94, growth: 120, category: 'Technology' },
  { id: 't-3', topic: 'World Cup Holographic Visuals', articlesCount: 82, growth: 95, category: 'Sports' },
  { id: 't-4', topic: 'CRISPR PCSK9 Heart Cure', articlesCount: 61, growth: 140, category: 'Health' },
  { id: 't-5', topic: 'Sovereign Digital ISSS Transfer', articlesCount: 110, growth: 75, category: 'Finance' },
  { id: 't-6', topic: 'Exoplanet Atmosphere LHS-475 b', articlesCount: 45, growth: 60, category: 'Science' }
];

function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialSchema: DatabaseSchema = {
        users: [
          {
            id: 'demo-user',
            name: 'Demo Reader',
            email: 'demo@newsintelligence.io',
            interests: ['Artificial Intelligence', 'Technology', 'Science'],
            role: 'user',
            createdAt: '2026-06-01T12:00:00Z'
          }
        ],
        articles: DEFAULT_ARTICLES,
        bookmarks: [],
        readingHistory: [],
        trendingTopics: DEFAULT_TRENDS
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialSchema, null, 2), 'utf8');
      return initialSchema;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const data: DatabaseSchema = JSON.parse(raw);
    
    // Auto-update db.json if there are newly added default articles
    let updated = false;
    for (const defArt of DEFAULT_ARTICLES) {
      if (!data.articles.some(a => a.id === defArt.id)) {
        data.articles.push(defArt);
        updated = true;
      }
    }
    
    // Auto-update trending topics if needed
    for (const defTrend of DEFAULT_TRENDS) {
      if (!data.trendingTopics.some(t => t.id === defTrend.id)) {
        data.trendingTopics.push(defTrend);
        updated = true;
      }
    }

    if (updated) {
      // Sort articles by publication date to keep fresh articles on top
      data.articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    }
    
    return data;
  } catch (err) {
    console.error('Error reading local JSON database:', err);
    return {
      users: [],
      articles: DEFAULT_ARTICLES,
      bookmarks: [],
      readingHistory: [],
      trendingTopics: DEFAULT_TRENDS
    };
  }
}

function writeDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local JSON database:', err);
  }
}

export const dbService = {
  getUsers: () => readDB().users,
  
  saveUser: (user: User) => {
    const data = readDB();
    const existingIdx = data.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx >= 0) {
      data.users[existingIdx] = { ...data.users[existingIdx], ...user };
    } else {
      data.users.push(user);
    }
    writeDB(data);
    return user;
  },

  findUserByEmail: (email: string) => {
    const users = readDB().users;
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getArticles: () => readDB().articles,

  addArticle: (article: Article) => {
    const data = readDB();
    // Prevent duplicate headlines if matching
    const match = data.articles.find(a => a.title.toLowerCase() === article.title.toLowerCase());
    if (match) return match;
    
    data.articles.unshift(article);
    writeDB(data);
    return article;
  },

  incrementView: (articleId: string) => {
    const data = readDB();
    const article = data.articles.find(a => a.id === articleId);
    if (article) {
      article.views = (article.views || 0) + 1;
      writeDB(data);
    }
    return article;
  },

  incrementShare: (articleId: string) => {
    const data = readDB();
    const article = data.articles.find(a => a.id === articleId);
    if (article) {
      article.shares = (article.shares || 0) + 1;
      writeDB(data);
    }
    return article;
  },

  getBookmarks: (userId: string) => {
    const data = readDB();
    return data.bookmarks.filter(b => b.userId === userId);
  },

  addBookmark: (userId: string, articleId: string) => {
    const data = readDB();
    const exists = data.bookmarks.find(b => b.userId === userId && b.articleId === articleId);
    if (exists) return exists;

    const newBookmark: Bookmark = {
      id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      articleId,
      createdAt: new Date().toISOString()
    };
    data.bookmarks.push(newBookmark);
    writeDB(data);
    return newBookmark;
  },

  removeBookmark: (userId: string, articleId: string) => {
    const data = readDB();
    data.bookmarks = data.bookmarks.filter(b => !(b.userId === userId && b.articleId === articleId));
    writeDB(data);
    return true;
  },

  getReadingHistory: (userId: string) => {
    const data = readDB();
    return data.readingHistory.filter(h => h.userId === userId);
  },

  addReadingHistory: (userId: string, articleId: string, durationSeconds: number = 30) => {
    const data = readDB();
    const newHistory: ReadingHistory = {
      id: `h-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      articleId,
      viewedAt: new Date().toISOString(),
      readTimeSeconds: durationSeconds
    };
    data.readingHistory.push(newHistory);
    writeDB(data);
    return newHistory;
  },

  getTrendingTopics: () => {
    return readDB().trendingTopics;
  }
};
