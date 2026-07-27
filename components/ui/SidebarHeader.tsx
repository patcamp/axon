import { CloseIcon } from "./icons";
import { styles } from "./styles";

export default function SidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.sidebar.header}>
      <div className={styles.sidebar.headerLeft}>
        <span className={styles.sidebar.headerDot} />
        <h1 className={styles.sidebar.headerTitle}>Axon</h1>
      </div>
      <button onClick={onClose} className={styles.sidebar.mobileCloseButton}>
        <CloseIcon />
      </button>
    </div>
  );
}
