import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";

export default function ProfileScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");

  const handleChangeProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const file = result.assets[0];
        await user.setProfileImage({
          file: {
            uri: file.uri,
            name: "profile.jpg",
            type: "image/jpeg",
          },
        });
        Alert.alert("Sukces", "Zmieniono zdjęcie profilowe.");
      } catch (error) {
        console.error("Błąd zmiany zdjęcia:", error);
        Alert.alert("Błąd", "Nie udało się zmienić zdjęcia.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveProfile = () => {
    // Tutaj nic nie zapisujemy – tylko udajemy zapis w pamięci
    Alert.alert("Zapisano", "Dane zostały zapisane lokalnie (tymczasowo).");
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: COLORS.background }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 20 }}>Twój profil</Text>

      {/* Zdjęcie profilowe */}
      <View style={{ alignItems: "center", marginTop: 10 }}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <Image
            source={{ uri: user?.imageUrl }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        )}
        <TouchableOpacity onPress={handleChangeProfilePhoto}>
          <Text style={{ color: COLORS.primary, marginTop: 10, fontWeight: "bold" }}>
            Zmień zdjęcie
          </Text>
        </TouchableOpacity>
      </View>

      {/* Imię */}
      <Text style={styles.label}>Imię</Text>
      <TextInput value={firstName} onChangeText={setFirstName} style={styles.input} />

      {/* Nazwisko */}
      <Text style={styles.label}>Nazwisko</Text>
      <TextInput value={lastName} onChangeText={setLastName} style={styles.input} />

      {/* Płeć */}
      <Text style={styles.label}>Płeć</Text>
      <TextInput
        value={gender}
        onChangeText={setGender}
        placeholder="np. kobieta, mężczyzna, inne"
        style={styles.input}
      />

      {/* Bio */}
      <Text style={styles.label}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
        style={[styles.input, { textAlignVertical: "top", height: 80 }]}
        placeholder="Kilka słów o Tobie"
      />

      {/* Zapisz */}
      <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
        <Text style={styles.buttonText}>Zapisz zmiany</Text>
      </TouchableOpacity>
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
    marginTop: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
};
