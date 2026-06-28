import { describe, expect, it } from "vitest";
import { classify, FOLDER_MIME, typeFromKeyword } from "../sync/classify.js";

describe("classify", () => {
  it("detects presentations by mimeType and extension", () => {
    expect(classify("application/vnd.google-apps.presentation", "x")).toBe("presentacion");
    expect(classify("application/octet-stream", "Canto.pptx")).toBe("presentacion");
  });

  it("detects pdf, image, audio, video, document", () => {
    expect(classify("application/pdf", "a.pdf")).toBe("pdf");
    expect(classify("image/png", "logo.png")).toBe("imagen");
    expect(classify("audio/mpeg", "himno.mp3")).toBe("audio");
    expect(classify("video/mp4", "clip.mp4")).toBe("video");
    expect(classify("application/msword", "acta.doc")).toBe("documento");
  });

  it("falls back to otro for unknown", () => {
    expect(classify("application/zip", "x.zip")).toBe("otro");
  });

  it("exposes the folder mime constant", () => {
    expect(FOLDER_MIME).toBe("application/vnd.google-apps.folder");
  });
});

describe("typeFromKeyword", () => {
  it("maps synonyms to categories", () => {
    expect(typeFromKeyword("ppt")).toBe("presentacion");
    expect(typeFromKeyword("pptx")).toBe("presentacion");
    expect(typeFromKeyword("presentacion")).toBe("presentacion");
    expect(typeFromKeyword("logo")).toBe("imagen");
    expect(typeFromKeyword("imagen")).toBe("imagen");
    expect(typeFromKeyword("audio")).toBe("audio");
    expect(typeFromKeyword("pdf")).toBe("pdf");
  });

  it("returns null for non-type words", () => {
    expect(typeFromKeyword("canto")).toBeNull();
  });
});
