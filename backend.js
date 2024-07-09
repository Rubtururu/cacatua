const express = require('express');
const bodyParser = require('body-parser');
const TonWeb = require('tonweb');
const { Telegraf } = require('telegraf');

const app = express();
app.use(bodyParser.json());

const bot = new Telegraf('7314433619:AAHpc2H-vqfRA-GvKZrIaD_zmlP8Dx5eu9Q');
const tonweb = new TonWeb();
const keyPair = TonWeb.utils.newKeyPair();
const wallet = tonweb.wallet.create({publicKey: keyPair.publicKey});

bot.start((ctx) => ctx.reply('Welcome!'));
bot.launch();

app.post('/deposit', async (req, res) => {
    // Lógica para el depósito
    // Puedes interactuar con el bot y la red TON aquí
    res.json({message: 'Depósito realizado con éxito'});
});

app.post('/withdraw', async (req, res) => {
    // Lógica para el retiro
    const seqno = await wallet.methods.seqno().call();
    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: 'UQAgsGucCJb_WpkJJxivwiZTyk55Tu0MVeR2ggiE1XRQdnXL',
        amount: TonWeb.utils.toNano('1'), // 1 TON
        seqno: seqno
    });
    await transfer.send();
    res.json({message: 'Retiro realizado con éxito'});
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
