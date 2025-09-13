// Real-time connection system for game.html

let connectionState = {
    role: null, // 'host' or 'guest'
    name: '',
    accessCode: '',
    peer: null,
    peerId: null,
    hostConnection: null,
    guestConnections: [],
    isConnected: false,
    darkMode: false,
    language: 'es'
};

// DOM elements
const connectionIndicator = document.getElementById('connection-indicator');
const userRoleSpan = document.getElementById('user-role');
const exitGameBtn = document.getElementById('exit-game-btn');

// Initialize connection system
function initConnection() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    connectionState.role = urlParams.get('role');
    connectionState.name = urlParams.get('name');
    connectionState.accessCode = urlParams.get('accessCode');
    connectionState.peerId = urlParams.get('peerId');
    connectionState.language = urlParams.get('language') || 'es';
    connectionState.darkMode = urlParams.get('darkMode') === 'true';
    
    // Apply theme and language
    if (connectionState.darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    updateConnectionDisplay();
    
    exitGameBtn.addEventListener('click', exitGameHandler);
    
    if (connectionState.role === 'host') {
        initHostConnection();
    } else {
        initGuestConnection();
    }
}

// Initialize host connection
function initHostConnection() {
    connectionState.peer = new Peer(`dice-game-${connectionState.accessCode}`);
    
    connectionState.peer.on('open', (id) => {
        connectionState.peerId = id;
        connectionState.isConnected = true;
        updateConnectionDisplay();
    });

    connectionState.peer.on('connection', (conn) => {
        setupGuestConnection(conn);
    });

    connectionState.peer.on('error', (err) => {
        console.error('Host PeerJS Error:', err);
        connectionState.isConnected = false;
        updateConnectionDisplay();
    });
}

// Initialize guest connection
function initGuestConnection() {
    disableControlsForGuests(); // Disable controls as soon as we know it's a guest
    connectionState.peer = new Peer();

    connectionState.peer.on('open', (id) => {
        connectionState.peerId = id;
        const hostPeerId = `dice-game-${connectionState.accessCode}`;
        const conn = connectionState.peer.connect(hostPeerId);
        connectionState.hostConnection = conn;
        
        conn.on('open', () => {
            connectionState.isConnected = true;
            updateConnectionDisplay();
            hideWaitingScreen();
        });

        conn.on('data', (data) => {
            if (data.type === 'game-state') {
                // 👇 CAMBIO REALIZADO AQUÍ 👇
                // Cuando el invitado recibe el estado del juego, actualiza su pantalla
                handleGameStateUpdate(data.payload);
            } else if (data.type === 'host-ended-game') {
                alert(data.message);
                redirectToLanding();
            }
        });

        conn.on('close', () => {
            connectionState.isConnected = false;
            updateConnectionDisplay();
        });
    });

    connectionState.peer.on('error', (err) => {
        console.error('Guest PeerJS Error:', err);
        connectionState.isConnected = false;
        updateConnectionDisplay();
    });
}

// Setup guest connection
function setupGuestConnection(conn) {
    conn.on('open', () => {
        connectionState.guestConnections.push(conn);
        conn.on('close', () => {
            connectionState.guestConnections = connectionState.guestConnections.filter(c => c.peer !== conn.peer);
        });
        broadcastGameState(); // Send current state to the new guest
    });
}

// 👇 NUEVA FUNCIÓN 👇
// Se encarga de actualizar la pantalla del invitado
function handleGameStateUpdate(payload) {
    if (!window.gameState) return;

    // Actualiza el objeto gameState local con la información del anfitrión
    Object.assign(window.gameState, payload.gameState);

    // Actualiza los campos de texto y checkboxes
    document.getElementById('game-title-input').value = payload.gameTitle;
    document.getElementById('game-title').textContent = payload.gameTitle;
    document.getElementById('game-description').value = payload.gameDescription;
    document.getElementById('game-instructions').value = payload.gameInstructions;
    document.getElementById('dice-max-value').value = payload.diceMaxValue;
    document.getElementById('allow-duplicate-rolls-checkbox').checked = payload.allowDuplicateRolls;

    // Llama a la función de app.js para que redibuje todo lo demás
    if(typeof window.updateUIFromGameState === 'function') {
        window.updateUIFromGameState();
    }
}

// Update connection display
function updateConnectionDisplay() {
    const indicatorClass = connectionState.isConnected ? 'connected' : 'disconnected';
    const indicatorTitle = connectionState.isConnected ? 'Conectado' : 'Desconectado';
    connectionIndicator.className = indicatorClass;
    connectionIndicator.title = indicatorTitle;
    userRoleSpan.textContent = `Rol: ${connectionState.role} | Nombre: ${connectionState.name}`;
}

// Disable controls for guests
function disableControlsForGuests() {
    document.querySelectorAll('input, button, textarea').forEach(el => {
        const allowedIds = ['theme-toggle', 'exit-game-btn', 'show-last-result-btn', 'close-dice-modal', 'close-load-list-modal'];
        if (!allowedIds.includes(el.id) && !el.classList.contains('toggle-btn')) {
            el.disabled = true;
        }
    });
}

// Broadcast game state to all guests
function broadcastGameState() {
    if (connectionState.role !== 'host' || !window.gameState) return;

    const payload = {
        gameState: window.gameState,
        gameTitle: document.getElementById('game-title-input').value,
        gameDescription: document.getElementById('game-description').value,
        gameInstructions: document.getElementById('game-instructions').value,
        diceMaxValue: document.getElementById('dice-max-value').value,
        allowDuplicateRolls: document.getElementById('allow-duplicate-rolls-checkbox').checked,
    };

    const dataToSend = { type: 'game-state', payload };

    connectionState.guestConnections.forEach(conn => {
        if (conn.open) {
            conn.send(dataToSend);
        }
    });
}

// Handle exit game button click
function exitGameHandler() {
    if (confirm(connectionState.language === 'es' ? '¿Estás seguro de que quieres salir?' : 'Are you sure you want to exit?')) {
        if (connectionState.role === 'host') {
            endGameForAll();
        }
        exitGame();
    }
}

// End game for all guests
function endGameForAll() {
    if (connectionState.guestConnections.length > 0) {
        connectionState.guestConnections.forEach(conn => {
            if (conn.open) {
                conn.send({
                    type: 'host-ended-game',
                    message: connectionState.language === 'es' ? 'El anfitrión ha terminado la partida.' : 'The host has ended the game.'
                });
            }
        });
        connectionState.guestConnections = [];
    }
}

// Exit the game and return to landing page
function exitGame() {
    if (connectionState.peer) {
        connectionState.peer.destroy();
    }
    window.location.href = 'landing.html';
}

function redirectToLanding() {
    window.location.href = 'landing.html';
}

function hideWaitingScreen() {
    const waitingModal = document.getElementById('waiting-modal');
    if (waitingModal) {
        document.body.removeChild(waitingModal);
    }
}

document.addEventListener('DOMContentLoaded', initConnection);

// Export functions for use in app.js
export { broadcastGameState };