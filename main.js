process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
try {
    await import('./private.js');
} catch {
    console.log('private.js non trovato');
}
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import { format } from 'util';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';
const RESTART_FILE = './tmp/restart-state.json';
for (const dir of ['./temp', './tmp']) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

const DisconnectReason = {
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503
};
const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, makeInMemoryStore } = await import('@realvare/baileys');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
protoType();
serialize();
global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};
let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
let phoneNumber = global.botNumberCode;

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '?!/').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']');
global.db = new Low(new JSONFile('database.json'));
global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (!global.db.READ) {
                    clearInterval(interval);
                    resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
                }
            }, 1 * 1000);
            setTimeout(() => {
                clearInterval(interval);
                global.db.READ = null;
                reject(new Error('loadDatabase timeout'));
            }, 15000);
        }).catch((e) => {
            console.error('[ERRORE] loadDatabase:', e.message);
            return global.loadDatabase();
        });
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

global.creds = 'creds.json';
global.authFile = 'session';

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterCache = new NodeCache();
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
    do {
    const cyan1 = chalk.hex('#4B0082');     // DeepSkyBlue
    const cyan2 = chalk.hex('#6A1B9A');     // DarkTurquoise
    const cyan3 = chalk.hex('#3F00FF');     // LightSeaGreen
    const green = chalk.hex('#191970');     // Emerald
    const whiteSoft = chalk.hex('#0A1429'); // Soft white
    const redSoft = chalk.hex('#1C0F2E');   // Soft red

        const a = cyan1('╭━━━━━━━━━━━━━• 𝚭𝚵𝚼𝚴𝚰 𝐂𝐎𝐑𝐄 •━━━━━━━━━━━━━');
    const b = cyan1('╰━━━━━━━━━━━━━• 𝚭𝚵𝚼𝚴𝚰 𝐄𝐍𝐃 •━━━━━━━━━━━━━');
    const linea = cyan2('   ─────────◈────────◈─────────◈─────────');
    const sm = cyan3.bold('   ⚡ SISTEMA DI AUTENTICAZIONE ⚡');

    const qr = cyan3(' ⌬') + ' ' + chalk.bold.white('MODALITÀ [1]: Sincronizzazione QR');
    const codice = cyan3(' ⌬') + ' ' + chalk.bold.white('MODALITÀ [2]: Link tramite Codice');

    const istruzioni = [
        cyan3(' ❯') + whiteSoft.italic(' Inizializzazione protocollo di accesso...'),
        cyan3(' ❯') + whiteSoft.italic(' Scegli un\'opzione per stabilire il link.'),
        whiteSoft.italic(''),
        cyan1.italic('                𝚭𝚵𝚼𝚴𝚰 𝐒𝐘𝐒𝐓𝐄𝐌 • 𝐕5.0.0'),
    ];

    const prompt = green.bold('\n⌬ axion-auth ➤ ');

    opzione = await question(`\n
${a}

          ${sm}
${linea}

${qr}
${codice}

${linea}
${istruzioni.join('\n')}

${b}
${prompt}`);

    if (!/^[1-2]$/.test(opzione)) {
        console.log(`\n${redSoft.bold('✖ ERRORE DI PROTOCOLLO: 𝚭𝚵𝚼𝚴𝚰-𝟒𝟎𝟒')}

${whiteSoft('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${redSoft.bold('⚠️ Input non riconosciuto dal Core.')} 
${whiteSoft('┌─⭓ Sono validi solo i parametri')} ${chalk.bold.green('1')} ${whiteSoft('o')} ${chalk.bold.green('2')}
${whiteSoft('└─⭓ Non inserire simboli, spazi o lettere.')}
${green.italic('\nSupporto Tecnico: Contatta lo sviluppatore endy lo trovi nei gruppi oppure nel confing')}
`);
    }
    } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

const groupMetadataCache = new NodeCache({ stdTTL: 300, useClones: false });
global.groupCache = groupMetadataCache;
const logger = pino({
    level: 'silent',
});
global.jidCache = new NodeCache({ stdTTL: 600, useClones: false });
global.store = makeInMemoryStore({ logger });

if (!global.__storePruneInterval) {
    global.__storePruneInterval = setInterval(() => {
        try {
            const store = global.store;
            if (!store || !store.messages) return;

            const MESSAGE_LIMIT = 40;
            for (const jid of Object.keys(store.messages)) {
                const list = store.messages[jid];
                const arr = list?.array;
                if (!arr || arr.length <= MESSAGE_LIMIT) continue;

                const keep = new Set(arr.slice(-MESSAGE_LIMIT).map(m => m?.key?.id).filter(Boolean));
                if (typeof list.filter === 'function') {
                    list.filter(m => keep.has(m?.key?.id));
                }
            }

            if (store.presences && typeof store.presences === 'object') {
                for (const k of Object.keys(store.presences)) delete store.presences[k];
            }

            if (global.gc) global.gc();
        } catch (e) {
            console.error('Errore pulizia store:', e);
        }
    }, 5 * 60 * 1000);
}

const makeDecodeJid = (jidCache) => {
    return (jid) => {
        if (!jid) return jid;
        const cached = jidCache.get(jid);
        if (cached) return cached;

        let decoded = jid;
        if (/:\d+@/gi.test(jid)) {
            decoded = jidNormalizedUser(jid);
        }
        if (typeof decoded === 'object' && decoded.user && decoded.server) {
            decoded = `${decoded.user}@${decoded.server}`;
        }
        jidCache.set(jid, decoded);
        return decoded;
    };
};
const connectionOptions = {
    logger: logger,
    browser: Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    decodeJid: makeDecodeJid(global.jidCache),
    printQRInTerminal: opzione === '1' || methodCodeQR ? true : false,
    cachedGroupMetadata: async (jid) => {
        const cached = global.groupCache.get(jid);
        if (cached) return cached;
        try {
            const metadata = await global.conn.groupMetadata(global.conn.decodeJid(jid));
            global.groupCache.set(jid, metadata, { ttl: 300 });
            return metadata;
        } catch (err) {
            console.error('Errore nel recupero dei metadati del gruppo:', err);
            return {};
        }
    },
    getMessage: async (key) => {
        try {
            const jid = global.conn.decodeJid(key.remoteJid);
            const msg = await global.store.loadMessage(jid, key.id);
            return msg?.message || undefined;
        } catch (error) {
            console.error('Errore in getMessage:', error);
            return undefined;
        }
    },
    msgRetryCounterCache,
    retryRequestDelayMs: 500,
    maxMsgRetryCount: 5,
    shouldIgnoreJid: jid => false,
};
global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);
global.pluginDebugErrors = global.pluginDebugErrors || {};
global.pluginDebugErrors = global.pluginDebugErrors || {};

global.sendPluginErrorToChat = async function (title, err, extra = '', retry = 0) {
    try {
        const jid = String(global.botErrorChat || '')
            .trim()
            .replace(/^['"]|['"]$/g, '');

        if (!jid) return;

        if (!global.conn || !global.conn.user) {
            if (retry < 3) {
                setTimeout(() => {
                    global.sendPluginErrorToChat(title, err, extra, retry + 1);
                }, 5000);
            }
            return;
        }

        const messageText = err?.message || String(err) || 'Errore sconosciuto';
        const stackText = String(err?.stack || err || 'Nessuno stack disponibile').slice(0, 3500);
        const debugId = `dbg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        global.pluginDebugErrors[debugId] = {
            title,
            extra,
            message: messageText,
            stack: stackText,
            createdAt: Date.now()
        };

        const text =
`🛠️ *Errore rilevato*

*Titolo:* ${title}
${extra ? `*Plugin:* ${extra}\n` : ''}*Messaggio:* ${messageText}`;

        await global.conn.sendMessage(jid, {
            text,
            footer: 'Axion Bot',
            buttons: [
                {
                    buttonId: `.debugplugin ${debugId}`,
                    buttonText: { displayText: '🛠️ Debug completo' },
                    type: 1
                }
            ],
            headerType: 1
        });
    } catch (e) {
        if (retry < 3) {
            setTimeout(() => {
                global.sendPluginErrorToChat(title, err, extra, retry + 1);
            }, 5000);
        } else {
            console.error('[ERRORE] Invio errore plugin in chat fallito:', e);
        }
    }
};

if (!global.__pluginDebugCleanupInterval) {
    global.__pluginDebugCleanupInterval = setInterval(() => {
        try {
            const now = Date.now();
            const maxAge = 1000 * 60 * 30; // 30 minuti

            for (const [id, item] of Object.entries(global.pluginDebugErrors || {})) {
                if (!item?.createdAt) {
                    delete global.pluginDebugErrors[id];
                    continue;
                }

                if (now - item.createdAt > maxAge) {
                    delete global.pluginDebugErrors[id];
                }
            }
        } catch (e) {
            console.error('[ERRORE] Pulizia debug plugin fallita:', e);
        }
    }, 5 * 60 * 1000);
}

if (!fs.existsSync(`./${authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        opzione = '2';
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                phoneNumber = await question(chalk.bgBlack(chalk.bold.hex('#191970')(`Inserisci il numero di WhatsApp.\n${chalk.bold.hex('#0A1429')("Esempio: +393501989497")}\n${chalk.bold.hex('#0A1429')('━━► ')}`)));
                addNumber = phoneNumber.replace(/\D/g, '');
                if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`;
            }
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(addNumber, 'AXIONBOT');
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                console.log(chalk.bold.white(chalk.bgHex('#4B0082')('📞 CODICE DI ABBINAMENTO:')), chalk.bold.white(chalk.hex('#3F00FF')(codeBot)));
            }, 3000);
        }
    }
}
conn.isInit = false;
if (!opts['test']) {
    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write();
        if (opts['autocleartmp']) {
            const tmp = ['temp'];
            tmp.forEach(dirName => {
                if (!existsSync(dirName)) return;
                try {
                    readdirSync(dirName).forEach(file => {
                        const filePath = join(dirName, file);
                        try {
                            const stats = statSync(filePath);
                            if (stats.isFile() && (Date.now() - stats.mtimeMs) > 2 * 60 * 1000) {
                                unlinkSync(filePath);
                            }
                        } catch {}
                    });
                } catch {}
            });
        }
    }, 30 * 1000);
}
if (opts['server']) (await import('./server.js')).default(global.conn, PORT);

async function notifyRestartComplete(conn) {
  try {
    if (!existsSync(RESTART_FILE)) return

    const restartState = JSON.parse(fs.readFileSync(RESTART_FILE, 'utf-8'))

    if (
      restartState.type !== 'manual_restart' ||
      !restartState.startedAt ||
      !restartState.chat ||
      !restartState.sender
    ) {
      try {
        unlinkSync(RESTART_FILE)
      } catch {}
      return
    }

    const elapsed = ((Date.now() - restartState.startedAt) / 1000).toFixed(1)
    const errors = restartState.errors || 0

    const finalText =
`╭━━━━━━━⚡━━━━━━━╮
*✦ 𝐁𝐎𝐓 𝐑𝐈𝐀𝐕𝐕𝐈𝐀𝐓𝐎 ✦*
╰━━━━━━━⚡━━━━━━━╯

*✅ 𝐈𝐥 𝐫𝐢𝐚𝐯𝐯𝐢𝐨 è 𝐬𝐭𝐚𝐭𝐨 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨.*
*🚀 𝐓𝐮𝐭𝐭𝐢 𝐢 𝐬𝐢𝐬𝐭𝐞𝐦𝐢 𝐬𝐨𝐧𝐨 𝐨𝐫𝐚 𝐨𝐧𝐥𝐢𝐧𝐞.*
*⏱️ 𝐓𝐞𝐦𝐩𝐨 𝐝𝐢 𝐫𝐢𝐚𝐯𝐯𝐢𝐨:* ${elapsed}𝐬
*🧾 𝐄𝐫𝐫𝐨𝐫𝐢 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐢:* ${errors}

> *𝚭𝚵𝚼𝚴𝚰 𝚩𝚰𝚮*`

    if (restartState.messageKey) {
      await conn.relayMessage(
        restartState.chat,
        {
          protocolMessage: {
            key: restartState.messageKey,
            type: 14,
            editedMessage: {
              extendedTextMessage: {
                text: finalText,
                contextInfo: {
                  mentionedJid: [restartState.sender]
                }
              }
            }
          }
        },
        {}
      )
    } else {
      await conn.sendMessage(restartState.chat, {
        text: finalText,
        mentions: [restartState.sender]
      })
    }

    try {
      unlinkSync(RESTART_FILE)
    } catch {}

  } catch (e) {
    console.error('[RESTART COMPLETE ERROR]', e)

    try {
      if (existsSync(RESTART_FILE)) unlinkSync(RESTART_FILE)
    } catch {}
  }
}
async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    global.stopped = connection;
    if (isNewLogin) conn.isInit = true;
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    if (code && code !== DisconnectReason.loggedOut) {
        await global.reloadHandler(true).catch(console.error);
        global.timestamp.connect = new Date;
    }
    if (global.db.data == null) await loadDatabase();
    if (qr && (opzione === '1' || methodCodeQR) && !global.qrGenerated) {
        console.log(chalk.bold.yellow(`\n 🪐 SCANSIONA IL CODICE QR - SCADE TRA 45 SECONDI 🪐`));
        global.qrGenerated = true;
    }
    if (connection === 'open') {
    global.qrGenerated = false;
    global.connectionMessagesPrinted = {};
    await notifyRestartComplete(conn);
    if (!global.isLogoPrinted) {
            const finchevedotuttoviolaviola = [
    '#3F00FF', '#4B0082', '#0A1429', '#191970', '#2ECC71', '#20B2AA', '#00CED1', '#00BFFF',
    '#00BFFF', '#00CED1', '#20B2AA', '#2ECC71', '#2ECC71', '#20B2AA'
];

const axionbot = [
    ` ███████╗███████╗██╗   ██╗███╗   ██╗ ██████╗ 
╚══███╔╝██╔════╝╚██╗ ██╔╝████╗  ██║██╔═══██╗
  ███╔╝ █████╗   ╚████╔╝ ██╔██╗ ██║██║   ██║
 ███╔╝  ██╔══╝    ╚██╔╝  ██║╚██╗██║██║   ██║
███████╗███████╗   ██║   ██║ ╚████║╚██████╔╝
╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝  `
];

axionbot.forEach((line, i) => {
    const color = finchevedotuttoviolaviola[i] || finchevedotuttoviolaviola[finchevedotuttoviolaviola.length - 1];
    // Grassetto e colore applicati direttamente a ogni riga
    console.log(chalk.hex(color).bold(line));
});

global.isLogoPrinted = true;

        }
    }
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (reason === DisconnectReason.badSession) {
            if (!global.connectionMessagesPrinted.badSession) {
                            console.log(chalk.bold.hex('#E74C3C')(`\n⚠️❗ SESSIONE NON VALIDA, ELIMINA LA CARTELLA ${global.authFile} E SCANSIONA IL CODICE QR ⚠️`));
                global.connectionMessagesPrinted.badSession = true;
            }
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionLost) {
            if (!global.connectionMessagesPrinted.connectionLost) {
                console.log(chalk.hex('#00CED1').bold(`\nCONNESSIONE PERSA COL SERVER\nRICONNESSIONE IN CORSO... \n 𝚭𝚵𝚼𝚴𝚰 𝚩𝚰𝚮`));
                global.connectionMessagesPrinted.connectionLost = true;
            }
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionReplaced) {
            if (!global.connectionMessagesPrinted.connectionReplaced) {
                console.log(chalk.hex('#4B0082').bold(`CONNESSIONE SOSTITUITA\nÈ stata aperta un'altra sessione, \nchiudi prima quella attuale.\n𝚭𝚵𝚼𝚴𝚰 𝚩𝚰𝚮`));
                global.connectionMessagesPrinted.connectionReplaced = true;
            }
        } else if (reason === DisconnectReason.loggedOut) {
            console.log(chalk.bold.hex('#0A1429')(`\n⚠️ DISCONNESSO, CARTELLA ${global.authFile} ELIMINATA. RIAVVIA IL BOT E SCANSIONA IL CODICE QR ⚠️`));
            try {
                if (fs.existsSync(global.authFile)) {
                    fs.rmSync(global.authFile, { recursive: true, force: true });
                }
            } catch (e) {
                console.error('Errore nell\'eliminazione della cartella sessione:', e);
            }
            process.exit(1);
        } else if (reason === DisconnectReason.restartRequired) {
            if (!global.connectionMessagesPrinted.restartRequired) {
                console.log(chalk.hex('#3F00FF').bold(`\nCONNESSIONE AL SERVER`));
                global.connectionMessagesPrinted.restartRequired = true;
            }
            aw