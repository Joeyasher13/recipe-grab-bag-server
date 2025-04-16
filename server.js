const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schemas
const Recipe = mongoose.model('Recipe', { url: String });
const TriedRecipe = mongoose.model('TriedRecipe', {
  url: String,
  notes: String,
  rating: Number
});

// Routes
app.get('/recipes', async (req, res) => {
  const recipes = await Recipe.find();
  const tried = await TriedRecipe.find();
  res.json({ recipes, triedRecipes: tried });
});

app.post('/recipes', async (req, res) => {
  const recipe = new Recipe({ url: req.body.url });
  await recipe.save();
  res.sendStatus(200);
});

app.post('/try', async (req, res) => {
  const recipe = await Recipe.findOneAndDelete({ url: req.body.url });
  if (recipe) {
    await new TriedRecipe({ url: recipe.url, notes: '', rating: 0 }).save();
  }
  res.sendStatus(200);
});

app.post('/tried/update', async (req, res) => {
  const { index, key, value } = req.body;
  const tried = await TriedRecipe.find();
  const item = tried[index];
  if (item) {
    item[key] = value;
    await item.save();
  }
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
