-- Admin user (password: admin123)
INSERT OR IGNORE INTO users (id, email, password_hash, role, nom, classe) VALUES 
  (1, 'admin@ta3limi.tn', '$2a$10$YQ8P8fCqmZ7qmKxvKJ5vMeqWZ9YF5xK3jXZ8X9Q5X8K5X9Q5X8K5X', 'admin', 'Administrateur', NULL);

-- Enseignant (password: prof123)
INSERT OR IGNORE INTO users (id, email, password_hash, role, nom, classe) VALUES 
  (2, 'prof@ta3limi.tn', '$2a$10$YQ8P8fCqmZ7qmKxvKJ5vMeqWZ9YF5xK3jXZ8X9Q5X8K5X9Q5X8K5X', 'enseignant', 'Mohamed Ben Ali', NULL);

-- Parent (password: parent123)
INSERT OR IGNORE INTO users (id, email, password_hash, role, nom, classe) VALUES 
  (3, 'parent@ta3limi.tn', '$2a$10$YQ8P8fCqmZ7qmKxvKJ5vMeqWZ9YF5xK3jXZ8X9Q5X8K5X9Q5X8K5X', 'parent', 'Fatma Trabelsi', NULL);

-- Élève (password: eleve123)
INSERT OR IGNORE INTO users (id, email, password_hash, role, nom, classe, parent_id) VALUES 
  (4, 'eleve@ta3limi.tn', '$2a$10$YQ8P8fCqmZ7qmKxvKJ5vMeqWZ9YF5xK3jXZ8X9Q5X8K5X9Q5X8K5X', 'eleve', 'Ahmed Trabelsi', '4ème primaire', 3);

-- Sample courses
INSERT OR IGNORE INTO courses (titre, niveau, matiere, description, enseignant_id, video_url) VALUES 
  ('Les mathématiques pour débutants', 'primaire', 'Mathématiques', 'Introduction aux mathématiques pour la 4ème année', 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('La langue arabe', 'primaire', 'Arabe', 'Apprendre la grammaire arabe', 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('Sciences physiques', 'college', 'Sciences', 'Découverte des sciences physiques', 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('Histoire de la Tunisie', 'lycee', 'Histoire', 'Histoire moderne de la Tunisie', 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ');

-- Sample quizzes
INSERT OR IGNORE INTO quizzes (titre, questions, course_id) VALUES 
  ('Quiz Mathématiques Niveau 1', '[{"question":"Combien font 2+2?","options":["3","4","5","6"],"correct":1},{"question":"Combien font 5x3?","options":["8","12","15","20"],"correct":2}]', 1),
  ('Quiz Arabe Niveau 1', '[{"question":"Comment dit-on bonjour en arabe?","options":["مرحبا","شكرا","وداعا","نعم"],"correct":0}]', 2);

-- Sample subscriptions
INSERT OR IGNORE INTO subscriptions (user_id, plan, status, start_date) VALUES 
  (4, 'gratuit', 'active', datetime('now'));

-- Sample progress
INSERT OR IGNORE INTO progress (user_id, course_id, score) VALUES 
  (4, 1, 85),
  (4, 2, 90);
