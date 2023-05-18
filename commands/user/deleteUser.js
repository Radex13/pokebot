const { SlashCommandBuilder } = require('discord.js');
const db = require('../../db/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eliminar-usuario')
    .setDescription('Elimina tu usuario!'),
  async execute(interaction) {
    try {
      const id = interaction.user.id;

      const statement = db.prepare(`
       DELETE FROM users
       WHERE user_id = ?
      `);

      if (statement === '') return await interaction.reply('Ups! tu usuario no existe');

      statement.run(id);

      await interaction.reply(`<@${id}> su usuario a sido eliminado con exito`);
    } catch (error) {
      console.log(error);

    }
  },
};