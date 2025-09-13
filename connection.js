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
    
    // Update connection indicator and user role
    updateConnectionDisplay();
    
    // Setup event listeners
    exitGameBtn.addEventListener('click', exitGameHandler);
    
    // Initialize PeerJS based on role
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
    disableControlsForGuests();
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

        // 👇 CAMBIO 1: CÓMO EL INVITADO PROCESA LOS DATOS 👇
        conn.on('data', (data) => {
            if (data.type === 'game-state' && typeof window.handleGameStateUpdate === 'function') {
                window.handleGameStateUpdate(data.payload);
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
        broadcastGameState();
    });
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
        const allowedIds = ['theme-toggle', 'exit-game-btn', 'show-last-result-btn', 'close-dice-modal', 'close-load-list-modal', 'cancel-load-list-btn'];
        if (!allowedIds.includes(el.id) && !el.classList.contains('toggle-btn')) {
            el.disabled = true;
        }
    });
}

// Broadcast game state to all guests
function broadcastGameState() {
    if (connectionState.role !== 'host' || typeof gameState === 'undefined') return;

    const payload = {
        gameState: gameState, // 'gameState' es tu variable global de app.js
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

// Redirect to landing page
function redirectToLanding() {
    window.location.href = 'landing.html';
}

// Hide waiting screen
function hideWaitingScreen() {
    const waitingModal = document.getElementById('waiting-modal');
    if (waitingModal) {
        document.body.removeChild(waitingModal);
    }
}

// Initialize the connection system when the page loads
document.addEventListener('DOMContentLoaded', initConnection);

// 👇 CAMBIO 2: ELIMINAMOS EL SETINTERVAL 👇
// El envío de datos ahora se hará desde app.js cuando ocurra una acción.

// Export functions for use in app.js
export { broadcastGameState };