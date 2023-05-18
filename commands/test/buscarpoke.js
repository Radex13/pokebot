const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');
const { ButtonStyle } = require('discord-api-types/v10');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db/db');

const tiposTraducidos = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada'
};

const createEmbed = async (pokemon) => {
  const exampleEmbed = new EmbedBuilder()
    .setTitle(pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1))
    .setThumbnail(pokemon.sprites.front_default)
    .addFields(
      { name: 'N.º', value: pokemon.id.toString(), inline: true },
      { name: 'Nombre', value: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1), inline: true },
      { name: 'Peso', value: `${(pokemon.weight / 10).toFixed(1)} kg`, inline: true },
    );
  if (pokemon.types.length === 1) {
    const tipo = tiposTraducidos[pokemon.types[0].type.name];
    exampleEmbed.addFields(
      { name: 'Tipo', value: tipo, inline: true },
    );
  }
  // Si el Pokémon tiene dos tipos, agregamos un solo campo de tipo que muestra ambos tipos
  else if (pokemon.types.length === 2) {
    const tipo1 = tiposTraducidos[pokemon.types[0].type.name];
    const tipo2 = tiposTraducidos[pokemon.types[1].type.name];
    const combinedTypeName = `${tipo1} / ${tipo2}`;
    exampleEmbed.addFields(
      { name: 'Tipo', value: combinedTypeName, inline: true },
    );
  }
  return exampleEmbed;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buscar-maleza')
    .setDescription('Genera de los datos de un pokemon random'),
  async execute(interaction) {
    try{

      // Verificar si el usuario existe en la tabla users
      const userQuery = db.prepare('SELECT user_id FROM users WHERE user_id = ?');
      const userExists = userQuery.get(interaction.user.id);

      if (!userExists) {
        await interaction.reply('Ups no estas registrado, usa el comando /registrar-usuario para registrarte.');
        return;
      }

      await interaction.reply('Buscando Pokémon...');

      const min = 1;
      const max = 1008;
      const pokemonNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      const url = `https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`;
      const { data } = await axios.get(url);
      const embed = await createEmbed(data);
      await interaction.editReply({ content: 'Aquí está tu pokemon:', embeds: [embed] }); // Enviamos la respuesta con el embed
      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('capture-pokemon')
          .setLabel('Capturar')
          .setStyle(ButtonStyle.Primary)
      );

      const reply = await interaction.fetchReply();
      reply.edit({ content: '¡Atrápalo!', components: [button] });


      // Esperamos a que se haga click en el botón
      const filter = (interaction) => {
        return interaction.customId === 'capture-pokemon' && interaction.user.id;
      };
      const collector = reply.createMessageComponentCollector({ filter, time: 5000 }); // El colector escucha eventos durante 5 segundos

      collector.on('collect', async (interaction) => {
        await interaction.update({ content: '¡Pokémon capturado!', components: [] });// Eliminamos el botón
        await interaction.editReply(`El pokemon ${data.name} ha sido agregado a tu colección!`);
        // Insertar valores en la tabla pokemons
        const created_at = new Date().toISOString();
        const pokemon_id = data.id;
        const pokemon_name = data.name;
        const user_id = interaction.user.id;
        const statement = db.prepare(`
INSERT INTO pokemons (pokemon_id, created_at, pokemon_name, user_id)
VALUES (?, ?, ?, ?)
`);
        statement.run(pokemon_id, created_at, pokemon_name, user_id);
        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) { // Si no se ha recopilado nada, significa que nadie hizo clic en el botón
          await reply.edit({ content: '¡El pokemon a huido!', components: [] });
        }
      });
    }

    catch (error) {
      console.log(error);
      await interaction.editReply(`<@${interaction.user.id}> no se ha podido localizar tu pokemon! intenta de nuevo.`);
    }
  },
};