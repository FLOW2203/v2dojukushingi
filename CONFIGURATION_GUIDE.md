# 🚨 GUIDE DE CONFIGURATION CRITIQUE - DOJUKU SHINGI

## ⚡ ACTIONS IMMÉDIATES REQUISES

### 1. 🔥 Configuration Firebase (CRITIQUE)

**Étapes obligatoires :**

1. **Créer le projet Firebase :**
   - Allez sur https://console.firebase.google.com
   - Créez un nouveau projet nommé "dojuku-shingi"
   - Activez Google Analytics (optionnel)

2. **Configurer l'authentification :**
   - Dans Firebase Console > Authentication > Sign-in method
   - Activez "Email/Password"
   - Ajoutez le domaine `dojuku-shingi.com` dans les domaines autorisés

3. **Configurer Firestore :**
   - Dans Firebase Console > Firestore Database
   - Créez une base de données en mode "production"
   - Région : europe-west1 (ou plus proche de vos utilisateurs)

4. **Récupérer les clés de configuration :**
   - Dans Firebase Console > Project Settings > General
   - Section "Your apps" > Web app
   - Copiez les valeurs dans le fichier `.env`

### 2. 💳 Configuration Stripe (CRITIQUE)

**Étapes obligatoires :**

1. **Créer le compte Stripe :**
   - Allez sur https://dashboard.stripe.com
   - Créez un compte pour "DOJUKU SHINGI"
   - Activez les paiements pour votre pays

2. **Récupérer les clés API :**
   - Dans Stripe Dashboard > Developers > API keys
   - Copiez la "Publishable key" dans `VITE_STRIPE_PUBLIC_KEY`
   - Copiez la "Secret key" (côté serveur uniquement)

3. **Configurer les webhooks :**
   - Dans Stripe Dashboard > Developers > Webhooks
   - Ajoutez l'endpoint : `https://api.dojuku-shingi.com/webhooks/stripe`
   - Copiez le "Signing secret" dans `VITE_STRIPE_WEBHOOK_SECRET`

### 3. 🌐 Configuration DNS Netlify (BLOQUANT)

**Informations manquantes - À obtenir de Netlify :**

Une fois votre site déployé sur Netlify, vous recevrez :

1. **URL CNAME :** `your-site-name.netlify.app`
2. **Adresse IP A Record :** `75.2.60.5` (exemple)

**Configuration chez Hostinger :**

```
Type: CNAME
Nom: www
Cible: [REMPLACER-PAR-URL-NETLIFY-REELLE]

Type: A
Nom: @  
Cible: [REMPLACER-PAR-IP-NETLIFY-REELLE]
```

### 4. 🔧 Variables d'environnement dans Bolt.new

**Dans l'interface Bolt.new :**

1. Ouvrez les paramètres du projet
2. Section "Environment Variables"
3. Ajoutez chaque variable `VITE_*` avec sa vraie valeur
4. Redémarrez le serveur de développement

## ⚠️ ERREURS À ÉVITER

1. **NE PAS** utiliser les clés de démo en production
2. **NE PAS** exposer les clés secrètes côté client
3. **NE PAS** oublier de configurer les domaines autorisés
4. **NE PAS** déployer sans tester l'authentification

## ✅ VALIDATION

**Checklist de validation :**

- [ ] Firebase initialisé sans erreur
- [ ] Authentification fonctionnelle
- [ ] Stripe configuré pour les paiements
- [ ] Caméra accessible (avec autorisation)
- [ ] DNS configuré et propagé
- [ ] Site accessible via dojuku-shingi.com

## 🆘 SUPPORT

Si vous rencontrez des problèmes :

1. Vérifiez la console du navigateur
2. Consultez les logs Firebase/Stripe
3. Testez chaque service individuellement
4. Contactez le support technique si nécessaire

---

**🎯 OBJECTIF :** Application 100% fonctionnelle avec toutes les erreurs critiques résolues.