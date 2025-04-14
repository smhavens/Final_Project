<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

# API
$key = '0755d2de9a3e41809bc6846b01dcc167';
$rawg_url = 'https://api.rawg.io/api/games';

# Database connection
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'gamearchive';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}

// Handle POST requests to save games
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input['action'] === 'save') {
        $game = $input['game'];
        $stmt = $conn->prepare("INSERT INTO games (id, title, released, rating, background_image) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title)");
        $stmt->bind_param("issds", $game['id'], $game['name'], $game['released'], $game['rating'], $game['background_image']);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Game saved successfully!"]);
        } else {
            echo json_encode(["error" => "Failed to save game."]);
        }
        $stmt->close();
    }
    exit;
}

// Handle GET requests for searching
if (isset($_GET['search'])) {
    $query = urlencode($_GET['search']);
    $type = $_GET['type'] ?? 'title';
    $rawg_query_url = "$rawg_url?key=$key&search=$query&page_size=5";

    $rawg_response = file_get_contents($rawg_query_url);
    if ($rawg_response === FALSE) {
        die(json_encode(["error" => "Failed to fetch data from RAWG API."]));
    }

    $data = json_decode($rawg_response, true);
    $simplified = [];

    foreach ($data['results'] as $game) {
        $simplified[] = [
            'id' => $game['id'],
            'name' => $game['name'],
            'released' => $game['released'],
            'rating' => $game['rating'],
            'background_image' => $game['background_image'],
            'genres' => array_map(fn($genre) => $genre['name'], $game['genres']),
        ];
    }

    echo json_encode([
        'results' => $simplified,
    ]);
    exit;
}

$conn->close();
?>