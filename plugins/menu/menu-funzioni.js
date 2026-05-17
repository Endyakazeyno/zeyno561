import fs from 'fs'
import fetch from 'node-fetch'

function stato(value) {
  return value ? '🟢 *𝐀𝐭𝐭𝐢𝐯𝐨*' : '⚪ *𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐨*'
}

let handler = async (m, { conn, usedPrefix }) => {
  const chat = global.db?.data?.chats?.[m.chat] || {}
  const bot = global.db?.data?.settings?.[conn.user.jid] || {}

  let pp = null
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {}

  let thumbnail = null
  try {
    if (pp) {
      const res = await fetch(pp)
      if (res.ok) thumbnail = Buffer.from(await res.arrayBuffer())
    }
  } catch {}

  if (!thumbnail) {
    try {
      thumbnail = fs.readFileSync('./media/default-avatar.png')
    } catch {}
  }

  const text = `╭━━━━━━━⚙️━━━━━━━╮
*✦ 𝚭𝚵𝚼𝚴𝚰 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈 ✦*
╰━━━━━━━⚙️━━━━━━━╯

*🛡️ 𝐒𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚*
*◈ 𝐀𝐧𝐭𝐢𝐥𝐢𝐧𝐤:* ${stato(chat.antiLink)}
*◈ 𝐀𝐧𝐭𝐢𝐛𝐨𝐭:* ${stato(chat.antiBot)}
*◈ 𝐀𝐧𝐭𝐢𝐠𝐨𝐫𝐞:* ${stato(chat.antigore)}
*◈ 𝐀𝐧𝐭𝐢𝐌𝐞𝐝𝐢𝐚:* ${stato(chat.antimedia)}

*⚙️ 𝐆𝐞𝐬𝐭𝐢𝐨𝐧𝐞*
*◈ 𝐬𝐨𝐥𝐨 𝐀𝐝𝐦𝐢𝐧:* ${stato(chat.modoadmin)}
*◈ 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨:* ${stato(chat.welcome)}
*◈ 𝐀𝐝𝐝𝐢𝐨:* ${stato(chat.goodbye)}

*──────────────*

*🟢 𝐀𝐭𝐭𝐢𝐯𝐚:* *${usedPrefix}attiva <funzione>*
*⚪ 𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚:* *${usedPrefix}disattiva <funzione>*`

await conn.sendMessage(m.chat, {
  text,
  footer: '𝚭𝚵𝚼𝚴𝚰 𝚩𝚰𝚮',
  buttons: [
    {
      buttonId: `${usedPrefix}menu`,
      buttonText: {
        displayText: '⬅️ Menu Principale'
      },
      type: 1
    }
  ],
  headerType: 1,
  contextInfo: {
    ...(global.rcanal?.contextInfo || {}),
    ...(thumbnail ? {
      externalAdReply: {
        title: '𝚭𝚵𝚼𝚴𝚰 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐈',
        body: 'Stato moduli del sistema',
        thumbnail,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    } : {})
  }
}, { quoted: m })
}

handler.help = ['funzioni']
handler.tags = ['group']
handler.command = /^(funzioni|statusfunzioni|moduli)$/i

export default handler
