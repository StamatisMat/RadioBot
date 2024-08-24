const {SlashCommandBuilder} = require('discord.js');
const path = require('node:path');
const {radioLeaveChannel} = require(path.join(__dirname,"..","..","Handlers","radioHandler.js"));
const { EmbedBuilder }  = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Leaves the channel'),
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
			interaction.reply({embeds:[embed]});
			return;
		}
		
		// Destroy current player. Avoids having 2 simultaneous players.
		radioLeaveChannel(interaction,client);
		/*if(client.state === 1) radioLeaveChannel(interaction,client);
		else if(client.state === 2) playLeave(interaction, client);*/
		const embed = new EmbedBuilder().setColor("Blue").setTitle("Left the channel").setDescription("A bit sad really.");
		interaction.reply({embeds:[embed]});
	},
};