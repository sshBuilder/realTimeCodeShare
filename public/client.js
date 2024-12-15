const socket = io();

// Extract the entire path (excluding leading '/')
let roomId = window.location.pathname.slice(1);
// If no sub-path, use a default room name
if (!roomId) {
  roomId = 'default-room';
}

// Join the determined room
socket.emit('joinRoom', roomId);

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  lineNumbers: true,
  mode: 'javascript'
});

let applyingRemoteChange = false;

editor.on('change', (instance, changeObj) => {
  if (applyingRemoteChange) return;
  
  const delta = {
    text: changeObj.text,
    from: changeObj.from,
    to: changeObj.to
  };
  
  socket.emit('codeChange', { roomId, delta });
});

socket.on('codeChange', (delta) => {
  applyingRemoteChange = true;
  editor.replaceRange(delta.text, delta.from, delta.to);
  applyingRemoteChange = false;
});
