/* Sample of the runtime configuration file that the deploy workflow builds
   from repository secrets (deploy.yml → assets/app-config.js).
   The real app-config.js is gitignored and NEVER committed — the repository
   and the published index.html contain no API keys, ever.

   To configure locally: copy this file to assets/app-config.js and fill in. */
window.APP_CONFIG = {
  // Shown in the site footer + Settings → About. Optional.
  adminEmail: "",
  // REQUIRED on the deployed site: master secret for the sealed (tamper-evident)
  // progress store. Injected from the SEAL_SECRET repository secret.
  // Rotating it resets all local progress records (key rotation → old seals unreadable).
  sealSecret: "<64+ random hex characters>",
  sealKeyId: "d1",
  // Optional: enables Google/GitHub sign-in. Injected from the FIREBASE_CONFIG_JSON
  // repository secret as a JSON object with apiKey, authDomain, projectId, appId.
  // Leave null for on-device accounts only.
  firebase: null
};
