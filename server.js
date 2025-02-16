const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const { SerialPort } = require('serialport');  
const { ReadlineParser } = require('@serialport/parser-readline'); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const upload = multer({ dest: 'uploads/' });

// ✅ Serve static files from the "public" directory
app.use(express.static('public'));

// ✅ Serve index.html when accessing "/"
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ✅ Find the correct serial port
const SERIAL_PORT = "/dev/cu.usbmodem101";  // Change based on your system

try {
    const serialPort = new SerialPort({ path: SERIAL_PORT, baudRate: 9600 });

    serialPort.on('error', (err) => {
        console.error("❌ Serial Port Error:", err.message);
    });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.on('open', () => {
        console.log(`✅ Serial Port Opened on ${SERIAL_PORT}`);
    });

    parser.on('data', (data) => {
        console.log('🖨️ Arduino Response:', data);
    });

    io.on('connection', (socket) => {
        console.log('🔗 Web Client Connected');
        socket.on('message', (data) => {
            console.log('📨 Sending to Arduino:', data.message);
            serialPort.write(data.message + '\n');
        });
    });

    server.listen(3000, () => {
        console.log(`🚀 Server running on http://localhost:3000`);
    });

} catch (error) {
    console.error("❌ Could not initialize SerialPort:", error.message);
}