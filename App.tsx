import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/auth/AuthProvider';
import { Layout } from './components/layout/Layout';
import { DojoHome } from './pages/DojoHome';
import { KataRecorder } from './pages/KataRecorder';
import { CombatArena } from './pages/CombatArena';
import { RewardsHub } from './pages/RewardsHub';
import { Profile } from './pages/Profile';
import { Contest } from './pages/Contest';
import { Social } from './pages/Social';
import { ImpactSocial } from './pages/ImpactSocial';
import { useLanguage } from './hooks/useLanguage';
import { OfflineIndicator } from './components/ui/OfflineIndicator';

function App() {
  const { language, changeLanguage } = useLanguage();

  return (
    <AuthProvider>
      <Router>
        <Layout language={language} onLanguageChange={changeLanguage}>
          <Routes>
            <Route path="/" element={<DojoHome language={language} />} />
            <Route path="/kata-dojo" element={<KataRecorder language={language} />} />
            <Route path="/combat-shingi" element={<CombatArena language={language} />} />
            <Route path="/rewards" element={<RewardsHub language={language} />} />
            <Route path="/voie-progression" element={<Profile language={language} />} />
            <Route path="/concours-japon" element={<Contest language={language} />} />
            <Route path="/social" element={<Social language={language} />} />
            <Route path="/impact-social" element={<ImpactSocial language={language} />} />
          </Routes>
        </Layout>
        
        {/* Indicateur hors ligne */}
        <OfflineIndicator />
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--blanc-juku)',
              color: 'var(--noir-do)',
              border: '1px solid var(--or-dojuku)',
            },
            success: {
              iconTheme: {
                primary: 'var(--or-dojuku)',
                secondary: 'var(--blanc-juku)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--rouge-shingi)',
                secondary: 'var(--blanc-juku)',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;