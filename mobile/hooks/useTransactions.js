// /mobile/hooks/useTransactions.js

import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const url = `${API_URL}/transactions/user_${userId}`;
      console.log("Fetching transactions from:", url);

      const response = await fetch(url);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Błąd podczas pobierania transakcji:", error);
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Błąd podczas pobierania podsumowania:", error);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.error("Błąd podczas ładowania danych:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Nie udało się usunąć transakcji");

      await loadData(); // odśwież dane po usunięciu
      Alert.alert("Sukces", "Transakcja została usunięta");
    } catch (error) {
      console.error("Błąd podczas usuwania transakcji:", error);
      Alert.alert("Błąd", error.message);
    }
  };

  return { transactions, summary, isLoading, loadData, deleteTransaction };
};
