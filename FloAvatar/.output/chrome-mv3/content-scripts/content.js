var content = function() {
  "use strict";var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  var _a, _b;
  function defineContentScript(definition2) {
    return definition2;
  }
  const definition = defineContentScript({
    matches: ["*://*/*"],
    async main() {
      console.log("FloAvatar glassmorphism floating window loading...");
      setTimeout(() => {
        console.log("FloAvatar content script fully loaded!");
      }, 1e3);
      createFloatingGlassWindow();
      let activityScore = 0;
      let lastActivity = Date.now();
      document.addEventListener("click", trackActivity);
      document.addEventListener("scroll", trackActivity);
      document.addEventListener("keydown", trackActivity);
      function trackActivity() {
        activityScore++;
        lastActivity = Date.now();
        if (activityScore % 50 === 0) {
          awardTokens(2, "Activity bonus! 🎯");
        }
      }
      setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivity;
        if (timeSinceLastActivity < 6e4) {
          awardTokens(1, "Time bonus! ⏰");
        }
      }, 5 * 60 * 1e3);
      awardTokens(3, "Page visit! 🌐");
      async function awardTokens(amount, reason) {
        try {
          const result2 = await chrome.storage.local.get(["floavatar-gamestate"]);
          const currentState = result2["floavatar-gamestate"] || { tokens: 0 };
          currentState.tokens += amount;
          await chrome.storage.local.set({ "floavatar-gamestate": currentState });
          updateFloatingTokens(currentState.tokens);
          showTokenNotification(amount, reason);
        } catch (error) {
          console.error("Error awarding tokens:", error);
        }
      }
      function createFloatingGlassWindow() {
        const existing = document.getElementById("floavatar-glass-window");
        if (existing) existing.remove();
        const floatingWindow = document.createElement("div");
        floatingWindow.id = "floavatar-glass-window";
        floatingWindow.innerHTML = `
        <div class="glass-floating-window">
          <!-- PiP Header Bar -->
          <div class="pip-header" id="window-titlebar">
            <div class="pip-controls">
              <div class="pip-dot minimize-btn" id="minimize-window"></div>
              <div class="pip-dot close-btn" id="close-window"></div>
            </div>
            <div class="pip-brand">FloAvatar</div>
            <div class="pip-token-badge" id="pip-tokens">
              <span class="pip-coin">🪙</span>
              <span id="floating-tokens">0</span>
            </div>
          </div>
          
          <!-- PiP Main Content Area -->
          <div class="pip-main-content" id="window-content">
            <!-- Left: Pet Avatar -->
            <div class="pip-pet-zone">
              <div class="pip-avatar-frame">
                <canvas id="main-pet-avatar" width="120" height="120"></canvas>
                <div class="pip-avatar-glow"></div>
              </div>
              <div class="pip-pet-name" id="pet-name">Your Pet</div>
            </div>
            
            <!-- Right: Stats & Controls -->
            <div class="pip-control-zone">
              <!-- Status Bars -->
              <div class="pip-stats">
                <div class="pip-stat">
                  <div class="pip-stat-icon">❤️</div>
                  <div class="pip-stat-bar">
                    <div class="pip-stat-fill happiness" id="mini-happiness" style="width: 100%"></div>
                  </div>
                </div>
                <div class="pip-stat">
                  <div class="pip-stat-icon">⚡</div>
                  <div class="pip-stat-bar">
                    <div class="pip-stat-fill energy" id="mini-energy" style="width: 100%"></div>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="pip-actions">
                <button class="pip-action-btn feed" id="quick-feed" title="Feed (5🪙)">
                  <span>🍖</span>
                </button>
                <button class="pip-action-btn play" id="quick-play" title="Play (3🪙)">
                  <span>🎾</span>
                </button>
                <button class="pip-action-btn expand" id="quick-expand" title="Expand">
                  <span>⚡</span>
                </button>
              </div>
              
              <!-- Progress Indicator -->
              <div class="pip-progress">
                <div class="pip-progress-bar">
                  <div class="pip-progress-fill" id="daily-progress" style="width: 35%"></div>
                </div>
                <div class="pip-progress-text">Daily: 7/20</div>
              </div>
            </div>
          </div>
        </div>
      `;
        const styles = document.createElement("style");
        styles.textContent = `
        #floavatar-glass-window {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 320px;
          height: 180px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: scale(1) rotate(0deg);
          filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.8));
          animation: pipFloat 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          border-radius: 16px;
          overflow: hidden;
        }
        
        @keyframes pipFloat {
          0% {
            transform: scale(0.3) translateX(200px) translateY(100px) rotate(10deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.05) translateX(-10px) translateY(-10px) rotate(-2deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) translateX(0) translateY(0) rotate(0deg);
            opacity: 1;
          }
        }
        
        .glass-floating-window {
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.9) 0%, 
            rgba(20, 20, 30, 0.95) 50%, 
            rgba(10, 10, 20, 0.9) 100%);
          backdrop-filter: blur(30px) brightness(1.1) contrast(1.1);
          -webkit-backdrop-filter: blur(30px) brightness(1.1) contrast(1.1);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          pointer-events: auto;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 20px 60px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.5);
          width: 100%;
          height: 100%;
        }
        
        .glass-floating-window:hover {
          transform: scale(1.02);
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.9));
        }
        
        /* PiP Header */
        .pip-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: grab;
          user-select: none;
          height: 32px;
        }
        
        .pip-header:active {
          cursor: grabbing;
        }
        
        .pip-controls {
          display: flex;
          gap: 8px;
        }
        
        .pip-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .pip-dot.minimize-btn {
          background: linear-gradient(135deg, #FFD23F, #FF8F00);
        }
        
        .pip-dot.close-btn {
          background: linear-gradient(135deg, #FF6B6B, #FF3838);
        }
        
        .pip-dot:hover {
          transform: scale(1.2);
          box-shadow: 0 0 10px currentColor;
        }
        
        .pip-brand {
          color: white;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }
        
        .pip-token-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
          border: 1px solid rgba(255, 215, 0, 0.4);
          border-radius: 12px;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 700;
        }
        
        .pip-coin {
          font-size: 8px;
        }
        
        #floating-tokens {
          color: #FFD700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }
        
        /* PiP Main Content */
        .pip-main-content {
          display: flex;
          height: 148px;
          padding: 12px;
          gap: 16px;
        }
        
        /* Pet Zone (Left Side) */
        .pip-pet-zone {
          flex: 0 0 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .pip-avatar-frame {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .pip-avatar-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD, #FF6B6B);
          opacity: 0.3;
          animation: spin 8s linear infinite;
          z-index: -1;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        #main-pet-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
        }
        
        .pip-pet-name {
          color: white;
          font-size: 10px;
          font-weight: 600;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          opacity: 0.9;
        }
        
        /* Control Zone (Right Side) */
        .pip-control-zone {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4px 0;
        }
        
        /* Stats */
        .pip-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .pip-stat {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .pip-stat-icon {
          font-size: 12px;
          width: 16px;
          text-align: center;
        }
        
        .pip-stat-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .pip-stat-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.6, 1);
        }
        
        .pip-stat-fill.happiness {
          background: linear-gradient(90deg, #FF6B6B, #FF8E8E);
        }
        
        .pip-stat-fill.energy {
          background: linear-gradient(90deg, #4ECDC4, #7EDCE2);
        }
        
        /* Actions */
        .pip-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        
        .pip-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }
        
        .pip-action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }
        
        .pip-action-btn.feed:hover {
          background: rgba(255, 107, 107, 0.3);
          border-color: rgba(255, 107, 107, 0.6);
        }
        
        .pip-action-btn.play:hover {
          background: rgba(78, 205, 196, 0.3);
          border-color: rgba(78, 205, 196, 0.6);
        }
        
        .pip-action-btn.expand:hover {
          background: rgba(102, 126, 234, 0.3);
          border-color: rgba(102, 126, 234, 0.6);
        }
        
        /* Progress */
        .pip-progress {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .pip-progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .pip-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .pip-progress-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 8px;
          text-align: center;
          font-weight: 500;
        }
        
        /* Minimized state */
        .glass-floating-window.minimized .pip-main-content {
          display: none;
        }
        
        .glass-floating-window.minimized {
          height: 32px;
        }
        
        /* Hover animations */
        @keyframes tokenPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .token-pulse {
          animation: tokenPulse 0.4s ease-in-out;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          #floavatar-glass-window {
            width: 200px;
            right: 15px;
            top: 60px;
          }
          
          .glass-window-content {
            padding: 8px;
          }
          
          .pet-avatar-container {
            width: 40px;
            height: 40px;
          }
          
          #main-pet-avatar {
            width: 40px;
            height: 40px;
          }
        }
      `;
        document.head.appendChild(styles);
        document.body.appendChild(floatingWindow);
        initializeFloatingWindowFunctionality();
      }
      function initializeFloatingWindowFunctionality() {
        const floatingWindow = document.getElementById("floavatar-glass-window");
        const titlebar = document.getElementById("window-titlebar");
        const minimizeBtn = document.getElementById("minimize-window");
        const closeBtn = document.getElementById("close-window");
        const quickFeed = document.getElementById("quick-feed");
        const quickPlay = document.getElementById("quick-play");
        const quickExpand = document.getElementById("quick-expand");
        if (!floatingWindow || !titlebar) return;
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        titlebar.addEventListener("mousedown", (e) => {
          if (e.target.classList.contains("control-btn")) return;
          isDragging = true;
          const rect = floatingWindow.getBoundingClientRect();
          dragOffset.x = e.clientX - rect.left;
          dragOffset.y = e.clientY - rect.top;
          titlebar.style.cursor = "grabbing";
        });
        document.addEventListener("mousemove", (e) => {
          if (!isDragging) return;
          const x = e.clientX - dragOffset.x;
          const y = e.clientY - dragOffset.y;
          const padding = 20;
          const maxX = window.innerWidth - floatingWindow.offsetWidth - padding;
          const maxY = window.innerHeight - floatingWindow.offsetHeight - padding;
          floatingWindow.style.left = Math.max(padding, Math.min(maxX, x)) + "px";
          floatingWindow.style.top = Math.max(padding, Math.min(maxY, y)) + "px";
          floatingWindow.style.right = "auto";
        });
        document.addEventListener("mouseup", () => {
          isDragging = false;
          titlebar.style.cursor = "grab";
        });
        minimizeBtn == null ? void 0 : minimizeBtn.addEventListener("click", () => {
          floatingWindow.classList.toggle("minimized");
        });
        closeBtn == null ? void 0 : closeBtn.addEventListener("click", () => {
          floatingWindow.style.animation = "pipFloat 0.4s reverse";
          setTimeout(() => floatingWindow.remove(), 400);
        });
        quickFeed == null ? void 0 : quickFeed.addEventListener("click", async () => {
          const gameState = await getGameState();
          if (gameState && gameState.tokens >= 5) {
            gameState.tokens -= 5;
            gameState.happiness = Math.min(100, (gameState.happiness || 100) + 20);
            gameState.energy = Math.min(100, (gameState.energy || 100) + 10);
            await chrome.storage.local.set({ "floavatar-gamestate": gameState });
            updateFloatingStats(gameState);
            showTokenNotification(-5, "Fed your pet! 🍖");
          }
        });
        quickPlay == null ? void 0 : quickPlay.addEventListener("click", async () => {
          const gameState = await getGameState();
          if (gameState && gameState.tokens >= 3) {
            gameState.tokens -= 3;
            gameState.happiness = Math.min(100, (gameState.happiness || 100) + 15);
            gameState.energy = Math.max(0, (gameState.energy || 100) - 10);
            await chrome.storage.local.set({ "floavatar-gamestate": gameState });
            updateFloatingStats(gameState);
            showTokenNotification(-3, "Played with your pet! 🎾");
          }
        });
        quickExpand == null ? void 0 : quickExpand.addEventListener("click", () => {
          chrome.runtime.sendMessage({ action: "openFullInterface" });
        });
        loadFloatingWindowData();
      }
      async function loadFloatingWindowData() {
        const gameState = await getGameState();
        if (gameState) {
          updateFloatingTokens(gameState.tokens || 0);
          updateFloatingStats(gameState);
          renderFloatingAvatars(gameState);
        } else {
          updateFloatingTokens(0);
          const defaultState = { happiness: 100, energy: 100, selectedEgg: "cat" };
          updateFloatingStats(defaultState);
          renderFloatingAvatars({ isHatched: true, selectedEgg: "cat" });
        }
      }
      function updateFloatingTokens(tokens) {
        const tokenElement = document.getElementById("floating-tokens");
        if (tokenElement) {
          tokenElement.textContent = tokens.toString();
          const counter = tokenElement.closest(".token-counter");
          counter == null ? void 0 : counter.classList.add("token-pulse");
          setTimeout(() => counter == null ? void 0 : counter.classList.remove("token-pulse"), 400);
        }
      }
      function updateFloatingStats(gameState) {
        const happinessBar = document.getElementById("mini-happiness");
        const energyBar = document.getElementById("mini-energy");
        const petName = document.getElementById("pet-name");
        if (happinessBar) happinessBar.style.width = `${gameState.happiness || 100}%`;
        if (energyBar) energyBar.style.width = `${gameState.energy || 100}%`;
        if (petName && gameState.selectedEgg) {
          const names = {
            cat: "Whiskers",
            dragon: "Flame",
            robot: "Cyber",
            ghost: "Spirit",
            alien: "Cosmic",
            panda: "Bamboo"
          };
          petName.textContent = names[gameState.selectedEgg] || "Your Pet";
        }
      }
      function renderFloatingAvatars(gameState) {
        const titleAvatar = document.getElementById("floating-avatar");
        if (titleAvatar && gameState.isHatched) {
          renderTinyAvatar(titleAvatar, gameState.selectedEgg);
        }
        const mainAvatar = document.getElementById("main-pet-avatar");
        if (mainAvatar && gameState.isHatched) {
          renderMainAvatar(mainAvatar, gameState.selectedEgg);
        }
      }
      function renderTinyAvatar(canvas, avatarType) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const animate = () => {
          const time = Date.now() * 2e-3;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.scale(0.15, 0.15);
          drawSimpleAvatar(ctx, avatarType, time);
          ctx.restore();
          requestAnimationFrame(animate);
        };
        animate();
      }
      function renderMainAvatar(canvas, avatarType) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const animate = () => {
          const time = Date.now() * 3e-3;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.translate(centerX, centerY);
          const breathe = 1 + Math.sin(time) * 0.05;
          ctx.scale(breathe * 0.4, breathe * 0.4);
          drawSimpleAvatar(ctx, avatarType, time);
          ctx.restore();
          requestAnimationFrame(animate);
        };
        animate();
      }
      function drawSimpleAvatar(ctx, avatarType, time) {
        if (avatarType === "cat") {
          const blink = Math.sin(time * 0.3) > 0.9;
          ctx.fillStyle = "#FFB6C1";
          ctx.beginPath();
          ctx.ellipse(0, 0, 25, 20, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(-12, -15, 6, 8, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(12, -15, 6, 8, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = blink ? "#FFB6C1" : "#4169E1";
          ctx.beginPath();
          ctx.ellipse(-6, -5, 3, blink ? 1 : 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(6, -5, 3, blink ? 1 : 4, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (avatarType === "dragon") {
          ctx.fillStyle = "#FF4500";
          ctx.beginPath();
          ctx.ellipse(0, 0, 25, 20, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#FF6347";
          ctx.beginPath();
          ctx.ellipse(-6, -5, 4, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(6, -5, 4, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (avatarType === "robot") {
          const pulse = Math.sin(time) * 0.2 + 0.8;
          ctx.fillStyle = "#2C3E50";
          ctx.fillRect(-15, -15, 30, 30);
          ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
          ctx.fillRect(-12, -12, 24, 10);
          ctx.fillStyle = "#00FFFF";
          ctx.fillRect(-8, -10, 4, 3);
          ctx.fillRect(4, -10, 4, 3);
        } else if (avatarType === "ghost") {
          ctx.fillStyle = "rgba(240, 248, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(0, -5, 20, Math.PI, 0, true);
          ctx.lineTo(-20, 15);
          ctx.lineTo(20, 15);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#4169E1";
          ctx.beginPath();
          ctx.ellipse(-6, -8, 3, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(6, -8, 3, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (avatarType === "alien") {
          ctx.fillStyle = "#98FB98";
          ctx.beginPath();
          ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#00CED1";
          ctx.beginPath();
          ctx.ellipse(-8, -5, 6, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(8, -5, 6, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (avatarType === "panda") {
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#2F4F4F";
          ctx.beginPath();
          ctx.ellipse(-6, -8, 5, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(6, -8, 5, 6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      async function getGameState() {
        try {
          const result2 = await chrome.storage.local.get(["floavatar-gamestate"]);
          return result2["floavatar-gamestate"];
        } catch (error) {
          console.error("Error getting game state:", error);
          return null;
        }
      }
      function showTokenNotification(amount, reason) {
        const existing = document.getElementById("floavatar-notification");
        if (existing) existing.remove();
        const notification = document.createElement("div");
        notification.id = "floavatar-notification";
        notification.innerHTML = `
        <div style="
          position: fixed;
          top: 30px;
          left: 50%;
          transform: translateX(-50%) translateY(-100px);
          background: rgba(20, 25, 40, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 600;
          font-size: 12px;
          z-index: 1000000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        ">
          ${amount > 0 ? "+" : ""}${amount} 🪙 ${reason}
        </div>
      `;
        document.body.appendChild(notification);
        setTimeout(() => {
          const notifEl = notification.querySelector("div");
          if (notifEl) notifEl.style.transform = "translateX(-50%) translateY(0)";
        }, 100);
        setTimeout(() => {
          const notifEl = notification.querySelector("div");
          if (notifEl) notifEl.style.transform = "translateX(-50%) translateY(-100px)";
          setTimeout(() => notification.remove(), 300);
        }, 3e3);
      }
    }
  });
  content;
  const browser = (
    // @ts-expect-error
    ((_b = (_a = globalThis.browser) == null ? void 0 : _a.runtime) == null ? void 0 : _b.id) == null ? globalThis.chrome : (
      // @ts-expect-error
      globalThis.browser
    )
  );
  function print$1(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger$1 = {
    debug: (...args) => print$1(console.debug, ...args),
    log: (...args) => print$1(console.log, ...args),
    warn: (...args) => print$1(console.warn, ...args),
    error: (...args) => print$1(console.error, ...args)
  };
  const _WxtLocationChangeEvent = class _WxtLocationChangeEvent extends Event {
    constructor(newUrl, oldUrl) {
      super(_WxtLocationChangeEvent.EVENT_NAME, {});
      this.newUrl = newUrl;
      this.oldUrl = oldUrl;
    }
  };
  __publicField(_WxtLocationChangeEvent, "EVENT_NAME", getUniqueEventName("wxt:locationchange"));
  let WxtLocationChangeEvent = _WxtLocationChangeEvent;
  function getUniqueEventName(eventName) {
    var _a2;
    return `${(_a2 = browser == null ? void 0 : browser.runtime) == null ? void 0 : _a2.id}:${"content"}:${eventName}`;
  }
  function createLocationWatcher(ctx) {
    let interval;
    let oldUrl;
    return {
      /**
       * Ensure the location watcher is actively looking for URL changes. If it's already watching,
       * this is a noop.
       */
      run() {
        if (interval != null) return;
        oldUrl = new URL(location.href);
        interval = ctx.setInterval(() => {
          let newUrl = new URL(location.href);
          if (newUrl.href !== oldUrl.href) {
            window.dispatchEvent(new WxtLocationChangeEvent(newUrl, oldUrl));
            oldUrl = newUrl;
          }
        }, 1e3);
      }
    };
  }
  const _ContentScriptContext = class _ContentScriptContext {
    constructor(contentScriptName, options) {
      __publicField(this, "isTopFrame", window.self === window.top);
      __publicField(this, "abortController");
      __publicField(this, "locationWatcher", createLocationWatcher(this));
      __publicField(this, "receivedMessageIds", /* @__PURE__ */ new Set());
      this.contentScriptName = contentScriptName;
      this.options = options;
      this.abortController = new AbortController();
      if (this.isTopFrame) {
        this.listenForNewerScripts({ ignoreFirstEvent: true });
        this.stopOldScripts();
      } else {
        this.listenForNewerScripts();
      }
    }
    get signal() {
      return this.abortController.signal;
    }
    abort(reason) {
      return this.abortController.abort(reason);
    }
    get isInvalid() {
      if (browser.runtime.id == null) {
        this.notifyInvalidated();
      }
      return this.signal.aborted;
    }
    get isValid() {
      return !this.isInvalid;
    }
    /**
     * Add a listener that is called when the content script's context is invalidated.
     *
     * @returns A function to remove the listener.
     *
     * @example
     * browser.runtime.onMessage.addListener(cb);
     * const removeInvalidatedListener = ctx.onInvalidated(() => {
     *   browser.runtime.onMessage.removeListener(cb);
     * })
     * // ...
     * removeInvalidatedListener();
     */
    onInvalidated(cb) {
      this.signal.addEventListener("abort", cb);
      return () => this.signal.removeEventListener("abort", cb);
    }
    /**
     * Return a promise that never resolves. Useful if you have an async function that shouldn't run
     * after the context is expired.
     *
     * @example
     * const getValueFromStorage = async () => {
     *   if (ctx.isInvalid) return ctx.block();
     *
     *   // ...
     * }
     */
    block() {
      return new Promise(() => {
      });
    }
    /**
     * Wrapper around `window.setInterval` that automatically clears the interval when invalidated.
     */
    setInterval(handler, timeout) {
      const id = setInterval(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearInterval(id));
      return id;
    }
    /**
     * Wrapper around `window.setTimeout` that automatically clears the interval when invalidated.
     */
    setTimeout(handler, timeout) {
      const id = setTimeout(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearTimeout(id));
      return id;
    }
    /**
     * Wrapper around `window.requestAnimationFrame` that automatically cancels the request when
     * invalidated.
     */
    requestAnimationFrame(callback) {
      const id = requestAnimationFrame((...args) => {
        if (this.isValid) callback(...args);
      });
      this.onInvalidated(() => cancelAnimationFrame(id));
      return id;
    }
    /**
     * Wrapper around `window.requestIdleCallback` that automatically cancels the request when
     * invalidated.
     */
    requestIdleCallback(callback, options) {
      const id = requestIdleCallback((...args) => {
        if (!this.signal.aborted) callback(...args);
      }, options);
      this.onInvalidated(() => cancelIdleCallback(id));
      return id;
    }
    addEventListener(target, type, handler, options) {
      var _a2;
      if (type === "wxt:locationchange") {
        if (this.isValid) this.locationWatcher.run();
      }
      (_a2 = target.addEventListener) == null ? void 0 : _a2.call(
        target,
        type.startsWith("wxt:") ? getUniqueEventName(type) : type,
        handler,
        {
          ...options,
          signal: this.signal
        }
      );
    }
    /**
     * @internal
     * Abort the abort controller and execute all `onInvalidated` listeners.
     */
    notifyInvalidated() {
      this.abort("Content script context invalidated");
      logger$1.debug(
        `Content script "${this.contentScriptName}" context invalidated`
      );
    }
    stopOldScripts() {
      window.postMessage(
        {
          type: _ContentScriptContext.SCRIPT_STARTED_MESSAGE_TYPE,
          contentScriptName: this.contentScriptName,
          messageId: Math.random().toString(36).slice(2)
        },
        "*"
      );
    }
    verifyScriptStartedEvent(event) {
      var _a2, _b2, _c;
      const isScriptStartedEvent = ((_a2 = event.data) == null ? void 0 : _a2.type) === _ContentScriptContext.SCRIPT_STARTED_MESSAGE_TYPE;
      const isSameContentScript = ((_b2 = event.data) == null ? void 0 : _b2.contentScriptName) === this.contentScriptName;
      const isNotDuplicate = !this.receivedMessageIds.has((_c = event.data) == null ? void 0 : _c.messageId);
      return isScriptStartedEvent && isSameContentScript && isNotDuplicate;
    }
    listenForNewerScripts(options) {
      let isFirst = true;
      const cb = (event) => {
        if (this.verifyScriptStartedEvent(event)) {
          this.receivedMessageIds.add(event.data.messageId);
          const wasFirst = isFirst;
          isFirst = false;
          if (wasFirst && (options == null ? void 0 : options.ignoreFirstEvent)) return;
          this.notifyInvalidated();
        }
      };
      addEventListener("message", cb);
      this.onInvalidated(() => removeEventListener("message", cb));
    }
  };
  __publicField(_ContentScriptContext, "SCRIPT_STARTED_MESSAGE_TYPE", getUniqueEventName(
    "wxt:content-script-started"
  ));
  let ContentScriptContext = _ContentScriptContext;
  const nullKey = Symbol("null");
  let keyCounter = 0;
  class ManyKeysMap extends Map {
    constructor() {
      super();
      this._objectHashes = /* @__PURE__ */ new WeakMap();
      this._symbolHashes = /* @__PURE__ */ new Map();
      this._publicKeys = /* @__PURE__ */ new Map();
      const [pairs] = arguments;
      if (pairs === null || pairs === void 0) {
        return;
      }
      if (typeof pairs[Symbol.iterator] !== "function") {
        throw new TypeError(typeof pairs + " is not iterable (cannot read property Symbol(Symbol.iterator))");
      }
      for (const [keys, value] of pairs) {
        this.set(keys, value);
      }
    }
    _getPublicKeys(keys, create = false) {
      if (!Array.isArray(keys)) {
        throw new TypeError("The keys parameter must be an array");
      }
      const privateKey = this._getPrivateKey(keys, create);
      let publicKey;
      if (privateKey && this._publicKeys.has(privateKey)) {
        publicKey = this._publicKeys.get(privateKey);
      } else if (create) {
        publicKey = [...keys];
        this._publicKeys.set(privateKey, publicKey);
      }
      return { privateKey, publicKey };
    }
    _getPrivateKey(keys, create = false) {
      const privateKeys = [];
      for (let key of keys) {
        if (key === null) {
          key = nullKey;
        }
        const hashes = typeof key === "object" || typeof key === "function" ? "_objectHashes" : typeof key === "symbol" ? "_symbolHashes" : false;
        if (!hashes) {
          privateKeys.push(key);
        } else if (this[hashes].has(key)) {
          privateKeys.push(this[hashes].get(key));
        } else if (create) {
          const privateKey = `@@mkm-ref-${keyCounter++}@@`;
          this[hashes].set(key, privateKey);
          privateKeys.push(privateKey);
        } else {
          return false;
        }
      }
      return JSON.stringify(privateKeys);
    }
    set(keys, value) {
      const { publicKey } = this._getPublicKeys(keys, true);
      return super.set(publicKey, value);
    }
    get(keys) {
      const { publicKey } = this._getPublicKeys(keys);
      return super.get(publicKey);
    }
    has(keys) {
      const { publicKey } = this._getPublicKeys(keys);
      return super.has(publicKey);
    }
    delete(keys) {
      const { publicKey, privateKey } = this._getPublicKeys(keys);
      return Boolean(publicKey && super.delete(publicKey) && this._publicKeys.delete(privateKey));
    }
    clear() {
      super.clear();
      this._symbolHashes.clear();
      this._publicKeys.clear();
    }
    get [Symbol.toStringTag]() {
      return "ManyKeysMap";
    }
    get size() {
      return super.size;
    }
  }
  new ManyKeysMap();
  function initPlugins() {
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  const result = (async () => {
    try {
      initPlugins();
      const { main, ...options } = definition;
      const ctx = new ContentScriptContext("content", options);
      return await main(ctx);
    } catch (err) {
      logger.error(
        `The content script "${"content"}" crashed on startup!`,
        err
      );
      throw err;
    }
  })();
  return result;
}();
content;
