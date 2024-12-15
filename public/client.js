// Extract roomId from URL path
// URL format: https://your-app.onrender.com/code/roomId
const pathParts = window.location.pathname.split('/');
const roomId = pathParts[pathParts.length - 1] || 'default-room'; // fallback if needed

const socket = io();

// Join the specific room
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
