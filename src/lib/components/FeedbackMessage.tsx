interface FeedbackMessageProps {
  message: UserMessage;
  className?: string;
}
export default function FeedbackMessage({
  message: { text, isError },
  className,
}: FeedbackMessageProps) {
  return (
    <p className={className + " " + (isError ? "text-danger" : "text-success")}>
      {text}
    </p>
  );
}
