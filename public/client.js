const socket = io();

// Extract the entire path (excluding leading '/')
let roomId = window.location.pathname.slice(1);
// Default room if none provided
if (!roomId) {
  roomId = 'default-room';
}

// Join the specific room
socket.emit('joinRoom', roomId);

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  lineNumbers: true,
  mode: 'javascript'
});

let applyingRemoteChange = false;

editor.on('change', () => {
  if (applyingRemoteChange) return;
  
  const fullText = editor.getValue();
  // Emit full text to the server
  socket.emit('codeChange', { roomId, fullText });
});

// On receiving initial text for the room
socket.on('initText', (roomText) => {
  applyingRemoteChange = true;
  editor.setValue(roomText);
  applyingRemoteChange = false;
});

// On receiving updated text from another client
socket.on('codeChange', (fullText) => {
  const currentText = editor.getValue();
  // Update the editor only if text differs to avoid unnecessary reflows
  if (currentText !== fullText) {
    applyingRemoteChange = true;
    editor.setValue(fullText);
    applyingRemoteChange = false;
  }
});
