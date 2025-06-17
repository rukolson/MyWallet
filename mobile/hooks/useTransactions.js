// własny hook reactowy

import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";

// const API_URL = "https://wallet-api-cxqp.onrender.com/api";
// const API_URL = "http://localhost:5001/api";

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // useCallback jest używany dla wydajności – zapamięta funkcję między renderami
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/${userId}`);
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
      // obie funkcje mogą działać równolegle
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

      // Odśwież dane po usunięciu
      loadData();
      Alert.alert("Sukces", "Transakcja została usunięta");
    } catch (error) {
      console.error("Błąd podczas usuwania transakcji:", error);
      Alert.alert("Błąd", error.message);
    }
  };

  return { transactions, summary, isLoading, loadData, deleteTransaction };
};
