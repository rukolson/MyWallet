import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getSummaryByUserId,
  getTransactionsByUserId,
} from "../controllers/transactionsController.js";

const router = express.Router();

/**
 * @openapi
 * /api/transactions/summary/{userId}:
 *   get:
 *     summary: Get transaction summary for a user
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Summary returned
 *       500:
 *         description: Server error
 */
router.get("/summary/:userId", getSummaryByUserId);

/**
 * @openapi
 * /api/transactions/{userId}:
 *   get:
 *     summary: Get all transactions for a user
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: A list of transactions
 *       500:
 *         description: Server error
 */
router.get("/:userId", getTransactionsByUserId);

/**
 * @openapi
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - title
 *               - amount
 *               - category
 *             properties:
 *               user_id:
 *                 type: string
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", createTransaction);

/**
 * @openapi
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       404:
 *         description: Transaction not found
 */
router.delete("/:id", deleteTransaction);

export default router;