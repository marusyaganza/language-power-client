import { Modal } from "@mantine/core";
import { QueryState } from "@/shared/components/QueryState";
import { useGameSettings, useGameSettingsPresets, useUpdateGameSettings } from "../queries";
import { GameSettingsForm } from "./GameSettingsForm";

interface GameSettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

/** Edits the user's spaced-repetition settings. Loads them on open; Cancel or closing discards changes. */
export function GameSettingsModal({ opened, onClose }: GameSettingsModalProps) {
  const settings = useGameSettings(opened);
  const presets = useGameSettingsPresets(opened);
  const update = useUpdateGameSettings();

  return (
    <Modal opened={opened} onClose={onClose} title="Spaced repetition settings">
      <QueryState query={settings} errorTitle="Couldn't load your settings">
        {(current) => (
          <QueryState query={presets} errorTitle="Couldn't load presets">
            {(presetList) => (
              // The modal unmounts its content when closed, so each opening starts from the saved settings.
              <GameSettingsForm
                settings={current}
                presets={presetList}
                isPending={update.isPending}
                onCancel={onClose}
                onSubmit={(values) => update.mutate(values, { onSuccess: onClose })}
              />
            )}
          </QueryState>
        )}
      </QueryState>
    </Modal>
  );
}
