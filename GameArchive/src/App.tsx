import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import './App.css';
import Collection from './Collection.tsx';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title'); // 'title' or 'genre'
  const [data, setData] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleSearch = () => {
    fetch(`http://localhost:8000/script.php?search=${searchQuery}&type=${searchType}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Search results:", data);
        setData(data.results || []);
      })
      .catch((err) => console.error("Error:", err));
  };

  const handleSaveToCollection = (game: Game): void => {
    console.log(JSON.stringify({ action: 'save', game }));
    fetch('http://localhost:8000/script.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', game }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((response) => {
        console.log("Save response:", response);
        alert(response.message || "Game saved successfully!");
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Failed to save game to collection.");
      });
  };

  interface Game {
    id: number;
    name: string;
    background_image: string;
    released: string;
    rating: number;
    genres: string[];
  }

  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Game Archive</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/collection">My Collection</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="container mt-4">
                  <div className="search-bar mb-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search games..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                      className="form-select mt-2"
                      onChange={(e) => setSearchType(e.target.value)}
                      value={searchType}
                    >
                      <option value="title">Title</option>
                      <option value="genre">Genre</option>
                    </select>
                    <button className="btn btn-primary mt-2" onClick={handleSearch}>
                      Search
                    </button>
                  </div>

                  <div className="row">
                    {data.map((game) => (
                      <div key={game.id} className="col-md-4 mb-4">
                        <div
                          className="card"
                          onClick={() => setSelectedGame(game)}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={game.background_image}
                            className="card-img-top"
                            alt={game.name}
                          />
                          <div className="card-body">
                            <h5 className="card-title">{game.name}</h5>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedGame && (
                  <div
                    className="modal fade show"
                    style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    tabIndex={-1}
                  >
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">{selectedGame.name}</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSelectedGame(null)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <img
                            src={selectedGame.background_image}
                            className="img-fluid mb-3"
                            alt={selectedGame.name}
                          />
                          <p><strong>Released:</strong> {selectedGame.released}</p>
                          <p><strong>Rating:</strong> {selectedGame.rating}</p>
                          <p><strong>Genres:</strong> {selectedGame.genres.join(', ')}</p>
                        </div>
                        <div className="modal-footer">
                          <button
                            className="btn btn-success"
                            onClick={() => {
                              handleSaveToCollection(selectedGame);
                              setSelectedGame(null);
                            }}
                          >
                            Save to Collection
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setSelectedGame(null)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            }
          />
          <Route path="/collection" element={<Collection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;