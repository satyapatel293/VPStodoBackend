const mongoose = require('mongoose');

// Replace with your MongoDB connection string if different
const mongoURI = 'mongodb://localhost:27017/Todos';

// Connect to MongoDB
mongoose.connect(mongoURI);

// Acquire the connection to check for successful connection
const db = mongoose.connection;

// Event listeners for the connection
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Successfully connected to MongoDB');
});


// Define the schema for todoCount
const todoCountSchema = new mongoose.Schema({
  counter: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Create the model for todoCount
const TodoCount = mongoose.model('todoCount', todoCountSchema);


// Function to create and insert the todoCount document
const createTodoCount = async () => {
  try {
    // Check if a document already exists to prevent duplicates
    const existing = await TodoCount.findOne({});
    if (existing) {
      console.log('Document already exists:', existing);
      return;
    }

    // Create a new document
    const todoCount = new TodoCount({
      counter: 0, // Optional since default is 0
    });

    // Save the document to the database
    const savedDoc = await todoCount.save();
    console.log('New todoCount document created:', savedDoc);
  } catch (error) {
    console.error('Error creating todoCount document:', error);
  } finally {
    // Close the connection after operation
    mongoose.connection.close();
  }
};

// Invoke the function
// createTodoCount();

TodoCount.find()
  .then(docs => {
    console.log(docs[0].counter); // Pretty-print JSON with 2-space indentation
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error fetching documents:', err);
    mongoose.connection.close();
  });