const express = require("express");
const mongoose = require("mongoose");
const Contact = require("../models/contact");

const router = express.Router();

function generateContactId() {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CNT-${Date.now()}-${random}`;
}


// POST /contacts
router.post("/", async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        if (!name || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: "Name, phone and email are required"
            });
        }

        const existingEmail = await Contact.findOne({
            email: email.toLowerCase()
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "A contact with this email already exists"
            });
        }

        const contact = new Contact({
            contactId: generateContactId(),
            name,
            phone,
            email
        });

        const savedContact = await contact.save();

        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: savedContact
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                err => err.message
            );

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create contact",
            error: error.message
        });
    }
});


// GET /contacts
router.get("/", async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch contacts",
            error: error.message
        });
    }
});


// GET /contacts/:id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        let contact;

        if (mongoose.Types.ObjectId.isValid(id)) {
            contact = await Contact.findById(id);
        }

        if (!contact) {
            contact = await Contact.findOne({ contactId: id });
        }

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            data: contact
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch contact",
            error: error.message
        });
    }
});


// PUT /contacts/:id
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email } = req.body;

        let contact;

        if (mongoose.Types.ObjectId.isValid(id)) {
            contact = await Contact.findById(id);
        }

        if (!contact) {
            contact = await Contact.findOne({ contactId: id });
        }

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        if (name !== undefined) {
            contact.name = name;
        }

        if (phone !== undefined) {
            contact.phone = phone;
        }

        if (email !== undefined) {
            const emailExists = await Contact.findOne({
                email: email.toLowerCase(),
                _id: { $ne: contact._id }
            });

            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: "Another contact already uses this email"
                });
            }

            contact.email = email;
        }

        const updatedContact = await contact.save();

        res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            data: updatedContact
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(
                err => err.message
            );

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update contact",
            error: error.message
        });
    }
});


// DELETE /contacts/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        let contact;

        if (mongoose.Types.ObjectId.isValid(id)) {
            contact = await Contact.findByIdAndDelete(id);
        }

        if (!contact) {
            contact = await Contact.findOneAndDelete({
                contactId: id
            });
        }

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact deleted successfully",
            data: contact
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete contact",
            error: error.message
        });
    }
});


module.exports = router;