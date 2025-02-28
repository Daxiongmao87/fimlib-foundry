/**
 * ChatModal Component - A compact instant messaging interface for FoundryVTT
 * @module ChatModal
 */

export class ChatModal extends FormApplication {
  /**
   * Data store for messages and tabs
   * @type {Object}
   * @property {Array} messages - Array of message objects containing content, sender, and timestamp
   * @property {Array} tabs - Array of tab objects containing tab name and message history
   */
  static data = {
    title: "Chat",
    messages: [],
    tabs: [],
  };

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "foundry-im-chat-modal",
      template: "modules/fimlib/src/templates/chat-modal.html",
      title: "Chat",
      width: 300,
      height: 400,
      minimizable: true,
      resizable: true,
      popOut: true,
      classes: ["foundry-im", "chat-modal"],
      editorClasses: ['chat-message'],
      dragDrop: [{dragSelector: ".window-header"}],
      showAvatars: true,
      showCornerText: true
    });
  }

  /**
   * Create a new ChatModal instance
   * @param {Object} options - Configuration options for the chat modal
   */
  constructor(options = {}) {
    super(options);
    this.options = mergeObject(this.options, options);
  }

  getData(options = {}) {
    const processedMessages = ChatModal.data.messages.map(msg => {
      return {
        ...msg,
        isCurrentUser: msg.sender === game.user.name,
        cssClass: msg.sender === game.user.name ? 'current-user' : 'other-user'
      };
    });
    
    return {
      data: {
        ...ChatModal.data,
        messages: processedMessages
      },
      showAvatars: this.options.showAvatars,
      showCornerText: this.options.showCornerText
    };
  }

  /**
   * Set up event listeners and initialize UI elements
   * @param {jQuery} html - The rendered HTML content
   */
  activateListeners(html) {
    super.activateListeners(html);
    
    const textarea = html.find('textarea.chat-input');
    const parentDiv = textarea.parent();
    const messageContainer = html.find('.chat-messages.message-list');
    
    html.find('.chat-send').click(() => this._onSendMessage(html));
    
    textarea.on('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._onSendMessage(html);
      }
    });
    
    textarea.on('input', (e) => this._handleTextareaResize(e.currentTarget));
    this._handleTextareaResize(textarea[0]);
    
    textarea.on('focus', () => parentDiv.addClass('focused'));
    textarea.on('blur', () => parentDiv.removeClass('focused'));
    
    this._updateMessageListGradients(messageContainer[0]);
    messageContainer.on('scroll', (e) => this._updateMessageListGradients(e.currentTarget));
  }

  /**
   * Handle sending a message
   * @private
   */
  _onSendMessage(html) {
    const input = html.find('textarea.chat-input');
    const message = input.val().trim();
    
    if (message) {
      ChatModal.data.messages.push({
        _id: randomID(),
        content: message,
        sender: game.user.name,
        timestamp: new Date().toISOString(),
        img: game.user.avatar || "icons/svg/mystery-man.svg",
        subtitle: ""
      });
      
      input.val('');
      this.render();
      
      setTimeout(() => {
        const textarea = this.element.find('textarea.chat-input');
        if (textarea.length) {
          textarea[0].focus();
          if (textarea[0].value.length) {
            textarea[0].selectionStart = textarea[0].selectionEnd = textarea[0].value.length;
          }
        }
      }, 0);
    }
  }

  /**
   * Update gradient indicators based on textarea scroll position
   * @private
   * @param {HTMLTextAreaElement} textarea - The textarea element
   */
  _updateGradientIndicators(textarea) {
    const container = textarea.closest('.chat-input.editor.flexrow');
    const hasOverflow = textarea.scrollHeight > textarea.clientHeight;
    const maxOpacity = 0.8;
    
    if (!hasOverflow) {
      container.style.setProperty('--top-gradient-opacity', '0');
      container.style.setProperty('--bottom-gradient-opacity', '0');
      return;
    }
    
    const contentHiddenAbove = textarea.scrollTop;
    const contentHiddenBelow = textarea.scrollHeight - textarea.clientHeight - textarea.scrollTop;
    const threshold = 1;
    const maxDistance = 20; 
    
    const topOpacity = contentHiddenAbove <= threshold ? 0 : 
        Math.min(contentHiddenAbove / maxDistance, 1) * maxOpacity;
    
    const bottomOpacity = contentHiddenBelow <= threshold ? 0 :
        Math.min(contentHiddenBelow / maxDistance, 1) * maxOpacity;
    
    container.style.setProperty('--top-gradient-opacity', topOpacity);
    container.style.setProperty('--bottom-gradient-opacity', bottomOpacity);
    
    if (!textarea._hasScrollListener) {
      const boundMethod = this._updateGradientIndicators.bind(this);
      textarea.addEventListener('scroll', function() {
        boundMethod(textarea);
      });
      textarea._hasScrollListener = true;
    }
  }

  /**
   * Handle textarea auto-resize
   * @private
   * @param {HTMLTextAreaElement} textarea - The textarea element
   */
  _handleTextareaResize(textarea) {
    const scrollPos = textarea.scrollTop;
    const style = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);
    
    textarea.style.height = 'auto';
    
    const newlines = (textarea.value.match(/\n/g) || []).length;
    const wrappedLines = Math.floor(textarea.scrollHeight / lineHeight) - newlines;
    const totalLines = newlines + wrappedLines;
    
    if (totalLines === 1) {
        textarea.style.removeProperty('height');
        textarea.style.overflowY = 'hidden';
        return;
    }
    
    const newHeight = Math.ceil(Math.min(
        (totalLines * lineHeight) + paddingTop + paddingBottom,
        (3 * lineHeight) + paddingTop + paddingBottom
    )) + 1;
    
    textarea.style.height = `${newHeight}px`;
    textarea.scrollTop = scrollPos;
    this._updateGradientIndicators(textarea);
  }

  /**
   * Close the chat modal
   * @param {Object} options - The close options
   * @returns {Promise} - A promise which resolves once the application is closed
   */
  close(options={}) {
    return super.close(options);
  }

  /**
   * Add a message to the chat display
   * @param {Object} message - The message to add
   * @param {string} message.content - The message content
   * @param {string} message.sender - The sender's name
   * @param {string} [message.cornerText] - Optional text to display in the top-right corner
   * @param {string} [message.img] - Avatar image path
   * @param {string} [message.subtitle] - Optional subtitle text
   * @param {boolean} [render=true] - Whether to re-render the chat window
   */
  addMessage(message, render = true) {
    const formattedMessage = {
      _id: message._id || randomID(),
      content: message.content,
      sender: message.sender,
      cornerText: message.cornerText || "",
      isCurrentUser: message.sender === game.user.name,
      img: message.img || (message.sender === game.user.name ? game.user.avatar : "icons/svg/mystery-man.svg"),
      subtitle: message.subtitle || ""
    };
    
    ChatModal.data.messages.push(formattedMessage);
    
    if (render) {
      this.render();
      setTimeout(() => {
        const messageList = this.element.find('.chat-messages.message-list');
        if (messageList.length) {
          messageList[0].scrollTop = messageList[0].scrollHeight;
          this._updateMessageListGradients(messageList[0]);
        }
      }, 50);
    }
  }

  /**
   * Update gradient indicators for the message list based on scroll position
   * @private
   * @param {HTMLElement} container - The message list container
   */
  _updateMessageListGradients(container) {
    if (!container) return;
    
    const parentContainer = container.closest('.foundry-im.chat-messages-container');
    const hasOverflow = container.scrollHeight > container.clientHeight;
    const maxOpacity = 0.8;
    
    if (!hasOverflow) {
      parentContainer.style.setProperty('--msg-top-gradient-opacity', '0');
      parentContainer.style.setProperty('--msg-bottom-gradient-opacity', '0');
      return;
    }
    
    const contentHiddenAbove = container.scrollTop;
    const contentHiddenBelow = container.scrollHeight - container.clientHeight - container.scrollTop;
    const threshold = 1;
    const maxDistance = 20; 
    
    const topOpacity = contentHiddenAbove <= threshold ? 0 : 
        Math.min(contentHiddenAbove / maxDistance, 1) * maxOpacity;
    
    const bottomOpacity = contentHiddenBelow <= threshold ? 0 :
        Math.min(contentHiddenBelow / maxDistance, 1) * maxOpacity;
    
    parentContainer.style.setProperty('--msg-top-gradient-opacity', topOpacity);
    parentContainer.style.setProperty('--msg-bottom-gradient-opacity', bottomOpacity);
  }

  /**
   * Override the render method to ensure gradients are initialized
   * @override
   */
  async render(force=false, options={}) {
    const result = await super.render(force, options);
    
    if (this.element) {
      const messageList = this.element.find('.chat-messages.message-list');
      if (messageList.length) {
        messageList[0].scrollTop = messageList[0].scrollHeight;
        this._updateMessageListGradients(messageList[0]);
      }
    }
    
    return result;
  }
}

globalThis.ChatModal = ChatModal;
