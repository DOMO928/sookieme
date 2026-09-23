interface Props {
  name: string;
  className?: string;
}
export default function Icon(props: Props) {
  const { name, className = '' } = props;
  return (
    <img
      className={['icon', className].join(' ')}
      src={`/icons/${name}.svg`}
      width="20"
      height="20"
      alt=""
      aria-hidden="true"
    />
  );
}
