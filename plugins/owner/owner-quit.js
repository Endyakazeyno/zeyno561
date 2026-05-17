let handler = async (m, { conn, args, command }) => {
await m.reply('`𝚭𝚵𝚼𝚴𝚰 𝚩𝚰𝚮 tra pococ abbandonerà il grupp!!! ciao ciao, è stato un piacere essere con voi però mi so rotto i coglioni allora esco porco dio`') 
await  conn.groupLeave(m.chat)}
handler.command = /^(out|leavegc|leave|salirdelgrupo)$/i
handler.group = true
handler.rowner = true
export default handler
