import type { Farm, Task } from "../types";
import { Icon } from "../components/Icon";
export function Preparedness({
  farm,
  tasks,
  pending,
  onToggle,
}: {
  farm: Farm;
  tasks: Task[];
  pending: string;
  onToggle: (task: Task) => void;
}) {
  const completed = tasks.filter((task) => task.completed).length;
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A PLAN FOR THIS FARM</span>
          <h2>One action at a time</h2>
          <p className="muted">
            {farm.farmerName} · {farm.village}
          </p>
        </div>
        <span className="tag neutral">
          {completed} of {tasks.length} recorded
        </span>
      </div>
      <progress
        max={tasks.length || 1}
        value={completed}
        aria-label="Preparedness actions completed"
      />
      <p className="plan-disclaimer">
        Illustrative checklist for testing. Requires local expert approval
        before field use; completion is not a safety or risk score.
      </p>
      <div className="task-list">
        {tasks.map((task, index) => (
          <article
            key={task.id}
            className={`task ${task.completed ? "complete" : ""}`}
          >
            <button
              className="task-check"
              aria-label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`}
              aria-pressed={task.completed}
              disabled={!!pending}
              onClick={() => onToggle(task)}
            >
              {task.completed ? (
                <Icon name="check" />
              ) : (
                <span>{index + 1}</span>
              )}
            </button>
            <div>
              <h3>{task.title}</h3>
              <p>{task.detail}</p>
              <span className="task-status">
                {pending === task.id
                  ? "Saving..."
                  : task.completed
                    ? "Completion recorded"
                    : "Discuss with your field agent"}
              </span>
            </div>
          </article>
        ))}
      </div>
      {!tasks.length && <p>No actions are saved for this farm.</p>}
    </section>
  );
}
