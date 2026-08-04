# Video Script: What Happens When You Click Search

**Duration:** ~5 minutes
**Format:** Screen recording with voiceover
**Tone:** Friendly, didactic, YouTuber-style tutorial

---

## 0:00 - 0:30 | INTRO

`[SCREEN: App running in browser - show the filter panel and interface]`

**SCRIPT:**

> Hey everyone! Today I want to show you something I built using SearchApi - it's a job search app for remote positions.
>
> But here's the thing - instead of just showing you the app, I want to take you behind the scenes. What actually happens when you click this green "Search Jobs" button? Let's follow the code together and find out!

---

## 0:30 - 1:45 | THE FRONTEND

`[SCREEN: VS Code - open src/components/FilterPanel.tsx]`

**SCRIPT:**

> Alright, let's start where every user interaction begins - the frontend!
>
> So I've got this FilterPanel component here - it's the card with all the role and region filters you see on screen.

`📁 src/components/FilterPanel.tsx:251-268`
```tsx
<button
  onClick={onSearch}
  disabled={isLoading || isScanning}
  className="flex-1 rounded-[10px] ..."
  style={{
    background: '#34E0A1',
    color: '#06221A',
  }}
>
  {isLoading ? <Spinner /> : null}
  <span>Search Jobs</span>
</button>
```

> See this button? When you click it, it calls `onSearch` - which is actually passed down from the parent component. Let's jump over to `page.tsx` to see what happens next.

`[SCREEN: VS Code - open src/app/page.tsx]`

> Here's where the magic starts. The `searchJobs` function handles the whole flow.

`📁 src/app/page.tsx:69-87`
```tsx
const searchJobs = async (pageToken?: string) => {
  setIsLoading(true);
  setError(null);

  const params = new URLSearchParams({
    role: selectedRole,
    region: selectedRegion,
  });

  const res = await fetch(`/api/jobs?${params}`);
  const data: JobsResponse = await res.json();

  setJobs(data.jobs);
  setFromCache(data.fromCache);
  setHasSearched(true);
};
```

> So what's going on here? First, we flip the loading state to true - that's what triggers the spinner. Then we grab whatever role and region the user picked from the filters, build a query string, and make a fetch request to `/api/jobs`.
>
> Notice we're NOT calling SearchApi directly from the browser - that would expose our API key! Instead, we hit our own backend route. Let's check that out.

---

## 1:45 - 2:45 | THE API ROUTE

`[SCREEN: VS Code - open src/app/api/jobs/route.ts]`

**SCRIPT:**

> Now we're in the backend! This is a Next.js API route - basically a little server endpoint that lives inside our app.

`📁 src/app/api/jobs/route.ts:7-20`
```tsx
export async function GET(request: NextRequest) {
  let params;
  try {
    params = parseJobsQuery(request.nextUrl.searchParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 }
      );
    }
    throw error;
  }
```

> First thing we do? Validate the input with Zod. We don't want garbage data hitting our API - if someone sends a weird role or region, we catch it right here and return a nice error message.

`📁 src/app/api/jobs/route.ts:25-35`
```tsx
const stats = getStats();
if (!stats.hasApiKey) {
  return NextResponse.json({
    jobs: mockJobs,
    nextPageToken: null,
    query: 'mock data (no API key)',
    fromCache: false,
    requestCount: stats.requestCount,
  });
}
```

> Now check this out - if there's no API key configured, we return mock data instead of crashing. Super handy for development! Anyone can clone the repo and play with the UI without needing to sign up for anything.
>
> But when we DO have an API key, we call our SearchApi client. Let's dive into that!

---

## 2:45 - 4:00 | THE SEARCHAPI CLIENT

`[SCREEN: VS Code - open src/lib/searchapi.ts]`

**SCRIPT:**

> Alright, THIS is where the real magic happens. The `searchapi.ts` file is our client that talks to the SearchApi service.
>
> First, let me show you how we build the search query.

`📁 src/lib/searchapi.ts:140-157`
```tsx
const ROLE_QUERIES: Record<RoleType, string> = {
  frontend: 'frontend engineer',
  backend: 'backend engineer',
  fullstack: 'full stack engineer',
  devops: 'devops engineer',
  devrel: 'developer advocate OR developer relations OR devrel',
  // ...
};

const REGION_QUERIES: Record<RegionType, string> = {
  brazil: 'remote {role} brazil',
  latam: 'remote {role} latam',
  worldwide: 'remote {role} worldwide OR "work from anywhere"',
  americas: 'remote {role} americas',
};
```

> We have these mappings here - roles get converted to search terms, and regions define the query template. See that `{role}` placeholder? It gets replaced with whatever role you picked.
>
> So if you select "DevRel" and "Worldwide", we end up with: `remote developer advocate worldwide OR "work from anywhere"`. Pretty cool, right?

`📁 src/lib/searchapi.ts:363-374`
```tsx
const params: Record<string, string> = {
  engine: 'google_jobs',
  q: query,
  gl: 'us',
  hl: 'en',
};

const { data, fromCache } = await fetchSearchApi<SearchApiJobsResponse>(params);
```

> Then we send this to SearchApi using the `google_jobs` engine. SearchApi does all the heavy lifting - scraping Google Jobs, parsing the results, handling pagination - and gives us back clean, structured JSON. No HTML parsing nightmares!
>
> Oh, and we've got caching built in too. Search for the same thing twice? We skip the API call and serve from cache. Saves credits and makes things snappier!

---

## 4:00 - 5:00 | LIVE DEMO & WRAP UP

`[SCREEN: Browser - run a search with DevRel + Worldwide]`

**SCRIPT:**

> Alright, enough code - let's see it in action! I'll pick DevRel, set the region to Worldwide, and hit Search Jobs...
>
> Boom! Real job listings pulled straight from Google Jobs through SearchApi!
>
> And check out these little colored tags - "yes", "likely", "unclear". That's a classifier I built that scans each job description looking for signals like "worldwide", "work from anywhere", or red flags like "US only". Super handy when you're scrolling through dozens of listings!

`[SCREEN: Show GitHub repo URL]`

> The whole project is open source - link's in the description. Clone it, drop in your SearchApi key, and you'll have this running locally in like... a minute? Maybe two if npm is being slow.
>
> If you found this useful, smash that like button, subscribe for more dev content, and I'll catch you in the next one. Happy job hunting!

---

## Summary: Files Covered

| File | What It Does |
|------|--------------|
| `src/components/FilterPanel.tsx` | Filter UI component - role, region, date devreselection + action buttons |
| `src/app/page.tsx` | Main page component - state management and API calls |
| `src/app/api/jobs/route.ts` | Backend API route - validates input, handles mock data fallback |
| `src/lib/searchapi.ts` | SearchApi client - builds queries, caching, retry logic |

---

## Recording Notes

### VS Code Setup
- Font size: **18px** (easy to read on video)
- Theme: Dark (matches the app)
- Minimap: **OFF**
- Sidebar: **HIDDEN** for more code space
- Use `Cmd+G` to jump to specific lines

### Transitions
- Use smooth scrolling when moving between code sections
- Pause briefly on important lines before explaining
- Highlight current line if your editor supports it

### Script Stats
- ~580 words at ~110 wpm = **~5:15**
- Comfortable pace with room for natural pauses

### Before Recording
- [ ] Run `npm run dev` and verify app works
- [ ] Do a test search to warm up the cache
- [ ] Check SearchApi has credits remaining
- [ ] Close unnecessary browser tabs and apps
- [ ] Silence notifications
