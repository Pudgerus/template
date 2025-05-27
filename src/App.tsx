import React, { useState, useEffect } from 'react';


interface Image {
  size: string;
  ['#text']: string;
}

interface Artist {
  name: string;
  playcount?: string;
  listeners?: string;
  mbid?: string;
  image?: Image[];
}

interface Track {
  name: string;
  playcount?: string;
  listeners?: string;
  mbid?: string;
  artist?: { name: string };
  image?: Image[];
}

interface Album {
  name: string;
  artist: string;
  image?: Image[];
}

/**
 * Главный компонент приложения Last.fm, отображающий популярную музыку и предоставляющий функциональность поиска.
 *
 * @component
 * @returns {JSX.Element} Главный JSX-элемент приложения.
 */

const LastFmApp = () => {
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<{
    artists: Artist[];
    tracks: Track[];
    albums: Album[];
  }>({ artists: [], tracks: [], albums: [] });
  const [activeTab, setActiveTab] = useState<'top' | 'artists' | 'albums' | 'tracks'>('top');

  const API_KEY = '72cba2ae56aedfc85269b38d77e5d1d3';
  const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

  useEffect(() => {
    /**
 * Загружает топ артистов и треков с API Last.fm, если поиск не активен.
 * Используется в useEffect.
 * @returns {Promise<void>}
 */
    const fetchData = async () => {
      try {
        setLoading(true);

        const artistsResponse = await fetch(
          `${BASE_URL}?method=chart.gettopartists&api_key=${API_KEY}&format=json&limit=12`
        );
        const artistsData = await artistsResponse.json();

        const tracksResponse = await fetch(
          `${BASE_URL}?method=chart.gettoptracks&api_key=${API_KEY}&format=json&limit=18`
        );
        const tracksData = await tracksResponse.json();

        if (artistsData?.artists?.artist) {
          setTopArtists(artistsData.artists.artist);
        }

        if (tracksData?.tracks?.track) {
          setTopTracks(tracksData.tracks.track);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data from Last.fm API');
        setLoading(false);
      }
    };

    if (!isSearching) {
      fetchData();
    }
  }, [isSearching]);

  /**
 * Выполняет поиск артистов, альбомов и треков по запросу пользователя.
 *
 * @param {string} query - Строка запроса для поиска.
 * @returns {Promise<void>}
 */
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      setSearchQuery(query);

      const [artistsResponse, albumsResponse, tracksResponse] = await Promise.all([
        fetch(`${BASE_URL}?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json`),
        fetch(`${BASE_URL}?method=album.search&album=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json`),
        fetch(`${BASE_URL}?method=track.search&track=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json`)
      ]);

      const artistsData = await artistsResponse.json();
      const albumsData = await albumsResponse.json();
      const tracksData = await tracksResponse.json();

      setSearchResults({
        artists: artistsData?.results?.artistmatches?.artist || [],
        albums: albumsData?.results?.albummatches?.album || [],
        tracks: tracksData?.results?.trackmatches?.track || []
      });

      setLoading(false);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to search');
      setLoading(false);
    }
  };

  /**
 * Получает URL изображения из массива изображений, соответствующий заданному размеру.
 *
 * @param {Image[] | undefined} images - Массив изображений.
 * @param {string} [size='medium'] - Размер изображения ('small', 'medium', 'large', 'extralarge').
 * @returns {string} URL изображения или URL изображения-заглушки.
 */
  const getImage = (images?: Image[], size: string = 'medium'): string => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop&crop=face';
    }
    
    const image = images.find(img => img?.size === size) || images[images.length - 1];
    return image?.['#text'] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop&crop=face';
  };

  
/**
 * Форматирует числовую строку в более читаемый формат с сокращениями (K, M).
 *
 * @param {string | undefined} numStr - Числовая строка для форматирования.
 * @returns {string} Отформатированная строка.
 */
  const formatNumber = (numStr?: string): string => {
    if (!numStr) return '0';
    const num = parseInt(numStr);
    if (isNaN(num)) return '0';

    if (num > 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    } else if (num > 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  /**
 * Отрисовывает страницу с результатами поиска.
 *
 * @returns {JSX.Element} JSX-разметка поисковой страницы.
 */
  const renderSearchPage = () => (
    <div className="main-content">
      <div className="content-left">
        <h1 className="search-title">Search results for "{searchQuery}"</h1>
        
        <div className="search-tabs">
          <div 
            className={`tab ${activeTab === 'top' ? 'active' : ''}`}
            onClick={() => setActiveTab('top')}
          >
            Top Results
          </div>
          <div 
            className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            Artists
          </div>
          <div 
            className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            Albums
          </div>
          <div 
            className={`tab ${activeTab === 'tracks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracks')}
          >
            Tracks
          </div>
        </div>
        
        <div className="search-section">
          <input 
            type="text" 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          />
          <button className="search-btn" onClick={() => setSearchQuery('')}>✕</button>
          <button className="search-btn" onClick={() => handleSearch(searchQuery)}>🔍</button>
        </div>

        {activeTab === 'top' || activeTab === 'artists' ? (
          <div className="artists-section">
            <h2 className="section-title">Artists</h2>
            <div className="artists-grid">
              {searchResults.artists.slice(0, 8).map((artist, index) => (
                <div key={artist?.mbid || artist?.name || index} className="artist-item">
                  <div className="artist-name">{artist?.name || 'Unknown Artist'}</div>
                  <div className="artist-listeners">{formatNumber(artist.listeners)} listeners</div>
                </div>
              ))}
            </div>
            {searchResults.artists.length > 8 && (
              <a href="#" className="more-link">More artists</a>
            )}
          </div>
        ) : null}

        {activeTab === 'top' || activeTab === 'albums' ? (
          <div className="albums-section">
            <h2 className="section-title">Albums</h2>
            <div className="albums-grid">
              {searchResults.albums.slice(0, 8).map((album, index) => (
                <div key={`${album.name}-${album.artist}-${index}`} className="album-item">
                  <div className="album-cover">
                    <img 
                      src={getImage(album.image, 'extralarge')} 
                      alt={album.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop&crop=face';
                      }}
                    />
                  </div>
                  <div className="album-title">{album.name}</div>
                  <div className="album-artist">{album.artist}</div>
                </div>
              ))}
            </div>
            {searchResults.albums.length > 8 && (
              <a href="#" className="more-link">More albums</a>
            )}
          </div>
        ) : null}

        {activeTab === 'top' || activeTab === 'tracks' ? (
          <div className="tracks-section">
            <h2 className="section-title">Tracks</h2>
            <div className="tracks-list">
              {searchResults.tracks.slice(0, 10).map((track, index) => (
                <div key={track?.mbid || track?.name || index} className="track-item">
                  <div className="play-icon">▶</div>
                  <div className="track-cover">
                    <img 
                      src={getImage(track.image, 'small')} 
                      alt={track.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop';
                      }}
                    />
                  </div>
                  <div className="track-info">
                    <div className="track-title">{track.name}</div>
                    <div className="track-artist">{track.artist}</div>
                  </div>
                  <div className="track-duration"></div>
                </div>
              ))}
            </div>
            {searchResults.tracks.length > 10 && (
              <a href="#" className="more-link">More tracks</a>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );

  /**
 * Отрисовывает главную страницу с топ-артистами и треками.
 *
 * @returns {JSX.Element} JSX-разметка главной страницы.
 */
  const renderMainPage = () => (
    <>
      <h1 className="page-title">Music</h1>
      
      <section>
        <div>
          <h2 className="section-title">
            Hot right now
            <div className="section-title-underline"></div>
          </h2>
        </div>
        
        <div className="artists-grid">
          {topArtists.map((artist, index) => (
            <div key={artist?.mbid || artist?.name || index} className="artist-card">
              <img 
                src={getImage(artist?.image)} 
                alt={artist?.name || 'Artist'}
                className="artist-avatar"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop&crop=face';
                }}                  
              />
              <div className="artist-name">{artist?.name || 'Unknown Artist'}</div>
              <div className="artist-info">
                {formatNumber(artist?.playcount)} plays • {formatNumber(artist?.listeners)} listeners
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <section>
        <div>
          <h2 className="section-title">
            Popular tracks
            <div className="section-title-underline"></div>
          </h2>
        </div>
        
        <div className="tracks-grid">
          {topTracks.map((track, index) => (
            <div key={track?.mbid || track?.name || index} className="track-item">
              <img 
                src={getImage(track?.image)} 
                alt={track?.name || 'Track'}
                className="track-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop&crop=face';
                }}
              />
              <div className="track-info">
                <div className="track-title">{track?.name || 'Unknown Track'}</div>
                <div className="track-artist">{track?.artist?.name || 'Unknown Artist'}</div>
                <div className="track-stats">
                  {formatNumber(track?.playcount)} plays • {formatNumber(track?.listeners)} listeners
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="player-controls">
            <button className="control-btn">⊙</button>
            <button className="control-btn">⏮</button>
            <button className="control-btn">▶</button>
            <button className="control-btn">⏭</button>
            <button className="control-btn">♡</button>
          </div>
          
          <a href="http://localhost:3000" className="logo">last.fm</a>
          
          <nav className="nav">
            <div className="search-container">
              {isSearching ? (
                <input
                  type="text"
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  autoFocus
                />
              ) : (
                <button 
                  className="control-btn"
                  onClick={() => setIsSearching(true)}
                >
                  🔍
                </button>
              )}
            </div>
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">Live</a>
            <a href="#" className="nav-link">Music</a>
            <a href="#" className="nav-link">Charts</a>
            <a href="#" className="nav-link">Events</a>
            <a href="#" className="nav-link">Features</a>
            <div className="user-avatar"></div>
          </nav>
        </div>
      </header>

      <main className="main">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : isSearching ? (
          renderSearchPage()
        ) : (
          renderMainPage()
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-sections">
            <div>
              <h4 className="footer-section-title">Company</h4>
              <a href="#" className="footer-link">About Last.fm</a>
              <a href="#" className="footer-link">Contact Us</a>
              <a href="#" className="footer-link">Jobs</a>
            </div>
            <div>
              <h4 className="footer-section-title">Help</h4>
              <a href="#" className="footer-link">Track My Music</a>
              <a href="#" className="footer-link">Community Support</a>
              <a href="#" className="footer-link">Community Guidelines</a>
              <a href="#" className="footer-link">Help</a>
            </div>
            <div>
              <h4 className="footer-section-title">Goodies</h4>
              <a href="#" className="footer-link">Download Scrobbler</a>
              <a href="#" className="footer-link">Developer API</a>
              <a href="#" className="footer-link">Free Music Downloads</a>
              <a href="#" className="footer-link">Merchandise</a>
            </div>
            <div>
              <h4 className="footer-section-title">Account</h4>
              <a href="#" className="footer-link">Inbox</a>
              <a href="#" className="footer-link">Settings</a>
              <a href="#" className="footer-link">Last.fm Pro</a>
              <a href="#" className="footer-link">Logout</a>
            </div>
            <div>
              <h4 className="footer-section-title">Follow us</h4>
              <a href="#" className="footer-link">Facebook</a>
              <a href="#" className="footer-link">Twitter</a>
              <a href="#" className="footer-link">Instagram</a>
              <a href="#" className="footer-link">YouTube</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="language-selector">
              <a href="#" className="footer-link">English</a>
              <a href="#" className="footer-link">Deutsch</a>
              <a href="#" className="footer-link">Español</a>
              <a href="#" className="footer-link">Français</a>
              <a href="#" className="footer-link">Italiano</a>
              <a href="#" className="footer-link">日本語</a>
              <a href="#" className="footer-link">Polski</a>
              <a href="#" className="footer-link">Português</a>
              <a href="#" className="footer-link">Русский</a>
              <a href="#" className="footer-link">Svenska</a>
              <a href="#" className="footer-link">Türkçe</a>
              <a href="#" className="footer-link">简体中文</a>
            </div>
            <div>
              <span>CBS Interactive © 2022 Last.fm Ltd. All rights reserved</span>
            </div>
            <div className="audioscrobbler-logo">
              as
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LastFmApp;