const {SlashCommandBuilder} = require('discord.js');
const {playMusic, addStation, removeStation, display} = require('./radioHandler.js')

// Command Structure. All the logic is on the handler
module.exports = {
	data: new SlashCommandBuilder()
		.setName('radio')
		.setDescription('Taking shape')
        .addSubcommand((subCommand) => subCommand.setName("play")
                                                .setDescription("Plays music from an index to a radio")
                                                .addIntegerOption((option) => option.setName('index')
                                                    .setDescription('Index of the radio you want to choose'))
                                                )
        .addSubcommand((subCommand) => subCommand.setName("add")
                                                .setDescription("Adds a radio to the list")
                                                .addStringOption((option) => option.setName('link')
                                                    .setDescription('Link of the mp3 file of the radio you want to choose'))
                                                .addStringOption((option) => option.setName('title')
                                                    .setDescription('Title of the Radio'))
                                                )
        .addSubcommand((subCommand) => subCommand.setName("remove")
                                                .setDescription("Removes a radio from the list")
                                                .addIntegerOption((option) => option.setName('index')
                                                    .setDescription('Index of the radio you want to remove'))
                                                )
        .addSubcommand((subCommand) => subCommand.setName("display")
                                                .setDescription("Displays all the radios")
                                                )
        ,
	async execute(interaction) {
        // Get sub command
        const subCommand = interaction.options.getSubcommand();

        // Figure out what it is and call the apropriate function from the handler.
        switch(subCommand){
            case "play" :{
                var index = interaction.options.getInteger('index');
                if(index === null) {
                    await interaction.reply("Usage: /radio play \'index\' (index is a number)");
                    return;
                }
                playMusic(interaction,index);
                return;
            }
            case "add" : {
                var link = interaction.options.getString('link');
                var title = interaction.options.getString('title');
                if(link===null || title === null){
                    await interaction.reply("Usage: /radio add \'link\' \'title\'");
                    return;
                }
                addStation(interaction,link,title);
                return;
            }
            case "remove" : {
                var index = interaction.options.getInteger('index');
                if(index === null) {
                    await interaction.reply("Usage: /radio remove \'index\' (index is a number)");
                    return;
                }
                removeStation(interaction,index);
                return;
            }
            case "display" : {
                display(interaction);
            }
        }
	},
};