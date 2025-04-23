-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2025 at 09:35 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gamearchive`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Adventure'),
(2, 'Action'),
(3, 'RPG'),
(4, 'Shooter'),
(5, 'Puzzle'),
(6, 'Strategy'),
(7, 'Sports'),
(8, 'Fighting'),
(9, 'Simulation'),
(10, 'Platformer'),
(11, 'Arcade'),
(12, 'Racing'),
(13, 'Indie'),
(14, 'Casual'),
(15, 'MMO'),
(16, 'Family'),
(17, 'Board'),
(18, 'Card'),
(19, 'Educational');

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `title` varchar(32) NOT NULL,
  `description` text DEFAULT NULL,
  `release_date` date NOT NULL DEFAULT current_timestamp(),
  `rawg_id` int(11) NOT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `status` enum('not_started','playing','completed','on_hold','dropped') NOT NULL DEFAULT 'not_started',
  `personal_rating` decimal(3,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `background_image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jnct_game_category`
--

CREATE TABLE `jnct_game_category` (
  `game_FK` int(11) NOT NULL,
  `category_FK` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jnct_game_category`
--
ALTER TABLE `jnct_game_category`
  ADD PRIMARY KEY (`game_FK`,`category_FK`),
  ADD KEY `category_FK_constraint` (`category_FK`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `jnct_game_category`
--
ALTER TABLE `jnct_game_category`
  ADD CONSTRAINT `category_FK_constraint` FOREIGN KEY (`category_FK`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_FK_constraint` FOREIGN KEY (`game_FK`) REFERENCES `games` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
