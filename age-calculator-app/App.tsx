import { StatusBar } from 'expo-status-bar';
import { AgeCalculatorScreen } from './src/screens/AgeCalculatorScreen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AgeCalculatorScreen />
    </>
  );
}
