import { Group, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

interface HelpLabelProps {
  label: string;
  help: string;
}

/** An input label with an info icon that explains the setting on hover or focus. */
export function HelpLabel({ label, help }: HelpLabelProps) {
  return (
    <Group gap={4} wrap="nowrap" component="span">
      {label}
      <Tooltip label={help} multiline w={280} withArrow events={{ hover: true, focus: true, touch: true }}>
        {/* Raised above inline inputs (Switch, Checkbox), whose hidden input covers the whole label. */}
        <IconInfoCircle
          size={15}
          tabIndex={0}
          aria-label={help}
          style={{ cursor: "help", position: "relative", zIndex: 1 }}
        />
      </Tooltip>
    </Group>
  );
}
