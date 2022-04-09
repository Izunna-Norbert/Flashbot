require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { sendSMS } = require('./twilio');
const { mintNFT } = require('./web3');
const app = express();


app.use(express.json());


app.get('/', (req, res) => {
    res.send('Welcome to discord bot!');
  });

app.post('/', async (req, res) => {
    try {
        const body = req.body.message;
        console.log(body);
        const url = 'https://discord.com/api/v9/channels/946207693566279690/messages';
        const data = {
            content: body,
        };
        const result = await axios(
            {
              method: 'post',
              headers: { authorization: 'OTQ2MTgyMzA3NzEzMjY5Nzcx.Yha_ng.01ZigrN8_rTKGl8ZEXlfZtyPBqc' },
              url,
              data,
            },
            { timeout: 600000 },
          );
          console.log(result);
          return res.status(200).send({ data: result.data });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'internal server error', status: 500 });
    }
    res.send('Welcome to discord bot!');
  });
app.get('/test', async (req, res) => {
  try {
    await sendSMS();
    return res.status(200).json({
      success: true,
      message: 'successfully sent sms',
    })
  } catch  (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
})

app.get('/mint', async (req, res) => {
  try {
    const response = await mintNFT();
    return res.status(200).json({
      success: true,
      message: 'successfully ran contract',
      data: response
    })
  } catch  (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: 'Unable to establish connection with contract'
  })
  }
})


const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});