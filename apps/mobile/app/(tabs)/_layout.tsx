import React from "react";
import { Tabs } from "expo-router";
import FloatingTabBar from "@shared/components/FloatingTabBar";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <FloatingTabBar {...(props as unknown as BottomTabBarProps)} />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: "Routines",
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Tabs.Screen
        name="boards"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="time"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
