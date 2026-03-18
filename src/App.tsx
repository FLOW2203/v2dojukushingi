import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './components/games/LoadingScreen';

// Lazy-loaded pages and games
const GamesHub = lazy(() => import('./pages/GamesHub'));
const KanjiStroke = lazy(() => import('./games/KanjiStroke'));
const HanziMaster = lazy(() => import('./games/HanziMaster'));
const HangulDojo = lazy(() => import('./games/HangulDojo'));
const ChuVo = lazy(() => import('./games/ChuVo'));
const CalliFlow = lazy(() => import('./games/CalliFlow'));
const StrokeRace = lazy(() => import('./games/StrokeRace'));
const StanceName = lazy(() => import('./games/StanceName'));
const StanceMatch = lazy(() => import('./games/StanceMatch'));
const SenseiSays = lazy(() => import('./games/SenseiSays'));
const KataSequence = lazy(() => import('./games/KataSequence'));
const TechniqueSort = lazy(() => import('./games/TechniqueSort'));
const MasterOrMyth = lazy(() => import('./games/MasterOrMyth'));
const DojoBuild = lazy(() => import('./games/DojoBuild'));
const MasterVoice = lazy(() => import('./games/MasterVoice'));
const BeltPath = lazy(() => import('./games/BeltPath'));
const CultureConnect = lazy(() => import('./games/CultureConnect'));
const TimelineWarrior = lazy(() => import('./games/TimelineWarrior'));
const ZenBreath = lazy(() => import('./games/ZenBreath'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Navigate to="/games" replace />} />
          <Route path="/games" element={<GamesHub />} />

          {/* Tier 1 — Writing/Calligraphy */}
          <Route path="/games/kanji-stroke" element={<KanjiStroke />} />
          <Route path="/games/hanzi-master" element={<HanziMaster />} />
          <Route path="/games/hangul-dojo" element={<HangulDojo />} />
          <Route path="/games/chu-vo" element={<ChuVo />} />
          <Route path="/games/calli-flow" element={<CalliFlow />} />
          <Route path="/games/stroke-race" element={<StrokeRace />} />

          {/* Tier 2 — Positions/Techniques */}
          <Route path="/games/stance-name" element={<StanceName />} />
          <Route path="/games/stance-match" element={<StanceMatch />} />
          <Route path="/games/sensei-says" element={<SenseiSays />} />
          <Route path="/games/kata-sequence" element={<KataSequence />} />
          <Route path="/games/technique-sort" element={<TechniqueSort />} />
          <Route path="/games/master-or-myth" element={<MasterOrMyth />} />

          {/* Tier 3 — Culture */}
          <Route path="/games/dojo-build" element={<DojoBuild />} />
          <Route path="/games/master-voice" element={<MasterVoice />} />
          <Route path="/games/belt-path" element={<BeltPath />} />
          <Route path="/games/culture-connect" element={<CultureConnect />} />
          <Route path="/games/timeline-warrior" element={<TimelineWarrior />} />
          <Route path="/games/zen-breath" element={<ZenBreath />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/games" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
