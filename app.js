require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---------- Model ----------
const contactSchema = new mongoose.Schema(
  {
    contactId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      default: () => crypto.randomUUID(), // auto-generated if not provided
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone must be exactly 10 digits"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // allows many contacts with no email
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email format is invalid"],
    },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

// ---------- Helpers ----------
function handleError(res, err) {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res
      .status(409)
      .json({ success: false, message: `${field} already exists` });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Server error" });
}

// treat empty email "" as not provided
function cleanBody(body) {
  const data = { ...body };
  if (data.email === "" || data.email === null) delete data.email;
  return data;
}

// ---------- Routes ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "Contact Management System API is running" });
});

// CREATE
app.post("/api/contacts", async (req, res) => {
  try {
    const contact = await Contact.create(cleanBody(req.body));
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    handleError(res, err);
  }
});

// READ ALL
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (err) {
    handleError(res, err);
  }
});

// READ ONE
app.get("/api/contacts/:contactId", async (req, res) => {
  try {
    const contact = await Contact.findOne({ contactId: req.params.contactId });
    if (!contact)
      return res.status(404).json({ success: false, message: "Contact not found" });
    res.json({ success: true, data: contact });
  } catch (err) {
    handleError(res, err);
  }
});

// UPDATE
app.put("/api/contacts/:contactId", async (req, res) => {
  try {
    const data = cleanBody(req.body);
    delete data.contactId; // ID cannot be changed

    const update = { $set: data };
    if (req.body.email === "" || req.body.email === null) {
      delete update.$set.email;
      update.$unset = { email: 1 }; // clear the email
    }

    const contact = await Contact.findOneAndUpdate(
      { contactId: req.params.contactId },
      update,
      { new: true, runValidators: true }
    );
    if (!contact)
      return res.status(404).json({ success: false, message: "Contact not found" });
    res.json({ success: true, data: contact });
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE
app.delete("/api/contacts/:contactId", async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ contactId: req.params.contactId });
    if (!contact)
      return res.status(404).json({ success: false, message: "Contact not found" });
    res.json({ success: true, message: "Contact deleted" });
  } catch (err) {
    handleError(res, err);
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ---------- Start ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");
    console.log("Saving to DB:", mongoose.connection.name, "| Collection:", Contact.collection.name);

    // Drops indexes that don't match the schema and creates the correct ones
    await Contact.syncIndexes();
    console.log("Indexes synced");

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });