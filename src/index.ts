import './foundry/registerHooks';
import './styles.css';
import registerHotReload from './dev/hotReload';

import.meta.glob('./lang/*.yml', { eager: true });

if (import.meta.hot) {
    registerHotReload(import.meta.hot);
}
