import { Project } from "@/lib/types";
import { styles } from "./styles";

export default function ProjectDetail({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  return (
    <div className={styles.projectDetail.wrap}>
      <div className={styles.projectDetail.inner}>
        <div onClick={onBack} className={styles.projectDetail.backLink}>
          ← All projects
        </div>
        <div className={styles.projectDetail.title}>{project.name}</div>
        {project.instructions_md && (
          <div className={styles.projectDetail.description}>{project.instructions_md}</div>
        )}
        <div className={styles.projectDetail.placeholderWrap}>No chats in this project yet.</div>
      </div>
    </div>
  );
}
