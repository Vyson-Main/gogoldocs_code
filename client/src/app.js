// ── App Entry Point ───────────────────────────────────────────────────────────
// Boot toast container (side-effectful import)
import './components/toasts/toastContainer.js';

// Boot router
import { initRouter } from '/src/router.js';

initRouter();
