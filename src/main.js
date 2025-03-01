/**
 * FoundryIM Library Entry Point
 * Initializes the chat modal and tab manager components and provides exports
 * for use by parent modules.
 * 
 * This version avoids global registrations to prevent conflicts when
 * multiple modules bundle FIMLib.
 */

import { ChatModal } from './components/ChatModal.js';
import { TabManager } from './components/TabManager.js';
import { MarkdownParser } from './utils/MarkdownParser.js';

// Version number for comparison if needed
const VERSION = '1.1.0';

// Export the components directly for ES Module imports
export { ChatModal, TabManager, MarkdownParser, VERSION };

// Only register globals when explicitly requested by the parent module
export function registerGlobals(namespace = null) {
    if (namespace) {
        // Register under the specified namespace
        window[namespace] = window[namespace] || {};
        window[namespace].FIMLib = {
            ChatModal,
            TabManager,
            MarkdownParser,
            version: VERSION
        };
        // Don't expose ChatModal directly when using a namespace
    } else {
        // Legacy global registration (not recommended when multiple modules use FIMLib)
        window.FIMLib = {
            ChatModal,
            TabManager,
            MarkdownParser,
            version: VERSION
        };
        window.ChatModal = ChatModal;
    }
}

// Initialize when ready, but don't register globals by default
Hooks.once('init', () => {
    console.log("FIMLib initialized as a library. Parent module should import components directly.");
}); 