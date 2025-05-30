<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

error_log("Script started." . PHP_EOL); // Debugging line
// ini_set('error_log', 'c:\xampp\php\logs\php_error_log');
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

ob_start(); 

// echo "Script started." . PHP_EOL;
// flush();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$category_map = [
    'Adventure' => 1,
    'Action' => 2,
    'RPG' => 3,
    'Shooter' => 4,
    'Puzzle' => 5,
    'Strategy' => 6,
    'Sports' => 7,
    'Fighting' => 8,
    'Simulation' => 9,
    'Platformer' => 10,
    'Arcade' => 11,
    'Racing' => 12,
    'Indie' => 13,
    'Casual' => 14,
    'MMO'=> 15,
    'Family'=> 16,
    'Board Games'=> 17,
    'Card'=> 18,
    'Educational'=> 19,
];

// API Configuration
$key = '0755d2de9a3e41809bc6846b01dcc167';
$rawg_url = 'https://api.rawg.io/api/games';

// Database Connection
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'gamearchive';
$page_size = 9;

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["error" => "Database connection failed: " . $e->getMessage()]));
}


function get_genres(PDO $pdo, int $game_id) {
    $stmt = $pdo->prepare("
            SELECT c.name AS genre_name
            FROM categories c
            JOIN jnct_game_category j ON c.id = j.category_FK
            WHERE j.game_FK = :game_id;");
    $stmt->execute(["game_id"=> $game_id]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function set_genres(PDO $pdo, int $game_id, int $genre) {
    $stmt = $pdo->prepare("
            INSERT INTO jnct_game_category (game_FK, category_FK)
            VALUES (:game_id, :category_id);");
        $stmt->execute([
            "game_id" => $game_id,
            "category_id" => $genre,
        ]);
    return $stmt->rowCount() > 0;
}

function get_games_of_genre(PDO $pdo, int $genre_id) {
    $stmt = $pdo->prepare("
            SELECT g.id, g.title, g.release_date, g.rawg_id, g.background_image, g.rating
            FROM games g
            JOIN jnct_game_category j ON g.id = j.game_FK
            WHERE j.category_FK = :genre_id;");
    $stmt->execute(["genre_id"=> $genre_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// function removeGame(PDO $pdo, int $game_id) {
//     $stmt = $pdo->prepare("
//             DELETE FROM games WHERE id = :game_id;");
//     $stmt->execute(["game_id"=> $game_id]);
//     return $stmt->rowCount() > 0;
// }

// Handle POST Requests to Save Games
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    error_log("decoded input: " . print_r($input, true)); // Debugging line

    if ($input === null) {
        echo json_encode(["error" => "Invalid JSON input."]);
        exit;
    }

    if ($input['action'] === 'save') {
        $game = $input['game'];

        error_log("genres: " . print_r($game['genres'], true)); // Debugging line

        // $category_name = $game['genres'] ?? null;
        // $category_id = $category_map[$category_name] ?? null;

        error_log("Game Object: " . print_r($game, true));

        // error_log("Category Name: $category_name, Category ID: $category_id");

        $id = $game['id'] ?? null;
        $name = $game['name'] ?? null;
        $released = $game['released'] ?? null;
        $rating = $game['rating'] ?? null;
        $background_image = $game['background_image'] ?? null;
        // $description = $game['description'] ?? null;
        $genres = $game['genres'] ?? [];
        $genre_ids = array_map(fn($genre) => $category_map[$genre] ?? null, $genres);
        $genres = implode(", ", $genres);
        // $genres = implode(", ", array_map(fn($genre) => $genre['name'], $genres));

        error_log("ID: $id, Name: $name, Released: $released, Rating: $rating, Background Image: $background_image, Genres: $genres");

        $stmt = $conn->prepare(
            "INSERT INTO games (id, title, description, release_date, rawg_id, background_image, rating) 
             VALUES (?, ?, ?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             title=VALUES(title), 
             description=VALUES(description), 
             release_date=VALUES(release_date),
             rawg_id=VALUES(rawg_id), 
             background_image=VALUES(background_image),
             rating=VALUES(rating)"
        );
        $stmt->bind_param(
            "isssiss",
            $id,
            $name,
            $genres,
            $released,
            $id,
            $background_image,
            $rating
        );

        if ($stmt->execute()) {
            echo json_encode(["message" => "Game saved successfully!"]);
            foreach ($genre_ids as $genre_id) {
                set_genres($pdo, $id, $genre_id);
            }
        } else {
            echo json_encode(["error" => "Failed to save game."]);
        }

        $stmt->close();
    }
    elseif ($input['action'] === 'delete') {
        // echo "ATTEMPTING TO DELETE GAME";
        $game_id = $input['game_id'] ?? null;
        // echo json_encode(["game_id" => $game_id]);
        if ($game_id) {
            $stmt = $conn->prepare("DELETE FROM games WHERE id = ?");
            $stmt->bind_param("i", $game_id);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Game deleted successfully!"]);
            } else {
                echo json_encode(["error" => "Failed to delete game."]);
            }
            $stmt->close();
        } else {
            echo json_encode(["error" => "Game ID is required."]);
        }
    }
    elseif ($input['action'] === 'update') {
        $game = $input['game'] ?? null;

        if ($game) {
            $id = $game['id'] ?? null;
            $personal_rating = $game['personal_rating'] ?? null;
            $notes = $game['notes'] ?? null;
            $status = $game['status'] ?? null;

            if ($id === null) {
                echo json_encode(["error" => "Game ID is required for updating."]);
                exit;
            }

            $stmt = $conn->prepare("
                UPDATE games
                SET personal_rating = ?, notes = ?, status = ?
                WHERE id = ?
            ");
            $stmt->bind_param(
                "issi",
                $personal_rating,
                $notes,
                $status,
                $id
            );

            if ($stmt->execute()) {
                echo json_encode(["message" => "Game updated successfully!"]);
            } else {
                echo json_encode(["error" => "Failed to update game."]);
            }

            $stmt->close();
        } else {
            echo json_encode(["error" => "Invalid game data."]);
        }
    } else {
        echo json_encode(["error" => "Invalid action."]);
    }
    exit;
}

// Handle GET Requests for Searching Games
if (isset($_GET['action']) && $_GET['action'] === 'search') {
    // $query = urlencode($_GET['search']);
    // echo "Searching for games..." . PHP_EOL;
    // echo "Incoming GET request: " . print_r($_GET, true) . PHP_EOL;
    // flush();
    $query = $_GET['query'] ?? '';
    $type = $_GET['type'] ?? 'title';
    $page = $_GET['page'] ?? 1;
    $sort = $_GET['sort'] ?? 'alphabetical';
    $rawg_query_url = "$rawg_url?key=$key&page=$page&page_size=$page_size";

    if ($type === "title") {
        $rawg_query_url .= "&search=" . urlencode($query);
    }

    // echo "RAWG Query URL: " . $rawg_query_url . PHP_EOL;

    if ($sort === '-rating') {
        $rawg_query_url .= "&ordering=rating";
    } elseif ($sort === 'alphabetical') {
        $rawg_query_url .= "&ordering=name";
    }

    $rawg_response = file_get_contents($rawg_query_url);

    // error_log("Request: " . print_r($_GET, true));
    // error_log("RAWG API Response: " . $rawg_response);

    // echo "Request: " . print_r($_GET, true) . PHP_EOL;
    // echo "RAWG API Response: " . $rawg_response . PHP_EOL;

    if ($rawg_response === FALSE) {
        die(json_encode(["error" => "Failed to fetch data from RAWG API."]));
    }

    $data = json_decode($rawg_response, true);
    $simplified = [];

    foreach ($data['results'] as $game) {
        $simplified[] = [
            'id' => $game['id'],
            'name' => $game['name'],
            'released' => $game['released'] ?? 'Unknown', // Default to 'Unknown' if not set
            // 'description' => $game['description'] ?? 'No description available.', // Default to placeholder
            'rating' => $game['rating'] ?? 0, // Default to 0 if not set
            'background_image' => $game['background_image'] ?? '', // Default to empty string if not set
            'genres' => array_map(fn($genre) => $genre['name'], $game['genres'] ?? []), // Handle missing genres
        ];
    }

    if ($sort === 'alphabetical') {
        usort($simplified, fn($a, $b) => strcmp($a['name'], $b['name']));
    } elseif ($sort === 'rating') {
        usort($simplified, fn($a, $b) => $b['rating'] <=> $a['rating']);
    }

    echo json_encode([
        'results' => $simplified,
    ]);
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'genreSearch') {
    $genre_id = $_GET['genre_id'] ?? null;
    $page = $_GET['page'] ?? 1;
    $sort = $_GET['sort'] ?? 'alphabetical';

    error_log("Genre ID: " . print_r($genre_id, true)); // Debugging line

    if (!$genre_id) {
        echo json_encode(["error" => "Genre ID is required."]);
        exit;
    }

    // $games = get_games_of_genre($pdo, (int)$genre_id);

    $rawg_genre_url = "$rawg_url?key=$key&genres=$genre_id&page=$page&page_size=$page_size";

    if ($sort === 'rating') {
        $rawg_genre_url .= "&ordering=-rating";
    } elseif ($sort === 'alphabetical') {
        $rawg_genre_url .= "&ordering=name";
    }

    $rawg_response = file_get_contents($rawg_genre_url);

    if ($rawg_response === FALSE) {
        die(json_encode(["error" => "Failed to fetch data from RAWG API."]));
    }

    $data = json_decode($rawg_response, true);
    $simplified = [];

    foreach ($data['results'] as $game) {
        $simplified[] = [
            'id' => $game['id'],
            'name' => $game['name'],
            'released' => $game['released'] ?? 'Unknown', // Default to 'Unknown' if not set
            // 'description' => $game['description'] ?? 'No description available.', // Default to placeholder
            'rating' => $game['rating'] ?? 0, // Default to 0 if not set
            'background_image' => $game['background_image'] ?? '', // Default to empty string if not set
            'genres' => array_map(fn($genre) => $genre['name'], $game['genres'] ?? []), // Handle missing genres
        ];
    }

    // if ($sort === 'alphabetical') {
    //     usort($simplified, fn($a, $b) => strcmp($a['name'], $b['name']));
    // } elseif ($sort === 'rating') {
    //     usort($simplified, fn($a, $b) => $b['rating'] <=> $a['rating']);
    // }

    echo json_encode([
        'results' => $simplified,
    ]);
    exit;
}

// Handle GET Requests for Fetching the Collection
if (isset($_GET['action']) && $_GET['action'] === 'getCollection') {
    $sql = "SELECT * FROM games";
    $result = $conn->query($sql);

    $games = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $item_genres = get_genres($pdo, $row['id']);
            $row['genres'] = $item_genres;
            $games[] = $row;
        }
    }

    echo json_encode(["games" => $games]);
    exit;
}

// Close Database Connection
$conn->close();

$output = ob_get_clean(); // Get the buffer contents
if (!empty($output)) {
    error_log("Unexpected output: " . $output); // Log unexpected output
}
echo json_encode(["error" => "No valid response generated."]);
exit;
?>