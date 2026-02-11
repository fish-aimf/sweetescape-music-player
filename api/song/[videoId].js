export default async function handler(req, res) {
  const { videoId } = req.query;
  
  if (!videoId) {
    return res.status(400).send('Missing video ID');
  }

  try {
    // Fetch YouTube data
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch YouTube data');
    }

    const data = await response.json();
    const title = data.title || 'Unknown Song';
    const author = data.author_name || 'Unknown Artist';
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const pageUrl = `https://sweetescape.vercel.app/song/${videoId}`;

    // Generate HTML with proper meta tags
    const html = generateHTML(title, author, thumbnail, pageUrl, videoId);
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error:', error);
    // Fallback to basic HTML
    const html = generateHTML('Unknown Song', 'Unknown Artist', '', '', videoId);
    res.status(200).send(html);
  }
}

function generateHTML(title, author, thumbnail, pageUrl, videoId) {
  // Clean and optimize the display text
  const cleanTitle = title || 'Unknown Song';
  const cleanAuthor = author || 'Unknown Artist';
  
  // Create descriptions optimized for Discord/social media
  const ogTitle = `${cleanTitle} | SweetEscape`;
  const ogDescription = `Listen to "${cleanTitle}" by ${cleanAuthor} on SweetEscape - Your ad-free music player with lyrics, playlists, and karaoke mode. Enjoy unlimited music streaming without interruptions.`;
  
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${cleanTitle} - ${cleanAuthor} | SweetEscape</title>
    <meta name="title" content="${cleanTitle} - ${cleanAuthor} | SweetEscape">
    <meta name="description" content="${ogDescription}">
    
    <!-- Open Graph / Facebook / Discord -->
    <meta property="og:type" content="music.song">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:site_name" content="SweetEscape">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescription}">
    <meta property="og:image" content="${thumbnail}">
    <meta property="og:image:width" content="1280">
    <meta property="og:image:height" content="720">
    <meta property="og:image:alt" content="${cleanTitle} by ${cleanAuthor}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${pageUrl}">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${ogDescription}">
    <meta name="twitter:image" content="${thumbnail}">
    <meta name="twitter:image:alt" content="${cleanTitle} by ${cleanAuthor}">
    
    <!-- Music Specific Meta -->
    <meta property="music:musician" content="${cleanAuthor}">
    <meta property="music:song" content="${cleanTitle}">
    
    <!-- Additional SEO -->
    <meta name="keywords" content="music player, ad-free music, ${cleanTitle}, ${cleanAuthor}, lyrics, karaoke, free music streaming">
    <meta name="author" content="SweetEscape">
    <link rel="canonical" href="${pageUrl}">
    
    <!-- Theme Color -->
    <meta name="theme-color" content="#5D9C59">

    <style>
        :root {
            --bg-primary: #f4f4f4;
            --bg-secondary: #ffffff;
            --text-primary: #333;
            --text-secondary: #666;
            --accent-color: #5D9C59; 
            --hover-color: #4A7C59; 
            --border-color: #ddd;
            --button-text-color: #ffffff;
            --shadow-color: rgba(0,0,0,0.1);
            --error-color: #dc3545;
            --error-hover: #c82333;
            --youtube-red: #FF0000;
        }

        [data-theme='dark'] {
            --bg-primary: #121212;
            --bg-secondary: #1e1e1e;
            --text-primary: #e0e0e0;
            --text-secondary: #b0b0b0;
            --accent-color: #3A6B35; 
            --hover-color: #4D7C46; 
            --border-color: #444;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem 1rem;
        }

        .container {
            width: 100%;
            max-width: 900px;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .video-container {
            position: relative;
            width: 100%;
            padding-bottom: 56.25%;
            background-color: var(--bg-secondary);
            overflow: hidden;
        }

        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }

        .controls-section {
            background-color: var(--bg-secondary);
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            border: 1px solid var(--border-color);
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .input-group label {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .input-group input {
            padding: 0.75rem;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
        }

        .input-group input:focus {
            border-color: var(--accent-color);
        }

        .button-group {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .btn {
            flex: 1;
            min-width: 150px;
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--button-text-color);
        }

        .btn-primary {
            background-color: var(--accent-color);
        }

        .btn-primary:hover {
            background-color: var(--hover-color);
        }

        .btn-primary:disabled {
            background-color: var(--text-secondary);
            cursor: not-allowed;
            opacity: 0.6;
        }

        .btn-secondary {
            background-color: var(--text-secondary);
        }

        .btn-secondary:hover {
            background-color: var(--text-primary);
        }

        .message {
            padding: 1rem;
            background-color: var(--accent-color);
            color: var(--button-text-color);
            text-align: center;
            font-weight: 500;
            display: none;
        }

        .message.error {
            background-color: var(--error-color);
        }

        .message.success {
            background-color: var(--accent-color);
        }

        .message.show {
            display: block;
        }

        .song-info {
            padding: 1rem;
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color);
        }

        .song-info h2 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }

        .song-info p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        @media (max-width: 768px) {
            body {
                padding: 1rem 0.5rem;
            }

            .button-group {
                flex-direction: column;
            }

            .btn {
                min-width: 100%;
            }

            .controls-section {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="video-container" id="videoContainer">
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        </div>

        <div class="message" id="message"></div>

        <div class="song-info" id="songInfo">
            <h2 id="displaySongName">${cleanTitle}</h2>
            <p id="displaySongArtist">${cleanAuthor}</p>
        </div>

        <div class="controls-section">
            <h2 style="margin-bottom: 0.5rem;">Add to Your Library</h2>
            
            <div class="input-group">
                <label for="songName">Song Name *</label>
                <input 
                    type="text" 
                    id="songName" 
                    placeholder="Enter song name"
                    value="${cleanTitle}"
                    required
                >
            </div>

            <div class="input-group">
                <label for="songArtist">Artist</label>
                <input 
                    type="text" 
                    id="songArtist" 
                    placeholder="Enter artist name (optional)"
                    value="${cleanAuthor}"
                >
            </div>

            <div class="button-group">
                <button class="btn btn-primary" id="addToLibraryBtn">
                    Add to Library
                </button>
                <button class="btn btn-secondary" id="backBtn">
                    Back to SweetEscape
                </button>
            </div>
        </div>
    </div>

    <script>
        const VIDEO_ID = '${videoId}';
        
        class SongPage {
            constructor() {
                this.db = null;
                this.videoId = VIDEO_ID;
                this.songLibrary = [];
                
                this.elements = {
                    songName: document.getElementById('songName'),
                    songArtist: document.getElementById('songArtist'),
                    addToLibraryBtn: document.getElementById('addToLibraryBtn'),
                    backBtn: document.getElementById('backBtn'),
                    message: document.getElementById('message')
                };

                this.init();
            }

            async init() {
                try {
                    await this.initDatabase();
                    await this.loadSongLibrary();
                    this.checkIfSongExists();
                    this.setupEventListeners();
                } catch (error) {
                    console.error('Initialization error:', error);
                    this.showMessage('Failed to initialize page', 'error');
                }
            }

            initDatabase() {
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open("MusicPlayerDB", 1);
                    
                    request.onerror = (event) => {
                        console.error("IndexedDB error:", event.target.error);
                        reject("Could not open IndexedDB");
                    };
                    
                    request.onsuccess = (event) => {
                        this.db = event.target.result;
                        resolve();
                    };
                    
                    request.onupgradeneeded = (event) => {
                        const db = event.target.result;
                        const stores = [
                            { name: "songLibrary", keyPath: "id" },
                            { name: "playlists", keyPath: "id" },
                            { name: "settings", keyPath: "name" },
                            { name: "recentlyPlayed", keyPath: "type" },
                            { name: "userSettings", keyPath: "category" }
                        ];
                        
                        stores.forEach(({ name, keyPath }) => {
                            if (!db.objectStoreNames.contains(name)) {
                                db.createObjectStore(name, { keyPath });
                            }
                        });
                    };
                });
            }

            loadSongLibrary() {
                return new Promise((resolve, reject) => {
                    if (!this.db) {
                        reject("Database not initialized");
                        return;
                    }
                    
                    const transaction = this.db.transaction(["songLibrary"], "readonly");
                    const store = transaction.objectStore("songLibrary");
                    const request = store.getAll();
                    
                    request.onsuccess = () => {
                        this.songLibrary = request.result || [];
                        this.songLibrary = this.songLibrary.map((song) => {
                            if (song.favorite === undefined) song.favorite = false;
                            if (song.lyrics === undefined) song.lyrics = "";
                            if (song.author === undefined) song.author = "";
                            return song;
                        });
                        resolve();
                    };
                    
                    request.onerror = (event) => {
                        console.error("Error loading song library:", event.target.error);
                        reject("Could not load song library");
                    };
                });
            }

            saveSongLibrary() {
                return new Promise((resolve, reject) => {
                    if (!this.db) {
                        reject("Database not initialized");
                        return;
                    }

                    const transaction = this.db.transaction(["songLibrary"], "readwrite");
                    const store = transaction.objectStore("songLibrary");
                    const clearRequest = store.clear();
                    
                    clearRequest.onsuccess = () => {
                        this.songLibrary.forEach((song) => {
                            store.add(song);
                        });
                    };

                    transaction.oncomplete = () => resolve();
                    transaction.onerror = (event) => {
                        console.error("Error saving song library:", event.target.error);
                        reject("Could not save song library");
                    };
                });
            }

            checkIfSongExists() {
                const exists = this.songLibrary.some(song => song.videoId === this.videoId);
                
                if (exists) {
                    this.elements.addToLibraryBtn.disabled = true;
                    this.elements.addToLibraryBtn.textContent = 'Already in Library';
                    this.showMessage('This song is already in your library', 'success');
                }
            }

            setupEventListeners() {
                this.elements.addToLibraryBtn.addEventListener('click', () => this.addToLibrary());
                this.elements.backBtn.addEventListener('click', () => this.goBack());
                
                this.elements.songName.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addToLibrary();
                });
                this.elements.songArtist.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addToLibrary();
                });
            }

            async addToLibrary() {
                const songName = this.elements.songName.value.trim();
                const songArtist = this.elements.songArtist.value.trim();

                if (!songName) {
                    this.showMessage('Please enter a song name', 'error');
                    this.elements.songName.focus();
                    return;
                }

                if (this.songLibrary.some(song => song.videoId === this.videoId)) {
                    this.showMessage('This song is already in your library', 'error');
                    return;
                }

                const newSong = {
                    id: Date.now(),
                    name: songName,
                    author: songArtist,
                    videoId: this.videoId,
                    favorite: false,
                    lyrics: ""
                };

                try {
                    this.songLibrary.push(newSong);
                    await this.saveSongLibrary();
                    
                    this.showMessage('Song added to library successfully!', 'success');
                    this.elements.addToLibraryBtn.disabled = true;
                    this.elements.addToLibraryBtn.textContent = 'Added to Library';
                } catch (error) {
                    console.error('Error adding song:', error);
                    this.showMessage('Failed to add song. Please try again.', 'error');
                }
            }

            goBack() {
                window.location.href = '/';
            }

            showMessage(text, type = 'success') {
                this.elements.message.textContent = text;
                this.elements.message.className = \`message \${type} show\`;
                
                setTimeout(() => {
                    this.elements.message.classList.remove('show');
                }, 5000);
            }
        }

        new SongPage();
    </script>
</body>
</html>`;
}
