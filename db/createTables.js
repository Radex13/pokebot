const db = require('./db');

// const deleteTableUsers = () => {
//   const statement = db.prepare(`
//   DROP TABLE IF EXISTS users
//   `);
//   statement.run();
// };

const createUsersTable = () => {
  db.prepare('DROP TABLE IF EXISTS users').run();
  const statement = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        created_at DATE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL
    )
`);
  statement.run();
};

const createPokemonsTable = () => {
  db.prepare('DROP TABLE IF EXISTS pokemons').run();
  const statement = db.prepare(`
    CREATE TABLE IF NOT EXISTS pokemons (
        pokemon_id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATE NOT NULL,
        pokemon_name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        FOREIGN KEY (user_id)
          REFERENCES users (user_id)
            ON DELETE CASCADE
    )
`);

  statement.run();
};

const createTables = async () => {
  console.log('Creando tablas...');
  createUsersTable();
  console.log(1);
  createPokemonsTable();
  console.log('Tablas creadas!');
};

createTables();