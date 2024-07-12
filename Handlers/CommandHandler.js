module.exports = async function loadCommands(client, path, foldersPath) {
    require('dotenv').config();
    const { REST, Routes } = require('discord.js');
    const {Collection} = require('discord.js');
    const fs = require('node:fs');

    const commandFolders = fs.readdirSync(foldersPath);
    client.commands = new Collection();
    const commandsArray = []

    for(const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commandsArray.push(command.data.toJSON())
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(process.env.BOT_TOKEN);

    // and deploy your commands!
    (async () => {
        try {
            console.log(`Started refreshing ${commandsArray.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationCommands(process.env.BOT_ID),
                { body: commandsArray },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();

}

