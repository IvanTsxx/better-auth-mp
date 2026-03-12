// oxlint-disable-next-line import/no-nodejs-modules
import { readFile } from "node:fs/promises";

import { ImageResponse } from "@takumi-rs/image-response";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

import { getPageImage, source } from "@/lib/source";
import BlogPostTemplate from "@/takumi/takumi-template/src/templates/blog-post-template";

async function getOgImageData(slug: string[], lang: string) {
  const page = source.getPage(slug, lang);
  if (!page) {
    return null;
  }

  const lastModified = page.data.lastModified?.toISOString();
  const avatarPath = `${process.cwd()}/public/avatar.webp`;
  const avatarBuffer = await readFile(avatarPath);
  const avatarBase64 = `data:image/webp;base64,${avatarBuffer.toString("base64")}`;

  return {
    avatarBase64,
    date: lastModified ? new Date(lastModified).toLocaleDateString() : "",
    title: page.data.title,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[]; lang: string }> }
) {
  const { slug, lang } = await params;

  // Handle home page first — source.getPage([], lang) may return null
  // for non-default languages (e.g. "en"), causing notFound() before
  // the isHomePage check was ever reached.
  const isHomePage = slug.length === 0;

  if (isHomePage) {
    console.log("isHomePage", isHomePage);

    const ogImagePath = `${process.cwd()}/public/es/og-image.webp`;
    const ogImageBuffer = await readFile(ogImagePath);
    const ogImageBase64 = `data:image/webp;base64,${ogImageBuffer.toString("base64")}`;
    return new ImageResponse(
      // oxlint-disable-next-line next/no-img-element
      <img
        alt="Ivan Bongiovanni"
        height={630}
        src={ogImageBase64}
        width={1200}
      />,
      {
        format: "webp",
        height: 630,
        width: 1200,
      }
    );
  }

  const data = await getOgImageData(slug.slice(0, -1), lang);

  if (!data) {
    notFound();
  }

  return new ImageResponse(
    <BlogPostTemplate
      author="Ivan Bongiovanni"
      avatar={data.avatarBase64}
      date={data.date}
      title={data.title}
      category="plugin"
    />,
    {
      format: "webp",
      height: 630,
      width: 1200,
    }
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
