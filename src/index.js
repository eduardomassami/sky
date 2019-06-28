require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const user = require('./routes/User');
console.log(process.env)
// Connect to MongoDB with Mongoose.
mongoose
    .connect(process.env.MONGO_DATABASE)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

const app = express();

const serverPort = process.env.PORT || 3000
app.listen({ port: serverPort }, () => console.log(`Server listening port ${serverPort}.`));

app.use(bodyParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/user', user);

// catch 404 and forward to error handler
// note this is after all good routes and is not an error handler
// to get a 404, it has to fall through to this route - no error involved
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.status(404).json({ mensagem: "Endpoint inválido" });
});