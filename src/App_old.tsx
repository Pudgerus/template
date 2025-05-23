import React from 'react';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


function App() {
    return (
        <div className="App">
            <header>
                <span>
                    <h3><a href="#">SPECTRUM</a></h3>
                    <p>+7(4567) 360-76-80 <br />email@yandex.ru</p>
                </span>
                <h3><a href="#">MENU</a></h3>
            </header>
            <div className="stick"></div>
            <div className="content">
                <h1>WE WILL SHOW <br /> YOUR <br /> TALENTS</h1>
                <p>As result we help our students to reveal hidden talents, find their true calling and lifework that will never disapiont them</p>
            </div>
            <div className="selector">
                <p><a href="#">ABOUT COMPANY</a></p>
                <p><a href="#">COMENTS</a></p>
                <p><a href="#">NEWS</a></p>
            </div>

        </div>
    );
}

export default App;