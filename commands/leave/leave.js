const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

const { getVoiceConnection, joinVoiceChannel} = require('@discordjs/voice');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Doesn\'nt leave'),
	async execute(interaction,client) {
		// If bot is not connected to anything don't disconnect
		if(!interaction.guild.members.me.voice.channelId) {
			const embed = new EmbedBuilder().setColor("Red").setTitle("Error").setDescription("Not connected to any voice channel.");
			interaction.reply({embeds:[embed]});
			return;
		}
		// If bot & human not in the same channel don't disconnect
		if(interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId){
			const embed = new EmbedBuilder().setColor("Red").setTitle("No permission").setDescription("You have to be in the same voice channel as the bot to disconnect it");
			return;
		}
		// Get connection
		var connection = getVoiceConnection(interaction.member.voice.channel.guild.id);
		// If bot dies while playing, it will be connected to a voice channel without a connection
		// Just make a new one.
		if(!connection) {
			connection = joinVoiceChannel({
				channelId: interaction.member.voice.channel.id,
				guildId:   interaction.member.voice.channel.guild.id,
				adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator
			});
		}
		// Destroy connection
		connection.destroy();
		const embed = new EmbedBuilder().setColor("Blue").setTitle("Left channel").setDescription("Left voice channel.");
		interaction.reply({embeds:[embed]});
	},
};