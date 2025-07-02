import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 🚀 DOJUKU SHINGI - Démarrage avec diagnostic complet
console.log('🚀 DOJUKU SHINGI 道塾 信義 - Démarrage de l\'application');
console.log('🏯 Le sanctuaire numérique de l\'excellence martiale');
console.log('📅 Version:', new Date().toISOString());

// 🔍 DIAGNOSTIC CRITIQUE des variables d'environnement
console.log('🔍 Variables d\'environnement critiques DOJUKU SHINGI:');

// Firebase
const firebaseVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
};

console.log('🔥 Firebase DOJUKU SHINGI:');
console.log('- API Key:', firebaseVars.apiKey ? `${firebaseVars.apiKey.substring(0, 10)}...` : '❌ MANQUANTE');
console.log('- Project ID:', firebaseVars.projectId || '❌ MANQUANT');
console.log('- App ID:', firebaseVars.appId ? `${firebaseVars.appId.substring(0, 20)}...` : '❌ MANQUANT');
console.log('- Messaging Sender ID:', firebaseVars.messagingSenderId || '❌ MANQUANT');

// Validation spécifique DOJUKU SHINGI
if (firebaseVars.apiKey === 'AIzaSyAgf6fsn2G8oSwEH3DIWCENaqJ3FAUn_QA') {
  console.log('✅ Clé API Firebase DOJUKU SHINGI correcte');
} else {
  console.error('❌ Clé API Firebase DOJUKU SHINGI incorrecte ou manquante');
}

if (firebaseVars.projectId === 'dojuku-shingi') {
  console.log('✅ Project ID DOJUKU SHINGI correct');
} else {
  console.error('❌ Project ID DOJUKU SHINGI incorrect ou manquant');
}

if (firebaseVars.appId === '1:1038616772699:web:f7f5edc1e014d65caf7f7e') {
  console.log('✅ App ID DOJUKU SHINGI correct');
} else {
  console.error('❌ App ID DOJUKU SHINGI incorrect ou manquant');
}

// Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
console.log('💳 Stripe:');
console.log('- Public Key:', stripeKey ? (stripeKey.includes('REMPLACEZ') ? '⚠️ CLÉ DE DÉMO' : '✅ Présente') : '❌ MANQUANTE');

// Vérification des clés de démo
let hasDemo = false;

if (firebaseVars.apiKey?.includes('Demo') || firebaseVars.apiKey?.includes('REMPLACEZ')) {
  console.error('🚨 CLÉ FIREBASE DE DÉMO DÉTECTÉE - REMPLACEZ IMMÉDIATEMENT');
  hasDemo = true;
}

if (stripeKey?.includes('REMPLACEZ')) {
  console.error('🚨 CLÉ STRIPE DE DÉMO DÉTECTÉE - REMPLACEZ IMMÉDIATEMENT');
  hasDemo = true;
}

// Résumé de l'état
if (!hasDemo && firebaseVars.apiKey && firebaseVars.projectId && firebaseVars.appId) {
  console.log('🎯 DOJUKU SHINGI PRÊT POUR LA PRODUCTION');
} else {
  console.error('🚨 DOJUKU SHINGI NON PRÊT - ERREURS DE CONFIGURATION');
}

console.log('🔗 Domaine cible: dojuku-shingi.com');
console.log('📊 Projet Firebase: dojuku-shingi (ID: 1038616772699)');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);