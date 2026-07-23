-- ============================================================================
-- CodeU Academy — Development Seed Data
-- Run after migration: 00001_initial_schema.sql
-- Usage: psql -d your_db -f supabase/seed.sql
-- ============================================================================

BEGIN;

-- Cleanup for idempotent re-runs (order respects FK constraints)
DELETE FROM reviews;
DELETE FROM favorites;
DELETE FROM notifications;
DELETE FROM certificates;
DELETE FROM exam_results;
DELETE FROM quiz_answers;
DELETE FROM quiz_questions;
DELETE FROM quizzes;
DELETE FROM lesson_files;
DELETE FROM lessons;
DELETE FROM course_sections;
DELETE FROM courses;
DELETE FROM categories;
DELETE FROM instructors;
DELETE FROM users;

-- ============================================================================
-- Users (via auth.users — trigger handle_new_user populates public.users)
-- ============================================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone_change, phone_change_token, reauthentication_token, is_sso_user)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'sarah@codeu.dev',
    crypt('password123', gen_salt('bf')),
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Sarah Chen","avatar_url":"https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah"}',
    now(),
    now(),
    '', '', '', false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'marcus@codeu.dev',
    crypt('password123', gen_salt('bf')),
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Marcus Johnson","avatar_url":"https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus"}',
    now(),
    now(),
    '', '', '', false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'student@codeu.dev',
    crypt('password123', gen_salt('bf')),
    now(),
    '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Alex Rivera","avatar_url":"https://api.dicebear.com/9.x/avataaars/svg?seed=Alex"}',
    now(),
    now(),
    '', '', '', false
  );

-- Since the trigger inserts into public.users with the same IDs, update roles
UPDATE users SET role = 'instructor' WHERE email IN ('sarah@codeu.dev', 'marcus@codeu.dev');

-- ============================================================================
-- Instructors
-- ============================================================================
INSERT INTO instructors (id, user_id, bio, headline, website, social_links, rating, total_students)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Sarah is a full-stack developer with over 10 years of experience building production applications. She specializes in Next.js, React Native, and Supabase, and has taught over 15,000 students worldwide. Her courses focus on practical, real-world projects that prepare students for actual development work.',
    'Full-Stack Developer & Instructor | Next.js, React Native, Supabase',
    'https://sarahchen.dev',
    '{"twitter":"@sarahchendev","github":"sarahchen","linkedin":"sarahchen"}',
    4.8,
    15200
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'Marcus is an AI/ML engineer and educator who has worked at leading tech companies building scalable ML systems. He is passionate about making AI accessible to developers and has authored multiple courses on machine learning, Python, and system architecture.',
    'AI/ML Engineer & Educator | Python, Rust, System Design',
    'https://marcusj.dev',
    '{"twitter":"@marcusjml","github":"marcusj","linkedin":"marcusjohnson"}',
    4.9,
    9800
  );

-- ============================================================================
-- Categories
-- ============================================================================
INSERT INTO categories (id, name, slug, icon, description)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'Mobile Development',
    'mobile-development',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    'Build cross-platform mobile apps with Flutter, React Native, and native tools'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'Web Development',
    'web-development',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    'Master modern web frameworks, from Next.js to React to Vue'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'Backend Architecture',
    'backend-architecture',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    'Design scalable backend systems with modern architectures and languages'
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'AI & Machine Learning',
    'ai-machine-learning',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    'Harness the power of AI — from LLMs to computer vision to data science'
  );

-- ============================================================================
-- Courses
-- ============================================================================

-- Course 1: Full-Stack Next.js 16 Masterclass
INSERT INTO courses (id, instructor_id, category_id, title, slug, subtitle, description, thumbnail_url, preview_video_url, price, discount_price, level, language, status)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'Full-Stack Next.js 16 Masterclass',
    'fullstack-nextjs-16-masterclass',
    'Build production-grade SaaS applications with the latest Next.js features',
    'This comprehensive masterclass takes you from zero to production-ready with Next.js 16. Learn the App Router, Server Components, Server Actions, middleware patterns, authentication with Supabase, database design, and deployment. By the end, you will have built a fully functional SaaS platform with payments, real-time features, and a beautiful UI.',
    'https://picsum.photos/seed/nextjs16/800/450',
    'https://vimeo.com/1062226296',
    149.99,
    89.99,
    'advanced',
    'en',
    'published'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Flutter & Supabase Mobile Apps',
    'flutter-supabase-mobile-apps',
    'Build cross-platform mobile apps with Flutter and a Supabase backend',
    'Learn to build beautiful, performant mobile apps using Flutter and Supabase. This course covers state management, real-time subscriptions, authentication, file storage, and edge functions. You will build a social fitness app with live chat, user profiles, and push notifications.',
    'https://picsum.photos/seed/fluttersupabase/800/450',
    'https://vimeo.com/1062226297',
    129.99,
    79.99,
    'intermediate',
    'en',
    'published'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000004',
    'Python AI Agents',
    'python-ai-agents',
    'Build intelligent AI agents with Python, LangChain, and OpenAI',
    'Dive into the world of AI agents! This course teaches you to build autonomous AI agents using Python, LangChain, and large language models. Learn about tool use, memory, multi-agent systems, retrieval-augmented generation (RAG), and deployment. Build a research assistant, a code review agent, and a customer support bot.',
    'https://picsum.photos/seed/pythonaia/800/450',
    'https://vimeo.com/1062226298',
    179.99,
    119.99,
    'advanced',
    'en',
    'published'
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'Rust Backend Systems',
    'rust-backend-systems',
    'Build high-performance backend systems with Rust and Actix-web',
    'Master systems programming for the web with Rust. This course covers ownership, lifetimes, async/await, Actix-web, Diesel ORM, PostgreSQL optimization, and benchmarking. Build a real-time analytics pipeline, a WebSocket server, and a high-throughput API gateway.',
    'https://picsum.photos/seed/rustbackend/800/450',
    'https://vimeo.com/1062226299',
    199.99,
    139.99,
    'advanced',
    'en',
    'published'
  );

-- ============================================================================
-- Course Sections
-- ============================================================================

-- Course 1 Sections (Next.js 16)
INSERT INTO course_sections (id, course_id, title, sort_order)
VALUES
  ('e0000000-0000-0000-0001-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Welcome & Setup', 1),
  ('e0000000-0000-0000-0001-000000000002', 'd0000000-0000-0000-0000-000000000001', 'App Router Deep Dive', 2),
  ('e0000000-0000-0000-0001-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Server Components & Data Fetching', 3),
  ('e0000000-0000-0000-0001-000000000004', 'd0000000-0000-0000-0000-000000000001', 'Authentication & Authorization', 4),
  ('e0000000-0000-0000-0001-000000000005', 'd0000000-0000-0000-0000-000000000001', 'Production Deployment', 5);

-- Course 2 Sections (Flutter & Supabase)
INSERT INTO course_sections (id, course_id, title, sort_order)
VALUES
  ('e0000000-0000-0000-0002-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Getting Started with Flutter', 1),
  ('e0000000-0000-0000-0002-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Supabase Backend Setup', 2),
  ('e0000000-0000-0000-0002-000000000003', 'd0000000-0000-0000-0000-000000000002', 'Building the UI', 3),
  ('e0000000-0000-0000-0002-000000000004', 'd0000000-0000-0000-0000-000000000002', 'Real-Time Features & Push', 4);

-- Course 3 Sections (Python AI Agents)
INSERT INTO course_sections (id, course_id, title, sort_order)
VALUES
  ('e0000000-0000-0000-0003-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Introduction to AI Agents', 1),
  ('e0000000-0000-0000-0003-000000000002', 'd0000000-0000-0000-0000-000000000003', 'LangChain Fundamentals', 2),
  ('e0000000-0000-0000-0003-000000000003', 'd0000000-0000-0000-0000-000000000003', 'Building Multi-Agent Systems', 3),
  ('e0000000-0000-0000-0003-000000000004', 'd0000000-0000-0000-0000-000000000003', 'RAG & Production Deployment', 4);

-- Course 4 Sections (Rust Backend Systems)
INSERT INTO course_sections (id, course_id, title, sort_order)
VALUES
  ('e0000000-0000-0000-0004-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Rust Fundamentals for Backend', 1),
  ('e0000000-0000-0000-0004-000000000002', 'd0000000-0000-0000-0000-000000000004', 'Actix-web & REST APIs', 2),
  ('e0000000-0000-0000-0004-000000000003', 'd0000000-0000-0000-0000-000000000004', 'Database Design with Diesel', 3),
  ('e0000000-0000-0000-0004-000000000004', 'd0000000-0000-0000-0000-000000000004', 'Performance & Benchmarking', 4);

-- ============================================================================
-- Lessons
-- ============================================================================

-- Course 1 Lessons (Next.js 16 — 12 lessons)
INSERT INTO lessons (id, section_id, title, slug, type, video_url, duration_seconds, is_free_preview, sort_order)
VALUES
  ('f0000000-0000-0001-0001-000000000001', 'e0000000-0000-0000-0001-000000000001', 'Course Overview & Prerequisites', 'course-overview', 'video', 'https://vimeo.com/1062226301', 480, true, 1),
  ('f0000000-0000-0001-0001-000000000002', 'e0000000-0000-0000-0001-000000000001', 'Installing Node.js 20+ and Setting Up', 'installing-nodejs', 'video', 'https://vimeo.com/1062226302', 720, false, 2),
  ('f0000000-0000-0001-0001-000000000003', 'e0000000-0000-0000-0001-000000000001', 'Project Scaffolding with create-next-app', 'project-scaffolding', 'document', NULL, NULL, false, 3),
  ('f0000000-0000-0001-0002-000000000001', 'e0000000-0000-0000-0001-000000000002', 'Understanding the App Router', 'app-router-deep-dive', 'video', 'https://vimeo.com/1062226303', 1200, false, 1),
  ('f0000000-0000-0001-0002-000000000002', 'e0000000-0000-0000-0001-000000000002', 'Layouts, Templates & Loading States', 'layouts-templates-loading', 'video', 'https://vimeo.com/1062226304', 900, false, 2),
  ('f0000000-0000-0001-0002-000000000003', 'e0000000-0000-0000-0001-000000000002', 'Route Groups & Parallel Routes', 'route-groups-parallel', 'video', 'https://vimeo.com/1062226305', 780, false, 3),
  ('f0000000-0000-0001-0003-000000000001', 'e0000000-0000-0000-0001-000000000003', 'Server Components vs Client Components', 'server-vs-client-components', 'video', 'https://vimeo.com/1062226306', 1100, false, 1),
  ('f0000000-0000-0001-0003-000000000002', 'e0000000-0000-0000-0001-000000000003', 'Data Fetching with Server Components', 'data-fetching-server', 'video', 'https://vimeo.com/1062226307', 960, false, 2),
  ('f0000000-0000-0001-0003-000000000003', 'e0000000-0000-0000-0001-000000000003', 'Server Actions & Mutations', 'server-actions', 'quiz', NULL, NULL, false, 3),
  ('f0000000-0000-0001-0004-000000000001', 'e0000000-0000-0000-0001-000000000004', 'Setting Up Supabase Auth', 'supabase-auth-setup', 'video', 'https://vimeo.com/1062226308', 840, false, 1),
  ('f0000000-0000-0001-0004-000000000002', 'e0000000-0000-0000-0001-000000000004', 'Middleware & Route Protection', 'middleware-route-protection', 'video', 'https://vimeo.com/1062226309', 660, false, 2),
  ('f0000000-0000-0001-0005-000000000001', 'e0000000-0000-0000-0001-000000000005', 'Deploying to Vercel', 'deploying-to-vercel', 'video', 'https://vimeo.com/1062226310', 540, false, 1);

-- Course 2 Lessons (Flutter — 10 lessons)
INSERT INTO lessons (id, section_id, title, slug, type, video_url, duration_seconds, is_free_preview, sort_order)
VALUES
  ('f0000000-0000-0002-0001-000000000001', 'e0000000-0000-0000-0002-000000000001', 'Why Flutter? Ecosystem Overview', 'why-flutter', 'video', 'https://vimeo.com/1062226311', 600, true, 1),
  ('f0000000-0000-0002-0001-000000000002', 'e0000000-0000-0000-0002-000000000001', 'Dart Basics for Beginners', 'dart-basics', 'video', 'https://vimeo.com/1062226312', 1500, false, 2),
  ('f0000000-0000-0002-0001-000000000003', 'e0000000-0000-0000-0002-000000000001', 'Setting Up Flutter Environment', 'setup-flutter-env', 'document', NULL, NULL, false, 3),
  ('f0000000-0000-0002-0002-000000000001', 'e0000000-0000-0000-0002-000000000002', 'Creating a Supabase Project', 'create-supabase-project', 'video', 'https://vimeo.com/1062226313', 480, false, 1),
  ('f0000000-0000-0002-0002-000000000002', 'e0000000-0000-0000-0002-000000000002', 'Database Design & Migrations', 'database-design-migrations', 'video', 'https://vimeo.com/1062226314', 1080, false, 2),
  ('f0000000-0000-0002-0002-000000000003', 'e0000000-0000-0000-0002-000000000002', 'RLS Policies & Security', 'rls-policies-security', 'quiz', NULL, NULL, false, 3),
  ('f0000000-0000-0002-0003-000000000001', 'e0000000-0000-0000-0002-000000000003', 'Building the Onboarding Flow', 'onboarding-flow', 'video', 'https://vimeo.com/1062226315', 1320, false, 1),
  ('f0000000-0000-0002-0003-000000000002', 'e0000000-0000-0000-0002-000000000003', 'State Management with Riverpod', 'state-management-riverpod', 'video', 'https://vimeo.com/1062226316', 960, false, 2),
  ('f0000000-0000-0002-0004-000000000001', 'e0000000-0000-0000-0002-000000000004', 'Real-Time Chat with Supabase Realtime', 'realtime-chat', 'video', 'https://vimeo.com/1062226317', 1140, false, 1),
  ('f0000000-0000-0002-0004-000000000002', 'e0000000-0000-0000-0002-000000000004', 'Push Notifications with FCM', 'push-notifications', 'video', 'https://vimeo.com/1062226318', 780, false, 2);

-- Course 3 Lessons (Python AI Agents — 10 lessons)
INSERT INTO lessons (id, section_id, title, slug, type, video_url, duration_seconds, is_free_preview, sort_order)
VALUES
  ('f0000000-0000-0003-0001-000000000001', 'e0000000-0000-0000-0003-000000000001', 'What Are AI Agents?', 'what-are-ai-agents', 'video', 'https://vimeo.com/1062226319', 720, true, 1),
  ('f0000000-0000-0003-0001-000000000002', 'e0000000-0000-0000-0003-000000000001', 'LLM Landscape: OpenAI, Claude, Open Source', 'llm-landscape', 'video', 'https://vimeo.com/1062226320', 960, false, 2),
  ('f0000000-0000-0003-0001-000000000003', 'e0000000-0000-0000-0003-000000000001', 'Setting Up Python & Virtual Environments', 'setup-python-env', 'document', NULL, NULL, false, 3),
  ('f0000000-0000-0003-0002-000000000001', 'e0000000-0000-0000-0003-000000000002', 'LangChain: Chains & Prompts', 'langchain-chains-prompts', 'video', 'https://vimeo.com/1062226321', 1200, false, 1),
  ('f0000000-0000-0003-0002-000000000002', 'e0000000-0000-0000-0003-000000000002', 'Tool Use & Function Calling', 'tool-use-function-calling', 'video', 'https://vimeo.com/1062226322', 840, false, 2),
  ('f0000000-0000-0003-0002-000000000003', 'e0000000-0000-0000-0003-000000000002', 'Memory & Conversation History', 'memory-conversation', 'video', 'https://vimeo.com/1062226323', 660, false, 3),
  ('f0000000-0000-0003-0003-000000000001', 'e0000000-0000-0000-0003-000000000003', 'Multi-Agent Orchestration with CrewAI', 'multi-agent-crewai', 'video', 'https://vimeo.com/1062226324', 1500, false, 1),
  ('f0000000-0000-0003-0003-000000000002', 'e0000000-0000-0000-0003-000000000003', 'Building a Research Agent', 'research-agent', 'video', 'https://vimeo.com/1062226325', 1080, false, 2),
  ('f0000000-0000-0003-0003-000000000003', 'e0000000-0000-0000-0003-000000000003', 'Building a Code Review Agent', 'code-review-agent', 'video', 'https://vimeo.com/1062226326', 960, false, 3),
  ('f0000000-0000-0003-0004-000000000001', 'e0000000-0000-0000-0003-000000000004', 'RAG: Vector Stores & Embeddings', 'rag-vector-embeddings', 'video', 'https://vimeo.com/1062226327', 1320, false, 1);

-- Course 4 Lessons (Rust Backend — 10 lessons)
INSERT INTO lessons (id, section_id, title, slug, type, video_url, duration_seconds, is_free_preview, sort_order)
VALUES
  ('f0000000-0000-0004-0001-000000000001', 'e0000000-0000-0000-0004-000000000001', 'Why Rust for Backend?', 'why-rust-backend', 'video', 'https://vimeo.com/1062226328', 540, true, 1),
  ('f0000000-0000-0004-0001-000000000002', 'e0000000-0000-0000-0004-000000000001', 'Ownership & Borrowing Refresher', 'ownership-borrowing', 'video', 'https://vimeo.com/1062226329', 1200, false, 2),
  ('f0000000-0000-0004-0001-000000000003', 'e0000000-0000-0000-0004-000000000001', 'Async/Await & Tokio Runtime', 'async-await-tokio', 'video', 'https://vimeo.com/1062226330', 900, false, 3),
  ('f0000000-0000-0004-0002-000000000001', 'e0000000-0000-0000-0004-000000000002', 'Your First Actix-web Server', 'first-actix-server', 'video', 'https://vimeo.com/1062226331', 780, false, 1),
  ('f0000000-0000-0004-0002-000000000002', 'e0000000-0000-0000-0004-000000000002', 'Middleware, Auth & Error Handling', 'middleware-auth-errors', 'video', 'https://vimeo.com/1062226332', 1100, false, 2),
  ('f0000000-0000-0004-0002-000000000003', 'e0000000-0000-0000-0004-000000000002', 'REST API Best Practices', 'rest-api-best-practices', 'document', NULL, NULL, false, 3),
  ('f0000000-0000-0004-0003-000000000001', 'e0000000-0000-0000-0004-000000000003', 'Diesel ORM: Models & Migrations', 'diesel-orm-models', 'video', 'https://vimeo.com/1062226333', 1080, false, 1),
  ('f0000000-0000-0004-0003-000000000002', 'e0000000-0000-0000-0004-000000000003', 'PostgreSQL Optimization Techniques', 'postgres-optimization', 'video', 'https://vimeo.com/1062226334', 960, false, 2),
  ('f0000000-0000-0004-0004-000000000001', 'e0000000-0000-0000-0004-000000000004', 'Benchmarking with Criterion', 'benchmarking-criterion', 'video', 'https://vimeo.com/1062226335', 720, false, 1),
  ('f0000000-0000-0004-0004-000000000002', 'e0000000-0000-0000-0004-000000000004', 'Building a WebSocket Server', 'websocket-server', 'quiz', NULL, NULL, false, 2);

-- ============================================================================
-- Quizzes
-- ============================================================================

-- Quiz for Next.js: Server Actions lesson
INSERT INTO quizzes (id, lesson_id, title, passing_score)
VALUES
  ('70000000-0000-0000-0000-000000000001', 'f0000000-0000-0001-0003-000000000003', 'Server Actions & Mutations Quiz', 70);

-- Quiz for Flutter: RLS Policies lesson
INSERT INTO quizzes (id, lesson_id, title, passing_score)
VALUES
  ('70000000-0000-0000-0000-000000000002', 'f0000000-0000-0002-0002-000000000003', 'RLS & Security Quiz', 80);

-- Quiz for Rust: WebSocket lesson
INSERT INTO quizzes (id, lesson_id, title, passing_score)
VALUES
  ('70000000-0000-0000-0000-000000000003', 'f0000000-0000-0004-0004-000000000002', 'WebSocket & Concurrency Quiz', 75);

-- ============================================================================
-- Quiz Questions & Answers
-- ============================================================================

-- Quiz 1: Server Actions
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, sort_order)
VALUES
  ('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'What directive must a Server Action use?', 'single_choice', 1, 1),
  ('80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'Which of the following are valid use cases for Server Actions?', 'multiple_choice', 2, 2),
  ('80000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', 'Server Actions can only be used in Server Components.', 'true_false', 1, 3);

INSERT INTO quiz_answers (id, question_id, answer_text, is_correct)
VALUES
  ('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '"use server"', true),
  ('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '"use client"', false),
  ('90000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000001', '"server only"', false),
  ('90000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000001', '"use api"', false),
  ('90000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000002', 'Form submissions', true),
  ('90000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000002', 'Database mutations', true),
  ('90000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000002', 'Client-side animations', false),
  ('90000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000002', 'Revalidating cached data', true),
  ('90000000-0000-0000-0000-000000000009', '80000000-0000-0000-0000-000000000003', 'True', false),
  ('90000000-0000-0000-0000-000000000010', '80000000-0000-0000-0000-000000000003', 'False', true);

-- Quiz 2: RLS & Security
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, sort_order)
VALUES
  ('80000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002', 'What does RLS stand for?', 'single_choice', 1, 1),
  ('80000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000002', 'Which SQL clause defines which rows a user can read?', 'single_choice', 1, 2);

INSERT INTO quiz_answers (id, question_id, answer_text, is_correct)
VALUES
  ('90000000-0000-0000-0000-000000000011', '80000000-0000-0000-0000-000000000004', 'Row Level Security', true),
  ('90000000-0000-0000-0000-000000000012', '80000000-0000-0000-0000-000000000004', 'Record Locking System', false),
  ('90000000-0000-0000-0000-000000000013', '80000000-0000-0000-0000-000000000004', 'Relational Layer Security', false),
  ('90000000-0000-0000-0000-000000000014', '80000000-0000-0000-0000-000000000005', 'USING', true),
  ('90000000-0000-0000-0000-000000000015', '80000000-0000-0000-0000-000000000005', 'CHECK', false),
  ('90000000-0000-0000-0000-000000000016', '80000000-0000-0000-0000-000000000005', 'WHERE', false),
  ('90000000-0000-0000-0000-000000000017', '80000000-0000-0000-0000-000000000005', 'FILTER', false);

-- Quiz 3: WebSocket & Concurrency
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, sort_order)
VALUES
  ('80000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000003', 'Which crate provides WebSocket support for Actix-web?', 'single_choice', 1, 1),
  ('80000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000003', 'In Rust, what trait must a type implement to be sent across threads?', 'single_choice', 1, 2);

INSERT INTO quiz_answers (id, question_id, answer_text, is_correct)
VALUES
  ('90000000-0000-0000-0000-000000000018', '80000000-0000-0000-0000-000000000006', 'actix-web-actors', true),
  ('90000000-0000-0000-0000-000000000019', '80000000-0000-0000-0000-000000000006', 'tokio-tungstenite', false),
  ('90000000-0000-0000-0000-000000000020', '80000000-0000-0000-0000-000000000006', 'async-ws', false),
  ('90000000-0000-0000-0000-000000000021', '80000000-0000-0000-0000-000000000006', 'websocket-rs', false),
  ('90000000-0000-0000-0000-000000000022', '80000000-0000-0000-0000-000000000007', 'Send', true),
  ('90000000-0000-0000-0000-000000000023', '80000000-0000-0000-0000-000000000007', 'Sync', false),
  ('90000000-0000-0000-0000-000000000024', '80000000-0000-0000-0000-000000000007', 'Clone', false),
  ('90000000-0000-0000-0000-000000000025', '80000000-0000-0000-0000-000000000007', 'Debug', false);

-- ============================================================================
-- Enrollments
-- ============================================================================
INSERT INTO enrollments (user_id, course_id, status, progress_percentage)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'active', 45.00),
  ('a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'active', 20.00),
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'active', 100.00);

-- ============================================================================
-- Reviews
-- ============================================================================
INSERT INTO reviews (user_id, course_id, rating, comment)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 5, 'Absolutely incredible course! The section on Server Components finally made everything click for me. Sarah explains complex topics with such clarity. Highly recommended for anyone looking to master Next.js.'),
  ('a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 4, 'Great course overall. The Flutter + Supabase combination is powerful. Some parts felt rushed, but the real-time chat project was worth the price alone.'),
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 5, 'Marcus is an excellent instructor. Rust is not easy to teach, but he breaks it down perfectly. The WebSocket server implementation was top-notch.');

-- ============================================================================
-- Favorites
-- ============================================================================
INSERT INTO favorites (user_id, course_id)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003'),
  ('a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004');

-- ============================================================================
-- Certificates
-- ============================================================================
INSERT INTO certificates (user_id, course_id, certificate_code)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'CERT-RUST-2026-00001');

-- ============================================================================
-- Exam Results
-- ============================================================================
INSERT INTO exam_results (user_id, quiz_id, score, passed)
VALUES
  ('a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', 85.00, true),
  ('a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002', 70.00, false);

-- ============================================================================
-- Notifications
-- ============================================================================
INSERT INTO notifications (user_id, title, message, link)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'Welcome to CodeU!', 'We are excited to have you on board. Start exploring courses and build your skills.', '/courses'),
  ('a0000000-0000-0000-0000-000000000003', 'Course Progress Update', 'You are 45% through the Full-Stack Next.js 16 Masterclass. Keep going!', '/dashboard'),
  ('a0000000-0000-0000-0000-000000000001', 'New Student Enrolled', 'A new student has enrolled in your Flutter & Supabase course.', '/instructor/dashboard');

COMMIT;
