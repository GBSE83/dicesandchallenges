// Real-time connection system for game.html
import { updateGameFromHostData } from './app.js';

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

window.connectionState = connectionState;

// DOM elements
const connectionIndicator = document.getElementById('connection-indicator');
const userRoleSpan = document.getElementById('user-role');
const exitGameBtn = document.getElementById('exit-game-btn');
const loadingText = document.getElementById('loading-text');

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
    } else if (connectionState.role === 'guest') {
        initGuestConnection();
    }
}

// Update connection status display
function updateConnectionDisplay() {
    const lang = connectionState.language;
    userRoleSpan.textContent = connectionState.role === 'host' ? `Anfitrión` : `Invitado: ${connectionState.name}`;
    
    if (connectionState.isConnected) {
        connectionIndicator.classList.add('connected');
        connectionIndicator.classList.remove('disconnected');
    } else {
        connectionIndicator.classList.add('disconnected');
        connectionIndicator.classList.remove('connected');
    }
}

// Host connection
function initHostConnection() {
    console.log("Initializing host connection...");
    connectionState.peer = new Peer(connectionState.peerId, {
        host: 'peerjs-server.herokuapp.com',
        secure: true
    });

    connectionState.peer.on('open', id => {
        console.log("My PeerJS ID is:", id);
        connectionState.isConnected = true;
        updateConnectionDisplay();
        hideWaitingScreen();
    });

    connectionState.peer.on('connection', conn => {
        console.log("New guest connected:", conn.peer);
        connectionState.guestConnections.push(conn);
        conn.on('data', data => {
            if (data.type === 'guest-join') {
                console.log("Guest joined:", data.name);
            }
        });
        conn.on('close', () => {
            console.log("Guest disconnected:", conn.peer);
            connectionState.guestConnections = connectionState.guestConnections.filter(c => c.peer !== conn.peer);
            updateConnectionDisplay();
        });
        updateConnectionDisplay();
    });

    connectionState.peer.on('error', err => {
        console.error("PeerJS error:", err);
        alert('Error de conexión. Asegúrate de que el ID de anfitrión es único y que el servidor está funcionando.');
        redirectToLanding();
    });
}

// Guest connection
function initGuestConnection() {
    console.log("Initializing guest connection...");
    connectionState.peer = new Peer(connectionState.name, {
        host: 'peerjs-server.herokuapp.com',
        secure: true
    });

    connectionState.peer.on('open', id => {
        console.log("My PeerJS ID is:", id);
        // Connect to the host
        connectionState.hostConnection = connectionState.peer.connect(connectionState.accessCode);

        // Listen for when the connection is open
        connectionState.hostConnection.on('open', () => {
            console.log("Connected to host!");
            connectionState.isConnected = true;
            updateConnectionDisplay();
            hideWaitingScreen();

            // Send initial information to host
            connectionState.hostConnection.send({
                type: 'guest-join',
                name: connectionState.name,
                darkMode: connectionState.darkMode,
                language: connectionState.language
            });
        });
        
        // Listen for data from the host
        connectionState.hostConnection.on('data', data => {
            if (data.type === 'game-state-update') {
                console.log("Received game state from host.");
                // Update the game state with the received data
                updateGameFromHostData(data.gameState);
            }
            if (data.type === 'host-ended-game') {
                alert(data.message);
                redirectToLanding();
            }
        });
        
        // Listen for connection close
        connectionState.hostConnection.on('close', () => {
            console.log("Disconnected from host.");
            connectionState.isConnected = false;
            alert("El anfitrión ha salido de la partida.");
            redirectToLanding();
        });
    });

    connectionState.peer.on('error', err => {
        console.error("PeerJS error:", err);
        alert('Error de conexión con el anfitrión. Asegúrate de que el código sea correcto y el anfitrión esté en la partida.');
        redirectToLanding();
    });
}

// Broadcast game state to all connected guests
function broadcastGameState(gameState) {
    connectionState.guestConnections.forEach(conn => {
        if (conn.open) {
            conn.send({
                type: 'game-state-update',
                gameState: gameState 
            });
        }
    });
}

// Host ends the game for all connected guests
function endHostGame() {
    if (connectionState.role === 'host') {
        // Send a message to exit
        connectionState.guestConnections.forEach(conn => {
            if (conn.open) {
                conn.send({
                    type: 'host-ended-game',
                    message: connectionState.language === 'es' ? 
                        'El anfitrión ha terminado la partida.' : 
                        'The host has ended the game.'
                });
            }
        });
        
        // Clear guest connections
        connectionState.guestConnections = [];
        updateConnectionDisplay();
    }
}

// Exit the game and return to landing page
function exitGame() {
    // Close all connections
    if (connectionState.peer) {
        connectionState.peer.destroy();
    }
    
    // Redirect to landing page
    window.location.href = 'landing.html';
}

function exitGameHandler() {
    if (connectionState.role === 'host') {
        endHostGame();
    }
    exitGame();
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

// Setup periodic broadcast of game state for hosts
setInterval(() => {
    if (connectionState.role === 'host' && connectionState.guestConnections.length > 0) {
        broadcastGameState(window.gameState);
    }
}, 2000);

// Export functions for use in app.js
export { broadcastGameState, endHostGame };