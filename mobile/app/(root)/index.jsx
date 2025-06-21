import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useTransactions } from "../../hooks/useTransactions";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { BalanceCard } from "../../components/BalanceCard";
import { TransactionItem } from "../../components/TransactionItem";
import NoTransactionsFound from "../../components/NoTransactionsFound";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions(
    user.id
  );

  // Debug: sprawdź dane transakcji
  console.log("TRANSAKCJE:", transactions);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert("Usuń transakcję", "Czy na pewno chcesz usunąć tę transakcję?", [
      { text: "Anuluj", style: "cancel" },
      { text: "Usuń", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  if (isLoading && !refreshing) return <PageLoader />;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Witaj,</Text>
              <Text style={styles.usernameText}>
                {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Dodaj</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>

        {/* SALDO */}
        <BalanceCard summary={summary} />

        {/* NAGŁÓWEK LISTY */}
        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Ostatnie transakcje</Text>
        </View>
      </View>

      {/* LISTA TRANSAKCJI */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id} // <- WAŻNE!
        renderItem={({ item }) => <TransactionItem item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<NoTransactionsFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
      />
    </View>
  );
}
