interface FeedbackMessageProps extends UserMessage {
  className: string
}
export function FeedbackMessage({ text, isError, className }: FeedbackMessageProps) {
  return <p className={className + " " + (isError ? "text-danger" : "text-success")}>{text}</p>;
}
