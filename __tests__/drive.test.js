import { describe, expect, it, vi } from "vitest";
import {
  buildDownloadUrl,
  buildViewUrl,
  listChildren,
  toItem,
} from "../sync/drive.js";

describe("url builders", () => {
  it("builds download and view urls", () => {
    expect(buildDownloadUrl("ABC")).toBe("https://drive.google.com/uc?export=download&id=ABC");
    expect(buildViewUrl("ABC")).toBe("https://drive.google.com/file/d/ABC/view");
  });
});

describe("toItem", () => {
  it("maps a raw drive file to an item with classified type and urls", () => {
    const item = toItem(
      {
        id: "ID1",
        name: "Canto.pptx",
        mimeType: "application/octet-stream",
        size: "1024",
        modifiedTime: "2024-05-01T00:00:00Z",
      },
      "OPSO / 2024 / Cantos",
    );

    expect(item).toEqual({
      id: "ID1",
      name: "Canto.pptx",
      path: "OPSO / 2024 / Cantos",
      mimeType: "application/octet-stream",
      type: "presentacion",
      size: 1024,
      modifiedTime: "2024-05-01T00:00:00Z",
      downloadUrl: "https://drive.google.com/uc?export=download&id=ID1",
      viewUrl: "https://drive.google.com/file/d/ID1/view",
    });
  });

  it("defaults size to 0 when absent", () => {
    const item = toItem({ id: "X", name: "a.png", mimeType: "image/png" }, "OPSO");
    expect(item.size).toBe(0);
  });
});

describe("listChildren", () => {
  it("follows pagination and returns all children", async () => {
    const pages = [
      { files: [{ id: "1", name: "a", mimeType: "image/png" }], nextPageToken: "p2" },
      { files: [{ id: "2", name: "b", mimeType: "image/png" }] },
    ];

    let call = 0;
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => pages[call++],
    }));

    const children = await listChildren("FOLDER", { apiKey: "K", fetchImpl });

    expect(children.map((child) => child.id)).toEqual(["1", "2"]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("retries on a transient failure then succeeds", async () => {
    let call = 0;
    const fetchImpl = vi.fn(async () => {
      call += 1;

      if (call === 1) {
        return {
          ok: false,
          status: 503,
          json: async () => ({}),
        };
      }

      return {
        ok: true,
        json: async () => ({
          files: [{ id: "1", name: "a", mimeType: "image/png" }],
        }),
      };
    });

    const children = await listChildren("F", {
      apiKey: "K",
      fetchImpl,
      baseDelayMs: 0,
    });

    expect(children.map((child) => child.id)).toEqual(["1"]);
    expect(call).toBe(2);
  });
});
