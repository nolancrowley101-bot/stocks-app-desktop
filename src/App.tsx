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
import { News } from "./screens/News";
import { NewsArticle } from "./screens/NewsArticle";
import { Portfolio } from "./screens/Portfolio";
import { SignIn } from "./screens/SignIn";
import { Register } from "./screens/Register";
import { startAlertEngine, stopAlertEngine } from "./lib/alertEngine";
import { AuthContext, useAuthState } from "./lib/auth";

export type Route =
  | "home"
  | "quote"
  | "news"
  | "newsArticle"
  | "watchlist"
  | "portfolio"
  | "alerts"
  | "settings"
  | "download"
  | "signin"
  | "register";

function App() {
  const auth = useAuthState();
  const [route, setRoute] = useState<Route>("home");
  const [symbol, setSymbol] = useState("AAPL");
  const [articleUuid, setArticleUuid] = useState<string | null>(null);

  useEffect(() => {
    startAlertEngine();
    return () => stopAlertEngine();
  }, []);

  const openSymbol = (s: string) => {
    setSymbol(s.toUpperCase());
    setRoute("quote");
  };
  const openArticle = (uuid: string) => {
    setArticleUuid(uuid);
    setRoute("newsArticle");
  };

  return (
    <AuthContext.Provider value={auth}>
      <div className="flex h-screen w-screen bg-[var(--bg)]">
        <Sidebar route={route} onRoute={setRoute} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-12 border-b border-[var(--border)] px-4 flex items-center gap-4 bg-[var(--bg)]/90">
            <SearchBar onPick={openSymbol} />
            <div className="ml-auto text-[11px] text-[var(--fg-3)] uppercase tracking-wider">
              {route === "quote" ? symbol : route}
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {route === "home" && (
              <Home
                onPickSymbol={openSymbol}
                onOpenNewsArticle={openArticle}
                onOpenNews={() => setRoute("news")}
              />
            )}
            {route === "quote" && (
              <QuoteView symbol={symbol} onOpenNewsArticle={openArticle} />
            )}
            {route === "news" && <News onOpenArticle={openArticle} />}
            {route === "newsArticle" && articleUuid && (
              <NewsArticle
                uuid={articleUuid}
                onBackToNews={() => setRoute("news")}
                onOpenArticle={openArticle}
              />
            )}
            {route === "watchlist" && <Watchlist onPick={openSymbol} />}
            {route === "portfolio" && (
              <Portfolio onPickSymbol={openSymbol} onSignIn={() => setRoute("signin")} />
            )}
            {route === "alerts" && <Alerts />}
            {route === "settings" && <Settings />}
            {route === "download" && <Download />}
            {route === "signin" && (
              <SignIn
                onSuccess={() => setRoute("home")}
                onGoRegister={() => setRoute("register")}
              />
            )}
            {route === "register" && (
              <Register
                onSuccess={() => setRoute("home")}
                onGoSignIn={() => setRoute("signin")}
              />
            )}
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
