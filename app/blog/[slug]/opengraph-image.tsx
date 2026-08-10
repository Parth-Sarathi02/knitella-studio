import { ImageResponse } from "next/og";
import { OgTemplate } from "@/lib/og/OgTemplate";

export const alt = "Blog Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // const post = await getPost(slug);

  // mock data. remove it once you wire up your data source
  const post = {
    title: "Blog Post Title That Shows the OG Template",
    excerpt:
      "This is a short excerpt from the blog post that gives readers a quick preview of what to expect from the full article.",
    author: "Jane Doe",
    readingTimeMinutes: 5,
    category: "Technology",
    coverImageUrl: undefined,
  };

  return new ImageResponse(
    <OgTemplate
      title={post?.title ?? "Blog"}
      description={post?.excerpt}
      meta={
        post
          ? `${post.author}  ·  ${post.readingTimeMinutes} min read`
          : undefined
      }
      label={post?.category ?? "Blog"}
      variant="blog"
    />,
    { ...size },
  );
}
