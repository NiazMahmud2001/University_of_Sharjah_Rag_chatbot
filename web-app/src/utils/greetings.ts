// Utility to produce a single, deterministic greeting per chat
// Templates are single-line and will be formatted with the user's first name

export const GREETING_TEMPLATES: string[] = [
  "Hey {name}, coffee and Nexly time?",
  "Hey {name}, time to plan your next semester courses?",
  "Hi {name}, what are we tackling today?",
  "Hello {name}, ready to get productive?",
  "Hey {name}, let’s map out your week.",
  "Hi {name}, what can I help you with?",
  "Hey {name}, let’s sort your study plan.",
  "Hello {name}, how can Nexly assist today?",
  "Hey {name}, what do you want to study today?",
  "Hey {name}, shall we refine your study plan?",
  "Hey {name}, let’s sort your timetable.",
  "Hey {name}, want help choosing electives?",
  "Hey {name}, ready to tackle assignments?",
  "Hey {name}, prep for exams starts here.",
  "Hey {name}, let’s line up your revision.",
  "Hey {name}, quick check on deadlines?",
  "Hey {name}, map out this week’s classes?",
  "Hey {name}, need guidance on prerequisites?",
  "Hey {name}, optimize your schedule?",
  "Hey {name}, explore course outcomes?",
  "Hey {name}, track completed courses?",
  "Hey {name}, plan projects and labs?",
  "Hey {name}, brainstorm study strategy?",
  "Hey {name}, build your semester roadmap?",
  "Hey {name}, streamline your course load?",
  "Hey {name}, make time for coffee and code?",
];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0; // force 32-bit
  }
  return Math.abs(h);
}

function formatTemplate(template: string, name: string): string {
  const safe = name && name.trim() ? name.trim() : "there";
  return template.replace("{name}", safe);
}

export function getGreeting(firstName: string, sessionId: string): string {
  const idx = hashString(sessionId) % GREETING_TEMPLATES.length;
  return formatTemplate(GREETING_TEMPLATES[idx], firstName);
}