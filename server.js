const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

// Configuración del correo (Usa variables de entorno en producción)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zurzodiaco@gmail.com',
        pass: '140501' 
    }
});

app.post('/registro', (req, res) => {
    const { nombre, correo, password } = req.body;
    
    // 1. Aquí iría la consulta SQL para guardar en la BD
    
    // 2. Enviar correo automático
    const mailOptions = {
        from: 'tu_correo@gmail.com',
        to: correo,
        subject: 'Bienvenido a la Consultoría',
        text: `Hola ${nombre}, en un momento lo atendemos. Bienvenido.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).send(error.toString());
        res.status(200).send('Registro exitoso y correo enviado');
    });
});

app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));