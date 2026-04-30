type Props = {
  advice: string;
};

export default function AdviceBox({ advice }: Props) {
  return (
    <div className="bg-blue-500/20 p-4 rounded-xl text-white">
      <p>{advice}</p>
    </div>
  );
}