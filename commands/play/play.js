const {SlashCommandBuilder} = require('discord.js');
const path = require('node:path');
const {search} = require(path.join('..','..','Handlers','musicHandler'));
//const { leaveChannel }  = require(path.join(__dirname,"..","..","Handlers","radioHandler.js"));
const {joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { useMainPlayer, useQueue } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("play a song from YouTube.")
		.addStringOption(option =>
            option.setName("searchterms").setDescription("search keywords").setRequired(true)),
	execute: async (interaction, client) => {

        // Invalid Voice channel check
        if(!interaction.member.voice.channel) {
            await interaction.reply("You are not in a voice channel! Join a channel and try again.");
            return;
        }

        // Check for connection
        var connection = getVoiceConnection(interaction.member.voice.channel.guild.id);
        // Create new if needed
        if(!connection) connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId:   interaction.member.voice.channel.guild.id,
            adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator
        });
        //const player = useMainPlayer();
        var queue = useQueue(interaction.member.voice.channel.guild.id);
        if(!queue) {
            queue = await useMainPlayer().nodes.create(interaction.member.voice.channel.guild.id,{
                metadata: {
                    channel: interaction.channel,
                    client: interaction.guild.members.me,
                    requestedBy: interaction.user,
                    },
                selfDeaf: true,
                volume: 80,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 300000,
                leaveOnEnd: true,
                leaveOnEndCooldown: 300000,
                });
                queue.createDispatcher(connection);
        }

        await interaction.deferReply();

        try {
            search(interaction,client,queue);
        } catch (e) {
            console.log(e);
            return interaction.followUp('Operation Canceled.');
        }
	},
}