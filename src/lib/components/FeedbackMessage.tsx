interface FeedbackMessageProps extends UserMessage {
  className: string
}
export default function FeedbackMessage({ text, isError, className }: FeedbackMessageProps) {
  return <p className={className + " " + (isError ? "text-danger" : "text-success")}>{text}</p>;
}
