interface VideoEmbedProps {
  src: string;
  title: string;
  duration?: string;
}

export function VideoEmbed({ src, title, duration }: VideoEmbedProps) {
  return (
    <figure className="my-6">
      <video
        src={src}
        controls
        className="w-full rounded-lg max-w-full"
      />
      <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        <strong>{title}</strong>
        {duration && <span className="ml-2">({duration})</span>}
      </figcaption>
    </figure>
  );
}
