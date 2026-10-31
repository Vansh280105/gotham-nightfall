/* =========================================================
   GOTHAM: NIGHTFALL
   Fixed, stabilized & unified production arcade engine
   ========================================================= */

let cleanupM1 = null;
let cleanupM2 = null;

const startButton = document.getElementById("startButton");
if (startButton) {
    startButton.addEventListener("click", showMissionBriefing);
}

function showMissionBriefing() {
    const title = document.querySelector(".title");
    const moon = document.querySelector(".moon");
    if (title) title.style.opacity = "0";
    if (moon) moon.style.opacity = "0";

    setTimeout(() => {
        const city = document.querySelector(".city");
        if (!city) return;

        city.innerHTML = `
            <div class="mission-screen">
                <p class="mission-label">NIGHTFALL PROTOCOL</p>
                <h1>MISSION 01</h1>
                <div class="mission-line"></div>
                <p class="mission-text">
                    Gotham has gone dark.
                    <br><br>
                    Something is moving through the streets.
                    <br>
                    The city needs someone to investigate.
                </p>
                <p class="objective">OBJECTIVE: INVESTIGATE THE CITY</p>
                <button id="beginMission">▶ BEGIN MISSION</button>
            </div>
        `;

        document
            .getElementById("beginMission")
            ?.addEventListener("click", startGame);
    }, 600);
}

function startGame() {
    if (cleanupM1) { cleanupM1(); cleanupM1 = null; }
    if (cleanupM2) { cleanupM2(); cleanupM2 = null; }

    const city = document.querySelector(".city");
    if (!city) return;

    city.innerHTML = `
        <div class="game-area">
            <div class="game-header">
                <span>GOTHAM: NIGHTFALL</span>
                <span id="score">CLUES: 0 / 3</span>
                <span id="vision-status" style="cursor: pointer;" title="Toggle Night Vision (Key: E)">NIGHT VISION: OFF</span>
            </div>

            <div class="world" id="world">
                <!-- DISTRICT MARKERS -->
                <div class="district-label downtown-label">DOWNTOWN</div>
                <div class="district-label alley-label">DARK ALLEY</div>
                <div class="district-label industrial-label">INDUSTRIAL DISTRICT</div>

                <!-- GOTHAM SKYLINE -->
                <div class="gotham-skyline">
                    <div class="city-layer distant">
                        <div class="tower d1"></div>
                        <div class="tower d2"></div>
                        <div class="tower d3"></div>
                        <div class="tower d4"></div>
                        <div class="tower d5"></div>
                        <div class="tower d6"></div>
                        <div class="tower d7"></div>
                    </div>

                    <div class="city-layer main-city">
                        <div class="building b1"></div>
                        <div class="building b2"></div>
                        <div class="building b3"></div>
                        <div class="building b4"></div>
                        <div class="building b5"></div>
                        <div class="building b6"></div>
                        <div class="building b7"></div>
                        <div class="building b8"></div>
                        <div class="building b9"></div>
                        <div class="building b10"></div>
                        <div class="building b11"></div>
                        <div class="building b12"></div>
                        <div class="building b13"></div>
                    </div>
                </div>

                <!-- CLUES -->
                <div class="clue clue1" style="left: 700px; top: 45%;">✦</div>
                <div class="clue clue2 hidden-clue" style="left: 1750px; top: 55%; display: none;">✦</div>
                <div class="clue clue3" style="left: 2900px; top: 40%;">✦</div>
            </div>

            <!-- PLAYER -->
            <div id="player">
                <div class="hero">
                    <div class="hero-head">
                        <div class="hero-eye left-eye"></div>
                        <div class="hero-eye right-eye"></div>
                    </div>
                    <div class="hero-body"></div>
                    <div class="hero-cape"></div>
                </div>
            </div>

            <div class="instructions">
                MOVE: WASD / ARROW KEYS &nbsp;|&nbsp; NIGHT VISION: E
            </div>

            <!-- MOBILE TOUCH CONTROLS -->
            <div class="mobile-controls m1-touch-controls" id="m1TouchControls">
                <div class="touch-dpad">
                    <button type="button" class="touch-btn" data-m1-key="arrowup" aria-label="Up">▲</button>
                    <div class="touch-row">
                        <button type="button" class="touch-btn" data-m1-key="arrowleft" aria-label="Left">◀</button>
                        <button type="button" class="touch-btn" data-m1-key="arrowdown" aria-label="Down">▼</button>
                        <button type="button" class="touch-btn" data-m1-key="arrowright" aria-label="Right">▶</button>
                    </div>
                </div>
                <div class="touch-action-group">
                    <button type="button" class="touch-btn touch-nv" id="touchNightVision" aria-label="Toggle Night Vision">👁 NV [E]</button>
                </div>
            </div>
        </div>
    `;

    startPlayerMovement();
}

function startPlayerMovement() {
    if (cleanupM1) { cleanupM1(); cleanupM1 = null; }
    if (cleanupM2) { cleanupM2(); cleanupM2 = null; }

    const player = document.getElementById("player");
    const world = document.getElementById("world");
    const gameArea = document.querySelector(".game-area");
    if (!player || !world || !gameArea) return;

    const worldWidth = 3200;
    let playerX = 400;
    let playerY = gameArea.clientHeight * 0.55;
    let cameraX = 0;
    const horizontalSpeed = 12;
    const verticalSpeed = 7;
    const keys = {};
    let nightVision = false;
    let cluesCollected = 0;
    let m1Active = true;
    let m1AnimId = null;

    function toggleNightVision() {
        if (!m1Active) return;
        nightVision = !nightVision;
        const ga = document.querySelector(".game-area");
        if (ga) ga.classList.toggle("night-vision", nightVision);

        const hiddenClue = document.querySelector(".hidden-clue");
        if (hiddenClue) hiddenClue.style.display = nightVision ? "block" : "none";

        const visionStatus = document.getElementById("vision-status");
        if (visionStatus) {
            visionStatus.textContent = nightVision ? "NIGHT VISION: ON" : "NIGHT VISION: OFF";
        }
    }

    const visionStatusEl = document.getElementById("vision-status");
    if (visionStatusEl) {
        visionStatusEl.addEventListener("click", toggleNightVision);
    }

    function handleM1KeyDown(event) {
        const key = event.key.toLowerCase();
        keys[key] = true;
        if (["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) {
            event.preventDefault();
        }
        if (key === "e") {
            toggleNightVision();
        }
    }

    function handleM1KeyUp(event) {
        keys[event.key.toLowerCase()] = false;
    }

    function handleM1Blur() {
        Object.keys(keys).forEach(k => { keys[k] = false; });
    }

    document.addEventListener("keydown", handleM1KeyDown);
    document.addEventListener("keyup", handleM1KeyUp);
    window.addEventListener("blur", handleM1Blur);

    // Mobile touch controls setup
    function bindTouchKey(el, keyName) {
        const press = (e) => { e.preventDefault(); keys[keyName] = true; };
        const release = (e) => { e.preventDefault(); keys[keyName] = false; };
        el.addEventListener("pointerdown", press);
        el.addEventListener("pointerup", release);
        el.addEventListener("pointercancel", release);
        el.addEventListener("pointerleave", release);
    }

    document.querySelectorAll("[data-m1-key]").forEach(btn => {
        bindTouchKey(btn, btn.dataset.m1Key);
    });

    const nvBtn = document.getElementById("touchNightVision");
    if (nvBtn) {
        nvBtn.addEventListener("click", (e) => {
            e.preventDefault();
            toggleNightVision();
        });
    }

    cleanupM1 = function() {
        m1Active = false;
        if (m1AnimId) {
            cancelAnimationFrame(m1AnimId);
            m1AnimId = null;
        }
        document.removeEventListener("keydown", handleM1KeyDown);
        document.removeEventListener("keyup", handleM1KeyUp);
        window.removeEventListener("blur", handleM1Blur);
        Object.keys(keys).forEach(k => { keys[k] = false; });
    };

    function movePlayer() {
        if (!m1Active) return;

        if (keys["arrowleft"] || keys["a"]) playerX -= horizontalSpeed;
        if (keys["arrowright"] || keys["d"]) playerX += horizontalSpeed;
        if (keys["arrowup"] || keys["w"]) playerY -= verticalSpeed;
        if (keys["arrowdown"] || keys["s"]) playerY += verticalSpeed;

        const playerWidth = 30;
        playerX = Math.max(playerWidth, Math.min(worldWidth - playerWidth, playerX));

        const playerHeight = 70;
        playerY = Math.max(playerHeight / 2, Math.min(gameArea.clientHeight - playerHeight / 2, playerY));

        const screenWidth = gameArea.clientWidth;
        const maxCamera = worldWidth - screenWidth;
        const cameraStart = screenWidth * 0.70;

        if (playerX > cameraStart) {
            const targetCamera = playerX - cameraStart;
            cameraX += (targetCamera - cameraX) * 0.5;
        } else {
            cameraX = 0;
        }

        cameraX = Math.max(0, Math.min(maxCamera, cameraX));

        player.style.left = (playerX - cameraX) + "px";
        player.style.top = playerY + "px";
        world.style.transform = `translateX(${-cameraX}px)`;

        checkClues();

        if (m1Active) {
            m1AnimId = requestAnimationFrame(movePlayer);
        }
    }

    function checkClues() {
        const clues = document.querySelectorAll(".clue");
        clues.forEach((clue) => {
            if (clue.dataset.collected === "true") return;

            const clueRect = clue.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            const touching =
                playerRect.left < clueRect.right &&
                playerRect.right > clueRect.left &&
                playerRect.top < clueRect.bottom &&
                playerRect.bottom > clueRect.top;

            if (touching) {
                clue.dataset.collected = "true";
                clue.style.display = "none";
                cluesCollected++;

                const scoreEl = document.getElementById("score");
                if (scoreEl) scoreEl.textContent = `CLUES: ${cluesCollected} / 3`;

                if (cluesCollected === 3) {
                    missionComplete();
                }
            }
        });
    }

    function missionComplete() {
        if (cleanupM1) { cleanupM1(); cleanupM1 = null; }

        setTimeout(() => {
            const area = document.querySelector(".game-area");
            if (!area) return;

            area.innerHTML = `
                <div class="complete-screen investigation-panel">
                    <p class="mission-label">NIGHTFALL PROTOCOL</p>
                    <h1>MISSION COMPLETE</h1>
                    <div class="mission-line"></div>
                    <p class="mission-text">
                        All clues recovered.
                        <br><br>
                        Gotham is one step closer to understanding the darkness.
                    </p>
                    <div class="achievement">
                        🏆 ACHIEVEMENT UNLOCKED
                        <br><br>
                        <strong>FIRST NIGHT</strong>
                    </div>
                    <button id="nextMissionButton">
                        ▶ BEGIN MISSION 02: NIGHT DRIVE
                    </button>
                </div>
            `;

            document
                .getElementById("nextMissionButton")
                ?.addEventListener("click", startMissionTwo);
        }, 500);
    }

    m1AnimId = requestAnimationFrame(movePlayer);
}

function startMissionTwo() {
    if (cleanupM1) { cleanupM1(); cleanupM1 = null; }
    if (cleanupM2) { cleanupM2(); cleanupM2 = null; }

    const city = document.querySelector(".city");
    if (!city) return;

    city.innerHTML = `
        <div class="game-area mission-two-area">
            <div class="game-header">
                <span>GOTHAM: NIGHTFALL</span>
                <span>MISSION 02: NIGHT DRIVE</span>
                <span id="drive-health">HEALTH: ♥ ♥ ♥</span>
                <span id="drive-distance">DISTANCE: 0%</span>
            </div>

            <div class="drive-scene" id="driveScene">
                <div class="signal-status" id="signalStatus">SIGNAL: 0/1</div>
                <div class="nitro-status" id="nitroStatus" style="cursor: pointer;" title="Hold Shift or Tap to Boost">NITRO: READY [SHIFT]</div>

                <div class="drive-skyline" id="driveSkyline">
                    <div class="drive-building db1"></div>
                    <div class="drive-building db2"></div>
                    <div class="drive-building db3"></div>
                    <div class="drive-building db4"></div>
                    <div class="drive-building db5"></div>
                    <div class="drive-building db6"></div>
                </div>

                <div class="drive-obstacles" id="driveObstacles"></div>

                <div class="drive-road">
                    <div class="road-edge road-edge-top"></div>
                    <div class="road-edge road-edge-bottom"></div>
                    <div class="road-markings" id="roadMarkings">
                        <span></span><span></span><span></span>
                        <span></span><span></span><span></span>
                    </div>
                </div>

                <div class="nightfall-car" id="nightfallCar">
                    <div class="car-aero"></div>
                    <div class="car-body"></div>
                    <div class="car-window"></div>
                    <div class="car-roof"></div>
                    <div class="car-wheel wheel-left"></div>
                    <div class="car-wheel wheel-right"></div>
                    <div class="car-light car-light-left"></div>
                    <div class="car-light car-light-right"></div>
                </div>

                <div class="drive-start-message">
                    NIGHTFALL-X SYSTEMS ONLINE
                </div>
            </div>

            <div class="instructions">
                DRIVE: W / ↑ &nbsp; | &nbsp; STEER: A / D OR ← / → &nbsp; | &nbsp; NITRO: SHIFT
            </div>

            <!-- MOBILE TOUCH CONTROLS -->
            <div class="mobile-controls m2-touch-controls" id="m2TouchControls">
                <div class="touch-steer-group">
                    <button type="button" class="touch-btn" data-m2-key="arrowleft" aria-label="Steer Left">◀ STEER</button>
                    <button type="button" class="touch-btn" data-m2-key="arrowright" aria-label="Steer Right">STEER ▶</button>
                </div>
                <div class="touch-action-group">
                    <button type="button" class="touch-btn touch-drive" data-m2-key="arrowup" aria-label="Accelerate">▲ DRIVE</button>
                    <button type="button" class="touch-btn touch-nitro" data-m2-key="shift" aria-label="Nitro">⚡ NITRO</button>
                </div>
            </div>
        </div>
    `;

    const car = document.getElementById("nightfallCar");
    const roadMarkings = document.getElementById("roadMarkings");
    const distanceDisplay = document.getElementById("drive-distance");
    const driveScene = document.getElementById("driveScene");
    const healthDisplay = document.getElementById("drive-health");
    const signalStatus = document.getElementById("signalStatus");
    const nitroStatus = document.getElementById("nitroStatus");
    const obstacleContainer = document.getElementById("driveObstacles");

    let health = 3;
    let gameOver = false;
    let signalCollected = false;
    let signalSpawned = false;
    let signalFragment = null;

    let nitroCharge = 100;
    let nitroActive = false;
    let nitroLocked = false;

    let carPosition = 16;
    let distance = 0;
    let roadOffset = 0;
    let obstacles = [];
    let obstacleSpawnTimer = 0;

    let m2Active = true;
    let m2AnimId = null;
    const driveKeys = {};

    function handleDriveKeyDown(event) {
        const key = event.key.toLowerCase();
        if (["arrowleft", "arrowright", "arrowup", "shift"].includes(key)) {
            event.preventDefault();
        }
        driveKeys[key] = true;
    }

    function handleDriveKeyUp(event) {
        driveKeys[event.key.toLowerCase()] = false;
    }

    function handleDriveBlur() {
        Object.keys(driveKeys).forEach(key => { driveKeys[key] = false; });
    }

    document.addEventListener("keydown", handleDriveKeyDown);
    document.addEventListener("keyup", handleDriveKeyUp);
    window.addEventListener("blur", handleDriveBlur);

    // Mobile touch controls setup
    function bindTouchDriveKey(el, keyName) {
        const press = (e) => { e.preventDefault(); driveKeys[keyName] = true; };
        const release = (e) => { e.preventDefault(); driveKeys[keyName] = false; };
        el.addEventListener("pointerdown", press);
        el.addEventListener("pointerup", release);
        el.addEventListener("pointercancel", release);
        el.addEventListener("pointerleave", release);
    }

    document.querySelectorAll("[data-m2-key]").forEach(btn => {
        bindTouchDriveKey(btn, btn.dataset.m2Key);
    });

    if (nitroStatus) {
        bindTouchDriveKey(nitroStatus, "shift");
    }

    cleanupM2 = function() {
        m2Active = false;
        if (m2AnimId) {
            cancelAnimationFrame(m2AnimId);
            m2AnimId = null;
        }
        document.removeEventListener("keydown", handleDriveKeyDown);
        document.removeEventListener("keyup", handleDriveKeyUp);
        window.removeEventListener("blur", handleDriveBlur);
        document.onkeydown = null;
        document.onkeyup = null;
        Object.keys(driveKeys).forEach(key => { driveKeys[key] = false; });
    };

    function spawnObstacle() {
        if (!obstacleContainer) return;
        const obstacle = document.createElement("div");
        obstacle.className = "road-obstacle";
        obstacle.style.left = (Math.random() * 65 + 10) + "%";
        obstacle.style.top = "-40px";
        obstacleContainer.appendChild(obstacle);
        obstacles.push({
            element: obstacle,
            y: -40,
            hit: false
        });
    }

    function driveLoop() {
        if (!m2Active) return;

        if (driveKeys["a"] || driveKeys["arrowleft"]) {
            carPosition -= 0.3;
        }
        if (driveKeys["d"] || driveKeys["arrowright"]) {
            carPosition += 0.3;
        }

        carPosition = Math.max(2, Math.min(75, carPosition));
        if (car) car.style.left = carPosition + "%";

        const accelerating = driveKeys["w"] || driveKeys["arrowup"];

        // Nitro management
        if (nitroCharge <= 0) {
            nitroCharge = 0;
            nitroLocked = true;
        }

        if (nitroLocked) {
            nitroActive = false;
            nitroCharge = Math.min(100, nitroCharge + 0.25);
            if (!driveKeys["shift"] && nitroCharge >= 30) {
                nitroLocked = false;
            }
        } else {
            nitroActive = accelerating && driveKeys["shift"] && nitroCharge > 0;
            if (nitroActive) {
                nitroCharge = Math.max(0, nitroCharge - 0.6);
                if (nitroCharge <= 0) {
                    nitroCharge = 0;
                    nitroLocked = true;
                    nitroActive = false;
                }
            } else {
                nitroCharge = Math.min(100, nitroCharge + 0.25);
            }
        }

        if (nitroStatus) {
            if (nitroActive) {
                nitroStatus.textContent = "NITRO: BOOSTING " + Math.ceil(nitroCharge) + "%";
                if (car) car.style.filter = "drop-shadow(0 0 12px #38e8ff) brightness(1.25)";
            } else {
                nitroStatus.textContent = (nitroCharge >= 99 && !nitroLocked)
                    ? "NITRO: READY [SHIFT]"
                    : "NITRO: RECHARGING " + Math.ceil(nitroCharge) + "%";
                if (car && !car.dataset.hitFlash) car.style.filter = "";
            }
        }

        if (accelerating) {
            distance = Math.min(100, distance + (nitroActive ? 0.10 : 0.05));
            roadOffset = (roadOffset + (nitroActive ? 8 : 4)) % 160;

            if (roadMarkings) {
                roadMarkings.style.transform = `translateX(${-roadOffset}px)`;
            }

            obstacleSpawnTimer++;
            if (obstacleSpawnTimer >= 100) {
                spawnObstacle();
                obstacleSpawnTimer = 0;
            }

            if (car) {
                const carRect = car.getBoundingClientRect();

                obstacles.forEach(obstacle => {
                    obstacle.y += nitroActive ? 5 : 3;
                    obstacle.element.style.top = obstacle.y + "px";

                    const obstacleRect = obstacle.element.getBoundingClientRect();
                    const collision =
                        carRect.left < obstacleRect.right &&
                        carRect.right > obstacleRect.left &&
                        carRect.top < obstacleRect.bottom &&
                        carRect.bottom > obstacleRect.top;

                    if (collision && !obstacle.hit && !gameOver) {
                        obstacle.hit = true;
                        obstacle.element.remove();
                        health = Math.max(0, health - 1);

                        if (healthDisplay) {
                            healthDisplay.textContent = "HEALTH: " + "♥ ".repeat(health).trim();
                        }

                        car.dataset.hitFlash = "true";
                        car.style.filter = "brightness(2) sepia(1) saturate(8) hue-rotate(-40deg)";
                        setTimeout(() => {
                            if (car) {
                                delete car.dataset.hitFlash;
                                car.style.filter = "";
                            }
                        }, 300);

                        if (health <= 0) {
                            gameOver = true;
                            if (cleanupM2) { cleanupM2(); cleanupM2 = null; }

                            if (driveScene) {
                                driveScene.innerHTML = `
                                    <div class="complete-screen">
                                        <p class="mission-label">NIGHTFALL PROTOCOL</p>
                                        <h1>VEHICLE DISABLED</h1>
                                        <div class="mission-line"></div>
                                        <p class="mission-text">
                                            Nightfall-X has sustained critical damage.
                                            <br><br>
                                            Gotham isn't finished with you yet.
                                        </p>
                                        <button id="restartMissionButton">
                                            ↻ RETRY MISSION
                                        </button>
                                    </div>
                                `;

                                document
                                    .getElementById("restartMissionButton")
                                    ?.addEventListener("click", startMissionTwo);
                            }
                            return;
                        }
                    }
                });
            }

            obstacles = obstacles.filter(obstacle => {
                if (obstacle.hit || obstacle.y > (driveScene ? driveScene.clientHeight : 500) || !obstacle.element.isConnected) {
                    obstacle.element.remove();
                    return false;
                }
                return true;
            });

            if (!signalSpawned && distance >= 35 && obstacles.every(obstacle => obstacle.y > 45)) {
                signalFragment = document.createElement("div");
                signalFragment.className = "signal-fragment";
                signalFragment.style.left = (Math.random() * 65 + 10) + "%";
                signalFragment.style.top = "-35px";
                if (driveScene) driveScene.appendChild(signalFragment);
                signalSpawned = true;
            }

            if (signalFragment && !signalCollected && car) {
                const signalTop = parseFloat(signalFragment.style.top) + 3;
                signalFragment.style.top = signalTop + "px";

                const carRect = car.getBoundingClientRect();
                const signalRect = signalFragment.getBoundingClientRect();

                const signalCollision =
                    carRect.left < signalRect.right &&
                    carRect.right > signalRect.left &&
                    carRect.top < signalRect.bottom &&
                    carRect.bottom > signalRect.top;

                if (signalCollision) {
                    signalCollected = true;
                    if (signalStatus) {
                        signalStatus.textContent = "SIGNAL: 1/1";
                        signalStatus.style.boxShadow = "0 0 15px rgba(56, 232, 255, 0.8)";
                    }
                    signalFragment.remove();
                    signalFragment = null;
                } else if (driveScene && signalTop > driveScene.clientHeight) {
                    signalFragment.remove();
                    signalFragment = null;
                }
            }

            if (gameOver) return;
        }

        if (distanceDisplay) {
            distanceDisplay.textContent = "DISTANCE: " + Math.floor(distance) + "%";
        }

        if (distance >= 100) {
            if (cleanupM2) { cleanupM2(); cleanupM2 = null; }

            if (driveScene) {
                driveScene.innerHTML = `
                    <div class="complete-screen mission-two-finale">
                        <p class="mission-label">NIGHTFALL PROTOCOL</p>
                        <p class="transmission-label">▸ INCOMING TRANSMISSION DETECTED</p>
                        <h1>${signalCollected ? "SIGNAL DECRYPTED" : "ROUTE CLEARED"}</h1>
                        <div class="mission-line"></div>
                        <p class="mission-text">
                            ${signalCollected
                                ? "The signal fragment has been recovered and decrypted."
                                : "Nightfall-X has reached the Industrial District, but the signal fragment is missing."}
                        </p>
                        <p class="transmission-message">
                            ${signalCollected
                                ? "THE BLACKOUT WAS ONLY THE BEGINNING."
                                : "TRANSMISSION LOCKED // SIGNAL FRAGMENT NOT RECOVERED."}
                        </p>
                        <div class="achievement">
                            🏆 ACHIEVEMENT UNLOCKED
                            <br><br>
                            <strong>NIGHT DRIVER</strong>
                            ${signalCollected ? "<br><br>📡 SECRET EVIDENCE RECOVERED" : ""}
                        </div>
                        <button id="nextMissionThreeButton">
                            ▶ BEGIN MISSION 03: THE HIDDEN SIGNAL
                        </button>
                    </div>
                `;

                document
                    .getElementById("nextMissionThreeButton")
                    ?.addEventListener("click", startMissionThree);
            }
            return;
        }

        if (m2Active) {
            m2AnimId = requestAnimationFrame(driveLoop);
        }
    }

    m2AnimId = requestAnimationFrame(driveLoop);
}

function startMissionThree() {
    if (cleanupM1) { cleanupM1(); cleanupM1 = null; }
    if (cleanupM2) { cleanupM2(); cleanupM2 = null; }
    document.onkeydown = null;
    document.onkeyup = null;

    const city = document.querySelector(".city");
    if (!city) return;

    city.innerHTML = `
        <div class="game-area mission-three-area">
            <div class="game-header">
                <span>GOTHAM: NIGHTFALL</span>
                <span>MISSION 03: THE HIDDEN SIGNAL</span>
                <span>CASE FILE: ENCRYPTED</span>
            </div>

            <div class="complete-screen">
                <p class="mission-label">BATCOMPUTER // CASE FILE 03</p>
                <h1>THE HIDDEN SIGNAL</h1>
                <div class="mission-line"></div>
                <p class="mission-text">
                    An intercepted transmission has led you to an abandoned communications facility.
                    <br><br>
                    Someone inside Gotham's security network authorised the blackout.
                    <br><br>
                    Find the evidence. Break the cipher.
                    Discover who is behind the signal.
                </p>
                <div class="achievement">
                    MISSION OBJECTIVE
                    <br><br>
                    <strong>RECOVER 3 PIECES OF EVIDENCE</strong>
                </div>
                <button id="enterFacilityButton">▶ ENTER FACILITY</button>
            </div>
        </div>
    `;

    document
        .getElementById("enterFacilityButton")
        ?.addEventListener("click", startInvestigation);
}

function startInvestigation() {
    document.onkeydown = null;
    document.onkeyup = null;

    document.querySelector(".city").innerHTML = `
        <div class="game-area mission-three-area">

            <div class="game-header">
                <span>GOTHAM: NIGHTFALL</span>
                <span>MISSION 03: THE HIDDEN SIGNAL</span>
                <span id="evidenceCounter">EVIDENCE: 0/3</span>
            </div>

            <div class="investigation-panel">
                <p class="mission-label">
                    BATCOMPUTER // FORENSIC MODE
                </p>

                <h1>COMMUNICATIONS FACILITY</h1>

                <div class="mission-line"></div>

                <p class="mission-text">
                    The signal ends here.
                    <br><br>
                    Three pieces of evidence remain hidden
                    inside this abandoned facility.
                    <br><br>
                    Recover the evidence to reconstruct
                    the encrypted access code.
                </p>

                
<div class="evidence-grid">

    <button class="evidence-card" data-evidence="1" type="button">
        <span class="evidence-icon">◈</span>
        <strong>01 // SIGNAL LOG</strong>
        <span>Inspect the carrier frequency record.</span>
        <small>STATUS: UNEXAMINED</small>
    </button>

    <button class="evidence-card" data-evidence="2" type="button">
        <span class="evidence-icon">⌁</span>
        <strong>02 // OPERATOR NOTE</strong>
        <span>Recover a damaged handwritten note.</span>
        <small>STATUS: UNEXAMINED</small>
    </button>

    <button class="evidence-card" data-evidence="3" type="button">
        <span class="evidence-icon">▤</span>
        <strong>03 // CORRUPTED LOG</strong>
        <span>Analyse the damaged system record.</span>
        <small>STATUS: UNEXAMINED</small>
    </button>

</div>

<p id="evidenceMessage" class="evidence-message">
    SELECT AN EVIDENCE FILE TO BEGIN INVESTIGATION.
</p>
<button id="openDecryptButton" hidden>
    🔐 ACCESS BATCOMPUTER
</button>

                <p class="mission-label">
                    INVESTIGATION STATUS: IN PROGRESS
                </p>

            </div>
        </div>
    `;
    
    // MISSION 03: EVIDENCE INVESTIGATION

    const evidenceCounter =
        document.getElementById("evidenceCounter");

    const evidenceMessage =
        document.getElementById("evidenceMessage");
    
    const openDecryptButton =
        document.getElementById("openDecryptButton");
    
    
openDecryptButton.addEventListener("click", () => {
    if (document.getElementById("decryptTerminal")) return;

    const terminal = document.createElement("div");
    terminal.id = "decryptTerminal";

    terminal.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 24px;
        overflow-y: auto;
        background:
            radial-gradient(ellipse at 50% 40%, #102b3c 0%, #040910 65%, #010306 100%);
        color: #d9f7ff;
        font-family: monospace;
    `;

    terminal.innerHTML = `
        <style>
            @keyframes batPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.35; }
            }

            @keyframes batScan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(500%); }
            }

            @keyframes batBlink {
                50% { opacity: 0; }
            }

            #decryptTerminal .bc-frame {
                position: relative;
                width: min(1050px, 100%);
                min-height: 560px;
                padding: clamp(20px, 4vw, 42px);
                overflow: hidden;
                border: 1px solid #21bfd0;
                background:
                    linear-gradient(rgba(5, 17, 27, 0.93),
                                    rgba(2, 7, 13, 0.98));
                box-shadow: 0 0 35px #00cfff20,
                            inset 0 0 35px #00cfff08;
            }

            #decryptTerminal .bc-frame::before {
                content: "";
                position: absolute;
                inset: 0;
                pointer-events: none;
                background: repeating-linear-gradient(
                    transparent 0px,
                    transparent 4px,
                    #00cfff08 5px
                );
            }

            #decryptTerminal .bc-topbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
                padding-bottom: 18px;
                border-bottom: 1px solid #1b4959;
                color: #79dfef;
                font-size: 12px;
                letter-spacing: 2px;
            }

            #decryptTerminal .bc-status {
                color: #ff626f;
                animation: batPulse 1.5s infinite;
            }

            #decryptTerminal .bc-kicker {
                margin-top: 45px;
                color: #35d8ec;
                font-size: 12px;
                letter-spacing: 4px;
            }

            #decryptTerminal .bc-title {
                margin: 14px 0;
                font-family: Arial, sans-serif;
                font-size: clamp(30px, 5vw, 56px);
                font-weight: 800;
                letter-spacing: 3px;
                line-height: 1.1;
                text-shadow: 0 0 22px #00d9ff35;
            }

            #decryptTerminal .bc-subtitle {
                color: #8da9ba;
                letter-spacing: 2px;
                font-size: 12px;
            }

            #decryptTerminal .bc-divider {
                width: 90px;
                height: 3px;
                margin: 25px 0;
                background: #26d5e9;
                box-shadow: 0 0 12px #26d5e9;
            }

            #decryptTerminal .bc-message {
                color: #b5cad8;
                font-size: 14px;
                line-height: 1.9;
                max-width: 650px;
            }

            #decryptTerminal .bc-console {
                margin-top: 30px;
                padding: 20px;
                border: 1px solid #174252;
                background: #02080d;
                color: #70e8c4;
                font-size: 12px;
                line-height: 2;
                overflow-wrap: anywhere;
            }

            #decryptTerminal .bc-cursor {
                display: inline-block;
                width: 8px;
                height: 14px;
                vertical-align: middle;
                background: #47f0d0;
                animation: batBlink 0.8s infinite;
            }

            #decryptTerminal .bc-bottom {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 18px;
                margin-top: 28px;
            }

            #decryptTerminal .bc-return {
                padding: 13px 18px;
                border: 1px solid #25d6ea;
                background: transparent;
                color: #8ef4ff;
                font-family: monospace;
                font-size: 12px;
                letter-spacing: 1px;
                cursor: pointer;
                transition: background 0.2s, box-shadow 0.2s;
            }

            #decryptTerminal .bc-return:hover {
                background: #0a3443;
                box-shadow: 0 0 18px #00d9ff30;
            }

            #decryptTerminal .bc-footer {
                color: #567181;
                font-size: 10px;
                letter-spacing: 2px;
            }

            @media (max-width: 600px) {
                #decryptTerminal .bc-kicker {
                    margin-top: 30px;
                }

                #decryptTerminal .bc-frame {
                    min-height: auto;
                }
            }
        </style>

        <div class="bc-frame">
            <div class="bc-topbar">
                <span>🦇 WAYNE SYSTEMS // BATCOMPUTER</span>
                <span class="bc-status">● SECURITY LOCKED</span>
            </div>

            <div class="bc-kicker">
                INCOMING TRANSMISSION // NODE 03
            </div>

            <h1 class="bc-title">
                ENCRYPTED<br>TRANSMISSION
            </h1>

            <div class="bc-subtitle">
                GOTHAM MUNICIPAL NETWORK / CLASSIFIED
            </div>

            <div class="bc-divider"></div>

            <p class="bc-message">
                Three evidence fragments have been recovered.
                Their relationship has exposed a hidden access protocol.
                The intercepted transmission remains encrypted.
            </p>

            <div class="bc-console">
                <div>&gt; BATCOMPUTER INITIALIZED</div>
                <div>&gt; EVIDENCE DATABASE ........ VERIFIED</div>
                <div>&gt; TRANSMISSION SOURCE ...... UNIDENTIFIED</div>
                <div>&gt; DECRYPTION PROTOCOL ...... STANDBY</div>
                <div style="color:#ff6877;">
                    &gt; WARNING: UNAUTHORIZED ACCESS DETECTED
                </div>
                <div style="margin-top:8px;">
                    &gt; AWAITING OPERATOR COMMAND
                    <span class="bc-cursor"></span>
                </div>
            </div>
            
            <div style="
    margin-top: 28px;
    padding: 22px;
    border: 1px solid #16758a;
    background: #030b12;
">
    <p style="color: #36d9ee; letter-spacing: 3px;">
        // DECRYPTION CHALLENGE
    </p>

    <h2 style="color: #d9f7ff;">
        RECONSTRUCT ACCESS KEY
    </h2>

    <p style="color: #91acbd;">
        Three clues. One access code. Three attempts.
    </p>

    <input
        id="accessCodeInput"
        type="text"
        maxlength="3"
        placeholder="_ _ _"
        style="
            width: 140px;
            padding: 12px;
            background: #010509;
            border: 1px solid #23cce3;
            color: #7dffe2;
            font: bold 22px monospace;
            letter-spacing: 8px;
        "
    >

    <button id="submitAccessCode" type="button" style="
        padding: 14px;
        margin-left: 10px;
        background: #062632;
        border: 1px solid #29cce3;
        color: #72f1ff;
        font-family: monospace;
        cursor: pointer;
    ">
        DECRYPT →
    </button>

    <p id="decryptFeedback" style="color: #f3c86a;">
        SYSTEM READY. AWAITING ACCESS KEY.
    </p>
</div>
            
            <div class="bc-bottom">
                <button
                    type="button"
                    id="closeDecryptTerminal"
                    class="bc-return"
                >
                    ← RETURN TO INVESTIGATION
                </button>

                <span class="bc-footer">
                    GOTHAM CITY // SECURE CHANNEL
                </span>
            </div>
        </div>
    `;

    document.body.appendChild(terminal);
    const codeInput = terminal.querySelector("#accessCodeInput");
const submitCode = terminal.querySelector("#submitAccessCode");
const feedback = terminal.querySelector("#decryptFeedback");
const attemptsDisplay = terminal.querySelector("#decryptAttempts");
let reveal = terminal.querySelector("#decryptedReveal");

if (!reveal) {
    reveal = document.createElement("div");
    reveal.id = "decryptedReveal";

    reveal.style.cssText = `
        margin-top: 24px;
        padding: 24px;
        border: 1px solid #47e9bb;
        background: #031711;
        color: #8fffd8;
        line-height: 1.9;
        overflow-wrap: anywhere;
    `;

    reveal.hidden = true;

    reveal.innerHTML = `
        <p style="letter-spacing: 3px;">
            ACCESS GRANTED // CLASSIFIED FILE DECRYPTED
        </p>

        <h2 style="
            font-family: Arial, sans-serif;
            font-size: clamp(24px, 4vw, 38px);
            line-height: 1.25;
        ">
            THE SIGNAL WAS A DECOY
        </h2>

        <p>
            The communications facility was never the real target.
            Someone used it to conceal a transmission from inside
            Gotham's own security network.
        </p>

        <p>
            The decrypted file identifies a second operation
            already in motion. Its destination has been erased.
        </p>

        <p style="color: #f0c76b;">
            NEW INTELLIGENCE RECOVERED.
        </p>

        <p style="color: #91aaba; font-size: 12px;">
            CASE STATUS: OPEN
        </p>
        <div id="finaleSequence" hidden style="
    margin-top: 28px;
    padding: 24px;
    border: 1px solid #315363;
    background: #02060b;
    text-align: center;
">
    <p id="finaleStatus" style="
        color: #ff6877;
        font-size: 11px;
        letter-spacing: 3px;
    ">
        ⚠ INCOMING TRANSMISSION
    </p>

    <h2 id="finaleHeadline" style="
        color: #d9f7ff;
        font-family: Arial, sans-serif;
        font-size: clamp(25px, 5vw, 42px);
        letter-spacing: 3px;
        line-height: 1.2;
    ">
        UNKNOWN SOURCE DETECTED
    </h2>

    <p id="finaleMessage" style="
        color: #9db7c6;
        line-height: 1.9;
    ">
        Someone has accessed the secure channel.
        Incoming message is being decoded...
    </p>

    <button id="startFinale" type="button" style="
        margin-top: 18px;
        padding: 15px 22px;
        background: #092631;
        border: 1px solid #38d9ed;
        color: #9af6ff;
        font-family: monospace;
        letter-spacing: 2px;
        cursor: pointer;
    ">
        TRACE THE TRANSMISSION →
    </button>
</div>


    `;

    feedback.insertAdjacentElement("afterend", reveal);
}
let attemptsLeft = 3;
let decrypted = false;

function checkAccessCode() {
    if (decrypted || attemptsLeft <= 0) return;

    const enteredCode = codeInput.value.trim();

    if (!/^\d{3}$/.test(enteredCode)) {
        feedback.textContent = "ENTER A VALID THREE-DIGIT ACCESS CODE.";
        feedback.style.color = "#f2c768";
        return;
    }

    if (enteredCode === "369") {
        decrypted = true;

        feedback.textContent =
            "ACCESS GRANTED. TRANSMISSION DECRYPTED.";
        feedback.style.color = "#58f3c7";

        reveal.hidden = false;
        const finaleSequence = terminal.querySelector("#finaleSequence");
if (finaleSequence) {
    finaleSequence.hidden = false;
}
        codeInput.disabled = true;
        submitCode.disabled = true;
        submitCode.textContent = "TRANSMISSION DECRYPTED ✓";
        submitCode.style.opacity = "0.5";
    const startFinale = terminal.querySelector("#startFinale");


startFinale?.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        const term = document.getElementById("decryptTerminal");
        if (term) term.remove();
        document.querySelectorAll("#signalPuzzle, #operatorPuzzle, #corruptedPuzzle").forEach(el => el.remove());
        startMissionFour();
    });


        return;
    }

    attemptsLeft--;

    attemptsDisplay.textContent =
        "ATTEMPTS REMAINING: " + attemptsLeft;

    codeInput.value = "";

    if (attemptsLeft > 0) {
        feedback.textContent =
            "ACCESS DENIED. RECONSTRUCT THE KEY FROM YOUR EVIDENCE.";
        feedback.style.color = "#ff6877";
    } else {
        feedback.textContent =
            "SECURITY LOCKOUT. NO ATTEMPTS REMAINING.";
        feedback.style.color = "#ff6877";

        codeInput.disabled = true;
        submitCode.disabled = true;
        submitCode.style.opacity = "0.4";
    }
}

submitCode.addEventListener("click", checkAccessCode);

codeInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        checkAccessCode();
    }
});
    terminal
        .querySelector("#closeDecryptTerminal")
        .addEventListener("click", () => {
            terminal.remove();
        });
});
    

    const evidenceCards =
        document.querySelectorAll(".evidence-card");

    const discoveredEvidence = new Set();

    const evidenceClues = {
        "1": "SIGNAL LOG RECOVERED: The carrier frequency is 3. This is the first digit of the access key.",
        "2": "OPERATOR NOTE RECOVERED: The second digit is twice the carrier frequency.",
        "3": "CORRUPTED LOG RECOVERED: The final digit is the sum of the first two digits."
    };

    evidenceCards.forEach(card => {
        card.addEventListener("click", () => {
            const evidenceId = card.dataset.evidence;
            if (evidenceId === "1" && !discoveredEvidence.has("1")) {
    if (document.getElementById("signalPuzzle")) return;

    const puzzle = document.createElement("div");
    puzzle.id = "signalPuzzle";

    puzzle.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99998;
        overflow-y: auto;
        padding: 18px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        background: #02060b;
        color: #d9f7ff;
        font-family: monospace;
    `;

    puzzle.innerHTML = `
        <div style="
            width: min(760px, 100%);
            margin: auto;
            padding: clamp(18px, 4vw, 34px);
            border: 1px solid #27d9ed;
            background: linear-gradient(145deg, #091925, #03080d);
            box-shadow: 0 0 35px #00d9ff18;
            box-sizing: border-box;
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
                color: #52deed;
                font-size: 11px;
                letter-spacing: 2px;
            ">
                <span>WAYNE SYSTEMS // FORENSICS</span>
                <span>CASE 01 / SIGNAL LOG</span>
            </div>

            <div style="
                margin-top: 28px;
                color: #ff7784;
                font-size: 11px;
                letter-spacing: 2px;
            ">
                ● TRANSMISSION CORRUPTED
            </div>

            <h1 style="
                font-family: Arial, sans-serif;
                font-size: clamp(27px, 5vw, 42px);
                letter-spacing: 2px;
                margin-bottom: 8px;
            ">
                GHOST SIGNAL
            </h1>

            <p style="
                color: #99b3c2;
                line-height: 1.8;
                font-size: 14px;
            ">
                Someone tried to erase this transmission.
                Three fragments survived, but they have been
                separated from their original sequence.
            </p>

            <div style="
                padding: 15px;
                margin: 22px 0;
                background: #02070b;
                border: 1px solid #164758;
            ">
                <div style="
                    color: #4de7c2;
                    font-size: 11px;
                    letter-spacing: 2px;
                    margin-bottom: 12px;
                ">
                    INTERCEPTED DATA // PARTIAL RECOVERY
                </div>

                <svg viewBox="0 0 600 75"
                    role="img"
                    aria-label="Damaged radio waveform"
                    style="width: 100%; height: auto; display: block;">
                    <defs>
                        <pattern id="signalGrid"
                            width="30" height="15"
                            patternUnits="userSpaceOnUse">
                            <path d="M30 0H0V15"
                                fill="none"
                                stroke="#123342"
                                stroke-width="1"/>
                        </pattern>
                    </defs>

                    <rect width="600" height="75"
                        fill="url(#signalGrid)"/>

                    <path
                        d="M0 38 H35 L45 30 L55 47 L65 38
                        H110 L120 15 L130 60 L140 38
                        H190 L200 32 L210 44 L220 38
                        H275 L285 8 L295 65 L305 38
                        H355 L365 28 L375 48 L385 38
                        H435 L445 14 L455 61 L465 38 H600"
                        fill="none"
                        stroke="#37e9cf"
                        stroke-width="2"
                        opacity="0.85"/>
                </svg>

                <p style="
                    color: #e7bd77;
                    font-size: 12px;
                    line-height: 1.8;
                    margin-bottom: 0;
                ">
                    RECOVERED MESSAGE:
                    "THE PATH BEGINS WHERE THE SIGNAL BEGINS.
                    MATCH EACH EXIT TO THE NEXT ENTRY."
                </p>
            </div>

            <h3 style="
                color: #71eafa;
                font-size: 13px;
                letter-spacing: 2px;
            ">
                RECOVERED FRAGMENTS
            </h3>

            <p style="
                color: #93aebe;
                font-size: 12px;
                line-height: 1.7;
            ">
                Tap a fragment, then tap a sequence slot.
                Connect the matching symbols from START to END.
            </p>

            <div style="
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 9px;
                margin: 16px 0 26px;
            ">
                <button type="button" data-fragment="B"
                    style="padding: 14px 5px; min-width: 0;
                    overflow-wrap: anywhere; background: #0a1721;
                    border: 1px solid #315365; color: #c7eefa;
                    font: 12px monospace; cursor: pointer;">
                    FRAGMENT B
                    <br><br>
                    <strong style="font-size: 15px;">● → END</strong>
                </button>

                <button type="button" data-fragment="A"
                    style="padding: 14px 5px; min-width: 0;
                    overflow-wrap: anywhere; background: #0a1721;
                    border: 1px solid #315365; color: #c7eefa;
                    font: 12px monospace; cursor: pointer;">
                    FRAGMENT A
                    <br><br>
                    <strong style="font-size: 15px;">START → ▲</strong>
                </button>

                <button type="button" data-fragment="C"
                    style="padding: 14px 5px; min-width: 0;
                    overflow-wrap: anywhere; background: #0a1721;
                    border: 1px solid #315365; color: #c7eefa;
                    font: 12px monospace; cursor: pointer;">
                    FRAGMENT C
                    <br><br>
                    <strong style="font-size: 15px;">▲ → ●</strong>
                </button>
            </div>

            <h3 style="
                color: #71eafa;
                font-size: 13px;
                letter-spacing: 2px;
            ">
                RECONSTRUCT THE SEQUENCE
            </h3>

            <div style="
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 9px;
                margin: 16px 0;
            ">
                <button type="button" data-slot="0"
                    style="padding: 18px 4px; min-width: 0;
                    background: #030a10; border: 1px dashed #387084;
                    color: #7da7b8; font: 11px monospace;
                    overflow-wrap: anywhere; cursor: pointer;">
                    SLOT 01<br><br>EMPTY
                </button>

                <button type="button" data-slot="1"
                    style="padding: 18px 4px; min-width: 0;
                    background: #030a10; border: 1px dashed #387084;
                    color: #7da7b8; font: 11px monospace;
                    overflow-wrap: anywhere; cursor: pointer;">
                    SLOT 02<br><br>EMPTY
                </button>

                <button type="button" data-slot="2"
                    style="padding: 18px 4px; min-width: 0;
                    background: #030a10; border: 1px dashed #387084;
                    color: #7da7b8; font: 11px monospace;
                    overflow-wrap: anywhere; cursor: pointer;">
                    SLOT 03<br><br>EMPTY
                </button>
            </div>

            <p id="signalFeedback" aria-live="polite"
                style="min-height: 38px; color: #e7bd77;
                font-size: 12px; line-height: 1.8;">
                INVESTIGATION REQUIRED. REBUILD THE SIGNAL PATH.
            </p>

            <button id="reconstructSignal" type="button"
                style="width: 100%; padding: 16px;
                background: #07303a; border: 1px solid #37dfed;
                color: #9af6ff; font: bold 12px monospace;
                letter-spacing: 1px; cursor: pointer;">
                RECONSTRUCT TRANSMISSION →
            </button>

            <div id="signalReveal" hidden
                style="margin-top: 20px; padding: 20px;
                border: 1px solid #43e8c0; background: #031711;
                color: #8fffd8; line-height: 1.9;">
                <div style="letter-spacing: 2px;">
                    TRANSMISSION RESTORED
                </div>
                <h2 style="font-family: Arial, sans-serif;">
                    CARRIER CHANNEL: 03
                </h2>
                <p>
                    The signal is traced to a hidden communications
                    channel. One piece of the access key is recovered.
                </p>
            </div>

            <button id="leaveSignalPuzzle" type="button"
                style="margin-top: 22px; padding: 10px 0;
                border: none; background: transparent;
                color: #91aaba; font: 12px monospace;
                cursor: pointer;">
                ← RETURN TO FACILITY
            </button>
        </div>
    `;

    document.body.appendChild(puzzle);

    const fragments = {
        A: "START → ▲",
        B: "● → END",
        C: "▲ → ●"
    };

    const placements = [null, null, null];
    const selectedStyle = "#35e3df";
    let selectedFragment = null;
    let signalSolved = false;

    const feedback = puzzle.querySelector("#signalFeedback");
    const fragmentButtons =
        puzzle.querySelectorAll("[data-fragment]");
    const slotButtons =
        puzzle.querySelectorAll("[data-slot]");
    const reconstructButton =
        puzzle.querySelector("#reconstructSignal");
    const reveal = puzzle.querySelector("#signalReveal");

    function renderSignalSlots() {
        slotButtons.forEach((slot, index) => {
            const fragmentId = placements[index];

            slot.innerHTML = fragmentId
                ? "SLOT 0" + (index + 1) +
                  "<br><br><strong>" +
                  fragments[fragmentId] + "</strong>"
                : "SLOT 0" + (index + 1) + "<br><br>EMPTY";

            slot.style.borderStyle = fragmentId ? "solid" : "dashed";
            slot.style.borderColor = fragmentId
                ? selectedStyle : "#387084";
            slot.style.color = fragmentId ? "#8fffe5" : "#7da7b8";
        });

        fragmentButtons.forEach(button => {
            const isSelected =
                button.dataset.fragment === selectedFragment;

            button.style.borderColor = isSelected
                ? selectedStyle : "#315365";

            button.style.background = isSelected
                ? "#123442" : "#0a1721";
        });
    }

    fragmentButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (signalSolved) return;

            selectedFragment = button.dataset.fragment;

            feedback.textContent =
                "FRAGMENT " + selectedFragment +
                " SELECTED. CHOOSE A SEQUENCE SLOT.";

            feedback.style.color = "#e7bd77";
            renderSignalSlots();
        });
    });

    slotButtons.forEach((slot, index) => {
        slot.addEventListener("click", () => {
            if (signalSolved) return;

            if (!selectedFragment) {
                const existingFragment = placements[index];

                if (existingFragment) {
                    selectedFragment = existingFragment;
                    placements[index] = null;

                    feedback.textContent =
                        "FRAGMENT SELECTED. CHOOSE ITS NEW POSITION.";
                    renderSignalSlots();
                } else {
                    feedback.textContent =
                        "SELECT A FRAGMENT FIRST, THEN CHOOSE A SLOT.";
                }

                return;
            }

            const previousIndex =
                placements.indexOf(selectedFragment);

            if (previousIndex !== -1) {
                placements[previousIndex] = null;
            }

            placements[index] = selectedFragment;
            selectedFragment = null;

            feedback.textContent =
                "FRAGMENT PLACED. FOLLOW THE CONNECTING SYMBOLS.";

            renderSignalSlots();
        });
    });

    reconstructButton.addEventListener("click", () => {
        if (signalSolved) return;

        if (placements.some(fragment => fragment === null)) {
            feedback.textContent =
                "TRANSMISSION INCOMPLETE. FILL ALL THREE SLOTS.";
            feedback.style.color = "#ff7784";
            return;
        }

        const correctSequence = ["A", "C", "B"];
        const isCorrect = placements.every(
            (fragment, index) => fragment === correctSequence[index]
        );

        if (!isCorrect) {
            feedback.textContent =
                "SIGNAL PATH BROKEN. MATCH EACH EXIT TO THE NEXT ENTRY.";
            feedback.style.color = "#ff7784";
            return;
        }

        signalSolved = true;
        discoveredEvidence.add("1");
        card.classList.add("examined");

        const status = card.querySelector("small");
        if (status) status.textContent = "STATUS: RECOVERED";

        evidenceCounter.textContent =
            "EVIDENCE: " + discoveredEvidence.size + "/3";

        evidenceMessage.textContent =
            "SIGNAL LOG DECODED: CARRIER CHANNEL 03 RECOVERED.";

        feedback.textContent =
            "SIGNAL PATH RESTORED. TRANSMISSION DECRYPTED.";
        feedback.style.color = "#58f3c7";

        reveal.hidden = false;
        reconstructButton.disabled = true;
        reconstructButton.textContent = "TRANSMISSION RESTORED ✓";
        reconstructButton.style.opacity = "0.55";

        fragmentButtons.forEach(button => {
            button.disabled = true;
        });

        slotButtons.forEach(button => {
            button.disabled = true;
        });
    });

    puzzle.querySelector("#leaveSignalPuzzle").addEventListener(
        "click",
        () => puzzle.remove()
    );

    return;
}
if (evidenceId === "2") {
    if (discoveredEvidence.has("2")) {
        evidenceMessage.textContent =
            "OPERATOR NOTE DECODED: SECOND DIGIT IS 6.";
        return;
    }

    if (!discoveredEvidence.has("1")) {
        evidenceMessage.textContent =
            "SIGNAL LOG REQUIRED. TRACE THE GHOST SIGNAL FIRST.";
        return;
    }

    if (document.getElementById("operatorPuzzle")) return;

    const puzzle = document.createElement("div");
    puzzle.id = "operatorPuzzle";

    puzzle.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99998;
        overflow-y: auto;
        padding: 18px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        background: #03070d;
        color: #d9f7ff;
        font-family: monospace;
    `;

    puzzle.innerHTML = `
        <div style="
            box-sizing: border-box;
            width: min(680px, 100%);
            margin: auto;
            padding: clamp(18px, 4vw, 32px);
            border: 1px solid #c18a4b;
            background: linear-gradient(145deg, #17151a, #080b11);
        ">
            <p style="
                color: #f0b96d;
                font-size: 11px;
                letter-spacing: 2px;
            ">WAYNE SYSTEMS // FORENSICS 02</p>

            <h1 style="
                font-family: Arial, sans-serif;
                font-size: clamp(26px, 5vw, 40px);
                letter-spacing: 2px;
            ">THE OPERATOR'S CIPHER</h1>

            <p style="color:#aebdcc; line-height:1.8;">
                The operator encrypted a final message before
                abandoning the facility. You recovered the carrier
                channel from the Ghost Signal investigation.
            </p>

            <div style="
                margin: 22px 0;
                padding: 20px;
                background: #080a0d;
                border: 1px solid #55432f;
            ">
                <p style="
                    color: #e5ad62;
                    font-size: 11px;
                    letter-spacing: 2px;
                ">INTERCEPTED MESSAGE // ENCRYPTED</p>

                <p style="
                    color: #7fffd6;
                    font-size: clamp(17px, 3.6vw, 24px);
                    line-height: 1.8;
                    overflow-wrap: anywhere;
                ">VHFRQG GLJLW = GRXEOH WKH FDUULHU</p>

                <p style="color:#9aabb9; line-height:1.8;">
                    RECOVERED NOTE:
                    "The channel number is the key.
                    Shift the message BACK by that number."
                </p>

                <p style="
                    color: #f0b96d;
                    font-size: 12px;
                ">CIPHER KEY: CHANNEL 03</p>
            </div>

            <h3 style="
                color: #73e8f5;
                font-size: 13px;
                letter-spacing: 1px;
            ">DECRYPT THE MESSAGE</h3>

            <p style="color:#aebdcc; line-height:1.8;">
                Decode the transmission. What instruction did
                the operator leave behind?
            </p>

            <div style="display:grid; gap:12px; margin-top:20px;">
                <button type="button" data-answer="A" style="
                    padding: 16px;
                    text-align: left;
                    background: #0a141e;
                    border: 1px solid #314858;
                    color: #d9f7ff;
                    font: 13px monospace;
                    line-height: 1.7;
                    cursor: pointer;
                ">
                    A // SECOND DIGIT = CARRIER + 1
                </button>

                <button type="button" data-answer="B" style="
                    padding: 16px;
                    text-align: left;
                    background: #0a141e;
                    border: 1px solid #314858;
                    color: #d9f7ff;
                    font: 13px monospace;
                    line-height: 1.7;
                    cursor: pointer;
                ">
                    B // SECOND DIGIT = DOUBLE THE CARRIER
                </button>

                <button type="button" data-answer="C" style="
                    padding: 16px;
                    text-align: left;
                    background: #0a141e;
                    border: 1px solid #314858;
                    color: #d9f7ff;
                    font: 13px monospace;
                    line-height: 1.7;
                    cursor: pointer;
                ">
                    C // SECOND DIGIT = CARRIER × CARRIER
                </button>
            </div>

            <p id="operatorFeedback" aria-live="polite" style="
                min-height: 42px;
                color: #f0b96d;
                line-height: 1.8;
            ">TRANSMISSION LOCKED. AWAITING DECRYPTION.</p>

            <button type="button" id="leaveOperatorPuzzle" style="
                padding: 10px 0;
                border: none;
                background: transparent;
                color: #9aabb9;
                font: 12px monospace;
                cursor: pointer;
            ">← RETURN TO FACILITY</button>
        </div>
    `;

    document.body.appendChild(puzzle);

    const feedback = puzzle.querySelector("#operatorFeedback");
    const answers = puzzle.querySelectorAll("[data-answer]");
    let cipherSolved = false;

    answers.forEach(button => {
        button.addEventListener("click", () => {
            if (cipherSolved) return;

            if (button.dataset.answer !== "B") {
                feedback.textContent =
                    "DECRYPTION FAILED. CHECK THE CHANNEL KEY AND SHIFT DIRECTION.";
                feedback.style.color = "#ff7784";
                return;
            }

            cipherSolved = true;
            discoveredEvidence.add("2");
            card.classList.add("examined");

            const status = card.querySelector("small");
            if (status) status.textContent = "STATUS: RECOVERED";

            evidenceCounter.textContent =
                "EVIDENCE: " + discoveredEvidence.size + "/3";

            evidenceMessage.textContent =
                "OPERATOR CIPHER DECODED: SECOND DIGIT IS 6.";

            feedback.textContent =
                "CIPHER BROKEN. SECOND DIGIT RECOVERED: 6.";
            feedback.style.color = "#58f3c7";

            answers.forEach(answer => {
                answer.disabled = true;
                answer.style.opacity = "0.45";
            });

            button.style.opacity = "1";
            button.style.borderColor = "#58f3c7";

            if (
                discoveredEvidence.size === 3 &&
                !openDecryptButton.dataset.unlocked
            ) {
                setTimeout(() => {
                    if (discoveredEvidence.size === 3) {
                        evidenceMessage.textContent =
                            "ALL EVIDENCE RECOVERED. ACCESS CODE RULES ESTABLISHED.";

                        openDecryptButton.hidden = false;
                        openDecryptButton.dataset.unlocked = "true";
                    }
                }, 1500);
            }
        });
    });

    puzzle.querySelector("#leaveOperatorPuzzle").addEventListener(
        "click",
        () => puzzle.remove()
    );

    return;
}
if (evidenceId === "3") {
    if (discoveredEvidence.has("3")) {
        evidenceMessage.textContent =
            "CORRUPTED LOG RESTORED: FINAL DIGIT IS 9.";
        return;
    }

    if (
        !discoveredEvidence.has("1") ||
        !discoveredEvidence.has("2")
    ) {
        evidenceMessage.textContent =
            "FILE LOCKED. RECOVER THE SIGNAL AND OPERATOR NOTE FIRST.";
        return;
    }

    if (document.getElementById("corruptedPuzzle")) return;

    const puzzle = document.createElement("div");
    puzzle.id = "corruptedPuzzle";

    puzzle.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99998;
        overflow-y: auto;
        padding: 18px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        background: #03070d;
        color: #d9f7ff;
        font-family: monospace;
    `;

    puzzle.innerHTML = `
        <div style="
            box-sizing: border-box;
            width: min(680px, 100%);
            margin: auto;
            padding: clamp(18px, 4vw, 32px);
            border: 1px solid #43d7b0;
            background: linear-gradient(145deg, #091b1a, #05090f);
        ">
            <p style="
                color: #5ce9bd;
                font-size: 11px;
                letter-spacing: 2px;
            ">WAYNE SYSTEMS // DATA RECOVERY 03</p>

            <h1 style="
                font-family: Arial, sans-serif;
                font-size: clamp(27px, 5vw, 40px);
                letter-spacing: 2px;
            ">CORRUPTED LOG</h1>

            <p style="color: #a9c2c3; line-height: 1.8;">
                The final system record is damaged. Most of its
                contents are unreadable, but the integrity rule
                survived. Restore the missing checksum to recover
                the last piece of the access key.
            </p>

            <div style="
                margin: 22px 0;
                padding: 20px;
                background: #020908;
                border: 1px solid #20594b;
                line-height: 2;
                overflow-wrap: anywhere;
            ">
                <p style="
                    color: #5ce9bd;
                    font-size: 11px;
                    letter-spacing: 2px;
                ">RECOVERED FILE FRAGMENT</p>

                <div style="color: #91a7a9;">
                    RECORD_ID: GTH-03-??<br>
                    FIRST DIGIT: 3<br>
                    SECOND DIGIT: 6<br>
                    FINAL CHECKSUM: ??<br>
                </div>

                <p style="
                    color: #e8c779;
                    margin-bottom: 0;
                ">
                    SYSTEM RULE: CHECKSUM = FIRST DIGIT + SECOND DIGIT
                </p>
            </div>

            <h3 style="
                color: #72f1d0;
                font-size: 13px;
                letter-spacing: 1px;
            ">RESTORE THE MISSING VALUE</h3>

            <p style="color: #a9c2c3; line-height: 1.8;">
                Use the recovered digits and the surviving integrity
                rule to determine the missing checksum.
            </p>

            <div style="
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 10px;
                margin-top: 20px;
            ">
                <button type="button" data-checksum="8" style="
                    min-width: 0;
                    padding: 17px 5px;
                    background: #0b1919;
                    border: 1px solid #28564d;
                    color: #c9efdf;
                    font: bold 20px monospace;
                    cursor: pointer;
                ">08</button>

                <button type="button" data-checksum="9" style="
                    min-width: 0;
                    padding: 17px 5px;
                    background: #0b1919;
                    border: 1px solid #28564d;
                    color: #c9efdf;
                    font: bold 20px monospace;
                    cursor: pointer;
                ">09</button>

                <button type="button" data-checksum="10" style="
                    min-width: 0;
                    padding: 17px 5px;
                    background: #0b1919;
                    border: 1px solid #28564d;
                    color: #c9efdf;
                    font: bold 20px monospace;
                    cursor: pointer;
                ">10</button>
            </div>

            <p id="corruptedFeedback" aria-live="polite" style="
                min-height: 42px;
                color: #e8c779;
                line-height: 1.8;
            ">INTEGRITY CHECK FAILED. AWAITING RESTORATION.</p>

            <div id="corruptedReveal" hidden style="
                padding: 20px;
                margin-top: 18px;
                background: #031711;
                border: 1px solid #43e8b0;
                color: #8fffd8;
                line-height: 1.8;
            ">
                <p style="letter-spacing: 2px;">
                    FILE RESTORED ✓
                </p>

                <h2 style="
                    font-family: Arial, sans-serif;
                    font-size: clamp(24px, 4vw, 34px);
                ">FINAL DIGIT: 9</h2>

                <p>
                    The integrity check passes. All three fragments
                    have now revealed the access key: 369.
                </p>
            </div>

            <button type="button" id="leaveCorruptedPuzzle" style="
                margin-top: 22px;
                padding: 10px 0;
                border: none;
                background: transparent;
                color: #9aabb9;
                font: 12px monospace;
                cursor: pointer;
            ">← RETURN TO FACILITY</button>
        </div>
    `;

    document.body.appendChild(puzzle);

    const feedback = puzzle.querySelector("#corruptedFeedback");
    const answerButtons = puzzle.querySelectorAll("[data-checksum]");
    const reveal = puzzle.querySelector("#corruptedReveal");
    let fileRestored = false;

    answerButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (fileRestored) return;

            if (button.dataset.checksum !== "9") {
                feedback.textContent =
                    "CHECKSUM MISMATCH. RECHECK THE INTEGRITY RULE.";
                feedback.style.color = "#ff7784";
                return;
            }

            fileRestored = true;
            discoveredEvidence.add("3");
            card.classList.add("examined");

            const status = card.querySelector("small");
            if (status) status.textContent = "STATUS: RECOVERED";

            evidenceCounter.textContent =
                "EVIDENCE: " + discoveredEvidence.size + "/3";

            evidenceMessage.textContent =
                "CORRUPTED LOG RESTORED: FINAL DIGIT IS 9.";

            feedback.textContent =
                "INTEGRITY VERIFIED. FILE SUCCESSFULLY RESTORED.";
            feedback.style.color = "#58f3c7";

            reveal.hidden = false;

            answerButtons.forEach(answer => {
                answer.disabled = true;
                answer.style.opacity = "0.45";
            });

            button.style.opacity = "1";
            button.style.borderColor = "#58f3c7";

            if (!openDecryptButton.dataset.unlocked) {
                openDecryptButton.hidden = false;
                openDecryptButton.dataset.unlocked = "true";

                evidenceMessage.textContent =
                    "ALL THREE FRAGMENTS RECOVERED. BATCOMPUTER ACCESS UNLOCKED.";
            }
        });
    });

    puzzle.querySelector("#leaveCorruptedPuzzle").addEventListener(
        "click",
        () => puzzle.remove()
    );

    return;
}
            const clue = evidenceClues[evidenceId];

            if (!clue) return;

            // Count each evidence file only once
            if (!discoveredEvidence.has(evidenceId)) {
                discoveredEvidence.add(evidenceId);

                card.classList.add("examined");

                const status = card.querySelector("small");

                if (status) {
                    status.textContent = "STATUS: RECOVERED";
                }
            }

            evidenceMessage.textContent = clue;

            evidenceCounter.textContent =
                "EVIDENCE: " + discoveredEvidence.size + "/3";

            if (
    discoveredEvidence.size === 3 &&
    !openDecryptButton.dataset.unlocked
) {
    // Let the player read the third clue first
    evidenceMessage.textContent = clue;

    setTimeout(() => {
        if (discoveredEvidence.size === 3) {
            evidenceMessage.textContent =
                "ALL EVIDENCE RECOVERED. ACCESS CODE RULES ESTABLISHED.";

            openDecryptButton.hidden = false;
            openDecryptButton.dataset.unlocked = "true";
        }
    }, 4000);
}
        });
    });

}

/* =========================================
   MISSION 04: THE UNDERGROUND (STEALTH INFILTRATION)
   ========================================= */
let cleanupM4 = null;

function startMissionFour() {
    if (cleanupM1) { cleanupM1(); cleanupM1 = null; }
    if (cleanupM2) { cleanupM2(); cleanupM2 = null; }
    if (cleanupM4) { cleanupM4(); cleanupM4 = null; }
    document.onkeydown = null;
    document.onkeyup = null;

    document.querySelectorAll(
        "#decryptTerminal, #signalPuzzle, #operatorPuzzle, #corruptedPuzzle, #extraMissionScreen"
    ).forEach(el => el.remove());

    const city = document.querySelector(".city");
    if (!city) return;

    city.innerHTML = `
        <div class="mission-screen">
            <p class="mission-label">NIGHTFALL PROTOCOL // SUBLEVEL 09</p>
            <h1>MISSION 04</h1>
            <div class="mission-line"></div>
            <p class="mission-text">
                The decrypted signal leads into Gotham's abandoned underground subway control network.
                <br><br>
                Automated security laser grids have locked down the transit tunnels.
                <br><br>
                Infiltrate the sublevel, sneak past the security sweep lasers,
                and hack the 3 junction terminals to recover the master transit access key.
            </p>
            <div class="achievement">
                MISSION OBJECTIVE
                <br><br>
                <strong>INFILTRATE & RECOVER 3 TERMINAL FRAGMENTS (4 - 8 - 2)</strong>
            </div>
            <button id="beginUndergroundInfiltration" type="button">
                ▶ INFILTRATE SUBWAY NETWORK
            </button>
        </div>
    `;

    document
        .getElementById("beginUndergroundInfiltration")
        ?.addEventListener("click", startUndergroundInfiltration);
}

function startUndergroundInfiltration() {
    if (cleanupM1) { cleanupM1(); cleanupM1 = null; }
    if (cleanupM2) { cleanupM2(); cleanupM2 = null; }
    if (cleanupM4) { cleanupM4(); cleanupM4 = null; }

    const city = document.querySelector(".city");
    if (!city) return;

    city.innerHTML = `
        <div class="game-area mission-four-area">
            <div class="game-header">
                <span>GOTHAM: NIGHTFALL</span>
                <span>MISSION 04: THE UNDERGROUND</span>
                <span id="undergroundFragments">FRAGMENTS: 0 / 3</span>
                <span id="undergroundAlert">GRID: ACTIVE</span>
            </div>

            <!-- SUBWAY ARENA -->
            <div class="subway-arena" id="subwayArena">
                <div class="subway-rails">
                    <div class="rail-line r1"></div>
                    <div class="rail-line r2"></div>
                    <div class="rail-line r3"></div>
                </div>

                <!-- MASTER TRANSIT CONSOLE -->
                <div class="subway-master-console" id="masterConsole">
                    <div class="console-icon">⚡</div>
                    <strong>CENTRAL TRANSIT GATE</strong>
                    <small id="consoleStatus">LOCKED (3 TERMINALS REQUIRED)</small>
                </div>

                <!-- 3 SECURITY TERMINALS -->
                <div class="subway-terminal" id="terminal4" style="left: 15%; top: 30%;">
                    <div class="terminal-pulse"></div>
                    <div class="terminal-screen">
                        <span class="term-num">01</span>
                        <b>PLATFORM</b>
                        <small>[4]</small>
                    </div>
                </div>

                <div class="subway-terminal" id="terminal8" style="left: 82%; top: 40%;">
                    <div class="terminal-pulse"></div>
                    <div class="terminal-screen">
                        <span class="term-num">02</span>
                        <b>SUBSTATION</b>
                        <small>[8]</small>
                    </div>
                </div>

                <div class="subway-terminal" id="terminal2" style="left: 25%; top: 72%;">
                    <div class="terminal-pulse"></div>
                    <div class="terminal-screen">
                        <span class="term-num">03</span>
                        <b>JUNCTION</b>
                        <small>[2]</small>
                    </div>
                </div>

                <!-- MOVING SECURITY LASER SWEEPS -->
                <div class="security-laser laser-vert" id="laser1" style="left: 45%; top: 20%; height: 180px;"></div>
                <div class="security-laser laser-horiz" id="laser2" style="left: 20%; top: 54%; width: 220px;"></div>
                <div class="security-laser laser-vert" id="laser3" style="left: 68%; top: 38%; height: 190px;"></div>

                <!-- BATMAN SPRITE -->
                <div id="batmanM4" class="batman-stealth" style="left: 50%; top: 88%;">
                    <div class="stealth-vision-cone"></div>
                    <div class="hero">
                        <div class="hero-head">
                            <div class="hero-eye left-eye"></div>
                            <div class="hero-eye right-eye"></div>
                        </div>
                        <div class="hero-body"></div>
                        <div class="hero-cape"></div>
                    </div>
                </div>

                <div id="m4Banner" class="subway-banner"></div>
            </div>

            <div class="instructions">
                MOVE: WASD / ARROWS &nbsp;|&nbsp; SNEAK PAST RED LASERS &nbsp;|&nbsp; INFILTRATE 3 TERMINALS
            </div>

            <!-- MOBILE TOUCH CONTROLS -->
            <div class="mobile-controls m4-touch-controls" id="m4TouchControls">
                <div class="touch-dpad">
                    <button type="button" class="touch-btn" data-m4-key="arrowup" aria-label="Up">▲</button>
                    <div class="touch-row">
                        <button type="button" class="touch-btn" data-m4-key="arrowleft" aria-label="Left">◀</button>
                        <button type="button" class="touch-btn" data-m4-key="arrowdown" aria-label="Down">▼</button>
                        <button type="button" class="touch-btn" data-m4-key="arrowright" aria-label="Right">▶</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const arena = document.getElementById("subwayArena");
    const batman = document.getElementById("batmanM4");
    const fragDisplay = document.getElementById("undergroundFragments");
    const alertDisplay = document.getElementById("undergroundAlert");
    const masterConsole = document.getElementById("masterConsole");
    const banner = document.getElementById("m4Banner");

    const term4 = document.getElementById("terminal4");
    const term8 = document.getElementById("terminal8");
    const term2 = document.getElementById("terminal2");

    const laser1 = document.getElementById("laser1");
    const laser2 = document.getElementById("laser2");
    const laser3 = document.getElementById("laser3");

    let playerX = 50; // percentage
    let playerY = 88; // percentage
    const moveSpeed = 0.55;

    let laser1Y = 22, laser1Speed = 0.45;
    let laser2X = 22, laser2Speed = 0.40;
    let laser3Y = 65, laser3Speed = -0.42;

    const recovered = new Set();
    let lasersActive = true;
    let alertFlashTimer = 0;
    let consoleModalOpened = false;

    let m4Active = true;
    let m4AnimId = null;
    const m4Keys = {};

    function showBanner(msg, isSuccess = true) {
        if (!banner) return;
        banner.textContent = msg;
        banner.style.color = isSuccess ? "#58f3c7" : "#ff6877";
        banner.classList.add("visible");
        setTimeout(() => {
            if (banner) banner.classList.remove("visible");
        }, 2200);
    }

    function handleM4KeyDown(event) {
        const key = event.key.toLowerCase();
        if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
            event.preventDefault();
        }
        m4Keys[key] = true;
    }

    function handleM4KeyUp(event) {
        m4Keys[event.key.toLowerCase()] = false;
    }

    function handleM4Blur() {
        Object.keys(m4Keys).forEach(k => { m4Keys[k] = false; });
    }

    document.addEventListener("keydown", handleM4KeyDown);
    document.addEventListener("keyup", handleM4KeyUp);
    window.addEventListener("blur", handleM4Blur);

    // Mobile touch controls setup
    function bindTouchM4Key(el, keyName) {
        const press = (e) => { e.preventDefault(); m4Keys[keyName] = true; };
        const release = (e) => { e.preventDefault(); m4Keys[keyName] = false; };
        el.addEventListener("pointerdown", press);
        el.addEventListener("pointerup", release);
        el.addEventListener("pointercancel", release);
        el.addEventListener("pointerleave", release);
    }

    document.querySelectorAll("[data-m4-key]").forEach(btn => {
        bindTouchM4Key(btn, btn.dataset.m4Key);
    });

    cleanupM4 = function() {
        m4Active = false;
        if (m4AnimId) {
            cancelAnimationFrame(m4AnimId);
            m4AnimId = null;
        }
        document.removeEventListener("keydown", handleM4KeyDown);
        document.removeEventListener("keyup", handleM4KeyUp);
        window.removeEventListener("blur", handleM4Blur);
        document.onkeydown = null;
        document.onkeyup = null;
        Object.keys(m4Keys).forEach(k => { m4Keys[k] = false; });
    };

    function isColliding(el1, el2, padding = 15) {
        if (!el1 || !el2) return false;
        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();
        return (
            r1.left + padding < r2.right - padding &&
            r1.right - padding > r2.left + padding &&
            r1.top + padding < r2.bottom - padding &&
            r1.bottom - padding > r2.top + padding
        );
    }

    function openConsoleOverride() {
        if (consoleModalOpened) return;
        consoleModalOpened = true;

        const modal = document.createElement("div");
        modal.id = "undergroundConsoleModal";
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: rgba(2, 6, 12, 0.94);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: monospace;
        `;

        modal.innerHTML = `
            <div style="
                width: min(650px, 100%);
                padding: clamp(20px, 4vw, 36px);
                border: 1px solid #4de5f5;
                background: linear-gradient(145deg, #071724, #02070e);
                box-shadow: 0 0 35px rgba(0, 220, 255, 0.25);
                text-align: center;
                color: #e5faff;
            ">
                <p style="color: #4fe5f5; font-size: 11px; letter-spacing: 3px;">
                    CENTRAL TRANSIT INTERFACE // SUBLEVEL 09
                </p>
                <h1 style="font-size: clamp(26px, 5vw, 40px); letter-spacing: 2px; margin: 12px 0;">
                    TRANSIT OVERRIDE
                </h1>
                <div class="mission-line"></div>
                <p style="color: #9eb8c8; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
                    All three junction fragments recovered from the subway network.
                    <br>
                    Enter the reconstructed 3-digit access code (4 - 8 - 2) to authorize transit to the Broadcast Tower.
                </p>

                <div style="display: flex; justify-content: center; gap: 10px; margin: 20px 0;">
                    <input id="modalUndergroundCode" inputmode="numeric" maxlength="3" placeholder="___" style="
                        width: 170px;
                        padding: 14px;
                        border: 1px solid #3bb8cf;
                        background: #020912;
                        color: #55f3ff;
                        font: bold 22px monospace;
                        letter-spacing: 8px;
                        text-align: center;
                        outline: none;
                    ">
                    <button id="modalUnlockBtn" type="button" style="
                        padding: 14px 22px;
                        border: 1px solid #38d9ed;
                        background: #092631;
                        color: #9af6ff;
                        font-family: monospace;
                        letter-spacing: 2px;
                        cursor: pointer;
                        font-weight: bold;
                    ">UNLOCK TRANSIT</button>
                </div>

                <p id="modalFeedback" style="min-height: 22px; color: #ff919c; font-size: 13px; letter-spacing: 1px;"></p>
            </div>
        `;

        document.body.appendChild(modal);

        const input = modal.querySelector("#modalUndergroundCode");
        const submit = modal.querySelector("#modalUnlockBtn");
        const fb = modal.querySelector("#modalFeedback");

        if (input) input.focus();

        function checkModalCode() {
            const val = input ? input.value.trim() : "";
            if (val === "482") {
                modal.remove();
                if (cleanupM4) { cleanupM4(); cleanupM4 = null; }

                const city = document.querySelector(".city");
                if (!city) return;

                city.innerHTML = `
                    <div class="complete-screen investigation-panel">
                        <p class="mission-label">ACCESS GRANTED // SUBLEVEL 09</p>
                        <h1>ROUTE DISCOVERED</h1>
                        <div class="mission-line"></div>
                        <p class="mission-text">
                            The transit console has been unlocked.
                            <br><br>
                            Subway power routes converge at the highest point in Gotham: the Broadcast Tower.
                            <br><br>
                            A live transmission is waiting to be intercepted.
                        </p>
                        <div class="achievement">
                            🏆 ACHIEVEMENT UNLOCKED
                            <br><br>
                            <strong>BELOW THE CITY</strong>
                        </div>
                        <button id="toMissionFive" type="button">
                            ▶ BEGIN MISSION 05: THE LAST SIGNAL
                        </button>
                    </div>
                `;

                document
                    .getElementById("toMissionFive")
                    ?.addEventListener("click", startMissionFive);
            } else {
                if (fb) fb.textContent = "ACCESS DENIED. RECHECK FRAGMENTS (4 - 8 - 2).";
            }
        }

        if (submit) submit.addEventListener("click", checkModalCode);
        if (input) {
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") checkModalCode();
            });
        }
    }

    function undergroundLoop() {
        if (!m4Active) return;

        // Player Movement
        if (m4Keys["a"] || m4Keys["arrowleft"]) playerX -= moveSpeed;
        if (m4Keys["d"] || m4Keys["arrowright"]) playerX += moveSpeed;
        if (m4Keys["w"] || m4Keys["arrowup"]) playerY -= moveSpeed;
        if (m4Keys["s"] || m4Keys["arrowdown"]) playerY += moveSpeed;

        playerX = Math.max(5, Math.min(95, playerX));
        playerY = Math.max(8, Math.min(92, playerY));

        if (batman) {
            batman.style.left = playerX + "%";
            batman.style.top = playerY + "%";
        }

        // Move Security Lasers
        if (lasersActive) {
            laser1Y += laser1Speed;
            if (laser1Y > 60 || laser1Y < 18) laser1Speed *= -1;
            if (laser1) laser1.style.top = laser1Y + "%";

            laser2X += laser2Speed;
            if (laser2X > 68 || laser2X < 18) laser2Speed *= -1;
            if (laser2) laser2.style.left = laser2X + "%";

            laser3Y += laser3Speed;
            if (laser3Y > 65 || laser3Y < 20) laser3Speed *= -1;
            if (laser3) laser3.style.top = laser3Y + "%";

            // Laser Collision
            if (alertFlashTimer > 0) {
                alertFlashTimer--;
            } else {
                const hitLaser =
                    isColliding(batman, laser1, 10) ||
                    isColliding(batman, laser2, 10) ||
                    isColliding(batman, laser3, 10);

                if (hitLaser) {
                    alertFlashTimer = 45;
                    playerX = 50;
                    playerY = 88;
                    showBanner("⚠ LASER DETECTED! RESETTING TO CHECKPOINT", false);
                    if (alertDisplay) {
                        alertDisplay.textContent = "ALERT: RE-POSITIONED";
                        alertDisplay.style.color = "#ff6877";
                        setTimeout(() => {
                            if (alertDisplay) {
                                alertDisplay.textContent = lasersActive ? "GRID: ACTIVE" : "GRID: DISABLED";
                                alertDisplay.style.color = lasersActive ? "#70ddec" : "#58f3c7";
                            }
                        }, 1400);
                    }
                }
            }
        }

        // Terminal Infiltration Checks
        if (!recovered.has("4") && isColliding(batman, term4, 8)) {
            recovered.add("4");
            if (term4) term4.classList.add("recovered");
            showBanner("◈ TERMINAL 01 COMPROMISED: DIGIT [4] DOWNLOADED");
        }

        if (!recovered.has("8") && isColliding(batman, term8, 8)) {
            recovered.add("8");
            if (term8) term8.classList.add("recovered");
            showBanner("⚡ TERMINAL 02 COMPROMISED: DIGIT [8] DOWNLOADED");
        }

        if (!recovered.has("2") && isColliding(batman, term2, 8)) {
            recovered.add("2");
            if (term2) term2.classList.add("recovered");
            showBanner("⌁ TERMINAL 03 COMPROMISED: DIGIT [2] DOWNLOADED");
        }

        if (fragDisplay) {
            fragDisplay.textContent = `FRAGMENTS: ${recovered.size} / 3`;
        }

        // Check All 3 Recovered
        if (recovered.size === 3) {
            if (lasersActive) {
                lasersActive = false;
                if (laser1) laser1.style.opacity = "0.15";
                if (laser2) laser2.style.opacity = "0.15";
                if (laser3) laser3.style.opacity = "0.15";
                if (alertDisplay) {
                    alertDisplay.textContent = "GRID: OFFLINE";
                    alertDisplay.style.color = "#58f3c7";
                }
                if (masterConsole) {
                    masterConsole.classList.add("unlocked");
                    const cs = document.getElementById("consoleStatus");
                    if (cs) cs.textContent = "READY FOR OVERRIDE (TOUCH TO ENTER)";
                }
                showBanner("ALL TERMINALS COMPROMISED. APPROACH CENTRAL GATE!");
            }

            // Central Console Collision Check
            if (isColliding(batman, masterConsole, 5)) {
                openConsoleOverride();
            }
        }

        if (m4Active) {
            m4AnimId = requestAnimationFrame(undergroundLoop);
        }
    }

    m4AnimId = requestAnimationFrame(undergroundLoop);
}

/* =========================================
   MISSION 05: THE LAST SIGNAL
   ========================================= */
function startMissionFive() {
    if (cleanupM1) { cleanupM1(); cleanupM1 = null; }
    if (cleanupM2) { cleanupM2(); cleanupM2 = null; }
    document.onkeydown = null;
    document.onkeyup = null;

    document.querySelectorAll(
        "#decryptTerminal, #signalPuzzle, #operatorPuzzle, #corruptedPuzzle, #extraMissionScreen"
    ).forEach(el => el.remove());

    const city = document.querySelector(".city");
    if (!city) return;

    city.innerHTML = `
        <div class="game-area extra-mission mission-five">
            <div class="extra-topline">
                <span>GOTHAM: NIGHTFALL</span>
                <span>MISSION 05 // THE LAST SIGNAL</span>
            </div>
            <main class="extra-panel">
                <p class="mission-label">FINAL OPERATION // BROADCAST TOWER</p>
                <h1>THE LAST SIGNAL</h1>
                <div class="mission-line"></div>
                <p class="mission-text">
                    At the summit of the Gotham broadcast tower, the source of the blackout lies open before you.
                    A single decision will determine how Gotham's story is remembered.
                    What will you do with the transmission?
                </p>
                <div class="final-choice-grid">
                    <button class="final-choice" data-choice="expose" type="button">
                        <b>01 // EXPOSE</b>
                        <span>Broadcast the unedited truth to every screen in Gotham.</span>
                    </button>
                    <button class="final-choice" data-choice="protect" type="button">
                        <b>02 // PROTECT</b>
                        <span>Transmit the evidence securely to trusted authorities.</span>
                    </button>
                    <button class="final-choice" data-choice="erase" type="button">
                        <b>03 // ERASE</b>
                        <span>Purge the servers and shut down the network before it spreads.</span>
                    </button>
                </div>
                <p id="finalChoiceFeedback" class="extra-status" aria-live="polite">SELECT ONE FINAL ACTION.</p>
            </main>
        </div>
    `;

    const outcomes = {
        expose: [
            "THE CITY KNOWS",
            "The truth lights up every screen in Gotham. The people finally know who tried to silence them, and justice begins in the light."
        ],
        protect: [
            "THE EVIDENCE IS SAFE",
            "The encrypted files reach trusted hands. The city is protected from mass panic, and Gotham can begin rebuilding with honor."
        ],
        erase: [
            "THE SIGNAL IS SILENCED",
            "The network goes dark. The threat is completely stopped, the enemy vanishes into the shadows, and your legend remains a whisper."
        ]
    };

    document.querySelectorAll(".final-choice").forEach(button => {
        button.addEventListener("click", () => {
            const choiceKey = button.dataset.choice;
            const outcome = outcomes[choiceKey] || outcomes.protect;
            const panel = document.querySelector(".extra-panel");
            if (!panel) return;

            panel.innerHTML = `
                <p class="mission-label">NIGHTFALL PROTOCOL // OPERATION COMPLETE</p>
                <h1>${outcome[0]}</h1>
                <div class="mission-line"></div>
                <p class="mission-text">${outcome[1]}</p>
                <div class="extra-achievement">
                    🏆 FINAL ACHIEVEMENT UNLOCKED<br>
                    <strong>GUARDIAN OF GOTHAM</strong>
                </div>
                <p class="extra-thanks">And now, one last message for you...</p>
                <button class="extra-primary" id="showBirthdayMessage" type="button">
                    ▶ OPEN FINAL TRANSMISSION
                </button>
            `;

            document.getElementById("showBirthdayMessage")?.addEventListener("click", () => {
                panel.innerHTML = `
                    <p class="mission-label">INCOMING PERSONAL TRANSMISSION</p>
                    <h1>YOU ARE THE HERO.</h1>
                    <div class="mission-line"></div>
                    <p class="mission-text" style="font-size: clamp(16px, 2.2vw, 20px); line-height: 2.2; color: #d6f6ff;">
                        Every city needs a hero.<br>
                        Gotham had one tonight.<br><br>
                        Thank you for playing, and happy birthday. ❤️
                    </p>
                    <h2 class="extra-game-title">GOTHAM: NIGHTFALL</h2>
                    <p class="extra-thanks">CASE CLOSED // UNTIL THE NEXT ADVENTURE</p>
                    <button class="extra-primary" id="replayNightfall" type="button">↻ PLAY AGAIN</button>
                `;

                document.getElementById("replayNightfall")?.addEventListener("click", () => {
                    window.location.reload();
                });
            });
        });
    });
}
