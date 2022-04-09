const accountSid = 'ACa6a6d33a38b6472a5b1bb7e9afbb2804';
const authToken = 'fab3eee9d297ed22cb28d20914b658a5';
const client = require('twilio')(accountSid, authToken);

module.exports = {
    async sendSMS () {

        await client.messages
        .create({
           body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
           from: '+12184384123',
           to: '+2348168226948'
         })
        .then((message, err) => {
            if (err) {
                console.error('errrr', err)
            }
            console.log(message.sid)
        });
        return;
    }
}
