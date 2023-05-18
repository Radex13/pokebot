const { default: axios } = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Objeto con las traducciones de los nombres de los tipos en inglés a español
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
    .setName('pokemon-random')
    .setDescription('Genera de los datos de un pokemon random'),
  async execute(interaction) {
    try{
      await interaction.deferReply();
      const min = 1;
      const max = 1008;
      const pokemonNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      const url = `https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`;
      const { data } = await axios.get(url);
      const embed = await createEmbed(data);
      await interaction.editReply({ embeds : [embed] });
    } catch (error) {
      console.log(error);
      await interaction.editReply(`<@${interaction.user.id}> no se ha podido localizar tu pokemon! intenta de nuevo.`);
    }
  },
};
