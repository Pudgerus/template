import React, { useState } from 'react';
import "./index.css";

const items = [
    { id: "item1", title: "NEW RELEASES", bg: "#3a506e" },
    { id: "item2", title: "3D ILLUS", bg: "#96b4a4" },
    { id: "item3", title: "DIGITAL", bg: "#c12426" },
    { id: "item4", title: "ART", bg: "#bc4c30" },
    { id: "item5", title: "CUSTOMIZE", bg: "#c6903a" },
];

function App() {
    const [activeIdx, setActiveIdx] = useState(2);

    return (
        <div className="main-bg" style={{ background: items[activeIdx].bg, transition: 'background 0.5s' }}>
            <header className="header">
                {items.map((item) => (
                    <span key={item.id}>{item.title}</span>
                ))}
            </header>
            <div className="carousel">
                {items.map((item, idx) => (
                    <div
                        className="item"
                        id={item.id}
                        key={item.id}
                        style={
                            idx === activeIdx
                                ? { width: '20%', zIndex: 2}
                                : { width: '120px', zIndex: 1}
                        }
                        onClick={() => setActiveIdx(idx)}
                    ></div>
                ))}
            </div>
        </div>
    );
}

export default App;