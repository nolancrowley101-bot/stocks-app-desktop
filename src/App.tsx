import { useEffect, useState } from "react";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import { SearchBar } from "./components/SearchBar";
import { Home } from "./screens/Home";
import { QuoteView } from "./screens/QuoteView";
import { Watchlist } from "./screens/Watchlist";
import { Alerts } from "./screens/Alerts";
import { Settings } from "./screens/Settings";
import { Download } from "./screens/Download";
import { startAlertEngine, stopAlertEngine } from "./lib/alertEngine";

export type Route =
  | "home"
  | "quote"
  | "watchlist"
  | "alerts"
  | "settings"
  | "download";

function App() {
  const [route, setRoute] = useState<Route>("home");
  const [symbol, setSymbol] = useState("AAPL");

  useEffect(() => {
    startAlertEngine();
    return () => stopAlertEngine();
  }, []);

  const openSymbol = (s: string) => {
    setSymbol(s.toUpperCase());
    setRoute("quote");
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-950">
      <Sidebar route={route} onRoute={setRoute} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-zinc-800 px-4 flex items-center gap-4 bg-zinc-950/80">
          <SearchBar onPick={openSymbol} />
          <div className="ml-auto text-[11px] text-zinc-500">
            {route === "quote" ? symbol : route}
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4">
          {route === "home" && <Home onPickSymbol={openSymbol} />}
          {route === "quote" && <QuoteView symbol={symbol} />}
          {route === "watchlist" && <Watchlist onPick={openSymbol} />}
          {route === "alerts" && <Alerts />}
          {route === "settings" && <Settings />}
          {route === "download" && <Download />}
        </div>
      </main>
    </div>
  );
}

export default App;
