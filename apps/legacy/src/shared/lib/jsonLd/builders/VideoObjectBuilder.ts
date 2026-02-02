import type { VideoObject } from "schema-dts";
import { JsonLdBuilder } from "./JsonLdBuilder";

export class VideoObjectBuilder extends JsonLdBuilder<VideoObject> {
  protected setType(): void {
    this.data["@type"] = "VideoObject";
  }

  setContentUrl(contentUrl: string): this {
    this.data.contentUrl = contentUrl;
    return this;
  }

  setEmbedUrl(embedUrl: string): this {
    this.data.embedUrl = embedUrl;
    return this;
  }

  setThumbnailUrl(thumbnailUrl: string): this {
    this.data.thumbnailUrl = thumbnailUrl;
    return this;
  }

  setUploadDate(uploadDate: string | Date): this {
    if (!uploadDate) return this;
    this.data.uploadDate =
      uploadDate instanceof Date ? uploadDate.toISOString().split("T")[0] : uploadDate;
    return this;
  }

  setDuration(duration: string): this {
    this.data.duration = duration;
    return this;
  }

  setInLanguage(inLanguage: string): this {
    this.data.inLanguage = inLanguage;
    return this;
  }

  setAuthor(author: string): this {
    this.data.author = author;
    return this;
  }

  setPublisher(type: "Organization" | "Person", publisher: string): this {
    this.data.publisher = { "@type": type, name: publisher };
    return this;
  }
}
