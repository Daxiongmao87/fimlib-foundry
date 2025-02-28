# FIMLib - Foundry Instant Messaging Library

FIMLib is a library for creating instant messaging GUIs in Foundry VTT. It provides a flexible and customizable chat GUI that can be easily integrated into your game.

## Features

- Customizable chat GUI
- Message input

## Installation

### Add as a Git Submodule

```bash
git submodule add https://github.com/Daxiongmao87/fimlib-foundry.git modules/fimlib
git submodule update --init --recursive
```

## Basic Usage

```javascript
// Create a new chat window
const chat = new ChatModal();
chat.render(true);

// Add a message
chat.addMessage({
  content: "Hello, world!",
  sender: game.user.name
});

// Add message with custom corner text
chat.addMessage({
  content: "This message has custom corner text",
  sender: "System",
  cornerText: "Important"
});
```

## Configuration Options

```javascript
const chat = newChatModal({
    width: 400,              // Width of the chat window
    height: 500,             // Height of the chat window
    title: "My Chat Window", // Title of the chat window
    showAvatars: true,       // Show avatars in the chat window
    showCornerText: true,    // Show corner text in the chat window
});
```

## API Reference

### Methods

* addMessage(message, render): Add a message to the chat
* close(); Close the chat window

### Message Properties
```json
{
    content: "Message content",
    sender: "Sender name",
    cornerText: "Important",
    img: "path/to/avatar.png",
    subtitle: "Subtitle",
    _id: "unique-message-id"
}
```