import React from "react";
import { TabBar } from "./components/TabBar";
import { AddressBar } from "./components/AddressBar";
import { Viewport } from "./components/Viewport";

function App() {
  return (
    <main className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans antialiased">
      <TabBar />
      <AddressBar />
      <Viewport />
    </main>
  );
}

export default App;
