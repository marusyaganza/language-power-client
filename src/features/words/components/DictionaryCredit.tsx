import { Badge, Group, Image, Text } from "@mantine/core";
import { IconFlask } from "@tabler/icons-react";
import { useAuthConfig } from "@/features/auth";
import mwLogoDarkBg from "@/assets/merriam-webster/mw-logo-dark-bg.png";
import mwLogoLightBg from "@/assets/merriam-webster/mw-logo-light-bg.png";

/**
 * Where search results come from. Merriam-Webster's API terms require their logo in every app that uses
 * it: unmodified, at 50, 100 or 125 px, with the ® visible. Each theme gets the version made for its
 * background. In local mock mode the results are made up, so they get a label instead.
 */
export function DictionaryCredit() {
  const { data: config } = useAuthConfig();
  if (!config) return null;

  if (config.use_mocks) {
    return (
      <Badge variant="outline" color="olive" leftSection={<IconFlask size={12} />}>
        Mock dictionary
      </Badge>
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
