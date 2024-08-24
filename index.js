// Initialize dotenv
require('dotenv').config();

// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, Events, GatewayIntentBits } = require('discord.js');
const loadCommands = require('./Handlers/CommandHandler.js');
const path = require('node:path');
const { Player } = require("discord-player");
const { YoutubeiExtractor } = require("discord-player-youtubei");

var repl = false;
const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent
      ]
})

const commandsPath = path.join(__dirname,'commands');

/* 
   States:
   0 - idle
   1 - radio
   2 - youtube/soundcloud (uses discord-player)
*/
client.state = 0; // Maybe migrate to discord-player for radio as well to save this hassle. Or do what I already did and screw everything up using Dispatchers.

client.on('ready', () => {
   console.log(`Logged in as ${client.user.tag}!`);
});

// Add the player on the client
player = new Player(client);
player.extractors.loadDefault((ext) => ext !== 'com.discord-player.youtubeextractor');
player.extractors.register(YoutubeiExtractor, {});

// Log In our bot, then reload the commands.
client.login(process.env.BOT_TOKEN).then(()=>loadCommands(client,path, commandsPath));




// Automation of command handling, mostly done in Command Handler.
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
   // Error logging
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
   // Try catch to make sure the bot continues to work.
	try {
		await command.execute(interaction,client);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// this event is emitted whenever discord-player starts to play a track
player.events.on('playerStart', (queue, track) => {
   // we will later define queue.metadata object while creating the queue
   queue.metadata.channel.send(`Started playing **${track.title}**!`);
});

// Silly messages to test the reply/react/send gif functions.
client.on('messageCreate', msg => {
    //console.log(msg);
   
    // You can view the msg object here with console.log(msg)
   if(msg.author.id!=client.user.id && repl){
      msg.reply("I am deeply moved by your feelings. I can assure you that everything will be fine.");
      repl = false;
   }
   else if (msg.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
      msg.reply("You have summoned me, please explain all your problems in a single paragraph.");
      repl = true;
   }
   else if (msg.content == 'Hello') {
      msg.reply(`Hello <@${msg.author.id}>`);
   }else if(msg.content == '.') {
      msg.reply(`Write something.<@${msg.author.id}> It's free!`);
   }else if(msg.content.toLowerCase() == 'how are you?' || msg.content.toLowerCase() == "how are you") {
      msg.reply(`Fuck you <@${msg.author.id}> I hope I die today.`);
   }else if(msg.content.toLowerCase() == 'kalos') {
      msg.channel.send('https://tenor.com/view/kalos-gif-15532820');
   }else if(msg.content.toLowerCase() == 'kalo') {
      msg.channel.send('https://tenor.com/view/poly-kalo-very-good-%cf%80%ce%bf%ce%bb%cf%85-%ce%ba%ce%b1%ce%bb%ce%bf-gif-15065236');
   }else if(msg.content.toLowerCase() == 'good job') {
      msg.react('❤️');
      msg.reply(`Shrek, is that you?`);
   }
});