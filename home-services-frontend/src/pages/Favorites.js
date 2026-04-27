import React, { useState } from "react";
import "../styles/Favorites.css";

function Favorites() {
  const [favorites, setFavorites] = useState([
    { id: 1, name: "Ali Cleaning Pro" },
    { id: 2, name: "Sara Babysitter" }
  ]);

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(worker => worker.id !== id));
  };

  return (
    <div className="favorites-container">
      <h2>❤️ My Favorite Workers</h2>

      {favorites.length === 0 ? (
        <p>No favorite workers yet.</p>
      ) : (
        favorites.map(worker => (
          <div key={worker.id} className="favorite-card">
            <span>{worker.name}</span>
            <button onClick={() => removeFavorite(worker.id)}>Remove</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Favorites;