<?php



require_once 'config.example.php';




require_once 'config.example.php';

require_once 'config.php';

require_once 'config.example.php';


// require_once '../config.php';

// require_once '../config.php';

require_once '../config.php';
d

try {
    $conn = new PDO("mysql:host=". DB_HOST. ";dbname=". DB_DATABASE , DB_USER, DB_PASSWORD);
} catch (PDOException $pe) {
    die("Could not connect to the database " . DB_DATABASE . ": " . $pe->getMessage());
}
