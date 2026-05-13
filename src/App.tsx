import {
  Atom,
  Database,
  Eye,
  FileUp,
  GitCompare,
  Globe2,
  Layers,
  Lock,
  LogOut,
  Map as MapIcon,
  MessageSquare,
  Microscope,
  Pencil,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';

type Role = 'Admin' | 'Researcher' | 'Viewer';
type Visibility = 'public' | 'private';
type View = 'hub' | 'explorer' | 'detail' | 'upload' | 'compare' | 'dashboard' | 'admin';

type CellType = 'Tumor' | 'CD8 T cell' | 'Macrophage' | 'Stromal' | 'B cell' | 'Endothelial';
type RegionType = 'Tumor core' | 'Invasive margin' | 'Immune niche' | 'Stroma';

interface User {
  name: string;
  email: string;
  role: Role;
}

interface CellPoint {
  id: string;
  x: number;
  y: number;
  cellType: CellType;
  region: RegionType;
  markerValues: Record<string, number>;
}

interface RegionAnnotation {
  id: string;
  name: RegionType;
  color: string;
  polygon: Array<[number, number]>;
}

interface DatasetComment {
  id: string;
  author: string;
  role: Role;
  note: string;
  createdAt: string;
}

interface Dataset {
  id: string;
  title: string;
  cancerType: string;
  technique: string;
  studyDate: string;
  location: string;
  description: string;
  methods: string;
  contributor: string;
  contributorEmail: string;
  visibility: Visibility;
  tags: string[];
  markers: string[];
  cellTypes: CellType[];
  regions: RegionAnnotation[];
  cells: CellPoint[];
  comments: DatasetComment[];
  createdAt: string;
}

type UploadedRow = Record<string, string | number>;

const STORAGE_KEY = 'spatial-tme-portal-datasets';
const USER_KEY = 'spatial-tme-portal-user';
const cellTypeColors: Record<CellType, string> = {
  Tumor: '#ef476f',
  'CD8 T cell': '#06d6a0',
  Macrophage: '#f77f00',
  Stromal: '#8d99ae',
  'B cell': '#118ab2',
  Endothelial: '#7b2cbf',
};

const regionColors: Record<RegionType, string> = {
  'Tumor core': '#ef476f',
  'Invasive margin': '#ffd166',
  'Immune niche': '#06d6a0',
  Stroma: '#8d99ae',
};

const defaultMarkers = ['CD8', 'PD-L1', 'CK', 'FOXP3', 'CD68'];
const cancerTypes = ['Melanoma', 'Lung', 'Breast', 'Pancreatic', 'Ovarian', 'Colorectal'];
const techniques = ['IMC', 'MIBI-TOF', 'CODEX', 'Visium', 'MERFISH', 'GeoMx'];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildRegions(): RegionAnnotation[] {
  return [
    {
      id: 'tumor-core',
      name: 'Tumor core',
      color: regionColors['Tumor core'],
      polygon: [
        [28, 22],
        [72, 18],
        [83, 48],
        [66, 76],
        [32, 70],
        [18, 44],
      ],
    },
    {
      id: 'immune-niche',
      name: 'Immune niche',
      color: regionColors['Immune niche'],
      polygon: [
        [4, 20],
        [25, 8],
        [38, 24],
        [24, 46],
        [8, 42],
      ],
    },
    {
      id: 'invasive-margin',
      name: 'Invasive margin',
      color: regionColors['Invasive margin'],
      polygon: [
        [16, 74],
        [42, 68],
        [74, 80],
        [93, 96],
        [36, 96],
      ],
    },
  ];
}

function regionFromPoint(x: number, y: number): RegionType {
  const dx = x - 52;
  const dy = y - 48;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 27) return 'Tumor core';
  if (x < 38 && y < 52) return 'Immune niche';
  if (y > 68 || distance < 38) return 'Invasive margin';
  return 'Stroma';
}

function weightedCellType(region: RegionType, random: () => number): CellType {
  const roll = random();

  if (region === 'Tumor core') {
    if (roll < 0.54) return 'Tumor';
    if (roll < 0.7) return 'Macrophage';
    if (roll < 0.84) return 'Stromal';
    if (roll < 0.94) return 'CD8 T cell';
    return 'B cell';
  }

  if (region === 'Immune niche') {
    if (roll < 0.36) return 'CD8 T cell';
    if (roll < 0.58) return 'B cell';
    if (roll < 0.78) return 'Macrophage';
    if (roll < 0.9) return 'Endothelial';
    return 'Tumor';
  }

  if (region === 'Invasive margin') {
    if (roll < 0.32) return 'Tumor';
    if (roll < 0.55) return 'CD8 T cell';
    if (roll < 0.78) return 'Stromal';
    if (roll < 0.92) return 'Macrophage';
    return 'Endothelial';
  }

  if (roll < 0.5) return 'Stromal';
  if (roll < 0.7) return 'Endothelial';
  if (roll < 0.85) return 'Macrophage';
  return 'CD8 T cell';
}

function expressionValue(marker: string, cellType: CellType, region: RegionType, random: () => number) {
  const noise = random() * 22;
  const regionBoost = region === 'Invasive margin' || region === 'Immune niche' ? 12 : 0;

  if (marker === 'CD8') return clamp((cellType === 'CD8 T cell' ? 72 : 18) + regionBoost + noise, 0, 100);
  if (marker === 'PD-L1') return clamp((cellType === 'Tumor' || cellType === 'Macrophage' ? 58 : 20) + noise, 0, 100);
  if (marker === 'CK') return clamp((cellType === 'Tumor' ? 82 : 12) + noise, 0, 100);
  if (marker === 'FOXP3') return clamp((cellType === 'CD8 T cell' || cellType === 'B cell' ? 36 : 10) + noise, 0, 100);
  if (marker === 'CD68') return clamp((cellType === 'Macrophage' ? 78 : 16) + noise, 0, 100);
  return clamp(30 + noise, 0, 100);
}

function makeCells(seed: number, count: number, markers = defaultMarkers): CellPoint[] {
  const random = seededRandom(seed);

  return Array.from({ length: count }, (_, index) => {
    const cluster = random();
    const centerX = cluster < 0.62 ? 52 : cluster < 0.82 ? 22 : 78;
    const centerY = cluster < 0.62 ? 48 : cluster < 0.82 ? 30 : 78;
    const x = clamp(centerX + (random() - 0.5) * 70, 1, 99);
    const y = clamp(centerY + (random() - 0.5) * 62, 1, 99);
    const region = regionFromPoint(x, y);
    const cellType = weightedCellType(region, random);
    const markerValues = markers.reduce<Record<string, number>>((values, marker) => {
      values[marker] = Math.round(expressionValue(marker, cellType, region, random));
      return values;
    }, {});

    return {
      id: `cell-${seed}-${index}`,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      cellType,
      region,
      markerValues,
    };
  });
}

function seedDatasets(): Dataset[] {
  return [
    {
      id: 'melanoma-immune-atlas',
      title: 'Melanoma immune exclusion atlas',
      cancerType: 'Melanoma',
      technique: 'IMC',
      studyDate: '2025-02-12',
      location: 'Moffitt Cancer Center',
      description:
        'High-plex imaging mass cytometry study of tumor core and invasive margin regions with CD8 and PD-L1 gradients.',
      methods: 'Formalin-fixed tissue microarray imaged with 37-antibody IMC panel; cells segmented with watershed masks.',
      contributor: 'iTIME Spatial Group',
      contributorEmail: 'itime@moffitt.org',
      visibility: 'public',
      tags: ['immune exclusion', 'checkpoint', 'tumor margin'],
      markers: defaultMarkers,
      cellTypes: ['Tumor', 'CD8 T cell', 'Macrophage', 'Stromal', 'B cell', 'Endothelial'],
      regions: buildRegions(),
      cells: makeCells(24, 540),
      comments: [
        {
          id: 'comment-1',
          author: 'Dr. Rivera',
          role: 'Researcher',
          note: 'Interesting CD8 enrichment along the inferior invasive margin.',
          createdAt: '2026-03-02',
        },
      ],
      createdAt: '2026-02-20',
    },
    {
      id: 'lung-pdl1-neighborhoods',
      title: 'NSCLC PD-L1 neighborhood states',
      cancerType: 'Lung',
      technique: 'CODEX',
      studyDate: '2024-11-03',
      location: 'Collaborative Lung SPORE',
      description:
        'CODEX-derived cellular neighborhoods highlighting PD-L1 positive tumor islands and macrophage-rich regions.',
      methods: 'Multiplexed CODEX panel with graph-based cellular neighborhood analysis and manual region annotation.',
      contributor: 'Thoracic Oncology Lab',
      contributorEmail: 'thoracic@example.edu',
      visibility: 'public',
      tags: ['PD-L1', 'neighborhoods', 'macrophage'],
      markers: defaultMarkers,
      cellTypes: ['Tumor', 'CD8 T cell', 'Macrophage', 'Stromal', 'B cell', 'Endothelial'],
      regions: buildRegions(),
      cells: makeCells(78, 620),
      comments: [],
      createdAt: '2026-01-09',
    },
    {
      id: 'breast-stromal-map',
      title: 'Triple-negative breast stromal niches',
      cancerType: 'Breast',
      technique: 'MIBI-TOF',
      studyDate: '2025-07-18',
      location: 'Partner Biobank',
      description:
        'Spatial phenotyping of stromal barriers, vascular channels, and lymphocyte pockets in TNBC samples.',
      methods: 'MIBI-TOF acquisition with probabilistic cell typing and pathologist-curated tumor boundary masks.',
      contributor: 'TME Methods Core',
      contributorEmail: 'methods@example.edu',
      visibility: 'public',
      tags: ['TNBC', 'stroma', 'vascular'],
      markers: defaultMarkers,
      cellTypes: ['Tumor', 'CD8 T cell', 'Macrophage', 'Stromal', 'B cell', 'Endothelial'],
      regions: buildRegions(),
      cells: makeCells(112, 500),
      comments: [],
      createdAt: '2026-04-11',
    },
  ];
}

function uniqueValues<T>(values: T[]) {
  return Array.from(new Set(values));
}

function normalizeColumnName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseCsv(text: string): UploadedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce<UploadedRow>((row, header, index) => {
      const rawValue = values[index] ?? '';
      const numeric = Number(rawValue);
      row[header] = Number.isFinite(numeric) && rawValue.trim() !== '' ? numeric : rawValue;
      return row;
    }, {});
  });
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim().replace(/^"|"$/g, ''));
  return values;
}

function parseGeoJson(text: string): UploadedRow[] {
  const parsed = JSON.parse(text) as {
    type?: string;
    features?: Array<{
      geometry?: { type?: string; coordinates?: unknown };
      properties?: Record<string, string | number>;
    }>;
  };

  if (parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) return [];

  return parsed.features
    .map((feature, index) => {
      const coordinates = feature.geometry?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

      return {
        id: `feature-${index}`,
        x: Number(coordinates[0]),
        y: Number(coordinates[1]),
        ...(feature.properties ?? {}),
      };
    })
    .filter((row): row is UploadedRow => Boolean(row));
}

function detectColumn(columns: string[], candidates: string[]) {
  return (
    columns.find((column) => candidates.includes(normalizeColumnName(column))) ??
    columns.find((column) => candidates.some((candidate) => normalizeColumnName(column).includes(candidate)))
  );
}

function markerColor(value: number) {
  const hue = 230 - value * 1.9;
  return `hsl(${hue}, 92%, ${42 + value * 0.13}%)`;
}

function datasetPreviewMetric(dataset: Dataset) {
  const immuneCells = dataset.cells.filter((cell) => cell.cellType === 'CD8 T cell' || cell.cellType === 'B cell').length;
  return Math.round((immuneCells / dataset.cells.length) * 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

function App() {
  const [datasets, setDatasets] = useState<Dataset[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return seedDatasets();

    try {
      return JSON.parse(stored) as Dataset[];
    } catch {
      return seedDatasets();
    }
  });
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [activeView, setActiveView] = useState<View>('hub');
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasets[0]?.id ?? '');
  const [compareIds, setCompareIds] = useState<[string, string]>([datasets[0]?.id ?? '', datasets[1]?.id ?? '']);
  const selectedDataset = datasets.find((dataset) => dataset.id === selectedDatasetId) ?? datasets[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));
  }, [datasets]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const visibleDatasets = useMemo(() => {
    if (!user) return datasets.filter((dataset) => dataset.visibility === 'public');
    if (user.role === 'Admin') return datasets;
    return datasets.filter(
      (dataset) => dataset.visibility === 'public' || dataset.contributorEmail === user.email,
    );
  }, [datasets, user]);

  const handleOpenDataset = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setActiveView('detail');
  };

  const handleCreateDataset = (dataset: Dataset) => {
    setDatasets((current) => [dataset, ...current]);
    setSelectedDatasetId(dataset.id);
    setActiveView('detail');
  };

  const handleUpdateDataset = (dataset: Dataset) => {
    setDatasets((current) => current.map((item) => (item.id === dataset.id ? dataset : item)));
  };

  const handleDeleteDataset = (datasetId: string) => {
    setDatasets((current) => current.filter((dataset) => dataset.id !== datasetId));
    if (selectedDatasetId === datasetId) {
      setSelectedDatasetId(datasets.find((dataset) => dataset.id !== datasetId)?.id ?? '');
    }
  };

  const stats = useMemo(
    () => ({
      datasets: datasets.length,
      cells: datasets.reduce((sum, dataset) => sum + dataset.cells.length, 0),
      markers: uniqueValues(datasets.flatMap((dataset) => dataset.markers)).length,
      cancerTypes: uniqueValues(datasets.map((dataset) => dataset.cancerType)).length,
    }),
    [datasets],
  );

  return (
    <div className="app-shell">
      <Header user={user} activeView={activeView} onNavigate={setActiveView} onLogout={() => setUser(null)} />

      <main>
        {activeView === 'hub' && selectedDataset && (
          <VisualizationHub
            datasets={visibleDatasets}
            selectedDataset={selectedDataset}
            stats={stats}
            user={user}
            onSelect={setSelectedDatasetId}
            onOpenDataset={handleOpenDataset}
            onNavigate={setActiveView}
            onLogin={setUser}
          />
        )}

        {activeView === 'explorer' && (
          <DatasetExplorer datasets={visibleDatasets} onOpenDataset={handleOpenDataset} />
        )}

        {activeView === 'detail' && selectedDataset && (
          <DatasetDetail
            dataset={selectedDataset}
            user={user}
            onUpdate={handleUpdateDataset}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'upload' && (
          <UploadPortal
            user={user}
            onLogin={setUser}
            onCreateDataset={handleCreateDataset}
          />
        )}

        {activeView === 'compare' && (
          <CompareView
            datasets={visibleDatasets}
            compareIds={compareIds}
            onCompareChange={setCompareIds}
          />
        )}

        {activeView === 'dashboard' && (
          <DataDashboard
            datasets={visibleDatasets}
            user={user}
            onOpenDataset={handleOpenDataset}
            onUpdate={handleUpdateDataset}
            onDelete={handleDeleteDataset}
            isAdmin={false}
          />
        )}

        {activeView === 'admin' && (
          <DataDashboard
            datasets={datasets}
            user={user}
            onOpenDataset={handleOpenDataset}
            onUpdate={handleUpdateDataset}
            onDelete={handleDeleteDataset}
            isAdmin
          />
        )}
      </main>
    </div>
  );
}

interface HeaderProps {
  user: User | null;
  activeView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

function Header({ user, activeView, onNavigate, onLogout }: HeaderProps) {
  const navItems: Array<{ view: View; label: string; icon: typeof Eye; roles?: Role[] }> = [
    { view: 'hub', label: 'Visualization Hub', icon: Sparkles },
    { view: 'explorer', label: 'Datasets', icon: Database },
    { view: 'compare', label: 'Compare', icon: GitCompare },
    { view: 'upload', label: 'Contribute', icon: UploadCloud, roles: ['Admin', 'Researcher'] },
    { view: 'dashboard', label: 'My Data', icon: Users, roles: ['Admin', 'Researcher', 'Viewer'] },
    { view: 'admin', label: 'Admin', icon: Shield, roles: ['Admin'] },
  ];

  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => onNavigate('hub')}>
        <span className="brand-mark">
          <Atom size={24} />
        </span>
        <span>
          <strong>Spatial TME Portal</strong>
          <small>Interactive tumor microenvironment atlas</small>
        </span>
      </button>

      <nav className="top-nav" aria-label="Primary navigation">
        {navItems
          .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
          .map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                className={activeView === item.view ? 'active' : ''}
                type="button"
                onClick={() => onNavigate(item.view)}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
      </nav>

      <div className="user-pill">
        {user ? (
          <>
            <span className={`role-dot ${user.role.toLowerCase()}`} />
            <span>
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
            <button className="icon-button" type="button" aria-label="Log out" onClick={onLogout}>
              <LogOut size={17} />
            </button>
          </>
        ) : (
          <>
            <Lock size={16} />
            <span>
              <strong>Guest explorer</strong>
              <small>Public datasets only</small>
            </span>
          </>
        )}
      </div>
    </header>
  );
}

interface VisualizationHubProps {
  datasets: Dataset[];
  selectedDataset: Dataset;
  stats: { datasets: number; cells: number; markers: number; cancerTypes: number };
  user: User | null;
  onSelect: (datasetId: string) => void;
  onOpenDataset: (datasetId: string) => void;
  onNavigate: (view: View) => void;
  onLogin: (user: User) => void;
}

function VisualizationHub({
  datasets,
  selectedDataset,
  stats,
  user,
  onSelect,
  onOpenDataset,
  onNavigate,
  onLogin,
}: VisualizationHubProps) {
  const featuredDatasets = datasets.slice(0, 3);

  return (
    <section className="page-section hub-grid">
      <div className="hero-panel">
        <div className="eyebrow">
          <Microscope size={16} />
          Visual-first spatial biology research portal
        </div>
        <h1>Explore tumor microenvironments as interactive scientific figures.</h1>
        <p>
          Browse public spatial datasets, inspect marker expression and cellular neighborhoods,
          compare studies side-by-side, and contribute visualization-ready data through a guided upload flow.
        </p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={() => onOpenDataset(selectedDataset.id)}>
            Open interactive viewer
          </button>
          <button className="secondary-button" type="button" onClick={() => onNavigate('upload')}>
            Contribute data
          </button>
        </div>
        <div className="stat-grid">
          <StatCard label="Datasets" value={stats.datasets.toLocaleString()} />
          <StatCard label="Cells rendered" value={stats.cells.toLocaleString()} />
          <StatCard label="Markers" value={stats.markers.toLocaleString()} />
          <StatCard label="Cancer types" value={stats.cancerTypes.toLocaleString()} />
        </div>
      </div>

      <div className="visual-priority-card">
        <div className="viewer-toolbar">
          <div>
            <span className="eyebrow">Featured viewer</span>
            <h2>{selectedDataset.title}</h2>
          </div>
          <select value={selectedDataset.id} onChange={(event) => onSelect(event.target.value)}>
            {datasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.title}
              </option>
            ))}
          </select>
        </div>
        <SpatialViewer dataset={selectedDataset} compact />
      </div>

      <div className="dataset-strip">
        {featuredDatasets.map((dataset) => (
          <DatasetPreviewCard key={dataset.id} dataset={dataset} onOpen={() => onOpenDataset(dataset.id)} />
        ))}
      </div>

      <AuthPanel user={user} onLogin={onLogin} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function AuthPanel({ user, onLogin }: { user: User | null; onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('Research Collaborator');
  const [email, setEmail] = useState('researcher@example.edu');
  const [role, setRole] = useState<Role>('Researcher');

  if (user) {
    return (
      <aside className="auth-card">
        <div className="card-heading">
          <Shield size={18} />
          <h3>Role-based workspace</h3>
        </div>
        <p>
          Signed in as <strong>{user.name}</strong>. Your <strong>{user.role}</strong> permissions determine
          which datasets you can contribute, manage, or moderate.
        </p>
        <div className="permission-list">
          <span><Eye size={15} /> Public exploration</span>
          {(user.role === 'Researcher' || user.role === 'Admin') && <span><FileUp size={15} /> Guided uploads</span>}
          {user.role === 'Admin' && <span><Shield size={15} /> Global moderation</span>}
        </div>
      </aside>
    );
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onLogin({ name, email, role });
  };

  return (
    <aside className="auth-card">
      <div className="card-heading">
        <Lock size={18} />
        <h3>{mode === 'login' ? 'Research login' : 'Create collaborator account'}</h3>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option>Admin</option>
            <option>Researcher</option>
            <option>Viewer</option>
          </select>
        </label>
        <button className="primary-button full-width" type="submit">
          {mode === 'login' ? 'Enter workspace' : 'Create account'}
        </button>
      </form>
      <button className="link-button" type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Already registered? Log in'}
      </button>
    </aside>
  );
}

function DatasetPreviewCard({ dataset, onOpen }: { dataset: Dataset; onOpen: () => void }) {
  const metric = datasetPreviewMetric(dataset);

  return (
    <article className="dataset-preview-card">
      <MiniPreview dataset={dataset} />
      <div>
        <span className="badge">{dataset.cancerType}</span>
        <h3>{dataset.title}</h3>
        <p>{dataset.description}</p>
        <div className="metadata-row">
          <span>{dataset.technique}</span>
          <span>{dataset.cells.length.toLocaleString()} cells</span>
          <span>{metric}% immune</span>
        </div>
        <button className="secondary-button" type="button" onClick={onOpen}>
          Explore dataset
        </button>
      </div>
    </article>
  );
}

function MiniPreview({ dataset }: { dataset: Dataset }) {
  return (
    <div className="mini-preview" aria-label={`Preview for ${dataset.title}`}>
      {dataset.cells.slice(0, 90).map((cell) => (
        <span
          key={cell.id}
          style={{
            left: `${cell.x}%`,
            top: `${cell.y}%`,
            background: cellTypeColors[cell.cellType],
            opacity: 0.72,
          }}
        />
      ))}
    </div>
  );
}

function DatasetExplorer({ datasets, onOpenDataset }: { datasets: Dataset[]; onOpenDataset: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [cancerType, setCancerType] = useState('All');
  const [technique, setTechnique] = useState('All');
  const [dateRange, setDateRange] = useState('All');
  const cancerOptions = ['All', ...uniqueValues(datasets.map((dataset) => dataset.cancerType))];
  const techniqueOptions = ['All', ...uniqueValues(datasets.map((dataset) => dataset.technique))];

  const filteredDatasets = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    const startYear = dateRange === 'All' ? null : Number(dateRange);

    return datasets.filter((dataset) => {
      const haystack = [
        dataset.title,
        dataset.description,
        dataset.location,
        dataset.cancerType,
        dataset.technique,
        dataset.contributor,
        ...dataset.tags,
      ]
        .join(' ')
        .toLowerCase();
      const matchesQuery = haystack.includes(normalizedQuery);
      const matchesCancer = cancerType === 'All' || dataset.cancerType === cancerType;
      const matchesTechnique = technique === 'All' || dataset.technique === technique;
      const matchesDate = !startYear || new Date(dataset.studyDate).getFullYear() >= startYear;

      return matchesQuery && matchesCancer && matchesTechnique && matchesDate;
    });
  }, [datasets, query, cancerType, technique, dateRange]);

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <Database size={16} />
            Dataset explorer
          </span>
          <h1>Browse studies by cancer type, marker panel, technique, or contributor.</h1>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search keywords, location, tags..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="filter-bar">
        <FilterSelect label="Cancer type" value={cancerType} options={cancerOptions} onChange={setCancerType} />
        <FilterSelect label="Technique" value={technique} options={techniqueOptions} onChange={setTechnique} />
        <FilterSelect
          label="Study date"
          value={dateRange}
          options={['All', '2026', '2025', '2024']}
          onChange={setDateRange}
        />
      </div>

      <div className="dataset-grid">
        {filteredDatasets.map((dataset) => (
          <article className="dataset-card" key={dataset.id}>
            <MiniPreview dataset={dataset} />
            <div className="dataset-card-content">
              <div className="dataset-card-topline">
                <span className="badge">{dataset.cancerType}</span>
                <span className={`visibility ${dataset.visibility}`}>
                  {dataset.visibility === 'public' ? <Globe2 size={14} /> : <Lock size={14} />}
                  {dataset.visibility}
                </span>
              </div>
              <h2>{dataset.title}</h2>
              <p>{dataset.description}</p>
              <div className="tag-row">
                {dataset.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="metadata-grid">
                <span><strong>{dataset.technique}</strong> technique</span>
                <span><strong>{dataset.markers.length}</strong> markers</span>
                <span><strong>{dataset.cells.length.toLocaleString()}</strong> cells</span>
                <span><strong>{formatDate(dataset.studyDate)}</strong> study date</span>
              </div>
              <button className="primary-button" type="button" onClick={() => onOpenDataset(dataset.id)}>
                Open visualization
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="filter-select">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function DatasetDetail({
  dataset,
  user,
  onUpdate,
  onNavigate,
}: {
  dataset: Dataset;
  user: User | null;
  onUpdate: (dataset: Dataset) => void;
  onNavigate: (view: View) => void;
}) {
  const [note, setNote] = useState('');

  const handleComment = (event: FormEvent) => {
    event.preventDefault();
    if (!user || note.trim() === '') return;

    onUpdate({
      ...dataset,
      comments: [
        ...dataset.comments,
        {
          id: `comment-${Date.now()}`,
          author: user.name,
          role: user.role,
          note: note.trim(),
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
    });
    setNote('');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#dataset=${dataset.id}`;
    await navigator.clipboard?.writeText(url);
  };

  return (
    <section className="page-section detail-layout">
      <div className="detail-main">
        <div className="viewer-toolbar">
          <div>
            <span className="eyebrow">
              <MapIcon size={16} />
              Dataset detail
            </span>
            <h1>{dataset.title}</h1>
          </div>
          <div className="toolbar-actions">
            <button className="secondary-button" type="button" onClick={() => onNavigate('compare')}>
              Compare
            </button>
            <button className="secondary-button" type="button" onClick={handleShare}>
              Share link
            </button>
          </div>
        </div>
        <SpatialViewer dataset={dataset} />
      </div>

      <aside className="metadata-sidebar">
        <section className="sidebar-card">
          <h2>Study metadata</h2>
          <dl>
            <div>
              <dt>Cancer type</dt>
              <dd>{dataset.cancerType}</dd>
            </div>
            <div>
              <dt>Technique</dt>
              <dd>{dataset.technique}</dd>
            </div>
            <div>
              <dt>Study date</dt>
              <dd>{formatDate(dataset.studyDate)}</dd>
            </div>
            <div>
              <dt>Data source</dt>
              <dd>{dataset.location}</dd>
            </div>
            <div>
              <dt>Contributor</dt>
              <dd>{dataset.contributor}</dd>
            </div>
          </dl>
          <h3>Methods</h3>
          <p>{dataset.methods}</p>
        </section>

        <section className="sidebar-card">
          <h2>Notes</h2>
          <div className="comment-list">
            {dataset.comments.length === 0 && <p className="muted">No notes have been added yet.</p>}
            {dataset.comments.map((comment) => (
              <article key={comment.id} className="comment">
                <strong>{comment.author}</strong>
                <small>{comment.role} · {formatDate(comment.createdAt)}</small>
                <p>{comment.note}</p>
              </article>
            ))}
          </div>
          {user ? (
            <form className="comment-form" onSubmit={handleComment}>
              <textarea
                placeholder="Add a scientific note, observation, or review comment..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <button className="primary-button" type="submit">
                <MessageSquare size={16} />
                Add note
              </button>
            </form>
          ) : (
            <p className="muted">Sign in to add comments or collaborator notes.</p>
          )}
        </section>
      </aside>
    </section>
  );
}

function SpatialViewer({ dataset, compact = false }: { dataset: Dataset; compact?: boolean }) {
  const [selectedMarker, setSelectedMarker] = useState(dataset.markers[0]);
  const [selectedCell, setSelectedCell] = useState<CellPoint | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [threshold, setThreshold] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [visibleLayers, setVisibleLayers] = useState<Record<CellType, boolean>>(() =>
    dataset.cellTypes.reduce<Record<CellType, boolean>>((layers, cellType) => {
      layers[cellType] = true;
      return layers;
    }, {} as Record<CellType, boolean>),
  );

  useEffect(() => {
    setSelectedMarker(dataset.markers[0]);
    setSelectedCell(null);
    setVisibleLayers(
      dataset.cellTypes.reduce<Record<CellType, boolean>>((layers, cellType) => {
        layers[cellType] = true;
        return layers;
      }, {} as Record<CellType, boolean>),
    );
  }, [dataset]);

  const filteredCells = useMemo(
    () =>
      dataset.cells.filter(
        (cell) => visibleLayers[cell.cellType] && (cell.markerValues[selectedMarker] ?? 0) >= threshold,
      ),
    [dataset.cells, selectedMarker, threshold, visibleLayers],
  );

  const heatmap = useMemo(() => {
    const gridSize = compact ? 8 : 10;
    const cells = Array.from({ length: gridSize * gridSize }, (_, index) => ({
      id: index,
      x: index % gridSize,
      y: Math.floor(index / gridSize),
      total: 0,
      count: 0,
    }));

    dataset.cells.forEach((cell) => {
      const x = Math.min(gridSize - 1, Math.floor((cell.x / 100) * gridSize));
      const y = Math.min(gridSize - 1, Math.floor((cell.y / 100) * gridSize));
      const bucket = cells[y * gridSize + x];
      bucket.total += cell.markerValues[selectedMarker] ?? 0;
      bucket.count += 1;
    });

    return cells.map((cell) => ({
      ...cell,
      value: cell.count > 0 ? cell.total / cell.count : 0,
      size: 100 / gridSize,
    }));
  }, [compact, dataset.cells, selectedMarker]);

  const viewSize = 100 / zoom;
  const viewX = clamp((100 - viewSize) / 2 + pan.x, 0, 100 - viewSize);
  const viewY = clamp((100 - viewSize) / 2 + pan.y, 0, 100 - viewSize);

  const countsByType = useMemo(
    () =>
      dataset.cellTypes.map((cellType) => ({
        cellType,
        count: dataset.cells.filter((cell) => cell.cellType === cellType).length,
      })),
    [dataset.cellTypes, dataset.cells],
  );

  return (
    <div className={compact ? 'spatial-viewer compact' : 'spatial-viewer'}>
      <div className="visualization-frame">
        <svg viewBox={`${viewX} ${viewY} ${viewSize} ${viewSize}`} role="img" aria-label={`Spatial plot for ${dataset.title}`}>
          <defs>
            <filter id={`glow-${dataset.id}`}>
              <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="100" height="100" rx="4" fill="#091521" />

          {showHeatmap &&
            heatmap.map((bucket) => (
              <rect
                key={bucket.id}
                x={bucket.x * bucket.size}
                y={bucket.y * bucket.size}
                width={bucket.size}
                height={bucket.size}
                fill={markerColor(bucket.value)}
                opacity={bucket.count === 0 ? 0 : clamp(bucket.value / 120, 0.12, 0.62)}
              />
            ))}

          {showRegions &&
            dataset.regions.map((region) => (
              <polygon
                key={region.id}
                points={region.polygon.map(([x, y]) => `${x},${y}`).join(' ')}
                fill={region.color}
                opacity="0.09"
                stroke={region.color}
                strokeDasharray="1.5 1.2"
                strokeWidth="0.45"
              />
            ))}

          {filteredCells.map((cell) => {
            const value = cell.markerValues[selectedMarker] ?? 0;
            return (
              <circle
                key={cell.id}
                cx={cell.x}
                cy={cell.y}
                r={compact ? 0.62 : selectedCell?.id === cell.id ? 1.45 : 0.82}
                fill={markerColor(value)}
                stroke={cellTypeColors[cell.cellType]}
                strokeWidth={selectedCell?.id === cell.id ? 0.65 : 0.26}
                opacity={0.62 + value / 270}
                filter={selectedCell?.id === cell.id ? `url(#glow-${dataset.id})` : undefined}
                onClick={() => setSelectedCell(cell)}
              />
            );
          })}
        </svg>

        <div className="viewer-overlay top-left">
          <strong>{filteredCells.length.toLocaleString()}</strong>
          <span>visible cells</span>
        </div>
        <div className="viewer-overlay bottom-right">
          <strong>{selectedMarker}</strong>
          <span>marker intensity</span>
        </div>
      </div>

      <div className="viewer-controls">
        <div className="control-section">
          <h3><SlidersHorizontal size={16} /> Marker / feature</h3>
          <select value={selectedMarker} onChange={(event) => setSelectedMarker(event.target.value)}>
            {dataset.markers.map((marker) => (
              <option key={marker}>{marker}</option>
            ))}
          </select>
          <label className="range-control">
            Expression threshold: {threshold}
            <input
              type="range"
              min="0"
              max="95"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="control-section">
          <h3><Layers size={16} /> Layers</h3>
          <div className="layer-list">
            {countsByType.map(({ cellType, count }) => (
              <label key={cellType} className="layer-toggle">
                <input
                  type="checkbox"
                  checked={visibleLayers[cellType]}
                  onChange={(event) =>
                    setVisibleLayers((layers) => ({ ...layers, [cellType]: event.target.checked }))
                  }
                />
                <span style={{ background: cellTypeColors[cellType] }} />
                {cellType}
                <small>{count}</small>
              </label>
            ))}
          </div>
          <label className="switch-row">
            <input type="checkbox" checked={showHeatmap} onChange={(event) => setShowHeatmap(event.target.checked)} />
            Heatmap overlay
          </label>
          <label className="switch-row">
            <input type="checkbox" checked={showRegions} onChange={(event) => setShowRegions(event.target.checked)} />
            Region annotations
          </label>
        </div>

        {!compact && (
          <>
            <div className="control-section">
              <h3>Viewport</h3>
              <label className="range-control">
                Zoom: {zoom.toFixed(1)}x
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
              </label>
              <div className="pan-grid">
                <button type="button" onClick={() => setPan((current) => ({ ...current, y: current.y - 8 }))}>Up</button>
                <button type="button" onClick={() => setPan((current) => ({ ...current, x: current.x - 8 }))}>Left</button>
                <button type="button" onClick={() => setPan({ x: 0, y: 0 })}>Reset</button>
                <button type="button" onClick={() => setPan((current) => ({ ...current, x: current.x + 8 }))}>Right</button>
                <button type="button" onClick={() => setPan((current) => ({ ...current, y: current.y + 8 }))}>Down</button>
              </div>
            </div>

            <div className="control-section selected-cell-card">
              <h3>Selected cell metadata</h3>
              {selectedCell ? (
                <>
                  <strong>{selectedCell.cellType}</strong>
                  <span>{selectedCell.region}</span>
                  <dl>
                    <div><dt>X/Y</dt><dd>{selectedCell.x}, {selectedCell.y}</dd></div>
                    {dataset.markers.map((marker) => (
                      <div key={marker}>
                        <dt>{marker}</dt>
                        <dd>{selectedCell.markerValues[marker] ?? 0}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <p className="muted">Click a cell to inspect coordinates, classification, region, and marker values.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UploadPortal({
  user,
  onLogin,
  onCreateDataset,
}: {
  user: User | null;
  onLogin: (user: User) => void;
  onCreateDataset: (dataset: Dataset) => void;
}) {
  const [metadata, setMetadata] = useState({
    title: 'New spatial TME study',
    cancerType: 'Melanoma',
    technique: 'IMC',
    studyDate: new Date().toISOString().slice(0, 10),
    location: 'Research cohort',
    description: 'Spatial dataset contributed through the guided upload portal.',
    methods: 'Uploaded cell coordinate table with marker expression and cell classifications.',
    tags: 'spatial, tumor microenvironment',
    visibility: 'private' as Visibility,
  });
  const [rows, setRows] = useState<UploadedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [fileMessage, setFileMessage] = useState('CSV, GeoJSON, JSON, Excel, and shapefile packages are accepted.');
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState({ x: '', y: '', label: '', region: '' });

  if (!user) {
    return (
      <section className="page-section upload-gate">
        <div className="hero-panel narrow">
          <span className="eyebrow">
            <Lock size={16} />
            Authentication required
          </span>
          <h1>Sign in to contribute spatial datasets.</h1>
          <p>
            Researchers and administrators can upload data, map columns, add study metadata, and publish
            visualization-ready spatial figures. Viewers can explore public studies after signing in.
          </p>
        </div>
        <AuthPanel user={user} onLogin={onLogin} />
      </section>
    );
  }

  if (user.role === 'Viewer') {
    return (
      <section className="page-section">
        <div className="empty-state">
          <Lock size={28} />
          <h1>Viewer accounts cannot upload datasets.</h1>
          <p>Ask an administrator to upgrade your role to Researcher if you need contribution access.</p>
        </div>
      </section>
    );
  }

  const updateMetadata = (key: keyof typeof metadata, value: string) => {
    setMetadata((current) => ({ ...current, [key]: value }));
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const accepted = ['csv', 'geojson', 'json', 'xlsx', 'xls', 'zip', 'shp'];
    if (!accepted.includes(extension)) {
      setFileMessage('Unsupported file type. Upload CSV, GeoJSON, JSON, Excel, or shapefile archives.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileMessage('File is larger than the 25 MB client-side safety limit for this demo.');
      return;
    }

    setFileName(file.name);

    if (['xlsx', 'xls', 'zip', 'shp'].includes(extension)) {
      setRows([]);
      setColumns([]);
      setFileMessage(
        'File registered. Binary Excel and shapefile parsing would be handled by the backend import worker in production.',
      );
      return;
    }

    try {
      const text = await file.text();
      const parsedRows = extension === 'csv' ? parseCsv(text) : parseGeoJson(text);
      const parsedColumns = Object.keys(parsedRows[0] ?? {});
      setRows(parsedRows);
      setColumns(parsedColumns);
      setMapping({
        x: detectColumn(parsedColumns, ['x', 'coordx', 'centroidx', 'longitude', 'lon']) ?? parsedColumns[0] ?? '',
        y: detectColumn(parsedColumns, ['y', 'coordy', 'centroidy', 'latitude', 'lat']) ?? parsedColumns[1] ?? '',
        label: detectColumn(parsedColumns, ['celltype', 'classification', 'label', 'phenotype']) ?? '',
        region: detectColumn(parsedColumns, ['region', 'annotation', 'zone']) ?? '',
      });
      setFileMessage(`Parsed ${parsedRows.length.toLocaleString()} records and detected ${parsedColumns.length} columns.`);
    } catch {
      setFileMessage('Could not parse this file. Check that it is valid CSV or GeoJSON.');
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const dataset = rows.length > 0 && mapping.x && mapping.y
      ? datasetFromRows(rows, columns, mapping, metadata, user)
      : datasetFromTemplate(metadata, user);
    onCreateDataset(dataset);
  };

  return (
    <section className="page-section upload-layout">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <UploadCloud size={16} />
            Guided contribution flow
          </span>
          <h1>Upload, map, and publish visualization-ready spatial biology data.</h1>
        </div>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <section className="form-card">
          <h2>1. Upload files</h2>
          <label className="file-drop">
            <FileUp size={28} />
            <strong>{fileName || 'Choose spatial data file'}</strong>
            <span>{fileMessage}</span>
            <input type="file" accept=".csv,.geojson,.json,.xlsx,.xls,.zip,.shp" onChange={handleFile} />
          </label>
        </section>

        <section className="form-card">
          <h2>2. Map coordinate and feature columns</h2>
          {columns.length > 0 ? (
            <div className="mapping-grid">
              <FilterSelect label="X coordinate" value={mapping.x} options={columns} onChange={(value) => setMapping((current) => ({ ...current, x: value }))} />
              <FilterSelect label="Y coordinate" value={mapping.y} options={columns} onChange={(value) => setMapping((current) => ({ ...current, y: value }))} />
              <FilterSelect label="Cell classification" value={mapping.label} options={['', ...columns]} onChange={(value) => setMapping((current) => ({ ...current, label: value }))} />
              <FilterSelect label="Region annotation" value={mapping.region} options={['', ...columns]} onChange={(value) => setMapping((current) => ({ ...current, region: value }))} />
            </div>
          ) : (
            <p className="muted">
              Upload a CSV or GeoJSON file to map columns. If no parseable table is supplied, the portal creates
              a visualization-ready template dataset for backend import review.
            </p>
          )}
        </section>

        <section className="form-card">
          <h2>3. Study metadata</h2>
          <div className="metadata-form-grid">
            <label>
              Study name
              <input value={metadata.title} onChange={(event) => updateMetadata('title', event.target.value)} required />
            </label>
            <label>
              Cancer type
              <select value={metadata.cancerType} onChange={(event) => updateMetadata('cancerType', event.target.value)}>
                {cancerTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              Technique
              <select value={metadata.technique} onChange={(event) => updateMetadata('technique', event.target.value)}>
                {techniques.map((technique) => <option key={technique}>{technique}</option>)}
              </select>
            </label>
            <label>
              Study date
              <input type="date" value={metadata.studyDate} onChange={(event) => updateMetadata('studyDate', event.target.value)} />
            </label>
            <label>
              Location / cohort
              <input value={metadata.location} onChange={(event) => updateMetadata('location', event.target.value)} />
            </label>
            <label>
              Tags
              <input value={metadata.tags} onChange={(event) => updateMetadata('tags', event.target.value)} />
            </label>
            <label>
              Visibility
              <select value={metadata.visibility} onChange={(event) => updateMetadata('visibility', event.target.value)}>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea value={metadata.description} onChange={(event) => updateMetadata('description', event.target.value)} />
          </label>
          <label>
            Methods
            <textarea value={metadata.methods} onChange={(event) => updateMetadata('methods', event.target.value)} />
          </label>
        </section>

        <button className="primary-button submit-button" type="submit">
          Create interactive dataset
        </button>
      </form>

      <aside className="upload-aside">
        <h2>Supported spatial data types</h2>
        <ul>
          <li>Cell coordinate tables with x/y positions</li>
          <li>Marker expression matrices for proteins or genes</li>
          <li>Cell classifications such as tumor, immune, or stromal</li>
          <li>Region annotations including tumor boundary and TME zones</li>
        </ul>
        <div className="pipeline-card">
          <strong>Production-ready path</strong>
          <p>
            The client-side flow is structured so a FastAPI/PostGIS backend can validate files, store metadata,
            queue large imports, and emit optimized JSON or binary tiles for WebGL rendering.
          </p>
        </div>
      </aside>
    </section>
  );
}

function datasetFromRows(
  rows: UploadedRow[],
  columns: string[],
  mapping: { x: string; y: string; label: string; region: string },
  metadata: {
    title: string;
    cancerType: string;
    technique: string;
    studyDate: string;
    location: string;
    description: string;
    methods: string;
    tags: string;
    visibility: Visibility;
  },
  user: User,
): Dataset {
  const numericColumns = columns.filter(
    (column) =>
      ![mapping.x, mapping.y, mapping.label, mapping.region].includes(column) &&
      rows.some((row) => typeof row[column] === 'number'),
  );
  const markers = numericColumns.slice(0, 8).length > 0 ? numericColumns.slice(0, 8) : defaultMarkers;
  const xValues = rows.map((row) => Number(row[mapping.x])).filter(Number.isFinite);
  const yValues = rows.map((row) => Number(row[mapping.y])).filter(Number.isFinite);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const scale = (value: number, min: number, max: number) => (max === min ? 50 : ((value - min) / (max - min)) * 96 + 2);

  const cells = rows.slice(0, 2000).map<CellPoint>((row, index) => {
    const x = scale(Number(row[mapping.x]), minX, maxX);
    const y = scale(Number(row[mapping.y]), minY, maxY);
    const region = normalizeRegion(String(row[mapping.region] ?? regionFromPoint(x, y)));
    const cellType = normalizeCellType(String(row[mapping.label] ?? weightedCellType(region, seededRandom(index + 9))));
    const markerValues = markers.reduce<Record<string, number>>((values, marker) => {
      const value = Number(row[marker]);
      values[marker] = Number.isFinite(value) ? clamp(Math.round(value), 0, 100) : Math.round(expressionValue(marker, cellType, region, seededRandom(index + 17)));
      return values;
    }, {});

    return {
      id: `uploaded-cell-${Date.now()}-${index}`,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      cellType,
      region,
      markerValues,
    };
  });

  return {
    ...baseDataset(metadata, user, markers),
    cells,
    cellTypes: uniqueValues(cells.map((cell) => cell.cellType)),
  };
}

function datasetFromTemplate(
  metadata: {
    title: string;
    cancerType: string;
    technique: string;
    studyDate: string;
    location: string;
    description: string;
    methods: string;
    tags: string;
    visibility: Visibility;
  },
  user: User,
): Dataset {
  return {
    ...baseDataset(metadata, user, defaultMarkers),
    cells: makeCells(Date.now() % 997, 360),
    cellTypes: ['Tumor', 'CD8 T cell', 'Macrophage', 'Stromal', 'B cell', 'Endothelial'],
  };
}

function baseDataset(
  metadata: {
    title: string;
    cancerType: string;
    technique: string;
    studyDate: string;
    location: string;
    description: string;
    methods: string;
    tags: string;
    visibility: Visibility;
  },
  user: User,
  markers: string[],
): Omit<Dataset, 'cells' | 'cellTypes'> {
  return {
    id: `${metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    title: metadata.title,
    cancerType: metadata.cancerType,
    technique: metadata.technique,
    studyDate: metadata.studyDate,
    location: metadata.location,
    description: metadata.description,
    methods: metadata.methods,
    contributor: user.name,
    contributorEmail: user.email,
    visibility: metadata.visibility,
    tags: metadata.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    markers,
    regions: buildRegions(),
    comments: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

function normalizeCellType(value: string): CellType {
  const normalized = value.toLowerCase();
  if (normalized.includes('cd8') || normalized.includes('t cell')) return 'CD8 T cell';
  if (normalized.includes('macro') || normalized.includes('myeloid')) return 'Macrophage';
  if (normalized.includes('strom')) return 'Stromal';
  if (normalized.includes('b cell')) return 'B cell';
  if (normalized.includes('endo') || normalized.includes('vascular')) return 'Endothelial';
  return 'Tumor';
}

function normalizeRegion(value: string): RegionType {
  const normalized = value.toLowerCase();
  if (normalized.includes('margin') || normalized.includes('invasive')) return 'Invasive margin';
  if (normalized.includes('immune')) return 'Immune niche';
  if (normalized.includes('stroma')) return 'Stroma';
  return 'Tumor core';
}

function CompareView({
  datasets,
  compareIds,
  onCompareChange,
}: {
  datasets: Dataset[];
  compareIds: [string, string];
  onCompareChange: (ids: [string, string]) => void;
}) {
  const first = datasets.find((dataset) => dataset.id === compareIds[0]) ?? datasets[0];
  const second = datasets.find((dataset) => dataset.id === compareIds[1]) ?? datasets[1] ?? datasets[0];

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <GitCompare size={16} />
            Dataset comparison
          </span>
          <h1>Compare spatial organization, marker intensity, and cellular composition across studies.</h1>
        </div>
      </div>

      <div className="compare-selectors">
        <FilterSelect
          label="Left dataset"
          value={first?.id ?? ''}
          options={datasets.map((dataset) => dataset.id)}
          onChange={(id) => onCompareChange([id, second?.id ?? id])}
        />
        <FilterSelect
          label="Right dataset"
          value={second?.id ?? ''}
          options={datasets.map((dataset) => dataset.id)}
          onChange={(id) => onCompareChange([first?.id ?? id, id])}
        />
      </div>

      <div className="compare-grid">
        {[first, second].filter(Boolean).map((dataset) => (
          <article className="compare-panel" key={dataset.id}>
            <div className="compare-heading">
              <h2>{dataset.title}</h2>
              <div className="metadata-row">
                <span>{dataset.cancerType}</span>
                <span>{dataset.technique}</span>
                <span>{dataset.cells.length.toLocaleString()} cells</span>
              </div>
            </div>
            <SpatialViewer dataset={dataset} compact />
            <CompositionBars dataset={dataset} />
          </article>
        ))}
      </div>
    </section>
  );
}

function CompositionBars({ dataset }: { dataset: Dataset }) {
  const total = dataset.cells.length;
  const counts = dataset.cellTypes.map((cellType) => ({
    cellType,
    value: dataset.cells.filter((cell) => cell.cellType === cellType).length,
  }));

  return (
    <div className="composition-bars">
      {counts.map(({ cellType, value }) => (
        <div key={cellType}>
          <span>{cellType}</span>
          <div className="bar-track">
            <span
              style={{
                width: `${(value / total) * 100}%`,
                background: cellTypeColors[cellType],
              }}
            />
          </div>
          <small>{Math.round((value / total) * 100)}%</small>
        </div>
      ))}
    </div>
  );
}

function DataDashboard({
  datasets,
  user,
  onOpenDataset,
  onUpdate,
  onDelete,
  isAdmin,
}: {
  datasets: Dataset[];
  user: User | null;
  onOpenDataset: (id: string) => void;
  onUpdate: (dataset: Dataset) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const managedDatasets = useMemo(() => {
    if (!user) return [];
    if (isAdmin && user.role === 'Admin') return datasets;
    return datasets.filter((dataset) => dataset.contributorEmail === user.email);
  }, [datasets, isAdmin, user]);

  if (!user) {
    return (
      <section className="page-section">
        <div className="empty-state">
          <Lock size={28} />
          <h1>Sign in to manage datasets.</h1>
          <p>The dashboard shows your submissions, sharing status, and collaboration activity.</p>
        </div>
      </section>
    );
  }

  if (isAdmin && user.role !== 'Admin') {
    return (
      <section className="page-section">
        <div className="empty-state">
          <Shield size={28} />
          <h1>Admin access required.</h1>
          <p>Only administrators can moderate all datasets.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {isAdmin ? <Shield size={16} /> : <Users size={16} />}
            {isAdmin ? 'Admin dashboard' : 'Data management dashboard'}
          </span>
          <h1>{isAdmin ? 'Moderate all spatial studies.' : 'View, edit, and delete your spatial submissions.'}</h1>
        </div>
      </div>

      <div className="management-table">
        {managedDatasets.length === 0 && (
          <div className="empty-state inline">
            <Database size={24} />
            <h2>No managed datasets yet.</h2>
            <p>Use the contribution flow to create your first spatial study.</p>
          </div>
        )}
        {managedDatasets.map((dataset) => (
          <article key={dataset.id} className="management-row">
            <MiniPreview dataset={dataset} />
            <div>
              <span className="badge">{dataset.cancerType}</span>
              <h2>{dataset.title}</h2>
              <p>{dataset.description}</p>
              <div className="metadata-row">
                <span>{dataset.contributor}</span>
                <span>{dataset.visibility}</span>
                <span>{dataset.comments.length} notes</span>
              </div>
            </div>
            <div className="row-actions">
              <button className="secondary-button" type="button" onClick={() => onOpenDataset(dataset.id)}>
                <Eye size={15} />
                View
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => onUpdate({ ...dataset, visibility: dataset.visibility === 'public' ? 'private' : 'public' })}
              >
                <Pencil size={15} />
                Make {dataset.visibility === 'public' ? 'private' : 'public'}
              </button>
              <button className="danger-button" type="button" onClick={() => onDelete(dataset.id)}>
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default App;
