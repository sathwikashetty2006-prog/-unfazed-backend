import Client from "../models/Client.js";

// Get all clients for logged-in therapist
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({
      therapist: req.user.id,
    }).select("-password_hash");

    res.json(clients);
  } catch (error) {
    console.error("Get clients error:", error);

    res.status(500).json({
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
};

// Get single client
export const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      therapist: req.user.id,
    }).select("-password_hash");

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch client",
      error: error.message,
    });
  }
};

// Create client
export const createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const existingClient = await Client.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingClient) {
      return res.status(400).json({
        message: "Client with this email already exists",
      });
    }

    const client = await Client.create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone || "",
      therapist: req.user.id,
      password_hash: "temporary",
    });

    const clientResponse = client.toObject();
    delete clientResponse.password_hash;

    res.status(201).json({
      message: "Client created successfully",
      client: clientResponse,
    });
  } catch (error) {
    console.error("Create client error:", error);

    res.status(500).json({
      message: "Failed to create client",
      error: error.message,
    });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        therapist: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password_hash");

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// Delete client
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      therapist: req.user.id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

// Get logged-in client's own profile
export const getMyProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id)
      .select("-password_hash");

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json(client);
  } catch (error) {
    console.error("Get client profile error:", error);

    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// Update logged-in client's own profile
export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const client = await Client.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone: phone || "",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password_hash");

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      client,
    });
  } catch (error) {
    console.error("Update client profile error:", error);

    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

