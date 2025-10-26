# Avatar Code & Behaviors

This folder contains all the source code for the Flow Buddy avatar system.

## Files

### floating-avatar.content.ts
Core avatar implementation with:
- Visual design (circular pink gradient with eyes, mouth, cheeks)
- Movement behaviors (floating, circling, zigzag, spiral, bouncing, exploring)
- Two modes: Vibe Mode (playful) and Lock-in Mode (focused)
- Eye tracking and blinking animations
- Mood system (happy, excited, sleepy, surprised, focused)
- Interactive hover and click effects

### PipPanel.vue
Control panel UI component:
- Mode toggle buttons
- Session timer and tracking
- Notes and export functionality (CSV/JSON)
- Keyboard shortcuts

### background.ts
Extension background service:
- Keyboard command listener
- PIP window management
- Screen positioning

### panel.html
HTML markup for the control panel

### wxt.config.ts
Extension configuration:
- Manifest settings
- Keyboard command setup

## Avatar Behaviors

**Vibe Mode Movement Patterns:**
- Floating, Circling, Zigzag, Spiral, Bouncing, Exploring
- Random pattern changes every 8-15 seconds

**Expressions:**
- Happy, Excited, Sleepy, Surprised, Focused

**Animations:**
- Blinking (2-7 second intervals)
- Mouse-tracking eyes
- Hover effects
- Click responses
