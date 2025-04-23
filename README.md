# The Game Archive
A one-stop solution for managing your personal game collection. This application allows users to search for games, add them to their collection, update game details, and filter games by genre and status.

---

## Screenshots
### Home Page
![Home Page](path/to/homepage-screenshot.png)

### Collection Page
![Collection Page](path/to/collection-screenshot.png)

### Game Modal
![Game Modal](path/to/game-modal-screenshot.png)

---

## Design

### Database Design
The database is designed with three main tables: `games`, `categories`, and `jnct_game_category`. Below is the schema:

#### Tables:
1. **`games`**:
   - Stores information about each game, including title, description, release date, rating, personal rating, notes, and status.
   - Includes a `background_image` field for storing the game's image URL.

2. **`categories`**:
   - Stores the list of game genres (e.g., Adventure, Action, RPG).

3. **`jnct_game_category`**:
   - A junction table that links games to their respective genres.

#### Schema:
```sql
CREATE TABLE [games](http://_vscodecontentref_/1) (
  [id](http://_vscodecontentref_/2) int(11) NOT NULL,
  [title](http://_vscodecontentref_/3) varchar(32) NOT NULL,
  [description](http://_vscodecontentref_/4) text DEFAULT NULL,
  [release_date](http://_vscodecontentref_/5) date NOT NULL DEFAULT current_timestamp(),
  [rawg_id](http://_vscodecontentref_/6) int(11) NOT NULL,
  [rating](http://_vscodecontentref_/7) decimal(3,2) DEFAULT NULL,
  [status](http://_vscodecontentref_/8) enum('not_started','playing','completed','on_hold','dropped') NOT NULL DEFAULT 'not_started',
  [personal_rating](http://_vscodecontentref_/9) decimal(3,2) DEFAULT NULL,
  [notes](http://_vscodecontentref_/10) text DEFAULT NULL,
  [background_image](http://_vscodecontentref_/11) varchar(255) NOT NULL
);

CREATE TABLE `categories` (
  [id](http://_vscodecontentref_/12) int(11) NOT NULL,
  [name](http://_vscodecontentref_/13) varchar(32) NOT NULL
);

CREATE TABLE `jnct_game_category` (
  `game_FK` int(11) NOT NULL,
  `category_FK` int(11) NOT NULL
);
```

---

## How To Use
### Prerequisites
XAMPP or any other PHP and MySQL server tools.
Install Node.js for running the React frontend.

### Setup
#### Import the Database
Use the [gamearchive.sql](SQL) file to import the Game Archive database with MySQL. If you used XAMPP, you can go to phpMyAdmin and import there, just do not change anything in the file (do not touch the categories data, as it is contant information referenced by the software.)

### Prepare the Backend
This is where ![GameArchive/backend/script.php](PHP Script) is used and run on a PHP server. However you intend to start it, you will most likely use the following command `php -S localhost:8000` while in `GameArchive\backend`to ensure it is on the correct port for the system.
If, for whatever reason, port 8000 is not available: go through ![GameArchive/src/Collections.tsx](Collections) and ![GameArchive/src/App.tsx](App) and change fetch requests from `8000` to whatever port you use.

### Prepare the Frontend
Go into the GameArchive directory in your terminal (or VSCode if you are running the system through it) and then run
```
npm install
npm install bootstrap
npm run dev
```
and follow the posted link to a localhost port. In my testing, it was ![http://localhost:5173/](5173).