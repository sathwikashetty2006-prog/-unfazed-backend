import Payment from "../models/Payment.js";

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      therapist: req.user.id,
    })
      .populate("client", "name email")
      .populate("package", "name sessions")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

export const createPayment = async (req, res) => {
  try {
    const {
      client,
      session,
      package: packageId,
      amount,
      paymentMethod,
      status,
    } = req.body;

    if (!client || !amount) {
      return res.status(400).json({
        message: "Client and amount are required",
      });
    }

    const platformFee = Number(amount) * 0.1;
    const netAmount = Number(amount) - platformFee;

    const payment = await Payment.create({
      therapist: req.user.id,
      client,
      session: session || null,
      package: packageId || null,
      amount: Number(amount),
      platform_fee: platformFee,
      net_amount: netAmount,
      paymentMethod: paymentMethod || "cash",
      status: status || "paid",
    });

    const populatedPayment = await payment.populate([
      { path: "client", select: "name email" },
      { path: "package", select: "name sessions" },
    ]);

    res.status(201).json({
      message: "Payment created successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create payment",
      error: error.message,
    });
  }
};