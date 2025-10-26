// Flow Buddy Avatar - Advanced behaviors with DOM-based rendering converted to Canvas
class FlowBuddyAvatar {
    constructor(size = 120) {
        this.size = size;
        this.canvas = document.createElement('canvas');
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx = this.canvas.getContext('2d');

        // State
        this.expression = 'happy';
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.expressionTimer = 0;
        this.pupilOffsetX = 0;
        this.pupilOffsetY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.showCheeks = false;

        // Movement mode
        this.isLockInMode = false;
        this.movementPattern = 'floating';
        this.pathProgress = 0;

        // Animation frame
        this.animationFrame = 0;
        this.animate();
    }

    animate() {
        this.animationFrame++;

        // Blink logic (every 2-7 seconds)
        this.blinkTimer++;
        if (this.blinkTimer > 120 && Math.random() < 0.01) {
            this.isBlinking = true;
            this.blinkTimer = 0;
            setTimeout(() => { this.isBlinking = false; }, 150);
        }

        // Expression changes (every 4-10 seconds)
        this.expressionTimer++;
        if (this.expressionTimer > 240 && Math.random() < 0.01) {
            const expressions = ['happy', 'excited', 'sleepy', 'surprised', 'focused'];
            this.expression = expressions[Math.floor(Math.random() * expressions.length)];
            this.expressionTimer = 0;
        }

        // Subtle pupil movement
        if (!this.isLockInMode) {
            this.pupilOffsetX = Math.sin(this.animationFrame * 0.02) * 2;
            this.pupilOffsetY = Math.cos(this.animationFrame * 0.03) * 2;
        }

        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    draw() {
        const ctx = this.ctx;
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        const radius = this.size * 0.46; // Bigger body

        // Clear canvas
        ctx.clearRect(0, 0, this.size, this.size);

        // Draw body with pink gradient
        const gradient = ctx.createLinearGradient(0, 0, this.size, this.size);
        gradient.addColorStop(0, '#ffb6c1'); // Light pink
        gradient.addColorStop(1, '#ff69b4'); // Hot pink

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Add white border with transparency
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add soft shadow glow
        ctx.shadowColor = 'rgba(255, 105, 180, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Draw eyes
        ctx.shadowBlur = 0; // Reset shadow for eyes
        this.drawEyes(ctx, centerX, centerY);

        // Draw mouth based on expression
        this.drawMouth(ctx, centerX, centerY);

        // Draw cheeks
        this.drawCheeks(ctx, centerX, centerY);
    }

    drawEyes(ctx, centerX, centerY) {
        const eyeY = centerY - 10;
        const eyeSpacing = 14;
        const eyeRadius = 10; // Larger eyes like original
        const pupilRadius = 6;

        if (this.isBlinking) {
            // Draw closed eyes (horizontal lines) - just like original
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';

            // Left eye - very thin
            ctx.beginPath();
            ctx.moveTo(centerX - eyeSpacing - 8, eyeY);
            ctx.lineTo(centerX - eyeSpacing + 8, eyeY);
            ctx.stroke();

            // Right eye - very thin
            ctx.beginPath();
            ctx.moveTo(centerX + eyeSpacing - 8, eyeY);
            ctx.lineTo(centerX + eyeSpacing + 8, eyeY);
            ctx.stroke();
        } else {
            // Left eye white
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(centerX - eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Left pupil
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(
                centerX - eyeSpacing + this.pupilOffsetX,
                eyeY + this.pupilOffsetY,
                pupilRadius,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Right eye white
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(centerX + eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Right pupil
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(
                centerX + eyeSpacing + this.pupilOffsetX,
                eyeY + this.pupilOffsetY,
                pupilRadius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawMouth(ctx, centerX, centerY) {
        const mouthY = centerY + 15;
        const mouthWidth = 24;
        const mouthHeight = 12;

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;

        switch(this.expression) {
            case 'happy':
                // Happy smile - bottom arc only (border-radius style)
                ctx.beginPath();
                ctx.arc(centerX, mouthY - 6, 12, 0.3, Math.PI - 0.3);
                ctx.stroke();
                break;
            case 'excited':
                // Bigger smile
                ctx.beginPath();
                ctx.arc(centerX, mouthY - 9, 15, 0.2, Math.PI - 0.2);
                ctx.stroke();
                break;
            case 'sleepy':
                // Small curved mouth
                ctx.beginPath();
                ctx.arc(centerX, mouthY - 3, 6, 0.3, Math.PI - 0.3);
                ctx.stroke();
                break;
            case 'surprised':
                // Open circle "O"
                ctx.beginPath();
                ctx.arc(centerX, mouthY, 6, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'focused':
                // Small mouth
                ctx.beginPath();
                ctx.arc(centerX, mouthY - 2, 4, 0.3, Math.PI - 0.3);
                ctx.stroke();
                break;
            default:
                // Default smile
                ctx.beginPath();
                ctx.arc(centerX, mouthY - 6, 12, 0.3, Math.PI - 0.3);
                ctx.stroke();
        }
    }

    drawCheeks(ctx, centerX, centerY) {
        // Pink blush cheeks - only show when cheeks are enabled
        if (this.showCheeks || this.expression === 'excited') {
            const opacity = this.expression === 'excited' ? 0.8 : 0.6;
            ctx.fillStyle = `rgba(255, 182, 193, ${opacity})`;

            // Left cheek
            ctx.beginPath();
            ctx.arc(centerX - 22, centerY + 8, 6, 0, Math.PI * 2);
            ctx.fill();

            // Right cheek
            ctx.beginPath();
            ctx.arc(centerX + 22, centerY + 8, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    setMood(mood) {
        const moodMap = {
            'HAPPY': 'happy',
            'EXCITED': 'excited',
            'FOCUSED': 'focused',
            'LISTENING': 'happy',
            'THINKING': 'focused',
            'SUCCESS': 'excited',
            'ERROR': 'surprised',
            'SLEEPING': 'sleepy',
            'CREATIVE': 'excited'
        };

        this.expression = moodMap[mood] || 'happy';
    }

    setLockInMode(enabled) {
        this.isLockInMode = enabled;
        if (enabled) {
            this.expression = 'focused';
            this.pupilOffsetX = 0;
            this.pupilOffsetY = 0;
        }
    }

    getCanvas() {
        return this.canvas;
    }

    destroy() {
        // Cleanup if needed
    }
}

// Make it available globally
window.FlowBuddyAvatar = FlowBuddyAvatar;
