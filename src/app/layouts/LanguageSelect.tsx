import { Select } from "@mantine/core";
import { languageOptionLabel, useLanguage } from "@/context/language";

interface LanguageSelectProps {
  /** Visible label; without one the select is labelled for screen readers only. */
  label?: string;
  w?: number;
}

export function LanguageSelect({ label, w }: LanguageSelectProps) {
  const { language, setLanguage, SUPPORTED_LANGUAGES } = useLanguage();

  return (
    <Select
      data={SUPPORTED_LANGUAGES.map((option) => ({ value: option.value, label: languageOptionLabel(option) }))}
      value={language}
      onChange={(value) => value && setLanguage(value)}
      allowDeselect={false}
      label={label}
      aria-label={label ? undefined : "Study language"}
      w={w}
      // Inside the phone menu (a Drawer) the dropdown must stack above it.
      comboboxProps={{ withinPortal: true, zIndex: 1000 }}
    />
  );
}
