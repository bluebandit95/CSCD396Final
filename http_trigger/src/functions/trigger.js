const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function (context, req) {
    const email = req.body.email; // Assuming you're passing the email in the request body

    const msg = {
        to: 'your-email@example.com',
        from: 'your-app@example.com',
        subject: 'New Subscription',
        text: `New subscription from ${email}`,
        html: `<p>New subscription from ${email}</p>`,
    };

    await sgMail.send(msg);

    context.res = {
        body: 'Email sent successfully!',
    };
};

