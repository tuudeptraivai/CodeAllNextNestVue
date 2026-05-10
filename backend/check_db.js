const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://test:EfOZwRzsOaDH0KOw@cluster0.jnncur8.mongodb.net/movie_db';

async function checkFilm() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const filmId = '69ee1d361710d75bdf0886b9';
    const film = await mongoose.connection.db.collection('films').findOne({ _id: new mongoose.Types.ObjectId(filmId) });
    
    if (film) {
      console.log('Film found:', film.title);
    } else {
      console.log('Film NOT found');
      // List some films to see what IDs look like
      const someFilms = await mongoose.connection.db.collection('films').find().limit(5).toArray();
      console.log('Sample film IDs:', someFilms.map(f => f._id.toString()));
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFilm();
