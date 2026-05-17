// by Endy

let handler = async (m, { conn, command }) => {
  let isOpen = command === 'aperto'

  await conn.groupSettingUpdate(
    m.chat,
    isOpen ? 'not_announcement' : 'announcement'
  )

  const text = isOpen
    ? `*『 🟢 』 𝐆𝐫𝐮𝐩𝐩𝐨 𝐚𝐩𝐞𝐫𝐭𝐨.*\n\n*𝙤𝙧𝙖 𝙘𝙖𝙣𝙞 𝙥𝙤𝙩𝙚𝙩𝙚 𝙖𝙗𝙗𝙖𝙞𝙖𝙧𝙚*\n\n> 𝚭𝚵𝚼𝚴𝚰 𝚩𝚰𝚮`
    : `*『 🔴 』 𝐆𝐫𝐮𝐩𝐩𝐨 𝐜𝐡𝐢𝐮𝐬𝐨.*\n\n*𝙯𝙞𝙩𝙩𝙞 𝙘𝙖𝙣𝙞 𝙤𝙧𝙖 𝙥𝙖𝙧𝙡𝙖𝙣𝙤 𝙞 𝙫𝙤𝙨𝙩𝙧𝙞 𝙥𝙖𝙙𝙧𝙤𝙣𝙞*\n\n>𝚭𝚵𝚼𝚴𝚰 𝚩𝚰𝚮`

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {})
    }
  }, { quoted: m })
}

handler.help = ['aperto', 'chiuso']
handler.tags = ['group']
handler.command = /^(aperto|chiuso)$/i
handler.admin = true
handler.botAdmin = true

export default handler
