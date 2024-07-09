const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const TonWeb = require('tonweb');
const { Telegraf } = require('telegraf');

const app = express();
app.use(bodyParser.json());

const botToken = '7209539640:AAHiscqStO8mpy8aurPL6bunDFAtFfIy258';
const bot = new Telegraf(botToken);

const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC'));

// Generar un nuevo par de claves
const keyPair = TonWeb.utils.keyPairFromSeed(TonWeb.utils.newSeed());
const wallet = tonweb.wallet.create({ publicKey: keyPair.publicKey });

// Mapa para almacenar los nombres de usuario de Telegram
const users = {};

// Configurar el bot de Telegram
bot.start((ctx) => {
    ctx.reply('Welcome! Send /register to register your username.');
});

bot.command('register', (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    users[userId] = username;
    ctx.reply(`Registered with username: ${username}`);
});

bot.launch();

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar depósitos
app.post('/deposit', async (req, res) => {
    const { amount, userId } = req.body;
    res.json({ message: 'Depósito recibido. Procesando...', amount, userId });
});

// Ruta para manejar retiros
app.post('/withdraw', async (req, res) => {
    const { userId, amount, toAddress } = req.body;
    try {
        const seqno = await wallet.methods.seqno().call();
        const transfer = wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: toAddress,
            amount: TonWeb.utils.toNano(amount.toString()), // Convertir a Nano
            seqno: seqno
        });
        await transfer.send();
        res.json({ message: 'Retiro realizado con éxito', amount, toAddress });
    } catch (error) {
        res.status(500).json({ message: 'Error en el retiro', error: error.message });
    }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
