// Real-time connection system for game.html
let connectionState = {
    role: null, // 'host' or 'guest'
    name: '',
    accessCode: '',
    peer: null,
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

// Initialize connection system
function initConnection() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    connectionState.role = urlParams.get('role');
    connectionState.name = urlParams.get('name');
    connectionState.accessCode = urlParams.get('accessCode');
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
        
        // Start periodic update for the guest list
        setInterval(updateGuestList, 2000);
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
    // Use the accessCode for the host's Peer object
    connectionState.peer = new Peer(connectionState.accessCode, {
        host: 'peerjs-server.herokuapp.com',
        secure: true
    });

    connectionState.peer.on('open', id => {
        console.log("My PeerJS ID is:", id);
        connectionState.isConnected = true;
        updateConnectionDisplay();
        hideWaitingScreen();

        // Host also needs to listen for guest connections
        connectionState.peer.on('connection', conn => {
            console.log("New guest connected:", conn.peer);
            connectionState.guestConnections.push(conn);
            conn.on('data', data => {
                if (data.type === 'guest-join') {
                    console.log("Guest joined:", data.name);
                    // Send the current game state to the new guest
                    if (window.gameState) {
                        conn.send({
                            type: 'game-state-update',
                            gameState: window.gameState
                        });
                    }
                }
            });
            conn.on('close', () => {
                console.log("Guest disconnected:", conn.peer);
                connectionState.guestConnections = connectionState.guestConnections.filter(c => c.peer !== conn.peer);
                updateConnectionDisplay();
            });
            updateConnectionDisplay();
        });
    });

    connectionState.peer.on('error', err => {
        console.error("PeerJS error:", err);
        // Do not redirect on error, let the user see the problem
        showError('Error de conexión. Asegúrate de que el servidor está funcionando y que tu conexión a Internet es estable.');
    });
}

// Guest connection
function initGuestConnection() {
    console.log("Initializing guest connection...");
    // Create the Peer object with a unique ID (based on name and a random number)
    connectionState.peer = new Peer(connectionState.name + '-' + Math.random().toString(36).substring(7), {
        host: 'peerjs-server.herokuapp.com',
        secure: true
    });
    
    showWaitingScreen();

    connectionState.peer.on('open', id => {
        console.log("My PeerJS ID is:", id);
        // Connect to the host using the access code
        connectionState.hostConnection = connectionState.peer.connect(connectionState.accessCode);
        
        // Listen for when the connection is open
        connectionState.hostConnection.on('open', () => {
            console.log("Connected to host!");
            connectionState.isConnected = true;
            updateConnectionDisplay();
            
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
                if (window.updateGameFromHostData) {
                    window.updateGameFromHostData(data.gameState);
                }
                hideWaitingScreen();
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

        connectionState.hostConnection.on('error', err => {
            console.error("Host connection error:", err);
            hideWaitingScreen();
            alert('Error de conexión con el anfitrión. Asegúrate de que el código sea correcto y el anfitrión esté en la partida.');
            redirectToLanding();
        });
    });

    connectionState.peer.on('error', err => {
        console.error("PeerJS error:", err);
        hideWaitingScreen();
        if (err.type === 'peer-unavailable') {
            alert('El código de acceso no es válido o el anfitrión no está en línea.');
        } else {
            alert('Error de conexión con el servidor. Por favor, inténtalo de nuevo.');
        }
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
window.broadcastGameState = broadcastGameState; // Make it a global function

// Update the list of connected guests on the UI
function updateGuestList() {
    const guestListElement = document.getElementById('connected-users-list');
    if (!guestListElement) return;

    guestListElement.innerHTML = '';
    connectionState.guestConnections.forEach(conn => {
        const li = document.createElement('li');
        li.textContent = conn.peer;
        guestListElement.appendChild(li);
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
        updateGuestList();
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

function showWaitingScreen() {
    // Create and show waiting modal
    const waitingModal = document.createElement('div');
    waitingModal.id = 'waiting-modal';
    waitingModal.className = 'modal';
    waitingModal.style.display = 'flex';
    
    const lang = connectionState.language;
    waitingModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${lang === 'es' ? 'Conectando...' : 'Connecting...'}</h2>
            </div>
            <div class="modal-body">
                <p>${lang === 'es' ? 'Esperando a que el anfitrión esté listo...' : 'Waiting for host to be ready...'}</p>
                <div class="loader"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(waitingModal);
}

// Initialize the connection system when the page loads
document.addEventListener('DOMContentLoaded', initConnection);