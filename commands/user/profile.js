const { SlashCommandBuilder, bold } = require('discord.js');
const db = require('../../db/db');
const { stripIndents } = require('common-tags');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Muestra tu perfil y tus Pokemons!'),
  async execute(interaction) {
    try {
      const id = interaction.user.id;

      const statement = db.prepare(`
          SELECT * FROM users
          WHERE user_id = ?
        `);

      const user = statement.get(id);

      if (!user) return await interaction.reply('Ups! tu usuario no se ha encontrado pon el comando /agregar-usuario');

      const pokemonStatement = db.prepare(`
          SELECT * FROM pokemons
          WHERE user_id = ?
        `);

      const pokemons = pokemonStatement.all(id);

      let pokemonNames = '';

      if (pokemons.length > 0) {
        pokemonNames = pokemons.map(pokemon => pokemon.pokemon_name).join(', ');
      } else {
        pokemonNames = 'No tienes ningún pokemon todavía';
      }

      await interaction.reply(stripIndents`
          ${bold('Usuario:')}  <@${id}>
          ${bold('Nombre:')} ${user.first_name} ${user.last_name}
          ${bold('Email:')} ${user.email}
          ${bold('Pokemons:')} ${pokemonNames}
        `);

    } catch (error) {
      console.log(error);
    }
  },
};