import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { Platform } from "react-native";


export default function TabLayout() {
    return (
        <Tabs
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: Colors.bgCard,
                borderTopColor: Colors.border,
                borderTopWidth: 1,
                height: Platform.OS === 'ios' ? 85 : 65,
                paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                paddingTop: 10,
            },
            tabBarActiveTintColor: Colors.accent,
            tabBarInactiveTintColor: Colors.textDim,
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 0.3,
            }
        }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: '홈',
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color}/>
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: '프로필',
                    tabBarIcon: ({color, focused}) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color}/>
                    )
                }}
            />
        </Tabs>
    );
}