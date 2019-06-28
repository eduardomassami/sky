require('dotenv/config');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async(req, res) => {
  try {
    const newUser = new User({ ...req.body });
    const user = await newUser.save(req.body);
    res.json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = err.errors.email ? err.errors.email.message : err.message;
      return res.status(422).json(
        { mensagem: msg }
      );
    }
    res.status(404).json({ mensagem: err.message });
  }
};

const signin = async(req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });
    // usuário não existe
    if (!user){
      return res.status(401).json({ mensagem: 'Usuário e/ou senha inválidos' });
    }
    try {
      const match = await bcrypt.compare(senha, user.senha);
      if (match) {
        // não estava especificado, mas creio que esteja implícito
        const token = jwt.sign(
          { nome: user.nome },
          process.env.TOKEN_SECRET,
          { expiresIn: 1800 });
        await User.update({ _id: user._id }, {$set: { token }});

        // achou e autenticou
        res.json(await User.findOne({ email }));
      } else {
        // senha não bateu
        return res.status(401).json(
          { mensagem: 'Usuário e/ou senha inválidos' }
        );
      }

    } catch (err) {
      // erro no bcrypt
      return res.status(500).json({ mensagem: err.message });
    }
  } catch (err) {
    res.status(500).json({ mensagem: err.message });
  }
};

const user = async(req, res) => {
  try {
    const usr = await User.findOne({ _id: req.params.id });
    // usuário não encontrado
    if (!usr) return res.status(404).json({ messagem: 'Não autorizado' });

    // token errado
    if (usr.token !== req.token)  {
      return res.status(404).json({ messagem: 'Não autorizado' });
    }

    res.send(usr);
  } catch (err) {
    res.status(500).json({ mensagem: err.message });
  }
};

// middleware para verificar o token
const verifyToken = async(req, res, next) => {
  try {
    const header = req.headers['authorization'];
    const bearer = header.split(' ');
    const token = bearer[1];
    // sem token na requisição
    if (!token) return res.status(401).json({ messagem: 'Não autorizado' });

    try {
      // verifica o tempo do token
      await jwt.verify(token, process.env.TOKEN_SECRET);
      req.token = token;
      next();
    } catch (err) {
      return res.status(401).json({ messagem: 'Sessão inválida' });
    }
  } catch (err) {
    res.status(500).json({ mensagem: err.message });
  }
};

module.exports = { signup, signin, user, verifyToken };
