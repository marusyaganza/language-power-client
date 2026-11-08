import { Anchor, Badge, Group, Image, Text } from "@mantine/core";
import { IconFlask } from "@tabler/icons-react";
import { useAuthConfig } from "@/features/auth";
import mwLogoDarkBg from "@/assets/merriam-webster/mw-logo-dark-bg.png";
import mwLogoLightBg from "@/assets/merriam-webster/mw-logo-light-bg.png";

const KRDICT_URL = "https://krdict.korean.go.kr";
const KRDICT_LICENSE_URL = "https://creativecommons.org/licenses/by-sa/2.0/kr/";

/**
 * Where the `language`'s dictionary entries come from. In local mock mode the entries are made up, so
 * they get a label instead.
 *
 * - English and Spanish: Merriam-Webster's API terms require their logo in every app that uses it:
 *   unmodified, at 50, 100 or 125 px, with the ® visible. Each theme gets the version made for its background.
 * - Korean: the Korean Learners' Dictionary is CC BY-SA 2.0 KR, which asks for the source, the author and
 *   the license wherever its text is shown, and for saying it was changed (the app reformats it).
 */
export function DictionaryCredit({ language }: { language: string }) {
  const { data: config } = useAuthConfig();
  if (!config) return null;

  if (config.use_mocks) {
    return (
      <Badge variant="outline" color="olive" leftSection={<IconFlask size={12} />}>
        Mock dictionary
      </Badge>
    );
  }

  if (language === "ko") {
    return (
      <Text size="sm" c="dimmed" ta="right">
        Korean entries adapted from the{" "}
        <Anchor href={KRDICT_URL} target="_blank" rel="noreferrer" inherit>
          Korean Learners' Dictionary (한국어기초사전)
        </Anchor>{" "}
        by the National Institute of Korean Language,{" "}
        <Anchor href={KRDICT_LICENSE_URL} target="_blank" rel="noreferrer" inherit>
          CC BY-SA 2.0 KR
        </Anchor>
      </Text>
    );
  }

  return (
    <Group gap="sm" wrap="nowrap">
      <Image src={mwLogoLightBg} alt="Merriam-Webster" w={50} h={50} darkHidden />
      <Image src={mwLogoDarkBg} alt="Merriam-Webster" w={50} h={50} lightHidden />
      <Text size="sm" c="dimmed">
        Definitions from Merriam-Webster
      </Text>
    </Group>
  );
}
