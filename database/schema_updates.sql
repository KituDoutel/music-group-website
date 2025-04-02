-- Tabel Subscription
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('free', 'premium', 'pro') DEFAULT 'free',
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  payment_status ENUM('active', 'canceled', 'expired') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel Play History
CREATE TABLE play_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  track_id INT NOT NULL,
  play_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  play_duration INT NOT NULL, -- Dalam detik
  device_type VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (track_id) REFERENCES tracks(id)
);