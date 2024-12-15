const socket = io();

let applyingRemoteChange = false;

// Extract the roomId from the URL path
let roomId = window.location.pathname.slice(1);
if (!roomId) roomId = 'default-room';

// Join the room
socket.emit('joinRoom', roomId);

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  lineNumbers: true,
  mode: 'javascript',
  theme: 'material',
  lineWrapping: false // Default wrap is OFF
});

// Handle local changes and send them to the server
editor.on('change', () => {
  if (applyingRemoteChange) return;

  const fullText = editor.getValue();
  socket.emit('codeChange', { roomId, fullText });
});

// When receiving initial text for the room
socket.on('initText', (roomText) => {
  applyingRemoteChange = true;
  editor.setValue(roomText);
  applyingRemoteChange = false;
});

// When receiving updated text from another client
socket.on('codeChange', (fullText) => {
  const currentText = editor.getValue();

  // Only update if the incoming text is different
  if (currentText !== fullText) {
    // Save the cursor position
    const cursor = editor.getCursor();

    applyingRemoteChange = true;
    editor.setValue(fullText);

    // Restore the cursor position
    editor.setCursor(cursor);
    applyingRemoteChange = false;
  }
});

// Make the editor globally accessible for other scripts
window.editor = editor;
