import SessionNote from "../models/SessionNote.js";

export const getNotes = async (req, res) => {
  try {
    const notes = await SessionNote.find({
      therapist: req.user.id,
    })
      .populate("client", "name email")
      .populate("session", "date")
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notes",
      error: error.message,
    });
  }
};

export const createNote = async (req, res) => {
  try {
    const { session, client, type, content } = req.body;

    if (!session || !client || !content) {
      return res.status(400).json({
        message: "Session, client and content are required",
      });
    }

    const note = await SessionNote.create({
      session,
      client,
      therapist: req.user.id,
      type: type || "private",
      content,
    });

    const populatedNote = await note.populate([
      { path: "client", select: "name email" },
      { path: "session", select: "date" },
    ]);

    res.status(201).json({
      message: "Session note created successfully",
      note: populatedNote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create session note",
      error: error.message,
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await SessionNote.findOneAndUpdate(
      {
        _id: req.params.id,
        therapist: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update note",
      error: error.message,
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await SessionNote.findOneAndDelete({
      _id: req.params.id,
      therapist: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete note",
      error: error.message,
    });
  }
};