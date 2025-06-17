import { View, Text } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { COLORS } from "../constants/colors";

export const BalanceCard = ({ summary }) => {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceTitle}>Saldo całkowite</Text>
      <Text style={styles.balanceAmount}>{parseFloat(summary.balance).toFixed(2)}zł</Text>
      <View style={styles.balanceStats}>
        <View style={styles.balanceStatItem}>
          <Text style={styles.balanceStatLabel}>Przychody</Text>
          <Text style={[styles.balanceStatAmount, { color: COLORS.income }]}>
            +{parseFloat(summary.income).toFixed(2)}zł
          </Text>
        </View>
        <View style={[styles.balanceStatItem, styles.statDivider]} />
        <View style={styles.balanceStatItem}>
          <Text style={styles.balanceStatLabel}>Wydatki</Text>
          <Text style={[styles.balanceStatAmount, { color: COLORS.expense }]}>
            -{Math.abs(parseFloat(summary.expenses)).toFixed(2)}zł
          </Text>
        </View>
      </View>
    </View>
  );
};
