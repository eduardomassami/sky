require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const user = require('./routes/User');

mongoose
  .connect(process.env.MONGO_DATABASE, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

mongoose.set('useCreateIndex', true);

const app = express();

const serverPort = process.env.PORT || 3000;
app.listen(
  { port: serverPort },
  () => console.log(`Server listening port ${serverPort}.`));

app.use(bodyParser.json());

app.use('/user', user);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ mensagem: 'Endpoint inválido' });
});
