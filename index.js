require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());


// Format New Todo Body 
function extractTodoObject(requestBody) {
  const todo = {};
  todo.title = requestBody["title"] || "";
  todo.day = requestBody["day"] || "";
  todo.month = requestBody["month"] || "";
  todo.year = requestBody["year"] || "";
  todo.completed = requestBody["completed"] || false;
  todo.description = requestBody["description"] || "";

  return todo;
}


// Configure PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, Express and PostgreSQL!');
});

app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/todos/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ToDo not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/todos', async (req, res) => {
  const newTodo = extractTodoObject(req.body)
  const {title, day, month, year, description} = newTodo

  try {
    const result = await pool.query('INSERT INTO todos (title, day, month, year, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, day, month, year, description]
    )

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;

  // Validate request body
  if (req.body['completed'] !== undefined) {
    try {
      const result = await pool.query(
        'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
        [req.body['completed'], id]
      );
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  } else {
    const updatedTodo = extractTodoObject(req.body);
    const { title, day, month, year, description, completed } = updatedTodo;

    try {
      const result = await pool.query(
        'UPDATE todos SET title = $1, day = $2, month = $3, year = $4, description = $5, completed = $6 WHERE id = $7 RETURNING *',
        [title, day, month, year, description, completed, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'ToDo not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
});



app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ToDo not found' });
    }

    res.json({ message: 'ToDo deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
