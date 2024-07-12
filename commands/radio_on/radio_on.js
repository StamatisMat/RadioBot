const {SlashCommandBuilder} = require('discord.js');

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
        ,
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        switch(subCommand){
            case "play" :{
                var index = interaction.options.getInteger('index');
                if(index === null) {
                    await interaction.reply("Usage: /radio play \'index\' (index is a number)");
                    return;
                }
                await interaction.reply("Playing radio(not): "+index);
                return;
            }
            case "add" : {
                var link = interaction.options.getString('link');
                var title = interaction.options.getString('title');
                if(link===null || title === null){
                    await interaction.reply("Usage: /radio add \'link\' \'title\'");
                    return;
                }
                await interaction.reply("Adding radio(not) with link: "+link+" and title: "+title);
                return;
            }
            case "remove" : {
                var index = interaction.options.getInteger('index');
                if(index === null) {
                    await interaction.reply("Usage: /radio remove \'index\' (index is a number)");
                    return;
                }
                await interaction.reply("Removing radio(not): "+index);
                return;
            }
        }
	},
};