import { getStatusClass } from '../../utils/formatters';

export default function StatusBadge({ status }) {
  return (
    <span className={getStatusClass(status)}>
      {status}
    </span>
  );
}
