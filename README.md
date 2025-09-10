# Quiet Hours Scheduler

A modern web application for scheduling silent-study or focus time blocks. This application uses Supabase for secure user authentication and persistent data storage, and it simulates email notifications by displaying an in-app alert 10 minutes before a scheduled block is set to begin.

---

## ✨ Features

- **Secure User Authentication:** Full login/logout functionality powered by Supabase Auth. User sessions are persisted across page reloads.
- **Persistent Data Storage:** All scheduled blocks are securely stored in a Supabase PostgreSQL database.
- **Real-time CRUD Operations:** Create, read, and delete your quiet hour blocks with instant UI updates.
- **User-Specific Data:** Users can only see and manage their own scheduled blocks, thanks to Supabase's Row Level Security.
- **Automatic Categorization:** The UI intelligently separates blocks into "Upcoming" and "Past" lists.
- **Simulated Reminders:** A client-side timer triggers an in-app toast notification 10 minutes before an upcoming block starts.
- **Responsive & Modern UI:** Built with Tailwind CSS, the interface is clean, intuitive, and looks great on all devices.
- **Robust User Feedback:** The app includes loading states and displays clear error or success notifications for all backend interactions.

---

## 🛠️ Tech Stack

- **Frontend:**
    - [React](https://reactjs.org/) (v19) with Hooks
    - [TypeScript](https://www.typescriptlang.org/) for type safety
    - [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Backend-as-a-Service (BaaS):**
    - [Supabase](https://supabase.com/)
        - Supabase Auth: For user management and authentication
        - Supabase Database: PostgreSQL for data storage
- **Dependencies:**
    - `@supabase/supabase-js`

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### 1️⃣ Prerequisites

- A Supabase account ([Sign up for free](https://app.supabase.com/))
- A modern web browser
- A simple local web server (e.g., VS Code's Live Server extension or Python)

### 2️⃣ Supabase Project Setup

This is the most critical step. Your app will not run without a correctly configured Supabase project.

#### A. Create a New Supabase Project

1. Go to your [Supabase Dashboard](https://app.supabase.com/projects).
2. Click **New project** and give it a name (e.g., "quiet-hours-scheduler").
3. Choose a strong database password and select a region.
4. Wait for your project to be created.

#### B. Create the `quiet_blocks` Table

1. In your Supabase project, navigate to the **SQL Editor** in the left sidebar.
2. Click **+ New query**.
3. Paste and execute the following SQL:

    ```sql
    CREATE TABLE public.quiet_blocks (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL DEFAULT auth.uid(),
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      start_time timestamp with time zone NOT NULL,
      end_time timestamp with time zone NOT NULL,
      notified boolean NOT NULL DEFAULT false,
      CONSTRAINT quiet_blocks_pkey PRIMARY KEY (id),
      CONSTRAINT quiet_blocks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
    );

    COMMENT ON TABLE public.quiet_blocks IS 'Stores the scheduled quiet hour blocks for users.';
    COMMENT ON COLUMN public.quiet_blocks.user_id IS 'Links to the authenticated user.';

    ALTER TABLE public.quiet_blocks ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Enable read access for own blocks"
    ON public.quiet_blocks
    FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Enable insert for own blocks"
    ON public.quiet_blocks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Enable delete for own blocks"
    ON public.quiet_blocks
    FOR DELETE USING (auth.uid() = user_id);
    ```

#### C. Get Your Supabase Credentials

1. Navigate to **Project Settings** (gear icon).
2. Go to **API** section.
3. Copy your **Project URL** and **anon Public Key**.

### 3️⃣ Configure the Application

- Clone the repository or download the files.
- Open `App.tsx`.
- Replace:

    ```ts
    const SUPABASE_URL = "YOUR_SUPABASE_URL";
    const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
    ```

    with your actual Supabase credentials.

### 4️⃣ Run the Application

- Serve the files locally:
    - Using VS Code Live Server: Right-click `index.html` and select **Open with Live Server**.
    - Or using Python:  
      ```bash
      python -m http.server
      ```

- Open the local address (e.g., http://127.0.0.1:5500).
- Sign up with any email & password to start using the app.

---

## 📁 Project Structure

.
├── components/
│   ├── icons/                # Reusable SVG icon components
│   ├── BlockList.tsx         # Renders the upcoming and past blocks
│   ├── Dashboard.tsx         # The main view after a user logs in
│   ├── Login.tsx             # The authentication form component
│   ├── Notification.tsx      # The toast notification component
│   └── SchedulerForm.tsx     # The form for adding new blocks
├── App.tsx                   # Main application component, handles state and Supabase logic
├── index.html                # The HTML entry point
├── index.tsx                 # Renders the React app into the DOM
├── metadata.json             # Application metadata
└── types.ts                  # Shared TypeScript interfaces
