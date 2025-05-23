import React, { useState, useEffect, useRef } from 'react';
import { FastAverageColor } from 'fast-average-color';
import "./index.css";

const API_KEY = '72cba2ae56aedfc85269b38d77e5d1d3';

interface Album {
    name: string;
    image: string;
    url: string;
    artist: string;
}

function App() {
    const [activeIdx, setActiveIdx] = useState(2);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [bgColor, setBgColor] = useState<string>('#c12426'); // начальный цвет совпадает с items[2].bg
    const fac = useRef(new FastAverageColor());

    useEffect(() => {
        const fetchTopAlbums = async () => {
            try {
                const response = await fetch(
                    `https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=pop&api_key=${API_KEY}&format=json&limit=5`
                );
                const data = await response.json();
                console.log('Top albums response:', data);

                const albumList = data.albums.album.map((album: any) => {
                    const images = album.image;
                    const placeholder = 'https://via.placeholder.com/300x300?text=No+Image';
                    const imageUrl =
                        images.find((img: any) => img.size === 'extralarge' && img['#text'])?.['#text'] ||
                        images.find((img: any) => img.size === 'large' && img['#text'])?.['#text'] ||
                        placeholder;

                    return {
                        name: album.name,
                        image: imageUrl,
                        url: album.url,
                        artist: album.artist.name,
                    };
                });

                setAlbums(albumList);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching albums:', error);
                setLoading(false);
            }
        };

        fetchTopAlbums();
    }, []);

    // Меняем цвет фона в зависимости от активного альбома
    useEffect(() => {
        if (!albums.length) return;

        const img = new Image();
        img.crossOrigin = 'anonymous'; // чтобы избежать проблем с CORS
        img.src = albums[activeIdx]?.image;

        img.onload = () => {
            fac.current
                .getColorAsync(img)
                .then(color => {
                    setBgColor(color.hex);
                })
                .catch(() => {
                    // Если не удалось получить цвет, используем дефолт
                    setBgColor('#ccc');
                });
        };

        img.onerror = () => {
            setBgColor('#ccc');
        };
    }, [activeIdx, albums]);

    const items = [
        { id: "item1", title: "NEW RELEASES", bg: "#3a506e" },
        { id: "item2", title: "3D ILLUS", bg: "#96b4a4" },
        { id: "item3", title: "DIGITAL", bg: "#c12426" },
        { id: "item4", title: "ART", bg: "#bc4c30" },
        { id: "item5", title: "CUSTOMIZE", bg: "#c6903a" },
    ];

    return (
        <div className="main-bg" style={{ background: bgColor, transition: 'background 0.5s' }}>
            <header className="header">
                {items.map((item) => (
                    <span key={item.id}>{item.title}</span>
                ))}
            </header>
            <div className="carousel">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    albums.map((album, idx) => (
                        <div
                            className="item"
                            id={items[idx]?.id || `item${idx}`}
                            key={album.name}
                            style={
                                idx === activeIdx
                                    ? { width: '20%', zIndex: 2 }
                                    : { width: '120px', zIndex: 1 }
                            }
                            onClick={() => setActiveIdx(idx)}
                        >
                            <img
                                src={album.image}
                                alt={album.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '100px' }}
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                }}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;
