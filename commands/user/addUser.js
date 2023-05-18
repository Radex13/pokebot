const { SlashCommandBuilder } = require('discord.js');
const db = require('../../db/db');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('registrar-usuario')
    .setDescription('Agrega tu usuario a nuestro bot!')
    .addStringOption(option =>
      option
        .setName('nombre')
        .setDescription('Tu nombre')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('apellido')
        .setDescription('Tu apellido')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('email')
        .setDescription('Tu email')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const name = interaction.options.getString('nombre');
      const lastName = interaction.options.getString('apellido');
      const email = interaction.options.getString('email');
      const id = interaction.user.id;

      const created = new Date().toISOString();
      console.log(created);

      console.log(new Date(created).toLocaleString());

      const statement = db.prepare(`
    INSERT INTO users (user_id, first_name, last_name, email, created_at) 
    VALUES (?, ?, ?, ?, ?)
    `);

      statement.run(id, name, lastName, email, created);

      await interaction.reply(`Bienvenido <@${id}> al servidor!`);
    } catch (error) {
      if (error.message === 'UNIQUE constraint failed: users.user_id') {
        await interaction.reply(`<@${interaction.user.id}> Tu usuario ya esta registado`);
      }
    }
  },
};