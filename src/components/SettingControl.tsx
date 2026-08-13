import { useBoldText } from "@/hooks/use-bold-text";
import { useGrainBackground } from "@/hooks/use-grain-background";
import { useReaderFont } from "@/hooks/use-reader-font";
import { useReaderSize } from "@/hooks/use-reader-size";
import { useTheme } from "@/hooks/use-theme";
import { ReaderSettings } from "./ReaderSettings";

export const SettingControl = () => {
  const { theme, setTheme } = useTheme();
  const { size, setSize } = useReaderSize();
  const { font, setFont } = useReaderFont();
  const { bold, setBold } = useBoldText();
  const { enabled: grain, setEnabled: setGrain } = useGrainBackground();

  return (
    <ReaderSettings
      theme={theme}
      setTheme={setTheme}
      font={font}
      setFont={setFont}
      bold={bold}
      setBold={setBold}
      size={size}
      setSize={setSize}
      grain={grain}
      setGrain={setGrain}
    />
  );
};
