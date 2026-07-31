import { PromptCategory } from '../../src/types/prompt';

export interface SeedPrompt {
  _id: string;
  title: string;
  prompt: string;
  description: string;
  category: PromptCategory;
  tags: string[];
  favorite: boolean;
  pinned: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_SEED_PROMPTS: SeedPrompt[] = [
  {
    _id: 'seed-1',
    title: 'Senior TypeScript Code Auditor',
    description: 'Refactor, audit, and optimize TypeScript code for performance, security, and type safety.',
    prompt: `You are a Principal TypeScript & Software Architect. Review the following code snippet carefully:

[INSERT CODE HERE]

Please perform a comprehensive audit covering:
1. Type Safety & Generics: Identify any 'any' types, unsafe type assertions, or missing return types.
2. Performance Optimization: Point out unnecessary re-renders, expensive operations, or memory leaks.
3. Architecture & Clean Code: Suggest modular refactoring adhering to SOLID principles.
4. Security: Check for input validation flaws or injection vulnerabilities.

Provide a step-by-step breakdown followed by the refactored production-ready code.`,
    category: 'Coding',
    tags: ['TypeScript', 'Code Review', 'Architecture', 'Refactoring'],
    favorite: true,
    pinned: true,
    displayOrder: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    _id: 'seed-2',
    title: 'SaaS High-Converting Landing Page Copy',
    description: 'Generate compelling value propositions, hero section copy, and features matrix for SaaS.',
    prompt: `Act as a World-Class Conversion Copywriter. I am launching a new B2B SaaS product named [PRODUCT_NAME].

Product Summary: [INSERT BRIEF DESCRIPTION]
Target Audience: [INSERT TARGET AUDIENCE]

Write the complete landing page copy including:
- Hero Headline (3 punchy options using benefit-driven language)
- Subheadline expanding on key pain points
- Primary & Secondary CTA button labels
- 3 Core Benefit Sections with subheadings and bullet points
- Social Proof testimonial quotes (placeholders)
- FAQ Section answering top 3 objections.`,
    category: 'Marketing',
    tags: ['Copywriting', 'SaaS', 'Conversion', 'Landing Page'],
    favorite: true,
    pinned: true,
    displayOrder: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    _id: 'seed-3',
    title: 'SQL Query Optimizer & Indexing Strategy',
    description: 'Analyze slow SQL queries, explain execution plans, and recommend compound indexes.',
    prompt: `You are an expert Database Administrator specializing in PostgreSQL and MySQL performance tuning.

Here is my SQL query and table schema:
Schema: [INSERT SCHEMA]
Query: [INSERT QUERY]

Tasks:
1. Identify performance bottlenecks (e.g., full table scans, missing indexes, unindexed JOINs).
2. Rewrite the query to minimize execution time and memory usage.
3. Recommend specific compound indexes with column ordering explanations.
4. Provide an estimate of performance improvement.`,
    category: 'SQL',
    tags: ['Database', 'PostgreSQL', 'Performance', 'Optimization'],
    favorite: false,
    pinned: false,
    displayOrder: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    _id: 'seed-4',
    title: 'Executive Cold Outreach Email Sequence',
    description: 'Personalized 3-touch cold email sequence for C-level executives.',
    prompt: `You are an expert B2B Sales Strategist. Create a 3-touch cold email sequence to pitch [OFFERING] to [PROSPECT_TITLE] at [INDUSTRY] companies.

Guidelines:
- Keep emails under 125 words.
- Tone: Professional, direct, non-pushy, and value-focused.
- Email 1: Hook with industry insight + soft offer.
- Email 2: Follow-up with relevant quick case study metric.
- Email 3: Polite break-up email with low-friction CTA.

Include subject lines (3 variants per email).`,
    category: 'Email',
    tags: ['Cold Email', 'Sales', 'B2B', 'Outreach'],
    favorite: true,
    pinned: false,
    displayOrder: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    _id: 'seed-5',
    title: 'Thought Leadership LinkedIn Thread Generator',
    description: 'Transform complex technical concepts into engaging viral social media threads.',
    prompt: `Act as a top tech influencer and thought leader on LinkedIn. Write a high-engagement post about [TOPIC/CONCEPT].

Formatting rules:
- Strong hook line (max 10 words) that stops the scroll.
- Spaced single-line paragraphs for high readability.
- Use 3 key takeaways or actionable steps.
- Include a thought-provoking closing question to boost comment engagement.
- Add 4 relevant hashtags at the bottom.`,
    category: 'Social Media',
    tags: ['LinkedIn', 'Thought Leadership', 'Growth', 'Content Creation'],
    favorite: false,
    pinned: false,
    displayOrder: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    _id: 'seed-6',
    title: 'Tailwind CSS UI Component Generator',
    description: 'Design sleek, accessible modern web components using Tailwind CSS and React.',
    prompt: `You are a Senior Frontend Engineer & UI Specialist. Build a React component using Tailwind CSS for:

Component Goal: [COMPONENT_NAME / e.g., Modern Pricing Table with Billing Toggle]

Requirements:
- Modern aesthetic: clean subtle borders, soft dark mode shadows, micro-interactions.
- Fully responsive across mobile, tablet, and desktop.
- Accessible ARIA attributes and keyboard focus states.
- Clean TypeScript props interface.
- Return self-contained executable code.`,
    category: 'Design',
    tags: ['React', 'Tailwind', 'UI/UX', 'Components'],
    favorite: true,
    pinned: false,
    displayOrder: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    _id: 'seed-7',
    title: 'FAANG Resume Achievement Bullet Rewriter',
    description: 'Convert plain job descriptions into impactful, metric-driven resume bullet points using the XYZ formula.',
    prompt: `You are a Senior Tech Recruiter at Google/Meta. Rewrite these work experience bullet points using Google's X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".

Original bullets:
[INSERT RAW BULLET POINTS]

Target Role: [INSERT TARGET ROLE, e.g., Senior Full Stack Engineer]

Rules:
- Start with strong action verbs.
- Quantify impact with realistic metrics/percentages where needed.
- Highlight modern technical tools used.`,
    category: 'Resume',
    tags: ['Resume', 'Career', 'Interview', 'FAANG'],
    favorite: false,
    pinned: false,
    displayOrder: 7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    _id: 'seed-8',
    title: 'Comprehensive Technical Documentation Writer',
    description: 'Generate clear, standardized API documentation and system overview in Markdown.',
    prompt: `Act as a Principal Technical Writer. Generate comprehensive Markdown documentation for [SYSTEM / ENDPOINT / FEATURE].

Include:
- System Overview & Architecture diagram (Mermaid JS format)
- Environment Variables setup
- API Endpoints details (HTTP Method, Headers, Request Body Schema, Response 200/400/500 JSON)
- Error Handling & Common Troubleshooting steps
- Code examples in cURL, JavaScript/TypeScript, and Python.`,
    category: 'Content Writing',
    tags: ['Documentation', 'API', 'Markdown', 'Technical Writing'],
    favorite: false,
    pinned: false,
    displayOrder: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    _id: 'seed-9',
    title: 'Daily Task Prioritizer & Time Blocking Master',
    description: 'Structure unstructured to-do lists into Eisenhower Matrix time blocks for optimal deep work.',
    prompt: `You are an executive productivity coach. Here is my messy list of tasks for today:

[INSERT TASK LIST]

Please organize these tasks into:
1. Eisenhower Matrix breakdown (Urgent/Important)
2. Suggested 90-minute Deep Work blocks with break buffers
3. Delegate/Defer recommendations
4. Quick-win tasks (under 15 minutes) to start the momentum.`,
    category: 'Productivity',
    tags: ['Productivity', 'Time Management', 'Workflow', 'Planning'],
    favorite: false,
    pinned: false,
    displayOrder: 9,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    _id: 'seed-10',
    title: 'Midjourney & DALL-E Photorealistic Prompt Crafting',
    description: 'Construct detailed, parameters-tuned visual prompts for AI image models.',
    prompt: `Act as an expert AI Visual Designer. Generate 3 detailed image generation prompts for:

Concept: [DESCRIBE THE SCENE / SUBJECT]

Include details for:
- Subject & Lighting (e.g., golden hour, cinematic chiaroscuro, volumetric neon)
- Camera & Lens specifications (e.g., 85mm f/1.4 lens, Hasselblad medium format)
- Style & Mood (e.g., photorealistic, architectural digest style, minimalist Cyberpunk)
- Midjourney v6 parameters (--ar 16:9 --style raw --v 6.0).`,
    category: 'Design',
    tags: ['Midjourney', 'AI Art', 'Prompts', 'DALL-E'],
    favorite: false,
    pinned: false,
    displayOrder: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];
