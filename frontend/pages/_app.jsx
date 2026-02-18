import Header from "../components/Header";
import Footer from "../components/Footer";
import NotificationListener from "../components/NotificationListener";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col">
      <Header />
      <Component {...pageProps} />
      <Footer />
      <NotificationListener />
    </div>
  );
}
