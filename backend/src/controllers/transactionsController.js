import { getDB } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const db = getDB();
    
    const transactions = await db
      .collection("transactions")
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray();

    res.status(200).json(transactions);
  } catch (error) {
    console.log("Error getting the transactions", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !user_id || !category || amount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const db = getDB();
    const transaction = {
      user_id,
      title,
      amount,
      category,
      created_at: new Date()
    };

    const result = await db.collection("transactions").insertOne(transaction);
    
    // Pobierz utworzony dokument
    const createdTransaction = await db
      .collection("transactions")
      .findOne({ _id: result.insertedId });

    console.log(createdTransaction);
    res.status(201).json(createdTransaction);
  } catch (error) {
    console.log("Error creating the transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const db = getDB();

    // Sprawdź czy ID jest prawidłowe dla MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const { ObjectId } = await import("mongodb");
    const result = await db
      .collection("transactions")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log("Error deleting the transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSummaryByUserId(req, res) {
  try {
    const { userId } = req.params;
    const db = getDB();

    // Agregacja MongoDB do obliczenia podsumowania
    const summary = await db.collection("transactions").aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: null,
          balance: { $sum: "$amount" },
          income: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, "$amount", 0]
            }
          }
        }
      }
    ]).toArray();

    const result = summary[0] || { balance: 0, income: 0, expenses: 0 };

    res.status(200).json({
      balance: result.balance,
      income: result.income,
      expenses: Math.abs(result.expenses) // Zwróć dodatnią wartość dla wydatków
    });
  } catch (error) {
    console.log("Error getting the summary", error);
    res.status(500).json({ message: "Internal server error" });
  }
}