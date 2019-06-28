require('dotenv/config');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  telefones: [
    {
      numero: { type: Number, required: true },
      ddd: { type: Number, required: true },
    },
  ],
  ultimo_login: { type: Date },
  token: { type: String },
  data_criacao: { type: Date },
  data_atualizacao: { type: Date },
}, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message: 'E-mail já existente' });

UserSchema.pre('save', async(next) => {
  try {
    // hash na senha
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
    const password = await bcrypt.hash(this.senha, salt);
    this.senha = password;

    // atualizando datas
    // (acabei criando o data_criacao e data_atualizacao,
    // mas creio que poderia utilizar só o createdAt e updatedAt)
    this.data_criacao = this.createdAt;
    this.data_atualizacao = this.updatedAt;
    this.ultimo_login = this.updatedAt;

    // gerando o token e persistindo
    this.token = jwt.sign(
      { nome: this.nome },
      process.env.TOKEN_SECRET,
      { expiresIn: 1800 });

    next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model('User', UserSchema);
