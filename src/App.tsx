import { useState } from "react";
import { TabBar } from "./components/TabBar";
import { AddressBar } from "./components/AddressBar";
import { Viewport } from "./components/Viewport";
import { CommandPalette } from "./components/CommandPalette";

function App() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  return (
    <main className="h-screen w-screen flex flex-col bg-[#0d0e10] text-[#e8eaf0] overflow-hidden font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      <TabBar />
      <AddressBar />
      <Viewport />
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </main>
  );
}

export default App;
