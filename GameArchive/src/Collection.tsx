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
  description: string;
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
  const [selectedStatus, setSelectedStatus] = useState<Status>(Status.NotStarted);

  useEffect(() => {
    fetch('http://localhost:8000/script.php?action=getCollection')
      .then((res) => res.json())
      .then((data) => {
        console.log("Collection data:", data);

        const updatedCollection = data.games.map((game: Game) => {
          const transformedGame = {
            ...game,
            id: Number(game.id),
            category: Number(game.category),
            rawg_id: Number(game.rawg_id),
            genres: game.genres.map((genre: string) => categoryMap[Number(genre)] || genre),
            title: game.title || "Unknown",
            release_date: game.release_date || "Unknown",
            rating: game.rating || 0,
          };
          console.log("Transformed game:", transformedGame);
          return transformedGame;
        });

        setCollection(updatedCollection);

        console.log("Updated collection:", updatedCollection);
        console.log("Collection length:", updatedCollection.length);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

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

    const handleUpdateGame = () => {
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
    }

    const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const genre = event.target.value;
        setSelectedGenre(genre);
    
        if (genre === 'All') {
          setFilteredCollection(collection);
        } else {
          const filtered = collection.filter((game) => game.genres.includes(genre));
          setFilteredCollection(filtered);
        }
    };

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => { 
        const status = event.target.value;
        setSelectedStatus(status as Status);

        if (status === 'All') {
            setFilteredCollection(collection);
            // setSelectedGame({ ...selectedGame, status });
        } else {
            const filtered = collection.filter((game) => game.status === status);
            setFilteredCollection(filtered);
            // setSelectedGame({ ...selectedGame, status });
        }
    }

    return (
        <div>
          <h1>My Collection</h1>
    
          {/* Genre Dropdown */}
          <div>
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
                <p>Genres: {game.genres.join(', ')}</p>
                <p>Notes: {game.notes}</p>
                <p>Personal Rating: {game.personal_rating}</p>
                <p>Status: {game.status}</p>
                {/* <button onClick={() => setSelectedGame(game)}>View Details</button> */}
                {/* <button onClick={() => removeButton(game.id)}>Remove</button> */}
              </div>
            ))}
          </div>
    
          {/* Modal for Removing Game */}
          {selectedGame && (
            <div className="modal">
              <div className="modal-content">
                <h2>{selectedGame.title}</h2>
                <p><strong>Released:</strong> {selectedGame.release_date}</p>
                <p><strong>Rating:</strong> {selectedGame.rating}</p>
                <p><strong>Genres:</strong> {selectedGame.genres.join(', ')}</p>
                <label>
                    <strong>Notes:</strong>
                    <textarea
                        value={selectedGame.notes}
                        onChange={(e) => setSelectedGame({ ...selectedGame, notes: e.target.value })}
                    />
                </label>
                <label>
                    <strong>Personal Rating:</strong>
                    <input
                        type="number"
                        value={selectedGame.personal_rating}
                        onChange={(e) => setSelectedGame({ ...selectedGame, personal_rating: Number(e.target.value) })}
                    />
                </label>
                <label>
                    <strong>Status:</strong>
                    <select
                        value={selectedGame.status}
                        onChange={(e) => setSelectedGame({ ...selectedGame, status: e.target.value as Status })}
                    >
                        {Object.values(Status).map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </label>
                <button onClick={handleUpdateGame}>Save Changes</button>
                <button onClick={() => handleRemoveGame(selectedGame.id)}>Delete Game</button>
                <button onClick={() => setSelectedGame(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    export default Collection;