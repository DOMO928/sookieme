interface Props {
  type: string;
  caption: string;
}
const flows: Record<string, { title: string; detail: string }[]> = {
  stroke: [
    { title: 'Stroke input', detail: 'width · alignment · paint' },
    { title: 'Shared plan', detail: 'One interpretation' },
    { title: 'Bounds · Paint · Geometry', detail: 'Shared stroke interpretation' },
  ],
  instances: [
    { title: 'Geometry + material', detail: 'Shared mesh' },
    { title: 'Transform + UV', detail: 'Per instance' },
    { title: 'Instanced cards', detail: 'Shared geometry · individual appearance' },
  ],
  codec: [
    { title: 'FK animation', detail: 'Dense motion' },
    { title: 'IK targets', detail: 'Sparse keys' },
    { title: 'Reconstruction', detail: 'Concept study' },
  ],
};
export default function CompactDiagram({ type, caption }: Props) {
  if (type === 'graph')
    return (
      <div className="diagram-mobile" role="img" aria-label={caption}>
        <svg viewBox="0 0 300 370" aria-hidden="true">
          <g fill="none" stroke="#8692a2" strokeWidth="1">
            <path d="M150 30H72V80M72 128V183M120 104H180M222 128V183M120 207H180M270 104H288V292H150M222 231V292H150" />
            <path d="M72 342H222" stroke="#d7d0bb" strokeWidth="2" />
          </g>
          <g fill="#13171d" stroke="#9ca8b8">
            <circle cx="150" cy="30" r="5" />
            <rect x="24" y="80" width="96" height="48" rx="3" />
            <rect x="24" y="183" width="96" height="48" rx="3" />
            <rect x="180" y="80" width="90" height="48" rx="3" />
            <rect x="180" y="183" width="90" height="48" rx="3" />
            <circle cx="150" cy="292" r="5" />
          </g>
          <g fill="#d8dee7" fontSize="14" textAnchor="middle" fontFamily="Inter, sans-serif">
            <text x="150" y="15">
              Scene
            </text>
            <text x="72" y="109">
              Pass A
            </text>
            <text x="72" y="212">
              Pass B
            </text>
            <text x="225" y="109">
              Pass C
            </text>
            <text x="225" y="212">
              Pass D
            </text>
            <text x="150" y="317">
              Submit
            </text>
            <text x="150" y="363" fontSize="11" fill="#9ca7b6">
              Temporary texture lifetime
            </text>
          </g>
        </svg>
      </div>
    );
  const steps = flows[type];
  if (!steps) return null;
  return (
    <div className={`diagram-mobile diagram-mobile-${type}`} role="img" aria-label={caption}>
      {steps.map(({ title, detail }, i) => (
        <div className="diagram-step" key={title}>
          <span className="diagram-step-number" aria-hidden="true">
            0{i + 1}
          </span>
          <div>
            <strong>{title}</strong>
            <small>{detail}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
