import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import defaultAvatar from "../../assets/images/avatar.jpg";
import { API_URL } from "../../constants/api";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmailId, setPendingEmailId] = useState(null);
  const [step, setStep] = useState(1);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Brak uprawnień", "Musisz zezwolić na dostęp do galerii.");
      }
    };
    requestPermissions();
  }, []);

  const errorTranslations = {
    "that email address is taken": "Ten adres e-mail jest już zajęty.",
    "email address is not properly formatted": "Wprowadź poprawny adres e-mail.",
    "code is incorrect": "Podany kod jest nieprawidłowy.",
    "password is too weak": "Hasło jest zbyt słabe.",
    "current_password must be included": "Musisz podać aktualne hasło.",
    "current password is incorrect": "Aktualne hasło jest nieprawidłowe.",
    "session not active": "Sesja wygasła. Zaloguj się ponownie.",
  };

  const translateError = (message) => {
    const lower = message.toLowerCase();
    const match = Object.keys(errorTranslations).find(key =>
      lower.includes(key)
    );
    return match ? errorTranslations[match] : "Wystąpił nieznany błąd.";
  };

  const handleChangeProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const base64Image = asset.base64;

      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/upload/upload-profile-picture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageBase64: base64Image }),
        });

        const data = await response.json();
        if (data.url) {
          setImageUrl(data.url);
          Alert.alert("Sukces", "Zdjęcie zostało przesłane.");
        } else {
          Alert.alert("Błąd", data.error || "Nie udało się przesłać zdjęcia.");
        }
      } catch (err) {
        console.error("Błąd podczas przesyłania zdjęcia:", err);
        Alert.alert("Błąd", "Coś poszło nie tak.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartEmailUpdate = async () => {
    try {
      const emailObj = await user.createEmailAddress({ email: newEmail });
      await emailObj.prepareVerification({ strategy: "email_code" });
      setPendingEmailId(emailObj.id);
      setStep(2);
      Alert.alert("Kod wysłany", "Sprawdź skrzynkę i wpisz kod weryfikacyjny.");
    } catch (error) {
      console.error("Błąd przy zmianie emaila:", error);
      const rawMessage = error.errors?.[0]?.message || "";
      const message = translateError(rawMessage);
      Alert.alert("Błąd", message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const emailObj = user.emailAddresses.find(e => e.id === pendingEmailId);
      if (!emailObj) throw new Error("Nie znaleziono adresu e-mail do weryfikacji.");

      await emailObj.attemptVerification({ code: verificationCode });
      await user.update({ primaryEmailAddressId: pendingEmailId });

      Alert.alert("Sukces", "Adres e-mail został zmieniony.");
      setStep(1);
      setNewEmail("");
      setVerificationCode("");
    } catch (error) {
      console.error("Błąd przy weryfikacji:", error);
      const rawMessage = error.errors?.[0]?.message || error.message || "";
      const message = translateError(rawMessage);
      Alert.alert("Błąd", message);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Błąd", "Wprowadź aktualne i nowe hasło.");
      return;
    }

    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert("Sukces", "Hasło zostało zmienione.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Błąd zmiany hasła:", error);
      const rawMessage = error?.errors?.[0]?.message || "";
      const message = translateError(rawMessage);
      Alert.alert("Błąd", message);
    }
  };

  const displayImage = imageUrl
    ? { uri: imageUrl }
    : defaultAvatar;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginTop: 10 }}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <Image source={displayImage} style={{ width: 100, height: 100, borderRadius: 50 }} />
          )}
          <TouchableOpacity onPress={handleChangeProfilePhoto}>
            <Text style={{ color: COLORS.primary, marginTop: 10, fontWeight: "bold" }}>
              Zmień zdjęcie
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 30 }}>Twój profil</Text>
        <Text style={{ fontSize: 16, color: COLORS.textLight, marginBottom: 10 }}>
          Obecny email: {user?.primaryEmailAddress?.emailAddress}
        </Text>

        {step === 1 && (
          <>
            <Text style={styles.label}>Nowy e-mail</Text>
            <TextInput
              placeholder="nowy@email.com"
              value={newEmail}
              onChangeText={setNewEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleStartEmailUpdate}>
              <Text style={styles.buttonText}>Wyślij kod weryfikacyjny</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.label}>Kod weryfikacyjny</Text>
            <TextInput
              placeholder="np. 123456"
              value={verificationCode}
              onChangeText={setVerificationCode}
              style={styles.input}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
              <Text style={styles.buttonText}>Zatwierdź e-mail</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setStep(1);
                setNewEmail("");
                setVerificationCode("");
              }}
            >
              <Text style={{ color: COLORS.textLight, textAlign: "center", marginTop: 10 }}>
                Anuluj zmianę e-maila
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.label}>Aktualne hasło</Text>
        <TextInput
          placeholder="••••••••"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          style={styles.input}
          secureTextEntry
        />

        <Text style={styles.label}>Nowe hasło</Text>
        <TextInput
          placeholder="Nowe hasło"
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Zmień hasło</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: COLORS.text }]}>Powrót</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Wylogowanie",
              "Czy na pewno chcesz się wylogować?",
              [
                { text: "Anuluj", style: "cancel" },
                {
                  text: "Tak",
                  style: "destructive",
                  onPress: async () => {
                    await signOut();
                    router.replace("/sign-in");
                  },
                },
              ],
              { cancelable: true }
            );
          }}
          style={[styles.button, { backgroundColor: COLORS.expense, marginTop: 10 }]}
        >
          <Text style={styles.buttonText}>Wyloguj się</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  label: {
    marginTop: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginTop: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
};
