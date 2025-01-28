export function FeedbackMessage({ text, isError }: UserMessage) {
  return <p className={isError ? "text-danger" : "text-success"}>{text}</p>;
}
