import { Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import './App.css';
import Collection from './Collection.tsx';

function App() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title'); // 'title' or 'genre'
  const [data, setData] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [sortType, setSortType] = useState<'alphabetical' | 'rating'>('alphabetical'); // Sorting type
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true); // Track if there are more pages to fetch
  const [isLoading, setIsLoading] = useState(false);

  const categoryMap: { [key: string]: number } = {
    Action: 4,
    Indie: 51,
    Adventure: 3,
    RPG: 5,
    Strategy: 10,
    Shooter: 2,
    Casual: 40,
    Simulation: 14,
    Puzzle: 7,
    Arcade: 11,
    Platformer: 83,
    MMO: 59,
    Racing: 1,
    Sports: 15,
    Fighting: 6,
    Family: 19,
    Board: 28,
    Card: 17,
    Educational: 34,
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setData([]);
    setHasMorePages(true); // Reset hasMorePages when a new search is initiated
    console.log("Search initiated:", { searchQuery, searchType, sortType });

    if (searchType === 'title') {
      fetchResults(1);
    } else if (searchType === 'genre') {
      const genreId = categoryMap[searchQuery];
      if (!genreId) {
        alert("Invalid genre selected.");
        return;
      }
      fetchGenres(genreId, 1);
    }
  };

  const fetchResults = (page: number) => {
    setIsLoading(true);
    fetch(
      `http://localhost:8000/script.php?action=search&query=${encodeURIComponent(searchQuery)}&type=${searchType}&page=${page}&sort=${sortType}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Search results:", data);
        if (data.results.length === 0) {
          setHasMorePages(false); // No more pages to fetch
        } else {
          setData(data.results); // Replace data instead of appending
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        alert("Failed to fetch data.");
        setIsLoading(false);
      });
  };

  const fetchGenres = (genreId: number, page: number) => {
    setIsLoading(true);
    fetch(`http://localhost:8000/script.php?action=genreSearch&genre_id=${genreId}&page=${page}&sort=${sortType}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Genre search results:", data);
        if (data.results.length === 0) {
          setHasMorePages(false); // No more pages to fetch
        } else {
          setData(data.results); // Replace data instead of appending
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching genre data:", err);
        alert("Failed to fetch genre data.");
        setIsLoading(false);
      });
  };

  const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const genreName = event.target.value;
    setSearchQuery(genreName);
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
    // description: string;
    genres: string[];
  }

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Game Archive</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
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
                  {/* Search Type Dropdown */}
                  <select
                    className="form-select mt-2"
                    onChange={(e) => setSearchType(e.target.value)}
                    value={searchType}
                  >
                    <option value="title">Title</option>
                    <option value="genre">Genre</option>
                  </select>

                  {/* Conditionally Render Input or Genre Dropdown */}
                  {searchType === 'title' ? (
                    <input
                      type="text"
                      className="form-control mt-2"
                      placeholder="Search games by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  ) : (
                    <select
                      className="form-select mt-2"
                      onChange={handleGenreChange}
                      defaultValue=""
                    >
                      <option value="" disabled>Select a genre</option>
                      {Object.keys(categoryMap).map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Sorting Dropdown */}
                  <select
                    className="form-select mt-2"
                    onChange={(e) => setSortType(e.target.value as 'alphabetical' | 'rating')}
                    value={sortType}
                  >
                    <option value="alphabetical">Alphabetical</option>
                    <option value="rating">Rating</option>
                  </select>

                  <button className="btn btn-primary mt-2" onClick={handleSearch}>
                    Search
                  </button>
                </div>

                <div className="row">
                  {data.map((game, index) => (
                    <div key={`${game.id}-${index}`} className="col-md-4 mb-4">
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

                {/* Pagination Buttons */}
                <div className="pagination mt-4">
                  <button
                    className="btn btn-primary"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prevPage) => prevPage - 1);
                      fetchResults(currentPage - 1);
                    }}
                  >
                    Previous
                  </button>
                  <span className="mx-2">Page {currentPage}</span>
                  <button
                    className="btn btn-primary"
                    disabled={!hasMorePages}
                    onClick={() => {
                      setCurrentPage((prevPage) => prevPage + 1);
                      fetchResults(currentPage + 1);
                    }}
                  >
                    Next
                  </button>
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
  );
}

export default App;