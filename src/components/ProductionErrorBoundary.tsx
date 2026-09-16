import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  children: React.ReactNode;
  title: string;
  message: string;
  retry: string;
};

type State = {
  hasError: boolean;
};

export class ProductionErrorBoundary extends React.Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: unknown) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('[TastePilot render error]', error);
    }
  }

  retry = () => {
    this.setState({hasError: false});
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>{this.props.title}</Text>
          <Text style={styles.message}>{this.props.message}</Text>
          <Pressable style={styles.button} onPress={this.retry}>
            <Text style={styles.buttonText}>{this.props.retry}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fbfaf8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#fff',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#eadfce',
    padding: 24,
    alignItems: 'center',
  },
  emoji: {fontSize: 44},
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#171717',
    textAlign: 'center',
    marginTop: 14,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    minHeight: 48,
    minWidth: 150,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#3568b8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {fontSize: 13, fontWeight: '900', color: '#fff'},
});
