const {SlashCommandBuilder} = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Doesn\'nt leave'),
	async execute(interaction) {
		await interaction.reply('Never gonna give you up, never gonna let me leave ❤️');
	},
};