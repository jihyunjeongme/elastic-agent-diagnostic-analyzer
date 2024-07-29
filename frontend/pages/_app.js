import "../styles/globals.css";
import { DiagnosticProvider } from "../contexts/DiagnosticContext";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function MyApp({ Component, pageProps }) {
  return (
    <DiagnosticProvider>
      <Component {...pageProps} />
    </DiagnosticProvider>
  );
}

export default MyApp;
