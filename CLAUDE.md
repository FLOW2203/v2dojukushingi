# V2DOJUKUSHINGI — Claude Code Project Config

## Identite
- Projet: DOJUKU SHINGI v2 (jeux educatifs)
- Groupe: ONLYMORE Group
- CEO: Florent Gibert
- GitHub: FLOW2203/v2dojukushingi

## Regles absolues
- Supabase ref = `cbmasgbbhmunzjoqbpcs` (us-east-1)
- git config: user.email "onlymore2024@gmail.com" / user.name "Florent Gibert"
- Florent n'a JAMAIS enseigne l'anglais
- Jeux educatifs 8-14 ans: philosophie japonaise + sagesse africaine + litteratie financiere
- Si un fix echoue 2x → STOP, cat le fichier complet, demander diagnostic

## Stack
- React 18 + Vite + TypeScript + Tailwind
- Zustand 4 (state management)
- Supabase (ref: cbmasgbbhmunzjoqbpcs)
- react-router-dom 6, lucide-react, react-hot-toast
- Vercel (deploy): prj_ibJpfHkZdAXdHkBvDA4SOUeRWcBJ

## COMMANDE /dream
Quand l'utilisateur tape /dream, executer :

1. **ORIENT** — cat .claude/memory.md + ls .claude/session/
2. **SIGNAL** — grep -r "ERROR\|WARN\|obsolete\|TODO" .claude/session/*.jsonl 2>/dev/null | head -50
3. **CONSOLIDATE** — Fusionner doublons, convertir dates relatives en absolues, resoudre contradictions
4. **PRUNE** — Supprimer entrees obsoletes, maintenir memory.md < 200 lignes
5. **UPDATE** — Mettre a jour last_dream avec date absolue (ex: 25 Mars 2026 19h)
