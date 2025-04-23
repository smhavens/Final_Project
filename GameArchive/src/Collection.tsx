import { useEffect, useState } from 'react';

enum Status {
    NotStarted = "not_started",
    Playing = "playing",
    Completed = "completed",
    OnHold = "on_hold",
    Dropped = "dropped",
}

interface Game {
  id: number;
  title: string;
  // description: string;
  category: number;
  genres: string[];
  release_date: string;
  rating: number;
  rawg_id: number;
  background_image: string;
  personal_rating: number;
  notes: string;
  status: Status;
}

const categoryMap: { [key: number]: string } = {
    1: 'Adventure',
    2: 'Action',
    3: 'RPG',
    4: 'Shooter',
    5: 'Puzzle',
    6: 'Strategy',
    7: 'Sports',
    8: 'Fighting',
    9: 'Simulation',
    10: 'Platformer',
    11: 'Horror',
    12: 'Racing',
    13: 'Indie',
    14: 'Casual',
};

function Collection() {
  const [collection, setCollection] = useState<Game[]>([]);
  const [filteredCollection, setFilteredCollection] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All'); // Default to "All"

  useEffect(() => {
    fetch('http://localhost:8000/script.php?action=getCollection')
      .then((res) => res.json())
      .then((data) => {
        console.log("Collection data:", data);

        // Sort games alphabetically by title
        const updatedCollection = data.games
          .map((game: Game) => ({
            ...game,
            id: Number(game.id),
            category: Number(game.category),
            rawg_id: Number(game.rawg_id),
            genres: game.genres.map((genre: string) => categoryMap[Number(genre)] || genre),
            title: game.title || "Unknown",
            release_date: game.release_date || "Unknown",
            // description: game.description || "No description available",
            rating: game.rating || 0,
          }))
          .sort((a: Game, b: Game) => a.title.localeCompare(b.title)); // Sort alphabetically

        setCollection(updatedCollection);
        setFilteredCollection(updatedCollection);

        console.log("Updated collection:", updatedCollection);
        console.log("Collection length:", updatedCollection.length);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  useEffect(() => {
    let filtered = collection;

    // Apply genre filter
    if (selectedGenre !== 'All') {
      filtered = filtered.filter((game) => game.genres.includes(selectedGenre));
    }

    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter((game) => game.status === selectedStatus);
    }

    setFilteredCollection(filtered);
  }, [selectedGenre, selectedStatus, collection]);

  const handleRemoveGame = (gameId: number) => {
    console.log(JSON.stringify({ action: 'delete', game_id: gameId }));
    fetch('http://localhost:8000/script.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', game_id: gameId }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((response) => {
        console.log("Remove response:", response);
        if (response.message === "Game deleted successfully!") {
          const updatedCollection = collection.filter((game) => game.id !== gameId);
          setCollection(updatedCollection);
          setFilteredCollection(updatedCollection);
          setSelectedGame(null);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Failed to remove game from collection.");
      });
  };

  const handleUpdateGame = (selectedGame: Game) => {
    if (!selectedGame) return;
    console.log(JSON.stringify({ action: 'update', selectedGame }));

    fetch('http://localhost:8000/script.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', game: selectedGame }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((response) => {
        if (response.message === "Game updated successfully!") {
          const updatedCollection = collection.map((game) =>
            game.id === selectedGame?.id ? selectedGame : game
          );
          setCollection(updatedCollection);
          setFilteredCollection(updatedCollection);
          setSelectedGame(null);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Failed to update game in collection.");
      });
  };

  const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(event.target.value);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

  return (
    <div>
      <h1>My Collection</h1>

      {/* Genre and Status Dropdowns */}
      <div className="search-bar">
        <label htmlFor="genre-filter">Filter by Genre: </label>
        <select id="genre-filter" value={selectedGenre} onChange={handleGenreChange}>
          <option value="All">All</option>
          {Object.values(categoryMap).map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
        <label htmlFor="status-filter">Filter by Status: </label>
        <select id="status-filter" value={selectedStatus} onChange={handleStatusChange}>
          <option value="All">All</option>
          {Object.values(Status).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="results">
        {filteredCollection.map((game) => (
          <div key={game.id} className="game-card" onClick={() => setSelectedGame(game)}>
            <img src={game.background_image} alt={game.title} />
            <h3>{game.title}</h3>
            <p>Released: {game.release_date || 'Unknown'}</p>
            <p>Rating: {game.rating || 'N/A'}</p>
            {/* <p>Description: {game.description}</p> */}
            <p>Genres: {game.genres.join(', ')}</p>
            <p>Notes: {game.notes}</p>
            <p>Personal Rating: {game.personal_rating}</p>
            <p>Status: {game.status}</p>
          </div>
        ))}
      </div>

      {/* Modal for Viewing and Updating Game */}
      {selectedGame && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          tabIndex={-1}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedGame.title}</h5>
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
                  alt={selectedGame.title}
                />
                <p><strong>Released:</strong> {selectedGame.release_date}</p>
                <p><strong>Rating:</strong> {selectedGame.rating}</p>
                <p><strong>Genres:</strong> {selectedGame.genres.join(', ')}</p>
                {/* <p><strong>Description:</strong> {selectedGame.description}</p> */}

                {/* Personal Rating Input */}
                <label htmlFor="personalRating" className="form-label">Personal Rating:</label>
                <div className="d-flex align-items-center">
                  <input
                    type="range"
                    id="personalRating"
                    className="form-range me-3"
                    min="0"
                    max="5"
                    step="0.25"
                    value={selectedGame.personal_rating ?? ""} // Use empty string if null/undefined
                    onChange={(e) =>
                      setSelectedGame({
                        ...selectedGame,
                        personal_rating: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <span>{selectedGame.personal_rating ?? 0}</span>
                </div>

                {/* Status Dropdown */}
                <label htmlFor="status" className="form-label mt-3">Status:</label>
                <select
                  id="status"
                  className="form-select"
                  value={selectedGame.status}
                  onChange={(e) =>
                    setSelectedGame({
                      ...selectedGame,
                      status: e.target.value as Status,
                    })
                  }
                  >
                    <option value="" disabled>Select a status</option>
                      {Object.keys(Status).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                  </select>

                {/* Notes Textarea */}
                <label htmlFor="notes" className="form-label mt-3">Notes:</label>
                <textarea
                  id="notes"
                  className="form-control"
                  value={selectedGame.notes ?? ""} // Use empty string if null/undefined
                  onChange={(e) =>
                    setSelectedGame({
                      ...selectedGame,
                      notes: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    handleUpdateGame(selectedGame);
                    setSelectedGame(null);
                  }}
                >
                  Update
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleRemoveGame(selectedGame.id);
                    setSelectedGame(null)}}
                >
                  Remove from Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Collection;