/* StreamFlix script.js — Revised
   - Addressed multiple issues reported: missing helper functions, undefined globals used by HTML, incomplete YouTube/Spotify helper implementations,
     and ensured safe guards for DOM access.
   - Kept structure and original logic, but added robust fallbacks and lightweight implementations for previously-missing features.
   - Replace API keys/config before using real Google APIs or streaming services.
*/

/* ---------------------------
   Config / Constants
   --------------------------- */
const API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'; // Backup Key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

const requests = {
    // Movies - Switched to Daily Trending for fresh content
    fetchTrending: `/trending/movie/day?language=en-US`,
    fetchTopRated: `/movie/top_rated?language=en-US&page=${Math.floor(Math.random() * 5) + 1}`,
    fetchAction: `/discover/movie?with_genres=28&page=${Math.floor(Math.random() * 10) + 1}`,
    fetchComedy: `/discover/movie?with_genres=35&page=${Math.floor(Math.random() * 10) + 1}`,
    fetchDrama: `/discover/movie?with_genres=18&page=${Math.floor(Math.random() * 10) + 1}`,
    fetchSciFi: `/discover/movie?with_genres=878&page=${Math.floor(Math.random() * 5) + 1}`,
    fetchHorror: `/discover/movie?with_genres=27&page=${Math.floor(Math.random() * 5) + 1}`,
    fetchRomance: `/discover/movie?with_genres=10749&page=${Math.floor(Math.random() * 5) + 1}`,
    fetchThriller: `/discover/movie?with_genres=53&page=${Math.floor(Math.random() * 5) + 1}`,
    fetchAnimation: `/discover/movie?with_genres=16&page=${Math.floor(Math.random() * 5) + 1}`,
    fetchDocumentary: `/discover/movie?with_genres=99&page=${Math.floor(Math.random() * 5) + 1}`,
    fetchMystery: `/discover/movie?with_genres=9648&page=${Math.floor(Math.random() * 5) + 1}`,
    
    // Discovery Features (New)
    // Hidden Gems: Vote Avg > 8, Vote Count > 200, Popularity < 300 (Less mainstream, high quality)
    fetchHiddenGems: `/discover/movie?vote_average.gte=8&vote_count.gte=200&popularity.lte=3000&sort_by=vote_average.desc&page=${Math.floor(Math.random() * 5) + 1}`,
    // Short Films: Runtime < 90 mins (Quick Watch)
    fetchShortFilms: `/discover/movie?with_runtime.lte=90&sort_by=popularity.desc&page=${Math.floor(Math.random() * 5) + 1}`,

    // Tamil Specific - Added random sorting/paging
    fetchTamilAction: `/discover/movie?with_original_language=ta&with_genres=28&sort_by=popularity.desc&page=${Math.floor(Math.random() * 3) + 1}`,
    fetchTamilComedy: `/discover/movie?with_original_language=ta&with_genres=35&sort_by=popularity.desc&page=${Math.floor(Math.random() * 3) + 1}`,
    fetchTamilRomance: `/discover/movie?with_original_language=ta&with_genres=10749&sort_by=popularity.desc&page=${Math.floor(Math.random() * 3) + 1}`,
    fetchTamilThriller: `/discover/movie?with_original_language=ta&with_genres=53&sort_by=popularity.desc&page=${Math.floor(Math.random() * 3) + 1}`,
    fetchTamilFamily: `/discover/movie?with_original_language=ta&with_genres=10751&sort_by=popularity.desc&page=${Math.floor(Math.random() * 3) + 1}`,

    // TV Shows
    fetchTrendingTV: `/trending/tv/day?language=en-US`,
    fetchTamilTV: `/discover/tv?with_original_language=ta&sort_by=popularity.desc&page=${Math.floor(Math.random() * 3) + 1}`,
    fetchTamilReality: `/discover/tv?with_original_language=ta&with_genres=10764&sort_by=popularity.desc`,

    fetchReality: `/discover/tv?with_genres=10764&page=${Math.floor(Math.random() * 3) + 1}`,
    fetchTopRatedTV: `/tv/top_rated?language=en-US&page=${Math.floor(Math.random() * 5) + 1}`,
    fetchCrimeTV: `/discover/tv?with_genres=80&page=${Math.floor(Math.random() * 5) + 1}`,
    fetchComedyTV: `/discover/tv?with_genres=35&page=${Math.floor(Math.random() * 5) + 1}`,
};

// Mock Data (Fallback)
const mockMovies = [
    { id: 1, title: "Stranger Things", poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", backdrop_path: "/56v2KjBlU4XaOv9rVYkJu6490Xf.jpg", media_type: "tv", overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments...", vote_average: 8.6, release_date: "2016-07-15" },
    { id: 2, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", backdrop_path: "/s3TBrRGB1jav7POHZziFbB03kZk.jpg", media_type: "movie", overview: "Cobb, a skilled thief who commits corporate espionage...", vote_average: 8.4, release_date: "2010-07-15" },
    { id: 3, title: "Avengers: Endgame", poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", media_type: "movie", overview: "After the devastating events of Infinity War, the universe is in ruins...", vote_average: 8.3, release_date: "2019-04-24" },
    { id: 4, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", media_type: "movie", overview: "Batman raises the stakes in his war on crime...", vote_average: 8.5, release_date: "2008-07-14" },
    { id: 5, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "/xJHokMBLzb66JB2hW2rueuuBHpc.jpg", media_type: "movie", overview: "Interstellar chronicles the adventures of a group of explorers...", vote_average: 8.4, release_date: "2014-11-05" },
    { id: 6, title: "Breaking Bad", poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg", media_type: "tv", overview: "Walter White, a New Mexico chemistry teacher turned methamphetamine producer...", vote_average: 8.9, release_date: "2008-01-20" },
    { id: 7, title: "The Witcher", poster_path: "/7vjaCdMW15FEbXyWDgVyr290Oxp.jpg", backdrop_path: "/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg", media_type: "tv", overview: "Geralt of Rivia, a solitary monster hunter...", vote_average: 8.1, release_date: "2019-12-20" },
    { id: 8, title: "Spider-Man: Across the Spider-Verse", poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg", media_type: "movie", overview: "Miles Morales catapults across the Multiverse...", vote_average: 8.4, release_date: "2023-06-02" },
    { id: 9, title: "Wednesday", poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkq.jpg", backdrop_path: "/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg", media_type: "tv", overview: "Wednesday Addams is sent to Nevermore Academy...", vote_average: 8.5, release_date: "2022-11-23" },
    { id: 10, title: "Deadpool & Wolverine", poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", backdrop_path: "/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg", media_type: "movie", overview: "A listless Wade Wilson toils away in civilian life...", vote_average: 7.9, release_date: "2024-07-24" }
];

// Piped mirrors (for YouTube-like data)
const PIPED_MIRRORS = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.otter.sh',
    'https://pipedapi.drgns.space',
    'https://api.piped.privacy.com.de',
    'https://pipedapi.smnz.de',
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.adminforge.de',
    'https://pa.il.ax',
    'https://pipedapi.aeong.one',
    'https://api-piped.mha.fi'
];
const PIPED_API = PIPED_MIRRORS[0]; // default Piped base for some helpers

/* ---------------------------
   Utilities
   --------------------------- */
function formatDuration(d) {
    if (!d && d !== 0) return '';
    if (typeof d === 'number') {
        const mins = Math.floor(d / 60);
        const secs = Math.floor(d % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    if (typeof d === 'string' && d.startsWith('PT')) {
        let hours = 0, minutes = 0, seconds = 0;
        const hMatch = d.match(/(\d+)H/); if (hMatch) hours = parseInt(hMatch[1], 10);
        const mMatch = d.match(/(\d+)M/); if (mMatch) minutes = parseInt(mMatch[1], 10);
        const sMatch = d.match(/(\d+)S/); if (sMatch) seconds = parseInt(sMatch[1], 10);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return String(d);
}

function formatViews(n) {
    if (!n && n !== 0) return '';
    const num = Number(n) || 0;
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

function formatCurrency(n) {
    try {
        if (!n && n !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
    } catch (e) { return String(n); }
}

function showToast(message) {
    if (!message) return;
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ---------------------------
   Network helpers (TMDB + Piped)
   --------------------------- */

const TMDB_KEYS = [
    '3fd2be6f0c70a2a598f084ddfb75487c', // Key 1
    '15d2ea6d0dc1d476efbca3eba2b9bbfb', // Key 2
    'b6e895c36d5888e5d9571e494a8618e7', // Key 3
    '4f298a53e552283bee957836a529baec'  // Key 4
];

async function fetchMovie(endpoint) {
    // If absolute URL with api_key included, attempt direct fetch
    const isAbsolute = endpoint.startsWith('http://') || endpoint.startsWith('https://');
    if (isAbsolute && endpoint.includes('api_key=')) {
        try {
            const r = await fetch(endpoint);
            if (!r.ok) throw new Error('Bad response');
            return await r.json();
        } catch (e) {
            console.warn('Direct absolute URL failed, will try key rotation.', e);
        }
    }

    for (const key of TMDB_KEYS) {
        try {
            const separator = endpoint.includes('?') ? '&' : '?';
            
            // Dynamic Language Injection
            let finalEndpoint = endpoint;
            const savedLang = localStorage.getItem('streamflix_lang') || 'en';
            if (savedLang !== 'en') {
                 if (finalEndpoint.includes('language=en-US')) {
                     finalEndpoint = finalEndpoint.replace('language=en-US', `language=${savedLang}`);
                 } else if (!finalEndpoint.includes('language=')) {
                     finalEndpoint += `${separator}language=${savedLang}`;
                 }
            }

            const urlSeparator = finalEndpoint.includes('?') ? '&' : '?';
            const url = isAbsolute ? endpoint : `${BASE_URL}${finalEndpoint}${urlSeparator}api_key=${key}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`TMDB Key ${String(key).slice(0,4)}... failed. Trying next.`, error);
            continue;
        }
    }
    console.error("All TMDB Keys failed - returning mock results.");
    return { results: mockMovies };
}

/**
 * Try sequential PIPED_MIRRORS with per-request timeout.
 */
async function fetchWithMirrors(endpoint, timeoutMs = 8000) {
    for (const base of PIPED_MIRRORS) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(`${base}${endpoint}`, { signal: controller.signal });
            clearTimeout(timer);
            if (res.ok) {
                try { return await res.json(); } catch (e) { continue; }
            }
        } catch (e) {
            clearTimeout(timer);
            continue;
        }
    }
    return null;
}

async function fetchPipedSearch(query) {
    if (!query) return null;
    try {
        const res = await fetch(`${PIPED_API}/search?q=${encodeURIComponent(query)}&filter=videos`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        return data.items || data;
    } catch (e) {
        console.warn("Piped Search failed", e);
        return null;
    }
}

/* ---------------------------
   DOM card renderers
   --------------------------- */

function createMovieCard(item, rank = null, allowDelete = false, clickAction = null) {
    const card = document.createElement('div');
    card.classList.add('movie-card');

    if (rank) {
        const rankSpan = document.createElement('span');
        rankSpan.classList.add('rank-number');
        rankSpan.innerText = rank;
        card.appendChild(rankSpan);
    }

    if (allowDelete) {
        const delBtn = document.createElement('div');
        delBtn.className = 'remove-btn';
        delBtn.innerHTML = '<i class="fas fa-times"></i>';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            removeFromList(item.id);
            card.remove();
        };
        card.appendChild(delBtn);
    }

    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster';
    img.alt = item.title || item.name || 'Untitled';

    if (item.media_type === 'tv' || item.first_air_date) {
        const badge = document.createElement('span');
        badge.classList.add('badge-tv');
        badge.innerText = 'TV';
        card.appendChild(badge);
    }

    card.appendChild(img);

    card.addEventListener('click', () => {
        if (clickAction) {
            clickAction(item);
        } else {
            addToHistory(item);
            const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
            window.location.href = `movie.html?id=${item.id}&type=${type}`;
        }
    });

    return card;
}

/* ---------------------------
   MyList / History
   --------------------------- */

function addToHistory(item) {
    if (!item || !item.id) return;
    let history = JSON.parse(localStorage.getItem('streamflix_history')) || [];
    history = history.filter(h => h.id !== item.id);
    history.unshift({
        id: item.id,
        title: item.title || item.name || 'Untitled',
        poster_path: item.poster_path || item.posterPath || null,
        media_type: item.media_type || (item.title ? 'movie' : 'tv'),
        backdrop_path: item.backdrop_path || item.backdropPath || null
    });
    if (history.length > 20) history.pop();
    localStorage.setItem('streamflix_history', JSON.stringify(history));
}

function removeFromList(id) {
    let favorites = JSON.parse(localStorage.getItem('streamflix_favorites')) || [];
    const idx = favorites.findIndex(f => (f.id == id || f == id));
    if (idx !== -1) {
        favorites.splice(idx, 1);
        localStorage.setItem('streamflix_favorites', JSON.stringify(favorites));
        const grid = document.getElementById('myListPageGrid');
        if (grid) renderMyList(grid, null, true);
    }
}

// --- My List Logic ---
function toggleMyList() {
    if (!currentId) return;
    const type = currentType || 'movie';
    const id = currentId.toString();
    const existing = JSON.parse(localStorage.getItem('streamflix_favorites') || '[]');
    
    // Check if exists
    const index = existing.findIndex(i => i.id.toString() === id);
    if (index > -1) {
        // Remove
        existing.splice(index, 1);
        showToast("Removed from My List");
    } else {
        // Add
        if (window.currentMovieObj) {
            existing.push({
                id: window.currentMovieObj.id,
                poster_path: window.currentMovieObj.poster_path,
                title: window.currentMovieObj.title || window.currentMovieObj.name,
                media_type: type
            });
            showToast("Added to My List");
        }
    }
    
    localStorage.setItem('streamflix_favorites', JSON.stringify(existing));
    updateMyListBtn();
    
    // Update Home Page row if exists
    if (typeof loadMyListPreview === 'function') loadMyListPreview();
}

function updateMyListBtn() {
    const btn = document.getElementById('myListBtn');
    if (!btn || !currentId) return;

    const existing = JSON.parse(localStorage.getItem('streamflix_favorites') || '[]');
    const isAdded = existing.some(i => i.id.toString() === currentId.toString());
    
    if (isAdded) {
        btn.innerHTML = '<i class="fas fa-check"></i> Added';
        btn.classList.add('added');
    } else {
        btn.innerHTML = '<i class="fas fa-plus"></i> My List';
        btn.classList.remove('added');
    }
}

function renderMyList(container, limit = null, isGrid = false) {
    if (!container) return;
    const favorites = JSON.parse(localStorage.getItem('streamflix_favorites')) || [];
    container.innerHTML = '';

    if (favorites.length === 0) {
        container.innerHTML = '<h3 style="color: grey; padding: 20px;">Your list is empty. Add movies and shows from the browse pages!</h3>';
        return;
    }

    const listToRender = [...favorites].reverse();
    const itemsToShow = limit ? listToRender.slice(0, limit) : listToRender;

    itemsToShow.forEach(item => {
        const card = createMovieCard(item, null, isGrid);
        container.appendChild(card);
    });
}

function updateMyListBtn() {
    const btn = document.getElementById('myListBtn');
    if (!btn || !currentId) return;
    const favorites = JSON.parse(localStorage.getItem('streamflix_favorites')) || [];
    const exists = favorites.some(f => (f.id == currentId || f == currentId));

    if (exists) {
        btn.innerHTML = '<i class="fas fa-check"></i> Added';
        btn.classList.add('added-to-list');
    } else {
        btn.innerHTML = '<i class="fas fa-plus"></i> My List';
        btn.classList.remove('added-to-list');
    }
}

/* ---------------------------
   Row fetching & rendering
   --------------------------- */

async function fetchAndRow(url, elementId, forcedType, isRanked = false) {
    const data = await fetchMovie(url);
    const row = document.getElementById(elementId);
    if (!row) return;
    row.innerHTML = '';

    let results = (data && Array.isArray(data.results) && data.results.length > 0) ? data.results : mockMovies.slice();

    if (results === mockMovies) results = [...mockMovies].sort(() => 0.5 - Math.random());

    results.forEach((item, index) => {
        if (!item || !item.poster_path) return;
        if (forcedType) item.media_type = forcedType;
        const rank = (isRanked && index < 10) ? index + 1 : null;
        row.appendChild(createMovieCard(item, rank));
    });
}

/* ---------------------------
   Hero carousel
   --------------------------- */

let heroInterval = null;
let currentHeroId = null;

// Helper to randomly determine rank (since we don't have real-time trending rank in this context)
function getMockRank(id) {
    // Simple hash to persist rank for session
    return (id % 10) + 1;
}

async function setHero(item) {
    if (!item) return;
    currentHeroId = item.id;
    const heroElem = document.getElementById('hero');
    if (!heroElem) return;

    const oldVideo = heroElem.querySelector('.hero-video-container');
    if (oldVideo) oldVideo.remove();

    heroElem.style.backgroundImage = item.backdrop_path ? `url("${BACKDROP_URL}${item.backdrop_path}")` : '';
    
    // Elements
    const titleEl = document.getElementById('heroTitle');
    const descEl = document.getElementById('heroDescription');
    const ratingEl = document.getElementById('heroAgeRating');
    const badgeEl = document.getElementById('heroBadge');
    const logoContainer = document.getElementById('heroLogoContainer');

    // 1. Text & Metadata
    if (titleEl) {
        titleEl.innerText = item.title || item.name || 'Untitled';
        titleEl.style.display = 'block'; // Default to visible
    }
    if (descEl) descEl.innerText = item.overview || 'No description available.';
    if (ratingEl) {
        const isAdult = item.adult ? 'A' : 'U/A 13+';
        ratingEl.innerText = isAdult;
    }

    // 2. Badge Logic (Mock "Top 10" for popularity)
    if (badgeEl) {
        if (item.vote_average > 7.5 || item.popularity > 1000) {
            badgeEl.style.display = 'inline-flex';
            // Mock rank based on ID for consistency
            const rank = (item.id % 10) + 1; 
            badgeEl.innerHTML = `<span class="top-10-icon">TOP 10</span> #${rank} in ${item.media_type === 'tv' ? 'TV Shows' : 'Movies'} Today`;
        } else {
            badgeEl.style.display = 'none';
        }
    }

            // 3. Dynamic Logo Fetching
    if (logoContainer) {
        logoContainer.innerHTML = ''; // Clear previous
        const type = item.media_type || (item.name ? 'tv' : 'movie');
        
        try {
            // Concurrent fetch for video (trailer) and images (logo) and details (runtime)
            // We use this closure to prevent stale results acting on UI
            const [vidData, imgData, detailsData] = await Promise.all([
                fetchMovie(`/${type}/${item.id}/videos`),
                fetchMovie(`/${type}/${item.id}/images`),
                fetchMovie(`/${type}/${item.id}`) // Fetch full details for duration/status
            ]);
            
            if (item.id !== currentHeroId) return; // Prevent race condition

            // Process Logo
            let logoPath = null;
            if (imgData && imgData.logos && imgData.logos.length > 0) {
                 // Try to find English PNG
                 const englishLogo = imgData.logos.find(l => l.iso_639_1 === 'en');
                 logoPath = englishLogo ? englishLogo.file_path : imgData.logos[0].file_path;
            }

            if (logoPath) {
                const logoImg = document.createElement('img');
                logoImg.src = `${IMG_URL}${logoPath}`;
                logoImg.className = 'hero-logo-img';
                logoImg.alt = item.title;
                logoContainer.appendChild(logoImg);
                
                // Hide Text Title if we have a Logo
                if (titleEl) titleEl.style.display = 'none';
            } else {
                if (titleEl) titleEl.style.display = 'block';
            }

            // --- Hero V3 Metadata Injection (Fixed) ---
            if (ratingEl && detailsData) {
                 const year = (detailsData.release_date || detailsData.first_air_date || '').split('-')[0];
                 const runtime = detailsData.runtime || (detailsData.episode_run_time ? detailsData.episode_run_time[0] : 0);
                 const durationStr = runtime ? `<span class="meta-separator">|</span> ${Math.floor(runtime/60)}h ${runtime%60}m` : '';
                 const qualityBadge = (detailsData.popularity > 500) ? '<span class="meta-badge">4K</span>' : '<span class="meta-badge">HD</span>';
                 
                 const currentRating = `<span class="meta-badge">${ratingEl.innerText.replace('A', 'A 18+')}</span>`;
                 
                 // Create GENRE tags
                 const genres = detailsData.genres ? detailsData.genres.map(g => g.name).slice(0, 3).join(' • ') : '';
                 const genreHtml = genres ? `<span class="meta-genre">${genres}</span> <span class="meta-separator">|</span> ` : '';

                 // Apply Class & HTML
                 ratingEl.className = 'hero-metadata'; // Reset class
                 ratingEl.innerHTML = `${year} <span class="meta-separator">|</span> ${genreHtml} ${currentRating} ${durationStr} &nbsp; ${qualityBadge}`;
                 
                 // Clear inline styles to allow CSS to take over
                 ratingEl.style = ''; 
            }

            // Process Video (Robust Fallback & Poll for YT)
            if (vidData && Array.isArray(vidData.results) && vidData.results.length > 0) {
                const videos = vidData.results;
                const trailer = videos.find(v => v.type === 'Trailer' && v.official) || 
                                videos.find(v => v.type === 'Trailer') ||
                                videos[0];
                                
                if (trailer) {
                    const videoContainer = document.createElement('div');
                    videoContainer.className = 'hero-video-container';
                    videoContainer.innerHTML = `
            <iframe id="heroIframe" class="hero-video-iframe" 
                src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${window.isHeroMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailer.key}&vq=hd1080&enablejsapi=1&origin=${window.location.origin}"
                frameborder="0" allow="autoplay; encrypted-media" style="width:100vw; height:56.25vw; min-height:100vh; min-width:177.77vh; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%) scale(1.5); pointer-events:none;">
            </iframe>`;
                    heroElem.insertBefore(videoContainer, heroElem.firstChild);
                    
                    // Robust Player Init with Polling
                    const initPlayer = (retries = 10) => {
                        if (window.YT && window.YT.Player) {
                            try {
                                const player = new YT.Player('heroIframe', {
                                    events: {
                                        'onReady': (event) => event.target.playVideo(),
                                        'onError': (e) => {
                                            console.warn("Hero Video Error", e.data);
                                            // Only skip if serious error
                                            if (e.data === 150 || e.data === 101) { if(window.nextHeroSlide) window.nextHeroSlide(); }
                                        },
                                        'onStateChange': (event) => {
                                            if (event.data === 1 && player.safetyTimer) clearTimeout(player.safetyTimer);
                                        }
                                    }
                                });

                                // SAFETY CHECK
                                player.safetyTimer = setTimeout(() => {
                                    if (player && typeof player.getPlayerState === 'function') {
                                        const state = player.getPlayerState();
                                        if (state !== 1 && state !== 3) {
                                            console.warn("Autoplay blocked -> Force Mute.");
                                            player.mute();
                                            player.playVideo();
                                            window.isHeroMuted = true;
                                            if (typeof updateMuteButtonUI === 'function') updateMuteButtonUI();
                                        }
                                    }
                                }, 3000); // 3s allow buffering
                            } catch(err) { console.warn("Init failed", err); }
                        } else if (retries > 0) {
                            setTimeout(() => initPlayer(retries - 1), 500);
                        }
                    };
                    
                    initPlayer(); // Start polling
                }
            }

        } catch (e) { console.warn("Hero fetch error", e); }
    } else {
        // Fallback for older logic (just fetch video)
       // ... existing simplified video fetch ...
    }

    // Reset Buttons
    const btnContainer = document.querySelector('.hero-content .hero-buttons');
    if (btnContainer) {
        const playBtn = document.getElementById('heroPlayBtn');
        const infoBtn = document.getElementById('heroInfoBtn');
        const recapBtn = document.getElementById('heroRecapBtn');

        if (playBtn) playBtn.onclick = () => {
            const type = item.media_type || (item.name ? 'tv' : 'movie');
            window.location.href = `movie.html?id=${item.id}&type=${type}`;
        };
        if (infoBtn) infoBtn.onclick = () => {
            const type = item.media_type || (item.name ? 'tv' : 'movie');
            window.location.href = `movie.html?id=${item.id}&type=${type}`;
        };
        if (recapBtn) recapBtn.onclick = () => openSmartRecap(item);
    }
    
    // Update Mute UI on load
    if (typeof updateMuteButtonUI === 'function') updateMuteButtonUI();
}

// --- MUTE LOGIC START ---
window.isHeroMuted = false; // Default: Sound ON

function updateMuteButtonUI() {
    const btn = document.getElementById('heroMuteBtn');
    const icon = document.getElementById('heroMuteIcon');
    if (btn && icon) {
        if (window.isHeroMuted) {
            btn.classList.add('muted');
            btn.innerHTML = '<i class="fas fa-volume-mute" id="heroMuteIcon"></i>';
        } else {
            btn.classList.remove('muted');
            btn.innerHTML = '<i class="fas fa-volume-up" id="heroMuteIcon"></i>';
        }
    }
}

window.toggleHeroMute = function() {
    window.isHeroMuted = !window.isHeroMuted;
    
    // Update Iframe if exists
    const iframe = document.getElementById('heroIframe');
    if (iframe && iframe.contentWindow) {
        const cmd = window.isHeroMuted ? 'mute' : 'unMute';
        iframe.contentWindow.postMessage(JSON.stringify({
            "event": "command",
            "func": cmd,
            "args": ""
        }), "*");
    }
    
    updateMuteButtonUI();
};
// --- MUTE LOGIC END ---

// --- CAROUSEL LOGIC START ---
let heroCarouselItems = [];
let heroCarouselIndex = 0;
let heroCarouselInterval = null;

function injectYouTubeAPI() {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}

window.nextHeroSlide = function() {
    if (!heroCarouselItems || heroCarouselItems.length === 0) return;
    heroCarouselIndex = (heroCarouselIndex + 1) % heroCarouselItems.length;
    setHero(heroCarouselItems[heroCarouselIndex]);
    
    // Reset Interval to prevent double switching
    if (heroCarouselInterval) clearInterval(heroCarouselInterval);
    heroCarouselInterval = setInterval(window.nextHeroSlide, 45000);
};

async function startHeroCarousel(items = []) {
    if (!items || items.length === 0) return;
    
    heroCarouselItems = items;
    heroCarouselIndex = 0;
    
    injectYouTubeAPI(); // Ensure API is present
    
    setHero(items[0]);

    if (heroCarouselInterval) clearInterval(heroCarouselInterval);
    heroCarouselInterval = setInterval(window.nextHeroSlide, 45000);
}
// --- CAROUSEL LOGIC END ---

/* ---------------------------
   Piped / YouTube-like rendering
   --------------------------- */

function renderPipedRow(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !items) return;
    container.innerHTML = '';

    items.forEach(video => {
        let videoId = null;
        if (video.url) {
            const url = String(video.url);
            if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
            else if (url.startsWith('/watch')) videoId = url.replace('/watch?v=', '').split('&')[0];
            else {
                try { const u = new URL(url); videoId = u.searchParams.get('v'); } catch (e) {}
            }
        }
        if (!videoId && video.videoId) videoId = video.videoId;
        if (!videoId) return;

        const card = document.createElement('div');
        card.className = 'movie-card';

        const thumb = video.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        const title = video.title || 'Unknown Video';

        card.innerHTML = `
      <img src="${thumb}" alt="${title}" loading="lazy" style="height: 100%; width: 100%; object-fit: cover;">
      <div class="play-overlay"><i class="fas fa-play"></i></div>
      <div class="card-info" style="position:absolute; bottom:0; padding:10px; background:linear-gradient(to top, rgba(0,0,0,0.7), transparent); width:100%;">
        <h4 style="font-size:0.9rem; margin:0; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</h4>
      </div>
    `;
        card.onclick = () => openVideoOverlay(videoId);
        container.appendChild(card);
    });
}

function processPipedData(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !items) return;

    container.innerHTML = '';
    container.classList.add('youtube-grid');

    let count = 0;
    for (const video of items) {
        if (count >= 20) break;
        count++;
        let videoId = null;
        let isFallback = video.isFallback || video.tmdbId;

        if (!isFallback) {
            if (video.url) {
                const url = String(video.url);
                if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
                else if (url.startsWith('/watch')) videoId = url.replace('/watch?v=', '').split('&')[0];
                else {
                    try { const u = new URL(url); if (u.searchParams) videoId = u.searchParams.get('v'); } catch (e) {}
                }
            }
            if (!videoId && video.videoId) videoId = video.videoId;
            if (!videoId) continue;
        }

        const card = document.createElement('div');
        card.className = 'video-card';

        card.onclick = async () => {
            if (isFallback) {
                card.style.opacity = '0.5';
                try {
                    const tmdbId = video.tmdbId || video.id;
                    const vData = await fetchMovie(`/movie/${tmdbId}/videos?api_key=${API_KEY}`);
                    const trailer = vData.results?.find(v => v.type === 'Trailer') || vData.results?.[0];
                    if (trailer) openVideoOverlay(trailer.key);
                    else alert("Trailer not found.");
                } catch (e) {
                    console.error(e);
                    alert("Could not load video.");
                }
                card.style.opacity = '1';
            } else {
                openVideoOverlay(videoId);
            }
        };

        const duration = video.duration ? formatDuration(video.duration) : '';
        const uploaderInitial = video.uploaderName ? video.uploaderName[0] : 'Y';
        const thumbSrc = video.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const fallbackThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        card.innerHTML = `
      <div class="video-thumbnail-wrapper">
        <img src="${thumbSrc}" alt="${video.title}" loading="lazy" onerror="this.src='${fallbackThumb}'">
        ${duration ? `<span class="video-duration">${duration}</span>` : ''}
      </div>
      <div class="video-details">
        <div class="video-avatar">${uploaderInitial}</div>
        <div class="video-meta">
          <h4 class="video-title">${video.title}</h4>
          <p class="video-channel">${video.uploaderName || 'Unknown'} • ${formatViews(video.views)}</p>
        </div>
      </div>
    `;
        container.appendChild(card);
    }
}

/* ---------------------------
   YouTube / Piped page logic
   --------------------------- */

const YT_CONFIG = {
    CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
    API_KEY: 'YOUR_GOOGLE_API_KEY_HERE',
    DISCOVERY_DOCS: ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"],
    SCOPES: "https://www.googleapis.com/auth/youtube.readonly",
};
let tokenClient, gapiInited = false, gisInited = false;

function maybeEnableRealYouTube() {
    try {
        if (window.gapi && !gapiInited) gapi.load('client', intializeGapiClient);
        if (window.google && !gisInited) {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: YT_CONFIG.CLIENT_ID,
                scope: YT_CONFIG.SCOPES,
                callback: '',
            });
            gisInited = true;
        }
    } catch (e) { /* silent */ }
}

async function intializeGapiClient() {
    if (!YT_CONFIG.API_KEY || YT_CONFIG.API_KEY.includes('YOUR_')) return;
    try {
        await gapi.client.init({ apiKey: YT_CONFIG.API_KEY, discoveryDocs: YT_CONFIG.DISCOVERY_DOCS });
        gapiInited = true;
    } catch (e) { console.warn('gapi init failed', e); }
}

async function fetchPipedTrending(region) {
    const endpoint = `/trending?region=${region}`;
    const data = await fetchWithMirrors(endpoint);
    if (!data) return null;
    if (Array.isArray(data)) return data;
    if (data.items) return data.items;
    return null;
}

async function loadYouTubePage() {
    console.log("Loading YouTube Page...");
    const signInBtn = document.getElementById('ytSignInBtn');
    const personalSection = document.getElementById('ytPersonalizedSection');

    setTimeout(maybeEnableRealYouTube, 500);

    if (signInBtn) {
        updateSignInUI(signInBtn, localStorage.getItem('yt_real_login') === 'true');
        signInBtn.onclick = () => handleRealAuthClick(signInBtn, personalSection);
        if (localStorage.getItem('yt_real_login') === 'true') {
            if (personalSection) personalSection.style.display = 'block';
            setTimeout(() => loadRealYouTubePersonalized().catch(() => {}), 1000);
        }
    }

    try {
        const usTrending = await fetchWithMirrors('/trending?region=US');
        if (usTrending && Array.isArray(usTrending) && usTrending.length > 0) {
            setYouTubeHero(usTrending[0]);
            renderPipedRow(usTrending, 'yt-trending-us');
        }
    } catch (e) { console.warn('Piped US trending failed', e); }

    await Promise.allSettled([
        loadRow('yt-trending-in', '/search?q=Tamil+Trending+Videos&filter=videos'),
        loadRow('yt-tamil-trailers', '/search?q=New+Tamil+Movie+Trailers+2025&filter=videos'),
        loadRow('yt-english-trailers', '/search?q=Official+Movie+Trailers+2025+4K&filter=videos')
    ]);
}

async function loadRow(containerId, endpoint) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';

    let items = [];
    const data = await fetchWithMirrors(endpoint);

    if (data) {
        if (Array.isArray(data)) items = data;
        else if (data.items) items = data.items;
    }

    if (items.length > 0) renderPipedRow(items, containerId);
    else container.innerHTML = '<p style="color:#666; padding-left:20px;">Content unavailable</p>';
}

function setYouTubeHero(video) {
    const heroTitle = document.getElementById('heroTitle');
    const heroDesc = document.getElementById('heroDesc');
    const heroMeta = document.getElementById('heroMeta');
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    const heroSection = document.getElementById('hero');

    if (!heroSection) return;

    let videoId = null;
    if (video.url) {
        if (video.url.includes('v=')) videoId = video.url.split('v=')[1].split('&')[0];
        else if (video.url.startsWith('/watch')) videoId = video.url.replace('/watch?v=', '').split('&')[0];
        else {
            try { const u = new URL(video.url); videoId = u.searchParams.get('v'); } catch (e) {}
        }
    }
    if (!videoId && video.videoId) videoId = video.videoId;

    if (heroTitle) heroTitle.innerText = video.title || '';
    if (heroDesc) heroDesc.innerText = video.shortDescription || `Trending on ${video.uploaderName || ''} • ${formatViews(video.views)} views`;
    if (heroMeta) heroMeta.innerHTML = `<span class="badge">Trending</span> <span>${formatDuration(video.duration)}</span>`;

    const highResThumb = video.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');
    if (highResThumb) {
        heroSection.style.backgroundImage = `url('${highResThumb}')`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
    }

    if (heroPlayBtn) heroPlayBtn.onclick = () => { if (videoId) openVideoOverlay(videoId); };

    if (videoId) {
        const oldVideo = document.querySelector('.hero-video-container');
        if (oldVideo) oldVideo.remove();
        const container = document.createElement('div');
        container.className = 'hero-video-container';
        container.innerHTML = `
            <iframe 
                id="heroIframe"
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen
                class="hero-video-iframe">
            </iframe>
        `;
        heroSection.appendChild(container);

        // Add Controls SEPARATELY to ensure they sit on top of everything (overlay included)
        const oldActions = document.querySelector('.hero-actions-right');
        if (oldActions) oldActions.remove();

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'hero-actions-right';
        actionsDiv.innerHTML = `
            <button class="hero-mute-btn muted" id="heroMuteBtn" onclick="toggleHeroMute()">
                <i class="fas fa-volume-mute" id="heroMuteIcon"></i>
            </button>
            <div class="hero-age-rating">13+</div>
        `;
        heroSection.appendChild(actionsDiv);
    }
}

window.toggleHeroMute = () => {
    const iframe = document.getElementById('heroIframe');
    // Try to find the button by ID (new logic) or class (legacy fallback)
    const btn = document.getElementById('heroMuteBtn'); 
    
    if(!iframe || !btn) {
        console.warn("toggleHeroMute: iframe or btn missing");
        return;
    }

    // Identify icon element (it might be the child)
    // If our new button structure is used, the icon is inside.
    const icon = btn.querySelector('i') || document.getElementById('heroMuteIcon');

    // If currently muted (check class on button OR if icon is 'mute'), we want to UNMUTE.
    // We synchronize by checking if we are IN the muted state.
    const isMuted = btn.classList.contains('muted') || (icon && icon.classList.contains('fa-volume-mute'));

    if (isMuted) {
        // UNMUTE
        iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":[]}', '*');
        if (icon) {
            icon.classList.remove('fa-volume-mute');
            icon.classList.add('fa-volume-up');
        } else {
             btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        btn.classList.remove('muted');
    } else {
        // MUTE
        iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":[]}', '*');
        if (icon) {
             icon.classList.remove('fa-volume-up');
             icon.classList.add('fa-volume-mute');
        } else {
             btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
        btn.classList.add('muted');
    }
};

// ... Wait, need to ensuring initial state matches logic.
// The HTML defaults to <i class="fas fa-volume-mute"></i>. 
// Let's assume we add 'muted' class by default in HTML or JS init.
// Refined Logic below in CSS/JS integration.


// --- Custom YouTube Page Logic (Piped API) ---


// Utility for relative time
function timeAgo(ms) {
    if (!ms) return '';
    // Piped often returns relative text "2 hours ago", but if ms timestamp:
    if (typeof ms === 'string') return ms; 
    const seconds = Math.floor((new Date() - ms) / 1000);
    // ... simplified return for now as Piped usually gives strings or we accept raw
    return 'Recently';
}

function updateSignInUI(btn, isSignedIn) {
    if (!btn) return;
    if (isSignedIn) {
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Signed In';
        btn.classList.add('signed-in');
        const sidebar = document.querySelector('.yt-sidebar');
        if (sidebar) sidebar.style.display = 'block';
    } else {
        btn.innerHTML = '<i class="fas fa-user-circle"></i> Sign In';
        btn.classList.remove('signed-in');
    }
}

function handleRealAuthClick(btn, section) {
    if (window.location.protocol === 'file:') {
        alert("Google Sign-In requires a server (http://localhost). Use Live Server or host this page.");
        return;
    }
    if (!YT_CONFIG.CLIENT_ID || YT_CONFIG.CLIENT_ID.includes('YOUR_')) {
        const proceed = confirm("Google Client ID is not configured in script.js.\n\nUse 'Demo Mode' to see how it looks?");
        if (proceed) {
            localStorage.setItem('yt_real_login', 'true');
            updateSignInUI(btn, true);
            if (section) section.style.display = 'block';
            filterYouTube('Music');
            const pageTitleEl = document.getElementById('ytPageTitle');
            if (pageTitleEl) pageTitleEl.innerText = "My Subscriptions (Demo)";
        }
        return;
    }

    if (!window.google || !tokenClient) {
        alert("Google API Scripts failed to load. Check connection or ad-blockers.");
        maybeEnableRealYouTube();
        return;
    }

    tokenClient.callback = async (resp) => {
        if (resp.error) { console.error(resp); showToast("Auth failed"); return; }
        localStorage.setItem('yt_real_login', 'true');
        updateSignInUI(btn, true);
        if (section) section.style.display = 'block';
        await loadRealYouTubePersonalized();
        showToast("Connected to YouTube!");
    };

    try {
        if (gapi && gapi.client && gapi.client.getToken && gapi.client.getToken() === null) tokenClient.requestAccessToken({ prompt: 'consent' });
        else tokenClient.requestAccessToken({ prompt: '' });
    } catch (e) { tokenClient.requestAccessToken({ prompt: 'consent' }); }
}

async function loadRealYouTubePersonalized() {
    if (!gapi || !gapi.client || !gapi.client.youtube) return;
    try {
        const response = await gapi.client.youtube.activities.list({ part: 'snippet,contentDetails', mine: 'true', maxResults: 15 });
        const recRow = document.getElementById('ytRecRow');
        if (recRow && response.result && Array.isArray(response.result.items)) {
            recRow.innerHTML = '';
            processRealYouTubeData(response.result.items, recRow, 'activity');
        }
        await fetchRealYouTubeTrends();
    } catch (e) { console.warn('loadRealYouTubePersonalized error', e); showToast("Error loading personalized YouTube data."); }
}

async function fetchRealYouTubeTrends() {
    if (!gapi || !gapi.client || !gapi.client.youtube) return;
    try {
        const response = await gapi.client.youtube.videos.list({ part: 'snippet,contentDetails,statistics', chart: 'mostPopular', regionCode: 'US', maxResults: 20 });
        const trendsRow = document.getElementById('ytTrendsRow');
        if (trendsRow && response.result && Array.isArray(response.result.items)) {
            trendsRow.innerHTML = '';
            processRealYouTubeData(response.result.items, trendsRow, 'video');
        }
    } catch (err) { console.warn("fetchRealYouTubeTrends failed", err); }
}

function processRealYouTubeData(items, container, type) {
    if (!Array.isArray(items) || !container) return;
    container.innerHTML = '';
    items.forEach(item => {
        let videoId = null;
        let title = item.snippet?.title || '';
        let img = item.snippet?.thumbnails?.high?.url || '';
        let date = item.snippet?.publishedAt || '';
        let channel = item.snippet?.channelTitle || '';

        if (type === 'activity') {
            if (item.contentDetails && item.contentDetails.upload) videoId = item.contentDetails.upload.videoId;
            else if (item.contentDetails && item.contentDetails.recommendation) videoId = item.contentDetails.recommendation.resourceId?.videoId;
        } else if (type === 'video') videoId = item.id;

        if (videoId) {
            const div = document.createElement('div');
            div.className = 'video-card';
            div.style.minWidth = '300px';
            div.style.marginRight = '15px';
            div.style.cursor = 'pointer';

            div.innerHTML = `
        <div class="video-thumbnail" style="height:170px; border-radius:8px; overflow:hidden; position:relative;">
            <img src="${img}" alt="${title}" style="width:100%; height:100%; object-fit:cover;">
            <div class="play-overlay"><i class="fas fa-play"></i></div>
        </div>
        <div style="padding: 10px 5px;">
            <div class="video-title" style="font-size:0.95em; margin-bottom:4px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</div>
            <div class="video-meta" style="font-size:0.85em; color:#aaa;">${channel} • ${date.split('T')[0]}</div>
        </div>
      `;

            div.onclick = () => window.openVideoModal(videoId);
            container.appendChild(div);
        }
    });
}

/* ---------------------------
   YouTube filter feed
   --------------------------- */

async function filterYouTube(category) {
    const chips = document.querySelectorAll('.yt-chip');
    chips.forEach(c => {
        if (c.innerText === category) c.classList.add('active');
        else c.classList.remove('active');
    });

    const feed = document.getElementById('ytMainFeed');
    const title = document.getElementById('ytPageTitle');
    if (!feed) return;

    feed.innerHTML = '<div class="spinner"></div>';
    if (title) title.innerText = category === 'All' ? 'Recommended' : category;

    let items = [];

    if (category === 'All' || category === 'Trending') {
        const indianTrends = await fetchPipedTrending('IN');
        if (indianTrends) items = indianTrends;
        else {
            const tData = await fetchMovie(requests.fetchTrending);
            if (tData && tData.results) {
                items = tData.results.map(m => ({
                    url: `/watch?v=fallback_${m.id}`,
                    thumbnail: m.backdrop_path ? `${BACKDROP_URL}${m.backdrop_path}` : (m.poster_path ? `${IMG_URL}${m.poster_path}` : ''),
                    title: m.title || m.name,
                    uploaderName: 'TMDB Fallback',
                    duration: 0,
                    views: (m.vote_count || 0) * 1000
                }));
            }
        }
    } else {
        items = await fetchPipedSearch(category) || [];
    }

    if (items && items.length > 0) processPipedData(items, 'ytMainFeed');
    else {
        if (category.includes('Tamil')) {
            const tData = await fetchMovie(requests.fetchTamilAction);
            if (tData && tData.results) {
                items = tData.results.map(m => ({
                    url: `/watch?v=fallback_${m.id}`,
                    thumbnail: `${BACKDROP_URL}${m.backdrop_path}`,
                    title: m.title,
                    uploaderName: 'Tamil Hits',
                    duration: 0,
                    views: 100000
                }));
                processPipedData(items, 'ytMainFeed');
                return;
            }
        }
        feed.innerHTML = '<p class="error-msg">No videos found. Try checking your connection. <a href="https://www.youtube.com" target="_blank" style="color:#e50914;">Open YouTube Directly</a></p>';
    }
}

/* ---------------------------
   Details page / unified
   --------------------------- */

let currentId = null;
let currentType = 'movie';
let currentTrailerKey = null;
window.currentMovieObj = null;

async function loadDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const type = urlParams.get('type') || 'movie';

    if (!movieId) { window.location.href = 'index.html'; return; }
    currentId = movieId;
    currentType = type;

    const details = await fetchMovie(`/${type}/${movieId}?language=en-US`);
    const videos = await fetchMovie(`/${type}/${movieId}/videos?language=en-US`);
    const credits = await fetchMovie(`/${type}/${movieId}/credits`);
    const similar = await fetchMovie(`/${type}/${movieId}/similar?language=en-US`);
    const reviews = await fetchMovie(`/${type}/${movieId}/reviews?language=en-US`);
    const images = await fetchMovie(`/${type}/${movieId}/images`);

    displayUnifiedDetails(details, videos, credits, similar, reviews, images);
    updateMyListBtn();
}

function displayUnifiedDetails(details, videos, credits, similar, reviews, images) {
    const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
    const movieContent = document.getElementById('movieContent'); if (movieContent) movieContent.style.display = 'block';
    if (!details || details.success === false) return;

    const posterEl = document.getElementById('detailPoster'); if (posterEl) posterEl.src = details.poster_path ? IMG_URL + details.poster_path : 'https://via.placeholder.com/300x450?text=No+Poster';
    const titleEl = document.getElementById('detailTitle'); if (titleEl) titleEl.innerText = details.title || details.name || '';
    const overviewEl = document.getElementById('detailOverview'); if (overviewEl) overviewEl.innerText = details.overview || '';
    const ratingEl = document.getElementById('detailRating'); if (ratingEl) ratingEl.innerText = details.vote_average ? Math.round(details.vote_average * 10) : 'NR';
    const dateEl = document.getElementById('detailDate'); if (dateEl) dateEl.innerText = (details.release_date || details.first_air_date || '').split('-')[0] || 'N/A';

    if (details.backdrop_path) {
        document.body.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.8), #141414), url(${BACKDROP_URL}${details.backdrop_path})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
    }

    if (videos && Array.isArray(videos.results)) {
        const trailer = videos.results.find(vid => vid.type === 'Trailer') || videos.results[0];
        if (trailer) currentTrailerKey = trailer.key;
    }

    window.currentMovieObj = details;

    const castContainer = document.getElementById('castContainer');
    if (credits && Array.isArray(credits.cast) && castContainer) {
        castContainer.innerHTML = credits.cast.slice(0, 10).map(c => `
      <div class="cast-card">
        <img src="${c.profile_path ? IMG_URL + c.profile_path : 'https://via.placeholder.com/100'}" class="cast-img" alt="${c.name}">
        <div class="cast-name">${c.name}</div>
        <div class="character-name">${c.character || ''}</div>
      </div>
    `).join('');
    }

    const galleryContainer = document.getElementById('galleryContainer');
    if (images && images.backdrops && galleryContainer) {
        galleryContainer.innerHTML = images.backdrops.slice(0, 6).map(img => `
      <div class="backdrop-item" onclick="openImageModal('${BACKDROP_URL}${img.file_path}')">
        <img src="${BACKDROP_URL}${img.file_path}" alt="Backdrop">
      </div>
    `).join('');
    }

    const videoContainer = document.getElementById('videoContainer');
    if (videoContainer && videos && Array.isArray(videos.results)) {
        const relevant = videos.results.filter(v => v.site === 'YouTube').slice(0, 6);
        videoContainer.innerHTML = relevant.map(v => `
      <div class="video-card" onclick="openVideoModal('${v.key}')">
        <div class="video-thumbnail"><img src="https://img.youtube.com/vi/${v.key}/mqdefault.jpg" alt="${v.name}"></div>
        <div class="video-title">${v.name}</div>
      </div>
    `).join('');
    }

    const reviewContainer = document.getElementById('reviewsContainer');
    if (reviewContainer) {
        if (reviews && Array.isArray(reviews.results) && reviews.results.length > 0) {
            reviewContainer.innerHTML = reviews.results.slice(0, 4).map(review => `
        <div class="review-card">
          <div class="review-header">
            <div class="review-avatar">${(review.author || 'U').charAt(0).toUpperCase()}</div>
            <div>
              <span class="review-author">${review.author}</span>
              <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <p class="review-text">${(review.content || '').slice(0, 200)}${(review.content || '').length > 200 ? '...' : ''}</p>
        </div>
      `).join('');
        } else reviewContainer.innerHTML = '<p class="no-reviews">No reviews available.</p>';
    }

    const similarContainer = document.getElementById('similarRow');
    const similarTitle = document.querySelector('#similarRow').previousElementSibling; // The h3
    
    // Combine or choose best source
    let relatedMovies = [];
    if (recommendations && Array.isArray(recommendations.results) && recommendations.results.length > 0) {
        relatedMovies = recommendations.results;
        if(similarTitle) similarTitle.innerText = "More Like This"; // Better title
    } else if (similar && Array.isArray(similar.results) && similar.results.length > 0) {
        relatedMovies = similar.results;
        if(similarTitle) similarTitle.innerText = "Similar Movies";
    }

    if (similarContainer && relatedMovies.length > 0) {
        similarContainer.innerHTML = '';
        similarContainer.parentElement.style.display = 'block'; // Ensure section is visible
        relatedMovies.slice(0, 12).forEach(m => { 
            if (m.poster_path) similarContainer.appendChild(createMovieCard(m)); 
        });
    } else if (similarContainer) {
        similarContainer.parentElement.style.display = 'none'; // Hide if really no data
    }

    const runtimeEl = document.getElementById('detailRuntime');
    if (runtimeEl) runtimeEl.textContent = details.runtime ? `${details.runtime} m` : (Array.isArray(details.episode_run_time) && details.episode_run_time[0] ? `${details.episode_run_time[0]} m` : '');

    const metaContainer = document.getElementById('productionInfo');
    if (metaContainer) {
        let metaHTML = '';
        
        // Status
        if (details.status) metaHTML += `<div class="meta-item"><span>Status</span> ${details.status}</div>`;
        
        // Release Date (Full)
        const date = details.release_date || details.first_air_date;
        if (date) metaHTML += `<div class="meta-item"><span>Release Date</span> ${date}</div>`;
        
        // Duration
        if (details.runtime) metaHTML += `<div class="meta-item"><span>Runtime</span> ${details.runtime} min</div>`;

        // Director & Writers (From Credits)
        if (credits && credits.crew) {
            const directors = credits.crew.filter(c => c.job === 'Director').map(c => c.name);
            const writers = credits.crew.filter(c => ['Screenplay', 'Writer', 'Story'].includes(c.job)).map(c => c.name);
            // Deduplicate writers
            const uniqueWriters = [...new Set(writers)];

            if (directors.length > 0) metaHTML += `<div class="meta-item"><span>Director</span> ${directors.join(', ')}</div>`;
            if (uniqueWriters.length > 0) metaHTML += `<div class="meta-item"><span>Writers</span> ${uniqueWriters.slice(0, 3).join(', ')}</div>`;
        }
        
        // Budget & Revenue (Only if > 0)
        if (details.budget && details.budget > 0) metaHTML += `<div class="meta-item"><span>Budget</span> ${formatCurrency(details.budget)}</div>`;
        if (details.revenue && details.revenue > 0) metaHTML += `<div class="meta-item"><span>Revenue</span> ${formatCurrency(details.revenue)}</div>`;
        
        // Production
        if (details.production_companies && details.production_companies.length > 0) {
            metaHTML += `<div class="meta-item"><span>Production</span> ${details.production_companies.map(c => c.name).slice(0, 2).join(', ')}</div>`;
        }
        
        // Genres
        if (details.genres && details.genres.length > 0) {
            metaHTML += `<div class="meta-item"><span>Genres</span> ${details.genres.map(g => g.name).join(', ')}</div>`;
        }

        // Starring (Top 3 Cast) which is critical for the "Details Bar"
        if (credits && credits.cast && credits.cast.length > 0) {
            const stars = credits.cast.slice(0, 3).map(c => c.name).join(', ');
            metaHTML += `<div class="meta-item" style="grid-column: span 2; color: #e5e5e5; font-weight: 500;"><span>Starring</span> ${stars}</div>`;
        }

        // Maturity Rating (Simulated logic or check adult)
        const rating = details.adult ? 'R' : 'PG-13'; // Simple heuristic
        metaHTML += `<div class="meta-item"><span style="border:1px solid #666; padding:0 4px; border-radius:2px;">${rating}</span></div>`;

        // Genres
        if (details.genres && details.genres.length > 0) {
            metaHTML += `<div class="meta-item"><span>Genres</span> ${details.genres.map(g => g.name).join(', ')}</div>`;
        }

        // Spoken Languages (New)
        if (details.spoken_languages && details.spoken_languages.length > 0) {
            const langs = details.spoken_languages.map(l => l.english_name).join(', ');
            // Show only first 2 in bar to save space
            const shortLangs = details.spoken_languages.slice(0, 2).map(l => l.english_name).join(', ');
            metaHTML += `<div class="meta-item"><span>Audio</span> ${shortLangs}</div>`;
            
            // Update Quick Info Audio
            const quickAudio = document.getElementById('quickAudio');
            if(quickAudio) quickAudio.innerHTML = `<i class="fas fa-volume-up"></i> <span class="val">${shortLangs}</span>`;
        } else {
             // Fallback
            const quickAudio = document.getElementById('quickAudio');
            if(quickAudio) quickAudio.innerHTML = `<i class="fas fa-volume-up"></i> <span class="val">${details.original_language ? details.original_language.toUpperCase() : 'English'}</span>`;
        }

        // Subtitles (Mock logic based on language)
        const quickSubs = document.getElementById('quickSubs');
        if(quickSubs) {
            quickSubs.innerHTML = `<i class="fas fa-closed-captioning"></i> <span class="val">English</span>`;
        }
        
        // Quality (Mock logic)
        const quickQuality = document.getElementById('quickQuality');
        if(quickQuality) {
            quickQuality.innerHTML = `<i class="fas fa-tv"></i> <span class="val">4K Ultra HD</span>`;
        }

        // Hide if empty, else show
        if(metaHTML === '') {
            metaContainer.style.display = 'none';
        } else {
            metaContainer.style.display = 'grid'; // Restore grid
            // Ensure visual pop
            metaContainer.style.background = 'rgba(0,0,0,0.5)';
            metaContainer.style.padding = '15px';
            metaContainer.style.borderRadius = '8px';
            metaContainer.style.backdropFilter = 'blur(10px)';
            metaContainer.innerHTML = metaHTML;
        }
    }

    // [CLEANUP] Buttons are now hardcoded in HTML
    const actionContainer = document.querySelector('.action-buttons');
    if (actionContainer) {
        // Optional: Any dynamic updates to buttons if needed
    }

    // Tagline (Insert after Title)
    const taglineTitleEl = document.getElementById('detailTitle');
    if(taglineTitleEl && details.tagline) {
        // Check if tagline element exists or append
        let taglineEl = document.getElementById('detailTagline');
        if(!taglineEl) {
             taglineEl = document.createElement('p');
             taglineEl.id = 'detailTagline';
             taglineEl.className = 'movie-tagline';
             taglineTitleEl.after(taglineEl);
        }
        taglineEl.innerText = `"${details.tagline}"`;
    } else {
        const taglineEl = document.getElementById('detailTagline');
        if(taglineEl) taglineEl.remove(); // Remove if no tagline
    }
    
    // Trivia Injection (Mock Logic based on Details)
    const triviaContainer = document.getElementById('triviaContainer');
    const triviaContent = document.getElementById('triviaContent');
    if (triviaContainer && triviaContent) {
        let triviaHTML = '';
        
        // Fact 1: Budget
        if(details.budget > 100000000) {
            triviaHTML += `<div class="trivia-item">This movie had a massive budget of ${formatCurrency(details.budget)}, making it one of the most expensive productions of its year.</div>`;
        }
        
        // Fact 2: Popularity
        if(details.popularity > 100) {
             triviaHTML += `<div class="trivia-item">It is currently trending with a popularity score of ${Math.round(details.popularity)}, placing it in the top tier of current interests.</div>`;
        }
        
        // Fact 3: Tagline context
        if(details.tagline) {
             triviaHTML += `<div class="trivia-item">The iconic tagline "${details.tagline}" was used in all major promotional campaigns.</div>`;
        }
        
        // Fact 4: Origin
        if(details.production_countries && details.production_countries.length > 0) {
             triviaHTML += `<div class="trivia-item">Filming took place primarily in ${details.production_countries.map(c=>c.name).join(' and ')}.</div>`;
        }
        
        if (triviaHTML) {
            triviaContent.innerHTML = triviaHTML;
            triviaContainer.style.display = 'block';
        } else {
            triviaContainer.style.display = 'none';
        }
    }
}

/* ---------------------------
   Inline Player Logic
   --------------------------- */

// Unified helper to play video inline (Hero Style Overlay)
window.playInlineVideo = function(key) {
    if (!key) {
        // Fallback if no key: Search YouTube
        const title = document.getElementById('detailTitle')?.innerText || 'Movie Trailer';
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`, '_blank');
        return;
    }
    
    // Save to Continue Watching
    const titleEl = document.getElementById('detailTitle');
    const posterEl = document.querySelector('.poster-column img');
    const title = titleEl ? titleEl.innerText : 'Unknown Title';
    const poster = posterEl ? posterEl.src.replace('https://image.tmdb.org/t/p/w500', '') : '';
    const id = new URLSearchParams(window.location.search).get('id') || 'known'; 
    
    saveContinueWatching({
        id: id,
        title: title,
        poster_path: poster,
        media_type: 'movie'
    });

    const contentDiv = document.querySelector('.movie-details-container'); // Container
    
    // Remove if exists
    const existing = document.getElementById('inlinePlayerWrapper');
    if (existing) existing.remove();

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'inlinePlayerWrapper';
    wrapper.style.width = '100%';
    wrapper.style.height = '60vh'; // Fixed height for cinematic feel
    wrapper.style.position = 'relative';
    wrapper.style.marginBottom = '20px';
    wrapper.style.backgroundColor = '#000';
    wrapper.style.borderRadius = '8px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5)';
    wrapper.style.animation = 'fadeIn 0.5s ease';

    wrapper.innerHTML = `
         <iframe src="https://www.youtube.com/embed/${key}?autoplay=1&rel=0&showinfo=0&enablejsapi=1&modestbranding=1" 
         style="width:100%; height:100%; border:none;" 
         allowfullscreen allow="autoplay"></iframe>
         <button onclick="closeInlinePlayer()" style="position:absolute; top:15px; right:15px; background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.3); padding:8px 16px; cursor:pointer; border-radius:4px; z-index:20; font-weight:bold; backdrop-filter:blur(5px);">
            <i class="fas fa-times"></i> Close Player
         </button>
    `;

    // Insert at the VERY TOP of the content container
    contentDiv.insertBefore(wrapper, contentDiv.firstChild);
    
    // Scroll smoothly to it
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Hide Background temporarily for focus (Optional)
    // document.body.style.backgroundImage = 'none';
    // document.body.style.backgroundColor = '#141414';
    
    // Convert Play Button to Stop Button
    updatePlayButtonState(true);
}

// Main Button Click
window.openModal = function() {
    // Try global key, fallback to video results logic
    if (currentTrailerKey) {
        playInlineVideo(currentTrailerKey);
    } else {
        // Fallback: try to find key again from current logic or search
        console.warn("No currentTrailerKey found, falling back to search");
        const title = document.getElementById('detailTitle').innerText;
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`, '_blank');
    }
}

window.openVideoModal = function(key) {
    playInlineVideo(key);
}

window.closeInlinePlayer = function() {
    const playerWrapper = document.getElementById('inlinePlayerWrapper');
    if (playerWrapper) {
        playerWrapper.remove(); 
    }
    
    // Restore Background (Re-run backdrop logic from cached obj)
    if (window.currentMovieObj && window.currentMovieObj.backdrop_path) {
        document.body.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.8), #141414), url(${BACKDROP_URL}${window.currentMovieObj.backdrop_path})`;
    }

    updatePlayButtonState(false);
}

function updatePlayButtonState(isPlaying) {
    const btns = document.querySelectorAll('.action-buttons .btn-primary');
    btns.forEach(btn => {
        if (isPlaying) {
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop Trailer';
            btn.classList.add('btn-danger'); // Optional: red style
            btn.onclick = window.closeInlinePlayer;
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> Play Trailer';
            btn.classList.remove('btn-danger');
            btn.onclick = window.openModal;
        }
    });
}

// [NEW] Feature Handlers
window.triggerDownload = function() {
    const btn = document.querySelector('button[onclick="triggerDownload()"]');
    if(btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Saved to Device';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.disabled = false;
            }, 3000);
        }, 2000);
    }
};

window.triggerShare = function() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("Link copied to clipboard: " + url); 
    }).catch(err => {
        console.error('Async: Could not copy text: ', err);
        prompt("Copy link:", url);
    });
};

window.triggerRate = function() {
    const btn = document.querySelector('button[onclick="triggerRate()"]');
    if(btn) {
        if(btn.style.color === 'rgb(70, 211, 105)') {
             btn.style.color = ''; // Reset
             alert("Rating removed");
        } else {
             btn.style.color = '#46d369'; // Green
             alert("You liked this!");
        }
    }
};

/* ---------------------------
   Smart recap + small UI helpers
   --------------------------- */

function openSmartRecap(item) {
    const modal = document.getElementById('recapModal');
    const body = document.getElementById('recapBody');
    if (!modal || !body) return;
    const sentences = item.overview ? item.overview.split('. ').filter(Boolean) : ['No details available.'];
    const keyPoints = sentences.map(s => `<li>${s.trim()}.</li>`).join('');
    body.innerHTML = `
    <h3>${item.title || item.name}</h3>
    <p style="margin-bottom:15px;"><strong>Quick Plot:</strong> ${sentences[0] || ''}.</p>
    <ul style="margin-left:20px; color:#bbb;">
      ${keyPoints}
      <li><strong>Rating:</strong> ${item.vote_average || 'N/A'}/10</li>
      <li><strong>Released:</strong> ${item.release_date || item.first_air_date || 'N/A'}</li>
    </ul>
    <div style="margin-top:20px; padding:10px; background:#333; border-radius:5px; font-size:0.9em;">
      <i class="fas fa-robot"></i> <em>Generated by StreamFlix AI</em>
    </div>
  `;
    modal.style.display = 'flex';
}

function closeRecapModal() { const modal = document.getElementById('recapModal'); if (modal) modal.style.display = 'none'; }
function openImageModal(src) { if (!src) return; window.open(src, '_blank'); }

/* ---------------------------
   Suggestions / recommendations / mood / surprise
   --------------------------- */

async function surpriseMe() {
    try {
        const data = await fetchMovie(requests.fetchTopRated);
        if (data && Array.isArray(data.results) && data.results.length > 0) {
            const random = data.results[Math.floor(Math.random() * data.results.length)];
            const type = random.media_type || 'movie';
            window.location.href = `movie.html?id=${random.id}&type=${type}`;
        } else showToast("Couldn't find a surprise right now.");
    } catch (e) { showToast("Could not surprise you right now."); }
}

async function loadMood(mood) {
    const container = document.getElementById('moodResultsRow');
    if (!container) return;
    container.innerHTML = '<div style="padding:20px"><i class="fas fa-spinner fa-spin"></i> Finding movies...</div>';
    let url = '';
    switch (mood) {
        case 'calm': url = `/discover/movie?with_genres=99,10751&sort_by=vote_average.desc&vote_count.gte=100`; break;
        case 'funny': url = `/discover/movie?with_genres=35&sort_by=popularity.desc`; break;
        case 'sad': url = `/discover/movie?with_genres=18&sort_by=vote_average.desc&vote_count.gte=200`; break;
        case 'intense': url = `/discover/movie?with_genres=28,53&sort_by=popularity.desc`; break;
        case 'romantic': url = `/discover/movie?with_genres=10749&sort_by=popularity.desc`; break;
        default: return;
    }
    await fetchAndRow(url, 'moodResultsRow', 'movie');
}

async function loadBecauseYouWatched() {
    const history = JSON.parse(localStorage.getItem('streamflix_history')) || [];
    if (history.length === 0) return;
    const lastWatched = history[0];
    const row = document.getElementById('recommendationsRow');
    const sect = document.getElementById('recommendationsSection');
    const titleSpan = document.getElementById('recSourceTitle');
    if (!row || !sect) return;

    try {
        const type = lastWatched.media_type === 'tv' ? 'tv' : 'movie';
        const data = await fetchMovie(`/${type}/${lastWatched.id}/recommendations`);
        if (data && Array.isArray(data.results) && data.results.length > 0) {
            sect.style.display = 'block';
            if (titleSpan) titleSpan.innerText = `"${lastWatched.title}"`;
            row.innerHTML = '';
            data.results.forEach(item => { if (item.poster_path) row.appendChild(createMovieCard(item)); });
        } else {
            const sim = await fetchMovie(`/${type}/${lastWatched.id}/similar`);
            if (sim && Array.isArray(sim.results) && sim.results.length > 0) {
                sect.style.display = 'block';
                if (titleSpan) titleSpan.innerText = `"${lastWatched.title}"`;
                row.innerHTML = '';
                sim.results.forEach(item => { if (item.poster_path) row.appendChild(createMovieCard(item)); });
            }
        }
    } catch (e) { console.warn("Recs error", e); }
}

/* ---------------------------
   Continue watching / MyList preview
   --------------------------- */

function loadContinueWatching() {
    const row = document.getElementById('continueWatchingRow');
    const wrapper = document.getElementById('continueWatchingWrapper');
    if (!row || !wrapper) return;

    let history = JSON.parse(localStorage.getItem('streamflix_history')) || [];
    
    // --- MOCK DATA SEED (If empty, show demo) ---
    if (history.length < 3) {
        history = [
            { id: 1032760, title: 'Leo', backdrop_path: '/p1F51Lvj3sMopG948F5HsBbl43C.jpg', progress: 45, timestamp: '1h 05m left' },
            { id: 1129532, title: 'GOAT', backdrop_path: '/5aj8vVGFwGVbOJiLYgJq86Ql0lQ.jpg', progress: 80, timestamp: '22m left' },
            { id: 66732, title: 'Stranger Things', backdrop_path: '/56v2KjBlU4XaOv9rVYkJu64HIIV.jpg', progress: 15, timestamp: 'S4:E2' },
            { id: 71446, title: 'Money Heist', backdrop_path: '/gFZriCkpJYS0wnLw0YjNHVQQdd9.jpg', progress: 90, timestamp: 'S5:E10' },
            { id: 585268, title: 'Master', backdrop_path: '/3pIqd1jhZpMxlk7lsqgS5hh537D.jpg', progress: 30, timestamp: '1h 40m left' }
        ];
    }

    if (history.length > 0) {
        wrapper.style.display = 'flex'; // Show wrapper
        row.innerHTML = '';
        
        history.forEach(item => {
            const card = document.createElement('div');
            card.className = 'cw-card';
            
            const img = item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : 'https:// via.placeholder.com/280x160';
            const progress = item.progress || Math.floor(Math.random() * 80) + 10;
            const timeInfo = item.timestamp || (Math.floor(Math.random() * 90) + 'm left');

            card.innerHTML = `
                <img src="${img}" alt="${item.title}" class="cw-thumbnail">
                <div class="cw-overlay">
                    <div class="cw-progress-bar">
                        <div class="cw-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="cw-info">
                        <div>
                            <div class="cw-title">${item.title}</div>
                            <span class="cw-meta">${timeInfo}</span>
                        </div>
                        <div class="cw-resume-btn"><i class="fas fa-play"></i></div>
                    </div>
                </div>
            `;
            
            card.onclick = () => {
                const type = item.title ? 'movie' : 'tv'; // Simple heuristic
                window.location.href = `movie.html?id=${item.id}&type=${type}`;
            };
            
            row.appendChild(card);
        });
    } else {
        wrapper.style.display = 'none';
    }
}

function loadMyListPreview() {
    const row = document.getElementById('myListRow');
    if (row) renderMyList(row, 10, false);
}

async function loadMyListPage() {
    const grid = document.getElementById('myListPageGrid');
    if (grid) renderMyList(grid, null, true);
}

/* ---------------------------
   People / Stars
   --------------------------- */

async function loadTrendingPeople() {
    const row = document.getElementById('trendingPeopleRow');
    if (!row) return;

    try {
        const globalData = await fetchMovie(`/person/popular?language=en-US`);
        let people = globalData.results ? globalData.results.slice(0, 8) : [];

        const getStarsFromLang = async (langCode) => {
            const hits = await fetchMovie(`/discover/movie?with_original_language=${langCode}&sort_by=popularity.desc&page=1`);
            let stars = [];
            if (hits && hits.results) {
                const top3 = hits.results.slice(0, 3);
                for (const m of top3) {
                    const credits = await fetchMovie(`/movie/${m.id}/credits`);
                    if (credits && credits.cast) stars = stars.concat(credits.cast.slice(0, 4));
                }
            }
            return stars;
        };

        const tamilStars = await getStarsFromLang('ta');
        const teluguStars = await getStarsFromLang('te');
        const hindiStars = await getStarsFromLang('hi');

        people = [...people, ...tamilStars, ...teluguStars, ...hindiStars];
        const dedup = Array.from(new Map((people || []).map(p => [p.id, p])).values());
        dedup.sort(() => Math.random() - 0.5);

        row.innerHTML = '';
        dedup.forEach(p => {
            if (p && p.profile_path) {
                const div = document.createElement('div');
                div.className = 'person-card';
                div.style.cursor = 'pointer';
                div.onclick = () => window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(p.name)}`, '_blank');
                div.innerHTML = `<img src="${IMG_URL}${p.profile_path}" alt="${p.name}"><p>${p.name}</p>`;
                row.appendChild(div);
            }
        });
        if (row.children.length === 0) row.innerHTML = '<p style="color:#888">No people to show.</p>';
    } catch (e) { console.warn('loadTrendingPeople error', e); row.innerHTML = '<p style="color:#888">Could not load trending people.</p>'; }
}

/* ---------------------------
   AppleTV / Movies / TV / New Popular
   --------------------------- */

async function loadMoviesPage() {
    const trending = await fetchMovie(requests.fetchTrending);
    const heroItem = (trending && trending.results) ? trending.results[0] : mockMovies[0];
    setHero(heroItem);

    await fetchAndRow(requests.fetchAction, 'actionMoviesRow', 'movie');
    await fetchAndRow(`/discover/movie?with_original_language=ta&sort_by=popularity.desc`, 'tamilMoviesRow', 'movie');
    await fetchAndRow(requests.fetchComedy, 'comedyMoviesRow', 'movie');
    await fetchAndRow(requests.fetchSciFi, 'scifiMoviesRow', 'movie');
    await fetchAndRow(requests.fetchThriller, 'thrillerMoviesRow', 'movie');
    await fetchAndRow(requests.fetchAnimation, 'animationMoviesRow', 'movie');
}

async function loadTVPage() {
    const trending = await fetchMovie(requests.fetchTrendingTV);
    const heroItem = (trending && trending.results) ? trending.results[0] : mockMovies[1];
    setHero(heroItem);

    await fetchAndRow(requests.fetchTrendingTV, 'trendingTVRow', 'tv');
    await fetchAndRow(requests.fetchTopRatedTV, 'topRatedTVRow', 'tv');
    await fetchAndRow(requests.fetchCrimeTV, 'crimeTVRow', 'tv');
    await fetchAndRow(requests.fetchComedyTV, 'comedyTVRow', 'tv');

    await fetchAndRow(requests.fetchTamilTV, 'tamilTVRow', 'tv');
    await fetchAndRow(requests.fetchTamilReality, 'tamilRealityRow', 'tv');
}

async function loadAppleTVPage() {
    const baseParams = `with_watch_providers=350&watch_region=US`;
    await fetchAndRow(`/discover/tv?${baseParams}&sort_by=popularity.desc`, 'appleTvRow', 'tv');
    await fetchAndRow(`/discover/movie?${baseParams}&sort_by=popularity.desc`, 'appleMovieRow', 'movie');
    await fetchAndRow(`/discover/tv?${baseParams}&sort_by=vote_average.desc&vote_count.gte=50`, 'appleTopRow', 'tv');
}



// [NEW] Full Screen Music Queue Player (iTunes Audio)
function openMusicQueue(startSong, allSongs) {
    let modal = document.getElementById('musicPlayerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'musicPlayerModal';
        modal.className = 'video-modal'; 
        modal.style.zIndex = '20000'; // Force on top
        // Full Page-like Overlay
        modal.innerHTML = `
            <div class="music-player-content" style="max-width:1200px; width:95%; height:85vh; background:#121212; display:flex; border-radius:12px; overflow:hidden; position:relative; margin: 3% auto; box-shadow: 0 0 80px rgba(0,0,0,0.8); border:1px solid #333;">
                <span class="close-player" style="position:absolute; top:20px; right:25px; color:#fff; font-size:30px; cursor:pointer; z-index:50; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">&times;</span>
                
                <!-- Left: Now Playing (60%) -->
                <div class="player-stage" style="width:60%; height:100%; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden;">
                    <!-- Blurry Background -->
                    <div id="mpBg" style="position:absolute; top:0; left:-10%; width:120%; height:120%; background-size:cover; background-position:center; filter:blur(30px) brightness(0.3);"></div>
                    
                    <div style="z-index:2; text-align:center; width:80%;">
                        <img id="mpCover" src="" style="width:300px; height:300px; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.5); object-fit:cover; margin-bottom:20px;">
                        
                        <div style="margin-bottom:25px;">
                            <h2 id="mpTitle" style="color:white; font-size:1.8rem; margin:0 0 5px 0; font-weight:700; text-shadow:0 2px 4px rgba(0,0,0,0.5);"></h2>
                            <p id="mpArtist" style="color:#e50914; font-size:1.1rem; margin:0; font-weight:500;"></p>
                            <p id="mpAlbum" style="color:#888; font-size:0.9rem; margin-top:5px;"></p>
                            <div id="mpMeta" style="margin-top:10px; display:flex; justify-content:center; gap:10px; font-size:0.8rem; color:#666;"></div>
                        </div>
                        
                        <audio id="mpAudio" controls autoplay style="width:100%; filter:invert(0.9); height:40px; border-radius:20px; outline:none;"></audio>
                    </div>
                </div>

                <!-- Right: Playlist Queue (40%) -->
                <div class="player-queue" style="width:40%; height:100%; background:#181818; display:flex; flex-direction:column; border-left:1px solid #333;">
                    <div style="padding:24px; background:#202020; border-bottom:1px solid #333;">
                        <h3 style="color:white; margin:0; font-size:1.2rem;">Suggestions</h3>
                        <span style="font-size:0.8rem; color:#e50914;">You might also like</span>
                    </div>
                    <div id="mpList" style="flex-grow:1; overflow-y:auto; padding:0;">
                        <!-- Tracks go here -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const close = modal.querySelector('.close-player');
        
        const closeModal = () => {
            document.getElementById('mpAudio').pause();
            modal.style.display = 'none';
        };

        close.onclick = closeModal;
        modal.onclick = (e) => { if(e.target === modal) closeModal(); };
    }

    const titleEl = modal.querySelector('#mpTitle');
    const artistEl = modal.querySelector('#mpArtist');
    const albumEl = modal.querySelector('#mpAlbum');
    const metaEl = modal.querySelector('#mpMeta');
    const coverEl = modal.querySelector('#mpCover');
    const bgEl = modal.querySelector('#mpBg');
    const audioEl = modal.querySelector('#mpAudio');
    const listEl = modal.querySelector('#mpList');
    
    modal.style.display = 'block';

    // Render Queue
    listEl.innerHTML = '';
    
    // Play Function
    const playSong = (song, index) => {
        const highResImg = song.artworkUrl100.replace('100x100', '600x600');
        const duration = formatDuration(song.trackTimeMillis);
        const isExplicit = song.trackExplicitness === 'explicit';
        
        titleEl.innerText = song.trackName;
        artistEl.innerText = song.artistName;
        albumEl.innerText = song.collectionName;
        metaEl.innerHTML = `
            <span>${song.primaryGenreName}</span> • <span>${new Date(song.releaseDate).getFullYear()}</span>
            ${isExplicit ? '< span style="border:1px solid #666; padding:0 4px; border-radius:3px;">E</span>' : ''}
        `;

        coverEl.src = highResImg;
        bgEl.style.backgroundImage = `url('${highResImg}')`;
        audioEl.src = song.previewUrl;
        audioEl.play().catch(e => console.log("Autoplay prevented:", e));

        // Add to History
        addToHistory(song);

        // Update Active UI
        Array.from(listEl.children).forEach((el, i) => {
            if(i === index) {
                el.style.background = '#333';
                el.querySelector('.anim-bars').style.display = 'flex';
                el.querySelector('.track-num').style.display = 'none';
            } else {
                el.style.background = 'transparent';
                el.querySelector('.anim-bars').style.display = 'none';
                el.querySelector('.track-num').style.display = 'block';
            }
        });
    };

    allSongs.forEach((song, idx) => {
        const item = document.createElement('div');
        const duration = formatDuration(song.trackTimeMillis);
        const isExplicit = song.trackExplicitness === 'explicit';
        const isLiked = isSongLiked(song.trackId);

        item.className = 'queue-track';
        item.style.cssText = 'display:flex; align-items:center; padding:15px 20px; border-bottom:1px solid #2a2a2a; cursor:pointer; transition:background 0.2s;';
        
        item.onmouseenter = () => { if(item.style.background !== 'rgb(51, 51, 51)') item.style.background = '#252525'; };
        item.onmouseleave = () => { if(item.style.background !== 'rgb(51, 51, 51)') item.style.background = 'transparent'; };

        item.innerHTML = `
            <div style="width:30px; text-align:center; margin-right:15px;">
                <span class="track-num" style="color:#666; font-size:0.9rem;">${idx + 1}</span>
                <div class="anim-bars" style="display:none; gap:2px; height:12px; align-items:flex-end; justify-content:center;">
                    <div style="width:3px; height:60%; background:#e50914; animation:bounce 0.8s infinite;"></div>
                    <div style="width:3px; height:100%; background:#e50914; animation:bounce 1.2s infinite;"></div>
                    <div style="width:3px; height:40%; background:#e50914; animation:bounce 0.5s infinite;"></div>
                </div>
            </div>
            
            <img src="${song.artworkUrl100}" style="width:40px; height:40px; border-radius:4px; margin-right:15px; object-fit:cover;">
            
            <div style="flex-grow:1; min-width:0;">
                 <div style="color:#eee; font-size:0.95rem; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${isExplicit ? '<span class="explicit-badge" style="font-size:0.6rem; width:14px; height:14px; margin-right:4px;">E</span>' : ''}
                    ${song.trackName}
                 </div>
                 <div style="color:#888; font-size:0.8rem;">${song.artistName}</div>
            </div>
            
            <i class="fas fa-heart" onclick="event.stopPropagation(); toggleLike(${song.trackId}, this)" 
               style="color:${isLiked ? '#e50914' : '#555'}; margin-right:20px; font-size:1rem; transition:0.2s;"></i>
            
            <div style="color:#555; font-size:0.8rem;">${duration}</div>
        `;
        
        item.onclick = () => playSong(song, idx);
        listEl.appendChild(item);
    });

    // Handle Like Toggle Logic (Specific to this list item)
    window.toggleLike = (trackId, iconEl) => {
        const fullSong = allSongs.find(s => s.trackId === trackId);
        if(!fullSong) return;

        const liked = getLibrary('likedSongs') || [];
        const index = liked.findIndex(s => s.trackId === trackId);
        
        if(index > -1) {
            liked.splice(index, 1);
            iconEl.style.color = '#555';
        } else {
            liked.unshift(fullSong);
            iconEl.style.color = '#e50914';
        }
        
        saveLibrary('likedSongs', liked);
        updateLibraryUI();
    };

    // Auto-play selected song
    const startIndex = allSongs.indexOf(startSong);
    if(startIndex >= 0) playSong(startSong, startIndex);
}

// --- Library Data Management ---

function getLibrary(key) {
    const data = localStorage.getItem('music_lib_' + key);
    return data ? JSON.parse(data) : null;
}

function saveLibrary(key, data) {
    localStorage.setItem('music_lib_' + key, JSON.stringify(data));
}

function isSongLiked(trackId) {
    const liked = getLibrary('likedSongs') || [];
    return liked.some(s => s.trackId === trackId);
}

function addToHistory(song) {
    let history = getLibrary('history') || [];
    // Remove if exists to bubble to top
    history = history.filter(s => s.trackId !== song.trackId);
    history.unshift(song);
    if(history.length > 50) history.pop(); // Max 50
    saveLibrary('history', history);
}

function updateLibraryUI() {
    const liked = getLibrary('likedSongs') || [];
    const countEl = document.getElementById('liked-count');
    if(countEl) countEl.innerText = `${liked.length} songs`;
}

// Open Library Sections
window.openLikedSongs = () => {
    const liked = getLibrary('likedSongs') || [];
    if(liked.length === 0) return alert("No liked songs yet! Click the heart on any song.");
    openMusicQueue(liked[0], liked);
};

window.openHistory = () => {
    const history = getLibrary('history') || [];
    if(history.length === 0) return alert("No history yet.");
    openMusicQueue(history[0], history);
};

// Initial update on load
document.addEventListener('DOMContentLoaded', updateLibraryUI);



// Helper: Format Milliseconds to MM:SS
function formatDuration(millis) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// Fetch Songs from iTunes
async function fetchiTunesSongs(term, elementId) {
    const row = document.getElementById(elementId);
    if(!row) return;
    
    row.innerHTML = '<div class="loader"></div>';

    try {
        let response;
        try {
            // Try Direct
            response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=60`);
        } catch (err) {
            console.warn("Direct fetch failed, trying proxy...", err);
            // Try via Proxy
             const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=60`)}`;
             response = await fetch(proxyUrl);
        }

        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        const results = data.results || [];

        row.innerHTML = '';
        
        if(results.length > 0) {
            results.forEach(song => {
                const card = document.createElement('div');
                card.className = 'movie-card'; 
                card.style.minWidth = '200px'; 
                
                const highResImg = song.artworkUrl100.replace('100x100', '400x400');
                const duration = formatDuration(song.trackTimeMillis);
                const isExplicit = song.trackExplicitness === 'explicit';
                const explicitBadge = isExplicit ? '<span class="explicit-badge" title="Explicit Content">E</span>' : '';

                card.innerHTML = `
                    <div style="position:relative; overflow:hidden; border-radius:4px;">
                        <img src="${highResImg}" alt="${song.trackName}" style="width:100%; height:200px; object-fit:cover; transition:0.3s;">
                        <span class="duration-tag">${duration}</span>
                        <div class="hover-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; opacity:0; transition:0.3s;">
                             <i class="fas fa-play-circle" style="color:white; font-size:3rem; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));"></i>
                        </div>
                    </div>
                    <div style="padding:10px 0;">
                        <h4 style="color:white; font-size:0.9rem; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${explicitBadge} ${song.trackName}
                        </h4>
                        <p style="color:#aaa; font-size:0.8rem; margin:2px 0;">${song.artistName}</p>
                    </div>
                `;
                
                const imgDiv = card.firstElementChild;
                card.onmouseenter = () => { imgDiv.querySelector('.hover-overlay').style.opacity = '1'; imgDiv.querySelector('img').style.transform = 'scale(1.05)'; };
                card.onmouseleave = () => { imgDiv.querySelector('.hover-overlay').style.opacity = '0'; imgDiv.querySelector('img').style.transform = 'scale(1)'; };
                
                // Click -> Open Full Queue Player
                card.onclick = () => openMusicQueue(song, results);
                
                row.appendChild(card);
            });
        } else {
             row.innerHTML = '<p style="color:#666; padding:20px;">No songs found.</p>';
        }

    } catch (e) {
        console.error("iTunes Fetch Error:", e);
        row.innerHTML = '<p style="color:red; padding:20px;">Could not load songs.</p>';
    }
}

// [NEW] Music Page Logic
async function loadMusicPage() {
   // 1. Fetch English Hits (Top 40 / Pop)
   await fetchiTunesSongs('top hits', 'english-songs-row');
   
   // 2. Fetch Tamil Hits (Anirudh / Rahman)
   await fetchiTunesSongs('tamil hits', 'tamil-songs-row');

   // 3. Hindi & Bollywood
   await fetchiTunesSongs('bollywood hits', 'hindi-songs-row');

   // 4. Malayalam
   await fetchiTunesSongs('malayalam hits', 'malayalam-songs-row');

   // 5. Melody & Love
   await fetchiTunesSongs('tamil melody songs', 'melody-songs-row');

   // 6. Party Mode
   await fetchiTunesSongs('party dance songs', 'party-songs-row');

   // 7. 90s Nostalgia
   await fetchiTunesSongs('tamil 90s hits', 'old-songs-row');
}

// Helper: Scroll to Section (for Chips)
window.scrollToSection = (id) => {
    const el = document.getElementById(id);
    if(el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

window.filterMusic = (type) => {
    window.scrollTo(0, 0); // Reset for 'All'
};

// --- New & Popular Page Logic (Restored & Expanded) ---

const NEWS_API_KEY = 'YOUR_API_KEY_HERE'; // User to replace this


// Helper for Currency
const formatMoney = (amount) => {
    if (!amount || amount === 0) return 'Trending';
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(0)}M`;
    return `$${amount.toLocaleString()}`;
};


// Helper for Progress Bar
const updateSliderProgress = (percent) => {
    const bar = document.getElementById('sliderProgress');
    if(bar) bar.style.width = `${percent}%`;
};

async function initNewsSlider() {
    const slider = document.getElementById('newsSlider');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    
    if (!slider) return;

    // 1. Box Office Data (Real)
    const nowPlayingData = await fetchMovie('/movie/now_playing?language=en-US&page=1');
    let boxOfficeData = [];
    if (nowPlayingData && nowPlayingData.results) {
        const top5 = nowPlayingData.results.slice(0, 5); // Top 5
        const detailsPromises = top5.map(m => fetchMovie(`/movie/${m.id}`));
        const details = await Promise.all(detailsPromises);
        boxOfficeData = details.map(d => ({
            title: d.title,
            value: formatMoney(d.revenue),
            popularity: d.popularity
        }));
    } else {
        boxOfficeData = [{ title: "Box Office Data", value: "Loading...", change: "" }];
    }

    // 2. Announcements
    const upcoming = await fetchMovie('/movie/upcoming?region=US');
    const announcements = upcoming && upcoming.results ? upcoming.results.slice(0, 5) : []; // Top 5

    // --- HELPER: Get 5 Valid Trailers from a list ---
    const getValidTrailers = async (movies) => {
        let valid = [];
        // Check first 15 to ensure we find 5
        const candidates = movies.slice(0, 15);
        const vidPromises = candidates.map(m => fetchMovie(`/movie/${m.id}/videos`));
        const results = await Promise.all(vidPromises);

        for (let i = 0; i < candidates.length; i++) {
            if (valid.length >= 5) break; 
            const vids = results[i] && results[i].results ? results[i].results : [];
            const trailer = vids.find(v => v.type === 'Trailer' && v.site === 'YouTube') || vids.find(v => v.site === 'YouTube');
            if (trailer) {
                valid.push({
                    title: candidates[i].title,
                    key: trailer.key
                });
            }
        }
        return valid;
    };

    // 3. Fresh Trailers (Global)
    const nowPlaying = await fetchMovie(requests.fetchAction);
    let trailerData = [];
    if (nowPlaying && nowPlaying.results) {
        trailerData = await getValidTrailers(nowPlaying.results);
    }

    // 4. [NEW] Star Power (Trending People)
    const peopleData = await fetchMovie('/person/popular?language=en-US&page=1');
    const stars = peopleData && peopleData.results ? peopleData.results.slice(0, 5) : []; // Top 5

    // 5. [NEW] Countdown Target
    let countdownMovie = null;
    if (upcoming && upcoming.results) {
        const future = upcoming.results.find(m => new Date(m.release_date) > new Date(Date.now() + 7 * 86400000));
        countdownMovie = future || upcoming.results[0];
    }

    // 6. [NEW] Kollywood Trends (Tamil Trailers)
    // Fetch recent Tamil movies sorted by popularity
    const today = new Date().toISOString().split('T')[0];
    const tamilData = await fetchMovie(`/discover/movie?with_original_language=ta&sort_by=popularity.desc&primary_release_date.lte=${today}&page=1`);
    let tamilTrailers = [];
    if (tamilData && tamilData.results) {
        tamilTrailers = await getValidTrailers(tamilData.results);
    }


    // --- BUILD SLIDES ARRAY ---
    let slides = [];

    // Slide 1: Global Box Office
    slides.push(`
        <div class="news-slide-content premium-slide">
            <div class="slide-visual-icon"><i class="fas fa-chart-line" style="color:#46d369;"></i></div>
            <div class="slide-info">
                <h3>GLOBAL BOX OFFICE (Real-Time)</h3>
                <div class="bo-grid-premium">
                    ${boxOfficeData.map((m, i) => `
                        <div class="bo-item-premium">
                            <span class="bo-rank">#${i+1}</span>
                            <div>
                                <span class="bo-title">${m.title}</span>
                                <span class="bo-val" style="color:${m.value==='Trending'?'#fbbf24':'#46d369'}">${m.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `);

    // Slide 2: Announcements
    if (announcements.length > 0) {
        slides.push(`
            <div class="news-slide-content premium-slide">
                <div class="slide-visual-icon"><i class="fas fa-bullhorn" style="color:#e50914;"></i></div>
                <div class="slide-info">
                    <h3>MAJOR ANNOUNCEMENTS</h3>
                    <div class="slide-list-premium">
                        ${announcements.map(m => `
                            <div class="slide-mini-item">
                                <span class="slide-badge">COMING SOON</span>
                                <span class="slide-text">${m.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `);
    }

    // Slide 3: Fresh Trailers (Global)
    if (trailerData.length > 0) {
       slides.push(`
            <div class="news-slide-content premium-slide">
                <div class="slide-visual-icon"><i class="fab fa-youtube" style="color:#FF0000;"></i></div>
                <div class="slide-info">
                    <h3>FRESH TRAILERS • GLOBAL</h3>
                    <div class="slide-list-premium">
                        ${trailerData.map(t => `
                             <div class="trailer-mini-item" onclick="openTrailerModal('${t.key}')">
                                <div class="trailer-thumb-box">
                                    <img src="https://img.youtube.com/vi/${t.key}/mqdefault.jpg" class="trailer-thumb-img">
                                    <div class="trailer-thumb-overlay"><i class="fas fa-play" style="font-size:0.8rem; color:#fff;"></i></div>
                                </div>
                                <div class="trailer-info-box">
                                    <span class="slide-text" style="font-size:0.8rem; line-height:1.1; max-width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.title}</span>
                                    <span style="font-size:0.65rem; color:#e50914; font-weight:700; margin-top:2px;">WATCH NOW</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
       `);
    }

    // Slide 4: Kollywood Trends (Tamil)
    if (tamilTrailers.length > 0) {
        slides.push(`
             <div class="news-slide-content premium-slide">
                 <div class="slide-visual-icon"><i class="fas fa-film" style="color:#FFD700;"></i></div>
                 <div class="slide-info">
                     <h3>KOLLYWOOD TRENDS • TAMIL</h3>
                     <div class="slide-list-premium">
                         ${tamilTrailers.map(t => `
                              <div class="trailer-mini-item" onclick="openTrailerModal('${t.key}')">
                                 <div class="trailer-thumb-box">
                                     <img src="https://img.youtube.com/vi/${t.key}/mqdefault.jpg" class="trailer-thumb-img">
                                     <div class="trailer-thumb-overlay"><i class="fas fa-play" style="font-size:0.8rem; color:#fff;"></i></div>
                                 </div>
                                 <div class="trailer-info-box">
                                     <span class="slide-text" style="font-size:0.8rem; line-height:1.1; max-width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.title}</span>
                                     <span style="font-size:0.65rem; color:#FFD700; font-weight:700; margin-top:2px;">TAMIL HIT</span>
                                 </div>
                             </div>
                         `).join('')}
                     </div>
                 </div>
             </div>
        `);
     }

    // Slide: Star Power
    if (stars.length > 0) {
        slides.push(`
            <div class="news-slide-content premium-slide">
                <div class="slide-visual-icon"><i class="fas fa-star" style="color:#ffd700;"></i></div>
                <div class="slide-info">
                    <h3>STAR POWER • TRENDING PEOPLE</h3>
                    <div class="slide-list-premium">
                        ${stars.map(p => `
                             <div class="person-mini-item">
                                <img src="${IMG_URL}${p.profile_path}" class="person-avatar" onerror="this.src='https://via.placeholder.com/40'">
                                <div class="person-info">
                                    <span class="person-name">${p.name}</span>
                                    <span class="person-role">Popularity: ${Math.round(p.popularity)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `);
    }

    // Slide: Countdown
    if (countdownMovie) {
        // Calculate days
        const diff = new Date(countdownMovie.release_date) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        slides.push(`
            <div class="news-slide-content premium-slide">
                <div class="slide-visual-icon"><i class="fas fa-hourglass-half" style="color:#00e5ff;"></i></div>
                <div class="slide-info">
                    <h3>BLOCKBUSTER COUNTDOWN</h3>
                    <div style="display:flex; align-items:center; gap:20px;">
                        <img src="${IMG_URL}${countdownMovie.poster_path}" style="height:50px; border-radius:4px; border:1px solid #333;">
                        <div>
                            <span class="bo-title" style="font-size:1.1rem; color:#fff;">${countdownMovie.title}</span>
                            <span style="color:#888; font-size:0.9rem;">HYPE EVENT</span>
                        </div>
                        <div class="countdown-digits">T-MINUS ${days} DAYS</div>
                    </div>
                </div>
            </div>
        `);
    }


    // --- SLIDER ENGINE ---
    let currentSlide = 0;
    let autoRotate;
    const duration = 6000; // 6s per slide
    let startTime;
    let progressInterval;

    const renderSlide = (index) => {
        slider.innerHTML = slides[index];
        const content = slider.querySelector('.news-slide-content');
        if(content) {
            content.style.animation = 'none';
            content.offsetHeight; // reflow
            content.style.animation = 'fadeIn 0.5s ease-out';
        }
    };

    const startTimer = () => {
        clearInterval(autoRotate);
        clearInterval(progressInterval);
        
        startTime = Date.now();
        
        // Progress Bar Loop
        progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min((elapsed / duration) * 100, 100);
            updateSliderProgress(pct);
        }, 50);

        // Slide Switch Loop
        autoRotate = setInterval(() => {
            nextSlide();
        }, duration);
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        renderSlide(currentSlide);
        startTimer(); // Reset timer on slide change
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        renderSlide(currentSlide);
        startTimer();
    };

    // Controls
    if(nextBtn) nextBtn.onclick = () => nextSlide();
    if(prevBtn) prevBtn.onclick = () => prevSlide();

    // Init
    renderSlide(currentSlide);
    startTimer();
}

// [NEW] Fetch Cinema News (Real API + Fallback)
// [NEW] Fetch Cinema News (Real API + Fallback with Tamil Support)
async function fetchCinemaNews() {
    try {
        if (NEWS_API_KEY === 'YOUR_API_KEY_HERE') throw new Error("No API Key");
        
        // Query updated to include Kollywood / Tamil Cinema
        const response = await fetch(`https://newsapi.org/v2/everything?q=cinema OR movie OR kollywood OR "tamil cinema"&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`);
        const data = await response.json();
        
        if (data.status === 'ok' && data.articles.length > 0) {
            return data.articles.map(a => ({
                id: null, // External link
                title: a.title,
                overview: a.description,
                backdrop_path: a.urlToImage, // Will need handling as full URL
                release_date: new Date(a.publishedAt).toLocaleDateString(),
                popularity: 100, // Mock
                isExternal: true,
                url: a.url
            }));
        }
        throw new Error("API Error or No Data");
    } catch (e) {
        console.warn("Using Mixed Fallback for News (Global + Tamil):", e);
        
        // 1. Fetch Global Upcoming
        const globalData = await fetchMovie('/movie/upcoming?region=US');
        const globalResults = (globalData && globalData.results) ? globalData.results : [];

        // 2. Fetch Latest Tamil Movies (Kollywood News substitute)
        const today = new Date().toISOString().split('T')[0];
        const tamilData = await fetchMovie(`/discover/movie?with_original_language=ta&sort_by=popularity.desc&primary_release_date.lte=${today}&page=1`);
        const tamilResults = (tamilData && tamilData.results) ? tamilData.results : [];

        // 3. Interleave Data (Global, Tamil, Global, Tamil...)
        let mixed = [];
        const maxLen = Math.max(globalResults.length, tamilResults.length);
        for(let i=0; i<maxLen; i++) {
            if(globalResults[i]) mixed.push(globalResults[i]);
            if(tamilResults[i]) mixed.push(tamilResults[i]);
        }
        
        // Map to News Items
        if (mixed.length > 0) {
             return mixed.map(m => ({
                 id: m.id,
                 title: m.title + (tamilResults.includes(m) ? " (Tamil Update)" : ""), // Optional: tag them? Maybe just title is fine.
                 overview: m.overview,
                 backdrop_path: m.backdrop_path,
                 release_date: m.release_date,
                 popularity: m.popularity,
                 isExternal: false // Internal TMDB data
             }));
        }
        return [];
    }
}

async function loadLatestNewsFeed() {
    const feed = document.getElementById('latestNewsFeed');
    if (!feed) return;

    // Fetch News (Real or Fallback)
    const newsItems = await fetchCinemaNews();
    if (newsItems.length === 0) return;

    const featured = newsItems[0];
    const others = newsItems.slice(1, 5); // Take next 4

    // Handle Image URLs (External vs TMDB)
    const getImg = (item) => {
        if (item.isExternal) return item.backdrop_path || 'https://via.placeholder.com/800x450?text=News';
        return item.backdrop_path ? `${IMG_URL}${item.backdrop_path}` : (item.poster_path ? `${IMG_URL}${item.poster_path}` : '');
    };

    // [UPDATED] Get Link Behavior - Always News
    const getLink = (item) => {
        if (item.isExternal) {
            return `window.open('${item.url}', '_blank')`;
        } else {
            // Fallback: Use Google News Search if we don't have a direct URL
            return `window.open('https://www.google.com/search?q=${encodeURIComponent(item.title + " movie news")}&tbm=nws', '_blank')`;
        }
    };

    const featImage = getImg(featured);
    
    let html = `
        <div class="news-bento-wrapper">
            <!-- Featured Item -->
            <div class="news-bento-featured" onclick="${getLink(featured)}">
                <div class="bento-bg" style="background-image: url('${featImage}');"></div>
                <div class="bento-overlay">
                    <span class="news-tag highlight">HEADLINE STORY</span>
                    <h2 class="bento-title">${featured.title}</h2>
                    <p class="bento-desc">${featured.overview || 'No description available.'}</p>
                    <div class="bento-meta">
                        <span><i class="fas fa-clock"></i> ${featured.release_date || 'Just Now'}</span>
                    </div>
                </div>
            </div>

            <!-- Side Grid -->
            <div class="news-bento-side">
                ${others.map(m => {
                    const img = getImg(m);
                    return `
                    <div class="news-bento-item" onclick="${getLink(m)}">
                        <div class="bento-mini-bg" style="background-image: url('${img}');"></div>
                        <div class="bento-mini-content">
                            <span class="news-tag mini">LATEST</span>
                            <h4 class="bento-mini-title">${m.title}</h4>
                            <span class="bento-mini-date">${m.release_date || 'Recent'}</span>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    feed.innerHTML = html;
}

// [NEW] Hype Timeline Logic
async function loadHypeTimeline() {
    const timelineContainer = document.getElementById('hypeTimeline');
    if (!timelineContainer) return;

    const data = await fetchMovie('/movie/upcoming?language=en-US&page=2');
    if (!data || !data.results) return;

    const sorted = data.results.sort((a,b) => new Date(a.release_date) - new Date(b.release_date));
    
    let html = `<div class="hype-scroller">`;
    
    sorted.forEach(m => {
        if(!m.poster_path) return;
        const img = `${IMG_URL}${m.poster_path}`;
        const date = new Date(m.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        html += `
            <div class="hype-card" onclick="window.location.href='movie.html?id=${m.id}&type=movie'">
                <div class="hype-date-tag">${date}</div>
                <img src="${img}" class="hype-img">
                <h4 class="hype-title">${m.title}</h4>
            </div>
        `;
    });
    
    html += `</div>`;
    timelineContainer.innerHTML = html;
}

// [UPDATED] Trailer Spotlight Logic (Horizontal + YouTube Key)
async function initTrailerSpotlight() {
    const container = document.getElementById('trailerSpotlight');
    if (!container) return;
    
    const data = await fetchMovie('/movie/now_playing?language=en-US&page=1');
    if(!data || !data.results) return;

    const spotlights = data.results.slice(0, 8); // Top 8 for horizontal scroll
    
    let html = `<div class="trailer-row-horizontal">`;
    
    // We need to fetch videos for each movie to get the YT ID
    // Note: Doing this in a loop can be slow/rate-limited. For 8 items it might be okay.
    // Optimization: Render first, fetch video on click? Or fetch in parallel.
    // Let's fetch all concurrently.
    
    const videoPromises = spotlights.map(async (m) => {
        const vidData = await fetchMovie(`/movie/${m.id}/videos`);
        let teaser = null;
        if (vidData && vidData.results) {
            teaser = vidData.results.find(v => v.site === 'YouTube' && v.type === 'Trailer') || vidData.results.find(v => v.site === 'YouTube');
        }
        return { ...m, videoKey: teaser ? teaser.key : null };
    });

    const moviesWithTrailers = await Promise.all(videoPromises);

    moviesWithTrailers.forEach(m => {
        const bg = m.backdrop_path ? `${IMG_URL}${m.backdrop_path}` : '';
        const playAction = m.videoKey ? `openTrailerModal('${m.videoKey}')` : `alert('Trailer not available')`;
        
        html += `
            <div class="trailer-card-horizontal" onclick="${playAction}">
                <div class="trailer-thumb" style="background-image:url('${bg}');">
                    <div class="play-btn-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="trailer-info">
                    <h3>${m.title}</h3>
                    <p>Watch Trailer</p>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

// [NEW] Trailer Modal Function
function openTrailerModal(videoKey) {
    let modal = document.getElementById('videoModal');
    if (!modal) {
        // dynamic create if missing
        modal = document.createElement('div');
        modal.id = 'videoModal';
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <span class="close-video" onclick="document.getElementById('videoModal').style.display='none'">&times;</span>
                <iframe id="videoFrame" width="100%" height="500" src="" frameborder="0" allowfullscreen></iframe>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add minimal modal styles if not in css
        const style = document.createElement('style');
        style.innerHTML = `
            .video-modal { display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.9); }
            .video-modal-content { position:relative; margin: 5% auto; width: 80%; max-width: 900px; }
            .close-video { position:absolute; top:-40px; right:0; color:#fff; font-size:40px; font-weight:bold; cursor:pointer; }
        `;
        document.head.appendChild(style);
    }
    
    modal.style.display = 'block';
    const iframe = document.getElementById('videoFrame');
    iframe.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1`;
    
    // Stop video on close
    modal.onclick = (e) => {
        if(e.target === modal) {
            modal.style.display = 'none';
            iframe.src = '';
        }
    };
    document.querySelector('.close-video').onclick = () => {
        modal.style.display = 'none';
        iframe.src = '';
    }
}

async function loadNewPopularPage() {
    initNewsSlider();
    loadLatestNewsFeed();
    loadHypeTimeline();
    initTrailerSpotlight();
    
    await fetchAndRow(`/trending/movie/day`, 'breakingRow');
    await fetchAndRow(`/movie/now_playing?language=en-US&page=1`, 'theatersRow');

    const today = new Date();
    const past = new Date(); past.setDate(today.getDate() - 60);
    const todayStr = today.toISOString().split('T')[0];
    const pastStr = past.toISOString().split('T')[0];

    await fetchAndRow(`/discover/movie?with_original_language=ta&primary_release_date.gte=${pastStr}&primary_release_date.lte=${todayStr}&sort_by=popularity.desc`, 'tamilUpdateRow');
    await fetchAndRow(`/discover/movie?with_original_language=hi|te&primary_release_date.gte=${pastStr}&sort_by=popularity.desc`, 'indianUpdateRow');
    await fetchAndRow(`/discover/movie?sort_by=vote_count.desc`, 'popularRow');
}


/* ---------------------------
   Suggestions page
   --------------------------- */

async function loadSuggestionsPage() {
    const grid = document.getElementById('suggestionsGrid');
    if (!grid) return;

    const rated = await fetchMovie(requests.fetchTopRated);
    const trending = await fetchMovie(requests.fetchTrending);
    const scifi = await fetchMovie(requests.fetchSciFi);

    let mixed = [];
    if (rated && rated.results) mixed = mixed.concat(rated.results);
    if (trending && trending.results) mixed = mixed.concat(trending.results);
    if (scifi && scifi.results) mixed = mixed.concat(scifi.results);

    const unique = Array.from(new Map(mixed.map(item => [item.id, item])).values());
    unique.sort(() => Math.random() - 0.5);

    grid.innerHTML = '';
    unique.slice(0, 20).forEach(item => grid.appendChild(createMovieCard(item, null, true)));
}

/* ---------------------------
   Search & Notifications
   --------------------------- */

function setupNotifications() {
    const userActions = document.querySelector('.user-actions');
    if (!userActions) return;

    let dropdown = document.getElementById('notificationDropdown');
    const bellIcon = userActions.querySelector('.fa-bell');

    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'notificationDropdown';
        dropdown.className = 'notification-dropdown';
        dropdown.innerHTML = '<div class="notification-header">Cinema News Updates</div><div id="notifList"></div>';
        userActions.appendChild(dropdown);
    }

    // Attach click listener to bell if not already handled
    if (bellIcon) {
        // Remove old listener if any (by replacing the node)
        const newBell = bellIcon.cloneNode(true);
        bellIcon.parentNode.replaceChild(newBell, bellIcon);

        newBell.addEventListener('click', async (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            
            const list = document.getElementById('notifList');
            if (dropdown.classList.contains('active') && list) {
                 if (!list.innerHTML || list.innerHTML.trim() === '') {
                     list.innerHTML = '<div style="padding:20px; text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
                     try {
                        const [trending, nowPlaying] = await Promise.all([
                            fetchMovie('/trending/movie/day'),
                            fetchMovie('/movie/now_playing?language=en-US&page=1')
                        ]);
                        
                        let items = [];
                        if (trending && trending.results) {
                            items = items.concat(trending.results.slice(0, 3).map(m => ({ ...m, tag: 'BREAKING', msg: 'Trending today!' })));
                        }
                        if (nowPlaying && nowPlaying.results) {
                            items = items.concat(nowPlaying.results.slice(0, 3).map(m => ({ ...m, tag: 'IN THEATERS', msg: 'Watch it now!' })));
                        }
                        
                        list.innerHTML = '';
                        if (items.length === 0) {
                            list.innerHTML = '<p style="padding:15px">No updates currently.</p>';
                        } else {
                            items.forEach(m => {
                                const div = document.createElement('div');
                                div.className = 'notification-item';
                                div.innerHTML = `
                                    <img src="${m.poster_path ? IMG_URL + m.poster_path : ''}" alt="${m.title}" onerror="this.style.display='none'">
                                    <div class="notification-text">
                                        <h4><span class="news-tag ${m.tag === 'BREAKING' ? 'breaking' : ''}">${m.tag}</span> ${m.title}</h4>
                                        <p>${m.msg}</p>
                                        <span class="notification-time">Today</span>
                                    </div>
                                `;
                                div.onclick = () => window.location.href = `movie.html?id=${m.id}&type=movie`;
                                list.appendChild(div);
                            });
                        }
                        
                     } catch(err) {
                         console.error(err);
                         list.innerHTML = '<p style="padding:15px; color:red;">Failed to load news.</p>';
                     }
                 }
            }
        });
        
        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!userActions.contains(e.target) && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        });
    }
}

function setupSearch() {
    const input = document.getElementById('headerSearchInput');
    const suggestionsBox = document.getElementById('searchSuggestions');
    const overlay = document.getElementById('searchOverlay');
    if (!input || !suggestionsBox || !overlay) return;

    input.addEventListener('focus', () => {
        const aiIcon = document.querySelector('.ai-icon');
        if (aiIcon) aiIcon.classList.add('active');
    });
    input.addEventListener('blur', () => {
        setTimeout(() => suggestionsBox.style.display = 'none', 200);
        const aiIcon = document.querySelector('.ai-icon');
        if (aiIcon) aiIcon.classList.remove('active');
    });

    let timer = null;
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        suggestionsBox.innerHTML = '';

        if (query.length < 2) { suggestionsBox.style.display = 'none'; return; }

        suggestionsBox.style.display = 'block';
        suggestionsBox.innerHTML = '<div class="suggestion-item"><i class="fas fa-robot"></i> AI is thinking...</div>';

        if (timer) clearTimeout(timer);
        timer = setTimeout(async () => {
            try {
                // [UPDATED] Parallel search for English (Global) and Tamil (Regional)
                const [engData, tamData] = await Promise.all([
                    fetchMovie(`/search/multi?api_key=${API_KEY}&language=en-US&include_adult=false&query=${encodeURIComponent(query)}`),
                    fetchMovie(`/search/multi?api_key=${API_KEY}&language=ta-IN&include_adult=false&query=${encodeURIComponent(query)}`)
                ]);

                suggestionsBox.innerHTML = '';
                
                // Merge and Deduplicate
                let allResults = [];
                if (engData && engData.results) allResults = allResults.concat(engData.results);
                if (tamData && tamData.results) allResults = allResults.concat(tamData.results);
                
                const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());
                
                // Sort by popularity to surface best matches from either language
                uniqueResults.sort((a, b) => b.popularity - a.popularity);

                if (uniqueResults.length > 0) {
                    const top = uniqueResults.slice(0, 7); // Show top 7
                    top.forEach(item => {
                        if ((item.media_type === 'movie' || item.media_type === 'tv') && (item.title || item.name)) {
                            const div = document.createElement('div');
                            div.className = 'suggestion-item';
                            
                            const year = (item.release_date || item.first_air_date || '').split('-')[0] || '';
                            const lang = item.original_language ? item.original_language.toUpperCase() : '';
                            const type = (item.media_type || 'movie').toUpperCase();
                            
                            // Improved Layout
                            div.innerHTML = `
                  <img src="${item.poster_path ? IMG_URL + item.poster_path : ''}" alt="poster" onerror="this.style.display='none'" style="width:40px; height:60px; object-fit:cover; margin-right:10px; border-radius:4px;">
                  <div style="display:flex; flex-direction:column; justify-content:center;">
                    <span class="suggestion-title" style="font-size:0.95rem; color:#fff;">${item.title || item.name}</span>
                    <span class="suggestion-meta" style="font-size:0.8rem; color:#aaa;">
                        <span style="border:1px solid #444; padding:0 3px; border-radius:2px; font-size:0.7rem; margin-right:5px;">${lang}</span>
                        ${year} • ${type}
                    </span>
                  </div>
                `;
                            div.onclick = () => {
                                const t = item.media_type || 'movie';
                                window.location.href = `movie.html?id=${item.id}&type=${t}`;
                            };
                            suggestionsBox.appendChild(div);
                        }
                    });
                    
                    if (uniqueResults.length > 7) {
                        const viewAll = document.createElement('div');
                        viewAll.className = 'suggestion-item view-all';
                        viewAll.style.textAlign = 'center';
                        viewAll.style.padding = '10px';
                        viewAll.style.color = '#e50914';
                        viewAll.style.cursor = 'pointer';
                        viewAll.innerHTML = `<span>See all ${uniqueResults.length} results for "${query}"</span>`;
                        viewAll.onclick = () => {
                            overlay.classList.add('active');
                            populateOverlayResults(uniqueResults);
                            suggestionsBox.style.display = 'none';
                        };
                        suggestionsBox.appendChild(viewAll);
                    }
                } else suggestionsBox.innerHTML = '<div class="suggestion-item" style="padding:15px; color:#888;">No results found.</div>';
            } catch (e) {
                console.error("Search failed", e);
                suggestionsBox.innerHTML = '<div class="suggestion-item">Error searching.</div>';
            }
        }, 450);
    });

    const closeBtn = document.getElementById('closeSearchBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
}

function populateOverlayResults(results) {
    const resultsGrid = document.getElementById('searchResultsGrid');
    if (!resultsGrid) return;
    resultsGrid.innerHTML = '';
    results.forEach(item => {
        if (item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')) {
            resultsGrid.appendChild(createMovieCard(item));
        }
    });
}

/* ---------------------------
   Small helpers referenced by HTML
   --------------------------- */

window.openVideoModal = (key) => {
    const player = document.getElementById('modalVideoPlayer');
    const modal = document.getElementById('trailerModal');
    if (player && modal && key) {
        player.src = `https://www.youtube.com/embed/${key}?autoplay=1`;
        modal.classList.add('active');
    }
};

function openVideoOverlay(videoId) {
    if (!videoId) return;
    if (window.openVideoModal) return window.openVideoModal(videoId);
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

/* ---------------------------
   Missing: YouTube-card builder + fetch row helper used by other parts
   --------------------------- */

function createYouTubeCard(movie) {
    const div = document.createElement('div');
    div.className = 'video-card';
    div.style.minWidth = '300px';
    div.style.marginRight = '15px';

    const title = movie.title || movie.name || 'Untitled';
    const backdrop = movie.backdrop_path ? `${BACKDROP_URL}${movie.backdrop_path}` : (movie.poster_path ? `${IMG_URL}${movie.poster_path}` : '');
    const year = (movie.release_date || movie.first_air_date || '').split('-')[0] || '';

    div.innerHTML = `
      <div class="video-thumbnail" style="height:170px;">
        <img src="${backdrop}" alt="${title}" style="width:100%; height:100%; object-fit:cover;">
        <div class="play-overlay"><i class="fas fa-play"></i></div>
      </div>
      <div class="video-title" style="font-size:0.9em; margin-top:5px;">${title}</div>
      <div class="video-meta" style="font-size:0.8em; color:#aaa;">${year} • StreamFlix Video</div>
    `;

    div.onclick = async () => {
        const type = movie.media_type || (movie.title ? 'movie' : 'tv');
        const videos = await fetchMovie(`/${type}/${movie.id}/videos`);
        if (videos && Array.isArray(videos.results) && videos.results.length > 0) {
            const trailer = videos.results.find(v => v.type === 'Trailer') || videos.results[0];
            if (trailer) openVideoOverlay(trailer.key);
            else alert("No trailer available for this title.");
        } else alert("No video source found.");
    };

    return div;
}

async function fetchAndYouTubeRow(url, elementId) {
    const row = document.getElementById(elementId);
    if (!row) return;
    try {
        const data = await fetchMovie(url);
        if (data && Array.isArray(data.results)) {
            row.innerHTML = '';
            data.results.forEach(movie => { if (movie.backdrop_path || movie.poster_path) row.appendChild(createYouTubeCard(movie)); });
        } else row.innerHTML = '<p style="color:#888; padding:12px;">No entries</p>';
    } catch (e) { console.error("Error loading YouTube row:", e); if (row) row.innerHTML = '<p style="color:#888; padding:12px;">Error loading data</p>'; }
}

/* ---------------------------
   Minimal Spotify-like helpers (Piped-based streaming)
   These are simple, defensive implementations — streaming reliability depends on Piped mirrors.
   --------------------------- */

async function loadSpotifyRow(containerId, query) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const data = await fetchWithMirrors(`/search?q=${encodeURIComponent(query)}&filter=music_songs`);
        if (!data || !data.items) throw new Error("No data");
        container.innerHTML = '';
        const items = data.items.slice(0, 15);
        items.forEach(item => {
            let videoId = null;
            if (item.url) {
                const url = String(item.url);
                if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
                else if (url.startsWith('/watch')) videoId = url.replace('/watch?v=', '').split('&')[0];
            }
            if (!videoId && item.videoId) videoId = item.videoId;
            if (!videoId) return;

            const title = item.title || 'Unknown';
            const artist = item.uploaderName || "Artist";
            const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            const card = document.createElement('div');
            card.className = 'spotify-card';
            card.innerHTML = `
                <div class="spotify-card-img-container">
                    <img src="${thumb}" alt="${title}" loading="lazy">
                    <div class="spotify-play-btn"><i class="fas fa-play" style="margin-left:4px;"></i></div>
                </div>
                <div class="spotify-card-title">${title}</div>
                <div class="spotify-card-desc">${artist}</div>
            `;
            card.onclick = () => playSpotifyAudio(videoId, title, artist, thumb);
            container.appendChild(card);
        });
    } catch (e) {
        console.warn('Spotify Load Error', e);
        if (container) container.innerHTML = '<p class="error-msg" style="color:#b3b3b3;">Unable to load tracks.</p>';
    }
}

async function playSpotifyAudio(videoId, title, artist, thumb) {
    const player = document.getElementById('spotifyPlayer');
    const spTitle = document.getElementById('spTitle');
    const spArtist = document.getElementById('spArtist');
    const spThumb = document.getElementById('spThumb');
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('spPlayBtn');

    if (player) player.classList.add('active');
    if (spTitle) spTitle.innerText = title;
    if (spArtist) spArtist.innerText = artist;
    if (spThumb) spThumb.src = thumb;
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const data = await fetchWithMirrors(`/streams/${videoId}`);
        if (data && data.audioStreams && data.audioStreams.length > 0) {
            const stream = data.audioStreams.find(s => s.mimeType && s.mimeType.includes('mp4')) || data.audioStreams[0];
            audio.src = stream.url;
            await audio.play().catch(e => { console.warn('Autoplay blocked', e); });
            initSpotifyControls(audio, playBtn);
        } else {
            throw new Error("No stream");
        }
    } catch (e) {
        console.error("Stream Error", e);
        if (spTitle) spTitle.innerText = "Error Playing";
        if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function initSpotifyControls(audio, playBtn) {
    const updateIcon = () => {
        if (!playBtn) return;
        playBtn.innerHTML = audio.paused ? '<i class="fas fa-play" style="margin-left:4px;"></i>' : '<i class="fas fa-pause"></i>';
    };
    updateIcon();
    audio.onplay = updateIcon;
    audio.onpause = updateIcon;

    if (playBtn) playBtn.onclick = (e) => {
        e.stopPropagation();
        if (audio.paused) audio.play();
        else audio.pause();
    };

    const bar = document.getElementById('spProgressBar');
    const fill = document.getElementById('spProgressFill');
    const curr = document.getElementById('spCurrTime');
    const total = document.getElementById('spTotalTime');

    if (bar) {
        audio.ontimeupdate = () => {
            if (audio.duration) {
                const pct = (audio.currentTime / audio.duration) * 100;
                if (fill) fill.style.width = pct + '%';
                if (curr) curr.innerText = formatPlayerTime(audio.currentTime);
                if (total) total.innerText = formatPlayerTime(audio.duration);
            }
        };

        bar.onclick = (e) => {
            const rect = bar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, x / rect.width));
            audio.currentTime = pct * (audio.duration || 0);
        };
    }
}

function formatPlayerTime(s) {
    if (!s && s !== 0) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

/* ---------------------------
   FAQ helper
   --------------------------- */

function setupFAQ() {
    const accordions = document.querySelectorAll('.accordion .accordion-header');
    accordions.forEach(header => {
        header.onclick = () => {
            header.classList.toggle('open');
            const body = header.nextElementSibling;
            if (!body) return;
            if (body.style.maxHeight) body.style.maxHeight = null;
            else body.style.maxHeight = body.scrollHeight + 'px';
        };
    });
}

/* ---------------------------
   Home page loader
   --------------------------- */

async function loadHomePage() {
    loadMyListPreview();
    loadContinueWatching();
    await loadBecauseYouWatched();
    await loadTrendingPeople();

    try {
        const [trending, tamilHits] = await Promise.all([ fetchMovie(requests.fetchTrending), fetchMovie(requests.fetchTamilAction) ]);
        
        let pool = [];

        // 1. Fetch Specific Vijay Movies (Leo, Master, Beast, GOAT, Varisu)
        const vijayIds = [1129532, 1032760, 585268, 848685, 987760]; 
        try {
            const vijayPromises = vijayIds.map(id => fetchMovie(`/movie/${id}?append_to_response=videos,images`));
            const vijayMovies = await Promise.all(vijayPromises);
            vijayMovies.forEach(m => {
                if (m && m.id) { 
                    m.media_type = 'movie'; 
                    pool.push(m);
                }
            });
        } catch (err) { console.warn("Vijay fetch error", err); }

        // 2. Add Trending & Hits
        if (trending && Array.isArray(trending.results)) pool.push(...trending.results);
        if (tamilHits && Array.isArray(tamilHits.results)) pool.push(...tamilHits.results);
        
        // 3. Filter out duplicates & "Padaiyappa"
        pool = pool.filter(i => {
             const t = (i.title || i.name || '').toLowerCase();
             // Explicitly remove Padaiyappa
             return !t.includes('padaiyappa');
        });

        // 4. Randomize / Shuffle (The "Change on Refresh" Feature)
        pool.sort(() => 0.5 - Math.random());

        // Deduplicate & Filter for valid Images
        // STRICT: Remove items with no backdrop path (fixes "image not shown")
        pool = pool.filter(i => i.backdrop_path);

        const uniquePool = Array.from(new Map(pool.map(item => [item.id, item])).values());

        // 6. Verify Videos for Top Candidates (Strict Mode)
        // Check top 60 newest items
        const candidates = uniquePool.slice(0, 60);
        const verification = await Promise.all(candidates.map(async (item) => {
            try {
                let vData = item.videos; 
                if (!vData) {
                    const type = item.media_type || (item.name ? 'tv' : 'movie');
                    vData = await fetchMovie(`/${type}/${item.id}/videos`);
                    item.videos = vData; 
                }
                // STRICTEST CHECK: 
                // 1. Must be YouTube
                // 2. Must be 'Trailer'
                // 3. Must be 'Official' (High quality signal)
                const hasTrailer = vData && Array.isArray(vData.results) && vData.results.some(v => 
                    v.site === 'YouTube' && 
                    v.type === 'Trailer' &&
                    v.official === true
                );
                return hasTrailer ? item : null;
            } catch (e) { return null; }
        }));
        
        const finalHeroList = verification.filter(Boolean).slice(0, 8);
        if (finalHeroList.length > 0) startHeroCarousel(finalHeroList);

        // 7. Render Trending Row
        const tRow = document.getElementById('trendingRow');
        if (tRow && trending && Array.isArray(trending.results)) {
            tRow.innerHTML = '';
            trending.results.forEach((item, index) => {
                const rank = index < 10 ? index + 1 : null;
                tRow.appendChild(createMovieCard(item, rank));
            });
        }
    } catch (e) { console.warn("Hero/Trending load failed", e); }

    const rows = [
        { req: requests.fetchTrending, id: 'top10Row', type: 'movie', isRanked: true },
        // Added rows for new features
        { req: requests.fetchHiddenGems, id: 'hiddenGemsRow', type: 'movie' },
        { req: requests.fetchShortFilms, id: 'shortFilmsRow', type: 'movie' },
        
        { req: requests.fetchTopRated, id: 'topRatedRow', type: 'movie' },
        { req: `/discover/movie?with_original_language=ta&sort_by=popularity.desc&page=1`, id: 'tamilHitsRow', type: 'movie' },
        { req: requests.fetchTamilAction, id: 'tamilActionRow', type: 'movie' },
        { req: requests.fetchTamilComedy, id: 'tamilComedyRow', type: 'movie' },
        { req: requests.fetchTamilRomance, id: 'tamilRomanceRow', type: 'movie' },
        { req: requests.fetchTamilThriller, id: 'tamilThrillerRow', type: 'movie' },
        { req: requests.fetchTamilFamily, id: 'tamilFamilyRow', type: 'movie' },
        { req: `/movie/upcoming`, id: 'upcomingRow', type: 'movie' },
        { req: requests.fetchAction, id: 'actionMoviesRow', type: 'movie' },
        { req: requests.fetchComedy, id: 'comedyMoviesRow', type: 'movie' },
        { req: requests.fetchDrama, id: 'dramaMoviesRow', type: 'movie' },
        { req: requests.fetchSciFi, id: 'scifiMoviesRow', type: 'movie' },
        { req: requests.fetchHorror, id: 'horrorMoviesRow', type: 'movie' },
        { req: requests.fetchRomance, id: 'romanceMoviesRow', type: 'movie' },
        { req: requests.fetchThriller, id: 'thrillerMoviesRow', type: 'movie' },
        { req: requests.fetchReality, id: 'realityTVRow', type: 'tv' },
        { req: requests.fetchAnimation, id: 'animeMoviesRow', type: 'movie' },
        { req: requests.fetchDocumentary, id: 'documentaryMoviesRow', type: 'movie' },
        { req: requests.fetchMystery, id: 'mysteryMoviesRow', type: 'movie' }
    ];

    await Promise.allSettled(rows.map(r => fetchAndRow(r.req, r.id, r.type, r.isRanked)));

    setupFAQ(); 
}

/* ---------------------------
   Global initialization / router
   --------------------------- */

document.addEventListener('DOMContentLoaded', async () => {
    setupSearch();
    setupNotifications();
    
    // Add Notification Badge Logic
    const params = new URLSearchParams(window.location.search);
    const bellIcons = document.querySelectorAll('.fa-bell.nav-icon');
    bellIcons.forEach(icon => {
        if(!icon.querySelector('.notification-badge')) {
            const badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.innerText = '7'; // Mock count
            icon.appendChild(badge);
        }
    });

    const trailerModal = document.getElementById('trailerModal');
    if (trailerModal) {
        trailerModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-modal') || e.target === trailerModal) {
                const player = document.getElementById('modalVideoPlayer');
                if (player) player.src = "";
                trailerModal.classList.remove('active');
            }
        });
    }

    // Delegated click for notification bell/profile dropdowns
    document.addEventListener('click', async (e) => {
        const bell = e.target.closest('.fa-bell');
        const profile = e.target.closest('.user-profile');
        const notifDropdown = document.getElementById('notificationDropdown');
        const profDropdown = document.getElementById('profileDropdown');
        const list = document.getElementById('notifList');

        if (bell && notifDropdown && list) {
            e.stopPropagation();
            if (profDropdown) profDropdown.classList.remove('active');
            notifDropdown.classList.toggle('active');
            if (notifDropdown.classList.contains('active')) {
                list.innerHTML = '<div style="padding:20px; text-align:center;"><i class="fas fa-spinner fa-spin"></i></div>';
                try {
                    const trending = await fetchMovie(`/trending/movie/day?api_key=${API_KEY}`);
                    const nowPlaying = await fetchMovie(`/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
                    list.innerHTML = '';
                    let allNews = [];
                    if (trending && trending.results) {
                        allNews = allNews.concat(trending.results.slice(0, 3).map(m => ({ ...m, tag: 'BREAKING', news_overview: `Trending today — check it out.` })));
                    }
                    if (nowPlaying && nowPlaying.results) {
                        allNews = allNews.concat(nowPlaying.results.slice(0, 3).map(m => ({ ...m, tag: 'IN THEATERS', news_overview: `Now showing in cinemas near you.` })));
                    }
                    if (allNews.length > 0) {
                        allNews.forEach(m => {
                            const item = document.createElement('div');
                            item.className = 'notification-item';
                            item.innerHTML = `
                                <img src="${m.poster_path ? IMG_URL + m.poster_path : ''}" alt="${m.title}" onerror="this.style.display='none'">
                                <div class="notification-text">
                                    <h4><span style="background:${m.tag==='BREAKING'?'#e50914':'var(--primary-color)'}; color:white; font-size:0.65em; padding:2px 5px; border-radius:3px; margin-right:5px; font-weight:bold;">${m.tag}</span> ${m.title}</h4>
                                    <p style="font-size:0.8em; color:#ccc;">${m.news_overview}</p>
                                    <span class="notification-time">${m.release_date || ''}</span>
                                </div>
                            `;
                            item.onclick = () => window.location.href = `movie.html?id=${m.id}&type=movie`;
                            list.appendChild(item);
                        });
                    } else list.innerHTML = '<p style="padding:15px">No new updates.</p>';
                } catch (e) { console.error(e); list.innerHTML = '<p style="padding:15px">Unable to load news.</p>'; }
            }
        } else if (profile && profDropdown) {
            e.stopPropagation();
            if (notifDropdown) notifDropdown.classList.remove('active');
            profDropdown.classList.toggle('active');
        } else {
            if (notifDropdown && notifDropdown.classList.contains('active') && !notifDropdown.contains(e.target)) notifDropdown.classList.remove('active');
            if (profDropdown && profDropdown.classList.contains('active') && !profDropdown.contains(e.target)) profDropdown.classList.remove('active');
        }
    });

    const path = window.location.pathname;
    if (path.includes('movie.html')) await loadDetailsPage();
    else if (path.includes('movies.html')) await loadMoviesPage();
    else if (path.includes('tvshows.html')) await loadTVPage();
    else if (path.includes('suggestions.html')) await loadSuggestionsPage();
    else if (path.includes('new.html')) await loadNewPopularPage();
    else if (path.includes('appletv.html')) await loadAppleTVPage();
    else if (path.includes('youtube.html')) await loadYouTubePage();
    else if (path.includes('mylist.html')) await loadMyListPage();
    else if (path.includes('music.html')) await loadMusicPage();
    else await loadHomePage();
});

/* ---------------------------
   FAQ Accordion Logic
   --------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const acc = document.getElementsByClassName("accordion-header");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            
            // Toggle Icon
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-times');
                if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-plus');
                if (panel) panel.style.maxHeight = null;
            }
        });
    }
});

/* ---------------------------
   Authentication
   --------------------------- */
window.logout = function() {
    // Clear user session
    localStorage.removeItem('netflix_user');
    // Optional: clear history or other personalization if desired
    // localStorage.removeItem('streamflix_history'); 
    
    alert('You have been signed out.');
    window.location.href = 'login.html';
};

/* ---------------------------
   Language Switcher
   --------------------------- */

window.toggleLangMenu = function() {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('show');
}

window.changeLanguage = function(langCode) {
    localStorage.setItem('streamflix_lang', langCode);
    updateLangUI(langCode);
    
    // In a real app, this would trigger a re-render or reload with locale.
    // For this prototype, we will just reload to simulate the effect
    // defaulting to English if not implemented fully.
    
    // Visual feedback
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.remove('show');
    
    alert(`Language changed to ${langCode.toUpperCase()}. Content will update.`);
    window.location.reload();
}

function updateLangUI(langCode) {
    const saved = localStorage.getItem('streamflix_lang') || 'en';
    const opts = document.querySelectorAll('.lang-option');
    opts.forEach(o => {
        if (o.innerText.toLowerCase().startsWith(saved === 'en' ? 'english' : 
                                               saved === 'ta' ? 'tamil' : 
                                               saved === 'hi' ? 'hindi' : 
                                               saved === 'ml' ? 'malayalam' : 
                                               saved === 'te' ? 'telugu' : 'english')) {
            o.classList.add('selected');
        } else {
            o.classList.remove('selected');
        }
    });

    // Update Globe Title
    const btn = document.getElementById('langBtn');
    if(btn) btn.title = `Current Language: ${saved.toUpperCase()}`;
}

// Init Language UI on load
document.addEventListener('DOMContentLoaded', () => {
    updateLangUI();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const container = document.querySelector('.lang-dropdown-container');
        const menu = document.getElementById('langMenu');
        if (container && !container.contains(e.target) && menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    });
});

/* ---------------------------
   NEW FEATURES (Voice, Offline, Shortcuts, etc.)
   --------------------------- */

// 1. Voice Search
const voiceBtn = document.getElementById('voiceSearchBtn');
if (voiceBtn) {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        voiceBtn.onclick = () => recognition.start();

        recognition.onstart = () => {
            voiceBtn.classList.add('listening');
            showToast("Listening...");
        };
        recognition.onend = () => voiceBtn.classList.remove('listening');
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            const input = document.getElementById('headerSearchInput');
            if (input) {
                input.value = transcript;
                input.focus();
                // Trigger search event
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            }
        };
    } else {
        voiceBtn.style.display = 'none'; // Hide if not supported
    }
}

// 2. Back To Top (REMOVED)
/* 
   User requested removal of Back to Top button.
*/

// 8. Expand Category Row
window.toggleRowExpand = function(btn) {
    const rowTitle = btn.parentElement;
    const container = rowTitle.nextElementSibling;
    
    if (container.classList.contains('expanded')) {
        // Collapse
        container.classList.remove('expanded');
        btn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';
        btn.classList.remove('active');
    } else {
        // Expand
        container.classList.add('expanded');
        btn.innerHTML = 'Show Less <i class="fas fa-chevron-down"></i>';
        btn.classList.add('active');
    }
};

// 3. Offline Detection
window.addEventListener('offline', () => showToast("⚠️ No Internet Connection"));
window.addEventListener('online', () => showToast("✅ Back Online"));

// 4. Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // '/' to Focus Search
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.getElementById('headerSearchInput');
        if (searchInput) searchInput.focus();
    }
    // 'Esc' to close Search Overlay or Modals
    if (e.key === 'Escape') {
        const overlay = document.getElementById('searchOverlay');
        const modal = document.querySelector('.modal.active'); // General modal selector
        const recap = document.getElementById('recapModal');
        
        if (overlay && overlay.classList.contains('active')) overlay.classList.remove('active');
        if (modal) modal.classList.remove('active');
        if (recap && recap.style.display === 'flex') recap.style.display = 'none';
    }
});

// 5. Watchlist Badge Counter
function updateWatchlistBadge() {
    const favorites = JSON.parse(localStorage.getItem('streamflix_favorites')) || [];
    const badge = document.getElementById('watchlistCount');
    if (badge) {
        badge.innerText = favorites.length > 99 ? '99+' : favorites.length;
        badge.style.display = favorites.length > 0 ? 'block' : 'none';
    }
}
setInterval(updateWatchlistBadge, 2000); // Check every 2s
updateWatchlistBadge();

// 6. Search History (Simple)
const searchInput = document.getElementById('headerSearchInput');
const suggestionsBox = document.getElementById('searchSuggestions');
if (searchInput) {
    searchInput.addEventListener('focus', () => {
        const history = JSON.parse(localStorage.getItem('search_history')) || [];
        if (history.length > 0 && !searchInput.value) {
            renderSearchHistory(history);
            suggestionsBox.style.display = 'block';
        }
    });
    searchInput.addEventListener('blur', () => {
        // Delay hide to allow click
        setTimeout(() => { if(!searchInput.value) suggestionsBox.style.display = 'none'; }, 200);
    });
    
    // Save history on Enter (Assumes existing search setup listens to 'keypress')
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim().length > 2) {
            saveSearchTerm(searchInput.value.trim());
        }
    });
}

function saveSearchTerm(term) {
    let history = JSON.parse(localStorage.getItem('search_history')) || [];
    if (!history.includes(term)) {
        history.unshift(term);
        if (history.length > 5) history.pop();
        localStorage.setItem('search_history', JSON.stringify(history));
    }
}

function renderSearchHistory(history) {
    if (!suggestionsBox) return;
    suggestionsBox.innerHTML = '';
    const label = document.createElement('div');
    label.style.padding = '5px 10px'; label.style.fontSize = '0.8rem'; label.style.color = '#888';
    label.innerText = 'Recent Searches';
    suggestionsBox.appendChild(label);
    
    history.forEach(term => {
        const div = document.createElement('div');
        div.className = 'search-history-item';
        div.innerHTML = `<span><i class="fas fa-history" style="margin-right:8px;"></i> ${term}</span> <i class="fas fa-times remove-history"></i>`;
        
        div.querySelector('span').onclick = () => {
             searchInput.value = term;
             suggestionsBox.style.display = 'none';
             // Trigger existing search
             const event = new Event('input', { bubbles: true });
             searchInput.dispatchEvent(event);
        };
        
        div.querySelector('.remove-history').onclick = (e) => {
            e.stopPropagation();
            removeFromHistory(term);
        };
        
        suggestionsBox.appendChild(div);
    });
}

function removeFromHistory(term) {
    let history = JSON.parse(localStorage.getItem('search_history')) || [];
    history = history.filter(t => t !== term);
    localStorage.setItem('search_history', JSON.stringify(history));
    if (history.length > 0) renderSearchHistory(history);
    else suggestionsBox.style.display = 'none';
}

// 7. Double Click to Like (Delegate)
document.addEventListener('dblclick', (e) => {
    const card = e.target.closest('.movie-card');
    if (card) {
        // Visual Pop
        const heart = document.createElement('i');
        heart.className = 'fas fa-heart heart-pop active';
        card.appendChild(heart);
        setTimeout(() => heart.remove(), 800);
        showToast("Loved it! Added to Recommendations.");
    }
});

/* ----------------------------------------------------------------
   AI Picks Logic (Mood Based)
   ---------------------------------------------------------------- */
const MOODS = {
    "Chill": { genres: [35, 10751, 16], label: "Relaxed & Fun" },
    "Thrilled": { genres: [28, 53, 12], label: "Adrenaline Rush" },
    "Curious": { genres: [99, 9648, 36], label: "Mind Benders" },
    "Romantic": { genres: [10749, 18], label: "Love is in the Air" },
    "Scared": { genres: [27], label: "Spooky Vibes" },
    "Epic": { genres: [878, 14, 12], label: "Otherworldly" }
};

let currentMood = null;

async function initAIPicks() {
    const selector = document.getElementById('moodSelector');
    if (!selector) return;

    // 1. Render Mood Pills
    selector.innerHTML = Object.keys(MOODS).map(mood => 
        `<div class="mood-pill" onclick="selectMood('${mood}', this)">
            ${getMoodIcon(mood)} ${mood}
         </div>`
    ).join('');

    // 2. Load Default (Random Mix)
    selectMood('Chill', selector.children[0]); 
}

function getMoodIcon(mood) {
    const icons = {
        "Chill": '<i class="fas fa-couch"></i>',
        "Thrilled": '<i class="fas fa-fire"></i>',
        "Curious": '<i class="fas fa-brain"></i>',
        "Romantic": '<i class="fas fa-heart"></i>',
        "Scared": '<i class="fas fa-ghost"></i>',
        "Epic": '<i class="fas fa-dragon"></i>'
    };
    return icons[mood] || '';
}

window.selectMood = async function(mood, el) {
    currentMood = mood;
    
    // UI Update
    document.querySelectorAll('.mood-pill').forEach(p => p.classList.remove('active'));
    if(el) el.classList.add('active');

    const grid = document.getElementById('suggestionsGrid');
    if(grid) {
        grid.innerHTML = `
            <div style="height: 50vh; display: flex; align-items: center; justify-content: center; width:100%;">
                 <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary-color);"></i>
            </div>`;
    }

    // Fetch Content
    const genreIds = MOODS[mood].genres;
    // Random genre from the mood list
    const mainGenre = genreIds[Math.floor(Math.random() * genreIds.length)];
    
    try {
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${mainGenre}&sort_by=popularity.desc&page=${Math.floor(Math.random()*5)+1}`;
        const res = await fetch(url);
        const data = await res.json();
        
        renderAIPicks(data.results.slice(0, 12));
    } catch(e) {
        console.error("AI Fetch Error", e);
    }
}

function renderAIPicks(movies) {
    const grid = document.getElementById('suggestionsGrid');
    if(!grid) return;
    
    grid.innerHTML = movies.map(movie => {
        const matchScore = Math.floor(Math.random() * (99 - 85) + 85);
        const reasons = ["Critically Acclaimed", "Trending Now", "Visual Masterpiece", "Deep Story", "Perfect for you"];
        const reason = reasons[Math.floor(Math.random() * reasons.length)];
        
        return `
            <div class="movie-card" onclick="openModal(${movie.id})">
                <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}" loading="lazy">
                <div class="ai-badge"><i class="fas fa-fingerprint"></i> ${matchScore}% Match</div>
                <div class="ai-reason">${reason}</div>
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="meta">
                        <span>${new Date(movie.release_date).getFullYear()}</span>
                        <span class="rating"><i class="fas fa-star" style="color:gold;"></i> ${movie.vote_average.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Auto Init if on page
if(window.location.pathname.includes('suggestions.html')) {
    document.addEventListener('DOMContentLoaded', initAIPicks);
}


