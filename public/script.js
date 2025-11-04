// Establish socket connection
const socket = io("http://localhost:3000");

// Initialize transactions and categories
let transactions = [];
let totalIncome = 0;
let messageToPrint = '';
let categorySums = {
    "Income/Transfers": 0,
    "Rent": 0,
    "Recurring Payments": 0,
    "Food": 0,
    "Transport": 0,
    "Shopping": 0,
    "Others": 0
};

// Function to categorize transactions based on descriptions
function categorizeTransaction(description) {
    if (!description) return "Others";
    const d = String(description).toLowerCase();

    // --- Income / Transfers ---
    if (
        d.includes("zelle") ||
        d.includes("payment from") ||
        d.includes("payroll") ||
        d.includes("deposit") ||
        (d.includes("transfer") && !d.includes("to ")) // avoid some outgoing wordings
    ) {
        return "Income/Transfers";
    }

    // --- Rent ---
    if (
        d.includes("rent") ||
        d.includes("apartment")
    ) {
        return "Rent";
    }

    // --- Recurring payments (subscriptions, utilities, internet, phone, cloud) ---
    if (
        d.includes("spotify") ||
        d.includes("coursera") ||
        d.includes("apple.com/bill") ||
        d.includes("icloud") ||
        d.includes("netflix") ||
        d.includes("spectrum") ||
        d.includes("con edison") ||
        d.includes("verizon") ||
        d.includes("utility") ||
        d.includes("internet")
    ) {
        return "Recurring Payments";
    }

    // --- Food & groceries & coffee ---
    if (
        d.includes("trader joe") ||
        d.includes("whole foods") ||
        d.includes("coffee") ||
        d.includes("pizza") ||
        d.includes("xi’an") || d.includes("xian famous foods") || d.includes("xi'an") ||
        d.includes("market") || // e.g., Metro Market / Merci Market
        d.includes("domino") ||
        d.includes("delicatessen") ||
        d.includes("restaurant") ||
        d.includes("deli")
    ) {
        return "Food";
    }

    // --- Transport ---
    if (
        d.includes("mta") ||
        d.includes("metrocard") ||
        d.includes("paygo") ||
        d.includes("tap") ||
        d.includes("path") ||
        d.includes("lyft") ||
        d.includes("uber")
    ) {
        return "Transport";
    }

    // --- Shopping / retail / pharmacy / art supplies / clothing ---
    if (
        d.includes("uniqlo") ||
        d.includes("duane reade") ||
        d.includes("blick") ||
        d.includes("magvend") ||
        d.includes("musinsa") ||
        d.includes("ralph lauren") ||
        d.includes("shop") ||
        d.includes("pharmacy")
    ) {
        return "Shopping";
    }

    return "Others";
}

// Function to determine the message based on total income
function determineMessage(totalIncome) {
    if (totalIncome < 500) {
        return "World class Free Lifestyle. In Path with rats";
    } else if (totalIncome < 1000) {
        return "Join the 10b1b now! with your friends and live a happy life.";
    } else if (totalIncome >= 1000 && totalIncome <= 2000) {
        return "Welcome to 1b1b";
    } else {
        return "You have a luxurious life ahead!";
    }
}

// Function to handle file upload and process transactions
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Parse the JSON data
                const jsonData = JSON.parse(e.target.result);
                transactions = jsonData.transactions; // Assuming 'transactions' is the key in the JSON

                // Process transactions
                loadTransactions();
            } catch (error) {
                alert('Error parsing JSON. Please upload a valid JSON file.');
            }
        };
        reader.readAsText(file);
    }
});

// Function to load transactions and calculate category sums
function loadTransactions() {
    // Reset category sums and total income
    totalIncome = 0;
    categorySums = {
        "Income/Transfers": 0,
        "Rent": 0,
        "Recurring Payments": 0,
        "Food": 0,
        "Transport": 0,
        "Shopping": 0,
        "Others": 0
    };

    transactions.forEach(transaction => {
        const amount = Number(transaction.amount) || 0; // ensure numeric
        const category = categorizeTransaction(transaction.description);

        if (!(category in categorySums)) {
            categorySums[category] = 0;
        }
        categorySums[category] += amount; // income positive, expenses negative in your data

        if (category === "Income/Transfers" && amount > 0) {
            totalIncome += amount;
        }
    });

    // Determine the message to print based on total income
    messageToPrint = determineMessage(totalIncome);

    // Update category totals in the table
    loadCategoryTotals();

    // Log and send message to the server
    console.log("Message to print:", messageToPrint);
    socket.emit('message', { message: messageToPrint });
}

// Function to update the category totals table
function loadCategoryTotals() {
    const categoryTableBody = document.querySelector('#category-table tbody');
    categoryTableBody.innerHTML = ''; // Clear existing rows

    Object.keys(categorySums).forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category}</td>
            <td>${categorySums[category].toFixed(2)}</td>
        `;
        categoryTableBody.appendChild(row);
    });

    // Trigger the print receipt effect
    printReceiptEffect();
}

// Function to simulate a receipt printing effect
function printReceiptEffect() {
    const mainDiv = document.querySelector('.main');
    const printSound = document.getElementById('printSound');
    printSound.play();
    
    setTimeout(() => {
        mainDiv.style.height = mainDiv.scrollHeight + 'px';
    }, 100);
    
    setTimeout(() => {
        printSound.pause();
        printSound.currentTime = 0;
    }, 3000);
}
// Map initialization
var map = L.map('map').setView([40.7128, -74.0060], 12); // Center map on New York

// Add a Tile Layer (from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add Markers for Each Transaction Location
var locations = [
    { name: "Champion Pizza", lat: 40.7371, lon: -73.9929 },
    { name: "Sprove Market Place", lat: 40.7282, lon: -74.0776 },
    { name: "Merci Market", lat: 40.7580, lon: -73.9855 },
    { name: "Barn Joo - Union Sq", lat: 40.7359, lon: -73.9911 },
    { name: "Joe Coffee - Gover", lat: 40.7506, lon: -73.9937 },
    { name: "Duane Reade Sto 110 NE Jersey City NJ", lat: 40.7282, lon: -74.0776 },
    { name: "Magvend LLC Farmingdale NY", lat: 40.7326, lon: -73.4466 },
    { name: "Tst* Joe Coffee - Gover New York NY", lat: 40.7506, lon: -73.9937 },
    { name: "Barn Joo - Union Sq New York NY", lat: 40.7367, lon: -73.9906 },
    { name: "Path Tapp Paygo Cp New Jersey NJ", lat: 40.7323, lon: -74.0621 },
    { name: "Metro Market Space B New York NY", lat: 40.7527, lon: -73.9772 }
];

locations.forEach(function(location) {
    L.marker([location.lat, location.lon])
        .addTo(map)
        .bindPopup(location.name)
        .openPopup();
});
// ✅ Add WebSocket Listener at the END of the script
socket.on('message', function(data) {
    console.log('Message from server:', data.message);
    
    // Update the message display on the web page
    let messageOutput = document.getElementById('messageOutput');
    if (messageOutput) {
        messageOutput.innerHTML = 'Message to print: ' + data.message;
    }

    // Send message to server again to ensure printing
    socket.emit('message', { message: data.message });
});