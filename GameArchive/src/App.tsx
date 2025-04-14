import { useEffect, useState } from 'react';
import './App.css';

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

  interface Game {
    id: number;
    name: string;
    background_image: string;
    released: string;
    rating: number;
    genres: string[];
  }

  interface SaveResponse {
    message?: string;
  }

  const handleSaveToCollection = (game: Game): void => {
    fetch('http://localhost:8000/script.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', game }),
    })
      .then((res) => res.json() as Promise<SaveResponse>)
      .then((response) => {
        console.log("Save response:", response);
        alert(response.message || "Game saved successfully!");
      })
      .catch((err) => console.error("Error:", err));
  };

  return (
    <div className="App">
      <h1>Game Archive</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select onChange={(e) => setSearchType(e.target.value)} value={searchType}>
          <option value="title">Title</option>
          <option value="genre">Genre</option>
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="results">
        {data.map((game) => (
          <div key={game.id} className="game-card" onClick={() => setSelectedGame(game)}>
            <img src={game.background_image} alt={game.name} />
            <h3>{game.name}</h3>
          </div>
        ))}
      </div>

      {selectedGame && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedGame.name}</h2>
            <img src={selectedGame.background_image} alt={selectedGame.name} />
            <p>Released: {selectedGame.released}</p>
            <p>Rating: {selectedGame.rating}</p>
            <p>Genres: {selectedGame.genres.join(', ')}</p>
            <button onClick={() => handleSaveToCollection(selectedGame)}>Save to Collection</button>
            <button onClick={() => setSelectedGame(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;