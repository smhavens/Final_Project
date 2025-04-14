import { useEffect, useState } from 'react';

interface Game {
  id: number;
  title: string;
  released: string;
  rating: number;
  background_image: string;
}

function Collection() {
  const [collection, setCollection] = useState<Game[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/script.php?action=getCollection')
      .then((res) => res.json())
      .then((data) => {
        console.log("Collection data:", data);
        setCollection(data.games || []);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div>
      <h1>My Collection</h1>
      <div className="results">
        {collection.map((game) => (
          <div key={game.id} className="game-card">
            <img src={game.background_image} alt={game.title} />
            <h3>{game.title}</h3>
            <p>Released: {game.released}</p>
            <p>Rating: {game.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Collection;