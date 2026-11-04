import { test, expect } from "@playwright/test";
import { projectLink } from "../src/lib/projectLink";

test("projectLink: only real websites get a View Project button", () => {
  expect(projectLink("https://morphllm.com")).toBe("https://morphllm.com");
  expect(projectLink("./morphllm.com")).toBe("https://morphllm.com");
  expect(projectLink("morphllm.com")).toBe("https://morphllm.com");
  expect(projectLink("www.stance.xyz/about")).toBe("https://www.stance.xyz/about");
  for (const dead of ["./works/stance", "/works/sass", "#", "", "  ", "javascript:alert(1)", "not a link"]) {
    expect(projectLink(dead), dead).toBeNull();
  }
});
