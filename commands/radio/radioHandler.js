const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');


// The path to the json file.
const dbPath = path.join(path.dirname(path.dirname(__dirname)),'/resources/radios-db.json');
console.log("local radio db path: "+dbPath);
var radioLinks;
var radioTitles;
retrieveStations();

// Function that retrieves the stations from a json file
function retrieveStations() {
    let myPromise = new Promise(function(myResolve, myReject){
        if(!fs.existsSync(dbPath)){
            fs.writeFileSync(dbPath, JSON.stringify({}), err => {
                if(err){
                    console.log(err);
                }
            });
        }
        fs.readFile(dbPath, 'utf8', (err, jsonString) => {
            if(err){
                console.log('Cannot read json file');
                console.log(err);
                myReject("Couldn't read the database.");
            }else{
                myResolve(JSON.parse(jsonString));
            }
        });   
    });
    // .then stuff.
    myPromise.then(
        function(value) {radioLinks=value.links;radioTitles=value.titles},
    );
    myPromise.catch(
        function () { console.log("Couldn't fetch the local Database. Please contact the admin of this bot.");}
    )
}

// Function that updates the json file. Deletes it and builds it from scratch.
function updateStations() {
    // Useful strings to prettify the json file
    const start = `{\n"links":`;
    const middle = `,\n\n"titles":`;
    const end = `}`
    // Promise for fs write.
    let myPromise = new Promise(function(myResolve, myReject){
        if(!fs.existsSync(dbPath)){
            fs.writeFileSync(dbPath, JSON.stringify({}), err => {
                if(err){
                    console.log(err);
                }
            });
        }
        // I got the json file to do tabs. You can substitute for an integer number of blank spaces .
        fs.writeFile(dbPath, start+JSON.stringify(radioLinks,null,'\t')+middle+JSON.stringify(radioTitles,null,'\t')+end,'utf8', (err) => {
            if(err){
                console.log('Cannot write to json file');
                console.log(err);
                myReject("Couldn't update the database.");
            }else{
                myResolve();
            }
        });  
    });
    // .then stuff.
    myPromise.then(
        function() {console.log("Successfully updated Database!");}
    )
    myPromise.catch(
        function() {}
    )
}

// Function that displays the current stations
function display(interaction) {
    // Undef check
    if(typeof radioLinks === 'undefined') retrieveStations();
    // Empty check
    if(radioTitles.length==0){
        interaction.reply("There are no radios yet. Add one using: /radio add \'link\' \'title\'");
        return;
    }
    // Prepare message
    var msg = "";
    for(var i=0;i<radioTitles.length;i++) {
        msg+=(i+1)+". "+radioTitles[i]+"\n";
    };
    msg+= "Usage: /radio play \'index\' (index: number in radio list.)"
}

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

// Function that adds a station into the database
async function addStation(interaction,link,title) {
    // Check for link. Needs better check
    if(link[0]!='h'||link[1]!='t'||link[2]!='t'||link[3]!='p') {
        await interaction.reply("Invalid Link: Usage: /radio add \'link\' \'title\' ");
        return;
    }
    // Check for included link
    if(radioLinks.includes(link)) {
        const embed = new EmbedBuilder().setColor("Red").setTitle("ERROR").setDescription(`Link \'${link}\' already in the radio database`);
        interaction.reply({embeds:[embed]});
        return;
    }
    // Check for included title
    if(radioTitles.includes(title)) {
        const embed = new EmbedBuilder().setColor("Red").setTitle("ERROR").setDescription(`Title \'${title}\' already in the radio database`);
        interaction.reply({embeds:[embed]})
        return;
    }
    // Ask question from text
    // Response: boolean
    var response = await askUser(interaction,`Do you want to add ${title} to the radio Database?`);
    if(response===true){
        // Add radio on the end of each list
        radioLinks.push(link);
        radioTitles.push(title);
        // Update DB and user
        updateStations();
        interaction.editReply(`${title} successfully added to the database!`);
    }else {
        interaction.editReply(`Operation Canceled`);
    }
    return;
}

// Function that removes a station from the database
async function removeStation(interaction,index) {
    // Undef check
    if(typeof radioLinks === 'undefined') retrieveStations();
    // Invalid index check
    if(index>radioLinks.length || index<=0) {
        await interaction.reply("Usage: /radio remove \'index\' (index is a number)");
        return;
    }
    // Asks question from text
    // Response:boolean 
    var response = await askUser(interaction,`Do you want to remove ${radioTitles[index-1]} from the radio Database?`);
    if(response===true){
        // Keeps title to edit reply
        var title = radioTitles[index-1];
        // Remove index
        radioLinks.splice(index-1,1);
        radioTitles.splice(index-1,1);
        // Update stations and user
        updateStations();
        interaction.editReply(`${title} successfully removed from the database!`);
    }else {
        interaction.editReply(`Operation Canceled`);
    }
    return;
}

// Function that plays music from the index provided.
async function playMusic(interaction,index) {
    
    // Undef check
    if(typeof radioLinks === 'undefined') retrieveStations();
    // Invalid index check
    if(index>radioLinks.length || index<=0) {
        await interaction.reply("Usage: /radio play \'index\' (index is a number)");
        return;
    }
    // Invalid Voice channel check
    if(!interaction.member.voice.channel) {
        await interaction.reply("You are not in a voice channel! Join a channel and try again.");
        return;
    }
    // Connection start
    const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId:   interaction.member.voice.channel.guild.id,
        adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator
    });
    // Audio player creation from audio resource
    const player = createAudioPlayer();
    const resource = createAudioResource(radioLinks[index-1]);
    // Connection subscription
    connection.subscribe(player);
    player.play(resource);
    
    // Reply
    const embed = new EmbedBuilder().setColor("Green").setTitle("Now Playing").setDescription(radioTitles[index-1]);
    interaction.reply({embeds:[embed]});
}



module.exports = {playMusic, addStation, removeStation, display, retrieveStations, updateStations};