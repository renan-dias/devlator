import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
    ["", 1, "weekly"],
    ["/calculadora", 0.9, "monthly"],
    ["/valor-hora", 0.9, "monthly"],
    ["/hospedagem", 0.8, "weekly"],
    ["/chat", 0.6, "monthly"],
    ["/sobre", 0.6, "monthly"],
    ["/privacidade", 0.2, "yearly"],
  ];
  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
