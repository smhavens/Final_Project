import { useEffect, useState } from 'react';

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
    fetch(`http://localhost:8000/script.php?action=delete&id=${gameId}`, {
        method: 'POST',
        })
        .then((res) => {
            if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((response) => {
            console.log("Remove response:", response);
            if (response.message === "Game removed successfully!") {
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
          </div>
    
          <div className="results">
            {filteredCollection.map((game) => (
              <div key={game.id} className="game-card" onClick={() => setSelectedGame(game)}>
                <img src={game.background_image} alt={game.title} />
                <h3>{game.title}</h3>
                <p>Released: {game.release_date || 'Unknown'}</p>
                <p>Rating: {game.rating || 'N/A'}</p>
                <p>Genres: {game.genres.join(', ')}</p>
              </div>
            ))}
          </div>
    
          {/* Modal for Removing Game */}
          {selectedGame && (
            <div className="modal">
              <div className="modal-content">
                <h2>Remove Game</h2>
                <p>Are you sure you want to remove "{selectedGame.title}" from your collection?</p>
                <button onClick={() => handleRemoveGame(selectedGame.id)}>Yes, Remove</button>
                <button onClick={() => setSelectedGame(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    export default Collection;