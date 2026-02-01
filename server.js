const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'consultor',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Pool de conexiones a la base de datos
const pool = mysql.createPool(dbConfig);

// Ruta principal - Servir el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para servir archivos estáticos
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

// ============ RUTAS API ============

// Ruta para crear una solicitud de contacto
app.post('/api/solicitudes/crear', async (req, res) => {
    try {
        const { nombre, correo, asunto, mensaje } = req.body;

        // Validación básica
        if (!nombre || !correo || !asunto || !mensaje) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return res.status(400).json({
                success: false,
                message: 'El correo no es válido'
            });
        }

        // Obtener conexión del pool
        const connection = await pool.getConnection();

        try {
            // Insertar solicitud en la base de datos
            const [result] = await connection.execute(
                'INSERT INTO solicitudes_contacto (nombre, correo, asunto, mensaje, fecha_creacion, estado) VALUES (?, ?, ?, ?, NOW(), ?)',
                [nombre, correo, asunto, mensaje, 'nuevo']
            );

            console.log(`Solicitud creada: ID ${result.insertId}`);

            res.status(201).json({
                success: true,
                message: 'Solicitud enviada correctamente',
                id: result.insertId
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error al crear solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud'
        });
    }
});

// Ruta para obtener todas las solicitudes
app.get('/api/solicitudes', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                'SELECT * FROM solicitudes_contacto ORDER BY fecha_creacion DESC'
            );

            res.json({
                success: true,
                data: rows
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener solicitudes'
        });
    }
});

// Ruta para obtener una solicitud específica
app.get('/api/solicitudes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                'SELECT * FROM solicitudes_contacto WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
            }

            res.json({
                success: true,
                data: rows[0]
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error al obtener solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener solicitud'
        });
    }
});

// Ruta para actualizar el estado de una solicitud
app.put('/api/solicitudes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, respuesta } = req.body;

        if (!estado) {
            return res.status(400).json({
                success: false,
                message: 'El estado es requerido'
            });
        }

        const connection = await pool.getConnection();

        try {
            const [result] = await connection.execute(
                'UPDATE solicitudes_contacto SET estado = ?, respuesta = ? WHERE id = ?',
                [estado, respuesta || null, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Solicitud actualizada correctamente'
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error al actualizar solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar solicitud'
        });
    }
});

// Ruta para eliminar una solicitud
app.delete('/api/solicitudes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        try {
            const [result] = await connection.execute(
                'DELETE FROM solicitudes_contacto WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Solicitud eliminada correctamente'
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error al eliminar solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar solicitud'
        });
    }
});

// ============ MANEJO DE ERRORES ============

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// ============ INICIAR SERVIDOR ============

app.listen(PORT, () => {
    console.log(`\n╔═══════════════════════════════════════════╗`);
    console.log(`║  Servidor ejecutándose en puerto ${PORT}  ║`);
    console.log(`║  http://localhost:${PORT}                   ║`);
    console.log(`╚═══════════════════════════════════════════╝\n`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n\nCerrando servidor...');
    await pool.end();
    process.exit(0);
});

module.exports = app;

app.post('/registro', (req, res) => {
    const { nombre, correo, password } = req.body;
    
    // 1. Aquí iría la consulta SQL para guardar en la BD
    

    const mailOptions = {
        from: 'zurzodiaco@gmail.com',
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
