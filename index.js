// Initialize dotenv
require('dotenv').config();

// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const loadCommands = require('./Handlers/CommandHandler.js');
const path = require('node:path');
var repl = false;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
        ]
})

const commandsPath = path.join(__dirname,'commands');



client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
});

// Log In our bot, then reload the commands.
client.login(process.env.BOT_TOKEN).then(()=>loadCommands(client,path, commandsPath));


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

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