const { EmbedBuilder }  = require('discord.js');
const { QueryType, useMainPlayer }     = require("discord-player");

async function search(interaction,client,queue) {
    // Search for the song using the discord-player
    let url = interaction.options.getString("searchterms",true);

    const result = await useMainPlayer().search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO
    });

    // Return if no tracks were found
    if (result.tracks.length === 0)
        return interaction.reply("No results"); // TODO: Embed reply
    
    // Play the playlist or add it to the queue
    const track = result.tracks[0];
    queue.addTrack(track);
    
    if(!queue.node.isPlaying()){
        console.log("Im not playing games now");
        await queue.node.play();
    } 
    /*const {track} = await useMainPlayer().play(interaction.member.voice.channel,url,{
        nodeOptions: {
        // nodeOptions are the options for guild node (aka your queue in simple word)
        metadata: interaction // we can access this metadata object using queue.metadata later on
    }});*/
    const embed = new EmbedBuilder().setColor("Green").setDescription(`**[${track.title}](${track.url})** has been added to the Queue`).setThumbnail(track.thumbnail).setFooter({ text: `Duration: ${track.duration}`});
    interaction.followUp({embeds:[embed]});
}
async function playLeave(interaction,client, queue) {

    // Deletes all the songs from the queue and exits the channel
	client.player.destroy();
}

module.exports = {search,playLeave};