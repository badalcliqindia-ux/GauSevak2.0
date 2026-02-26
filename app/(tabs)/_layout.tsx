// _layout.tsx — GauSevak Tab Navigation Layout
// No expo-linear-gradient — pure React Native only

import { Tabs } from "expo-router";
import { View, Text, Image, Animated, StyleSheet, Platform } from "react-native";
import { useRef, useEffect } from "react";
import { theme } from "../../constants/theme";
import { Entypo } from "@expo/vector-icons";

type AnimatedIconProps = { Icon: any; name: string; focused: boolean; size?: number; color?: string; };

const AnimatedIcon = ({ Icon, name, focused, size = 22, color = "#ffffff" }: AnimatedIconProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.25 : 1, useNativeDriver: true, tension: 100, friction: 7 }),
      Animated.timing(glow,  { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View style={[styles.iconWrap, { transform: [{ scale }], opacity: glow.interpolate({ inputRange: [0,1], outputRange: [0.55,1] }) }]}>
      {focused && <Animated.View style={[styles.glowDot, { opacity: glow, backgroundColor: color }]} />}
      <Icon name={name} size={size} color={color} />
    </Animated.View>
  );
};

function GauSevakHeader() {
  return (
    <View style={styles.headerTitle}>
      <View style={styles.logoWrap}>
        <Image source={require("../../assets/cow-desi-260nw-2641028419-removebg-preview.png")} style={styles.logo} />
      </View>
      <View>
        <Text style={styles.appName}>GauSevak</Text>
        <Text style={styles.appTagline}>Dairy Management</Text>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: '#ffffff', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' } as any,
      headerTintColor: theme.accent,
      headerTitleStyle: { fontWeight: "800", color: theme.white },
      tabBarStyle: {
        backgroundColor: '#ffffff', borderTopColor: 'rgba(255,255,255,0.07)', borderTopWidth: 1,
        height: Platform.OS === 'ios' ? 88 : 64,
        paddingBottom: Platform.OS === 'ios' ? 24 : 10,
        paddingTop: 8, elevation: 0,
      },
      tabBarActiveTintColor: theme.accent,
      tabBarInactiveTintColor: '#444',
      tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <GauSevakHeader />,
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ focused, color }) => <AnimatedIcon Icon={Entypo} name="home" focused={focused} color={color} />,
        }}
      />
      {/* Hidden screens — sirf tab bar se chupaane ke liye, file exist karni chahiye */}
      <Tabs.Screen name="milk"   options={{ href: null }} />
      <Tabs.Screen name="feed"   options={{ href: null }} />
      <Tabs.Screen name="health" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap:    { alignItems: 'center', justifyContent: 'center', width: 36, height: 30 },
  glowDot:     { position: 'absolute', top: -4, width: 4, height: 4, borderRadius: 2 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrap:    { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(34,211,160,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(34,211,160,0.25)' },
  logo:        { width: 24, height: 24, resizeMode: 'contain' },
  appName:     { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  appTagline:  { fontSize: 10, color: '#444', fontWeight: '600', marginTop: 1 },
});