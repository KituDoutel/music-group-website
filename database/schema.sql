-- Buat database
CREATE DATABASE IF NOT EXISTS music_group_db;
USE music_group_db;

-- Tabel Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'artist', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Produk (Merchandise & Digital)
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  type ENUM('merch', 'digital') NOT NULL,
  stock INT DEFAULT 0,
  image_url VARCHAR(255),
  file_url VARCHAR(255), -- Untuk produk digital
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Musik
CREATE TABLE tracks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  artist_id INT NOT NULL,
  duration INT NOT NULL, -- Dalam detik
  genre VARCHAR(50),
  release_date DATE,
  stream_count INT DEFAULT 0,
  file_path VARCHAR(255) NOT NULL,
  cover_image VARCHAR(255),
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

-- Tabel Event Booking
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  event_date DATETIME NOT NULL,
  event_type ENUM('wedding', 'corporate', 'private') NOT NULL,
  attendees INT NOT NULL,
  special_requests TEXT,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel Orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid', 'shipped') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel Order Items
CREATE TABLE order_items (
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);