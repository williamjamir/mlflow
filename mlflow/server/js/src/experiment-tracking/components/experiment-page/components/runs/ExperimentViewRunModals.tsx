import DeleteRunModal from '../../../modals/DeleteRunModal';
import RestoreRunModal from '../../../modals/RestoreRunModal';

export interface ExperimentViewModalsProps {
  showDeleteRunModal: boolean;
  showRestoreRunModal: boolean;
  runsSelected: any;
  onCloseDeleteRunModal: () => void;
  onCloseRestoreRunModal: () => void;
}

/**
 * A component that contains modals required for the run
 * management, i.e. delete and restore actions.
 */
export const ExperimentViewRunModals = ({
  showDeleteRunModal,
  showRestoreRunModal,
  runsSelected,
  onCloseDeleteRunModal,
  onCloseRestoreRunModal,
}: ExperimentViewModalsProps) => {
  return (
    <>
      <DeleteRunModal
        isOpen={showDeleteRunModal}
        onClose={onCloseDeleteRunModal}
        selectedRunIds={Object.keys(runsSelected)}
      />
      <RestoreRunModal
        isOpen={showRestoreRunModal}
        onClose={onCloseRestoreRunModal}
        selectedRunIds={Object.keys(runsSelected)}
      />
    </>
  );
};
