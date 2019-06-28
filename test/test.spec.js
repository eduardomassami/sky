require('dotenv/config');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

before((done) => {
    mongoose
        .connect(process.env.MONGO_DATABASE_TEST, { useNewUrlParser: true })
        .then(() => done())
        .catch(err => done());
});

after(done => {
    mongoose.connection.collections.users.drop(() => {
        mongoose.connection.close(done);
    });
});