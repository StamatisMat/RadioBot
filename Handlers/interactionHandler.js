
// Function that asks the user a question and expects a thumbs up or thumbs down reaction
async function askUser(interaction,text){
    // Make the message that the user will reply to
    const message = await interaction.reply({
        content: text,
        fetchReply:true
    });
    // Returned var
    ret = false;

    // React to message so the user can find the reactions quickly.
    message.react("👍").then(()=> message.react("👎"));
    // Filter out only the useful emojis and the correct user
    const filter = (reaction,user) => {return ['👍','👎'].includes(reaction.emoji.name) && user.id == interaction.user.id};
    // Wait for the reactions, then filter out accordingly.
    await message.awaitReactions({filter, max: 1, time:15000,errors:["time"]})
                        .then((collected)=> {
                            const reaction = collected.first();
                            if(reaction.emoji.name =="👍") {
                                ret=true;
                            }else {
                                ret=false;
                            }
                        })
                        .catch((collected)=> {ret = false;})
    return ret;
}

module.exports = {askUser};