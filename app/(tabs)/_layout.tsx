import { Tabs } from "expo-router";
import { View, Text, Image, Animated } from "react-native";
import { useRef, useEffect } from "react";
import { theme } from "../../constants/theme";
import { FontAwesome5, MaterialIcons, Entypo, Ionicons } from "@expo/vector-icons";

// Animated Icon Component
type AnimatedIconProps = {
  Icon: any;
  name: string;
  focused: boolean;
  size?: number;
  color?: string;
};

const AnimatedIcon = ({ Icon, name, focused, size = 20, color = "#000" }: AnimatedIconProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.3 : 1,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon name={name} size={size} color={color} />
    </Animated.View>
  );
};

// Tabs Layout
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.accent,
        headerTitleStyle: { fontWeight: "800", color: theme.white },
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/cow-desi-260nw-2641028419-removebg-preview.png")}
                style={{
                  width: 28,
                  height: 28,
                  marginRight: 8,
                  resizeMode: "contain",
                }}
              />
              <Text style={{ fontSize: 18, fontWeight: "800", color: theme.white }}>
                GauSevak
              </Text>
            </View>
          ),
          tabBarLabel: "Home",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon Icon={Entypo} name="home" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="milk-yield"
        options={{
          title: "Milk Yield",
          tabBarLabel: "Milk",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon Icon={FontAwesome5} name="glass-whiskey" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="insemination"
        options={{
          title: "Insemination",
          tabBarLabel: "Insem",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon Icon={MaterialIcons} name="local-hospital" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="dob"
        options={{
          title: "Date of Birth",
          tabBarLabel: "DOB",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon Icon={Ionicons} name="calendar" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="semen-record"
        options={{
          title: "Semen Record",
          tabBarLabel: "Semen",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon Icon={FontAwesome5} name="dna" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="genetic-record"
        options={{
          title: "Genetic Record",
          tabBarLabel: "Genetic",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon Icon={FontAwesome5} name="microscope" focused={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="medical"
        options={{
          title: "Medical Checkup",
          tabBarLabel: "Medical",
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon Icon={MaterialIcons} name="medication" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}