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
      const url = `${API_URL}/transactions/${userId}`;
      console.log("Fetching transactions from:", url);

      const response = await fetch(url);
      const data = await response.json();

      const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTransactions(sorted);
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
      const url = `${API_URL}/transactions/${id}`;
      console.log("Usuwanie transakcji ID:", id);
      console.log("DELETE URL:", url);

      const response = await fetch(url, { method: "DELETE" });

      const responseData = await response.json();
      console.log("Odpowiedź backendu:", responseData);

      if (!response.ok) {
        throw new Error(responseData?.error || "Nie udało się usunąć transakcji");
      }

      await loadData(); 
      Alert.alert("Sukces", "Transakcja została usunięta");
    } catch (error) {
      console.error("Błąd podczas usuwania transakcji:", error);
      Alert.alert("Błąd", error.message || "Wystąpił błąd przy usuwaniu");
    }
  };

  return { transactions, summary, isLoading, loadData, deleteTransaction };
};
