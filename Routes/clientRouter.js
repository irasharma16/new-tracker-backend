const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Client = require('../models/client');

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Function to generate the next client code in sequence
const getNextClientCode = async () => {
    try {
        const clients = await Client.find().sort({ clientCode: 1 }).exec();
        let nextCode = 1;
        for (let client of clients) {
            if (client.clientCode === nextCode) {
                nextCode++;
            } else {
                break;
            }
        }
        return nextCode;
    } catch (err) {
        console.error('Error generating client code:', err);
        throw new Error('Internal Server Error');
    }
};

// Reorder client codes after any deletion
const reorderClientCodes = async () => {
    try {
        const clients = await Client.find().sort({ clientCode: 1 }).exec();
        let code = 1;
        for (let client of clients) {
            if (client.clientCode !== code) {
                client.clientCode = code;
                await client.save(); // Update client with new client code
            }
            code++;
        }
    } catch (err) {
        console.error('Error reordering client codes:', err);
    }
};

// GET all clients (excluding soft-deleted clients)
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find({ deleted: false }).sort({ clientCode: 1 });
        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Error fetching clients', error: error.message });
    }
});

// POST a new client with an auto-generated clientCode
router.post('/', upload.single('companyLogo'), async (req, res) => {
    const { clientName, contactPerson, role, email, phoneNumber } = req.body;
    const companyLogo = req.file ? req.file.path : null;

    try {
        if (!clientName || !contactPerson || !role || !email || !phoneNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Generate the next client code
        const clientCode = await getNextClientCode();

        const newClient = new Client({
            clientCode,
            clientName,
            contactPerson,
            role,
            email,
            phoneNumber,
            companyLogo
        });

        await newClient.save();
        res.status(201).json(newClient);
    } catch (error) {
        console.error('Error saving client:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// PUT (update) an existing client by clientCode
router.put('/:clientCode', upload.single('companyLogo'), async (req, res) => {
    const { clientCode } = req.params;
    const { clientName, contactPerson, role, email, phoneNumber } = req.body;
    const companyLogo = req.file ? req.file.path : undefined;

    try {
        const updateData = {
            clientName,
            contactPerson,
            role,
            email,
            phoneNumber,
            companyLogo
        };

        const updatedClient = await Client.findOneAndUpdate(
            { clientCode },
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
        res.json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(400).json({ message: 'Error updating client', error: error.message });
    }
});

// Soft DELETE a client by clientCode
router.delete('/:clientCode', async (req, res) => {
    const { clientCode } = req.params;

    try {
        const client = await Client.findOneAndUpdate(
            { clientCode },
            { deleted: true },
            { new: true }
        );
        if (!client) return res.status(404).json({ message: 'Client not found' });

        // Optionally reorder client codes if needed
        await reorderClientCodes();

        res.status(200).json({ message: 'Client soft-deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Error deleting client', error: error.message });
    }
});

module.exports = router;