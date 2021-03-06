const Eris = require('eris')
const Database = require('better-sqlite3')
require('dotenv').config()
const db = new Database('star.db')
const client = new Eris(process.env.TOKEN)

db.prepare('CREATE TABLE IF NOT EXISTS starids (msgid TEXT PRIMARY KEY, starid TEXT NOT NULL)').run()

client.on('ready', () => {
  console.log('The Starboard has offically booted with no errors.')
  client.editStatus('online', { name: 'the Starboard', type: 3 })
})

client.on('messageReactionAdd', async (message, emoji, user) => {
  if (message.channel.type !== 0 || emoji.name !== '⭐') return

  const channel = client.getChannel(message.channel.id)
  const starboard = channel.guild.channels.find(c => c.name.toLowerCase() === 'starboard')

  if (channel.nsfw || !starboard || channel.id === starboard.id) return

  const msg = await channel.getMessage(message.id)
  const stars = (await msg.getReaction('⭐', msg.reactions['⭐'].count)).filter(u => u.id !== msg.author.id && !client.users.get(u.id).bot).length

  if (stars <= process.env.STARSREQUIRED) return

  if (msg.content.length === 0 && msg.attachments.length === 0 && (!msg.embeds[0] || msg.embeds[0].type !== 'image')) return

  const starId = await getMessageFromDatabase(msg.id)

  if (!starId) {
    if (!stars) return

    const starMsg = await starboard.createMessage({
      content: `**Starboard: ${stars} ⭐ - <#${msg.channel.id}> <@${msg.author.id}> has made it!**`,
      embed: {
        color: 16775619,
        footer: {
          icon_url: client.user.avatarURL,
          text: `Message ID: ${msg.id}`
        },
        author: {
          name: `${msg.author.username}#${msg.author.discriminator} - Starboard`,
          icon_url: msg.author.avatarURL
        },
        image: resolveAttachment(msg),
        timestamp: new Date(),
        fields: [
          {
            name: 'Message Content',
            value: `${msg.content || '**__Image: No Text.__**'}`
          },
          {
            name: 'Jump To Message',
            value: `[Click Here](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id})`
          }
        ]
      }
    })

    db.prepare('INSERT INTO starids VALUES (?, ?)').run(msg.id, starMsg.id)
  } else {
    const starMessage = await starboard.getMessage(starId)
    if (!starMessage) return
    await starMessage.edit(`**__Starboard:__** ${stars} ⭐ - <#${msg.channel.id}> <@${msg.author.id}> has made it!`)
  }
})

client.on('messageReactionRemove', async (message, emoji, user) => {
  if (message.channel.type !== 0 || emoji.name !== '⭐') return

  const channel = client.getChannel(message.channel.id)
  const starboard = channel.guild.channels.find(c => c.name.toLowerCase() === 'starboard')

  if (!starboard || channel.id === starboard.id) return

  const msg = await channel.getMessage(message.id)
  const starId = await getMessageFromDatabase(msg.id)
  if (!starId) return

  const starMessage = await starboard.getMessage(starId)
  if (!starMessage) return

  if (!msg.reactions['⭐']) {
    db.prepare('DELETE FROM starids WHERE msgid = ?').run(msg.id)
    return await starMessage.delete()
  }

  const stars = (await msg.getReaction('⭐', msg.reactions['⭐'].count)).filter(u => u.id !== msg.author.id && !client.users.get(u.id).bot).length

  if (!stars) {
    db.prepare('DELETE FROM starids WHERE msgid = ?').run(msg.id)
    return await starMessage.delete()
  }

  await starMessage.edit(`$**__Starboard:__** ${stars} ⭐ - <#${msg.channel.id}> ${msg.author.username}#${msg.author.discriminator} has made it!`)
})

function getMessageFromDatabase (msgid) {
  return (db.prepare('SELECT * FROM starids WHERE msgid = ?').get(msgid) || {}).starid
}

function resolveAttachment (msg) {
  if (msg.attachments.length > 0 && msg.attachments[0].width) {
    return msg.attachments[0]
  } else if (msg.embeds.length > 0 && msg.embeds[0].type === 'image') {
    return msg.embeds[0].image || msg.embeds[0].thumbnail
  } else {
    return null
  }
}

client.connect()
