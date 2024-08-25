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
    
    // wait for previous task to be released and our task to be resolved
    await queue.tasksQueue.acquire().getTask();
    // Play the playlist or add it to the queue
    const track = result.tracks[0]; // TODO: Make user select result
    queue.addTrack(track);
    
    try{
        if(!queue.node.isPlaying()){
            await queue.node.play();
        }
    }catch(err) {
        interaction.followUp("Operation Caneled");
    }finally {
        // release the task we acquired to let other tasks to be executed
        queue.tasksQueue.release();
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