export function FieldError({ messages }: { messages: string[] | undefined }) {
  if (!messages?.length) return null;
  return <p className="text-xs font-medium text-red-700" role="alert">{messages[0]}</p>;
}
