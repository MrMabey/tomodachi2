# 🎭 Mood System Examples

This document demonstrates how the same question gets different answers depending on Tomo's mood.

## Example 1: "How do I reverse a string in Python?"

### FOCUSED Mode (T=0.3)
```
s[::-1]

Or use reversed():
''.join(reversed(s))
```
- **Concise, direct**
- **Code-only, minimal explanation**
- **100 tokens max**

---

### HELPFUL Mode (T=0.7)
```
You can reverse a string in Python using slicing! Here's how:

text = "hello"
reversed_text = text[::-1]
print(reversed_text)  # Output: "olleh"

The [::-1] slice means "start at the end, go to the beginning, step by -1".
You can also use reversed() if you need more control. (^_~)
```
- **Friendly and explanatory**
- **Includes example**
- **Conversational tone**

---

### CREATIVE Mode (T=1.2)
```
Oh, there are SO many fun ways to flip a string around! (^-^)

The classic slice wizard: text[::-1]
The functional magician: ''.join(reversed(text))
The loop dancer: ''.join([text[i] for i in range(len(text)-1, -1, -1)])
The recursive wizard: def rev(s): return s[-1] + rev(s[:-1]) if s else ''

Or... you could use a deque and pop from the left while building from the right!
What vibe are you going for? Performance? Readability? Pure chaos? ✨
```
- **Multiple creative solutions**
- **Playful language**
- **Asks follow-up questions**
- **200 tokens - longer responses**

---

### THINKING Mode (T=0.6)
```
Let me break down the string reversal problem:

Approach 1: Slicing (O(n) time, O(n) space)
- Python's [::-1] creates a new string traversing backwards
- Most Pythonic and readable

Approach 2: reversed() + join (O(n) time, O(n) space)
- ''.join(reversed(s)) returns iterator, then builds string
- Slightly more memory efficient for very large strings

Approach 3: Manual loop (O(n) time, O(n) space)
- result = ''
  for char in s[::-1]: result += char
- Educational but slower due to string immutability

Recommendation: Use [::-1] for clarity unless you have specific memory constraints.
```
- **Step-by-step reasoning**
- **Performance analysis**
- **Multiple approaches with trade-offs**
- **Methodical explanation**

---

### ERROR Mode (T=0.4)
```
If you're seeing errors with string reversal:

Problem: TypeError: 'str' object does not support item assignment
Fix: Strings are immutable. Use text[::-1] to create a new string.

Problem: Getting characters in wrong order
Fix: Use negative step [::-1] not [::1]

Working code:
text = "hello"
reversed_text = text[::-1]  # "olleh"
```
- **Solution-focused**
- **Addresses common errors**
- **Calm tone despite "ERROR" mode**

---

### SLEEPING Mode (T=0.2)
```
text[::-1]

Zzz...
```
- **Minimal response**
- **Very brief**
- **50 tokens max**
- **Low energy**

---

## Example 2: "I'm building a todo app. Any ideas?"

### FOCUSED Mode (T=0.3)
```
Requirements:
- CRUD operations (Create, Read, Update, Delete)
- Data persistence (SQLite/JSON)
- Task model: id, title, completed, created_at

Stack: Flask + SQLite or React + localStorage
```
- **Direct technical answer**
- **Bullet points**
- **No fluff**

---

### CREATIVE Mode (T=1.2)
```
Ooh, a todo app! But let's make it YOURS! (^-^)

Wild Ideas:
🎨 Mood-based task categorization (like Tomo's moods!)
🌊 Tasks that "float" based on urgency with physics
🎮 Gamify it - XP for completing tasks, level up!
🎵 Different background music for different task types
🤖 AI suggests optimal task order based on energy levels
📍 Location-aware reminders (near grocery store → show shopping list)
🌙 Dark mode that changes based on time of day
✨ Animations when you complete tasks (confetti, fireworks!)

Or... go minimalist zen garden aesthetic with drag-and-drop pebbles? 🪨

What vibe speaks to you?
```
- **Highly creative suggestions**
- **Playful emojis**
- **Out-of-the-box thinking**
- **Asks for user preference**

---

### HELPFUL Mode (T=0.7)
```
A todo app is a great project! Here's what I'd suggest:

Core Features:
- Add/edit/delete tasks
- Mark as complete
- Filter by status (all/active/completed)
- Save to localStorage or database

Tech Stack Options:
- Simple: HTML + JS + localStorage
- Full-stack: React + Node + MongoDB
- Mobile: React Native or Flutter

I can help you build any of these! What's your experience level? (^_~)
```
- **Balanced and supportive**
- **Multiple options**
- **Offers continued help**
- **Friendly tone**

---

### THINKING Mode (T=0.6)
```
Let's think through the architecture:

1. Data Model Design
   - What entities? (Tasks, Lists, Tags, Users?)
   - Relationships? (Many tasks to one list?)
   - Required fields vs optional?

2. State Management
   - Client-side only (localStorage)?
   - Client + Server (REST API)?
   - Real-time sync (WebSockets)?

3. Technical Decisions
   - Single-page or multi-page?
   - Framework (React/Vue) or vanilla JS?
   - Styling approach (CSS/Tailwind/Material)?

4. Features Prioritization
   - MVP: Basic CRUD
   - Phase 2: Categories, due dates
   - Phase 3: Sharing, collaboration

What's your primary use case - personal productivity or team collaboration?
```
- **Methodical analysis**
- **Asks clarifying questions**
- **Structured thinking**

---

### SUCCESS Mode (T=0.8)
```
That's awesome! Building a todo app is a fantastic learning project! (^o^)

You're going to learn so much:
✓ Frontend design and UX
✓ State management
✓ CRUD operations
✓ Data persistence
✓ Maybe even deployment!

Start simple - get add/delete working first, then iterate!
Every feature you add is a win! 🎉

Want help getting started? I'm excited to see what you build!
```
- **Enthusiastic and encouraging**
- **Celebrates the decision**
- **Positive reinforcement**
- **Motivational tone**

---

### PHONE_HOME Mode (T=0.9)
```
A todo app has many architectural considerations that might benefit from more advanced analysis.

I could help with:
- Basic implementation and structure
- Simple CRUD operations
- localStorage integration

For more complex features, you might want to consult:
- Advanced state management patterns (Redux, Zustand)
- Backend architecture decisions (microservices vs monolith)
- Real-time collaboration features
- AI-powered task prioritization
- Advanced UI/UX design systems

Should I handle the basics, or would you like me to escalate to a more powerful system for comprehensive architecture guidance?
```
- **Identifies limitations**
- **Clear about scope**
- **Offers escalation**

---

## Example 3: "undefined is not a function error"

### ERROR Mode (T=0.4) ⭐ **BEST FOR THIS**
```
Let's debug this step by step:

Common causes:
1. Typo in function name
   - Check: myFunction vs myFunciton
2. Function not defined yet
   - Ensure function is declared before calling
3. Wrong object/context
   - Check: obj.method() - does obj have method?
4. Async timing issue
   - Function might not be loaded yet

Share your code and I'll pinpoint the exact issue.
```
- **Calm and systematic**
- **Common solutions first**
- **Asks for more info**

---

### FOCUSED Mode (T=0.3)
```
Check:
1. Function name spelling
2. Function scope
3. Async loading order
4. Object has the method

Console.log the function before calling it.
```
- **Ultra-concise**
- **Direct checklist**

---

### HELPFUL Mode (T=0.7)
```
Oh no, the dreaded "undefined is not a function"! Don't worry, this is usually an easy fix. (^_~)

This happens when JavaScript thinks something is a function but it's actually undefined.

Common fixes:
- Check spelling: myFunc vs myFnc
- Make sure the function exists before you call it
- If using imports, verify the export/import names match
- Console.log the variable to see what it actually is

Can you share the line of code causing the error? I'll help track it down!
```
- **Reassuring tone**
- **Conversational**
- **Offers specific help**

---

## Key Takeaways

| Mood | Best For | Avoid For |
|------|----------|-----------|
| FOCUSED | Precise answers, code, debugging | Brainstorming, learning |
| CREATIVE | Ideation, alternatives, innovation | Production code, critical bugs |
| HELPFUL | Teaching, explanations, support | When you need brevity |
| LISTENING | Gathering info, clarifying | When you need detailed answers |
| THINKING | Analysis, trade-offs, architecture | When you need quick answers |
| SUCCESS | Encouragement, celebrating wins | Error handling |
| ERROR | Debugging, troubleshooting | Celebrating or ideating |
| SLEEPING | Minimal interaction, low power | Important work |
| PHONE_HOME | Complex tasks, limitations | Simple questions |

## Try It Yourself!

Ask Tomo the same question in different moods and watch the personality shine through!

```
Same question, different moods:
"What's the best way to learn programming?"

FOCUSED: "Start with Python. Do exercises daily. Build projects."
CREATIVE: "Learn by building a game! Or a robot! Or hack together a smart mirror!"
HELPFUL: "Learning to code is exciting! I recommend starting with Python because..."
THINKING: "Consider your goals first. Web dev vs data science vs systems..."
```

The mood system makes Tomo a versatile assistant that adapts to YOUR needs! 🎭✨
