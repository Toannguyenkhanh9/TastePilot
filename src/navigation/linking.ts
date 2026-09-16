// Optional deep-link configuration for the host App.tsx.
// Group Mode works without this because users can paste a shared TPG1 code/link.
// To make tastepilot://group links open the app directly, pass this object to
// <NavigationContainer linking={tastePilotLinking}> in the host project.
export const tastePilotLinking = {
  prefixes: ['tastepilot://'],
  config: {
    screens: {
      MainTabs: '',
      GroupMode: 'group',
    },
  },
};
