import { FormEvent, useEffect, useMemo, useState } from 'react';
import { handleGoogleSignIn } from './lib/firebase';

type UserProfile = {
  id: string;
  displayName: string;
  username: string;
  dob: string;
  provider: 'google' | 'demo';
};

type HomeCard = {
  title: string;
  subtitle: string;
  meta: string;
};

type Person = {
  id: number;
  displayName: string;
  username: string;
  madeGames: string[];
  isFollowing: boolean;
  requestPending: boolean;
};

const STORAGE_KEY = 'house-make-play-profile';
const PEOPLE_KEY = 'house-make-play-people';

const homeSeed: Record<'savedGames' | 'playlists' | 'madeGames', HomeCard[]> = {
  savedGames: [
    { title: 'Sky Castle Escape', subtitle: 'Sandbox puzzle', meta: 'Saved 2h ago' },
    { title: 'Mini City Build', subtitle: 'Creative mode', meta: 'Saved today' },
    { title: 'Forest Hideout', subtitle: 'Adventure build', meta: 'Saved yesterday' },
  ],
  playlists: [
    { title: 'Cozy Builds', subtitle: 'Warm homes', meta: '18 videos' },
    { title: 'City Ideas', subtitle: 'Urban concepts', meta: '9 videos' },
    { title: 'Starter Houses', subtitle: 'Beginner-friendly', meta: '12 videos' },
  ],
  madeGames: [
    { title: 'Neon Loft', subtitle: '3.2k plays', meta: 'Published' },
    { title: 'Tiny Market', subtitle: '1.1k plays', meta: 'Published' },
    { title: 'Farm Friends', subtitle: '750 plays', meta: 'Draft' },
  ],
};

const peopleSeed: Person[] = [
  { id: 1, displayName: 'Ava Bloom', username: 'avabloom', madeGames: ['Cloud House', 'Glow Studio'], isFollowing: false, requestPending: false },
  { id: 2, displayName: 'Leo Brick', username: 'bricksandbuilds', madeGames: ['Castle Courtyard', 'Bamboo Home'], isFollowing: true, requestPending: false },
  { id: 3, displayName: 'Nia Hart', username: 'niastories', madeGames: ['Storybook Farm', 'Rainy Cabin'], isFollowing: false, requestPending: true },
  { id: 4, displayName: 'Omar Build', username: 'omarcreates', madeGames: ['Dockside House', 'Pixel Rooftop'], isFollowing: false, requestPending: false },
];

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  const [people, setPeople] = useState<Person[]>(() => {
    try {
      const raw = localStorage.getItem(PEOPLE_KEY);
      return raw ? (JSON.parse(raw) as Person[]) : peopleSeed;
    } catch {
      return peopleSeed;
    }
  });

  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'builder'>('home');
  const [showBuilderWarning, setShowBuilderWarning] = useState(false);
  const [search, setSearch] = useState('');
  const [aiPrompt, setAiPrompt] = useState('Build a cozy two-room villa with a rooftop garden and a hidden reading nook.');
  const [form, setForm] = useState({ displayName: user?.displayName ?? '', username: user?.username ?? '', dob: user?.dob ?? '' });
  const [error, setError] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
  }, [people]);

  const visiblePeople = useMemo(() => {
    return people.filter((person) => {
      const haystack = `${person.displayName} ${person.username}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [people, search]);

  const handleGoogleSignIn = async () => {
    const result = await handleGoogleSignIn();
    const authUser = result.user;

    const nextProfile: UserProfile = {
      id: authUser.uid || 'demo-user-1',
      displayName: authUser.displayName || 'Demo Builder',
      username: '',
      dob: '',
      provider: 'demo',
    };

    setUser(nextProfile);
    setForm({
      displayName: nextProfile.displayName,
      username: '',
      dob: '',
    });
    setError('');
    setIsOnboarding(true);
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.displayName.trim() || !form.username.trim() || !form.dob) {
      setError('Please complete all fields before continuing.');
      return;
    }

    const age = calculateAge(form.dob);
    if (age < 5) {
      setError('Access denied. Users under 5 years old are not allowed to play House-Make & Play.');
      return;
    }

    const finalizedUser: UserProfile = {
      id: user?.id || `hm-${Date.now()}`,
      displayName: form.displayName.trim(),
      username: form.username.trim(),
      dob: form.dob,
      provider: user?.provider || 'demo',
    };

    setUser(finalizedUser);
    setForm({
      displayName: finalizedUser.displayName,
      username: finalizedUser.username,
      dob: finalizedUser.dob,
    });
    setError('');
    setIsOnboarding(false);
  };

  const toggleFollow = (personId: number) => {
    setPeople((current) =>
      current.map((person) =>
        person.id === personId ? { ...person, isFollowing: !person.isFollowing } : person
      )
    );
  };

  const sendFriendRequest = (personId: number) => {
    setPeople((current) =>
      current.map((person) =>
        person.id === personId ? { ...person, requestPending: true } : person
      )
    );
  };

  const beginBuilder = () => {
    setShowBuilderWarning(true);
  };

  const handleBuilderContinue = () => {
    setShowBuilderWarning(false);
    setActiveTab('builder');
  };

  const renderHome = () => (
    <div className="space-y-5 px-4 pb-8">
      <section className="rounded-[28px] bg-gradient-to-br from-brand-500 via-emerald-500 to-teal-600 p-5 text-white shadow-soft">
        <div className="flex items-center justify-between text-sm text-emerald-50">
          <span>Welcome back</span>
          <span className="rounded-full bg-white/15 px-2 py-1 text-xs">Chapter 3</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold">{user?.displayName || 'Player'}</h2>
        <p className="mt-1 text-sm text-emerald-50/90">Your creative space is ready for today’s next build.</p>
      </section>

      {Object.entries(homeSeed).map(([sectionKey, cards]) => (
        <section key={sectionKey} className="space-y-3">
          <div className="section-title px-1">{sectionKey === 'savedGames' ? 'Saved Games' : sectionKey === 'playlists' ? 'Playlists' : 'Made Games'}</div>
          <div className="space-y-3">
            {cards.map((card) => (
              <div key={`${sectionKey}-${card.title}`} className="card-surface rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">{card.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{card.subtitle}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {card.meta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  const renderExplore = () => (
    <div className="space-y-5 px-4 pb-8">
      <div className="card-surface rounded-2xl p-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input-field"
          placeholder="Find players or creators"
        />
      </div>

      <div className="space-y-3">
        {visiblePeople.map((person) => (
          <div key={person.id} className="card-surface rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800">{person.displayName}</h3>
                <p className="text-sm text-slate-500">@{person.username}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleFollow(person.id)}
                className={person.isFollowing ? 'secondary-button px-3 py-2 text-xs' : 'primary-button px-3 py-2 text-xs'}
              >
                {person.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {person.madeGames.map((game) => (
                <span key={`${person.id}-${game}`} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  {game}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => sendFriendRequest(person.id)}
              disabled={person.requestPending}
              className={person.requestPending ? 'mt-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700' : 'mt-4 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white'}
            >
              {person.requestPending ? 'Pending Friend Request' : 'Send Friend Request'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBuilder = () => (
    <div className="space-y-5 px-4 pb-8">
      <div className="card-surface rounded-[28px] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-title">Builder Mode</p>
            <h2 className="mt-2 text-xl font-bold text-slate-800">Active AI Mode</h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Online
          </span>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">Prompt</label>
        <textarea
          value={aiPrompt}
          onChange={(event) => setAiPrompt(event.target.value)}
          rows={5}
          className="input-field mt-2 resize-none"
          placeholder="Describe the build you want"
        />

        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" className="secondary-button px-3 py-2 text-sm">
            Save Draft
          </button>
          <button type="button" className="primary-button px-3 py-2 text-sm">
            Generate Build
          </button>
        </div>
      </div>
    </div>
  );

  if (isOnboarding || !user) {
    return (
      <div className="mobile-shell flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-[30px] bg-white/90 p-6 shadow-soft backdrop-blur-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-title">Chapter 1</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">House-Make & Play</h1>
            </div>
            <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              5+ only
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="primary-button mt-6 w-full"
          >
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Display Name</label>
              <input
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                className="input-field"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                className="input-field"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Birth Date</label>
              <input
                type="date"
                value={form.dob}
                onChange={(event) => setForm((current) => ({ ...current, dob: event.target.value }))}
                className="input-field"
              />
            </div>

            {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

            <button type="submit" className="primary-button w-full">
              Create Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-shell pb-20">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-title">House-Make & Play</p>
            <h1 className="text-lg font-semibold text-slate-800">{user.username || user.displayName}</h1>
          </div>
          <button type="button" className="secondary-button px-3 py-2 text-xs" onClick={() => setIsOnboarding(true)}>
            Update profile
          </button>
        </div>
      </header>

      <nav className="mt-4 grid grid-cols-3 gap-2 px-4">
        {[
          { key: 'home', label: 'Home' },
          { key: 'explore', label: 'Explore' },
          { key: 'builder', label: 'Builder' },
        ].map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => (tabItem.key === 'builder' ? beginBuilder() : setActiveTab(tabItem.key as 'home' | 'explore' | 'builder'))}
            className={activeTab === tabItem.key ? 'primary-button py-2 text-sm' : 'secondary-button py-2 text-sm'}
          >
            {tabItem.label}
          </button>
        ))}
      </nav>

      {activeTab === 'home' && renderHome()}
      {activeTab === 'explore' && renderExplore()}
      {activeTab === 'builder' && renderBuilder()}

      {showBuilderWarning ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-soft">
            <p className="section-title">Warning</p>
            <h2 className="mt-3 text-xl font-bold text-slate-900">Builder Mode WARNING</h2>
            <p className="mt-3 text-sm text-slate-600">
              This tool uses AI-generated building prompts. Be sure to review every design before publishing to the public community.
            </p>

            <div className="mt-5 flex gap-2">
              <button type="button" className="secondary-button flex-1" onClick={() => setShowBuilderWarning(false)}>
                Cancel
              </button>
              <button type="button" className="primary-button flex-1" onClick={handleBuilderContinue}>
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
