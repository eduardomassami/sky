const chai = require('chai');
const expect = chai.expect;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');

const user = {
    nome: 'teste',
    email: 'teste@test.com',
    senha: '123456',
    telefones: [
        {
            numero: '27880683',
            ddd: '11',
        },
    ],
};

let usrId = '';

describe('user', () => {
    it('/signup cadastro', async () => {
        const usr = await new User(user).save();
        usrId = usr._id;
        return expect(usr.token).exist;
    });
    it('/signup email igual', async () => {
        try {
            await new User(user).save()
        }
        catch (err) {
            return expect(err.message).to.include('E-mail já existente');
        }
    });
    it('/signin usuário não existe', async () => {
        const user = await User.findOne({ email: 'invalido' })
        return expect(user).not.exist;
    });
    it('/signin usuário existe e senha bate', async () => {
        const usr = await User.findOne({ email: user.email })
        const compare = await bcrypt.compare(user.senha, usr.senha);
        return expect(compare).to.be.true;
    });
    it('/signin usuário existe e senha não bate', async () => {
        const usr = await User.findOne({ email: user.email })
        const compare = await bcrypt.compare('errrado', usr.senha);
        return expect(compare).to.not.be.true;
    });
    it('/users achou o usuário e tem token', async () => {
        const usr = await User.findOne({ _id: usrId });
        return expect(usr.token).exist;
    });
    it('verifyToken token valido', async () => {
        const tokenusr = await User.findOne({ _id: usrId }).select(`token`);
        const token = await jwt.verify(tokenusr.token, process.env.TOKEN_SECRET);
        return expect(token.nome).exist;
    });
    it('verifyToken token invalido', async () => {
        try {
            const tokenMock = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub21lIjoiZWR1YXJkbyIsImlhdCI6MTU2MTY5MTg5NSwiZXhwIjoxNTYxNjkzNjk1fQ.PFo3ERWCyaNLmZMXlsHbhad182pkBcHs0yxMuS3GZAM'
            await jwt.verify(tokenMock, process.env.TOKEN_SECRET);
        }
        catch (err) {
            return expect(err.message).to.include('jwt expired');
        }
    })
});