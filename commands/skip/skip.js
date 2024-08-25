const {SlashCommandBuilder} = require('discord.js');
const path = require('node:path');
const {search} = require(path.join('..','..','Handlers','musicHandler'));
//const { leaveChannel }  = require(path.join(__dirname,"..","..","Handlers","radioHandler.js"));
const {joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { useMainPlayer, useQueue } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Skips a/many song(s)")
		.addIntegerOption(option =>
            option.setName("songsnum").setDescription("Number of songs skipped").setRequired(false)),
	execute: async (interaction, client) => {

        // Invalid Voice channel check
        if(!interaction.member.voice.channel) {
            await interaction.reply("You are not in a voice channel! Join a channel and try again.");
            return;
        }

        //const player = useMainPlayer();
        let queue = useQueue(interaction.member.voice.channel.guild.id);
        if(!queue) {
            await interaction.reply("There is nothing to skip. Queue a song by searching it using '/play query'");
            return;
        }

        await interaction.deferReply();
        const ind = interaction.options.getInteger("songsnum",true)
        if(queue.getSize()>ind){
            await interaction.reply("Too many songs skipped. Skip less songs or delete queue by using /stop");
            return;
        }
        try {
            for(let i=0;i<ind;i++) {
                await queue.skip();
            }
        } catch (e) {
            console.log(e);
            return interaction.followUp('Operation Canceled.');
        }
        interaction.followUp(`Skipped ${ind} songs`);
	},
}