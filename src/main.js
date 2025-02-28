/**
 * FoundryIM Library Entry Point
 * Initializes the chat modal and tab manager components and exposes them globally
 * for use by other modules.
 */

import { ChatModal } from './components/ChatModal.js';
import { TabManager } from './components/TabManager.js';

Hooks.once('init', () => {
    // Make sure FIMLib is registered as a global object
    window.FIMLib = {
        ChatModal,
        TabManager
    };
    
    // Also expose ChatModal as a global for backward compatibility
    window.ChatModal = ChatModal;
}); 