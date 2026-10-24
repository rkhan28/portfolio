// =========================================================
// content.js — every word and link on the site lives here.
// =========================================================

export const profile = {
  name: 'Rahmat Khan.',
  mark: 'rk.',
  intro: 'I’m an engineer in Toronto. I build web apps, experiment with AI, and automate the things I’d rather not do twice.',
  email: 'rahmatkhan2001@hotmail.com',
}

export const links = {
  github: 'https://github.com/rkhan28',
  resume: '/assets/Rahmat-Khan-Resume.pdf',
  x: 'https://x.com/therealrahmat15',
  email: 'mailto:rahmatkhan2001@hotmail.com',
}

// Selected builds, numbered in shipping order.
export const builds = [
  {
    id: 'onboardy',
    step: 1,
    title: 'Onboardy',
    kind: 'Website',
    description: 'A website for the automation business I’m building. It walks through bookings, lead tracking, and customer follow-ups.',
    parts: ['Next.js', 'TypeScript', 'Framer Motion'],
    github: 'https://github.com/rkhan28/onboardy',
    details: {
      summary: 'A website that explains business automation services, including lead tracking, bookings, and customer follow-ups.',
      how: 'Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Responsive pages and animated examples explain how the proposed workflows would work.',
      scope: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    },
  },
  {
    id: 'ttc-pulse',
    step: 2,
    title: 'TTC Pulse',
    kind: 'Live map',
    description: 'Vehicle locations, arrival predictions, and service alerts, together on a map of Toronto. Built with TTC feeds and Next.js.',
    parts: ['Next.js', 'Transit APIs', 'Redis'],
    github: 'https://github.com/rkhan28/ttcpulse',
    details: {
      summary: 'A Toronto transit app that brings vehicle locations, arrival predictions, and service alerts into one map.',
      how: 'Built with Next.js, transit APIs, and Redis. An optional OpenAI assistant answers questions about routes and stops.',
      scope: ['Next.js', 'Transit APIs', 'OpenAI', 'Redis'],
    },
  },
  {
    id: 'phishguard',
    step: 3,
    title: 'PhishGuard',
    kind: 'Demo',
    description: 'A small TypeScript demo that highlights common phishing phrases and explains what made them suspicious.',
    parts: ['TypeScript', 'Next.js', 'Tailwind CSS'],
    github: 'https://github.com/rkhan28/phishguard',
    details: {
      summary: 'A demo for spotting common phishing phrases in text and exploring sample email reports.',
      how: 'Built with Next.js and TypeScript. A local keyword checker highlights warning phrases, while report dashboards explain example results in light and dark themes.',
      scope: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    },
  },
]

// Smaller experiments, stacked bottom-up.
export const experiments = [
  { label: 'VolleyVision', meta: 'A Python guide to tracking volleyball players and the ball.', color: 'blue', href: 'https://github.com/rkhan28/volleyanalsysis' },
  { label: 'FinanceTracker', meta: 'Expenses, budgets, and savings goals in a React app.', color: 'yellow', href: 'https://github.com/rkhan28/FinanceTracker' },
  { label: 'Netflix IMDb Filter', meta: 'A Chrome extension for filtering titles by rating and genre.', color: 'red', href: 'https://github.com/rkhan28/netflixfilter' },
]

export const about = {
  lead: 'I’m Rahmat. I like understanding how things work—usually by building something, breaking it, and trying again.',
  body: [
    'Lately, that’s meant AI agents, automation, and Onboardy. I’m interested in the messy part between a promising idea and software someone can actually use.',
    'I’m always up for comparing notes with other people who like making things.',
  ],
  quote: 'I’ll build an agent for days to save five minutes.',
  quoteNote: 'The ROI arrives eventually.',
}
