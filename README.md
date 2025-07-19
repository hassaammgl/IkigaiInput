# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

<!--

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  bio text,
  created_at timestamp default now()
);

alter table profiles enable row level security;

create policy "Users can view profiles"
  on profiles for select using (true);

create policy "Users can edit their profile"
  on profiles for update using (auth.uid() = id);


create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text, -- Can be markdown or HTML
  cover_image_url text,
  author_id uuid references auth.users(id) on delete cascade,
  slug text unique not null,
  published boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table posts enable row level security;

create policy "Anyone can read published posts"
  on posts for select using (published = true);

create policy "Author can manage their posts"
  on posts for all using (auth.uid() = author_id);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp default now()
);

alter table comments enable row level security;

create policy "Anyone can read comments"
  on comments for select using (true);

create policy "Only author can write comment"
  on comments for insert with check (auth.uid() = author_id);

create policy "Only author can delete own comment"
  on comments for delete using (auth.uid() = author_id);


create table likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp default now(),
  unique (post_id, user_id) -- prevent multiple likes
);

alter table likes enable row level security;

create policy "User can like/unlike posts"
  on likes for insert with check (auth.uid() = user_id);

create policy "User can unlike own likes"
  on likes for delete using (auth.uid() = user_id);


create table views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  viewer_id uuid references auth.users(id), -- can be null for anonymous
  ip_address text,         -- optional
  user_agent text,         -- optional
  viewed_at timestamp default now()
);

-- ✅ Allow viewer_id to be null (for guests)
alter table views alter column viewer_id drop not null;

-- ✅ Enable RLS
alter table views enable row level security;

-- ✅ Allow ANYONE (even anonymous) to insert a view
create policy "Log anonymous and user views"
  on views for insert
  with check (true);  -- allows both guests and users to insert


-- Public read access
create policy "Public can read blog images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

create policy "Users can manage own avatars"
  on storage.objects for all
  using (auth.uid() = owner);


create index idx_posts_author on posts (author_id);
create index idx_comments_post on comments (post_id);
create index idx_likes_post on likes (post_id);

create policy "Users can manage own avatars"
  on storage.objects for all
  using (auth.uid() = owner);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  created_at timestamp default now()
);

alter table categories enable row level security;

-- Optional: let anyone fetch categories
create policy "Public can read categories"
  on categories for select using (true);


insert into categories (name, slug) values
('Web Development', 'web-dev'),
('Design', 'design'),
('AI & ML', 'ai-ml'),
('Lifestyle', 'lifestyle'),
('Career', 'career'),
('Web Development', 'web-development'),
('Frontend', 'frontend'),
('Backend', 'backend'),
('Full Stack', 'full-stack'),
('Mobile Apps', 'mobile-apps'),
('AI & Machine Learning', 'ai-machine-learning'),
('Cybersecurity', 'cybersecurity'),
('Open Source', 'open-source'),
('Coding Tutorials', 'coding-tutorials'),
('UI/UX Design', 'ui-ux-design'),
('Graphic Design', 'graphic-design'),
('3D Design', '3d-design'),
('Typography', 'typography'),
('Anime Reviews', 'anime-reviews'),
('Manga', 'manga'),
('K-Dramas', 'k-dramas'),
('Webtoons', 'webtoons'),
('TV Shows', 'tv-shows'),
('Fandom Culture', 'fandom-culture'),
('Gaming', 'gaming'),
('Esports', 'esports'),
('Game Reviews', 'game-reviews'),
('Minecraft', 'minecraft'),
('Twitch Highlights', 'twitch-highlights'),
('Game Dev', 'game-dev'),
('Digital Nomad', 'digital-nomad'),
('Minimalism', 'minimalism'),
('Productivity', 'productivity'),
('Routines', 'routines'),
('Study With Me', 'study-with-me'),
('Hot Takes', 'hot-takes'),
('Twitter Threads', 'twitter-threads'),
('Reddit Drama', 'reddit-drama'),
('Memes', 'memes'),
('Internet Culture', 'internet-culture'),
('Startups', 'startups'),
('E-commerce', 'e-commerce'),
('Crypto', 'crypto'),
('Freelancing', 'freelancing'),
('Personal Finance', 'personal-finance'),
('Side Hustles', 'side-hustles'),
('Self-Improvement', 'self-improvement'),
('Book Summaries', 'book-summaries'),
('Career Tips', 'career-tips'),
('Student Life', 'student-life'),
('Travel Guides', 'travel-guides'),
('Backpacking', 'backpacking'),
('Food Reviews', 'food-reviews'),
('Recipes', 'recipes'),
('Local Food', 'local-food'),
('Pet Diaries', 'pet-diaries'),
('Unpopular Opinions', 'unpopular-opinions'),
('Shower Thoughts', 'shower-thoughts'),
('My Cringe Era', 'my-cringe-era');

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  created_at timestamp default now()
);

alter table tags enable row level security;

create policy "Public can read tags"
  on tags for select using (true);

create table post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

alter table post_tags enable row level security;

create policy "Authors can tag their own posts"
  on post_tags for insert
  using (
    exists (
      select 1
      from posts
      where posts.id = post_tags.post_id
      and posts.author_id = auth.uid()
    )
  );


create policy "Allow authors to tag posts"
  on post_tags for insert
  using (auth.uid() = (select author_id from posts where id = post_tags.post_id));

create policy "Anyone can read post_tags"
  on post_tags for select using (true);


create policy "Authors can tag their own posts"
  on post_tags for insert
  with check (
    exists (
      select 1
      from posts
      where posts.id = post_tags.post_id
      and posts.author_id = auth.uid()
    )
  );

alter table posts enable row level security;

-- Read published posts or your own drafts
create policy "Public can read published posts"
  on posts for select using (
    published = true OR author_id = auth.uid()
);

-- Only authors can insert
create policy "Users can create posts"
  on posts for insert with check (auth.uid() = author_id);

-- Only authors can update their own posts
create policy "Authors can update posts"
  on posts for update using (auth.uid() = author_id);

-- Only authors can delete
create policy "Authors can delete posts"
  on posts for delete using (auth.uid() = author_id);


insert into tags (name, slug) values
('react', 'react'),
('javascript', 'javascript'),
('typescript', 'typescript'),
('node.js', 'node-js'),
('express', 'express'),
('mongodb', 'mongodb'),
('vite', 'vite'),
('tailwind css', 'tailwind-css'),
('zustand', 'zustand'),
('supabase', 'supabase'),
('firebase', 'firebase'),
('next.js', 'next-js'),
('html', 'html'),
('css', 'css'),
('scss', 'scss'),
('graphql', 'graphql'),
('rest api', 'rest-api'),
('authentication', 'authentication'),
('authorization', 'authorization'),
('jwt', 'jwt'),
('webhooks', 'webhooks'),
('web3', 'web3'),
('blockchain', 'blockchain'),
('solidity', 'solidity'),
('nft', 'nft'),
('bitcoin', 'bitcoin'),
('ethereum', 'ethereum'),
('openai', 'openai'),
('chatgpt', 'chatgpt'),
('ai tools', 'ai-tools'),
('machine learning', 'machine-learning'),
('deep learning', 'deep-learning'),
('data science', 'data-science'),
('data visualization', 'data-visualization'),
('design systems', 'design-systems'),
('ux', 'ux'),
('ui', 'ui'),
('figma', 'figma'),
('adobe xd', 'adobe-xd'),
('3d modeling', '3d-modeling'),
('blender', 'blender'),
('motion design', 'motion-design'),
('anime', 'anime'),
('manga', 'manga'),
('crunchyroll', 'crunchyroll'),
('one piece', 'one-piece'),
('naruto', 'naruto'),
('attack on titan', 'attack-on-titan'),
('k-drama', 'k-drama'),
('netflix', 'netflix'),
('tv shows', 'tv-shows'),
('webtoon', 'webtoon'),
('valorant', 'valorant'),
('csgo', 'csgo'),
('fortnite', 'fortnite'),
('roblox', 'roblox'),
('minecraft', 'minecraft'),
('unity', 'unity'),
('unreal engine', 'unreal-engine'),
('indie dev', 'indie-dev'),
('godot', 'godot'),
('gamedev', 'gamedev'),
('twitch', 'twitch'),
('youtube', 'youtube'),
('podcasts', 'podcasts'),
('spotify', 'spotify'),
('minimalism', 'minimalism'),
('productivity', 'productivity'),
('notion', 'notion'),
('study', 'study'),
('routines', 'routines'),
('self improvement', 'self-improvement'),
('mental health', 'mental-health'),
('journaling', 'journaling'),
('stoicism', 'stoicism'),
('startups', 'startups'),
('founders', 'founders'),
('pitch decks', 'pitch-decks'),
('bootstrap', 'bootstrap'),
('side projects', 'side-projects'),
('freelancing', 'freelancing'),
('upwork', 'upwork'),
('fiverr', 'fiverr'),
('remote work', 'remote-work'),
('nomad life', 'nomad-life'),
('ecommerce', 'ecommerce'),
('dropshipping', 'dropshipping'),
('shopify', 'shopify'),
('seo', 'seo'),
('marketing', 'marketing'),
('growth hacking', 'growth-hacking'),
('affiliate', 'affiliate'),
('finance', 'finance'),
('investing', 'investing'),
('crypto', 'crypto'),
('budgeting', 'budgeting'),
('saving money', 'saving-money'),
('career', 'career'),
('resume tips', 'resume-tips'),
('interviews', 'interviews'),
('college life', 'college-life'),
('student tips', 'student-tips'),
('pet life', 'pet-life'),
('cats', 'cats'),
('dogs', 'dogs'),
('recipes', 'recipes'),
('food reviews', 'food-reviews'),
('coffee', 'coffee'),
('pakistani food', 'pakistani-food'),
('tiktoks', 'tiktoks'),
('memes', 'memes'),
('reddit', 'reddit'),
('twitter', 'twitter'),
('drama', 'drama'),
('hot takes', 'hot-takes'),
('cringe', 'cringe'),
('book recs', 'book-recs'),
('book summaries', 'book-summaries'),
('writing', 'writing'),
('newsletter', 'newsletter'),
('blogging', 'blogging');

alter table posts enable row level security;

-- Read published posts or your own drafts
create policy "Public can read published posts"
  on posts for select using (
    published = true OR author_id = auth.uid()
);

-- Only authors can insert
create policy "Users can create posts"
  on posts for insert with check (auth.uid() = author_id);

-- Only authors can update their own posts
create policy "Authors can update posts"
  on posts for update using (auth.uid() = author_id);

-- Only authors can delete
create policy "Authors can delete posts"
  on posts for delete using (auth.uid() = author_id);


alter table comments enable row level security;

create policy "Anyone can read comments"
  on comments for select using (true);

create policy "Users can comment on posts"
  on comments for insert with check (auth.uid() = author_id);


alter table likes enable row level security;

create policy "Anyone can read likes"
  on likes for select using (true);

create policy "Users can like posts"
  on likes for insert with check (auth.uid() = user_id);


alter table views enable row level security;

create policy "Allow anonymous views"
  on views for insert with check (true);


alter table tags enable row level security;

create policy "Anyone can read tags"
  on tags for select using (true);

create policy "Admins or authors can insert tags"
  on tags for insert with check (true); -- tighten this if needed


alter table post_tags enable row level security;

create policy "Authors can tag their own posts"
  on post_tags for insert with check (
    exists (
      select 1 from posts
      where posts.id = post_tags.post_id
      and posts.author_id = auth.uid()
    )
  );


alter table profiles enable row level security;

create policy "Users can read profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (id = auth.uid());

create policy "Users can create their profile"
  on profiles for insert with check (id = auth.uid());


-- Fast lookup for slugs
create index on posts (slug);
create index on tags (slug);
create index on categories (slug);

-- Fast sort/filter
create index on posts (created_at desc);
create index on comments (created_at desc);
create index on views (viewed_at desc);
 -->