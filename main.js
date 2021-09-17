const fs = require('fs');
const { Client, Intents, DiscordAPIError, MessageEmbed, Collection } = require("discord.js");
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
});
const settings = {
    prefix: '!',
    token: 'ODg2OTIwMDE3NTU0MzI5NjIw.YT8mog.ESE1Gi3kiQEyPSeRiF0N320J_qw'
};

const { Player } = require("discord-music-player");
const player = new Player(client, {
    leaveOnEmpty: false, // This options are optional.
});
// You can define the Player as *client.player* to easly access it.
client.player = player;

client.on("ready", () => {
    console.log("Ready aaaa");
});

client.login(settings.token);


const { RepeatMode } = require('discord-music-player');

// Init the event listener only once (at the top of your code).
client.player
    // Emitted when channel was empty.
    .on('channelEmpty', (queue) =>
        console.log(`Everyone left the Voice Channel, queue ended.`))
    // Emitted when a song was added to the queue.
    .on('songAdd', (queue, song) =>
        console.log(`Song ${song} was added to the queue.`))
    // Emitted when a playlist was added to the queue.
    .on('playlistAdd', (queue, playlist) =>
        console.log(`Playlist ${playlist} with ${playlist.songs.length} was added to the queue.`))
    // Emitted when there was no more music to play.
    .on('queueEnd', (queue) =>
        console.log(`The queue has ended.`))
    // Emitted when a song changed.
    .on('songChanged', (queue, newSong, oldSong) =>
        console.log(`${newSong} is now playing.`))
    // Emitted when a first song in the queue started playing.
    .on('songFirst', (queue, song) =>
        console.log(`Started playing ${song}.`))
    // Emitted when someone disconnected the bot from the channel.
    .on('clientDisconnect', (queue) =>
        console.log(`I was kicked from the Voice Channel, queue ended.`))
    // Emitted when deafenOnJoin is true and the bot was undeafened
    .on('clientUndeafen', (queue) =>
        console.log(`I got undefeanded.`))
    // Emitted when there was an error in runtime
    .on('error', (error, queue) => {
        console.log(`Error: ${error} in ${queue.guild.name}`);
    });

client.on('messageCreate', async (message) => {
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift();
    let guildQueue = client.player.getQueue(message.guild.id);

    if (command === 'spank') {
        if (args[0]) {
            const user = getUserFromMention(args[0]);

            if (!user) {
                return message.reply('Tag someone woi');
            }

            return message.channel.send(`You spanked <@${user.id}>`);
        }

        return message.channel.send(`Tag someone to spank, or you want to spank yourself?`);
    }


    if (command === 'help') {
        const embed = new MessageEmbed()
            .setColor('#00D100')
            .setTitle('Commands')
            .setAuthor('ahyech99')
            .setDescription('Commands la jibai dunno read isit')
            .addFields(
                { name: '!play / !p', value: 'Usage: !play <url/song name> / !p <url/song name>' },
                { name: '!playlist', value: 'Usage: !playlist <url/playlist>' },
                { name: '!queue', value: 'Usage: !queue (WIP)' },
                { name: '!skip / !sk', value: 'Usage: !skip / !sk (Skip current song)' },
                { name: '!stop / !st / !leave', value: 'Usage: !skip / !sk / !leave (Stop and leave voice channel)' },
                { name: '!shuffle', value: 'Usage: !shuffle (Shuffle queue)' },
                { name: '!clear', value: 'Usage: !clear (Clear queue)' },
                { name: '!now', value: 'Usage: !now (Get the current playing song)' },
                { name: '!pause', value: 'Usage: !pause (Pause the song)' },
                { name: '!resume', value: 'Usage: !resume (Resume the song)' },
                { name: '!loop / !l', value: 'Usage: !loop / !l (Loop the current playing song)' },
                { name: '!loopQueue / !lq', value: 'Usage: !loopQueue / !lq (Loop the current queue)' },
                { name: '!removeLoop / !noloop /', value: 'Usage: !noloop / !removeLoop (Stop the loop (Queue/Song))' },
                { name: '!remove', value: 'Usage: !remove <int> (WIP)' },
            )
        message.channel.send({ embeds: [embed] });
    }

    if (command === 'play' || command === 'p') {
        try {
            let queue = client.player.createQueue(message.guild.id);
            await queue.join(message.member.voice.channel);
            let song = await queue.play(args.join(' ')).catch(_ => {
                if (!guildQueue)
                    queue.stop();
            });
            message.channel.send(`Added ${song} into the queue!`);
        } catch (error) {
            console.log(error);
        }
    }

    if (command === 'playlist') {
        try {
            let queue = client.player.createQueue(message.guild.id);
            await queue.join(message.member.voice.channel);
            let song = await queue.playlist(args.join(' ')).catch(_ => {
                if (!guildQueue)
                    queue.stop();
            });
            message.channel.send(`Added ${song} playlist`);
        } catch (error) {
            console.log(error);
        }
    }

    if (command === 'skip' || command === 'sk' || command === 's') {
        guildQueue.skip();
        message.channel.send(`Skipped`);
    }

    if (command === 'stop' || command === 'leave' || command === 'st') {
        message.channel.send(`Byebye`)
        guildQueue.stop();
    }

    if (command === 'removeLoop' || command === 'noLoop' || command === 'noloop') {
        guildQueue.setRepeatMode(RepeatMode.DISABLED); // or 0 instead of RepeatMode.DISABLED
    }

    if (command === 'loop' || command === 'l') {
        guildQueue.setRepeatMode(RepeatMode.SONG); // or 1 instead of RepeatMode.SONG
        message.channel.send(`Looping current song`);
    }

    if (command === 'loopQueue' || command === 'lq') {
        guildQueue.setRepeatMode(RepeatMode.QUEUE); // or 2 instead of RepeatMode.QUEUE
        message.channel.send(`Looping current queue`);
    }

    if (command === 'setVolume') {
        guildQueue.setVolume(parseInt(args[0]));
    }

    if (command === 'seek') {
        guildQueue.seek(parseInt(args[0]) * 1000);
    }

    if (command === 'clear') {
        guildQueue.clearQueue();
    }

    if (command === 'shuffle') {
        guildQueue.shuffle();
    }

    if (command === 'getQueue') {
        console.log(guildQueue);
        message.channel.send(guildQueue.Song);
    }

    if (command === 'getVolume') {
        console.log(guildQueue.volume)
    }

    if (command === 'now') {
        console.log(`Now playing: ${guildQueue.nowPlaying}`);
        message.channel.send(`Now playing: ${guildQueue.nowPlaying}`);
    }

    if (command === 'pause') {
        guildQueue.setPaused(true);
    }

    if (command === 'resume') {
        guildQueue.setPaused(false);
    }

    if (command === 'remove') {
        guildQueue.remove(parseInt(args[0]));
    }

    if (command === 'progress') {
        const ProgressBar = guildQueue.createProgressBar();
        // [======>              ][00:35/2:20]
        console.log(ProgressBar.prettier);
        message.channel.send(ProgressBar.prettier);
    }
})


//function
function getUserFromMention(mention) {
    // The id is the first and only match found by the RegEx.
    const matches = mention.match(/^<@!?(\d+)>$/);

    // If supplied variable was not a mention, matches will be null instead of an array.
    if (!matches) return;

    // However, the first element in the matches array will be the entire mention, not just the ID,
    // so use index 1.
    const id = matches[1];

    return client.users.cache.get(id);
}
