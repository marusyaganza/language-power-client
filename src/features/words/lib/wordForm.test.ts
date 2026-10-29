import { describe, expect, it } from "vitest";
import type { Word } from "../schemas";
import {
  cleanExamples,
  emptyWordForm,
  genderFromFl,
  isOptionalUrl,
  orderDefs,
  partOfSpeechOptions,
  toWordCreate,
  toWordUpdate,
  wordFormValidation,
  wordToFormValues,
  type WordFormValues,
} from "./wordForm";

const word: Word = {
  id: 7,
  uuid: null,
  name: "ballena",
  language: "es",
  stems: [],
  defs: ["whale", "big person"],
  fl: "noun",
  audio_url: null,
  transcription: "ba'ʎena",
  img_url: "https://img/whale.png",
  img_desc: "A blue whale",
  examples: [{ text: "La ballena azul.", translation: null }],
  saved: true,
  offensive: false,
};

describe("orderDefs", () => {
  it("puts the main definition first and keeps the rest in order", () => {
    expect(orderDefs(["a", "b", "c"], 2)).toEqual(["c", "a", "b"]);
  });

  it("trims and drops blank definitions, including a blank main one", () => {
    expect(orderDefs([" a ", "  ", "b"], 1)).toEqual(["a", "b"]);
  });
});

describe("cleanExamples", () => {
  it("trims, drops blank examples and turns empty translations into null", () => {
    expect(
      cleanExamples(
        [
          { text: " Hola ", translation: " Hi " },
          { text: "   ", translation: "ignored" },
          { text: "Adiós", translation: "" },
        ],
        true,
      ),
    ).toEqual([
      { text: "Hola", translation: "Hi" },
      { text: "Adiós", translation: null },
    ]);
  });

  it("drops translations when they're hidden", () => {
    expect(cleanExamples([{ text: "Hello", translation: "stale" }], false)).toEqual([
      { text: "Hello", translation: null },
    ]);
  });
});

describe("toWordCreate", () => {
  it("builds a WordCreate from the form", () => {
    const values: WordFormValues = {
      ...emptyWordForm(),
      name: " gato ",
      fl: "masculine noun",
      defs: ["", "cat", "tomcat"],
      mainDefIndex: 2,
      examples: [{ text: "El gato.", translation: "The cat." }],
      imgUrl: "  ",
    };

    expect(toWordCreate(values, "es")).toEqual({
      uuid: null,
      name: "gato",
      language: "es",
      stems: [],
      fl: "masculine noun",
      transcription: null,
      defs: ["tomcat", "cat"],
      examples: [{ text: "El gato.", translation: "The cat." }],
      audio_url: null,
      img_url: null,
      img_desc: null,
      gender: "masculine",
    });
  });

  it("sends no gender for a part of speech without one", () => {
    expect(toWordCreate({ ...emptyWordForm(), name: "run", fl: "verb", defs: ["move fast"] }, "en").gender).toBeNull();
  });
});

describe("partOfSpeechOptions", () => {
  const values = (language: string) => partOfSpeechOptions(language).map((o) => o.value);

  it("offers gendered nouns in a language with grammatical gender", () => {
    expect(values("es")).toEqual(expect.arrayContaining(["masculine noun", "feminine noun", "masculine or feminine noun"]));
    expect(values("es")).not.toContain("noun");
  });

  it("offers a plain noun otherwise", () => {
    expect(values("en")).toContain("noun");
    expect(values("en")).not.toContain("masculine noun");
  });
});

describe("genderFromFl", () => {
  it("reads the gender from the part of speech", () => {
    expect(genderFromFl("masculine noun")).toBe("masculine");
    expect(genderFromFl("feminine noun")).toBe("feminine");
    expect(genderFromFl("masculine or feminine noun")).toBe("both");
    expect(genderFromFl("noun")).toBeNull();
    expect(genderFromFl("verb")).toBeNull();
  });
});

describe("wordToFormValues / toWordUpdate", () => {
  it("round-trips an unchanged word", () => {
    expect(toWordUpdate(wordToFormValues(word), word.language)).toEqual({
      defs: ["whale", "big person"],
      examples: [{ text: "La ballena azul.", translation: null }],
      audio_url: null,
      img_url: "https://img/whale.png",
      img_desc: "A blue whale",
    });
  });

  it("applies a new main definition", () => {
    const values = { ...wordToFormValues(word), mainDefIndex: 1 };
    expect(toWordUpdate(values, "es").defs).toEqual(["big person", "whale"]);
  });
});

describe("wordFormValidation", () => {
  it("requires name and part of speech only when creating", () => {
    expect(wordFormValidation("create", "es").name("  ")).toBe("Enter the word");
    expect(wordFormValidation("create", "es").fl(null)).toBe("Choose a part of speech");
    expect(wordFormValidation("edit", "es").name("")).toBeNull();
    expect(wordFormValidation("edit", "es").fl(null)).toBeNull();
    expect(wordFormValidation("create", "es").fl("masculine noun")).toBeNull();
    // chosen before switching from Spanish to English
    expect(wordFormValidation("create", "en").fl("masculine noun")).toBe("Choose a part of speech");
  });

  it("requires at least one non-blank definition", () => {
    expect(wordFormValidation("edit", "es").defs(["", "  "])).toBe("Add at least one definition");
    expect(wordFormValidation("edit", "es").defs(["", "ok"])).toBeNull();
  });
});

describe("wordFormValidation limits", () => {
  const create = wordFormValidation("create", "es");
  const edit = wordFormValidation("edit", "es");

  it("limits the word and transcription to 100 characters, in create only", () => {
    expect(create.name("a".repeat(100))).toBeNull();
    expect(create.name("a".repeat(101))).toBe("At most 100 characters");
    expect(create.transcription("a".repeat(101))).toBe("At most 100 characters");
    expect(edit.name("a".repeat(101))).toBeNull();
    expect(edit.transcription("a".repeat(101))).toBeNull();
  });

  it("counts characters like the server, after trimming", () => {
    expect(create.name(`  ${"a".repeat(100)}  `)).toBeNull();
    // 100 emoji are 200 UTF-16 units but 100 characters.
    expect(create.name("😀".repeat(100))).toBeNull();
  });

  it("allows at most 10 definitions of 1,000 characters, ignoring blanks", () => {
    expect(edit.defs([...Array(10).fill("def"), ""])).toBeNull();
    expect(edit.defs(Array(11).fill("def"))).toBe("At most 10 definitions");
    expect(edit.defs(["a".repeat(1000)])).toBeNull();
    expect(edit.defs(["ok", "a".repeat(1001)])).toBe("Each definition can be at most 1,000 characters");
  });

  it("allows at most 50 examples, with text and translation up to 500 characters", () => {
    const example = { text: "ok", translation: "" };
    expect(edit.examples([...Array(50).fill(example), { text: " ", translation: "" }])).toBeNull();
    expect(edit.examples(Array(51).fill(example))).toBe("At most 50 examples");
    expect(edit.examples([{ text: "a".repeat(500), translation: "b".repeat(500) }])).toBeNull();
    const longText = "Each example and translation can be at most 500 characters";
    expect(edit.examples([{ text: "a".repeat(501), translation: "" }])).toBe(longText);
    expect(edit.examples([{ text: "ok", translation: "b".repeat(501) }])).toBe(longText);
  });

  it("limits links to 2,048 characters and the image description to 1,000", () => {
    const url = "https://example.com/";
    expect(edit.imgUrl(url + "a".repeat(2048 - url.length))).toBeNull();
    expect(edit.imgUrl(url + "a".repeat(2049 - url.length))).toBe("At most 2,048 characters");
    expect(edit.audioUrl("ftp://example.com/a.mp3")).toBe("Enter a full link, starting with http:// or https://");
    expect(edit.imgDesc("a".repeat(1000))).toBeNull();
    expect(edit.imgDesc("a".repeat(1001))).toBe("At most 1,000 characters");
  });
});

describe("isOptionalUrl", () => {
  it("accepts blank and http(s) links", () => {
    expect(isOptionalUrl("")).toBe(true);
    expect(isOptionalUrl("  ")).toBe(true);
    expect(isOptionalUrl("https://media.merriam-webster.com/audio/hola.mp3")).toBe(true);
    expect(isOptionalUrl(" http://img.test/cat.png ")).toBe(true);
  });

  it("rejects text, relative paths and other schemes", () => {
    expect(isOptionalUrl("cat.png")).toBe(false);
    expect(isOptionalUrl("www.img.test/cat.png")).toBe(false);
    expect(isOptionalUrl("/images/cat.png")).toBe(false);
    expect(isOptionalUrl("javascript:alert(1)")).toBe(false);
    expect(isOptionalUrl("ftp://files.test/cat.png")).toBe(false);
  });
});
